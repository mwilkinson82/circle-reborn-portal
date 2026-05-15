import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileWarning,
  Gauge,
  Landmark,
  LockKeyhole,
  Network,
  Route as RouteIcon,
  ShieldAlert,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/portal/command-tools")({
  head: () => ({ meta: [{ title: "Business Command Tools - Contractor Circle" }] }),
  component: CommandToolsPage,
});

type ScoreKey =
  | "sales"
  | "estimating"
  | "clientDecisions"
  | "projectLaunch"
  | "pmOversight"
  | "changeOrders"
  | "billing"
  | "collections"
  | "hiring"
  | "financialControls"
  | "projectLeadership"
  | "process";

type DependencyArea = {
  key: ScoreKey;
  label: string;
  system: string;
  aos: string;
};

type ActiveToolKey =
  | "owner"
  | "capacity"
  | "systems"
  | "cash"
  | "pipeline"
  | "changes"
  | "decision";

type CommandTool = {
  key: ActiveToolKey | "contracts";
  title: string;
  shortTitle: string;
  promise: string;
  status: "Available" | "Coming next";
  output: string;
  aos: string;
  icon: LucideIcon;
};

type CapacityState = {
  revenueTarget: number;
  averageProject: number;
  averageDurationMonths: number;
  pmCount: number;
  projectsPerPm: number;
  bidHitRate: number;
};

type CashState = {
  cashOnHand: number;
  monthlyOverhead: number;
  arOver60: number;
  unbilledChanges: number;
  monthlyBilling: number;
  billingLagDays: number;
};

type PipelineState = {
  monthlyLeads: number;
  qualifiedPercent: number;
  bidPercent: number;
  hitRate: number;
  averageProject: number;
  monthlyRevenueTarget: number;
};

type ChangeOrderState = {
  activeJobs: number;
  averageFieldChange: number;
  documentedPercent: number;
  submittedPercent: number;
  approvedPercent: number;
  billedPercent: number;
};

type SystemKey =
  | "salesProcess"
  | "estimatingHandoff"
  | "projectLaunch"
  | "weeklyScorecard"
  | "billingCadence"
  | "changeOrderSop"
  | "recruiting"
  | "closeout";

type SystemArea = {
  key: SystemKey;
  label: string;
  ownerSeat: string;
  aos: string;
  install: string;
};

type DecisionState = {
  topic: string;
  decision: string;
  owner: string;
  dueDate: string;
  metric: string;
  issue: string;
};

const STORAGE_KEY = "circle-owner-dependency-scorecard";
const SYSTEM_STORAGE_KEY = "circle-system-gap-finder";

const dependencyAreas: DependencyArea[] = [
  { key: "sales", label: "Sales", system: "sales qualification rhythm", aos: "Process" },
  { key: "estimating", label: "Estimating", system: "estimating handoff", aos: "Process" },
  {
    key: "clientDecisions",
    label: "Client decisions",
    system: "decision-control process",
    aos: "Issues",
  },
  { key: "projectLaunch", label: "Project launch", system: "project launch SOP", aos: "Process" },
  { key: "pmOversight", label: "PM oversight", system: "PM accountability rhythm", aos: "People" },
  { key: "changeOrders", label: "Change orders", system: "change order SOP", aos: "Numbers" },
  { key: "billing", label: "Billing", system: "billing cadence", aos: "Numbers" },
  { key: "collections", label: "Collections", system: "A/R follow-up rhythm", aos: "Numbers" },
  { key: "hiring", label: "Hiring", system: "hiring scorecard", aos: "People" },
  {
    key: "financialControls",
    label: "Financial controls",
    system: "weekly financial scorecard",
    aos: "Numbers",
  },
  {
    key: "projectLeadership",
    label: "Project leadership",
    system: "leadership seat clarity",
    aos: "Traction",
  },
  { key: "process", label: "SOPs/process", system: "core process map", aos: "Process" },
];

