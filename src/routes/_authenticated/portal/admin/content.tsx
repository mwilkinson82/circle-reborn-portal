import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Save,
  Video,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminContentCenter,
  saveAdminReplay,
  saveBootcampSession,
  updateBootcampQuestionStatus,
} from "@/lib/admin-content.functions";

export const Route = createFileRoute("/_authenticated/portal/admin/content")({
  head: () => ({ meta: [{ title: "Content Command Center — Admin" }] }),
  component: AdminContentPage,
});

type AdminReplay = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  recorded_at: string;
  tags: string[];
  thumbnail_url: string | null;
  video_url: string | null;
  published: boolean;
};

type AdminSession = {
  id: string;
  title: string;
  session_date: string;
  session_url: string | null;
  replay_url: string | null;
  notes: string | null;
  published: boolean;
};

type AdminQuestion = {
  id: string;
  question: string;
  context: string | null;
  status: "submitted" | "accepted" | "declined" | "discussed";
  admin_note: string | null;
  created_at: string;
  user_id: string;
};

type AdminIntensiveApplication = {
  id: string;
  full_name: string;
  company_name: string;
  annual_revenue_range: string;
  biggest_challenge: string;
  already_tried: string;
  applying_for: string;
  email: string;
  phone: string;
  status: "submitted" | "reviewed" | "accepted" | "declined";
  email_status: string;
  email_error: string | null;
  created_at: string;
};

type AdminDiagnostics = {
  templateCount: number;
  replayCount: number;
  placeholderTemplateCount: number;
  placeholderReplayCount: number;
  manusTemplateUrlCount: number;
  usingTemplateFallback: boolean;
  usingReplayFallback: boolean;
  supabaseAdminEnv: {
    ready: boolean;
    missing: string[];
    message: string | null;
  };
};

const blankReplay = {
  id: "",
  title: "",
  description: "",
  durationMinutes: "",
  recordedAt: new Date().toISOString().slice(0, 10),
  tags: "Contractor Circle",
  thumbnailUrl: "",
  videoUrl: "",
  published: true,
};

const blankSession = {
  id: "",
  title: "Monthly Bootcamp",
  sessionDate: new Date().toISOString().slice(0, 10),
  sessionUrl: "",
  replayUrl: "",
  notes: "",
  published: true,
};

