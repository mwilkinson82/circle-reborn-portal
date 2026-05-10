import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PortalSidebar } from "@/components/portal-sidebar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumb = pathname.replace(/^\/portal\/?/, "") || "Dashboard";
  const title = crumb.charAt(0).toUpperCase() + crumb.slice(1).replace(/-/g, " ");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PortalSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-hairline px-4 sticky top-0 bg-background/80 backdrop-blur z-10">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{title}</span>
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