const systemAreas: SystemArea[] = [
  {
    key: "salesProcess",
    label: "Sales qualification",
    ownerSeat: "Sales / Visionary",
    aos: "Process",
    install: "Define fit, disqualifiers, follow-up cadence, and next-step ownership.",
  },
  {
    key: "estimatingHandoff",
    label: "Estimating handoff",
    ownerSeat: "Estimator / Ops",
    aos: "Process",
    install: "Standardize bid assumptions, exclusions, risk flags, and project-launch handoff.",
  },
  {
    key: "projectLaunch",
    label: "Project launch",
    ownerSeat: "Operations",
    aos: "Traction",
    install: "Create a launch checklist for contract, budget, schedule, subs, and client controls.",
  },
  {
    key: "weeklyScorecard",
    label: "Weekly scorecard",
    ownerSeat: "Leadership",
    aos: "Numbers",
    install: "Track 5-15 leading indicators with one owner and weekly red/yellow/green status.",
  },
  {
    key: "billingCadence",
    label: "Billing cadence",
    ownerSeat: "Finance",
    aos: "Numbers",
    install: "Lock a weekly billing, A/R, and cost-to-complete rhythm.",
  },
  {
    key: "changeOrderSop",
    label: "Change order SOP",
    ownerSeat: "PM / Finance",
    aos: "Issues",
    install: "Document, price, submit, approve, and bill changes with clear stage ownership.",
  },
  {
    key: "recruiting",
    label: "Hiring scorecard",
    ownerSeat: "People",
    aos: "People",
    install: "Define seat outcomes, scorecards, interview checks, and 30/60/90 expectations.",
  },
  {
    key: "closeout",
    label: "Closeout",
    ownerSeat: "Operations",
    aos: "Process",
    install: "Standardize punch, retainage, warranty, final billing, and lessons learned.",
  },
];

const commandTools: CommandTool[] = [
  {
    key: "owner",
    title: "Owner Dependency Scorecard",
    shortTitle: "Owner",
    promise: "Find where the business still depends on the owner.",
    status: "Available",
    output: "Owner dependency score, top bottlenecks, first system to install.",
    aos: "People, Process, Traction",
    icon: Network,
  },
  {
    key: "capacity",
    title: "Capacity Map",
    shortTitle: "Capacity",
    promise: "See what revenue the company can actually carry.",
    status: "Available",
    output: "Billing capacity, active project requirement, lead requirement, PM capacity gap.",
    aos: "Vision, Numbers, Rocks",
    icon: Gauge,
  },
  {
    key: "systems",
    title: "System Gap Finder",
    shortTitle: "Systems",
    promise: "Identify which systems are missing first.",
    status: "Available",
    output: "Priority SOP gaps, owner seat, template recommendation, install sequence.",
    aos: "Process, Issues",
    icon: Workflow,
  },
  {
    key: "cash",
    title: "Cash Control Snapshot",
    shortTitle: "Cash",
    promise: "See where cash is leaking before the P&L tells you.",
    status: "Available",
    output: "Cash risk, billing rhythm issue, A/R pressure, change order leakage.",
    aos: "Numbers, Issues",
    icon: Landmark,
  },
  {
    key: "pipeline",
    title: "Pipeline Pressure Test",
    shortTitle: "Pipeline",
    promise: "Find whether the constraint is demand, qualification, estimating, or close rate.",
    status: "Available",
    output: "Pipeline constraint, sales system, template and replay recommendation.",
    aos: "Numbers, Process",
    icon: BarChart3,
  },
  {
    key: "changes",
    title: "Change Order Leak Finder",
    shortTitle: "Changes",
    promise: "Find money trapped in undocumented, unapproved, or unbilled changes.",
    status: "Available",
    output: "Leakage estimate, next action list, SOP gap, scorecard metric.",
    aos: "Issues, Numbers, Process",
    icon: FileWarning,
  },
  {
    key: "decision",
    title: "Decision-to-Action",
    shortTitle: "Decision",
    promise: "Turn discussion into an action packet.",
    status: "Available",
    output: "Decision, owner, due date, scorecard metric, issue, and next action.",
    aos: "Issues, To-Dos, Traction",
    icon: RouteIcon,
  },
  {
    key: "contracts",
    title: "Contract Risk Scan",
    shortTitle: "Contracts",
    promise: "Find process gaps exposing the business before legal review.",
    status: "Coming next",
    output: "Contract intake checklist and risk prompt. Not a legal opinion.",
    aos: "Process, Issues",
    icon: ShieldAlert,
  },
];

function defaultScores() {
  return dependencyAreas.reduce(
    (acc, area) => ({ ...acc, [area.key]: 3 }),
    {} as Record<ScoreKey, number>,
  );
}

function defaultSystemScores() {
  return systemAreas.reduce(
    (acc, area) => ({ ...acc, [area.key]: 3 }),
    {} as Record<SystemKey, number>,
  );
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function whole(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0,
  );
}

function percent(value: number) {
  return `${Math.round(Number.isFinite(value) ? value : 0)}%`;
}

