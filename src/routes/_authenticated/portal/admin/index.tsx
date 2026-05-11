import { createFileRoute, Link } from "@tanstack/react-router";
import { DatabaseZap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/portal/admin/")({
  head: () => ({ meta: [{ title: "Admin — ALP Contractor Circle" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => setIsAdmin(!!data?.some((r) => r.role === "admin")));
  }, [user]);

  if (isAdmin === null) {
    return <div className="p-10 text-sm text-muted-foreground">Checking access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container-prose py-12">
        <h1 className="font-display text-3xl">Admin only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This area is restricted to Contractor Circle administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="container-prose py-10 space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Admin</p>
        <h1 className="font-display text-4xl mt-2">Admin</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Admin tools are being rebuilt. The Stripe backfill utility is available now.
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
