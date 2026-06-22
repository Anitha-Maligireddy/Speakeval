import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recorder } from "@/components/Recorder";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { ScoreCard } from "@/components/ScoreCard";
import { SPEAKING_TOPICS, pickRandom } from "@/lib/topics";
import { transcribeAndAnalyzeSpeaking } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Shuffle, Mic, Gauge, BookOpen, Brain, Target, Zap, Smile } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/speaking")({
  head: () => ({ meta: [{ title: "Speaking Assessment — SpeakEval AI" }] }),
  component: SpeakingPage,
});

function SpeakingPage() {
  const qc = useQueryClient();
  const [topic, setTopic] = useState(() => pickRandom(SPEAKING_TOPICS));
  const analyze = useServerFn(transcribeAndAnalyzeSpeaking);
  const mutation = useMutation({
    mutationFn: (input: { audioBase64: string; mimeType: string; durationSeconds: number }) =>
      analyze({ data: { topic, ...input } }),
    onSuccess: () => {
      toast.success("Assessment complete");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data: history } = useQuery({
    queryKey: ["speaking-history"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("speaking_assessments").select("*").eq("user_id", u.user!.id)
        .order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const result = mutation.data;

  return (
    <>
      <PageHeader title="AI Speaking Assessment" description="Speak about a topic for up to 2 minutes. We'll transcribe with Whisper and score you on 6 dimensions." />

      <Card className="shadow-card border-0 mb-6 bg-gradient-soft">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Your topic</div>
              <div className="text-2xl font-semibold">{topic}</div>
            </div>
            <Button variant="outline" onClick={() => setTopic(pickRandom(SPEAKING_TOPICS))}><Shuffle className="size-4" /> New topic</Button>
          </div>
          <Recorder onComplete={(r) => mutation.mutate({ audioBase64: r.base64, mimeType: r.mimeType, durationSeconds: r.durationSeconds })} />
          {mutation.isPending && <div className="text-center text-sm text-muted-foreground">Transcribing & analyzing…</div>}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <ScoreCard label="Overall" value={result.overall_score ?? 0} icon={Gauge} tint="primary" />
            <ScoreCard label="Fluency" value={result.fluency_score ?? 0} icon={Zap} tint="secondary" />
            <ScoreCard label="Grammar" value={result.grammar_score ?? 0} icon={BookOpen} tint="accent" />
            <ScoreCard label="Vocabulary" value={result.vocabulary_score ?? 0} icon={Brain} tint="success" />
            <ScoreCard label="Relevance" value={result.relevance_score ?? 0} icon={Target} tint="primary" />
            <ScoreCard label="Confidence" value={result.confidence_score ?? 0} icon={Smile} tint="secondary" />
          </div>
          {result.transcript && (
            <Card className="shadow-card border-0">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mic className="size-4" /> Transcript</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground italic">"{result.transcript}"</CardContent>
            </Card>
          )}
          <FeedbackPanel feedback={result.feedback} strengths={result.strengths} weaknesses={result.weaknesses} suggestions={result.suggestions} />
        </div>
      )}

      {history && history.length > 0 && (
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle>Recent sessions</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{h.topic}</div>
                    <div className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-2xl font-bold text-gradient">{h.overall_score ?? 0}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}