import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { generateImprovementPlan } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, AlertTriangle, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Improvement Roadmap — SpeakEval AI" }] }),
  component: RoadmapPage,
});

type Task = { id: number; title: string; description: string; done: boolean };

function RoadmapPage() {
  const qc = useQueryClient();
  const { data: plan, isLoading } = useQuery({
    queryKey: ["plan"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("improvement_plans").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });
  const gen = useServerFn(generateImprovementPlan);
  const mutation = useMutation({
    mutationFn: () => gen({}),
    onSuccess: () => { toast.success("Roadmap generated"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function toggleTask(taskId: number) {
    if (!plan) return;
    const tasks = (plan.tasks as Task[]).map((t) => t.id === taskId ? { ...t, done: !t.done } : t);
    const completed = tasks.filter((t) => t.done).length;
    await supabase.from("improvement_plans").update({ tasks, completed_tasks: completed }).eq("id", plan.id);
    qc.invalidateQueries({ queryKey: ["plan"] });
  }

  return (
    <>
      <PageHeader
        title="Personalized Improvement Roadmap"
        description="AI analyzes your assessment history and builds a targeted practice plan."
        action={
          <Button className="bg-gradient-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} {plan ? "Regenerate" : "Generate roadmap"}
          </Button>
        }
      />
      {isLoading && <div className="text-muted-foreground">Loading…</div>}
      {!isLoading && !plan && (
        <Card className="shadow-card border-0"><CardContent className="p-10 text-center text-muted-foreground">No roadmap yet. Complete a few assessments, then generate your first plan.</CardContent></Card>
      )}
      {plan && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="shadow-card border-0">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-destructive"><AlertTriangle className="size-4" /> Weak areas</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2 text-sm list-disc pl-4">{(plan.weak_areas ?? []).map((w, i) => <li key={i}>{w}</li>)}</ul></CardContent>
            </Card>
            <Card className="shadow-card border-0">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-primary"><Lightbulb className="size-4" /> Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2 text-sm list-disc pl-4">{(plan.recommendations ?? []).map((w, i) => <li key={i}>{w}</li>)}</ul></CardContent>
            </Card>
          </div>
          <Card className="shadow-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Practice tasks</CardTitle>
                <span className="text-sm text-muted-foreground">{plan.completed_tasks} / {plan.total_tasks} done</span>
              </div>
              <Progress value={(plan.total_tasks ? (plan.completed_tasks ?? 0) / plan.total_tasks * 100 : 0)} className="h-1.5 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {(plan.tasks as Task[]).map((t) => (
                <div key={t.id} className={`flex gap-3 p-3 rounded-lg border ${t.done ? "bg-success/5 border-success/20" : "bg-card"}`}>
                  <Checkbox checked={t.done} onCheckedChange={() => toggleTask(t.id)} className="mt-1" />
                  <div>
                    <div className={`font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                    <div className="text-sm text-muted-foreground">{t.description}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}