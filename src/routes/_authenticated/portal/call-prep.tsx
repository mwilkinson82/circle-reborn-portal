import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Factory,
  Loader2,
  MessageSquareText,
  Save,
  Users,
} from "lucide-react";
import {
  createCallPrepPacket,
  getCallPrepPackets,
  type CallPrepPacket,
  type PacketOutputType,
} from "@/lib/call-prep.functions";
import { AOS_APP_URL } from "@/lib/aos-link";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/portal/call-prep")({
  head: () => ({ meta: [{ title: "Prepare for Call — Contractor Circle" }] }),
  component: CallPrepPage,
});

const categories = [
  {
    id: "leadership",
    label: "Leadership/System",
    icon: BriefcaseBusiness,
    prompt: "Owner drag, unclear accountability, weak process, or a decision that keeps circling.",
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    prompt: "Seat fit, accountability, hiring, performance, delegation, or right-person questions.",
  },
  {
    id: "cash",
    label: "Cash/Billing",
    icon: BadgeDollarSign,
    prompt:
      "Collections, billing rhythm, retainage, unbilled work, change orders, or margin leakage.",
  },
  {
    id: "sales",
    label: "Sales/Estimating",
    icon: ClipboardList,
    prompt: "Lead quality, bid discipline, win rate, estimating bottlenecks, or follow-up gaps.",
  },
  {
    id: "production",
    label: "Production",
    icon: Factory,
    prompt:
      "Schedule slippage, PM capacity, client decisions, field execution, or handoff problems.",
  },
] as const;

type CategoryId = (typeof categories)[number]["id"];
type DraftField =
  | "categoryId"
  | "issue"
  | "tried"
  | "avoiding"
  | "consequence"
  | "win"
  | "expectedOutput"
  | "outputSummary"
  | "owner"
  | "dueDate";

type CallPrepDraft = Record<DraftField, string>;

const DRAFT_STORAGE_KEY = "contractor-circle-call-prep-draft";
const LOCAL_HISTORY_STORAGE_KEY = "contractor-circle-call-prep-history";

const outcomeOptions: Array<{
  id: PacketOutputType;
  label: string;
  helper: string;
}> = [
  {
    id: "decision",
    label: "Decision",
    helper: "The call should force a clear leadership choice.",
  },
  {
    id: "todo",
    label: "To-do",
    helper: "The call should create a named next action.",
  },
  {
    id: "sop_gap",
    label: "SOP gap",
    helper: "The call should expose a process that needs documented.",
  },
  {
    id: "scorecard_metric",
    label: "Scorecard metric",
    helper: "The call should identify a number to track weekly.",
  },
  {
    id: "aos_issue",
    label: "AOS issue",
    helper: "This should move into the AOS app's issues list.",
  },
];

const outputLabels = Object.fromEntries(
  outcomeOptions.map((outcome) => [outcome.id, outcome.label]),
) as Record<PacketOutputType, string>;

const statusLabels: Record<CallPrepPacket["status"], string> = {
  draft: "Draft",
  ready: "Ready",
  discussed: "Discussed",
  converted: "Carried into AOS",
};

function CallPrepPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const savePacket = useServerFn(createCallPrepPacket);
  const fetchPackets = useServerFn(getCallPrepPackets);
  const { data: serverPackets = [], isError: packetsUnavailable } = useQuery({
    queryKey: ["call-prep-packets", user?.id],
    queryFn: () => fetchPackets(),
    enabled: !!user && !loading,
  });
  const [categoryId, setCategoryId] = useState<CategoryId>("leadership");
  const [issue, setIssue] = useState("");
  const [tried, setTried] = useState("");
  const [avoiding, setAvoiding] = useState("");
  const [consequence, setConsequence] = useState("");
  const [win, setWin] = useState("");
  const [expectedOutput, setExpectedOutput] = useState<PacketOutputType>("decision");
  const [outputSummary, setOutputSummary] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hydratedDraft, setHydratedDraft] = useState(false);
  const [localPackets, setLocalPackets] = useState<CallPrepPacket[]>([]);

  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const completedCount = [issue, tried, avoiding, consequence, win].filter(
    (value) => value.trim().length > 0,
  ).length;
  const selectedOutcome =
    outcomeOptions.find((outcome) => outcome.id === expectedOutput) ?? outcomeOptions[0];
  const canSave = issue.trim().length > 0 && !saving;
  const packets = useMemo(
    () =>
      [...localPackets, ...serverPackets].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [localPackets, serverPackets],
  );

  const issuePacket = [
    "Contractor Circle Call Prep",
    `Category: ${category.label}`,
    "",
    "1. What needs pressure?",
    issue.trim() || "[add issue]",
    "",
    "2. What have we already tried?",
    tried.trim() || "[add prior attempts]",
    "",
    "3. What decision are we avoiding?",
    avoiding.trim() || "[add avoided decision]",
    "",
    "4. What is the financial consequence?",
    consequence.trim() || "[add financial consequence]",
    "",
    "5. What would make this a win on the call?",
    win.trim() || "[add win condition]",
    "",
    `Intended output: ${selectedOutcome.label}`,
    outputSummary.trim() ? `Captured output: ${outputSummary.trim()}` : "",
    owner.trim() ? `Owner: ${owner.trim()}` : "",
    dueDate.trim() ? `Due date: ${dueDate.trim()}` : "",
  ]
    .filter((line, index, lines) => line || lines[index - 1] !== "")
    .join("\n");

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!savedDraft) {
      setHydratedDraft(true);
      return;
    }

    try {
      const draft = JSON.parse(savedDraft) as Partial<CallPrepDraft>;
      if (draft.categoryId && categories.some((item) => item.id === draft.categoryId)) {
        setCategoryId(draft.categoryId as CategoryId);
      }
      if (draft.issue) setIssue(draft.issue);
      if (draft.tried) setTried(draft.tried);
      if (draft.avoiding) setAvoiding(draft.avoiding);
      if (draft.consequence) setConsequence(draft.consequence);
      if (draft.win) setWin(draft.win);
      if (draft.expectedOutput && outcomeOptions.some((item) => item.id === draft.expectedOutput)) {
        setExpectedOutput(draft.expectedOutput as PacketOutputType);
      }
      if (draft.outputSummary) setOutputSummary(draft.outputSummary);
      if (draft.owner) setOwner(draft.owner);
      if (draft.dueDate) setDueDate(draft.dueDate);
    } finally {
      setHydratedDraft(true);
    }
  }, []);

  useEffect(() => {
    const savedHistory = window.localStorage.getItem(LOCAL_HISTORY_STORAGE_KEY);
    if (!savedHistory) return;

    try {
      const parsed = JSON.parse(savedHistory) as CallPrepPacket[];
      setLocalPackets(Array.isArray(parsed) ? parsed : []);
    } catch {
      setLocalPackets([]);
    }
  }, []);

  useEffect(() => {
    if (!hydratedDraft) return;

    const draft: CallPrepDraft = {
      categoryId,
      issue,
      tried,
      avoiding,
      consequence,
      win,
      expectedOutput,
      outputSummary,
      owner,
      dueDate,
    };
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [
    avoiding,
    categoryId,
    consequence,
    dueDate,
    expectedOutput,
    hydratedDraft,
    issue,
    outputSummary,
    owner,
    tried,
    win,
  ]);

  const copyIssuePacket = async () => {
    try {
      await navigator.clipboard.writeText(issuePacket);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const saveIssuePacket = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    setSaveNotice(null);
    setSaved(false);

    try {
      await savePacket({
        data: {
          category: categoryId,
          issue,
          tried,
          avoiding,
          consequence,
          win,
          expectedOutput,
          outputSummary,
          owner,
          dueDate,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["call-prep-packets"] });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch {
      const fallbackPacket = buildLocalPacket({
        categoryId,
        issue,
        tried,
        avoiding,
        consequence,
        win,
        expectedOutput,
        outputSummary,
        owner,
        dueDate,
      });
      const nextPackets = [fallbackPacket, ...localPackets].slice(0, 30);
      setLocalPackets(nextPackets);
      window.localStorage.setItem(LOCAL_HISTORY_STORAGE_KEY, JSON.stringify(nextPackets));
      setSaved(true);
      setSaveNotice(
        "Saved in this browser for launch readiness. Cloud history was unavailable, so this is not permanent sync.",
      );
      window.setTimeout(() => setSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[82rem] space-y-8 px-5 py-7 sm:px-6 sm:py-10 2xl:max-w-[88rem]">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="surface-operating relative overflow-hidden rounded-xl p-6 sm:p-8 lg:p-10">
          <div className="blueprint-fade pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber/10 blur-3xl" />

          <p className="eyebrow relative z-10 text-amber">Call prep</p>
          <h1 className="relative z-10 mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            What needs pressure before the next call?
          </h1>
          <p className="relative z-10 mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Build the issue packet before the call. Copy it into the live room or Discord. After the
            call, capture the decision, to-do, SOP gap, scorecard metric, or AOS issue and carry it
            into the operating system.
          </p>

          <div className="relative z-10 mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((item) => {
              const Icon = item.icon;
              const active = item.id === categoryId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategoryId(item.id)}
                  className={`min-h-36 rounded-lg border p-4 text-left transition-all ${
                    active
                      ? "surface-command command-panel text-background"
                      : "surface-library hover:-translate-y-0.5 hover:border-foreground/18"
                  }`}
                >
                  <Icon className="h-5 w-5 text-amber" />
                  <span className="mt-4 block font-display text-lg leading-tight">
                    {item.label}
                  </span>
                  <span
                    className={`mt-2 block text-xs leading-relaxed ${
                      active ? "text-background/65" : "text-muted-foreground"
                    }`}
                  >
                    {item.prompt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Card className="surface-command command-panel p-6">
          <p className="eyebrow relative z-10 text-amber">Packet status</p>
          <h2 className="mt-2 font-display text-2xl leading-tight">{category.label}</h2>
          <p className="mt-3 text-sm leading-relaxed text-background/68">{category.prompt}</p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-background/82">Prep strength</span>
              <Badge variant={completedCount >= 4 ? "default" : "outline"}>
                {completedCount}/5 answered
              </Badge>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-background/12">
              <div
                className="h-full bg-amber transition-all"
                style={{ width: `${(completedCount / 5) * 100}%` }}
              />
            </div>
          </div>

          <p className="mt-7 border-t border-background/10 pt-4 text-xs leading-relaxed text-background/58">
            Save the packet here, copy it into the live room, then open AOS and carry the output
            into the operating system.
          </p>
        </Card>
      </section>

      <HowThisWorks />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] xl:gap-7">
        <Card className="surface-operating p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-hairline bg-amber-soft text-amber">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow text-amber">Build the issue</p>
              <h2 className="mt-2 font-display text-2xl leading-tight">
                Make the problem specific enough to solve
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            <PrepQuestion
              step="01"
              id="issue"
              label="What needs pressure?"
              value={issue}
              onChange={setIssue}
              placeholder="Example: We keep missing billing events because PMs do not close out change-order documentation."
            />
            <PrepQuestion
              step="02"
              id="tried"
              label="What have you already tried?"
              value={tried}
              onChange={setTried}
              placeholder="List the attempts, conversations, rules, meetings, or fixes that have not held."
            />
            <PrepQuestion
              step="03"
              id="avoiding"
              label="What decision are you avoiding?"
              value={avoiding}
              onChange={setAvoiding}
              placeholder="Name the hard call: a person, process, pricing, accountability, customer, or leadership decision."
            />
            <PrepQuestion
              step="04"
              id="consequence"
              label="What is the financial consequence?"
              value={consequence}
              onChange={setConsequence}
              placeholder="Estimate the dollars, margin, cash, time, capacity, or reputation at risk."
            />
            <PrepQuestion
              step="05"
              id="win"
              label="What would make this a win on the call?"
              value={win}
              onChange={setWin}
              placeholder="Example: Leave with a clear owner, one action item, and the scorecard number we will track weekly."
            />
            <OutcomeSelector value={expectedOutput} onChange={setExpectedOutput} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="owner" className="text-sm font-medium">
                  Owner
                </Label>
                <Input
                  id="owner"
                  value={owner}
                  onChange={(event) => setOwner(event.target.value)}
                  placeholder="Who owns the next move?"
                  className="premium-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium">
                  Due date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="premium-input"
                />
              </div>
            </div>
            <PrepQuestion
              step="After"
              id="outcomeSummary"
              label="Captured call output"
              value={outputSummary}
              onChange={setOutputSummary}
              placeholder="After the call: write the decision, to-do, SOP gap, or scorecard metric that came out of the conversation."
            />
          </div>
        </Card>

        <Card className="surface-operating operating-brief h-fit p-5 sm:p-6 lg:sticky lg:top-20">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-hairline bg-foreground text-background">
              <ClipboardCheck className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Issue Packet</p>
              <h2 className="mt-2 font-display text-2xl leading-tight">Ready to pressure-test</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Portable for the live room, Discord, and AOS follow-through.
              </p>
            </div>
          </div>

          <div className="mt-5 max-h-[34rem] overflow-auto rounded-lg border border-amber/20 bg-[linear-gradient(180deg,oklch(0.998_0.004_82),oklch(0.982_0.008_82))] p-5 shadow-inner">
            <IssuePacketBrief
              category={category.label}
              issue={issue}
              tried={tried}
              avoiding={avoiding}
              consequence={consequence}
              win={win}
              output={selectedOutcome.label}
              owner={owner}
              dueDate={dueDate}
              outputSummary={outputSummary}
            />
          </div>

          <div className="mt-5 grid gap-2">
            <Button
              className="w-full justify-between"
              onClick={saveIssuePacket}
              disabled={!canSave}
            >
              {saving ? (
                <>
                  Saving <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : saved ? (
                <>
                  Packet saved <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Save issue packet <Save className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <a href={AOS_APP_URL} target="_blank" rel="noopener noreferrer">
                Open AOS <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button type="button" variant="outline" className="w-full justify-between" disabled>
              Future: Send packet to AOS <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={copyIssuePacket}>
              {copied ? "Copied" : "Copy issue packet"}
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            {saveError ? (
              <p className="text-xs leading-relaxed text-destructive">{saveError}</p>
            ) : null}
            {saveNotice ? (
              <p className="text-xs leading-relaxed text-muted-foreground">{saveNotice}</p>
            ) : null}
          </div>
        </Card>
      </section>

      <CallPrepHistory
        packets={packets}
        hasLocalFallback={packetsUnavailable || !!localPackets.length}
      />
    </div>
  );
}

function buildLocalPacket(draft: {
  categoryId: CategoryId;
  issue: string;
  tried: string;
  avoiding: string;
  consequence: string;
  win: string;
  expectedOutput: PacketOutputType;
  outputSummary: string;
  owner: string;
  dueDate: string;
}): CallPrepPacket {
  const now = new Date().toISOString();
  const answeredCount = [
    draft.issue,
    draft.tried,
    draft.avoiding,
    draft.consequence,
    draft.win,
  ].filter((value) => value.trim().length > 0).length;
  const status: CallPrepPacket["status"] = draft.outputSummary
    ? "converted"
    : answeredCount >= 5
      ? "ready"
      : "draft";

  return {
    id: `local-${Date.now()}`,
    user_id: "local-browser",
    category: draft.categoryId,
    issue: draft.issue.trim(),
    tried: draft.tried.trim() || null,
    avoiding: draft.avoiding.trim() || null,
    consequence: draft.consequence.trim() || null,
    win: draft.win.trim() || null,
    expected_output: draft.expectedOutput,
    output_summary: draft.outputSummary.trim() || null,
    owner: draft.owner.trim() || null,
    due_date: draft.dueDate.trim() || null,
    status,
    created_at: now,
    updated_at: now,
  };
}

function HowThisWorks() {
  const steps = [
    {
      title: "Prepare the issue",
      body: "Answer the pressure questions before the call.",
    },
    {
      title: "Pressure-test it",
      body: "Bring the packet into the live room or Discord.",
    },
    {
      title: "Carry the output into AOS",
      body: "Turn it into a decision, to-do, SOP gap, scorecard metric, or issue.",
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => (
        <div key={step.title} className="surface-library rounded-lg p-5">
          <p className="eyebrow text-amber">{String(index + 1).padStart(2, "0")}</p>
          <h2 className="mt-3 font-display text-xl leading-tight">{step.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
        </div>
      ))}
    </section>
  );
}

function CallPrepHistory({
  packets,
  hasLocalFallback,
}: {
  packets: CallPrepPacket[];
  hasLocalFallback: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="max-w-2xl">
        <p className="eyebrow text-amber">Call prep history</p>
        <h2 className="mt-2 font-display text-2xl leading-tight">Make the pressure cumulative</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Saved packets stay in Contractor Circle so the pressure does not disappear after the call.
          Copy them into the live room now; open AOS and place the final decision where the company
          will keep operating from it.
        </p>
        {hasLocalFallback ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Browser-saved packets are a launch fallback only and are not labeled as permanent cloud
            sync.
          </p>
        ) : null}
      </div>

      {packets.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {packets.slice(0, 4).map((packet) => (
            <div key={packet.id} className="surface-operating operating-brief rounded-lg p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge variant={packet.status === "converted" ? "default" : "outline"}>
                  {statusLabels[packet.status]}
                </Badge>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {outputLabels[packet.expected_output]}
                </span>
              </div>
              <h3 className="mt-4 line-clamp-3 font-display text-xl leading-tight">
                {packet.issue}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {formatCategory(packet.category)}
                {packet.owner ? ` / Owner: ${packet.owner}` : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <Card className="surface-operating operating-brief p-6">
          <h3 className="font-display text-2xl">No saved packets yet</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Saved packets stay in Contractor Circle so the pressure does not disappear after the
            call.
          </p>
        </Card>
      )}
    </section>
  );
}

function OutcomeSelector({
  value,
  onChange,
}: {
  value: PacketOutputType;
  onChange: (value: PacketOutputType) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">What should this become?</Label>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {outcomeOptions.map((outcome) => {
          const active = outcome.id === value;

          return (
            <button
              key={outcome.id}
              type="button"
              onClick={() => onChange(outcome.id)}
              className={`min-h-28 rounded-lg border p-3 text-left transition-all ${
                active
                  ? "surface-command command-panel text-background"
                  : "surface-library hover:-translate-y-0.5 hover:border-foreground/18"
              }`}
            >
              <span className="block font-display text-lg leading-tight">{outcome.label}</span>
              <span
                className={`mt-2 block text-xs leading-relaxed ${
                  active ? "text-background/65" : "text-muted-foreground"
                }`}
              >
                {outcome.helper}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IssuePacketBrief({
  category,
  issue,
  tried,
  avoiding,
  consequence,
  win,
  output,
  owner,
  dueDate,
  outputSummary,
}: {
  category: string;
  issue: string;
  tried: string;
  avoiding: string;
  consequence: string;
  win: string;
  output: string;
  owner: string;
  dueDate: string;
  outputSummary: string;
}) {
  const fields = [
    { label: "Category", value: category },
    { label: "What needs pressure", value: issue || "[add issue]" },
    { label: "What we already tried", value: tried || "[add prior attempts]" },
    { label: "Decision we are avoiding", value: avoiding || "[add avoided decision]" },
    { label: "Financial consequence", value: consequence || "[add financial consequence]" },
    { label: "What would make this a win", value: win || "[add win condition]" },
    { label: "Intended output", value: output },
    { label: "Owner", value: owner || "Unassigned" },
    { label: "Due date", value: dueDate || "Not set" },
  ];

  return (
    <div>
      <div className="border-b border-hairline pb-4">
        <p className="eyebrow text-amber">Issue Packet</p>
        <h3 className="mt-2 font-display text-2xl leading-tight">Ready to pressure-test</h3>
      </div>
      <div className="mt-1">
        {fields.map((field) => (
          <div key={field.label} className="brief-row">
            <p className="eyebrow text-muted-foreground">{field.label}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {field.value}
            </p>
          </div>
        ))}
        {outputSummary ? (
          <div className="brief-row">
            <p className="eyebrow text-muted-foreground">Captured call output</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {outputSummary}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatCategory(category: CallPrepPacket["category"]) {
  return {
    leadership: "Leadership/System",
    people: "People",
    cash: "Cash/Billing",
    sales: "Sales/Estimating",
    production: "Production",
  }[category];
}

function PrepQuestion({
  step,
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  step: string;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="call-prep-question space-y-2">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-amber">{step}</span>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="premium-input min-h-28 resize-y"
      />
    </div>
  );
}
