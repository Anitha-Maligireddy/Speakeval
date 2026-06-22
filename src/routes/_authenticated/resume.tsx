import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { ScoreCard } from "@/components/ScoreCard";
import { analyzeResume, generateResumeQuestions, analyzeInterview } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, FileText, ListChecks, Wrench, Star, BookOpen, FolderOpen, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume Evaluation — SpeakEval AI" }] }),
  component: ResumePage,
});

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function ResumePage() {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fn = useServerFn(analyzeResume);
  const genFn = useServerFn(generateResumeQuestions);
  const interviewFn = useServerFn(analyzeInterview);
  const [questions, setQuestions] = useState<Array<{ category: string; question: string }> | null>(null);
  const [showQuestionsPrompt, setShowQuestionsPrompt] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittingIdx, setSubmittingIdx] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Select a PDF or DOCX first");
      setUploading(true);
      const { data: u } = await supabase.auth.getUser();
      const path = `${u.user!.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, file);
      if (upErr) throw upErr;
      const fileBase64 = await fileToBase64(file);
      setUploading(false);
      return fn({ data: { filePath: path, fileName: file.name, fileBase64, mimeType: file.type || "application/pdf" } });
    },
    onSuccess: () => {
      toast.success("Resume analyzed");
      qc.invalidateQueries();
      setShowQuestionsPrompt(true);
      setQuestions(null);
      setAnswers({});
      setScores({});
    },
    onError: (e: Error) => { setUploading(false); toast.error(e.message); },
  });

  const { data: history } = useQuery({
    queryKey: ["resume-history"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("resume_assessments").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const result = mutation.data;

  const startAssessment = async () => {
    if (!result?.id) return;
    try {
      const qs = await genFn({ data: { resumeId: result.id } });
      setQuestions(qs);
      setShowQuestionsPrompt(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const submitAnswer = async (idx: number, q: { category: string; question: string }) => {
    const answer = (answers[idx] ?? "").trim();
    if (answer.length < 20) { toast.error("Write a fuller answer (20+ chars)"); return; }
    setSubmittingIdx(idx);
    try {
      const row = await interviewFn({ data: { category: `Resume · ${q.category}`, question: q.question, answer, responseMode: "text" } });
      setScores((s) => ({ ...s, [idx]: row?.overall_score ?? 0 }));
      toast.success(`Scored ${row?.overall_score ?? 0}/100`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmittingIdx(null);
    }
  };

  return (
    <>
      <PageHeader title="Resume Evaluation" description="Upload your PDF or DOCX — AI extracts the content automatically and scores structure, ATS compatibility, skills, projects, and more." />
      <Card className="shadow-card border-0 mb-6 bg-gradient-soft">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload resume (PDF or DOCX)</label>
            <Input type="file" accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <p className="text-xs text-muted-foreground mt-2">Text-based PDFs only (not scanned images). Content is extracted automatically — no need to paste anything.</p>
          </div>
          <Button className="bg-gradient-primary" onClick={() => mutation.mutate()} disabled={!file || mutation.isPending || uploading}>
            {(mutation.isPending || uploading) ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {(mutation.isPending || uploading) ? " Analyzing…" : " Analyze resume"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            <ScoreCard label="Overall" value={result.overall_score ?? 0} icon={FileText} tint="primary" />
            <ScoreCard label="ATS" value={result.ats_score ?? 0} icon={ShieldCheck} tint="success" />
            <ScoreCard label="Structure" value={result.structure_score ?? 0} icon={ListChecks} tint="secondary" />
            <ScoreCard label="Skills" value={result.skills_score ?? 0} icon={Wrench} tint="accent" />
            <ScoreCard label="Formatting" value={result.formatting_score ?? 0} icon={Star} tint="success" />
            <ScoreCard label="Summary" value={result.summary_score ?? 0} icon={BookOpen} tint="primary" />
            <ScoreCard label="Projects" value={result.projects_score ?? 0} icon={FolderOpen} tint="secondary" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-card border-0"><CardHeader className="pb-2"><CardTitle className="text-sm">Technical skills</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">{(result.technical_skills ?? []).map((s: string, i: number) => <Badge key={i} variant="secondary">{s}</Badge>)}</CardContent></Card>
            <Card className="shadow-card border-0"><CardHeader className="pb-2"><CardTitle className="text-sm">Soft skills</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">{(result.soft_skills ?? []).map((s: string, i: number) => <Badge key={i} variant="outline">{s}</Badge>)}</CardContent></Card>
            <Card className="shadow-card border-0"><CardHeader className="pb-2"><CardTitle className="text-sm">Projects detected</CardTitle></CardHeader>
              <CardContent><ul className="text-sm list-disc pl-4 space-y-1">{(result.projects_detected ?? []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></CardContent></Card>
            <Card className="shadow-card border-0"><CardHeader className="pb-2"><CardTitle className="text-sm">Certifications</CardTitle></CardHeader>
              <CardContent><ul className="text-sm list-disc pl-4 space-y-1">{(result.certifications ?? []).map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></CardContent></Card>
          </div>

          <FeedbackPanel feedback={result.feedback} strengths={result.strengths} weaknesses={result.weaknesses} suggestions={result.suggestions} />

          {showQuestionsPrompt && (
            <Card className="shadow-card border-0 bg-gradient-primary text-primary-foreground">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="font-semibold flex items-center gap-2"><Sparkles className="size-4" /> Resume analysis completed</div>
                  <div className="text-sm opacity-90">Would you like to answer interview questions based on your resume?</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={startAssessment}>Start Assessment</Button>
                  <Button variant="ghost" className="text-primary-foreground hover:bg-white/10" onClick={() => setShowQuestionsPrompt(false)}>Maybe Later</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {questions && questions.length > 0 && (
            <Card className="shadow-card border-0">
              <CardHeader><CardTitle>Resume-based interview questions</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {questions.map((q, i) => (
                  <div key={i} className="space-y-2 border-b last:border-0 pb-4 last:pb-0">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">{q.category}</div>
                    <div className="font-medium">{i + 1}. {q.question}</div>
                    <textarea
                      className="w-full rounded-lg border bg-background p-3 text-sm"
                      rows={4}
                      value={answers[i] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                      placeholder="Type your answer…"
                    />
                    <div className="flex items-center gap-3">
                      <Button size="sm" onClick={() => submitAnswer(i, q)} disabled={submittingIdx === i}>
                        {submittingIdx === i ? <Loader2 className="size-4 animate-spin" /> : null} Submit answer
                      </Button>
                      {scores[i] != null && <span className="text-sm font-semibold text-gradient">Score: {scores[i]}/100</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {history && history.length > 0 && (
        <Card className="shadow-card border-0 mt-8">
          <CardHeader><CardTitle>Previous resumes</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{h.file_name}</div>
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