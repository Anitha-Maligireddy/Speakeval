import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Recorder } from "@/components/Recorder";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { ScoreCard } from "@/components/ScoreCard";
import { SCENARIOS, pickRandom } from "@/lib/topics";
import { analyzeScenario } from "@/lib/ai.functions";
import { Shuffle, Loader2, Gauge, MessageCircle, ShieldCheck, Brain, Smile, Target } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/scenario")({
  head: () => ({ meta: [{ title: "Scenario Assessment — SpeakEval AI" }] }),
  component: ScenarioPage,
});

function ScenarioPage() {
  const qc = useQueryClient();
  const [scenario, setScenario] = useState(() => pickRandom(SCENARIOS));
  const [response, setResponse] = useState("");
  const fn = useServerFn(analyzeScenario);
  const mutation = useMutation({
    mutationFn: (input: { responseMode: "text" | "voice"; response: string; audioBase64?: string; mimeType?: string }) =>
      fn({ data: { scenario, ...input } }),
    onSuccess: () => { toast.success("Scenario evaluated"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const result = mutation.data;

  return (
    <>
      <PageHeader title="Scenario-Based Communication" description="Real workplace situations. Respond by voice or text — get scored on professionalism, EQ, problem-solving, and clarity." />
      <Card className="shadow-card border-0 mb-6 bg-gradient-soft">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Scenario</div>
              <p className="text-base leading-relaxed">{scenario}</p>
            </div>
            <Button variant="outline" onClick={() => { setScenario(pickRandom(SCENARIOS)); setResponse(""); }}><Shuffle className="size-4" /> New</Button>
          </div>
          <Tabs defaultValue="text">
            <TabsList><TabsTrigger value="text">Type response</TabsTrigger><TabsTrigger value="voice">Speak response</TabsTrigger></TabsList>
            <TabsContent value="text" className="space-y-3">
              <Textarea rows={6} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="How would you handle this..." />
              <Button className="bg-gradient-primary" disabled={mutation.isPending || response.trim().length < 20} onClick={() => mutation.mutate({ responseMode: "text", response })}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />} Submit response
              </Button>
            </TabsContent>
            <TabsContent value="voice">
              <Recorder onComplete={(r) => mutation.mutate({ responseMode: "voice", response: "", audioBase64: r.base64, mimeType: r.mimeType })} />
              {mutation.isPending && <div className="text-center text-sm text-muted-foreground">Analyzing…</div>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <ScoreCard label="Overall" value={result.overall_score ?? 0} icon={Gauge} tint="primary" />
            <ScoreCard label="Communication" value={result.communication_score ?? 0} icon={MessageCircle} tint="secondary" />
            <ScoreCard label="Professionalism" value={result.professionalism_score ?? 0} icon={ShieldCheck} tint="accent" />
            <ScoreCard label="Problem solving" value={result.problem_solving_score ?? 0} icon={Brain} tint="success" />
            <ScoreCard label="Emotional IQ" value={result.emotional_intelligence_score ?? 0} icon={Smile} tint="primary" />
            <ScoreCard label="Clarity" value={result.clarity_score ?? 0} icon={Target} tint="secondary" />
          </div>
          {result.response && (
            <Card className="shadow-card border-0">
              <CardHeader><CardTitle className="text-sm">Your response</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground italic">"{result.response}"</CardContent>
            </Card>
          )}
          <FeedbackPanel feedback={result.feedback} strengths={result.strengths} weaknesses={result.weaknesses} suggestions={result.suggestions} />
        </div>
      )}
    </>
  );
}