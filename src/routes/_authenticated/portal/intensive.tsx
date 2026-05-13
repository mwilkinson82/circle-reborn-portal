import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  LockKeyhole,
  MessageSquareText,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { submitIntensiveApplication } from "@/lib/intensive.functions";

export const Route = createFileRoute("/_authenticated/portal/intensive")({
  head: () => ({ meta: [{ title: "Work With Marshall — Contractor Circle" }] }),
  component: IntensivePage,
});

const included = [
  "Six private sessions with Marshall over six weeks",
  "Business pressure-test and priority sequence",
  "A focused implementation plan for the next operating constraint",
  "Guidance on what belongs in AOS, templates, scorecards, SOPs, and issues",
];

const fitSignals = [
  "The group room is useful, but your business needs direct pressure.",
  "Owner dependency is high and the first priorities are unclear.",
  "You need help choosing what not to work on next.",
  "The business is growing faster than the current operating system can hold.",
];

const revenueRanges = ["Under $1M", "$1M-$3M", "$3M-$5M", "$5M-$10M", "$10M-$25M", "$25M+"];

const applicationOptions = [
  "Six-Week Contractor Intensive — $5,000",
  "Strategy Session — $1,000",
  "Ongoing Advisory — Custom Pricing",
];

const initialForm = {
  fullName: "",
  companyName: "",
  annualRevenueRange: "",
  biggestChallenge: "",
  alreadyTried: "",
  applyingFor: applicationOptions[0],
  email: "",
  phone: "",
};

function IntensivePage() {
  const { user } = useAuth();
  const submitApplication = useServerFn(submitIntensiveApplication);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((current) => ({ ...current, email: user.email ?? "" }));
    }
  }, [form.email, user?.email]);

  const mutation = useMutation({
    mutationFn: () => submitApplication({ data: form }),
    onSuccess: (result) => {
      setSubmitted(true);
      if (result.emailSent) {
        toast.success("Application submitted to Marshall.");
      } else {
        toast.warning("Application saved. Email delivery needs provider configuration.");
      }
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Application could not be submitted."),
  });

  const canSubmit =
    form.fullName.trim().length >= 2 &&
    form.companyName.trim().length >= 2 &&
    form.annualRevenueRange &&
    form.biggestChallenge.trim().length >= 12 &&
    form.alreadyTried.trim().length >= 8 &&
    form.applyingFor &&
    form.email.includes("@") &&
    form.phone.trim().length >= 7;

  return (
    <div className="container-prose space-y-8 py-8 sm:py-10">
      <section className="surface-command command-panel overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <p className="eyebrow text-amber">Work With Marshall</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
              Six private sessions to install the next operating constraint.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/70">
              Contractor Circle gives you the operating room. The Intensive gives you six private
              sessions to pressure-test the business, install the right priorities, and move faster
              with direct guidance.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <a href="#intensive-application">Apply from the portal</a>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/portal/command-tools">Run owner scorecard</Link>
              </Button>
            </div>
          </div>

          <Card className="border-background/12 bg-background/[0.05] p-5 text-background">
            <p className="eyebrow text-amber">Six-Week Contractor Intensive</p>
            <p className="mt-4 font-display text-4xl">$5,000</p>
            <p className="mt-1 text-sm text-background/62">upfront</p>
            <div className="mt-5 grid gap-3 text-sm text-background/70">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber" />
                Six weeks
              </p>
              <p className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-amber" />
                Six private sessions
              </p>
              <p className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-amber" />
                Limited and separate from Circle membership
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="surface-library p-6">
          <p className="eyebrow text-amber">What it is</p>
          <h2 className="mt-2 font-display text-3xl">Direct implementation pressure.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This is private consulting, not a replacement for Contractor Circle. It is for owners
            who need Marshall inside the business for a short, focused sprint around priorities,
            structure, decisions, and implementation.
          </p>
          <div className="mt-6 grid gap-3">
            {included.map((item) => (
              <div key={item} className="flex gap-3 border border-hairline bg-background p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="surface-operating p-6">
          <p className="eyebrow text-amber">Best fit</p>
          <h2 className="mt-2 font-display text-3xl">Apply when speed matters.</h2>
          <div className="mt-5 grid gap-3">
            {fitSignals.map((item) => (
              <p
                key={item}
                className="border-l-2 border-amber/50 pl-3 text-sm text-muted-foreground"
              >
                {item}
              </p>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Contractor Circle remains a group membership. Private consulting is limited, controlled,
            and accepted separately.
          </p>
        </Card>
      </section>

      <section id="intensive-application" className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <Card className="surface-command p-6 text-background">
          <p className="eyebrow text-amber">Application</p>
          <h2 className="mt-3 font-display text-3xl">Apply for the Six-Week Intensive.</h2>
          <p className="mt-3 text-sm leading-relaxed text-background/68">
            Applications are reviewed for fit. Complete all fields honestly so the next step is
            clear.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-background/68">
            <p className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              Applications are submitted for review before any private engagement is accepted.
            </p>
            <p className="flex gap-3">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              This does not create unlimited private consulting access.
            </p>
          </div>
        </Card>

        <Card className="surface-operating p-5 sm:p-6">
          {submitted ? (
            <div className="flex min-h-96 flex-col justify-center text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-soft text-amber">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-5 font-display text-3xl">Application received.</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                The application will be reviewed for fit. Contractor Circle remains your group
                operating room while this is being reviewed.
              </p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link to="/portal">Back to command center</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="grid gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (canSubmit) mutation.mutate();
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Full Name *">
                  <Input
                    value={form.fullName}
                    onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                    placeholder="John Smith"
                  />
                </FormField>
                <FormField label="Company Name *">
                  <Input
                    value={form.companyName}
                    onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                    placeholder="Acme Corp"
                  />
                </FormField>
              </div>

              <FormField label="Annual Revenue Range *">
                <Select
                  value={form.annualRevenueRange}
                  onValueChange={(value) => setForm({ ...form, annualRevenueRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Biggest Business Challenge Right Now *">
                <Textarea
                  value={form.biggestChallenge}
                  onChange={(event) => setForm({ ...form, biggestChallenge: event.target.value })}
                  className="min-h-28"
                  placeholder="Be specific. What's the problem keeping you up at night?"
                />
              </FormField>

              <FormField label="What Have You Already Tried? *">
                <Textarea
                  value={form.alreadyTried}
                  onChange={(event) => setForm({ ...form, alreadyTried: event.target.value })}
                  className="min-h-28"
                  placeholder="What approaches, programs, or strategies have you already attempted?"
                />
              </FormField>

              <FormField label="Which Option Are You Applying For? *">
                <Select
                  value={form.applyingFor}
                  onValueChange={(value) => setForm({ ...form, applyingFor: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Email Address *">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="you@company.com"
                  />
                </FormField>
                <FormField label="Phone Number *">
                  <Input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </FormField>
              </div>

              <Button type="submit" disabled={!canSubmit || mutation.isPending} className="h-12">
                {mutation.isPending ? "Submitting..." : "Submit Application"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Submitting does not guarantee acceptance into private advisory work.
              </p>
            </form>
          )}
        </Card>
      </section>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
