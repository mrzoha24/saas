// social.js — Facebook Page + Instagram connection (manual token entry, dev-mode workflow)

import { auth, db, signOut, onAuthStateChanged, doc, setDoc, getDoc } from "./firebase-config.js";

let uid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "index.html"; return; }
  uid = user.uid;
  await loadSocial();
});

document.getElementById("logout-link").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

async function loadSocial() {
  const snap = await getDoc(doc(db, "pubOwners", uid));
  if (!snap.exists()) return;
  const data = snap.data();
  const social = data.social || {};

  if (social.fbPageId) {
    document.getElementById("fb-page-id").value = social.fbPageId;
    document.getElementById("fb-status").textContent = `Connected — Page ID ${social.fbPageId}`;
  }
  if (social.fbPageToken) {
    document.getElementById("fb-page-token").value = social.fbPageToken;
  }
  if (social.igAccountId) {
    document.getElementById("ig-account-id").value = social.igAccountId;
    document.getElementById("ig-status").textContent = `Connected — Account ID ${social.igAccountId}`;
  }
}

document.getElementById("save-fb").addEventListener("click", async () => {
  const fbPageId = document.getElementById("fb-page-id").value.trim();
  const fbPageToken = document.getElementById("fb-page-token").value.trim();
  if (!fbPageId || !fbPageToken) {
    alert("Please fill in both the Page ID and access token.");
    return;
  }
  await setDoc(doc(db, "pubOwners", uid), { social: { fbPageId, fbPageToken } }, { merge: true });
  document.getElementById("fb-status").textContent = `Connected — Page ID ${fbPageId}`;
});

document.getElementById("save-ig").addEventListener("click", async () => {
  const igAccountId = document.getElementById("ig-account-id").value.trim();
  if (!igAccountId) {
    alert("Please enter the Instagram Business Account ID.");
    return;
  }
  await setDoc(doc(db, "pubOwners", uid), { social: { igAccountId } }, { merge: true });
  document.getElementById("ig-status").textContent = `Connected — Account ID ${igAccountId}`;
});
