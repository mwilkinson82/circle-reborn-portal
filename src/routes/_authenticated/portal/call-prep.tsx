import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
  converted: "Converted",
};

function CallPrepPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const savePacket = useServerFn(createCallPrepPacket);
  const fetchPackets = useServerFn(getCallPrepPackets);
  const { data: packets = [] } = useQuery({
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
  const [saving, setSaving] = useState(false);
  const [hydratedDraft, setHydratedDraft] = useState(false);

  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const completedCount = [issue, tried, avoiding, consequence, win].filter(
    (value) => value.trim().length > 0,
  ).length;
  const selectedOutcome =
    outcomeOptions.find((outcome) => outcome.id === expectedOutput) ?? outcomeOptions[0];
  const canSave = issue.trim().length > 0 && !saving;

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
    `Likely output: ${selectedOutcome.label}`,
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
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save this issue packet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[82rem] space-y-8 px-5 py-7 sm:px-6 sm:py-10 2xl:max-w-[88rem]">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="relative overflow-hidden border border-hairline bg-background p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 border-l border-hairline bg-[linear-gradient(180deg,rgba(210,122,38,0.08),transparent_42%,rgba(210,122,38,0.06))]" />

          <p className="font-mono text-xs uppercase tracking-wider text-amber">Call prep</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            What needs pressure before the next call?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Bring one stuck decision into the open. A good Contractor Circle issue should turn into
            a decision, to-do, SOP gap, scorecard metric, or AOS issue.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {categories.map((item) => {
              const Icon = item.icon;
              const active = item.id === categoryId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategoryId(item.id)}
                  className={`min-h-32 border p-4 text-left transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-hairline bg-background hover:bg-secondary"
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

        <Card className="border-hairline p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Issue packet
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight">{category.label}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{category.prompt}</p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Prep strength</span>
              <Badge variant={completedCount >= 4 ? "default" : "outline"}>
                {completedCount}/5 answered
              </Badge>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-amber transition-all"
                style={{ width: `${(completedCount / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <Button className="w-full" onClick={saveIssuePacket} disabled={!canSave}>
              {saving ? (
                <>
                  Saving <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : saved ? (
                <>
                  Packet saved <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Save issue packet <Save className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/portal/alp-os">
                Open AOS <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button type="button" variant="outline" className="w-full" disabled>
              Future: Send to AOS <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full" onClick={copyIssuePacket}>
              {copied ? (
                <>
                  Copied <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Copy issue packet <Copy className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            {saveError ? (
              <p className="text-xs leading-relaxed text-destructive">{saveError}</p>
            ) : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="border-hairline p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-hairline bg-secondary text-amber">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-amber">
                Build the issue
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight">
                Make the problem specific enough to solve
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <PrepQuestion
              id="issue"
              label="What needs pressure?"
              value={issue}
              onChange={setIssue}
              placeholder="Example: We keep missing billing events because PMs do not close out change-order documentation."
            />
            <PrepQuestion
              id="tried"
              label="What have you already tried?"
              value={tried}
              onChange={setTried}
              placeholder="List the attempts, conversations, rules, meetings, or fixes that have not held."
            />
            <PrepQuestion
              id="avoiding"
              label="What decision are you avoiding?"
              value={avoiding}
              onChange={setAvoiding}
              placeholder="Name the hard call: a person, process, pricing, accountability, customer, or leadership decision."
            />
            <PrepQuestion
              id="consequence"
              label="What is the financial consequence?"
              value={consequence}
              onChange={setConsequence}
              placeholder="Estimate the dollars, margin, cash, time, capacity, or reputation at risk."
            />
            <PrepQuestion
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
                />
              </div>
            </div>
            <PrepQuestion
              id="outcomeSummary"
              label="Captured call output"
              value={outputSummary}
              onChange={setOutputSummary}
              placeholder="After the call: write the decision, to-do, SOP gap, or scorecard metric that came out of the conversation."
            />
          </div>
        </Card>

        <Card className="border-hairline p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-hairline bg-foreground text-background">
              <ClipboardCheck className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Issue packet
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight">Ready to pressure-test</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Built for AOS or the live room.
              </p>
            </div>
          </div>

          <pre className="mt-5 max-h-[34rem] overflow-auto whitespace-pre-wrap border border-hairline bg-secondary p-4 font-sans text-sm leading-relaxed text-muted-foreground">
            {issuePacket}
          </pre>
        </Card>
      </section>

      <CallPrepHistory packets={packets} />
    </div>
  );
}

function CallPrepHistory({ packets }: { packets: CallPrepPacket[] }) {
  return (
    <section className="space-y-4">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Call prep history</p>
        <h2 className="mt-2 font-display text-2xl leading-tight">Make the pressure cumulative</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Saved packets stay in Contractor Circle for follow-through. Copy them into the live room
          now; move them into AOS when the external integration is ready.
        </p>
      </div>

      {packets.length ? (
        <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-2 xl:grid-cols-4">
          {packets.slice(0, 4).map((packet) => (
            <div key={packet.id} className="bg-background p-5">
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
        <Card className="border-hairline p-6">
          <h3 className="font-display text-2xl">No saved packets yet</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Build one strong issue before the next call. The saved history will appear here.
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
      <Label className="text-sm font-medium">Likely output</Label>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {outcomeOptions.map((outcome) => {
          const active = outcome.id === value;

          return (
            <button
              key={outcome.id}
              type="button"
              onClick={() => onChange(outcome.id)}
              className={`min-h-28 border p-3 text-left transition-colors ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-hairline bg-background hover:bg-secondary"
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
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-24 resize-y"
      />
    </div>
  );
}
