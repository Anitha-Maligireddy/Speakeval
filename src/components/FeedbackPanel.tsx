import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

export function FeedbackPanel({ feedback, strengths, weaknesses, suggestions }: {
  feedback?: string | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  suggestions?: string[] | null;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-card border-0">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-success"><CheckCircle2 className="size-4" /> Strengths</CardTitle></CardHeader>
        <CardContent><ul className="text-sm space-y-2 list-disc pl-4">{(strengths ?? []).map((s, i) => <li key={i}>{s}</li>)}</ul></CardContent>
      </Card>
      <Card className="shadow-card border-0">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-destructive"><AlertTriangle className="size-4" /> Weaknesses</CardTitle></CardHeader>
        <CardContent><ul className="text-sm space-y-2 list-disc pl-4">{(weaknesses ?? []).map((s, i) => <li key={i}>{s}</li>)}</ul></CardContent>
      </Card>
      <Card className="shadow-card border-0">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-primary"><Lightbulb className="size-4" /> Suggestions</CardTitle></CardHeader>
        <CardContent><ul className="text-sm space-y-2 list-disc pl-4">{(suggestions ?? []).map((s, i) => <li key={i}>{s}</li>)}</ul></CardContent>
      </Card>
      {feedback && (
        <Card className="shadow-card border-0 md:col-span-3">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Detailed feedback</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed whitespace-pre-wrap">{feedback}</CardContent>
        </Card>
      )}
    </div>
  );
}