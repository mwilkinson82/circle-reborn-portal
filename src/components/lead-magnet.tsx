import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarketingHeader, MarketingFooter } from "@/components/marketing-shell";
import { supabase } from "@/integrations/supabase/client";

export interface LeadMagnetProps {
  source: string;
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  bullets: string[];
  thankYouPath: string;
  ctaLabel?: string;
}

export function LeadMagnetPage({
  source,
  eyebrow,
  title,
  intro,
  bullets,
  thankYouPath,
  ctaLabel = "Send it to me",
}: LeadMagnetProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("leads").insert({
      email: email.trim().toLowerCase(),
      name: name.trim() || null,
      company: company.trim() || null,
      source,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    setSubmitting(false);
    if (insertError) {
      setError("Something went wrong. Try again in a moment.");
      return;
    }
    navigate({ to: thankYouPath });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />

      <main className="container-prose py-20 grid lg:grid-cols-2 gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber">
            <Download className="h-3.5 w-3.5" /> {eyebrow}
          </span>
          <h1 className="font-display text-5xl sm:text-6xl mt-6 leading-[1.05]">{title}</h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{intro}</p>

          <ul className="mt-10 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <Check className="h-4 w-4 text-amber mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <form
          onSubmit={onSubmit}
          className="border border-hairline bg-elevated p-8 sm:p-10 sticky top-8"
        >
          <h2 className="font-display text-2xl">Where should we send it?</h2>
          <p className="text-sm text-muted-foreground mt-1">No spam. Cancel anytime in one click.</p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lm-email">Email</Label>
              <Input
                id="lm-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lm-name">First name</Label>
                <Input
                  id="lm-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marshall"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lm-company">Company</Label>
                <Input
                  id="lm-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" className="w-full mt-6" disabled={submitting}>
            {submitting ? "Sending…" : ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Already a member? <Link to="/login" className="text-amber hover:underline">Sign in</Link>
          </p>
        </form>
      </main>

      <MarketingFooter />
    </div>
  );
}

export interface LeadThankYouProps {
  title: React.ReactNode;
  body: string;
  downloadUrl?: string;
  downloadLabel?: string;
}

export function LeadThankYou({ title, body, downloadUrl, downloadLabel }: LeadThankYouProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />
      <main className="container-prose py-32 max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber">
          <Check className="h-4 w-4" /> Sent
        </span>
        <h1 className="font-display text-5xl sm:text-6xl mt-6 leading-[1.05]">{title}</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{body}</p>

        <div className="mt-10 flex flex-wrap gap-3">
          {downloadUrl && (
            <Button asChild size="lg">
              <a href={downloadUrl} target="_blank" rel="noreferrer">
                <Download className="mr-2 h-4 w-4" /> {downloadLabel ?? "Download now"}
              </a>
            </Button>
          )}
          <Button asChild size="lg" variant="ghost">
            <Link to="/">Back to ALP</Link>
          </Button>
        </div>

        <div className="mt-16 border-t border-hairline pt-10">
          <p className="font-mono text-xs uppercase tracking-wider text-amber mb-3">While you're here</p>
          <h3 className="font-display text-2xl">Want the full operating room?</h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            The Circle gets you weekly live calls with Marshall, the full template library, and the ConstructLine beta tools.
          </p>
          <Button asChild className="mt-6">
            <Link to="/join">Join the Circle <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
