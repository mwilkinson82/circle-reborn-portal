import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  FileWarning,
  Gauge,
  Landmark,
  LockKeyhole,
  Network,
  Route as RouteIcon,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/portal/command-tools")({
  head: () => ({ meta: [{ title: "Business Command Tools — Contractor Circle" }] }),
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

const STORAGE_KEY = "circle-owner-dependency-scorecard";

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

const commandTools = [
  {
    title: "Owner Dependency Scorecard",
    promise: "Find where the business still depends on the owner.",
    status: "Available",
    output: "Owner dependency score, top bottlenecks, first system to install.",
    aos: "People, Process, Traction",
    icon: Network,
  },
  {
    title: "Capacity Map",
    promise: "See what revenue the company can actually carry.",
    status: "Coming next",
    output: "Billing capacity, active project requirement, lead requirement, PM capacity gap.",
    aos: "Vision, Numbers, Rocks",
    icon: Gauge,
  },
  {
    title: "System Gap Finder",
    promise: "Identify which systems are missing first.",
    status: "Coming next",
    output: "Priority SOP gaps, template recommendations, process sequence.",
    aos: "Process, Issues",
    icon: Workflow,
  },
  {
    title: "Cash Control Snapshot",
    promise: "See where cash is leaking before the P&L tells you.",
    status: "Coming next",
    output: "Cash risk, billing rhythm issue, A/R pressure, change order leakage.",
    aos: "Numbers, Issues",
    icon: Landmark,
  },
  {
    title: "Contract Risk Scan",
    promise: "Find the clauses and process gaps exposing the business.",
    status: "Coming next",
    output: "Contract risk score, missing clauses, template recommendations.",
    aos: "Process, Issues",
    icon: ShieldAlert,
  },
  {
    title: "Pipeline Pressure Test",
    promise:
      "Find whether the problem is demand, qualification, follow-up, estimating, or close rate.",
    status: "Preview",
    output: "Pipeline constraint, sales system, template and replay recommendation.",
    aos: "Numbers, Process",
    icon: BarChart3,
  },
  {
    title: "Change Order Leak Finder",
    promise: "Find the money trapped in undocumented, unapproved, or unbilled changes.",
    status: "Preview",
    output: "Leakage estimate, next action list, SOP gap, scorecard metric.",
    aos: "Issues, Numbers, Process",
    icon: FileWarning,
  },
  {
    title: "Decision-to-Action",
    promise: "Turn a discussion into a decision, to-do, SOP gap, scorecard metric, or AOS issue.",
    status: "Seeded",
    output: "Action packet.",
    aos: "Issues, To-Dos, Traction",
    icon: RouteIcon,
  },
];

function defaultScores() {
  return dependencyAreas.reduce(
    (acc, area) => ({ ...acc, [area.key]: 3 }),
    {} as Record<ScoreKey, number>,
  );
}

function CommandToolsPage() {
  const [scores, setScores] = useState<Record<ScoreKey, number>>(defaultScores);

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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }, [scores]);

  const result = useMemo(() => {
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
  }, [scores]);

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
              Thin-sliced owner tools for the business problems behind the projects. Use them to
              diagnose the constraint, pull the right asset, and carry the output into AOS.
            </p>
          </div>
          <div className="border border-background/12 bg-background/[0.05] p-5">
            <p className="eyebrow text-amber">Core principle</p>
            <p className="mt-3 font-display text-2xl leading-tight">
              Diagnose before you bring it to the room.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-background/62">
              These tools are not a CRM, accounting system, legal platform, or project-management
              app. They help owners make better decisions and install better systems.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {commandTools.map((tool) => (
          <Card
            key={tool.title}
            className={`surface-library flex min-h-72 flex-col justify-between p-5 ${
              tool.status === "Available" ? "border-amber/40 bg-amber-soft/20" : ""
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <tool.icon className="h-5 w-5 text-amber" />
                <Badge variant={tool.status === "Available" ? "default" : "outline"}>
                  {tool.status}
                </Badge>
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
              asChild={tool.status === "Available"}
              variant={tool.status === "Available" ? "default" : "outline"}
              disabled={tool.status !== "Available"}
              className="mt-6 w-full justify-between"
            >
              {tool.status === "Available" ? (
                <a href="#owner-dependency">
                  Start <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : (
                <>
                  Coming next <LockKeyhole className="h-4 w-4" />
                </>
              )}
            </Button>
          </Card>
        ))}
      </section>

      <section id="owner-dependency" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="surface-operating p-5 sm:p-6">
          <p className="eyebrow text-amber">Available now</p>
          <h2 className="mt-2 font-display text-3xl">Owner Dependency Scorecard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Score each area from 1 to 5. A 1 means delegated and systemized. A 5 means the business
            still depends heavily on the owner.
          </p>

          <div className="mt-6 grid gap-3">
            {dependencyAreas.map((area) => (
              <div
                key={area.key}
                className="grid gap-3 border border-hairline bg-background p-4 sm:grid-cols-[minmax(0,1fr)_15rem]"
              >
                <div>
                  <p className="font-medium">{area.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    First system: {area.system}. Related AOS: {area.aos}.
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setScores((current) => ({ ...current, [area.key]: value }))}
                      className={`h-10 border text-sm font-semibold transition-colors ${
                        scores[area.key] === value
                          ? "border-foreground bg-foreground text-background"
                          : "border-hairline bg-elevated text-muted-foreground hover:text-foreground"
                      }`}
                      aria-label={`${area.label} dependency score ${value}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="surface-command command-panel p-6">
            <p className="eyebrow text-amber">Scorecard output</p>
            <div className="mt-5 flex items-end gap-3">
              <span className="font-display text-6xl leading-none text-background">
                {result.score}
              </span>
              <span className="pb-2 text-sm text-background/62">/100 owner dependency</span>
            </div>
            <Badge className="mt-4">{result.severity} dependency</Badge>
            <div className="mt-6 space-y-3">
              {result.top.map((area, index) => (
                <div
                  key={area.key}
                  className="border border-background/10 bg-background/[0.04] p-3"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-amber">
                    Bottleneck {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-background">{area.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-background/62">
                    Install the {area.system}. Related AOS area: {area.aos}.
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="surface-library p-5">
            <p className="eyebrow text-amber">Recommended next action</p>
            <h3 className="mt-2 font-display text-2xl leading-tight">
              Start with {result.primary.system}.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Bring one issue to the next Contractor Circle session, open AOS, and turn the output
              into a decision, to-do, SOP gap, scorecard metric, or issue.
            </p>
            <div className="mt-5 grid gap-2">
              <Button asChild>
                <Link to="/portal/call-prep">Bring one issue</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/portal/alp-os">Open AOS</Link>
              </Button>
            </div>
          </Card>

          {result.score >= 70 ? (
            <Card className="surface-operating p-5">
              <p className="eyebrow text-amber">Escalation path</p>
              <h3 className="mt-2 font-display text-2xl leading-tight">
                High owner dependency detected.
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If you want direct help installing the first priorities, request the Six-Week
                Contractor Intensive.
              </p>
              <Button asChild variant="outline" className="mt-5 w-full justify-between">
                <Link to="/portal/intensive">
                  Request Intensive <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
