import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { backfillExistingSubscriptions } from "@/lib/membership.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/portal/admin/backfill")({
  component: BackfillPage,
});

function BackfillPage() {
  const { user, loading } = useAuth();
  const run = useServerFn(backfillExistingSubscriptions);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ imported: number; claimed: number; unclaimed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    if (!user) {
      setIsAdmin(false);
      setAccessError("You are not signed in on this browser session.");
      return;
    }
    setIsAdmin(null);
    setAccessError(null);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setAccessError(error.message);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(!!data?.some((r) => r.role === "admin"));
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const onRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const r = await run({ data: undefined as never });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  if (loading || isAdmin === null) return <div className="p-10 text-sm text-muted-foreground">Checking admin access…</div>;
  if (!isAdmin) {
    return (
      <div className="container-prose py-12 space-y-4">
        <h1 className="font-display text-3xl">Admin access required</h1>
        <p className="text-sm text-muted-foreground">
          {accessError ?? "This signed-in account does not have the admin role."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild><Link to="/login">Sign in again</Link></Button>
          <Button variant="outline" onClick={() => window.location.reload()}>Refresh session</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-prose py-12 space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Admin · One-time</p>
        <h1 className="font-display text-3xl mt-2">Backfill existing Stripe subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-prose">
          Pulls every active, trialing, and past-due subscription from your connected Stripe account.
          For each one, links it to a registered user (matched by email) or stages it as a pending claim
          so the member can self-claim by signing up. Safe to re-run.
        </p>
      </div>

      <Button size="lg" onClick={onRun} disabled={running}>
        {running ? "Running…" : "Run backfill"}
      </Button>

      {error && <div className="border border-destructive/50 bg-destructive/10 text-destructive p-4 text-sm">{error}</div>}

      {result && (
        <div className="border border-hairline bg-elevated p-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Total imported</span><span className="font-mono">{result.imported}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Linked to existing users</span><span className="font-mono">{result.claimed}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Awaiting member signup</span><span className="font-mono">{result.unclaimed}</span></div>
        </div>
      )}
    </div>
  );
}
