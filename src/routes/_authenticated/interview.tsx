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
import { INTERVIEW_QUESTIONS, pickRandom, type InterviewCategory } from "@/lib/topics";
import { analyzeInterview } from "@/lib/ai.functions";
import { Shuffle, Loader2, Gauge, MessageCircle, ListTree, Smile, ShieldCheck, Award } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({ meta: [{ title: "Interview Simulator — SpeakEval AI" }] }),
  component: InterviewPage,
});

const CATS: InterviewCategory[] = ["HR", "Technical", "Situational", "Behavioral"];

function InterviewPage() {
  const qc = useQueryClient();
  const [category, setCategory] = useState<InterviewCategory>("HR");
  const [question, setQuestion] = useState<string>(() => pickRandom(INTERVIEW_QUESTIONS.HR));
  const [answer, setAnswer] = useState("");
  const fn = useServerFn(analyzeInterview);
  const mutation = useMutation({
    mutationFn: (input: { responseMode: "text" | "voice"; answer: string; audioBase64?: string; mimeType?: string }) =>
      fn({ data: { category, question, ...input } }),
    onSuccess: () => { toast.success("Answer evaluated"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const result = mutation.data;

  function newQuestion(cat: InterviewCategory) {
    setCategory(cat);
    setQuestion(pickRandom(INTERVIEW_QUESTIONS[cat]) as string);
    setAnswer("");
  }

  return (
    <>
      <PageHeader title="AI Interview Simulator" description="Practice HR, technical, situational, and behavioral interview questions. Get scored on structure, confidence, and professionalism." />
      <div className="flex flex-wrap gap-2 mb-4">
        {CATS.map((c) => (
          <Button key={c} variant={category === c ? "default" : "outline"} className={category === c ? "bg-gradient-primary" : ""} onClick={() => newQuestion(c)}>{c}</Button>
        ))}
      </div>

      <Card className="shadow-card border-0 mb-6 bg-gradient-soft">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{category} question</div>
              <p className="text-lg font-medium">{question}</p>
            </div>
            <Button variant="outline" onClick={() => newQuestion(category)}><Shuffle className="size-4" /> New</Button>
          </div>
          <Tabs defaultValue="text">
            <TabsList><TabsTrigger value="text">Type</TabsTrigger><TabsTrigger value="voice">Speak</TabsTrigger></TabsList>
            <TabsContent value="text" className="space-y-3">
              <Textarea rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Use STAR: Situation, Task, Action, Result..." />
              <Button className="bg-gradient-primary" disabled={mutation.isPending || answer.trim().length < 20} onClick={() => mutation.mutate({ responseMode: "text", answer })}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />} Submit answer
              </Button>
            </TabsContent>
            <TabsContent value="voice">
              <Recorder onComplete={(r) => mutation.mutate({ responseMode: "voice", answer: "", audioBase64: r.base64, mimeType: r.mimeType })} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <ScoreCard label="Overall" value={result.overall_score ?? 0} icon={Gauge} tint="primary" />
            <ScoreCard label="Answer quality" value={result.answer_quality_score ?? 0} icon={Award} tint="secondary" />
            <ScoreCard label="Communication" value={result.communication_score ?? 0} icon={MessageCircle} tint="accent" />
            <ScoreCard label="Structure" value={result.structure_score ?? 0} icon={ListTree} tint="success" />
            <ScoreCard label="Confidence" value={result.confidence_score ?? 0} icon={Smile} tint="primary" />
            <ScoreCard label="Professionalism" value={result.professionalism_score ?? 0} icon={ShieldCheck} tint="secondary" />
          </div>
          {result.answer && (
            <Card className="shadow-card border-0">
              <CardHeader><CardTitle className="text-sm">Your answer</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground italic">"{result.answer}"</CardContent>
            </Card>
          )}
          <FeedbackPanel feedback={result.feedback} strengths={result.strengths} weaknesses={result.weaknesses} suggestions={result.suggestions} />
        </div>
      )}
    </>
  );
}