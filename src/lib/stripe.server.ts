import Stripe from "stripe";

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

export type StripeEnv = "sandbox" | "live";

function getStripeSecretKey(env: StripeEnv): string {
  return env === "sandbox" ? getEnv("STRIPE_SANDBOX_API_KEY") : getEnv("STRIPE_LIVE_API_KEY");
}

export function createStripeClient(env: StripeEnv): Stripe {
  return new Stripe(getStripeSecretKey(env), {
    apiVersion: "2026-03-25.dahlia",
  });
}

export function getWebhookSecret(env: StripeEnv): string {
  return env === "sandbox"
    ? getEnv("PAYMENTS_SANDBOX_WEBHOOK_SECRET")
    : getEnv("PAYMENTS_LIVE_WEBHOOK_SECRET");
}

/**
 * Stripe price IDs grandfathered for the original 18 Contractor Circle members.
 * These rotate-in via backfill; new signups use STRIPE_NEW_PRICE_ID.
 */
export const GRANDFATHERED_PRICE_IDS = [
  "price_1TDR3aJdDAUSVXbNZOY6EXF3",
  "price_1TDR3aJdDAUSVXbNWVzFLblo",
  "price_1TC5NlJdDAUSVXbNPThxV7uS",
];

export function isGrandfatheredPrice(priceId: string | null | undefined): boolean {
  return !!priceId && GRANDFATHERED_PRICE_IDS.includes(priceId);
}
