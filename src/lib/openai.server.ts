// Server-only AI helpers using Google Gemini API directly.
// Set GEMINI_API_KEY in your environment (https://aistudio.google.com/apikey).
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-flash";

function key() {
  const k = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!k) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  return k;
}

type Part =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };
type Content = { role: "user" | "model"; parts: Part[] };

async function geminiGenerate(opts: {
  model?: string;
  system?: string;
  contents: Content[];
  jsonMode?: boolean;
}): Promise<string> {
  const model = opts.model ?? DEFAULT_MODEL;
  const body: Record<string, unknown> = { contents: opts.contents };
  if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };
  if (opts.jsonMode) body.generationConfig = { responseMimeType: "application/json" };
  const res = await fetch(
    `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(key())}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
    if (res.status === 402 || res.status === 403)
      throw new Error("AI access denied or quota exhausted. Check your GEMINI_API_KEY and billing.");
    throw new Error(`AI error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p: { text?: string }) => p.text ?? "").join("");
}

export async function chatJSON<T>(opts: { system: string; user: string; model?: string }): Promise<T> {
  const content = await geminiGenerate({
    model: opts.model,
    system: `${opts.system}\n\nRespond with valid JSON only, no markdown fences.`,
    contents: [{ role: "user", parts: [{ text: opts.user }] }],
    jsonMode: true,
  });
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const json = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(json) as T;
}

export async function chatText(opts: {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  model?: string;
}): Promise<string> {
  const contents: Content[] = opts.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  return geminiGenerate({ model: opts.model, system: opts.system, contents });
}

export async function transcribeAudio(base64: string, mimeType: string): Promise<string> {
  const mt = mimeType.includes("webm")
    ? "audio/webm"
    : mimeType.includes("mp4") || mimeType.includes("m4a")
      ? "audio/mp4"
      : mimeType.includes("mp3") || mimeType.includes("mpeg")
        ? "audio/mp3"
        : mimeType.includes("ogg")
          ? "audio/ogg"
          : mimeType.includes("wav")
            ? "audio/wav"
            : mimeType || "audio/webm";
  const text = await geminiGenerate({
    contents: [
      {
        role: "user",
        parts: [
          { text: "Transcribe this audio verbatim in English. Return only the transcript text, no commentary." },
          { inline_data: { mime_type: mt, data: base64 } },
        ],
      },
    ],
  });
  return text.trim();
}

export async function analyzeResumeFile(base64: string, mimeType: string, fileName: string): Promise<string> {
  const isDocx =
    mimeType.includes("officedocument.wordprocessingml") ||
    /\.docx$/i.test(fileName);
  if (isDocx) {
    const mammoth = await import("mammoth");
    const buffer = Buffer.from(base64, "base64");
    const { value } = await mammoth.extractRawText({ buffer });
    return value ?? "";
  }
  const text = await geminiGenerate({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Extract the full text content of this resume verbatim. Preserve section order (summary, skills, experience, projects, education, certifications). Return only the plain text — no commentary, no markdown.",
          },
          { inline_data: { mime_type: "application/pdf", data: base64 } },
        ],
      },
    ],
  });
  return text.trim();
}