import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreCard } from "@/components/ScoreCard";
import { computeCareerReadiness } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Briefcase, MessageSquare, FileText, TrendingUp, Loader2 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/career")({
  head: () => ({ meta: [{ title: "Career Readiness — SpeakEval AI" }] }),
  component: CareerPage,
});

function CareerPage() {
  const qc = useQueryClient();
  const { data: latest } = useQuery({
    queryKey: ["career"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("career_readiness_scores").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });
  const fn = useServerFn(computeCareerReadiness);
  const mutation = useMutation({
    mutationFn: () => fn({}),
    onSuccess: () => { toast.success("Readiness updated"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const data = mutation.data ?? latest;

  const radar = data ? [
    { axis: "Speaking", value: data.speaking_avg ?? 0 },
    { axis: "Interview", value: data.interview_avg ?? 0 },
    { axis: "Scenarios", value: data.scenario_avg ?? 0 },
    { axis: "Resume", value: data.resume_score ?? 0 },
  ] : [];

  const levelColor = data?.level === "Highly Employable" ? "text-success" : data?.level === "Job Ready" ? "text-primary" : data?.level === "Developing" ? "text-accent-foreground" : "text-muted-foreground";

  return (
    <>
      <PageHeader
        title="Career Readiness Predictor"
        description="Composite score across all assessments — classifies you Beginner → Highly Employable."
        action={
          <Button className="bg-gradient-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <TrendingUp className="size-4" />} Recompute
          </Button>
        }
      />

      {!data && <Card className="shadow-card border-0"><CardContent className="p-10 text-center text-muted-foreground">Take some assessments, then compute your readiness.</CardContent></Card>}

      {data && (
        <>
          <Card className="shadow-card border-0 bg-gradient-hero text-primary-foreground mb-6">
            <CardContent className="p-8 grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="text-sm uppercase tracking-wider opacity-80 mb-2">Your level</div>
                <div className="text-5xl font-bold mb-2">{data.level}</div>
                <div className="text-7xl font-bold">{data.overall_score}<span className="text-2xl opacity-80">/100</span></div>
                <p className="mt-4 opacity-90 max-w-md">{data.insights}</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radar}>
                    <PolarGrid stroke="rgba(255,255,255,0.3)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "white", fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} stroke="rgba(255,255,255,0.3)" />
                    <Radar dataKey="value" fill="white" fillOpacity={0.4} stroke="white" strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ScoreCard label="Speaking avg" value={data.speaking_avg ?? 0} icon={Mic} tint="primary" />
            <ScoreCard label="Interview avg" value={data.interview_avg ?? 0} icon={Briefcase} tint="secondary" />
            <ScoreCard label="Scenario avg" value={data.scenario_avg ?? 0} icon={MessageSquare} tint="accent" />
            <ScoreCard label="Resume" value={data.resume_score ?? 0} icon={FileText} tint="success" />
          </div>
        </>
      )}
    </>
  );
}