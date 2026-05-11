import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CONSTRUCTLINE_LINKS, type ConstructLineLink } from "@/lib/constructline-links";

interface Props {
  link: ConstructLineLink;
  /** Optional: show related ConstructLine tools below the primary CTA. */
  showRelated?: boolean;
}

export function ConstructLineLinkOut({ link, showRelated = true }: Props) {
  const related = CONSTRUCTLINE_LINKS.filter((l) => l.key !== link.key);

  return (
    <div className="container-prose py-12 space-y-10">
      <Card className="border-hairline p-8 space-y-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5 text-amber" />
          Active ConstructLine workspace
        </div>
        <div className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">
            {link.title}
          </h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            {link.blurb} You'll be sent to the live production ConstructLine app where your
            existing projects, data, and saved work continue to live. We're auditing and porting
            this module into the new portal — until that's complete and validated, the link below
            keeps you on the tool you already use.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="gap-2">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              Open {link.title}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
          <span className="text-xs text-muted-foreground self-center">
            Opens in a new tab · {new URL(link.url).host}
          </span>
        </div>
      </Card>

      {showRelated && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Other ConstructLine tools
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {related.map((r) => (
              <a
                key={r.key}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="border-hairline p-5 transition-colors hover:border-amber">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-lg">{r.title}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{r.blurb}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-amber shrink-0" />
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
