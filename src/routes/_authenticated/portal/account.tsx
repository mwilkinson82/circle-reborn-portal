import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, UserCircle } from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { createPortalSession } from "@/lib/payments.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMembershipPlan, titleCase } from "@/lib/membership-plan";

export const Route = createFileRoute("/_authenticated/portal/account")({
  head: () => ({ meta: [{ title: "Account — ALP Contractor Circle" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading } = useAuth();
  const fetchDashboard = useServerFn(getDashboard);
  const createPortal = useServerFn(createPortalSession);
  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => fetchDashboard(),
    enabled: !!user && !loading,
  });

  const openBilling = async () => {
    const url = await createPortal({
      data: { returnUrl: `${window.location.origin}/portal/account` },
    });
    if (url) window.location.href = url;
  };

  return (
    <div className="container-prose py-10 space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Member</p>
        <h1 className="font-display text-4xl mt-2">Account</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Profile and billing basics for your Contractor Circle membership.
        </p>
      </div>

      <Card className="p-6 border-hairline">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-soft text-amber">
            <UserCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl">
              {data?.profile?.display_name ?? user?.email ?? "Member"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {data?.profile?.company ?? user?.email ?? "Contractor Circle"}
            </p>
            <dl className="mt-6 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
              <div className="bg-card p-4">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Status</dt>
                <dd className="mt-1 font-medium">
                  {data?.member?.status ? titleCase(data.member.status) : "Checking"}
                </dd>
              </div>
              <div className="bg-card p-4">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Plan</dt>
                <dd className="mt-1 font-medium">{formatMembershipPlan(data?.member?.plan)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-hairline">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl">Billing</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage payment method, invoices, and cancellation in Stripe.
            </p>
          </div>
          <Button onClick={openBilling}>
            <CreditCard className="mr-2 h-4 w-4" />
            Manage billing
          </Button>
        </div>
      </Card>
    </div>
  );
}
