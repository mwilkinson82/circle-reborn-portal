import { ArrowUpRight, CheckCircle2, ExternalLink, Hammer, ShieldCheck } from "lucide-react";
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
    <div className="container-prose py-8 sm:py-12 space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="relative overflow-hidden border border-hairline bg-foreground text-background">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 border-l border-background/10 bg-[linear-gradient(135deg,transparent_0_35%,rgba(255,255,255,0.08)_35%_36%,transparent_36%_100%)] bg-[length:34px_34px] md:block" />
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 border border-background/10 bg-background/[0.06] px-3 py-2 text-xs uppercase tracking-wider text-background/70">
              <ExternalLink className="h-3.5 w-3.5 text-amber" />
              Current production workspace
            </div>
            <h1 className="mt-8 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              {link.title}
            </h1>
            <p className="mt-3 font-display text-2xl leading-tight text-background/92">
              {link.promise}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/65">
              {link.blurb} This is a secondary field tool linked from the member portal so the work
              stays accessible when it is the problem in front of you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2 bg-background text-foreground">
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  Open {link.title}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
              <span className="text-xs text-background/50">{new URL(link.url).host}</span>
            </div>
          </div>
        </div>

        <Card className="border-hairline p-6">
          <h2 className="font-display text-xl">Workspace status</h2>
          <div className="mt-5 space-y-4">
            <StatusRow icon={CheckCircle2} label="Access" value="Protected" />
            <StatusRow icon={ShieldCheck} label="Workspace" value="Current production app" />
            <StatusRow icon={ExternalLink} label="Portal status" value="Linked workspace" />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Opens the current production workspace in a new tab. The portal does not replace this
            tool; it helps you decide when to use it.
          </p>
        </Card>
      </section>

      <section className="grid gap-px border border-hairline bg-hairline md:grid-cols-3">
        <WorkflowCard
          eyebrow="Use when"
          title={link.bestUsedFor}
          body="Field tools support the work in front of you. They do not replace AOS as the company home base."
        />
        <WorkflowCard
          eyebrow="Portal role"
          title="Support layer"
          body="Contractor Circle brings the pressure. AOS turns it into structure. These tools help when the pressure is tied to project execution."
        />
        <WorkflowCard eyebrow="Support note" title="Bring decisions back" body={link.supportNote} />
      </section>

      {showRelated && (
        <section className="space-y-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              ConstructLine suite
            </p>
            <h2 className="mt-2 font-display text-2xl">Related tools</h2>
          </div>
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
                      <div className="flex items-center gap-2">
                        <Hammer className="h-4 w-4 text-amber" />
                        <div className="font-display text-lg">{r.title}</div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.blurb}</p>
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

function StatusRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CheckCircle2 | typeof ExternalLink | typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-amber" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function WorkflowCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="bg-background p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-amber">{eyebrow}</p>
      <h3 className="mt-5 font-display text-xl leading-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
