// auth.js — handles signup/login on index.html

import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  doc,
  setDoc,
  serverTimestamp,
} from "./firebase-config.js";

const form = document.getElementById("auth-form");
const modeToggle = document.getElementById("mode-toggle");
const errorBox = document.getElementById("auth-error");
const submitBtn = document.getElementById("auth-submit");
const pubNameField = document.getElementById("pub-name-field");

let mode = "login"; // or "signup"

// If already logged in, skip straight to dashboard
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "dashboard.html";
});

modeToggle.addEventListener("click", (e) => {
  e.preventDefault();
  mode = mode === "login" ? "signup" : "login";
  submitBtn.textContent = mode === "login" ? "Log in" : "Create account";
  modeToggle.textContent =
    mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in";
  pubNameField.style.display = mode === "signup" ? "block" : "none";
  errorBox.textContent = "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Please wait...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const pubName = document.getElementById("pub-name").value.trim();

  try {
    if (mode === "signup") {
      if (!pubName) throw new Error("Please enter your pub's name.");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create the pub owner's profile document — this is what the dashboard
      // and, later, the billing/subscription status will read from.
      await setDoc(doc(db, "pubOwners", cred.user.uid), {
        pubName,
        email,
        plan: "none", // "none" | "standard" | "pro" — set once billing is wired up
        subscriptionStatus: "inactive", // placeholder until Lemon Squeezy/Stripe is connected
        createdAt: serverTimestamp(),
      });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    window.location.href = "dashboard.html";
  } catch (err) {
    errorBox.textContent = humanizeError(err.code || err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = mode === "login" ? "Log in" : "Create account";
  }
});

function humanizeError(code) {
  const map = {
    "auth/email-already-in-use": "That email is already registered — try logging in instead.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
