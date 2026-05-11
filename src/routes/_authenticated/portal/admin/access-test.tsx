import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getMyAdminStatus, prepareAccessTest } from "@/lib/membership.functions";

export const Route = createFileRoute("/_authenticated/portal/admin/access-test")({
  head: () => ({ meta: [{ title: "Access Test — ALP Contractor Circle" }] }),
  component: AccessTestPage,
});

type AccessTestResult = {
  memberEmail: string;
  blockedEmail: string;
  preparedAt: string;
};

function AccessTestPage() {
  const { user, loading } = useAuth();
  const checkAdmin = useServerFn(getMyAdminStatus);
  const prepare = useServerFn(prepareAccessTest);
  const [result, setResult] = useState<AccessTestResult | null>(null);
  const [running, setRunning] = useState(false);
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

  const onPrepare = async () => {
    setRunning(true);
    setError(null);
    try {
      const prepared = await prepare({ data: undefined as never });
      setResult(prepared);
      toast.success("Access test emails are ready.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  if ((loading || adminStatus.isLoading || adminStatus.isFetching) && !accessTimedOut) {
    return <div className="p-10 text-sm text-muted-foreground">Checking admin access...</div>;
  }

  if (!user || accessTimedOut || adminStatus.isError || !adminStatus.data?.isAdmin) {
    return (
      <div className="container-prose py-12 space-y-4">
        <h1 className="font-display text-3xl">Admin access required</h1>
        <p className="text-sm text-muted-foreground">
          {accessTimedOut
            ? "The admin check did not return. Refresh the session, then try again."
            : "You need an admin session before preparing an access test."}
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
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Admin · QA</p>
        <h1 className="font-display text-3xl mt-2">Access gate test</h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-prose">
          This prepares two Gmail aliases that deliver to your inbox. One alias is staged as a
          comped Circle member. The other is intentionally left off the roster.
        </p>
      </div>

      <Card className="p-6 border-hairline space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-soft text-amber">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl">Prepare test emails</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No customer inboxes needed. Both links will land in your Gmail.
            </p>
          </div>
        </div>

        <Button size="lg" onClick={onPrepare} disabled={running}>
          {running ? "Preparing..." : "Prepare access test"}
        </Button>

        {error && (
          <div className="border border-destructive/50 bg-destructive/10 text-destructive p-4 text-sm">
            {error}
          </div>
        )}
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className="p-6 border-hairline space-y-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-amber">
                Test 1 · Should get in
              </p>
              <h2 className="font-display text-2xl mt-2">Comped member alias</h2>
            </div>
            <EmailCopy value={result.memberEmail} />
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Sign out of the portal.</li>
              <li>Go to the login page and enter this email.</li>
              <li>Open the Supabase email in Gmail and confirm the link.</li>
              <li>You should land in the portal dashboard.</li>
            </ol>
          </Card>

          <Card className="p-6 border-hairline space-y-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Test 2 · Should be blocked
              </p>
              <h2 className="font-display text-2xl mt-2">Non-member alias</h2>
            </div>
            <EmailCopy value={result.blockedEmail} />
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Sign out again.</li>
              <li>Go to the login page and enter this email.</li>
              <li>Open the Supabase email in Gmail and confirm the link.</li>
              <li>You should see Membership required instead of the dashboard.</li>
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}

function EmailCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3 border border-hairline bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
      <code className="break-all text-sm">{value}</code>
      <Button type="button" variant="outline" onClick={onCopy}>
        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
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
