import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, Download, FileText, Search } from "lucide-react";
import { getTemplateLibrary } from "@/lib/dashboard.functions";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/portal/templates")({
  head: () => ({ meta: [{ title: "Templates — ALP Contractor Circle" }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const { user, loading } = useAuth();
  const fetchTemplates = useServerFn(getTemplateLibrary);
  const { data, isLoading } = useQuery({
    queryKey: ["template-library", user?.id],
    queryFn: () => fetchTemplates(),
    enabled: !!user && !loading,
  });

  const templates = data ?? [];
  const featured = templates.filter((template) => template.featured).length;
  const categories = new Set(templates.map((template) => template.category)).size;

  return (
    <div className="container-prose py-8 sm:py-10 space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="border border-hairline bg-foreground p-6 text-background sm:p-8 lg:p-10">
          <p className="font-mono text-xs uppercase tracking-wider text-amber">Member Library</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Templates for real bids, not blank-page theory.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/65">
            Proposal tools, review checklists, financial templates, and bid-room documents.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline lg:grid-cols-1">
          <StatBlock label="Resources" value={String(templates.length)} />
          <StatBlock label="Featured" value={String(featured)} />
          <StatBlock label="Categories" value={String(categories)} />
        </div>
      </section>

      {isLoading ? (
        <TemplateSkeleton />
      ) : templates.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl">Template library</h2>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <Search className="h-3.5 w-3.5" />
              Search and filters are next
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="flex h-full flex-col border-hairline p-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant={template.featured ? "default" : "outline"}>
                    {template.category}
                  </Badge>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="mt-5 font-display text-xl leading-tight">{template.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {template.long_description ?? template.description}
                </p>

                {template.highlights?.length ? (
                  <ul className="mt-5 space-y-2">
                    {template.highlights.slice(0, 3).map((highlight) => (
                      <li key={highlight} className="flex gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                  <p className="font-mono text-xs uppercase text-muted-foreground">
                    {template.file_type}
                    {template.pages ? ` · ${template.pages}` : ""}
                  </p>
                  <TemplateAction downloadUrl={template.download_url} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TemplateAction({ downloadUrl }: { downloadUrl: string | null }) {
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
        Open <ArrowUpRight className="ml-2 h-4 w-4" />
      </a>
    </Button>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl tabular-nums">{value}</p>
    </div>
  );
}

function TemplateSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-72 border-hairline" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-hairline p-8 text-center">
      <h2 className="font-display text-2xl">Template room is being loaded</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Published templates will appear here as the Circle library is loaded into the new portal.
      </p>
    </Card>
  );
}
