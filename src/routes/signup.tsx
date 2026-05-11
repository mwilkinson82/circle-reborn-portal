import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — ALP Contractor Circle" },
      { name: "description", content: "Join the ALP Contractor Circle." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/portal",
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.user && data.user.identities?.length === 0) {
      toast.info("That email already has an account. Use Forgot password to set or change your password.");
      navigate({ to: "/reset-password" });
      return;
    }
    toast.success("Check your email to confirm.");
    navigate({ to: "/login" });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/portal" });
    if (result.error) toast.error(result.error.message ?? "Sign-up failed");
    if (!result.redirected && !result.error) navigate({ to: "/portal" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <Link to="/" className="font-display text-2xl tracking-tight">ALP<span className="text-amber">.</span></Link>
          <h1 className="font-display text-3xl mt-8">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already a member?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-4">Sign in</Link>
          </p>
        </div>

        <Button variant="outline" className="w-full" onClick={onGoogle}>
          Continue with Google
        </Button>

        <div className="relative text-center">
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <span className="relative bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">or</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          By continuing, you agree to ALP's terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
