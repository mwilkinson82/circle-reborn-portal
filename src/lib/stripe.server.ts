import Stripe from "stripe";

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

export type StripeEnv = "sandbox" | "live";

const GATEWAY_STRIPE_BASE = "https://connector-gateway.lovable.dev/stripe";

export function getConnectionApiKey(env: StripeEnv): string {
  return env === "sandbox" ? getEnv("STRIPE_SANDBOX_API_KEY") : getEnv("STRIPE_LIVE_API_KEY");
}

export function createStripeClient(env: StripeEnv): Stripe {
  const connectionApiKey = getConnectionApiKey(env);
  const lovableApiKey = getEnv("LOVABLE_API_KEY");

  return new Stripe(connectionApiKey, {
    apiVersion: "2026-03-25.dahlia",
    httpClient: Stripe.createFetchHttpClient((url: string | URL, init?: RequestInit) => {
      const gatewayUrl = url.toString().replace("https://api.stripe.com", GATEWAY_STRIPE_BASE);
      return fetch(gatewayUrl, {
        ...init,
        headers: {
          ...Object.fromEntries(new Headers(init?.headers).entries()),
          "X-Connection-Api-Key": connectionApiKey,
          "Lovable-API-Key": lovableApiKey,
        },
      });
    }),
  });
}

export function getWebhookSecret(env: StripeEnv): string {
  return env === "sandbox" ? getEnv("PAYMENTS_SANDBOX_WEBHOOK_SECRET") : getEnv("PAYMENTS_LIVE_WEBHOOK_SECRET");
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
