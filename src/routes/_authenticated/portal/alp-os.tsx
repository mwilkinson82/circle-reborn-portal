import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Download,
  FileText,
  Network,
  Target,
  TrendingUp,
} from "lucide-react";
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
  "legacy-template-21",
  "legacy-template-31",
  "legacy-template-35",
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
    tool: "Accountability chart",
    body: "Clarify seats, accountabilities, GWC, right-person fit, and where owner dependency is still hiding.",
  },
  {
    icon: BarChart3,
    label: "Data",
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
    tool: "Core processes",
    body: "Document the way the company sells, estimates, produces, bills, hires, and manages work.",
  },
  {
    icon: TrendingUp,
    label: "Traction",
    tool: "L10 and rocks",
    body: "Run the weekly meeting rhythm that keeps priorities, numbers, issues, and accountability visible.",
  },
];

const futureTools = [
  {
    label: "Scorecard builder",
    status: "Next",
    body: "Turn weekly measurables into a living company dashboard once members start entering AOS data.",
  },
  {
    label: "Accountability chart builder",
    status: "Next",
    body: "Map seats, owners, GWC, and open leadership gaps without starting from a blank document.",
  },
  {
    label: "Owner dependency assessment",
    status: "Seeded",
    body: "Use the existing scorecard as the first diagnostic for scaling beyond the owner.",
  },
];

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
  const { data, isLoading } = useQuery({
    queryKey: ["alp-os-library", user?.id],
    queryFn: () => fetchTemplates(),
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
            Build the company layer before the dashboard layer.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-background/68 sm:text-base">
            The ALP Operating System is where Contractor Circle becomes commercially durable for
            owners: vision, people, numbers, issues, process, and traction. The dashboard becomes
            real after members start using the operating system.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {featured?.download_url ? (
              <Button asChild variant="secondary" className="bg-background text-foreground">
                <a href={featured.download_url} target="_blank" rel="noopener noreferrer">
                  Open first asset <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : null}
            <Button
              asChild
              variant="outline"
              className="border-background/15 bg-transparent text-background hover:bg-background/10 hover:text-background"
            >
              <Link to="/portal/replays">
                Watch OS sessions <ArrowUpRight className="ml-2 h-4 w-4" />
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
          body="This is the member path that can eventually produce real dashboard data: not fake stats, but live company operating inputs."
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow="OS assets"
            title="Start with the real ALP/EOS materials"
            body="These are pulled from the member library and arranged for owners who want systems, scaling, and transferable value."
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
            eyebrow="Tool roadmap"
            title="Where this becomes software"
            body="The right next tools are owner-facing and systems-facing. They create the real data a future dashboard should use."
          />
          <div className="grid gap-3">
            {futureTools.map((tool) => (
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
          <AssetAction downloadUrl={template.download_url ?? null} />
        </div>
      </div>
    </Card>
  );
}

function AssetAction({ downloadUrl }: { downloadUrl: string | null }) {
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
        Open
      </a>
    </Button>
  );
}
