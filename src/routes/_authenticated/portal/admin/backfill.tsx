import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { backfillExistingSubscriptions, getMyAdminStatus } from "@/lib/membership.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/portal/admin/backfill")({
  component: BackfillPage,
});

function BackfillPage() {
  const { user, loading } = useAuth();
  const run = useServerFn(backfillExistingSubscriptions);
  const checkAdmin = useServerFn(getMyAdminStatus);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    claimed: number;
    unclaimed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessTimedOut, setAccessTimedOut] = useState(false);

  const adminStatus = useQuery({
    queryKey: ["admin-status", user?.id],
    queryFn: () => withTimeout(checkAdmin(), 8000, "Admin access check timed out."),
    enabled: !!user && !loading,
    retry: false,
  });

  useEffect(() => {
    if (!loading && !adminStatus.isLoading && !adminStatus.isFetching) {
      setAccessTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setAccessTimedOut(true), 8000);
    return () => window.clearTimeout(timer);
  }, [loading, adminStatus.isLoading, adminStatus.isFetching]);

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

  if ((loading || adminStatus.isLoading || adminStatus.isFetching) && !accessTimedOut) {
    return <div className="p-10 text-sm text-muted-foreground">Checking admin access…</div>;
  }

  if (!user || accessTimedOut || adminStatus.isError || !adminStatus.data?.isAdmin) {
    return (
      <div className="container-prose py-12 space-y-4">
        <h1 className="font-display text-3xl">Admin access required</h1>
        <p className="text-sm text-muted-foreground">
          {accessTimedOut
            ? "The admin check did not return. Refresh the session, then try again."
            : (adminStatus.data?.error ??
              (adminStatus.data?.email
                ? `${adminStatus.data.email} is signed in, but admin access could not be verified.`
                : "You are not signed in on this browser session."))}
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
    <div className="container-prose py-12 space-y-8">
      <Button asChild variant="outline">
        <Link to="/portal/admin">Back to admin</Link>
      </Button>

      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Admin · One-time</p>
        <h1 className="font-display text-3xl mt-2">Backfill existing Stripe subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-prose">
          Pulls every active, trialing, and past-due subscription from your connected Stripe
          account. For each one, links it to a registered user (matched by email) or stages it as a
          pending claim so the member can self-claim by signing up. Safe to re-run.
        </p>
      </div>

      <div className="border border-amber/30 bg-amber-soft p-4 text-sm text-foreground">
        The member CSV import already staged the current roster in the rebuild Supabase project.
        Only run this if you intentionally want to resync live Stripe subscriptions into this new
        project.
      </div>

      <Button size="lg" onClick={onRun} disabled={running}>
        {running ? "Running..." : "Run Stripe sync"}
      </Button>

      {error && (
        <div className="border border-destructive/50 bg-destructive/10 text-destructive p-4 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="border border-hairline bg-elevated p-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total imported</span>
            <span className="font-mono">{result.imported}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Linked to existing users</span>
            <span className="font-mono">{result.claimed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Awaiting member signup</span>
            <span className="font-mono">{result.unclaimed}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}
