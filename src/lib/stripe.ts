import { loadStripe, type Stripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!publishableKey) {
      throw new Error("VITE_STRIPE_PUBLISHABLE_KEY is not set");
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

/** New-signup price ID for the public Contractor Circle Membership. */
export const NEW_SIGNUP_PRICE_ID = import.meta.env.VITE_STRIPE_NEW_PRICE_ID ?? "";
