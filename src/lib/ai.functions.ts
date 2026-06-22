import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SpeakingFeedback = z.object({
  overall_score: z.number(),
  fluency_score: z.number(),
  grammar_score: z.number(),
  vocabulary_score: z.number(),
  relevance_score: z.number(),
  clarity_score: z.number(),
  confidence_score: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  feedback: z.string(),
});

const TOO_SHORT_MESSAGE =
  "Response too short to evaluate. Please speak for at least 30–60 seconds with meaningful content.";

function isMeaningful(text: string, minWords = 25) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length < minWords) return false;
  const unique = new Set(words.map((w) => w.toLowerCase()));
  return unique.size >= Math.min(10, Math.floor(minWords * 0.5));
}

export const transcribeAndAnalyzeSpeaking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; audioBase64: string; mimeType: string; durationSeconds: number }) => d)
  .handler(async ({ data, context }) => {
    const { transcribeAudio, chatJSON } = await import("./openai.server");
    const transcript = await transcribeAudio(data.audioBase64, data.mimeType);
    if (!isMeaningful(transcript)) {
      throw new Error(TOO_SHORT_MESSAGE);
    }
    const result = await chatJSON<z.infer<typeof SpeakingFeedback>>({
      system:
        "You are an expert communication coach. Score the speaker on a 0-100 scale across fluency, grammar, vocabulary, relevance to the topic, clarity, and confidence. Return JSON only with keys: overall_score, fluency_score, grammar_score, vocabulary_score, relevance_score, clarity_score, confidence_score, strengths (array), weaknesses (array), suggestions (array), feedback (string).",
      user: `Topic: ${data.topic}\n\nTranscript:\n${transcript || "(silent)"}`,
    });
    const parsed = SpeakingFeedback.parse(result);
    const { data: row, error } = await context.supabase
      .from("speaking_assessments")
      .insert({
        user_id: context.userId,
        topic: data.topic,
        transcript,
        duration_seconds: data.durationSeconds,
        ...parsed,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await bumpProgress(context);
    return row;
  });

const ScenarioFeedback = z.object({
  overall_score: z.number(),
  communication_score: z.number(),
  professionalism_score: z.number(),
  problem_solving_score: z.number(),
  emotional_intelligence_score: z.number(),
  clarity_score: z.number(),
  feedback: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const analyzeScenario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { scenario: string; response: string; responseMode: "text" | "voice"; audioBase64?: string; mimeType?: string }) => d)
  .handler(async ({ data, context }) => {
    const { transcribeAudio, chatJSON } = await import("./openai.server");
    let response = data.response;
    if (data.responseMode === "voice" && data.audioBase64 && data.mimeType) {
      response = await transcribeAudio(data.audioBase64, data.mimeType);
    }
    if (!isMeaningful(response, 20)) {
      throw new Error(TOO_SHORT_MESSAGE);
    }
    const result = await chatJSON<z.infer<typeof ScenarioFeedback>>({
      system:
        "You are a workplace communication evaluator. Score the response 0-100 on: communication quality, professionalism, problem-solving, emotional intelligence, clarity. Return JSON with overall_score, communication_score, professionalism_score, problem_solving_score, emotional_intelligence_score, clarity_score, feedback (string), strengths (array), weaknesses (array), suggestions (array).",
      user: `Scenario: ${data.scenario}\n\nResponse:\n${response}`,
    });
    const parsed = ScenarioFeedback.parse(result);
    const { data: row, error } = await context.supabase
      .from("scenario_assessments")
      .insert({
        user_id: context.userId,
        scenario: data.scenario,
        response,
        response_mode: data.responseMode,
        ...parsed,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await bumpProgress(context);
    return row;
  });

const InterviewFeedback = z.object({
  overall_score: z.number(),
  answer_quality_score: z.number(),
  communication_score: z.number(),
  structure_score: z.number(),
  confidence_score: z.number(),
  professionalism_score: z.number(),
  feedback: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const analyzeInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { category: string; question: string; answer: string; responseMode: "text" | "voice"; audioBase64?: string; mimeType?: string }) => d)
  .handler(async ({ data, context }) => {
    const { transcribeAudio, chatJSON } = await import("./openai.server");
    let answer = data.answer;
    if (data.responseMode === "voice" && data.audioBase64 && data.mimeType) {
      answer = await transcribeAudio(data.audioBase64, data.mimeType);
    }
    if (!isMeaningful(answer, 20)) {
      throw new Error(TOO_SHORT_MESSAGE);
    }
    const result = await chatJSON<z.infer<typeof InterviewFeedback>>({
      system:
        "You are an experienced technical and behavioral interviewer. Score the candidate answer 0-100 on: answer quality, communication effectiveness, structure (e.g. STAR), confidence, professionalism. Return JSON with overall_score, answer_quality_score, communication_score, structure_score, confidence_score, professionalism_score, feedback (string), strengths (array), weaknesses (array), suggestions (array).",
      user: `Category: ${data.category}\nQuestion: ${data.question}\n\nAnswer:\n${answer}`,
    });
    const parsed = InterviewFeedback.parse(result);
    const { data: row, error } = await context.supabase
      .from("interview_assessments")
      .insert({
        user_id: context.userId,
        category: data.category,
        question: data.question,
        answer,
        response_mode: data.responseMode,
        ...parsed,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await bumpProgress(context);
    return row;
  });

const ResumeFeedback = z.object({
  overall_score: z.number(),
  ats_score: z.number(),
  structure_score: z.number(),
  skills_score: z.number(),
  formatting_score: z.number(),
  summary_score: z.number(),
  projects_score: z.number(),
  technical_skills: z.array(z.string()),
  soft_skills: z.array(z.string()),
  projects_detected: z.array(z.string()),
  certifications: z.array(z.string()),
  experience_summary: z.string(),
  feedback: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { filePath: string; fileName: string; fileBase64: string; mimeType: string }) => d)
  .handler(async ({ data, context }) => {
    const { chatJSON, analyzeResumeFile } = await import("./openai.server");
    const extractedText = await analyzeResumeFile(data.fileBase64, data.mimeType, data.fileName);
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error("Could not read text from this file. Please upload a text-based PDF or DOCX (not a scanned image).");
    }
    const system =
      "You are a senior technical recruiter and ATS expert. Analyze the resume and return ONLY JSON with these keys: overall_score (0-100), ats_score (0-100, ATS/keyword compatibility), structure_score, skills_score, formatting_score, summary_score, projects_score, technical_skills (string[]), soft_skills (string[]), projects_detected (string[] — project titles or short names), certifications (string[]), experience_summary (string, 2-3 sentences), feedback (string, detailed), strengths (string[]), weaknesses (string[]), suggestions (string[]).";
    const result = await chatJSON<z.infer<typeof ResumeFeedback>>({
      system,
      user: `Resume text:\n${extractedText.slice(0, 12000)}`,
    });
    const parsed = ResumeFeedback.parse(result);
    const { data: row, error } = await context.supabase
      .from("resume_assessments")
      .insert({
        user_id: context.userId,
        file_path: data.filePath,
        file_name: data.fileName,
        extracted_text: extractedText.slice(0, 20000),
        ...parsed,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const generateResumeQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { resumeId: string }) => d)
  .handler(async ({ data, context }) => {
    const { chatJSON } = await import("./openai.server");
    const { data: resume, error } = await context.supabase
      .from("resume_assessments")
      .select("technical_skills, projects_detected, certifications, experience_summary, extracted_text")
      .eq("id", data.resumeId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!resume) throw new Error("Resume not found");
    const ctx = JSON.stringify({
      skills: resume.technical_skills,
      projects: resume.projects_detected,
      certifications: resume.certifications,
      experience: resume.experience_summary,
      excerpt: (resume.extracted_text ?? "").slice(0, 4000),
    });
    const result = await chatJSON<{ questions: Array<{ category: string; question: string }> }>({
      system:
        "You are an interviewer. Generate 8 personalized interview questions strictly based on the candidate's resume — covering their projects, skills, technologies, certifications, and experience. Mix technical depth, decision rationale, and behavioral angles. Return JSON: { questions: [{ category, question }] }.",
      user: ctx,
    });
    return result.questions ?? [];
  });

export const generateImprovementPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { chatJSON } = await import("./openai.server");
    const [{ data: sp }, { data: sc }, { data: iv }, { data: rs }] = await Promise.all([
      context.supabase.from("speaking_assessments").select("weaknesses, suggestions, overall_score").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(10),
      context.supabase.from("scenario_assessments").select("weaknesses, suggestions, overall_score").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(10),
      context.supabase.from("interview_assessments").select("weaknesses, suggestions, overall_score").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(10),
      context.supabase.from("resume_assessments").select("weaknesses, suggestions, overall_score").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(3),
    ]);
    const summary = JSON.stringify({ speaking: sp, scenario: sc, interview: iv, resume: rs }).slice(0, 6000);
    const result = await chatJSON<{ weak_areas: string[]; recommendations: string[]; tasks: Array<{ title: string; description: string }> }>({
      system:
        "You are a communication coach. Based on the user's recent assessment data, identify 3-5 specific weak areas, list actionable recommendations, and propose 5-8 practice tasks. Return JSON with keys: weak_areas (string[]), recommendations (string[]), tasks (array of { title, description }).",
      user: summary || "No prior assessments.",
    });
    const { data: row, error } = await context.supabase
      .from("improvement_plans")
      .insert({
        user_id: context.userId,
        weak_areas: result.weak_areas,
        recommendations: result.recommendations,
        tasks: result.tasks.map((t, i) => ({ id: i, ...t, done: false })),
        total_tasks: result.tasks.length,
        completed_tasks: 0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const computeCareerReadiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const avg = (rows: Array<{ overall_score: number | null }> | null) => {
      if (!rows || rows.length === 0) return 0;
      const v = rows.map((r) => r.overall_score ?? 0);
      return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
    };
    const [sp, sc, iv, rs] = await Promise.all([
      context.supabase.from("speaking_assessments").select("overall_score").eq("user_id", context.userId),
      context.supabase.from("scenario_assessments").select("overall_score").eq("user_id", context.userId),
      context.supabase.from("interview_assessments").select("overall_score").eq("user_id", context.userId),
      context.supabase.from("resume_assessments").select("overall_score").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(1),
    ]);
    const speaking_avg = avg(sp.data);
    const interview_avg = avg(iv.data);
    const scenario_avg = avg(sc.data);
    const resume_score = rs.data?.[0]?.overall_score ?? 0;
    const overall = Math.round(speaking_avg * 0.25 + interview_avg * 0.3 + scenario_avg * 0.2 + resume_score * 0.25);
    const level = overall >= 85 ? "Highly Employable" : overall >= 70 ? "Job Ready" : overall >= 50 ? "Developing" : "Beginner";
    const insights = `Your current career readiness is "${level}" with an overall score of ${overall}. Speaking ${speaking_avg}, Interview ${interview_avg}, Scenario ${scenario_avg}, Resume ${resume_score}.`;
    const { data: row, error } = await context.supabase
      .from("career_readiness_scores")
      .insert({ user_id: context.userId, overall_score: overall, speaking_avg, interview_avg, scenario_avg, resume_score, level, insights })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const mentorReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { message: string }) => d)
  .handler(async ({ data, context }) => {
    const { chatText } = await import("./openai.server");
    const { data: history } = await context.supabase
      .from("mentor_chats")
      .select("role, content")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(30);
    await context.supabase.from("mentor_chats").insert({ user_id: context.userId, role: "user", content: data.message });
    const reply = await chatText({
      system:
        "You are SpeakEval AI Mentor — a friendly, encouraging communication and career coach. Give practical, specific advice for interviews, resumes, and communication. Keep replies concise (under 200 words) and actionable. Use markdown for structure.",
      messages: [
        ...((history ?? []).filter((h) => h.role !== "system").map((h) => ({ role: h.role as "user" | "assistant", content: h.content }))),
        { role: "user", content: data.message },
      ],
    });
    await context.supabase.from("mentor_chats").insert({ user_id: context.userId, role: "assistant", content: reply });
    return { reply };
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function bumpProgress(context: { supabase: any; userId: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await context.supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", context.userId)
    .maybeSingle();
  if (!existing) {
    await context.supabase.from("user_progress").insert({
      user_id: context.userId,
      total_points: 10,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
      total_assessments: 1,
    });
    return;
  }
  const last = existing.last_activity_date;
  let streak = existing.current_streak;
  if (last !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = last === yesterday ? streak + 1 : 1;
  }
  await context.supabase
    .from("user_progress")
    .update({
      total_points: existing.total_points + 10,
      total_assessments: existing.total_assessments + 1,
      current_streak: streak,
      longest_streak: Math.max(existing.longest_streak, streak),
      last_activity_date: today,
    })
    .eq("user_id", context.userId);
}