import { Link, useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Mic,
  MessageSquare,
  Briefcase,
  FileText,
  Map,
  CalendarDays,
  TrendingUp,
  Sparkles,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/speaking", label: "Speaking", icon: Mic },
  { to: "/scenario", label: "Scenarios", icon: MessageSquare },
  { to: "/interview", label: "Interview", icon: Briefcase },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/daily", label: "Daily Challenge", icon: CalendarDays },
  { to: "/career", label: "Career Readiness", icon: TrendingUp },
  { to: "/mentor", label: "AI Mentor", icon: Sparkles },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      return {
        id: u.user.id,
        email: p?.email ?? u.user.email ?? null,
        full_name: p?.full_name ?? null,
        isAdmin: roles?.some((r) => r.role === "admin") ?? false,
      };
    },
  });

  useEffect(() => setOpen(false), [location.pathname]);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const navItems = profile?.isAdmin
    ? [...NAV, { to: "/admin" as const, label: "Admin", icon: Shield }]
    : NAV;

  return (
    <div className="flex min-h-screen bg-gradient-soft">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="size-9 rounded-xl bg-gradient-primary shadow-glow grid place-items-center">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">SpeakEval<span className="text-gradient">AI</span></span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 space-y-2">
          <div className="flex items-center gap-3 px-2">
            <div className="size-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-semibold">
              {(profile?.full_name ?? profile?.email ?? "U")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{profile?.full_name ?? "User"}</div>
              <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 border-b bg-card/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-primary grid place-items-center">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-bold">SpeakEval<span className="text-gradient">AI</span></span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-background/95 backdrop-blur p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent">
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <Button variant="outline" className="w-full mt-4" onClick={handleSignOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      )}

      <main className="flex-1 min-w-0 px-4 lg:px-10 pt-20 lg:pt-8 pb-16 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}