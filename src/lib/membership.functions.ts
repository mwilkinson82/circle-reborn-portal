import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { createStripeClient } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachAuthHeader } from "@/lib/auth-client-middleware";
import { isFoundingPlan } from "@/lib/membership-plan";

function normalizeClaimStatus(status: string | null | undefined) {
  return (status ?? "").trim().toLowerCase();
}

function isActiveManualClaim(status: string | null | undefined) {
  return ["active", "trialing", "comped", "manual", "founding"].includes(
    normalizeClaimStatus(status),
  );
}

function resolveClaimedMemberStatus(
  status: string | null | undefined,
): "active" | "past_due" | "canceled" {
  const normalized = normalizeClaimStatus(status);
  if (isActiveManualClaim(status)) return "active";
  if (normalized === "past_due") return "past_due";
  return "canceled";
}

function isFoundingClaim(priceId: string | null | undefined, status: string | null | undefined) {
  return isFoundingPlan(priceId) || normalizeClaimStatus(status) === "founding";
}

function configuredAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isConfiguredAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return configuredAdminEmails().includes(email.trim().toLowerCase());
}

type PendingClaim = {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  price_id: string | null;
  status: string;
  current_period_end: string | null;
};

type ClaimResult = {
  claimed: boolean;
  count?: number;
  reason?: string;
};

type ConfiguredAdminResult = {
  applied: boolean;
  error?: string | null;
};

type MembershipRecord = {
  status: string | null;
  plan: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_end: string | null;
  is_comped: boolean | null;
  is_founding: boolean | null;
};

type AuthUserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
  identities?: Array<{
    identity_data?: Record<string, unknown> | null;
  }> | null;
};

function getStringValue(source: Record<string, unknown> | null | undefined, key: string) {
  const value = source?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function resolveAuthEmail(user: AuthUserLike | null | undefined, fallbackEmail?: string | null) {
  const directEmail =
    fallbackEmail?.trim() ||
    user?.email?.trim() ||
    getStringValue(user?.user_metadata, "email") ||
    getStringValue(user?.user_metadata, "email_address") ||
    getStringValue(user?.app_metadata, "email");

  if (directEmail) return directEmail;

  for (const identity of user?.identities ?? []) {
    const identityEmail =
      getStringValue(identity.identity_data, "email") ||
      getStringValue(identity.identity_data, "email_address");
    if (identityEmail) return identityEmail;
  }

  return null;
}

function hasPortalAccess(
  member: Pick<MembershipRecord, "status" | "is_comped"> | null | undefined,
  isAdmin: boolean,
) {
  if (isAdmin) return true;
  const status = normalizeClaimStatus(member?.status);
  return ["active", "trialing", "past_due"].includes(status) || member?.is_comped === true;
}

function resolveStripeMemberStatus(
  status: Stripe.Subscription.Status,
): "active" | "past_due" | "canceled" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due") return "past_due";
  return "canceled";
}

async function refreshPaidMemberFromStripe(
  userId: string,
  member: MembershipRecord | null,
): Promise<MembershipRecord | null> {
  if (!member?.stripe_subscription_id || member.is_comped === true) return member;

  const stripe = createStripeClient("live");
  const subscription = await stripe.subscriptions.retrieve(member.stripe_subscription_id);
  const item = subscription.items.data[0];
  const priceId = item?.price?.id ?? member.plan;
  const productId = typeof item?.price?.product === "string" ? item.price.product : null;
  const periodEndUnix = item?.current_period_end ?? null;
  const periodEndIso = periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null;
  const status = resolveStripeMemberStatus(subscription.status);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const updated: MembershipRecord = {
    ...member,
    status,
    plan: priceId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    current_period_end: periodEndIso,
    is_founding: isFoundingPlan(priceId),
    is_comped: false,
  };

  const { error: memberError } = await supabaseAdmin
    .from("members")
    .update({
      status: updated.status,
      plan: updated.plan,
      stripe_customer_id: updated.stripe_customer_id,
      stripe_subscription_id: updated.stripe_subscription_id,
      current_period_end: updated.current_period_end,
      is_founding: updated.is_founding,
      is_comped: updated.is_comped,
    })
    .eq("user_id", userId);
  if (memberError) throw memberError;

  const { error: subscriptionError } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: subscription.status,
      price_id: priceId,
      product_id: productId,
      current_period_end: periodEndIso,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("stripe_subscription_id", subscription.id);
  if (subscriptionError) throw subscriptionError;

  return updated;
}

