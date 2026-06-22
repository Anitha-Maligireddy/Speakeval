import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recorder } from "@/components/Recorder";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { ScoreCard } from "@/components/ScoreCard";
import { dailyTopic } from "@/lib/topics";
import { transcribeAndAnalyzeSpeaking } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Trophy, CalendarDays, Gauge, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/daily")({
  head: () => ({ meta: [{ title: "Daily Challenge — SpeakEval AI" }] }),
  component: DailyPage,
});

function DailyPage() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const topic = dailyTopic();

  const { data: state } = useQuery({
    queryKey: ["daily", today],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      // Ensure today's challenge exists
      await supabase.from("daily_challenges").upsert(
        { user_id: uid, challenge_date: today, topic },
        { onConflict: "user_id,challenge_date" },
      );
      const [{ data: today_row }, { data: history }, { data: progress }] = await Promise.all([
        supabase.from("daily_challenges").select("*").eq("user_id", uid).eq("challenge_date", today).maybeSingle(),
        supabase.from("daily_challenges").select("*").eq("user_id", uid).order("challenge_date", { ascending: false }).limit(14),
        supabase.from("user_progress").select("*").eq("user_id", uid).maybeSingle(),
      ]);
      return { today: today_row, history: history ?? [], progress };
    },
  });

  const fn = useServerFn(transcribeAndAnalyzeSpeaking);
  const mutation = useMutation({
    mutationFn: (input: { audioBase64: string; mimeType: string; durationSeconds: number }) =>
      fn({ data: { topic, ...input } }),
    onSuccess: async (result) => {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("daily_challenges").update({ completed: true, score: result.overall_score, points_awarded: 20 }).eq("user_id", u.user!.id).eq("challenge_date", today);
      toast.success("Daily challenge complete! +20 pts");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const result = mutation.data;
  const completed = state?.today?.completed;

  return (
    <>
      <PageHeader title="Daily Speaking Challenge" description="A new topic each day. Keep your streak alive, earn points, and build a daily speaking habit." />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-card border-0 bg-gradient-primary text-primary-foreground">
          <CardContent className="p-6">
            <Flame className="size-5 mb-2" />
            <div className="text-4xl font-bold">{state?.progress?.current_streak ?? 0}</div>
            <div className="text-sm opacity-80">day streak</div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="p-6"><Trophy className="size-5 mb-2 text-primary" /><div className="text-4xl font-bold">{state?.progress?.total_points ?? 0}</div><div className="text-sm text-muted-foreground">total points</div></CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="p-6"><CalendarDays className="size-5 mb-2 text-primary" /><div className="text-4xl font-bold">{state?.progress?.longest_streak ?? 0}</div><div className="text-sm text-muted-foreground">longest streak</div></CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-0 mb-6 bg-gradient-soft">
        <CardContent className="p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Today's topic</div>
          <h2 className="text-2xl font-semibold mb-4">{topic}</h2>
          {completed ? (
            <div className="rounded-lg bg-success/10 text-success p-4 flex items-center gap-3">
              <Sparkles className="size-5" /> You've completed today's challenge — score {state?.today?.score ?? 0}. Come back tomorrow!
            </div>
          ) : (
            <Recorder onComplete={(r) => mutation.mutate({ audioBase64: r.base64, mimeType: r.mimeType, durationSeconds: r.durationSeconds })} maxSeconds={60} />
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <ScoreCard label="Today's score" value={result.overall_score ?? 0} icon={Gauge} tint="primary" />
          <FeedbackPanel feedback={result.feedback} strengths={result.strengths} weaknesses={result.weaknesses} suggestions={result.suggestions} />
        </div>
      )}

      {state && state.history.length > 0 && (
        <Card className="shadow-card border-0 mt-6">
          <CardHeader><CardTitle>Challenge history</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {state.history.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{h.topic}</div>
                    <div className="text-xs text-muted-foreground">{h.challenge_date}</div>
                  </div>
                  <div className={`text-sm font-semibold ${h.completed ? "text-success" : "text-muted-foreground"}`}>
                    {h.completed ? `${h.score ?? 0} pts` : "Skipped"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}