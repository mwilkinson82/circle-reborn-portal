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

const aosAppUrl = (import.meta.env.VITE_AOS_APP_URL as string | undefined)?.trim() || null;

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
    body: "Find where the business still depends on the owner, then point the member to the first system to build.",
  },
  {
    label: "Scorecard metric prompt",
    status: "Next",
    body: "Help members pick the weekly numbers that matter before those metrics move into AOS.",
  },
  {
    label: "SOP gap prompt",
    status: "Next",
    body: "Turn repeated friction into the missing process list: billing, handoff, closeout, hiring, reporting, and more.",
  },
  {
    label: "Decision packet",
    status: "Next",
    body: "Capture the decisions that happen on calls so company memory survives the week.",
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
        <div className="border border-hairline bg-foreground p-6 text-background sm:p-8 lg:p-10">
          <AosMark className="w-20" imageClassName="w-12 rounded-xl" showRings={false} />
          <p className="mt-7 font-mono text-xs uppercase tracking-wider text-amber">AOS</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            Install the operating system before you scale the work.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-background/68 sm:text-base">
            AOS is where Contractor Circle becomes structure: vision, people, numbers, issues,
            process, and traction. Use this portal to bring the pressure, prepare the issue packet,
            and carry the output into the dedicated AOS app.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {aosAppUrl ? (
              <Button asChild variant="secondary" className="bg-background text-foreground">
                <a href={aosAppUrl} target="_blank" rel="noopener noreferrer">
                  Open in AOS <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="bg-background text-foreground"
                disabled
              >
                Open in AOS
              </Button>
            )}
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
                Prepare a company issue <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-hairline p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Owner promise
          </p>
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
        <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-2 xl:grid-cols-3">
          {buildSequence.map((step) => (
            <div key={step.label} className="bg-background p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-amber">
                    {step.tool}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-tight">{step.label}</h3>
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
            <Card className="border-hairline p-8">
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
              <Card key={tool.label} className="border-hairline p-5">
                <Badge variant="outline">{tool.status}</Badge>
                <h3 className="mt-4 font-display text-xl leading-tight">{tool.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.body}</p>
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
          body="Saved call-prep packets keep the weekly rhythm from becoming disposable. Copy the packet for the live room today; send it into AOS when the external integration is ready."
        />
        <Button asChild>
          <Link to="/portal/call-prep">
            <Plus className="mr-2 h-4 w-4" />
            Prepare issue
          </Link>
        </Button>
      </div>

      <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-3">
        <MetricTile label="Ready packets" value={String(ready)} />
        <MetricTile label="Converted outputs" value={String(converted)} />
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
        <Card className="border-hairline p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-hairline bg-secondary text-amber">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl">No issue packets saved yet</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Start with one stuck decision before the next call. The first saved packet becomes
                the bridge between the live room and the external AOS app.
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
    <div className="bg-background p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-3 font-display leading-none ${compact ? "text-3xl" : "text-5xl"}`}>
        {value}
      </p>
    </div>
  );
}

function PacketCard({ packet }: { packet: CallPrepPacket }) {
  const converted = packet.status === "converted";

  return (
    <Card className="border-hairline p-0">
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
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Owner
              </p>
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
    converted: "Converted",
  }[status];
}

function SectionHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-wider text-amber">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl leading-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function OsAssetCard({ template, index }: { template: OsTemplate; index: number }) {
  return (
    <Card className="border-hairline p-0">
      <div className="grid gap-px bg-hairline md:grid-cols-[10rem_minmax(0,1fr)_9rem]">
        <div className="bg-background p-5">
          <Badge variant={index === 0 ? "default" : "outline"}>
            {index === 0 ? "Start here" : template.badge || "OS asset"}
          </Badge>
          <p className="mt-4 font-mono text-xs uppercase text-muted-foreground">
            {template.file_type}
            {template.pages ? ` / ${template.pages}` : ""}
          </p>
        </div>
        <div className="bg-background p-5">
          <h3 className="font-display text-xl leading-tight">{template.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {template.long_description ?? template.description}
          </p>
        </div>
        <div className="flex items-center bg-background p-5">
          <AssetAction downloadUrl={template.download_url ?? null} isFirst={index === 0} />
        </div>
      </div>
    </Card>
  );
}

function AssetAction({ downloadUrl, isFirst }: { downloadUrl: string | null; isFirst: boolean }) {
  if (!downloadUrl) {
    return (
      <Button type="button" variant="outline" disabled>
        Coming soon
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
