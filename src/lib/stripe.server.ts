import Stripe from "stripe";
import { GRANDFATHERED_PRICE_IDS } from "@/lib/membership-price-ids";

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
 * Legacy Stripe price IDs for existing Contractor Circle subscriptions.
 * These rotate in via backfill; new signups use STRIPE_NEW_PRICE_ID.
 */
export function isGrandfatheredPrice(priceId: string | null | undefined): boolean {
  return !!priceId && GRANDFATHERED_PRICE_IDS.includes(priceId);
}
