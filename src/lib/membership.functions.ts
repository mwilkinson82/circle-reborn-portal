import { createServerFn } from "@tanstack/react-start";
import { createStripeClient } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuthHeader } from "@/lib/auth-client-middleware";

/**
 * Admin-only: list every active/past_due/trialing subscription in the connected
 * Stripe account and write them into `subscriptions` + `pending_claims`.
 * Idempotent — safe to re-run.
 */
export const backfillExistingSubscriptions = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // Verify admin role
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!roles?.some((r) => r.role === "admin")) {
      throw new Error("Admin access required");
    }

    const stripe = createStripeClient("live");
    let imported = 0;
    let unclaimed = 0;
    let claimed = 0;
    let cursor: string | undefined = undefined;

    while (true) {
      const page: any = await stripe.subscriptions.list({
        status: "all",
        limit: 100,
        ...(cursor && { starting_after: cursor }),
        expand: ["data.customer"],
      });

      for (const sub of page.data as any[]) {
        if (!["active", "trialing", "past_due"].includes(sub.status)) continue;

        const item = sub.items.data[0];
        const priceId = item?.price?.id ?? null;
        const productId = typeof item?.price?.product === "string" ? item.price.product : null;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const customer = typeof sub.customer === "object" && !sub.customer.deleted ? sub.customer : null;
        const customerEmail: string | null = customer?.email ?? null;
        const periodEndUnix = item?.current_period_end ?? null;
        const periodEndIso = periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null;

        // Try to match an existing user by email
        let matchedUserId: string | null = null;
        if (customerEmail) {
          const { data: usersPage } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
          const u = usersPage?.users.find((x) => x.email?.toLowerCase() === customerEmail.toLowerCase());
          if (u) matchedUserId = u.id;
        }

        await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: matchedUserId,
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

        if (matchedUserId) {
          await supabaseAdmin
            .from("members")
            .update({
              status: "active",
              plan: priceId,
              stripe_customer_id: customerId,
              stripe_subscription_id: sub.id,
              current_period_end: periodEndIso,
            })
            .eq("user_id", matchedUserId);
          claimed++;
        } else if (customerEmail) {
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
          unclaimed++;
        }
        imported++;
      }

      if (!page.has_more) break;
      cursor = page.data[page.data.length - 1]?.id;
      if (!cursor) break;
    }

    return { imported, claimed, unclaimed };
  });

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const email = (claims as any)?.email as string | undefined;

    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      console.error("Admin status check failed", error);
      return { isAdmin: false, email: email ?? null, error: "Unable to verify admin access." };
    }

    return {
      isAdmin: !!roles?.some((r) => r.role === "admin"),
      email: email ?? null,
      error: null,
    };
  });

/**
 * Called automatically when an authenticated user lands in the portal.
 * Looks up pending_claims by their email, links the subscription to the user,
 * and updates the members row.
 */
export const claimMyPendingSubscription = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const email = (claims as any)?.email as string | undefined;
    if (!email) return { claimed: false, reason: "no email on session" };

    const { data: pendings } = await supabaseAdmin
      .from("pending_claims")
      .select("*")
      .ilike("email", email)
      .is("claimed_at", null);

    if (!pendings || pendings.length === 0) return { claimed: false, reason: "no pending claim" };

    let claimedCount = 0;
    for (const p of pendings) {
      // Link the subscription to this user
      await supabaseAdmin
        .from("subscriptions")
        .update({ user_id: userId })
        .eq("stripe_subscription_id", p.stripe_subscription_id);

      // Mirror to members
      await supabaseAdmin
        .from("members")
        .update({
          status: p.status === "active" || p.status === "trialing" ? "active" : "past_due",
          plan: p.price_id,
          stripe_customer_id: p.stripe_customer_id,
          stripe_subscription_id: p.stripe_subscription_id,
          current_period_end: p.current_period_end,
        })
        .eq("user_id", userId);

      // Mark as claimed (kept for audit, not deleted)
      await supabaseAdmin
        .from("pending_claims")
        .update({ claimed_at: new Date().toISOString(), claimed_by: userId })
        .eq("id", p.id);

      claimedCount++;
    }

    return { claimed: true, count: claimedCount };
  });