function positive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function boundedScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function CommandToolsPage() {
  const [activeTool, setActiveTool] = useState<ActiveToolKey>("owner");
  const [scores, setScores] = useState<Record<ScoreKey, number>>(defaultScores);
  const [systemScores, setSystemScores] = useState<Record<SystemKey, number>>(defaultSystemScores);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setScores({ ...defaultScores(), ...JSON.parse(raw) });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(SYSTEM_STORAGE_KEY);
    if (!raw) return;
    try {
      setSystemScores({ ...defaultSystemScores(), ...JSON.parse(raw) });
    } catch {
      window.localStorage.removeItem(SYSTEM_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    window.localStorage.setItem(SYSTEM_STORAGE_KEY, JSON.stringify(systemScores));
  }, [systemScores]);

  const ownerResult = useMemo(() => buildOwnerResult(scores), [scores]);
  const systemResult = useMemo(() => buildSystemResult(systemScores), [systemScores]);

  return (
    <div className="container-prose space-y-8 py-8 sm:py-10">
      <section className="surface-command command-panel overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <p className="eyebrow text-amber">Owner command center</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
              Business Command Tools
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/70">
              Practical owner tools for the business problems behind the projects. Diagnose the
              constraint, choose the next system, and carry the output into AOS or Bring One Issue.
            </p>
          </div>
          <div className="border border-background/12 bg-background/[0.05] p-5">
            <p className="eyebrow text-amber">Operating rule</p>
            <p className="mt-3 font-display text-2xl leading-tight">
              Turn pressure into a decision.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-background/62">
              These are diagnostic tools. They are not a CRM, accounting system, legal platform, or
              project-management app. Use the output to decide what system gets installed next.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {commandTools.map((tool) => (
          <ToolCard
            key={tool.title}
            tool={tool}
            isActive={tool.key === activeTool}
            onOpen={() => {
              if (tool.status === "Available" && tool.key !== "contracts") {
                setActiveTool(tool.key);
                window.requestAnimationFrame(() => {
                  document.getElementById("command-workbench")?.scrollIntoView({ block: "start" });
                });
              }
            }}
          />
        ))}
      </section>

      <section id="command-workbench" className="scroll-mt-20">
        <Tabs value={activeTool} onValueChange={(value) => setActiveTool(value as ActiveToolKey)}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-md border border-hairline bg-elevated p-1 sm:grid-cols-3 lg:grid-cols-7">
            {commandTools
              .filter(
                (tool): tool is CommandTool & { key: ActiveToolKey } => tool.key !== "contracts",
              )
              .map((tool) => (
                <TabsTrigger
                  key={tool.key}
                  value={tool.key}
                  className="min-h-10 whitespace-normal rounded-sm px-2 text-xs leading-tight"
                >
                  {tool.shortTitle}
                </TabsTrigger>
              ))}
          </TabsList>

          <TabsContent value="owner" className="mt-6">
            <OwnerDependencyTool scores={scores} setScores={setScores} result={ownerResult} />
          </TabsContent>
          <TabsContent value="capacity" className="mt-6">
            <CapacityMapTool />
          </TabsContent>
          <TabsContent value="systems" className="mt-6">
            <SystemGapTool
              scores={systemScores}
              setScores={setSystemScores}
              result={systemResult}
            />
          </TabsContent>
          <TabsContent value="cash" className="mt-6">
            <CashControlTool />
          </TabsContent>
          <TabsContent value="pipeline" className="mt-6">
            <PipelinePressureTool />
          </TabsContent>
          <TabsContent value="changes" className="mt-6">
            <ChangeOrderLeakTool />
          </TabsContent>
          <TabsContent value="decision" className="mt-6">
            <DecisionActionTool />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function ToolCard({
  tool,
  isActive,
  onOpen,
}: {
  tool: CommandTool;
  isActive: boolean;
  onOpen: () => void;
}) {
  return (
    <Card
      className={`surface-library flex min-h-72 flex-col justify-between p-5 ${
        isActive ? "border-amber/50 bg-amber-soft/20" : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <tool.icon className="h-5 w-5 text-amber" />
          <Badge variant={tool.status === "Available" ? "default" : "outline"}>{tool.status}</Badge>
        </div>
        <h2 className="mt-5 font-display text-2xl leading-tight">{tool.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.promise}</p>
        <div className="mt-5 space-y-3 border-t border-hairline pt-4 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Output:</span> {tool.output}
          </p>
          <p>
            <span className="font-semibold text-foreground">Related AOS:</span> {tool.aos}
          </p>
        </div>
      </div>
      <Button
        variant={tool.status === "Available" ? "default" : "outline"}
        disabled={tool.status !== "Available"}
        className="mt-6 w-full justify-between"
        onClick={onOpen}
      >
        {tool.status === "Available" ? (
          <>
            Open <ArrowUpRight className="h-4 w-4" />
          </>
        ) : (
          <>
            Coming next <LockKeyhole className="h-4 w-4" />
          </>
        )}
      </Button>
    </Card>
  );
}

function buildOwnerResult(scores: Record<ScoreKey, number>) {
  const total = dependencyAreas.reduce((sum, area) => sum + scores[area.key], 0);
  const average = total / dependencyAreas.length;
  const sorted = [...dependencyAreas].sort((a, b) => scores[b.key] - scores[a.key]);
  const top = sorted.slice(0, 3);
  const primary = top[0];
  const severity = average >= 4 ? "High" : average >= 3 ? "Moderate" : "Controlled";

  return {
    average,
    score: Math.round(average * 20),
    top,
    primary,
    severity,
  };
}

function OwnerDependencyTool({
  scores,
  setScores,
  result,
}: {
  scores: Record<ScoreKey, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<ScoreKey, number>>>;
  result: ReturnType<typeof buildOwnerResult>;
}) {
  return (
    <ToolWorkbench
      eyebrow="Available now"
      title="Owner Dependency Scorecard"
      body="Score each area from 1 to 5. A 1 means delegated and systemized. A 5 means the business still depends heavily on the owner."
      input={
        <div className="grid gap-3">
          {dependencyAreas.map((area) => (
            <ScoreRow
              key={area.key}
              label={area.label}
              detail={`First system: ${area.system}. Related AOS: ${area.aos}.`}
              value={scores[area.key]}
              highLabel="Owner-dependent"
              onChange={(value) => setScores((current) => ({ ...current, [area.key]: value }))}
            />
          ))}
        </div>
      }
      output={
        <ResultPanel
          eyebrow="Scorecard output"
          title={`${result.score}/100`}
          subtitle={`${result.severity} owner dependency`}
          progress={result.score}
          details={result.top.map((area, index) => ({
            label: `Bottleneck ${index + 1}`,
            value: area.label,
            detail: `Install the ${area.system}. Related AOS area: ${area.aos}.`,
          }))}
          nextTitle={`Start with ${result.primary.system}.`}
          nextBody="Bring one issue to the next Circle session, open AOS, and turn the output into a decision, to-do, SOP gap, scorecard metric, or issue."
        />
      }
    />
  );
}

function CapacityMapTool() {
  const [state, setState] = useState<CapacityState>({
    revenueTarget: 12_000_000,
    averageProject: 750_000,
    averageDurationMonths: 5,
    pmCount: 2,
    projectsPerPm: 4,
    bidHitRate: 25,
  });

  const result = useMemo(() => {
    const projectsPerYear = positive(state.revenueTarget / state.averageProject);
    const activeProjectsRequired = projectsPerYear * (state.averageDurationMonths / 12);
    const pmCapacity = state.pmCount * state.projectsPerPm;
    const pmGap = activeProjectsRequired - pmCapacity;
    const qualifiedBidsRequired = projectsPerYear / Math.max(state.bidHitRate / 100, 0.01);
    const capacityScore = boundedScore((pmCapacity / Math.max(activeProjectsRequired, 1)) * 100);
    const constraint =
      pmGap > 1
        ? "Project management capacity"
        : state.bidHitRate < 25
          ? "Bid conversion"
          : "Throughput is workable";

    return {
      projectsPerYear,
      activeProjectsRequired,
      pmCapacity,
      pmGap,
      qualifiedBidsRequired,
      capacityScore,
      constraint,
    };
  }, [state]);

  return (
    <ToolWorkbench
      eyebrow="Capacity map"
      title="Can the company carry the target?"
      body="Map the revenue target to project count, active workload, PM capacity, and qualified bid demand."
      input={
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Annual revenue target"
            value={state.revenueTarget}
            prefix="$"
            onChange={(value) => setState((current) => ({ ...current, revenueTarget: value }))}
          />
          <NumberField
            label="Average project value"
            value={state.averageProject}
            prefix="$"
            onChange={(value) => setState((current) => ({ ...current, averageProject: value }))}
          />
          <NumberField
            label="Average project duration"
            value={state.averageDurationMonths}
            suffix="mo"
            onChange={(value) =>
              setState((current) => ({ ...current, averageDurationMonths: value }))
            }
          />
          <NumberField
            label="PM count"
            value={state.pmCount}
            onChange={(value) => setState((current) => ({ ...current, pmCount: value }))}
          />
          <NumberField
            label="Active jobs each PM can run"
            value={state.projectsPerPm}
            onChange={(value) => setState((current) => ({ ...current, projectsPerPm: value }))}
          />
          <NumberField
            label="Bid hit rate"
            value={state.bidHitRate}
            suffix="%"
            onChange={(value) => setState((current) => ({ ...current, bidHitRate: value }))}
          />
        </div>
      }
      output={
        <ResultPanel
          eyebrow="Capacity output"
          title={percent(result.capacityScore)}
          subtitle={result.constraint}
          progress={result.capacityScore}
          details={[
            {
              label: "Projects needed / year",
              value: whole(result.projectsPerYear),
              detail: `${money(state.revenueTarget)} target at ${money(state.averageProject)} average project value.`,
            },
            {
              label: "Active projects required",
              value: whole(result.activeProjectsRequired),
              detail: `${state.averageDurationMonths} month average duration creates this active load.`,
            },
            {
              label: "PM capacity gap",
              value: result.pmGap > 0 ? `${whole(result.pmGap)} jobs short` : "Covered",
              detail: `${whole(result.pmCapacity)} active jobs can be carried by current PM capacity.`,
            },
            {
              label: "Qualified bids required",
              value: whole(result.qualifiedBidsRequired),
              detail: "Annual qualified bids needed at the current hit rate.",
            },
          ]}
          nextTitle={
            result.pmGap > 0 ? "Install a PM capacity plan." : "Tighten the sales target rhythm."
          }
          nextBody="Use this output to set a rock for staffing, bid volume, or PM-system installation."
        />
      }
    />
  );
}

function SystemGapTool({
  scores,
  setScores,
  result,
}: {
  scores: Record<SystemKey, number>;
  setScores: React.Dispatch<React.SetStateAction<Record<SystemKey, number>>>;
  result: ReturnType<typeof buildSystemResult>;
}) {
  return (
    <ToolWorkbench
      eyebrow="System gap finder"
      title="Which system gets installed first?"
      body="Score each system from 1 to 5. A 1 means missing. A 5 means documented, owned, used, and measured."
      input={
        <div className="grid gap-3">
          {systemAreas.map((area) => (
            <ScoreRow
              key={area.key}
              label={area.label}
              detail={`${area.ownerSeat}. ${area.install}`}
              value={scores[area.key]}
              highLabel="Installed"
              onChange={(value) => setScores((current) => ({ ...current, [area.key]: value }))}
            />
          ))}
        </div>
      }
      output={
        <ResultPanel
          eyebrow="Install sequence"
          title={result.scoreLabel}
          subtitle={`${result.lowest.label} is the first gap`}
          progress={result.systemScore}
          details={result.gaps.map((area, index) => ({
            label: `Gap ${index + 1}`,
            value: area.label,
            detail: `${area.install} Related AOS: ${area.aos}.`,
          }))}
          nextTitle={`Install ${result.lowest.label}.`}
          nextBody={`Owner seat: ${result.lowest.ownerSeat}. Use the output as a Bring One Issue packet or a 90-day rock.`}
        />
      }
    />
  );
}

function buildSystemResult(scores: Record<SystemKey, number>) {
  const sorted = [...systemAreas].sort((a, b) => scores[a.key] - scores[b.key]);
  const gaps = sorted.slice(0, 3);
  const lowest = gaps[0];
  const total = systemAreas.reduce((sum, area) => sum + scores[area.key], 0);
  const average = total / systemAreas.length;
  const systemScore = boundedScore(average * 20);
  const scoreLabel =
    average >= 4 ? "Strong system base" : average >= 3 ? "Mixed system base" : "System drag";

  return { gaps, lowest, systemScore, scoreLabel };
}

function CashControlTool() {
  const [state, setState] = useState<CashState>({
    cashOnHand: 350_000,
    monthlyOverhead: 150_000,
    arOver60: 120_000,
    unbilledChanges: 80_000,
    monthlyBilling: 600_000,
    billingLagDays: 18,
  });

  const result = useMemo(() => {
    const runwayMonths = positive(state.cashOnHand / Math.max(state.monthlyOverhead, 1));
    const arPressure = positive(state.arOver60 / Math.max(state.monthlyBilling, 1));
    const changePressure = positive(state.unbilledChanges / Math.max(state.monthlyBilling, 1));
    const lagPressure = positive(state.billingLagDays / 30);
    const riskScore = boundedScore(
      100 -
        Math.min(35, runwayMonths * 12) +
        Math.min(25, arPressure * 80) +
        Math.min(20, changePressure * 100) +
        Math.min(20, lagPressure * 20),
    );
    const constraint =
      runwayMonths < 2
        ? "Cash runway"
        : arPressure > 0.18
          ? "A/R over 60"
          : changePressure > 0.1
            ? "Unbilled changes"
            : "Billing cadence";

    return { runwayMonths, arPressure, changePressure, riskScore, constraint };
  }, [state]);

  return (
    <ToolWorkbench
      eyebrow="Cash control"
      title="Where is cash pressure building?"
      body="Use rough numbers. This is a control snapshot, not accounting."
      input={
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Cash on hand"
            value={state.cashOnHand}
            prefix="$"
            onChange={(value) => setState((current) => ({ ...current, cashOnHand: value }))}
          />
          <NumberField
            label="Monthly overhead"
            value={state.monthlyOverhead}
            prefix="$"
            onChange={(value) => setState((current) => ({ ...current, monthlyOverhead: value }))}
          />
          <NumberField
            label="A/R over 60 days"
            value={state.arOver60}
            prefix="$"
            onChange={(value) => setState((current) => ({ ...current, arOver60: value }))}
          />
          <NumberField
            label="Unbilled change orders"
            value={state.unbilledChanges}
            prefix="$"
            onChange={(value) => setState((current) => ({ ...current, unbilledChanges: value }))}
          />
          <NumberField
            label="Average monthly billing"
            value={state.monthlyBilling}
            prefix="$"
            onChange={(value) => setState((current) => ({ ...current, monthlyBilling: value }))}
          />
          <NumberField
            label="Average billing lag"
            value={state.billingLagDays}
            suffix="days"
            onChange={(value) => setState((current) => ({ ...current, billingLagDays: value }))}
          />
        </div>
      }
      output={
        <ResultPanel
          eyebrow="Cash output"
          title={`${result.riskScore}/100`}
          subtitle={`${result.constraint} is the pressure point`}
          progress={result.riskScore}
          details={[
            {
              label: "Cash runway",
              value: `${result.runwayMonths.toFixed(1)} months`,
              detail: `${money(state.cashOnHand)} cash divided by ${money(state.monthlyOverhead)} monthly overhead.`,
            },
            {
              label: "A/R over 60 pressure",
              value: percent(result.arPressure * 100),
              detail: "Percent of one month of billing tied up past 60 days.",
            },
            {
              label: "Change order pressure",
              value: percent(result.changePressure * 100),
              detail: "Unbilled changes as a percent of monthly billing.",
            },
          ]}
          nextTitle="Install a weekly cash-control meeting."
          nextBody="Track cash, A/R over 60, unbilled changes, billings sent, and collections every week."
        />
      }
    />
  );
}

function PipelinePressureTool() {
  const [state, setState] = useState<PipelineState>({
    monthlyLeads: 24,
    qualifiedPercent: 45,
    bidPercent: 65,
    hitRate: 25,
    averageProject: 600_000,
    monthlyRevenueTarget: 1_000_000,
  });

  const result = useMemo(() => {
    const qualified = state.monthlyLeads * (state.qualifiedPercent / 100);
    const bids = qualified * (state.bidPercent / 100);
    const wins = bids * (state.hitRate / 100);
    const expectedRevenue = wins * state.averageProject;
    const revenueScore = boundedScore(
      (expectedRevenue / Math.max(state.monthlyRevenueTarget, 1)) * 100,
    );
    const constraints = [
      {
        label: "Demand",
        value: state.monthlyLeads / 30,
        action: "Increase lead volume or referral activity.",
      },
      {
        label: "Qualification",
        value: state.qualifiedPercent / 50,
        action: "Tighten fit criteria and disqualifiers.",
      },
      {
        label: "Estimating throughput",
        value: state.bidPercent / 70,
        action: "Clean handoff and bid/no-bid rules.",
      },
      {
        label: "Close rate",
        value: state.hitRate / 30,
        action: "Improve follow-up, sales control, and objection handling.",
      },
    ].sort((a, b) => a.value - b.value);
    const constraint = constraints[0];

    return { qualified, bids, wins, expectedRevenue, revenueScore, constraint };
  }, [state]);

  return (
    <ToolWorkbench
      eyebrow="Pipeline pressure"
      title="What is holding back sales?"
      body="Trace leads through qualification, bids, wins, and expected monthly booked revenue."
      input={
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Monthly leads"
            value={state.monthlyLeads}
            onChange={(value) => setState((current) => ({ ...current, monthlyLeads: value }))}
          />
          <NumberField
            label="Qualified"
            value={state.qualifiedPercent}
            suffix="%"
            onChange={(value) => setState((current) => ({ ...current, qualifiedPercent: value }))}
          />
          <NumberField
            label="Qualified leads that become bids"
            value={state.bidPercent}
            suffix="%"
            onChange={(value) => setState((current) => ({ ...current, bidPercent: value }))}
          />
          <NumberField
            label="Bid hit rate"
            value={state.hitRate}
            suffix="%"
            onChange={(value) => setState((current) => ({ ...current, hitRate: value }))}
          />
          <NumberField
            label="Average project value"
            value={state.averageProject}
            prefix="$"
            onChange={(value) => setState((current) => ({ ...current, averageProject: value }))}
          />
          <NumberField
            label="Monthly booked revenue target"
            value={state.monthlyRevenueTarget}
            prefix="$"
            onChange={(value) =>
              setState((current) => ({ ...current, monthlyRevenueTarget: value }))
            }
          />
        </div>
      }
      output={
        <ResultPanel
          eyebrow="Pipeline output"
          title={money(result.expectedRevenue)}
          subtitle={`${result.constraint.label} is the current constraint`}
          progress={result.revenueScore}
          details={[
            {
              label: "Qualified leads",
              value: whole(result.qualified),
              detail: "Leads that fit the target profile.",
            },
            {
              label: "Bids produced",
              value: whole(result.bids),
              detail: "Qualified leads that reach proposal.",
            },
            {
              label: "Expected wins",
              value: result.wins.toFixed(1),
              detail: "Expected monthly wins at current close rate.",
            },
            {
              label: "Constraint action",
              value: result.constraint.action,
              detail: "Use this as the sales-process improvement.",
            },
          ]}
          nextTitle="Turn the constraint into a sales rock."
          nextBody="Pair this with Follow-Up Email Scripts, Objection Reframing, and the sales replay library."
        />
      }
    />
  );
}

function ChangeOrderLeakTool() {
  const [state, setState] = useState<ChangeOrderState>({
    activeJobs: 6,
    averageFieldChange: 30_000,
    documentedPercent: 60,
    submittedPercent: 50,
    approvedPercent: 65,
    billedPercent: 70,
  });

  const result = useMemo(() => {
    const potential = state.activeJobs * state.averageFieldChange;
    const documented = potential * (state.documentedPercent / 100);
    const submitted = documented * (state.submittedPercent / 100);
    const approved = submitted * (state.approvedPercent / 100);
    const billed = approved * (state.billedPercent / 100);
    const leakage = potential - billed;
    const recoveryScore = boundedScore((billed / Math.max(potential, 1)) * 100);
    const stages = [
      {
        label: "Documented",
        value: state.documentedPercent,
        action: "Require daily field documentation before work proceeds.",
      },
      {
        label: "Submitted",
        value: state.submittedPercent,
        action: "Set a weekly PM deadline for pricing and submission.",
      },
      {
        label: "Approved",
        value: state.approvedPercent,
        action: "Escalate aging COs in the client decision log.",
      },
      {
        label: "Billed",
        value: state.billedPercent,
        action: "Tie billing review to the weekly CO log.",
      },
    ].sort((a, b) => a.value - b.value);
    const weakest = stages[0];

    return { potential, billed, leakage, recoveryScore, weakest };
  }, [state]);

  return (
    <ToolWorkbench
      eyebrow="Change order leak"
      title="Where is change-order money getting trapped?"
      body="Estimate the path from field change to documented, submitted, approved, and billed."
      input={
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Active jobs"
            value={state.activeJobs}
            onChange={(value) => setState((current) => ({ ...current, activeJobs: value }))}
          />
          <NumberField
            label="Average open change potential per job"
            value={state.averageFieldChange}
            prefix="$"
            onChange={(value) => setState((current) => ({ ...current, averageFieldChange: value }))}
          />
          <NumberField
            label="Documented"
            value={state.documentedPercent}
            suffix="%"
            onChange={(value) => setState((current) => ({ ...current, documentedPercent: value }))}
          />
          <NumberField
            label="Submitted"
            value={state.submittedPercent}
            suffix="%"
            onChange={(value) => setState((current) => ({ ...current, submittedPercent: value }))}
          />
          <NumberField
            label="Approved"
            value={state.approvedPercent}
            suffix="%"
            onChange={(value) => setState((current) => ({ ...current, approvedPercent: value }))}
          />
          <NumberField
            label="Billed"
            value={state.billedPercent}
            suffix="%"
            onChange={(value) => setState((current) => ({ ...current, billedPercent: value }))}
          />
        </div>
      }
      output={
        <ResultPanel
          eyebrow="Leakage output"
          title={money(result.leakage)}
          subtitle={`${result.weakest.label} is the weak stage`}
          progress={result.recoveryScore}
          details={[
            {
              label: "Potential exposure",
              value: money(result.potential),
              detail: "Total estimated field-change potential.",
            },
            {
              label: "Currently recovered",
              value: money(result.billed),
              detail: "Estimated amount that makes it to billed status.",
            },
            {
              label: "Recovery rate",
              value: percent(result.recoveryScore),
              detail: "Billed dollars divided by potential change dollars.",
            },
            {
              label: "Control action",
              value: result.weakest.action,
              detail: "Install this as the next CO process control.",
            },
          ]}
          nextTitle="Install the change order log."
          nextBody="Add weekly review of documented, submitted, approved, billed, and aging change orders."
        />
      }
    />
  );
}

function DecisionActionTool() {
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<DecisionState>({
    topic: "PMs are waiting on owner decisions before moving work forward.",
    decision: "Create a weekly owner decision log and review it every Friday.",
    owner: "Operations lead",
    dueDate: "",
    metric: "Open owner decisions over 7 days",
    issue: "Projects stall because unresolved decisions are not visible.",
  });

  const packet = useMemo(() => {
    const due = state.dueDate.trim() || "Set before publishing";
    return [
      "Decision-to-Action Packet",
      "",
      `Topic: ${state.topic.trim() || "Not set"}`,
      `Decision: ${state.decision.trim() || "Not set"}`,
      `Owner: ${state.owner.trim() || "Not set"}`,
      `Due date: ${due}`,
      `Scorecard metric: ${state.metric.trim() || "Not set"}`,
      `AOS issue: ${state.issue.trim() || "Not set"}`,
      "",
      "Next action:",
      "1. Add this to AOS as a decision or issue.",
      "2. Assign the owner and due date.",
      "3. Review the scorecard metric weekly until the issue is controlled.",
    ].join("\n");
  }, [state]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(packet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <ToolWorkbench
      eyebrow="Decision-to-action"
      title="Turn discussion into an operating packet."
      body="Use this when a conversation needs to become a decision, to-do, SOP gap, scorecard metric, or AOS issue."
      input={
        <div className="grid gap-4">
          <TextField
            label="Topic"
            value={state.topic}
            onChange={(value) => setState((current) => ({ ...current, topic: value }))}
          />
          <TextField
            label="Decision"
            value={state.decision}
            onChange={(value) => setState((current) => ({ ...current, decision: value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Owner"
              value={state.owner}
              onChange={(value) => setState((current) => ({ ...current, owner: value }))}
            />
            <TextField
              label="Due date"
              value={state.dueDate}
              placeholder="Friday / May 31 / before next L10"
              onChange={(value) => setState((current) => ({ ...current, dueDate: value }))}
            />
          </div>
          <TextField
            label="Scorecard metric"
            value={state.metric}
            onChange={(value) => setState((current) => ({ ...current, metric: value }))}
          />
          <TextAreaField
            label="AOS issue"
            value={state.issue}
            onChange={(value) => setState((current) => ({ ...current, issue: value }))}
          />
        </div>
      }
      output={
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="surface-command command-panel p-6">
            <p className="eyebrow text-amber">Action packet</p>
            <pre className="mt-5 whitespace-pre-wrap border border-background/10 bg-background/[0.04] p-4 text-xs leading-relaxed text-background/76">
              {packet}
            </pre>
            <Button className="mt-5 w-full justify-between" onClick={onCopy}>
              {copied ? "Copied" : "Copy packet"}
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </Card>
          <ActionLinks />
        </aside>
      }
    />
  );
}

function ToolWorkbench({
  eyebrow,
  title,
  body,
  input,
  output,
}: {
  eyebrow: string;
  title: string;
  body: string;
  input: React.ReactNode;
  output: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="surface-operating p-5 sm:p-6">
        <p className="eyebrow text-amber">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl leading-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{body}</p>
        <div className="mt-6">{input}</div>
      </Card>
      {output}
    </section>
  );
}

function ResultPanel({
  eyebrow,
  title,
  subtitle,
  progress,
  details,
  nextTitle,
  nextBody,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  progress: number;
  details: Array<{ label: string; value: string; detail: string }>;
  nextTitle: string;
  nextBody: string;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card className="surface-command command-panel p-6">
        <p className="eyebrow text-amber">{eyebrow}</p>
        <div className="mt-5 flex items-end gap-3">
          <span className="font-display text-5xl leading-none text-background sm:text-6xl">
            {title}
          </span>
        </div>
        <p className="mt-3 text-sm text-background/66">{subtitle}</p>
        <Progress value={boundedScore(progress)} className="mt-5 bg-background/14" />
        <div className="mt-6 space-y-3">
          {details.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className="border border-background/10 bg-background/[0.04] p-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-amber">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-background">{item.value}</p>
              <p className="mt-1 text-xs leading-relaxed text-background/62">{item.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="surface-library p-5">
        <p className="eyebrow text-amber">Recommended next action</p>
        <h3 className="mt-2 font-display text-2xl leading-tight">{nextTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{nextBody}</p>
        <ActionLinks />
      </Card>
    </aside>
  );
}

function ActionLinks() {
  return (
    <div className="mt-5 grid gap-2">
      <Button asChild>
        <Link to="/portal/call-prep">Bring one issue</Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/portal/alp-os">Open AOS</Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/portal/templates">Find supporting template</Link>
      </Button>
    </div>
  );
}

function ScoreRow({
  label,
  detail,
  value,
  highLabel,
  onChange,
}: {
  label: string;
  detail: string;
  value: number;
  highLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-3 border border-hairline bg-background p-4 sm:grid-cols-[minmax(0,1fr)_15rem]">
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
      </div>
      <div>
        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`h-10 border text-sm font-semibold transition-colors ${
                value === score
                  ? "border-foreground bg-foreground text-background"
                  : "border-hairline bg-elevated text-muted-foreground hover:text-foreground"
              }`}
              aria-label={`${label} score ${score}`}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Low</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center overflow-hidden rounded-md border border-input bg-background">
        {prefix ? <span className="pl-3 text-sm text-muted-foreground">{prefix}</span> : null}
        <Input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={0}
          onChange={(event) => onChange(Number(event.target.value))}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        {suffix ? <span className="pr-3 text-sm text-muted-foreground">{suffix}</span> : null}
      </span>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
