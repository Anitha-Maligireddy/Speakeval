export const SPEAKING_TOPICS = [
  "Tell me about yourself",
  "Describe your dream job",
  "Talk about a challenge you overcame",
  "Explain a recent technology trend that excites you",
  "Describe a time you worked in a team",
  "What does success mean to you?",
  "If you could change one thing about the world, what would it be?",
  "Describe your ideal work environment",
  "Talk about a book or movie that influenced you",
  "Where do you see yourself in five years?",
];

export const SCENARIOS = [
  "A customer is angry because their order arrived damaged. They are raising their voice on a call. Respond.",
  "Your teammate keeps missing deadlines, causing your project to slip. You need to address this with them.",
  "You realize you cannot meet a deadline. Ask your manager for an extension.",
  "Present a new product idea to senior management in 60 seconds.",
  "A colleague takes credit for your work in a meeting. Respond professionally.",
  "Decline a project request from a peer without damaging the relationship.",
  "Give constructive feedback to a junior team member who is underperforming.",
  "Explain a technical concept to a non-technical stakeholder.",
];

export const INTERVIEW_QUESTIONS = {
  HR: [
    "Why do you want to work for our company?",
    "What are your greatest strengths and weaknesses?",
    "Why are you leaving your current position?",
    "Tell me about your career goals.",
  ],
  Technical: [
    "Explain a recent project and the technologies you used.",
    "How do you approach debugging a complex issue?",
    "Describe a technical challenge you solved.",
    "What's your process for learning a new framework?",
  ],
  Situational: [
    "How would you handle a disagreement with your manager?",
    "What would you do if you were given an impossible deadline?",
    "How would you prioritize multiple urgent tasks?",
    "How would you handle joining a team with low morale?",
  ],
  Behavioral: [
    "Tell me about a time you failed and what you learned.",
    "Describe a situation where you led a team.",
    "Tell me about a conflict you resolved.",
    "Describe a goal you set and how you achieved it.",
  ],
} as const;

export type InterviewCategory = keyof typeof INTERVIEW_QUESTIONS;

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Deterministic daily topic per date
export function dailyTopic(date = new Date()): string {
  const seed = Number(`${date.getUTCFullYear()}${date.getUTCMonth()}${date.getUTCDate()}`);
  return SPEAKING_TOPICS[seed % SPEAKING_TOPICS.length];
}

export function readinessLevel(score: number): string {
  if (score >= 85) return "Highly Employable";
  if (score >= 70) return "Job Ready";
  if (score >= 50) return "Developing";
  return "Beginner";
}