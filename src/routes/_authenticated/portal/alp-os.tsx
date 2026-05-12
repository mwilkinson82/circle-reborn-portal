import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Network,
  Plus,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getCallPrepPackets,
  type CallPrepPacket,
  type PacketOutputType,
} from "@/lib/call-prep.functions";
import { getTemplateLibrary } from "@/lib/dashboard.functions";
import { AOS_APP_URL } from "@/lib/aos-link";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AosMark } from "@/components/aos-mark";

export const Route = createFileRoute("/_authenticated/portal/alp-os")({
  head: () => ({ meta: [{ title: "AOS — Contractor Circle" }] }),
  component: AlpOsPage,
});

const osAssetPriority = [
  "legacy-template-20",
  "legacy-template-34",
  "legacy-template-25",
  "legacy-template-31",
  "legacy-template-35",
  "legacy-template-21",
  "legacy-template-28",
  "legacy-template-26",
  "legacy-template-33",
];

const buildSequence = [
  {
    icon: Target,
    label: "Vision",
    tool: "V/TO",
    body: "Set the long-range target, core focus, 3-year picture, 1-year plan, quarterly rocks, and issues list.",
  },
  {
    icon: Network,
    label: "People",
    tool: "Accountability Chart",
    body: "Clarify seats, responsibilities, GWC, right-person fit, and where owner dependency is still hiding.",
  },
  {
    icon: BarChart3,
    label: "Numbers",
    tool: "Scorecard",
    body: "Pick the weekly numbers that show what is happening before the P&L tells you what already happened.",
  },
  {
    icon: CheckCircle2,
    label: "Issues",
    tool: "IDS",
    body: "Turn repeated friction into root-cause decisions, owner-assigned action items, and solved problems.",
  },
  {
    icon: FileText,
    label: "Process",
    tool: "Core Processes",
    body: "Document the way the company sells, estimates, produces, bills, hires, and manages work.",
  },
  {
    icon: TrendingUp,
    label: "Traction",
    tool: "L10 and Rocks",
    body: "Run the weekly meeting rhythm that keeps priorities, numbers, issues, and accountability visible.",
  },
];

const orchestrationTools = [
  {
    label: "Owner dependency packet",
    status: "Seeded",
    what: "A short diagnostic for spotting where every decision still runs through the owner.",
    why: "Owner drag is usually the first place growth stalls and accountability stays vague.",
    output: "Creates a call-ready owner-dependency issue packet.",
    cta: "Preview",
  },
  {
    label: "Scorecard metric prompt",
    status: "Next",
    what: "A guided prompt for choosing the weekly number that should make the issue visible.",
    why: "If the number is not watched weekly, the same problem will keep reappearing as a story.",
    output: "Creates a candidate AOS scorecard metric.",
    cta: "Coming next",
  },
  {
    label: "SOP gap prompt",
    status: "Next",
    what: "A helper for turning repeated friction into the missing process that needs written.",
    why: "Most recurring issues are not solved by advice; they need a way of working.",
    output: "Creates a candidate SOP gap for AOS follow-through.",
    cta: "Coming next",
  },
  {
    label: "Decision packet",
    status: "Coming into the system",
    what: "A lightweight capture format for decisions made during calls or Discord pressure loops.",
    why: "A useful call should leave company memory, not just a good conversation.",
    output: "Creates a decision summary to carry into AOS.",
    cta: "Coming next",
  },
];

const outputLabels: Record<PacketOutputType, string> = {
  decision: "Decision",
  todo: "To-do",
  sop_gap: "SOP gap",
  scorecard_metric: "Scorecard metric",
  aos_issue: "AOS issue",
};

type OsTemplate = {
  id: string;
  title: string;
  description: string | null;
  long_description?: string | null;
  file_type: string | null;
  download_url?: string | null;
  badge: string | null;
  pages: string | null;
  highlights?: string[] | null;
};

