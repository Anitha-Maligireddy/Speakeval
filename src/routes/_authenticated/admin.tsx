import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, BarChart3, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Analytics — SpeakEval AI" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [{ count: totalUsers }, sp, sc, iv] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("speaking_assessments").select("overall_score, weaknesses, created_at"),
        supabase.from("scenario_assessments").select("overall_score, weaknesses, created_at"),
        supabase.from("interview_assessments").select("overall_score, weaknesses, created_at"),
      ]);
      const all = [...(sp.data ?? []), ...(sc.data ?? []), ...(iv.data ?? [])];
      const totalAssessments = all.length;
      const avg = all.length ? Math.round(all.reduce((a, r) => a + (r.overall_score ?? 0), 0) / all.length) : 0;
      const weakCount: Record<string, number> = {};
      for (const r of all) for (const w of (r.weaknesses ?? [])) weakCount[w] = (weakCount[w] ?? 0) + 1;
      const topWeak = Object.entries(weakCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: name.slice(0, 32), value }));
      // user growth by day
      const { data: profiles } = await supabase.from("profiles").select("created_at").order("created_at");
      const growth: Record<string, number> = {};
      let running = 0;
      for (const p of profiles ?? []) {
        const d = p.created_at.slice(0, 10);
        running += 1;
        growth[d] = running;
      }
      const growthData = Object.entries(growth).slice(-30).map(([date, count]) => ({ date: date.slice(5), users: count }));
      return { totalUsers: totalUsers ?? 0, totalAssessments, avg, topWeak, growthData };
    },
  });

  if (!data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <>
      <PageHeader title="Admin Analytics" description="Platform-wide usage and quality metrics." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card border-0"><CardContent className="p-6"><Users className="size-5 text-primary mb-2" /><div className="text-3xl font-bold">{data.totalUsers}</div><div className="text-sm text-muted-foreground">Total users</div></CardContent></Card>
        <Card className="shadow-card border-0"><CardContent className="p-6"><BarChart3 className="size-5 text-primary mb-2" /><div className="text-3xl font-bold">{data.totalAssessments}</div><div className="text-sm text-muted-foreground">Assessments</div></CardContent></Card>
        <Card className="shadow-card border-0"><CardContent className="p-6"><TrendingUp className="size-5 text-primary mb-2" /><div className="text-3xl font-bold">{data.avg}</div><div className="text-sm text-muted-foreground">Avg score</div></CardContent></Card>
        <Card className="shadow-card border-0"><CardContent className="p-6"><AlertTriangle className="size-5 text-primary mb-2" /><div className="text-3xl font-bold">{data.topWeak.length}</div><div className="text-sm text-muted-foreground">Tracked weak areas</div></CardContent></Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle>User growth</CardTitle></CardHeader>
          <CardContent><div className="h-64"><ResponsiveContainer><BarChart data={data.growthData}><CartesianGrid stroke="var(--color-border)" /><XAxis dataKey="date" stroke="var(--color-muted-foreground)" /><YAxis stroke="var(--color-muted-foreground)" /><Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} /><Bar dataKey="users" fill="var(--color-primary)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle>Most common weak areas</CardTitle></CardHeader>
          <CardContent><div className="h-64"><ResponsiveContainer><BarChart data={data.topWeak} layout="vertical"><CartesianGrid stroke="var(--color-border)" /><XAxis type="number" stroke="var(--color-muted-foreground)" /><YAxis type="category" dataKey="name" width={140} stroke="var(--color-muted-foreground)" fontSize={11} /><Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} /><Bar dataKey="value" fill="var(--color-secondary)" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div></CardContent>
        </Card>
      </div>
    </>
  );
}