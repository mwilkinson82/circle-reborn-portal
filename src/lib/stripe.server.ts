import Stripe from "stripe";

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

let _stripe: Stripe | null = null;

export function createStripeClient(): Stripe {
  if (_stripe) return _stripe;
  _stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-03-25.dahlia",
  });
  return _stripe;
}

export function getWebhookSecret(): string {
  return getEnv("STRIPE_WEBHOOK_SECRET");
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
