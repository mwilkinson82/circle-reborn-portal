import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  PlayCircle,
  FileText,
  Calendar,
  Ruler,
  BookOpen,
  UserCircle,
  Shield,
  LogOut,
  Hammer,
  Wrench,
  Users,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

const main = [
  { title: "Home", url: "/portal", icon: Home },
  { title: "Replays", url: "/portal/replays", icon: PlayCircle },
  { title: "Templates", url: "/portal/templates", icon: FileText },
];

const tools = [
  { title: "ConstructLine Hub", url: "/portal/constructline", icon: Wrench },
  { title: "Basis (Takeoffs)", url: "/portal/takeoff", icon: Ruler },
  { title: "Baseline (Scheduler)", url: "/portal/scheduler", icon: Calendar },
  { title: "Cost Library", url: "/portal/cost-library", icon: BookOpen },
  { title: "Trade Rate Library", url: "/portal/labor-library", icon: Users },
];

const account = [
  { title: "Account", url: "/portal/account", icon: UserCircle },
  { title: "Admin", url: "/portal/admin", icon: Shield },
];

export function PortalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();

  const isActive = (url: string) =>
    pathname === url || (url !== "/portal" && pathname.startsWith(url));

  const renderItems = (items: typeof main) =>
    items.map((item) => (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton
          asChild
          isActive={isActive(item.url)}
          className="h-9 rounded-sm data-[active=true]:bg-foreground data-[active=true]:text-background"
        >
          <Link to={item.url} className="flex items-center gap-3">
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <Hammer className="h-4 w-4" />
          </span>
          {!collapsed && (
            <span>
              <span className="block font-display text-lg leading-none tracking-tight">
                ALP<span className="text-amber">.</span>
              </span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-sidebar-foreground/55">
                Contractor Circle
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 py-2">
        <SidebarGroup>
          <SidebarGroupLabel>Member area</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(main)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-1.5">
            Contractor tools
            {!collapsed && <ExternalLink className="h-3 w-3 opacity-60" />}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(tools)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(account)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="truncate">{user?.email ?? "Sign out"}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
