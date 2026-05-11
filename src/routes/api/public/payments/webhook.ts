import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";
import { createStripeClient, getWebhookSecret, type StripeEnv } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function upsertSubscription(sub: Stripe.Subscription, env: StripeEnv) {
  const stripe = createStripeClient(env);
  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? null;
  const productId = typeof item?.price?.product === "string" ? item.price.product : null;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const periodEndUnix = item?.current_period_end ?? null;
  const periodEndIso = periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null;

  // Resolve userId: prefer subscription metadata, then customer metadata, then pending_claims by email
  let userId = (sub.metadata?.userId as string | undefined) ?? undefined;
  let customerEmail: string | null = null;

  if (!userId || !customerEmail) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted) {
        userId = userId ?? (customer.metadata?.userId as string | undefined) ?? undefined;
        customerEmail = customer.email ?? null;
      }
    } catch (e) {
      console.error("Failed to retrieve customer", e);
    }
  }

  // If still no user, try to match a registered user by email
  if (!userId && customerEmail) {
    const { data: matched } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const user = matched?.users.find(
      (u) => u.email?.toLowerCase() === customerEmail!.toLowerCase(),
    );
    if (user) userId = user.id;
  }

  // Always upsert into subscriptions, even without a user (so backfill works)
  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId ?? null,
      environment: "live",
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      price_id: priceId,
      product_id: productId,
      status: sub.status,
      current_period_end: periodEndIso,
      cancel_at_period_end: sub.cancel_at_period_end,
      metadata: (sub.metadata ?? {}) as Record<string, string>,
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (error) console.error("subscriptions upsert error", error);

  // If unclaimed, also write/update a pending_claims row so the member can self-claim
  if (!userId && customerEmail) {
    await supabaseAdmin.from("pending_claims").upsert(
      {
        email: customerEmail,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        price_id: priceId ?? "",
        status: sub.status,
        current_period_end: periodEndIso,
      },
      { onConflict: "stripe_subscription_id" },
    );
    return;
  }

  if (!userId) {
    console.warn("Subscription has no userId and no email match; left unlinked", sub.id);
    return;
  }

  // Mirror to members table
  const status =
    sub.status === "active" || sub.status === "trialing"
      ? "active"
      : sub.status === "past_due"
        ? "past_due"
        : sub.status === "canceled" ||
            sub.status === "incomplete_expired" ||
            sub.status === "unpaid"
          ? "canceled"
          : "trialing";

  await supabaseAdmin
    .from("members")
    .update({
      status,
      plan: priceId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      current_period_end: periodEndIso,
    })
    .eq("user_id", userId);
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing signature", { status: 400 });

        const payload = await request.text();
        const env = new URL(request.url).searchParams.get("env") === "sandbox" ? "sandbox" : "live";
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
                const subId =
                  typeof session.subscription === "string"
                    ? session.subscription
                    : session.subscription.id;
                const sub = await stripe.subscriptions.retrieve(subId);
                await upsertSubscription(sub, env);
              }
              break;
            }
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
              await upsertSubscription(event.data.object as Stripe.Subscription, env);
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
