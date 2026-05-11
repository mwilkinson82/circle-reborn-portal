import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Factory,
  MessageSquareText,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/portal/call-prep")({
  head: () => ({ meta: [{ title: "Prepare for Call — Contractor Circle" }] }),
  component: CallPrepPage,
});

const categories = [
  {
    id: "leadership",
    label: "Leadership/System",
    icon: BriefcaseBusiness,
    prompt: "Owner drag, unclear accountability, weak process, or a decision that keeps circling.",
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    prompt: "Seat fit, accountability, hiring, performance, delegation, or right-person questions.",
  },
  {
    id: "cash",
    label: "Cash/Billing",
    icon: BadgeDollarSign,
    prompt:
      "Collections, billing rhythm, retainage, unbilled work, change orders, or margin leakage.",
  },
  {
    id: "sales",
    label: "Sales/Estimating",
    icon: ClipboardList,
    prompt: "Lead quality, bid discipline, win rate, estimating bottlenecks, or follow-up gaps.",
  },
  {
    id: "production",
    label: "Production",
    icon: Factory,
    prompt:
      "Schedule slippage, PM capacity, client decisions, field execution, or handoff problems.",
  },
] as const;

type CategoryId = (typeof categories)[number]["id"];

function CallPrepPage() {
  const [categoryId, setCategoryId] = useState<CategoryId>("leadership");
  const [issue, setIssue] = useState("");
  const [tried, setTried] = useState("");
  const [avoiding, setAvoiding] = useState("");
  const [consequence, setConsequence] = useState("");
  const [win, setWin] = useState("");
  const [copied, setCopied] = useState(false);

  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const completedCount = [issue, tried, avoiding, consequence, win].filter(
    (value) => value.trim().length > 0,
  ).length;

  const issuePacket = [
    "Contractor Circle Call Prep",
    `Category: ${category.label}`,
    "",
    "1. What needs pressure?",
    issue.trim() || "[add issue]",
    "",
    "2. What have we already tried?",
    tried.trim() || "[add prior attempts]",
    "",
    "3. What decision are we avoiding?",
    avoiding.trim() || "[add avoided decision]",
    "",
    "4. What is the financial consequence?",
    consequence.trim() || "[add financial consequence]",
    "",
    "5. What would make this a win on the call?",
    win.trim() || "[add win condition]",
    "",
    "Likely output: decision, to-do, SOP gap, scorecard metric, or AOS issue.",
  ].join("\n");

  const copyIssuePacket = async () => {
    try {
      await navigator.clipboard.writeText(issuePacket);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-[82rem] space-y-8 px-5 py-7 sm:px-6 sm:py-10 2xl:max-w-[88rem]">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="relative overflow-hidden border border-hairline bg-background p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 border-l border-hairline bg-[linear-gradient(180deg,rgba(210,122,38,0.08),transparent_42%,rgba(210,122,38,0.06))]" />

          <p className="font-mono text-xs uppercase tracking-wider text-amber">Call prep</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            What needs pressure before the next call?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Bring one stuck decision into the open. A good Contractor Circle issue should turn into
            a decision, to-do, SOP gap, scorecard metric, or AOS issue.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {categories.map((item) => {
              const Icon = item.icon;
              const active = item.id === categoryId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategoryId(item.id)}
                  className={`min-h-32 border p-4 text-left transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-hairline bg-background hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-5 w-5 text-amber" />
                  <span className="mt-4 block font-display text-lg leading-tight">
                    {item.label}
                  </span>
                  <span
                    className={`mt-2 block text-xs leading-relaxed ${
                      active ? "text-background/65" : "text-muted-foreground"
                    }`}
                  >
                    {item.prompt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Card className="border-hairline p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Current packet
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight">{category.label}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{category.prompt}</p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Prep strength</span>
              <Badge variant={completedCount >= 4 ? "default" : "outline"}>
                {completedCount}/5 answered
              </Badge>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-amber transition-all"
                style={{ width: `${(completedCount / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <Button asChild className="w-full">
              <Link to="/portal/alp-os">
                Open AOS <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={copyIssuePacket}>
              {copied ? (
                <>
                  Copied <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Copy issue packet <Copy className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="border-hairline p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-hairline bg-secondary text-amber">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-amber">
                Build the issue
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight">
                Make the problem specific enough to solve
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <PrepQuestion
              id="issue"
              label="What needs pressure?"
              value={issue}
              onChange={setIssue}
              placeholder="Example: We keep missing billing events because PMs do not close out change-order documentation."
            />
            <PrepQuestion
              id="tried"
              label="What have you already tried?"
              value={tried}
              onChange={setTried}
              placeholder="List the attempts, conversations, rules, meetings, or fixes that have not held."
            />
            <PrepQuestion
              id="avoiding"
              label="What decision are you avoiding?"
              value={avoiding}
              onChange={setAvoiding}
              placeholder="Name the hard call: a person, process, pricing, accountability, customer, or leadership decision."
            />
            <PrepQuestion
              id="consequence"
              label="What is the financial consequence?"
              value={consequence}
              onChange={setConsequence}
              placeholder="Estimate the dollars, margin, cash, time, capacity, or reputation at risk."
            />
            <PrepQuestion
              id="win"
              label="What would make this a win on the call?"
              value={win}
              onChange={setWin}
              placeholder="Example: Leave with a clear owner, one action item, and the scorecard number we will track weekly."
            />
          </div>
        </Card>

        <Card className="border-hairline p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-hairline bg-foreground text-background">
              <ClipboardCheck className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Issue packet
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight">
                Ready for AOS or the live room
              </h2>
            </div>
          </div>

          <pre className="mt-5 max-h-[34rem] overflow-auto whitespace-pre-wrap border border-hairline bg-secondary p-4 font-sans text-sm leading-relaxed text-muted-foreground">
            {issuePacket}
          </pre>
        </Card>
      </section>
    </div>
  );
}

function PrepQuestion({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-24 resize-y"
      />
    </div>
  );
}
