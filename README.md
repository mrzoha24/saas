# PUB AI — Dashboard

Plain HTML/JS + Firebase (Auth + Firestore). No build step — matches the
"use a `<script>` tag" setup you already have in Firebase.

## Structure

```
public/
  index.html        # login / signup
  dashboard.html     # dashboard shell + event input UI
  css/app.css        # shared styles
  js/
    firebase-config.js  # Firebase init (already has your saas-c405c keys)
    auth.js              # login/signup logic
    dashboard.js          # event submission + event history + n8n webhook call
    billing.js            # PLACEHOLDER — fill in once Lemon Squeezy bank setup is done
firestore.rules       # security rules — deploy these before going live
```

## To run locally
Just open `public/index.html` in a browser, or serve the `public/` folder
with any static server (`npx serve public`). Firebase Hosting will also
serve this folder directly once you connect the project.

## What's already working
- Signup creates a Firebase Auth user + a `pubOwners/{uid}` Firestore doc
- Login/logout
- Dashboard reads the pub's name + plan status from Firestore
- Event form saves to Firestore (`events` collection) and attempts to
  POST to your n8n webhook

## What's still a placeholder (on purpose)
1. **`N8N_EVENT_WEBHOOK_URL`** in `dashboard.js` — currently a fake URL.
   Swap in your real n8n production webhook once the Claude+Higgsfield
   nodes are fixed and the workflow is active.
2. **`billing.js`** — Lemon Squeezy Store ID + variant IDs are empty.
   Fill these in once bank setup is approved (see comments in the file
   for exactly what to fill in and where).
3. **Photo upload** — the file input in the dashboard currently just
   shows the filename; it doesn't upload anywhere yet. Needs Firebase
   Storage enabled + a bucket rule, then a few lines in `dashboard.js`.
4. **Deploy `firestore.rules`** — run `firebase deploy --only firestore:rules`
   once the Firebase CLI is set up, so pub owners can't read each other's
   data.

## Next once you're ready
- Google Business Profile API (needs your Gmail — already in progress)
- Fix the 3 n8n nodes (JSON syntax + key rotation)
- Wire up billing.js once Lemon Squeezy approves the bank account