function AdminContentPage() {
  const queryClient = useQueryClient();
  const getContent = useServerFn(getAdminContentCenter);
  const saveReplay = useServerFn(saveAdminReplay);
  const saveSession = useServerFn(saveBootcampSession);
  const updateQuestion = useServerFn(updateBootcampQuestionStatus);
  const [replayForm, setReplayForm] = useState(blankReplay);
  const [sessionForm, setSessionForm] = useState(blankSession);

  const content = useQuery({
    queryKey: ["admin-content-center"],
    queryFn: () => getContent(),
    retry: false,
  });

  const replayMutation = useMutation({
    mutationFn: () =>
      saveReplay({
        data: {
          ...replayForm,
          id: replayForm.id || null,
          durationMinutes: replayForm.durationMinutes ? Number(replayForm.durationMinutes) : null,
        },
      }),
    onSuccess: () => {
      setReplayForm(blankReplay);
      queryClient.invalidateQueries({ queryKey: ["admin-content-center"] });
      queryClient.invalidateQueries({ queryKey: ["replay-library"] });
      toast.success("Replay saved.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Replay not saved."),
  });

  const sessionMutation = useMutation({
    mutationFn: () =>
      saveSession({
        data: {
          ...sessionForm,
          id: sessionForm.id || null,
        },
      }),
    onSuccess: () => {
      setSessionForm(blankSession);
      queryClient.invalidateQueries({ queryKey: ["admin-content-center"] });
      queryClient.invalidateQueries({ queryKey: ["bootcamp-center"] });
      toast.success("Bootcamp session saved.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Bootcamp session not saved."),
  });

  const questionMutation = useMutation({
    mutationFn: (data: { id: string; status: AdminQuestion["status"]; adminNote?: string }) =>
      updateQuestion({
        data: { id: data.id, status: data.status, adminNote: data.adminNote ?? "" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-center"] });
      toast.success("Bootcamp question updated.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Question status not updated."),
  });

  const replays = ((content.data?.replays ?? []) as AdminReplay[]).slice(0, 12);
  const sessions = ((content.data?.sessions ?? []) as AdminSession[]).slice(0, 6);
  const questions = ((content.data?.questions ?? []) as AdminQuestion[]).slice(0, 12);
  const applications = ((content.data?.applications ?? []) as AdminIntensiveApplication[]).slice(
    0,
    10,
  );
  const diagnostics = content.data?.diagnostics as AdminDiagnostics | undefined;

  if (content.isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading content command...</div>;
  }

  if (content.isError) {
    return (
      <div className="container-prose space-y-4 py-12">
        <h1 className="font-display text-3xl">Admin content could not load</h1>
        <p className="text-sm text-muted-foreground">
          {content.error instanceof Error ? content.error.message : "Try again."}
        </p>
        <Button asChild variant="outline">
          <Link to="/portal/admin">Back to admin</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-prose space-y-8 py-8 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-4 px-0">
            <Link to="/portal/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Admin tools
            </Link>
          </Button>
          <p className="eyebrow text-amber">Admin command center</p>
          <h1 className="mt-2 font-display text-4xl">Content Command Center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Add replay sources, change bootcamp dates and links, and review bootcamp questions
            without touching code.
          </p>
        </div>
      </div>

      {diagnostics ? <LibraryDiagnostics diagnostics={diagnostics} /> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <ReplayEditor
          form={replayForm}
          setForm={setReplayForm}
          onSave={() => replayMutation.mutate()}
          saving={replayMutation.isPending}
        />
        <Card className="surface-library p-5">
          <p className="eyebrow text-amber">Published library</p>
          <h2 className="mt-2 font-display text-2xl">Recent replays</h2>
          <div className="mt-5 space-y-3">
            {replays.map((replay) => (
              <button
                key={replay.id}
                type="button"
                onClick={() =>
                  setReplayForm({
                    id: replay.id,
                    title: replay.title,
                    description: replay.description ?? "",
                    durationMinutes: replay.duration_minutes ? String(replay.duration_minutes) : "",
                    recordedAt: replay.recorded_at.slice(0, 10),
                    tags: replay.tags.join(", "),
                    thumbnailUrl: replay.thumbnail_url ?? "",
                    videoUrl: replay.video_url ?? "",
                    published: replay.published,
                  })
                }
                className="w-full border border-hairline bg-background p-3 text-left transition-colors hover:border-foreground/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-2 text-sm font-medium">{replay.title}</p>
                  <Edit3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(replay.recorded_at), "MMM d, yyyy")} ·{" "}
                  {replay.video_url ? "Video ready" : "Awaiting replay link"}
                </p>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <BootcampSessionEditor
          form={sessionForm}
          setForm={setSessionForm}
          onSave={() => sessionMutation.mutate()}
          saving={sessionMutation.isPending}
        />
        <Card className="surface-library p-5">
          <p className="eyebrow text-amber">Schedule</p>
          <h2 className="mt-2 font-display text-2xl">Bootcamp sessions</h2>
          <div className="mt-5 space-y-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() =>
                  setSessionForm({
                    id: session.id,
                    title: session.title,
                    sessionDate: session.session_date.slice(0, 10),
                    sessionUrl: session.session_url ?? "",
                    replayUrl: session.replay_url ?? "",
                    notes: session.notes ?? "",
                    published: session.published,
                  })
                }
                className="w-full border border-hairline bg-background p-3 text-left transition-colors hover:border-foreground/30"
              >
                <p className="text-sm font-medium">{session.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(new Date(session.session_date), "MMM d, yyyy")} ·{" "}
                  {session.session_url ? "Session link set" : "Session link pending"}
                </p>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <Card className="surface-operating p-5 sm:p-6">
        <p className="eyebrow text-amber">Intensive applications</p>
        <h2 className="mt-2 font-display text-3xl">Six-Week Contractor Intensive queue</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Review applications submitted from the portal. Status updates are still handled manually
          until an admin decision workflow is added.
        </p>
        <div className="mt-6 grid gap-3">
          {applications.map((application) => (
            <div key={application.id} className="border border-hairline bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{application.full_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {application.company_name} · {application.annual_revenue_range}
                  </p>
                </div>
                <Badge variant={application.status === "submitted" ? "outline" : "default"}>
                  {application.status}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {application.biggest_challenge}
              </p>
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <span>{application.applying_for}</span>
                <span>{application.email}</span>
                <span>{format(new Date(application.created_at), "MMM d, yyyy")}</span>
              </div>
              {application.email_status !== "sent" ? (
                <p className="mt-3 text-xs text-amber">
                  Email status: {application.email_status}
                  {application.email_error ? ` · ${application.email_error}` : ""}
                </p>
              ) : null}
            </div>
          ))}
          {applications.length === 0 ? (
            <p className="border border-hairline bg-background p-4 text-sm text-muted-foreground">
              No intensive applications submitted yet.
            </p>
          ) : null}
        </div>
      </Card>

      <Card className="surface-operating p-5 sm:p-6">
        <p className="eyebrow text-amber">Bootcamp questions</p>
        <h2 className="mt-2 font-display text-3xl">Review queue</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Accepting a question records the accepted state. Email notifications still need the
          transactional email workflow connected.
        </p>
        <div className="mt-6 grid gap-3">
          {questions.map((item) => (
            <div key={item.id} className="border border-hairline bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant={item.status === "accepted" ? "default" : "outline"}>
                  {item.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <p className="mt-3 text-sm font-medium">{item.question}</p>
              {item.context ? (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.context}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    questionMutation.mutate({
                      id: item.id,
                      status: "accepted",
                      adminNote: "Accepted for bootcamp discussion.",
                    })
                  }
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    questionMutation.mutate({
                      id: item.id,
                      status: "declined",
                      adminNote: "Not selected for this bootcamp.",
                    })
                  }
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    questionMutation.mutate({
                      id: item.id,
                      status: "discussed",
                      adminNote: "Discussed in bootcamp.",
                    })
                  }
                >
                  Mark discussed
                </Button>
              </div>
            </div>
          ))}
          {questions.length === 0 ? (
            <p className="border border-hairline bg-background p-4 text-sm text-muted-foreground">
              No bootcamp questions submitted yet.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function ReplayEditor({
  form,
  setForm,
  onSave,
  saving,
}: {
  form: typeof blankReplay;
  setForm: (value: typeof blankReplay) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const replayTestUrl = getReplayTestUrl(form.videoUrl);

  return (
    <Card className="surface-operating p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-soft text-amber">
          <Video className="h-5 w-5" />
        </div>
        <div>
          <p className="eyebrow text-amber">Replay library</p>
          <h2 className="font-display text-2xl">Add or update replay</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        <Field label="Title">
          <Input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
        </Field>
        <Field label="Embed code, video link, or Cloudflare Stream ID">
          <Input
            value={form.videoUrl}
            onChange={(event) => setForm({ ...form, videoUrl: event.target.value })}
            placeholder="Paste Zoom embed code/URL or 32-character Cloudflare ID"
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Recorded date">
            <Input
              type="date"
              value={form.recordedAt}
              onChange={(event) => setForm({ ...form, recordedAt: event.target.value })}
            />
          </Field>
          <Field label="Duration minutes">
            <Input
              value={form.durationMinutes}
              onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })}
              placeholder="120"
            />
          </Field>
        </div>
        <Field label="Tags">
          <Input
            value={form.tags}
            onChange={(event) => setForm({ ...form, tags: event.target.value })}
            placeholder="Contractor Circle, AOS, Bootcamp"
          />
        </Field>
        <Field label="Thumbnail URL">
          <Input
            value={form.thumbnailUrl}
            onChange={(event) => setForm({ ...form, thumbnailUrl: event.target.value })}
            placeholder="Optional. Cloudflare IDs generate a thumbnail automatically."
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className="min-h-28"
          />
        </Field>
        <div className="flex flex-wrap gap-3">
          <Button disabled={!form.title || !form.recordedAt || saving} onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save replay"}
          </Button>
          {replayTestUrl ? (
            <Button asChild variant="outline">
              <a href={replayTestUrl} target="_blank" rel="noopener noreferrer">
                Test replay <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : null}
          {form.id ? (
            <Button variant="outline" onClick={() => setForm(blankReplay)}>
              New replay
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function LibraryDiagnostics({ diagnostics }: { diagnostics: AdminDiagnostics }) {
  const warnings = [
    diagnostics.usingTemplateFallback
      ? `Template library is still using fallback data (${diagnostics.templateCount} Supabase rows, ${diagnostics.placeholderTemplateCount} placeholders).`
      : null,
    diagnostics.usingReplayFallback
      ? `Replay library is still using fallback data (${diagnostics.replayCount} Supabase rows, ${diagnostics.placeholderReplayCount} placeholders).`
      : null,
    diagnostics.manusTemplateUrlCount
      ? `${diagnostics.manusTemplateUrlCount} Supabase template URLs still point at Manus storage.`
      : null,
    diagnostics.supabaseAdminEnv.ready ? null : diagnostics.supabaseAdminEnv.message,
  ].filter((warning): warning is string => Boolean(warning));

  return (
    <Card className="surface-library p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-amber">Production readiness</p>
          <h2 className="mt-2 font-display text-2xl">Library source status</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Admin view of whether members are seeing Supabase content or local fallback catalogs.
          </p>
        </div>
        <Badge variant={warnings.length ? "outline" : "default"}>
          {warnings.length ? "Needs migration" : "Supabase ready"}
        </Badge>
      </div>
      {warnings.length ? (
        <div className="mt-4 grid gap-2">
          {warnings.map((warning) => (
            <p key={warning} className="flex gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              {warning}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Templates and replays are coming from Supabase without placeholder fallback triggers.
        </p>
      )}
    </Card>
  );
}

function getReplayTestUrl(value: string) {
  const raw = extractReplaySource(value);
  if (!raw) return null;
  if (/^[a-f0-9]{32}$/i.test(raw)) return `https://iframe.videodelivery.net/${raw}`;
  if (raw.includes("zoom.us/clips/")) return raw.replace("/clips/embed/", "/clips/share/");
  const cloudflareDeliveryMatch = raw.match(/videodelivery\.net\/([a-f0-9]{32})/i);
  if (cloudflareDeliveryMatch?.[1]) {
    return `https://iframe.videodelivery.net/${cloudflareDeliveryMatch[1]}`;
  }
  return /^https?:\/\//i.test(raw) ? raw : null;
}

function extractReplaySource(value: string) {
  const trimmed = value.trim().replace(/&amp;/g, "&");
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  return srcMatch?.[1]?.trim() ?? trimmed;
}

function BootcampSessionEditor({
  form,
  setForm,
  onSave,
  saving,
}: {
  form: typeof blankSession;
  setForm: (value: typeof blankSession) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Card className="surface-operating p-5 sm:p-6">
      <p className="eyebrow text-amber">Bootcamp schedule</p>
      <h2 className="mt-2 font-display text-2xl">Change date and links</h2>
      <div className="mt-6 grid gap-4">
        <Field label="Title">
          <Input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
        </Field>
        <Field label="Bootcamp date">
          <Input
            type="date"
            value={form.sessionDate}
            onChange={(event) => setForm({ ...form, sessionDate: event.target.value })}
          />
        </Field>
        <Field label="Live session link">
          <Input
            value={form.sessionUrl}
            onChange={(event) => setForm({ ...form, sessionUrl: event.target.value })}
            placeholder="Zoom or event link"
          />
        </Field>
        <Field label="Replay link">
          <Input
            value={form.replayUrl}
            onChange={(event) => setForm({ ...form, replayUrl: event.target.value })}
            placeholder="Optional replay link"
          />
        </Field>
        <Field label="Admin notes">
          <Textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className="min-h-24"
          />
        </Field>
        <div className="flex flex-wrap gap-3">
          <Button disabled={!form.title || !form.sessionDate || saving} onClick={onSave}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save bootcamp"}
          </Button>
          {form.id ? (
            <Button variant="outline" onClick={() => setForm(blankSession)}>
              New session
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
