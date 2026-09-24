// billing.js — PLACEHOLDER. Not wired into any page yet.
//
// Fill this in once Lemon Squeezy bank details are approved and you have
// a real Store ID + API key. Nothing else in the app needs to change —
// dashboard.js already reads `plan` and `subscriptionStatus` off the
// pubOwners/{uid} document, this file's only job is to keep that
// document in sync with Lemon Squeezy.

// TODO: fill in once the Lemon Squeezy store is approved
const LEMON_SQUEEZY_STORE_ID = "";
const LEMON_SQUEEZY_STANDARD_VARIANT_ID = ""; // the €99/month plan
const LEMON_SQUEEZY_PRO_VARIANT_ID = "";      // the €159/month plan

/**
 * Redirects the pub owner to a Lemon Squeezy Checkout for the given plan.
 * Call this from a "Start free trial" / "Upgrade" button once the IDs above
 * are filled in. Pass the Firebase uid as custom data so the webhook (below)
 * knows which pubOwners doc to update.
 */
export function startCheckout(uid, variant = "standard") {
  if (!LEMON_SQUEEZY_STORE_ID) {
    alert("Billing isn't set up yet — this is a placeholder until Lemon Squeezy bank setup is done.");
    return;
  }
  const variantId =
    variant === "pro" ? LEMON_SQUEEZY_PRO_VARIANT_ID : LEMON_SQUEEZY_STANDARD_VARIANT_ID;

  const checkoutUrl =
    `https://${LEMON_SQUEEZY_STORE_ID}.lemonsqueezy.com/checkout/buy/${variantId}` +
    `?checkout[custom][uid]=${encodeURIComponent(uid)}`;

  window.location.href = checkoutUrl;
}

// NOTE — this part does NOT belong in client-side code:
// Lemon Squeezy sends a `subscription_created` / `subscription_updated`
// webhook to a server endpoint when payment succeeds. That endpoint needs
// to live in a Firebase Cloud Function (not in this file), verify the
// webhook signature, then update:
//
//   pubOwners/{uid}.plan = "standard" | "pro"
//   pubOwners/{uid}.subscriptionStatus = "active" | "cancelled" | "past_due"
//
// This is the piece to build once the Lemon Squeezy API key is available —
// ask for it then and it can be scaffolded as a Cloud Function.