async function claimPendingSubscriptionForUser(
  userId: string,
  email: string | null | undefined,
): Promise<ClaimResult> {
  if (!email) return { claimed: false, reason: "no email on session" };

  const { data: pendings, error: pendingError } = await supabaseAdmin
    .from("pending_claims")
    .select("*")
    .ilike("email", email)
    .is("claimed_at", null);

  if (pendingError) throw pendingError;
  if (!pendings || pendings.length === 0) return { claimed: false, reason: "no pending claim" };

  let claimedCount = 0;
  for (const p of pendings as PendingClaim[]) {
    const isComped = !p.stripe_subscription_id;
    const status = resolveClaimedMemberStatus(p.status);

    if (p.stripe_subscription_id) {
      const { error: subscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .update({ user_id: userId })
        .eq("stripe_subscription_id", p.stripe_subscription_id);
      if (subscriptionError) throw subscriptionError;
    }

    const { error: memberError } = await supabaseAdmin.from("members").upsert(
      {
        user_id: userId,
        status,
        plan: p.price_id ?? (isComped ? "comped" : null),
        stripe_customer_id: p.stripe_customer_id,
        stripe_subscription_id: p.stripe_subscription_id,
        current_period_end: p.current_period_end,
        is_founding: isFoundingClaim(p.price_id, p.status),
        is_comped: isComped,
      },
      { onConflict: "user_id" },
    );
    if (memberError) throw memberError;

    const { error: claimedError } = await supabaseAdmin
      .from("pending_claims")
      .update({ claimed_at: new Date().toISOString(), claimed_by: userId })
      .eq("id", p.id);
    if (claimedError) throw claimedError;

    claimedCount++;
  }

  return { claimed: true, count: claimedCount };
}

async function ensureConfiguredAdminAccessForUser(
  userId: string,
  email: string | null,
): Promise<ConfiguredAdminResult> {
  if (!isConfiguredAdminEmail(email)) return { applied: false };

  const { error: memberError } = await supabaseAdmin.from("members").upsert(
    {
      user_id: userId,
      status: "active",
      plan: "comped",
      is_comped: true,
      is_founding: false,
    },
    { onConflict: "user_id" },
  );
  if (memberError) throw memberError;

  const { error: memberRoleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "member" }, { onConflict: "user_id,role" });
  if (memberRoleError) throw memberRoleError;

  const { error: adminRoleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (adminRoleError) throw adminRoleError;

  return { applied: true };
}

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
      const page = await stripe.subscriptions.list({
        status: "all",
        limit: 100,
        ...(cursor && { starting_after: cursor }),
        expand: ["data.customer"],
      });

      for (const sub of page.data) {
        if (!["active", "trialing", "past_due"].includes(sub.status)) continue;

        const item = sub.items.data[0];
        const priceId = item?.price?.id ?? null;
        const productId = typeof item?.price?.product === "string" ? item.price.product : null;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const customer =
          typeof sub.customer === "object" && !sub.customer.deleted
            ? (sub.customer as Stripe.Customer)
            : null;
        const customerEmail: string | null = customer?.email ?? null;
        const periodEndUnix = item?.current_period_end ?? null;
        const periodEndIso = periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null;

        // Try to match an existing user by email
        let matchedUserId: string | null = null;
        if (customerEmail) {
          const { data: usersPage } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 200,
          });
          const u = usersPage?.users.find(
            (x) => x.email?.toLowerCase() === customerEmail.toLowerCase(),
          );
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
              is_founding: isFoundingPlan(priceId),
              is_comped: false,
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
    const email = (claims as { email?: string } | undefined)?.email;

    if (isConfiguredAdminEmail(email)) {
      return { isAdmin: true, email: email ?? null, error: null };
    }

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

export const getMyMembershipAccess = createServerFn({ method: "GET" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const claimEmail = (claims as { email?: string } | undefined)?.email ?? null;
    const { data: authUserRes, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (authUserError) {
      console.error("Auth user lookup failed during membership check", authUserError);
    }

    const email = resolveAuthEmail(authUserRes?.user, claimEmail);

    if (isConfiguredAdminEmail(email)) {
      let configuredAdmin: ConfiguredAdminResult = { applied: false };
      try {
        configuredAdmin = await ensureConfiguredAdminAccessForUser(userId, email);
      } catch (error) {
        console.error("Configured admin bootstrap failed", error);
        configuredAdmin = {
          applied: false,
          error: "Portal access was granted, but the admin membership row was not written.",
        };
      }

      return {
        hasAccess: true,
        userId,
        isAdmin: true,
        member: {
          status: "active",
          plan: "comped",
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: null,
          is_comped: true,
          is_founding: false,
        } satisfies MembershipRecord,
        claim: { claimed: false, reason: "configured admin email" },
        configuredAdmin,
        email,
      };
    }

    const claim = await claimPendingSubscriptionForUser(userId, email);
    const configuredAdmin = await ensureConfiguredAdminAccessForUser(userId, email);

    const [memberRes, rolesRes] = await Promise.all([
      supabaseAdmin
        .from("members")
        .select(
          "status, plan, stripe_customer_id, stripe_subscription_id, current_period_end, is_comped, is_founding",
        )
        .eq("user_id", userId)
        .maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (memberRes.error) {
      console.error("Membership access check failed", memberRes.error);
    }

    const isAdmin = !!rolesRes.data?.some((r) => r.role === "admin");
    const member = await refreshPaidMemberFromStripe(userId, memberRes.data ?? null);

    return {
      hasAccess: hasPortalAccess(member, isAdmin),
      userId,
      isAdmin,
      member,
      claim,
      configuredAdmin,
      email,
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
    const email = (claims as { email?: string } | undefined)?.email;
    return claimPendingSubscriptionForUser(userId, email);
  });
