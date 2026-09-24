// billing-page.js — billing.html logic

import { auth, db, signOut, onAuthStateChanged, doc, getDoc } from "./firebase-config.js";
import { startCheckout } from "./billing.js";

let uid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "index.html"; return; }
  uid = user.uid;
  await loadPlanStatus();
});

document.getElementById("logout-link").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

async function loadPlanStatus() {
  const snap = await getDoc(doc(db, "pubOwners", uid));
  if (!snap.exists()) return;
  const data = snap.data();
  const badge = document.getElementById("plan-badge");
  if (data.subscriptionStatus === "active") {
    badge.textContent = data.plan === "pro" ? "PUB AI PRO — Active" : "PUB AI — Active";
    badge.className = "badge active";
  } else {
    badge.textContent = "No active plan";
    badge.className = "badge inactive";
  }
}

document.querySelectorAll("[data-plan]").forEach((btn) => {
  btn.addEventListener("click", () => {
    // This calls the placeholder in billing.js — shows an alert until
    // the Lemon Squeezy store ID / variant IDs are filled in there.
    startCheckout(uid, btn.dataset.plan);
  });
});
