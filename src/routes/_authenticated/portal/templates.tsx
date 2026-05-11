import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Download, FileText, Search, X } from "lucide-react";
import { getTemplateLibrary } from "@/lib/dashboard.functions";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/portal/templates")({
  head: () => ({ meta: [{ title: "Templates — ALP Contractor Circle" }] }),
  component: TemplatesPage,
});

const categoryOrder = [
  "proposals",
  "estimating",
  "finance",
  "sales",
  "operations",
  "leadership",
  "contracts",
  "contractor_circle",
];

function TemplatesPage() {
  const { user, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const fetchTemplates = useServerFn(getTemplateLibrary);
  const { data, isLoading } = useQuery({
    queryKey: ["template-library", user?.id],
    queryFn: () => fetchTemplates(),
    enabled: !!user && !loading,
  });

  const templates = useMemo(() => data ?? [], [data]);
  const featured = templates.filter((template) => template.featured).length;
  const categories = new Set(templates.map((template) => template.category)).size;
  const normalizedQuery = query.trim().toLowerCase();
  const categoryFilters = useMemo(() => {
    const counts = new Map<string, number>();
    templates.forEach((template) => {
      counts.set(template.category, (counts.get(template.category) ?? 0) + 1);
    });

    const ordered = categoryOrder.filter((item) => counts.has(item));
    const remaining = [...counts.keys()].filter((item) => !categoryOrder.includes(item)).sort();

    return [
      { value: "all", label: "All", count: templates.length },
      ...[...ordered, ...remaining].map((value) => ({
        value,
        label: formatCategory(value),
        count: counts.get(value) ?? 0,
      })),
    ];
  }, [templates]);
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const categoryMatch = category === "all" || template.category === category;
      const searchable = [
        template.title,
        template.description,
        template.long_description,
        template.file_type,
        template.pages,
        template.badge,
        template.category,
        ...(template.highlights ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return categoryMatch && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, normalizedQuery, templates]);
  const hasActiveFilters = category !== "all" || normalizedQuery.length > 0;

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
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <div>
              <h2 className="font-display text-2xl">Template library</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredTemplates.length} of {templates.length} resources
              </p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search resources"
                className="h-11 rounded-none pl-9 pr-9"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={`border px-3 py-2 text-xs font-medium transition-colors ${
                  category === item.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-hairline bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {item.label}
                <span className="ml-2 font-mono opacity-70">{item.count}</span>
              </button>
            ))}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setCategory("all");
                  setQuery("");
                }}
                className="border border-transparent px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Reset
              </button>
            )}
          </div>

          {filteredTemplates.length === 0 ? (
            <Card className="border-hairline p-8 text-center">
              <h3 className="font-display text-2xl">No matching resources</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Try a different keyword or category.
              </p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="border-hairline p-0 shadow-sm">
                  <div className="grid gap-px bg-hairline md:grid-cols-[12rem_minmax(0,1fr)_11rem]">
                    <div className="bg-background p-5">
                      <Badge variant={template.featured ? "default" : "outline"}>
                        {formatCategory(template.category)}
                      </Badge>
                      {template.badge && (
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-amber">
                          {template.badge}
                        </p>
                      )}
                      <p className="mt-4 font-mono text-xs uppercase text-muted-foreground">
                        {template.file_type}
                        {template.pages ? ` · ${template.pages}` : ""}
                      </p>
                    </div>

                    <div className="bg-background p-5">
                      <div className="flex items-start gap-3">
                        <FileText className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <h3 className="font-display text-xl leading-tight">{template.title}</h3>
                          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            {template.long_description ?? template.description}
                          </p>
                        </div>
                      </div>

                      {template.highlights?.length ? (
                        <ul className="mt-4 grid gap-2 lg:grid-cols-2">
                          {template.highlights.slice(0, 4).map((highlight) => (
                            <li
                              key={highlight}
                              className="flex gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-start bg-background p-5 md:justify-center">
                      <TemplateAction downloadUrl={template.download_url} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function formatCategory(value: string) {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
