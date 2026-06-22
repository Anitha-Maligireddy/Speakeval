import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { ScoreCard } from "@/components/ScoreCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MessageSquare, Briefcase, TrendingUp, Sparkles, Flame, Trophy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SpeakEval AI" }] }),
  component: Dashboard,
});

function avg(rows: Array<{ overall_score: number | null }> | null | undefined) {
  if (!rows?.length) return 0;
  return Math.round(rows.reduce((a, r) => a + (r.overall_score ?? 0), 0) / rows.length);
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const [sp, sc, iv, rs, pr] = await Promise.all([
        supabase.from("speaking_assessments").select("overall_score, created_at, topic").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("scenario_assessments").select("overall_score, created_at").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("interview_assessments").select("overall_score, created_at, category").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("resume_assessments").select("overall_score, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(1),
        supabase.from("user_progress").select("*").eq("user_id", uid).maybeSingle(),
      ]);
      return { sp: sp.data ?? [], sc: sc.data ?? [], iv: iv.data ?? [], rs: rs.data ?? [], progress: pr.data };
    },
  });

  if (isLoading || !data) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Card key={i} className="h-32 animate-pulse" />)}</div>;

  const speaking = avg(data.sp);
  const interview = avg(data.iv);
  const scenario = avg(data.sc);
  const resume = data.rs[0]?.overall_score ?? 0;
  const overall = Math.round(speaking * 0.3 + scenario * 0.25 + interview * 0.25 + resume * 0.2);
  const interviewReadiness = Math.round(interview * 0.7 + speaking * 0.3);
  const career = Math.round(speaking * 0.25 + interview * 0.3 + scenario * 0.2 + resume * 0.25);

  const recentSpeaking = [...data.sp].slice(0, 8).reverse().map((r, i) => ({ x: `#${i + 1}`, score: r.overall_score ?? 0 }));
  const recentInterview = [...data.iv].slice(0, 8).reverse().map((r, i) => ({ x: `#${i + 1}`, score: r.overall_score ?? 0 }));
  const recentScenario = [...data.sc].slice(0, 8).reverse().map((r, i) => ({ x: `#${i + 1}`, score: r.overall_score ?? 0 }));

  return (
    <>
      <PageHeader
        title="Welcome back 👋"
        description="Track your communication, interview, and career readiness in one place."
        action={
          <Link to="/speaking"><Button className="bg-gradient-primary text-primary-foreground shadow-glow"><Mic className="size-4" /> Start a speaking session</Button></Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <ScoreCard label="Communication" value={overall} icon={Sparkles} tint="primary" />
        <ScoreCard label="Interview Readiness" value={interviewReadiness} icon={Briefcase} tint="secondary" />
        <ScoreCard label="Career Readiness" value={career} icon={TrendingUp} tint="accent" />
        <ScoreCard label="Scenario Handling" value={scenario} icon={MessageSquare} tint="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2 shadow-card border-0">
          <CardHeader><CardTitle>Speaking progress</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentSpeaking.length ? recentSpeaking : [{ x: "—", score: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="x" stroke="var(--color-muted-foreground)" />
                  <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 bg-gradient-primary text-primary-foreground">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2"><Flame className="size-5" /><span className="font-semibold">Streak</span></div>
            <div className="text-5xl font-bold">{data.progress?.current_streak ?? 0}<span className="text-xl opacity-80"> days</span></div>
            <div className="flex items-center gap-2 text-sm opacity-90"><Trophy className="size-4" /> {data.progress?.total_points ?? 0} points earned</div>
            <Link to="/daily"><Button variant="secondary" className="w-full mt-2">Today's challenge →</Button></Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle>Interview progress</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentInterview.length ? recentInterview : [{ x: "—", score: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="x" stroke="var(--color-muted-foreground)" />
                  <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="var(--color-secondary)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle>Scenario handling</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentScenario.length ? recentScenario : [{ x: "—", score: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="x" stroke="var(--color-muted-foreground)" />
                  <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}