function AlpOsPage() {
  const { user, loading } = useAuth();
  const fetchTemplates = useServerFn(getTemplateLibrary);
  const fetchPackets = useServerFn(getCallPrepPackets);
  const { data, isLoading } = useQuery({
    queryKey: ["alp-os-library", user?.id],
    queryFn: () => fetchTemplates(),
    enabled: !!user && !loading,
  });
  const { data: packets = [], isLoading: isLoadingPackets } = useQuery({
    queryKey: ["call-prep-packets", user?.id],
    queryFn: () => fetchPackets(),
    enabled: !!user && !loading,
  });

  const templates = (data ?? []) as OsTemplate[];
  const osTemplates = osAssetPriority
    .map((id) => templates.find((template) => template.id === id))
    .filter((template): template is OsTemplate => Boolean(template));
  const fallbackTemplates = templates.filter((template) =>
    ["alp/eos", "eos", "v/to", "scorecard", "operating system", "owner dependency"].some((term) =>
      `${template.title} ${template.description ?? ""} ${template.long_description ?? ""}`
        .toLowerCase()
        .includes(term),
    ),
  );
  const assets = osTemplates.length ? osTemplates : fallbackTemplates;
  const featured = assets[0];

  return (
    <div className="container-prose space-y-8 py-8 sm:py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="surface-command command-panel p-6 sm:p-7 lg:p-8">
          <div className="relative z-10">
            <AosMark className="w-24" imageClassName="w-14 rounded-2xl" />
          </div>
          <p className="eyebrow relative z-10 mt-6 text-amber">AOS</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            Install the operating system before you scale the work.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/68 sm:text-base">
            AOS is where Contractor Circle becomes structure: vision, people, numbers, issues,
            process, and traction. Use this portal to bring the pressure, prepare the issue packet,
            and carry the output into the dedicated AOS app.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="bg-background text-foreground">
              <a href={AOS_APP_URL} target="_blank" rel="noopener noreferrer">
                Open AOS <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            {featured?.download_url ? (
              <Button
                asChild
                variant="outline"
                className="border-background/15 bg-transparent text-background hover:bg-background/10 hover:text-background"
              >
                <a href={featured.download_url} target="_blank" rel="noopener noreferrer">
                  Start with the Playbook <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : null}
            <Button
              asChild
              variant="outline"
              className="border-background/15 bg-transparent text-background hover:bg-background/10 hover:text-background"
            >
              <Link to="/portal/call-prep">
                Prepare call issue <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Card className="surface-operating p-6 shadow-[0_30px_80px_rgba(35,24,12,0.08)]">
          <p className="eyebrow text-muted-foreground">Owner promise</p>
          <h2 className="mt-2 font-display text-2xl leading-tight">
            Less owner drag. More company value.
          </h2>
          <div className="mt-5 divide-y divide-hairline">
            {["Make more money", "Install systems", "Build leaders", "Create exit optionality"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <CheckCircle2 className="h-4 w-4 text-amber" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ),
            )}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Build sequence"
          title="Six parts of the company operating system"
          body="This is the path members follow in the dedicated AOS app. Contractor Circle keeps the pressure and guidance moving toward these six parts."
        />
        <div className="system-map relative grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {buildSequence.map((step, index) => (
            <div
              key={step.label}
              className={`surface-operating system-node group relative overflow-hidden p-5 pl-12 transition-all hover:-translate-y-1 hover:border-foreground/20 ${
                index === 0 ? "ring-1 ring-amber/25" : ""
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute right-4 top-4 font-display text-6xl leading-none text-foreground/[0.035] transition-colors group-hover:text-amber/10"
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-amber">{index === 0 ? "Start here" : step.tool}</p>
                  <h3 className="mt-3 font-display text-2xl leading-tight">{step.label}</h3>
                  {index === 0 ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">{step.tool}</p>
                  ) : null}
                </div>
                <step.icon className="h-5 w-5 text-amber" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <PacketLoop packets={packets} isLoading={isLoadingPackets} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow="OS assets"
            title="Start building the operating system"
            body="These are the first assets owners use to turn the concept into a weekly company rhythm."
          />
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-32" />
              ))}
            </div>
          ) : assets.length ? (
            <div className="grid gap-3">
              {assets.map((template, index) => (
                <OsAssetCard key={template.id} template={template} index={index} />
              ))}
            </div>
          ) : (
            <Card className="surface-operating p-8">
              <h3 className="font-display text-2xl">OS assets are being loaded</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The AOS library will appear here as soon as the member catalog is available.
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <SectionHeader
            eyebrow="Next company tools"
            title="Coming into the system"
            body="These are portal-side helpers for better prep and follow-through. They point members toward AOS instead of replacing it."
          />
          <div className="grid gap-3">
            {orchestrationTools.map((tool) => (
              <Card key={tool.label} className="surface-library p-5">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant={tool.status === "Seeded" ? "default" : "outline"}>
                    {tool.status}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={tool.cta !== "Preview"}
                  >
                    {tool.cta}
                  </Button>
                </div>
                <h3 className="mt-4 font-display text-xl leading-tight">{tool.label}</h3>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <ToolDetail label="What it is" value={tool.what} />
                  <ToolDetail label="Why it matters" value={tool.why} />
                  <ToolDetail label="Output" value={tool.output} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PacketLoop({ packets, isLoading }: { packets: CallPrepPacket[]; isLoading: boolean }) {
  const ready = packets.filter((packet) => packet.status === "ready").length;
  const converted = packets.filter((packet) => packet.status === "converted").length;
  const counts = packets.reduce(
    (acc, packet) => {
      acc[packet.expected_output] = (acc[packet.expected_output] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<PacketOutputType, number>>,
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Issue packet loop"
          title="Bring the pressure, then carry it into AOS"
          body="Saved call-prep packets keep the weekly rhythm from becoming disposable. Copy the packet for the live room today; open AOS when the decision needs to become company memory."
        />
        <Button asChild>
          <Link to="/portal/call-prep">
            <Plus className="mr-2 h-4 w-4" />
            Prepare issue
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricTile label="Ready packets" value={String(ready)} />
        <MetricTile label="Carried into AOS" value={String(converted)} />
        <MetricTile
          label="Primary output"
          value={resolvePrimaryOutcome(counts)}
          compact={resolvePrimaryOutcome(counts).length > 8}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      ) : packets.length ? (
        <div className="grid gap-3">
          {packets.slice(0, 6).map((packet) => (
            <PacketCard key={packet.id} packet={packet} />
          ))}
        </div>
      ) : (
        <Card className="surface-operating p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-hairline bg-secondary text-amber">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl">No issue packets saved yet</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Start with one stuck decision before the next call. The first saved packet becomes
                the portable handoff between the live room and the external AOS app.
              </p>
              <Button asChild className="mt-5">
                <Link to="/portal/call-prep">Build first packet</Link>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}

function MetricTile({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="surface-operating rounded-lg p-5">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className={`mt-3 font-display leading-none ${compact ? "text-3xl" : "text-5xl"}`}>
        {value}
      </p>
    </div>
  );
}

function PacketCard({ packet }: { packet: CallPrepPacket }) {
  const converted = packet.status === "converted";

  return (
    <Card className="surface-operating operating-brief overflow-hidden p-0">
      <div className="grid gap-px bg-hairline lg:grid-cols-[11rem_minmax(0,1fr)_18rem]">
        <div className="bg-background p-5">
          <Badge variant={converted ? "default" : "outline"}>{formatStatus(packet.status)}</Badge>
          <p className="mt-4 font-mono text-xs uppercase text-muted-foreground">
            {formatCategory(packet.category)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(packet.updated_at), { addSuffix: true })}
          </p>
        </div>

        <div className="bg-background p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{outputLabels[packet.expected_output]}</Badge>
            {packet.due_date ? <Badge variant="outline">Due {packet.due_date}</Badge> : null}
          </div>
          <h3 className="mt-3 line-clamp-2 font-display text-2xl leading-tight">{packet.issue}</h3>
          {packet.output_summary ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {packet.output_summary}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Ready for the live room. After the call, copy the decision, to-do, SOP gap, or weekly
              number into AOS.
            </p>
          )}
        </div>

        <div className="bg-background p-5">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
            <div>
              <p className="eyebrow text-muted-foreground">Owner</p>
              <p className="mt-1 text-sm font-medium">{packet.owner || "Unassigned"}</p>
            </div>
          </div>
          {packet.win ? (
            <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              Win: {packet.win}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function resolvePrimaryOutcome(counts: Partial<Record<PacketOutputType, number>>) {
  const entries = Object.entries(counts) as Array<[PacketOutputType, number]>;
  if (!entries.length) return "None";
  const [key] = entries.sort((a, b) => b[1] - a[1])[0];
  return outputLabels[key];
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

function formatStatus(status: CallPrepPacket["status"]) {
  return {
    draft: "Draft",
    ready: "Ready",
    discussed: "Discussed",
    converted: "Carried into AOS",
  }[status];
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-amber">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl leading-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function OsAssetCard({ template, index }: { template: OsTemplate; index: number }) {
  const isFirst = index === 0;

  return (
    <Card
      className={`${isFirst ? "surface-operating asset-stack" : "surface-library asset-stack"} overflow-hidden p-0`}
    >
      <div
        className={`grid gap-px bg-hairline ${
          isFirst
            ? "md:grid-cols-[11rem_minmax(0,1fr)_12rem]"
            : "md:grid-cols-[10rem_minmax(0,1fr)_9rem]"
        }`}
      >
        <div className={`${isFirst ? "bg-amber-soft/70" : "bg-background"} p-5`}>
          <Badge variant={isFirst ? "default" : "outline"}>
            {isFirst ? "Start here" : template.badge || "OS asset"}
          </Badge>
          <p className="mt-4 font-mono text-xs uppercase text-muted-foreground">
            {template.file_type}
            {template.pages ? ` / ${template.pages}` : ""}
          </p>
        </div>
        <div className="bg-background p-5">
          <h3 className={`font-display leading-tight ${isFirst ? "text-2xl" : "text-xl"}`}>
            {isFirst ? "ALP/EOS Operating System - Complete Playbook" : template.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {isFirst
              ? "The first operating asset for turning Contractor Circle pressure into a weekly company rhythm: vision, people, numbers, issues, process, and traction."
              : (template.long_description ?? template.description)}
          </p>
        </div>
        <div className="flex items-center bg-background p-5">
          <AssetAction downloadUrl={template.download_url ?? null} isFirst={isFirst} />
        </div>
      </div>
    </Card>
  );
}

function AssetAction({ downloadUrl, isFirst }: { downloadUrl: string | null; isFirst: boolean }) {
  if (!downloadUrl) {
    return (
      <Button type="button" variant="outline" disabled>
        Coming next
      </Button>
    );
  }

  return (
    <Button asChild>
      <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
        <Download className="mr-2 h-4 w-4" />
        {isFirst ? "Open Playbook" : "Open"}
      </a>
    </Button>
  );
}

function ToolDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}
