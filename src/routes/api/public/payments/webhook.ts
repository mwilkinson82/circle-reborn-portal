import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";
import { type StripeEnv, createStripeClient, getWebhookSecret } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function parseEnv(value: string | null): StripeEnv {
  return value === "live" ? "live" : "sandbox";
}

async function resolvePriceLookupKey(stripe: Stripe, priceId: string | null): Promise<string | null> {
  if (!priceId) return null;
  try {
    const price = await stripe.prices.retrieve(priceId);
    return price.lookup_key ?? price.id;
  } catch {
    return priceId;
  }
}

async function upsertSubscription(env: StripeEnv, sub: Stripe.Subscription) {
  const stripe = createStripeClient(env);
  const item = sub.items.data[0];
  const priceLookupKey = await resolvePriceLookupKey(stripe, item?.price?.id ?? null);

  // userId resolution: prefer subscription metadata, fall back to customer metadata
  let userId = sub.metadata?.userId as string | undefined;
  if (!userId && typeof sub.customer === "string") {
    try {
      const customer = await stripe.customers.retrieve(sub.customer);
      if (customer && !customer.deleted) {
        userId = (customer.metadata?.userId as string | undefined) ?? undefined;
      }
    } catch (e) {
      console.error("Failed to retrieve customer for userId", e);
    }
  }
  if (!userId) {
    console.warn("Subscription has no userId metadata, skipping", sub.id);
    return;
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const periodEndUnix = item?.current_period_end ?? null;

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        environment: env,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        price_id: priceLookupKey,
        product_id: typeof item?.price?.product === "string" ? item.price.product : null,
        status: sub.status,
        current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
        metadata: (sub.metadata ?? {}) as Record<string, string>,
      },
      { onConflict: "stripe_subscription_id,environment" },
    );

  if (error) console.error("subscriptions upsert error", error);

  // Mirror to the existing members table so the portal dashboard reflects status
  const status =
    sub.status === "active" || sub.status === "trialing"
      ? "active"
      : sub.status === "past_due"
        ? "past_due"
        : sub.status === "canceled" || sub.status === "incomplete_expired" || sub.status === "unpaid"
          ? "canceled"
          : "trialing";

  await supabaseAdmin
    .from("members")
    .update({
      status,
      plan: priceLookupKey,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
    })
    .eq("user_id", userId);
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = parseEnv(url.searchParams.get("env"));
        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing signature", { status: 400 });

        const payload = await request.text();
        const stripe = createStripeClient(env);

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(
            payload,
            signature,
            getWebhookSecret(env),
          );
        } catch (err) {
          console.error("Webhook signature verification failed", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as Stripe.Checkout.Session;
              if (session.mode === "subscription" && session.subscription) {
                const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
                const sub = await stripe.subscriptions.retrieve(subId);
                await upsertSubscription(env, sub);
              }
              break;
            }
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
              await upsertSubscription(env, event.data.object as Stripe.Subscription);
              break;
            }
            default:
              break;
          }
        } catch (err) {
          console.error(`Error handling ${event.type}`, err);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
