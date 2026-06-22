import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mentorReply } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mentor")({
  head: () => ({ meta: [{ title: "AI Mentor — SpeakEval AI" }] }),
  component: MentorPage,
});

function MentorPage() {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["mentor"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("mentor_chats").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const fn = useServerFn(mentorReply);
  const mutation = useMutation({
    mutationFn: (message: string) => fn({ data: { message } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mentor"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, mutation.isPending]);

  function submit() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    mutation.mutate(text);
  }

  return (
    <>
      <PageHeader title="AI Mentor" description="Ask anything about interviews, resumes, communication, or career growth." />
      <Card className="shadow-card border-0 flex flex-col h-[70vh]">
        <CardContent className="flex-1 overflow-y-auto space-y-4 p-6">
          {(!messages || messages.length === 0) && (
            <div className="text-center text-muted-foreground py-12">
              <Sparkles className="size-8 mx-auto mb-3 text-primary" />
              <p className="font-medium">Start a conversation</p>
              <p className="text-sm">Try: "How should I structure a behavioral answer?"</p>
            </div>
          )}
          {messages?.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-gradient-primary text-primary-foreground" : "bg-muted"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex justify-start"><div className="bg-muted rounded-2xl px-4 py-3 flex gap-1"><Loader2 className="size-4 animate-spin" /> thinking…</div></div>
          )}
          <div ref={endRef} />
        </CardContent>
        <div className="border-t p-4 flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Ask your mentor…" />
          <Button onClick={submit} disabled={!input.trim() || mutation.isPending} className="bg-gradient-primary"><Send className="size-4" /></Button>
        </div>
      </Card>
    </>
  );
}