import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getMyAdminStatus } from "@/lib/membership.functions";

export const Route = createFileRoute("/_authenticated/portal/admin/")({
  head: () => ({ meta: [{ title: "Admin — ALP Contractor Circle" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const checkAdmin = useServerFn(getMyAdminStatus);

  const adminStatus = useQuery({
    queryKey: ["admin-status", user?.id],
    queryFn: () => checkAdmin(),
    enabled: !!user && !loading,
    retry: 1,
  });

  if (loading || adminStatus.isLoading || adminStatus.isFetching) {
    return <div className="p-10 text-sm text-muted-foreground">Checking admin access...</div>;
  }

  if (!user || adminStatus.isError || !adminStatus.data?.isAdmin) {
    return (
      <div className="container-prose py-12 space-y-4">
        <h1 className="font-display text-3xl">Admin access required</h1>
        <p className="text-sm text-muted-foreground">
          {adminStatus.data?.error ??
            (adminStatus.data?.email
              ? `${adminStatus.data.email} is signed in, but admin access could not be verified.`
              : "You are not signed in on this browser session.")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/login">Sign in again</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-prose py-10 space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Admin</p>
        <h1 className="font-display text-4xl mt-2">Admin tools</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Run one-time maintenance actions for membership and billing data.
        </p>
      </div>

      <Card className="p-6 border-hairline">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-soft text-amber">
              <DatabaseZap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl">Stripe subscription backfill</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Import active Stripe subscriptions and stage unclaimed members.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/portal/admin/backfill">Open backfill</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
