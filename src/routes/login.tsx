import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ALP Contractor Circle" },
      { name: "description", content: "Sign in to the ALP Contractor Circle member portal." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      toast.error("Enter the email tied to your Circle membership.");
      return;
    }

    setEmailLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: window.location.origin + "/portal",
        shouldCreateUser: true,
      },
    });
    setEmailLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setEmailSent(true);
    toast.success("Check your email for a secure sign-in link.");
  };

  const onPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      toast.error("Enter your membership email and password.");
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    setPasswordLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed in.");
    window.location.assign("/portal");
  };

  const onDiscord = async () => {
    setDiscordLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: window.location.origin + "/portal",
        scopes: "identify email",
      },
    });
    setDiscordLoading(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-background">
        <Link to="/" className="font-display text-2xl tracking-tight">
          ALP<span className="text-amber">.</span>
        </Link>
        <motion.blockquote
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <p className="font-display text-3xl leading-tight">
            "The Circle is the only room I've been in where the conversation skips the small talk
            and goes straight to bid math."
          </p>
          <footer className="mt-6 text-sm text-background/60">— Member, $14M residential GC</footer>
        </motion.blockquote>
        <div className="text-xs text-background/50">© Altitude Logic Pressure</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h1 className="font-display text-3xl">Sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the email tied to your paid or comped Contractor Circle membership.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Not a member yet?{" "}
              <Link to="/join" className="text-foreground underline underline-offset-4">
                Join the Circle
              </Link>
            </p>
          </div>

          <form className="space-y-3" onSubmit={onEmail}>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Membership email
            </label>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailSent(false);
              }}
              placeholder="you@company.com"
            />
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
            <Button
              className="w-full"
              type="button"
              variant="default"
              disabled={passwordLoading}
              onClick={onPassword}
            >
              <Lock className="mr-2 h-4 w-4" />
              {passwordLoading ? "Signing in..." : "Sign in with password"}
            </Button>
            <Button className="w-full" type="submit" disabled={emailLoading}>
              <Mail className="mr-2 h-4 w-4" />
              {emailLoading ? "Sending link…" : "Email me a secure login link"}
            </Button>
            <div className="flex justify-end">
              <Link
                to="/reset-password"
                className="text-xs text-muted-foreground underline underline-offset-4"
              >
                Reset password
              </Link>
            </div>
            {emailSent ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Open the link from this browser and the portal will match that email against the
                active Circle roster.
              </p>
            ) : null}
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-hairline" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">Community sign-in</span>
            </div>
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={onDiscord}
            disabled={discordLoading}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {discordLoading ? "Opening Discord…" : "Continue with Discord"}
          </Button>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Discord remains the community layer. If your purchase email and Discord email are
            different, use email sign-in first.
          </p>
        </div>
      </div>
    </div>
  );
}
