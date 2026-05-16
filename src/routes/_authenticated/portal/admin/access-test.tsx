import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, MailCheck, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  getMyAdminStatus,
  prepareAccessTest,
  previewPasswordSetupCampaign,
  sendPasswordSetupCampaign,
} from "@/lib/membership.functions";

export const Route = createFileRoute("/_authenticated/portal/admin/access-test")({
  head: () => ({ meta: [{ title: "Access Test — ALP Contractor Circle" }] }),
  component: AccessTestPage,
});

type AccessTestResult = {
  memberEmail: string;
  memberActionLink: string;
  blockedEmail: string;
  blockedActionLink: string;
  preparedAt: string;
};

type PasswordSetupCampaignResult = {
  mode: "preview" | "send";
  generatedAt: string;
  totalPendingClaims: number;
  readyToEmail: number;
  alreadySent: number;
  sent: number;
  failed: Array<{ email: string; error: string }>;
  skipped: {
    invalidEmail: number;
    ineligibleStatus: number;
    duplicateEmail: number;
  };
  sampleEmails: string[];
  emailConfigReady: boolean;
};

function AccessTestPage() {
  const { user, loading } = useAuth();
  const checkAdmin = useServerFn(getMyAdminStatus);
  const prepare = useServerFn(prepareAccessTest);
  const previewCampaign = useServerFn(previewPasswordSetupCampaign);
  const sendCampaign = useServerFn(sendPasswordSetupCampaign);
  const [result, setResult] = useState<AccessTestResult | null>(null);
  const [campaignResult, setCampaignResult] = useState<PasswordSetupCampaignResult | null>(null);
  const [running, setRunning] = useState(false);
  const [previewRunning, setPreviewRunning] = useState(false);
  const [sendRunning, setSendRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);
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
      toast.success("Access test links are ready.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const onPreviewCampaign = async () => {
    setPreviewRunning(true);
    setCampaignError(null);
    try {
      const preview = await previewCampaign();
      setCampaignResult(preview);
      toast.success("Password campaign preview is ready.");
    } catch (e) {
      setCampaignError(e instanceof Error ? e.message : String(e));
    } finally {
      setPreviewRunning(false);
    }
  };

  const onSendCampaign = async () => {
    const readyToEmail = campaignResult?.readyToEmail ?? 0;
    if (readyToEmail < 1) {
      toast.error("Preview the campaign first.");
      return;
    }

    const confirmed = window.confirm(
      `Send password setup emails to ${readyToEmail} unclaimed members?`,
    );
    if (!confirmed) return;

    setSendRunning(true);
    setCampaignError(null);
    try {
      const sent = await sendCampaign({ data: {} });
      setCampaignResult(sent);
      toast.success(`Password setup campaign sent to ${sent.sent} members.`);
    } catch (e) {
      setCampaignError(e instanceof Error ? e.message : String(e));
    } finally {
      setSendRunning(false);
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
        <h1 className="font-display text-3xl mt-2">Member access</h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-prose">
          Preview the member password setup campaign before sending it, then keep the one-off access
          gate test available for QA.
        </p>
      </div>

      <Card className="p-6 border-hairline space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-soft text-amber">
            <MailCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl">Password setup campaign</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sends each unclaimed active or comped member a private setup link that opens the
              password page. Preview does not send emails.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" variant="outline" onClick={onPreviewCampaign} disabled={previewRunning}>
            {previewRunning ? "Previewing..." : "Preview campaign"}
          </Button>
          <Button
            size="lg"
            onClick={onSendCampaign}
            disabled={
              sendRunning ||
              !campaignResult ||
              campaignResult.readyToEmail < 1 ||
              !campaignResult.emailConfigReady
            }
          >
            <Send className="mr-2 h-4 w-4" />
            {sendRunning ? "Sending..." : "Send setup emails"}
          </Button>
        </div>

        {campaignError && (
          <div className="border border-destructive/50 bg-destructive/10 text-destructive p-4 text-sm">
            {campaignError}
          </div>
        )}

        {campaignResult && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <CampaignMetric label="Ready" value={campaignResult.readyToEmail} />
              <CampaignMetric label="Already sent" value={campaignResult.alreadySent} />
              <CampaignMetric label="Sent now" value={campaignResult.sent} />
              <CampaignMetric label="Failed" value={campaignResult.failed.length} />
            </div>

            {!campaignResult.emailConfigReady && (
              <div className="border border-amber/40 bg-amber-soft/50 p-4 text-sm text-muted-foreground">
                Resend is not configured, so sending is disabled. Add RESEND_API_KEY and a from
                email before running the live campaign.
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="border border-hairline p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  First emails queued
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  {campaignResult.sampleEmails.length ? (
                    campaignResult.sampleEmails.map((email) => (
                      <div key={email} className="break-all">
                        {email}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No unsent members are waiting.</p>
                  )}
                </div>
              </div>

              <div className="border border-hairline p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Skipped
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <dt className="text-muted-foreground">Invalid email</dt>
                  <dd>{campaignResult.skipped.invalidEmail}</dd>
                  <dt className="text-muted-foreground">Inactive status</dt>
                  <dd>{campaignResult.skipped.ineligibleStatus}</dd>
                  <dt className="text-muted-foreground">Duplicate email</dt>
                  <dd>{campaignResult.skipped.duplicateEmail}</dd>
                  <dt className="text-muted-foreground">Pending claims</dt>
                  <dd>{campaignResult.totalPendingClaims}</dd>
                </dl>
              </div>
            </div>

            {campaignResult.failed.length ? (
              <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm">
                <p className="font-medium text-destructive">Failures</p>
                <div className="mt-2 space-y-2">
                  {campaignResult.failed.map((failure) => (
                    <div key={`${failure.email}-${failure.error}`}>
                      <span className="font-medium">{failure.email}:</span> {failure.error}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Card>

      <Card className="p-6 border-hairline space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-soft text-amber">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-2xl">Prepare test emails</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No customer inboxes or emails needed. These are one-time Supabase admin links for
              testing only.
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
            <Button asChild className="w-fit">
              <a href={result.memberActionLink}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open member login link
              </a>
            </Button>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Sign out of the portal.</li>
              <li>Open the member login link above.</li>
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
            <Button asChild variant="outline" className="w-fit">
              <a href={result.blockedActionLink}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open blocked login link
              </a>
            </Button>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Sign out again.</li>
              <li>Open the blocked login link above.</li>
              <li>You should see Membership required instead of the dashboard.</li>
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}

function CampaignMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-hairline p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
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
