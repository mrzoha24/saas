// dashboard.js — dashboard shell: auth guard, event submission, event history

import {
  auth,
  db,
  storage,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
} from "./firebase-config.js";

// TODO: replace with your real n8n production webhook URL once the workflow is live.
// This is the ONLY line that needs to change to point the dashboard at n8n.
const N8N_EVENT_WEBHOOK_URL = "https://YOUR-N8N-INSTANCE/webhook/pub-event";

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  await loadPubProfile(user.uid);
  listenForEvents(user.uid);
});

document.getElementById("logout-link").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

async function loadPubProfile(uid) {
  const snap = await getDoc(doc(db, "pubOwners", uid));
  if (!snap.exists()) return;
  const data = snap.data();
  document.getElementById("pub-name-display").textContent = data.pubName || "Your pub";

  // Billing status badge — this reflects whatever billing.js / the webhook
  // sets on this document once Lemon Squeezy (or Stripe) is wired up.
  const badge = document.getElementById("plan-badge");
  if (data.subscriptionStatus === "active") {
    badge.textContent = data.plan === "pro" ? "PUB AI PRO — Active" : "PUB AI — Active";
    badge.className = "badge active";
  } else {
    badge.textContent = "No active plan";
    badge.className = "badge inactive";
  }
}

// ---------- Event submission ----------

const eventForm = document.getElementById("event-form");
const photoInput = document.getElementById("photo-input");
const fileDrop = document.getElementById("file-drop");
const submitBtn = document.getElementById("event-submit");

fileDrop.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", () => {
  if (photoInput.files.length) {
    fileDrop.textContent = `📎 ${photoInput.files[0].name}`;
    fileDrop.classList.add("has-file");
  }
});

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("event-text").value.trim();
  if (!text) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    // 1. If a photo was attached, upload it to Storage first so we have a URL.
    let photoUrl = null;
    if (photoInput.files.length) {
      const file = photoInput.files[0];
      const fileRef = ref(storage, `events/${currentUser.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      photoUrl = await getDownloadURL(fileRef);
    }

    // 2. Save the event in Firestore so the dashboard has a record of it.
    const eventRef = await addDoc(collection(db, "events"), {
      uid: currentUser.uid,
      text,
      photoUrl,
      status: "queued", // queued -> processing -> posted -> failed
      createdAt: serverTimestamp(),
    });

    // 3. Trigger the n8n automation. NOTE: this fetch will fail until
    // N8N_EVENT_WEBHOOK_URL above points at a real, live n8n webhook —
    // that's expected while the automation nodes are still being fixed.
    try {
      await fetch(N8N_EVENT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventRef.id,
          uid: currentUser.uid,
          text,
          photoUrl,
        }),
      });
    } catch (webhookErr) {
      console.warn("n8n webhook not reachable yet:", webhookErr);
      // Don't block the UI on this — the event is saved either way and
      // can be re-triggered manually once the webhook URL is real.
    }

    document.getElementById("event-text").value = "";
    photoInput.value = "";
    fileDrop.textContent = "Click to attach a photo (optional)";
    fileDrop.classList.remove("has-file");
  } catch (err) {
    alert("Couldn't save that event — please try again.");
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send to PUB AI";
  }
});

// ---------- Event history ----------

function listenForEvents(uid) {
  const q = query(
    collection(db, "events"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  onSnapshot(q, (snap) => {
    const list = document.getElementById("event-list");
    list.innerHTML = "";
    if (snap.empty) {
      list.innerHTML = '<p style="color:var(--text-dim); font-size:14px;">No events yet — submit your first one above.</p>';
      return;
    }
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const row = document.createElement("div");
      row.className = "event-row";
      row.innerHTML = `
        <span>${escapeHtml(d.text).slice(0, 60)}${d.text.length > 60 ? "…" : ""}</span>
        <span class="event-status">${d.status || "queued"}</span>
      `;
      list.appendChild(row);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
