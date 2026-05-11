import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { getDashboard } from "@/lib/dashboard.functions";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/portal/templates")({
  head: () => ({ meta: [{ title: "Templates — ALP Contractor Circle" }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const { user, loading } = useAuth();
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => fetchDashboard(),
    enabled: !!user && !loading,
  });

  const templates = data?.featuredTemplates ?? [];

  return (
    <div className="container-prose py-10 space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-amber">Member Library</p>
        <h1 className="font-display text-4xl mt-2">Templates</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Featured resources are available now. The searchable template room is next in the rebuild.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-52 border-hairline" />
            ))
          : templates.map((template) => (
              <Card key={template.id} className="p-6 border-hairline">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline" className="font-mono uppercase">
                    {template.category}
                  </Badge>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <h2 className="font-display text-xl leading-tight mt-5">{template.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {template.description}
                </p>
                <p className="mt-5 font-mono text-xs uppercase text-muted-foreground">
                  {template.file_type}
                  {template.pages ? ` · ${template.pages}` : ""}
                </p>
              </Card>
            ))}
      </div>
    </div>
  );
}
