import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(false);

  const onDiscord = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: window.location.origin + "/portal",
        scopes: "identify email",
      },
    });
    setLoading(false);
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
              Circle access is tied to your Discord community identity.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Not a member yet?{" "}
              <Link to="/join" className="text-foreground underline underline-offset-4">
                Join the Circle
              </Link>
            </p>
          </div>

          <Button className="w-full" onClick={onDiscord} disabled={loading}>
            <MessageCircle className="mr-2 h-4 w-4" />
            {loading ? "Opening Discord…" : "Continue with Discord"}
          </Button>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Use the Discord account connected to your Contractor Circle membership. If Discord asks
            for an account, create one there and continue.
          </p>
        </div>
      </div>
    </div>
  );
}
