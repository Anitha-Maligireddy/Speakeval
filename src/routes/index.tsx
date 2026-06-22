import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MessageSquare, Briefcase, FileText, Map, CalendarDays, TrendingUp, Sparkles, ArrowRight, CheckCircle2, Star } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpeakEval AI — Communication & Career Readiness Platform" },
      { name: "description", content: "AI-powered assessments for speaking, scenarios, interviews, and resumes. Build the communication competency employers actually want." },
      { property: "og:title", content: "SpeakEval AI" },
      { property: "og:description", content: "Build communication competency and interview readiness with AI." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow"><Sparkles className="size-5 text-primary-foreground" /></div>
            SpeakEval<span className="text-gradient">AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#testimonials" className="hover:text-foreground">Testimonials</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/dashboard"><Button variant="ghost" className="hidden sm:inline-flex">Dashboard</Button></Link>
            <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
            <Link to="/auth"><Button className="bg-gradient-primary text-primary-foreground shadow-glow">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-[0.07]" />
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium mb-6">
            <Star className="size-3.5 text-primary" /> AI-powered communication intelligence
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto leading-[1.05]">
            AI Communication & <span className="text-gradient">Interview Intelligence System</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            An AI-powered platform to evaluate communication skills, interview readiness, and behavioral performance using intelligent analysis and feedback.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/speaking"><Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow gap-2 h-12 px-6">Start Practice <ArrowRight className="size-4" /></Button></Link>
            <Link to="/dashboard"><Button size="lg" variant="outline" className="h-12 px-6">View Dashboard</Button></Link>
            <Link to="/auth"><Button size="lg" variant="secondary" className="h-12 px-6">Login / Sign Up</Button></Link>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
            {[
              ["9", "AI assessments"],
              ["100", "Point scoring scale"],
              ["6", "Skill dimensions"],
              ["24/7", "Mentor on-call"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl font-bold text-gradient">{n}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="text-sm uppercase tracking-wider text-primary mb-3">Everything you need</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">A complete readiness toolkit</h2>
          <p className="text-muted-foreground text-lg">Nine focused features that work together to make you employable.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Mic, title: "AI Speaking Assessment", desc: "Random topics, voice recording, Whisper transcription, 6-dimensional scoring." },
            { icon: MessageSquare, title: "Scenario Communication", desc: "Workplace situations: angry customers, team conflict, presenting to leadership." },
            { icon: Briefcase, title: "Interview Simulator", desc: "HR, technical, situational, behavioral — voice or text, scored on structure and confidence." },
            { icon: FileText, title: "Resume Evaluation", desc: "Upload your PDF, get structure, skills, and project description scores plus rewrites." },
            { icon: Map, title: "Personalized Roadmap", desc: "AI identifies weak areas and builds a custom practice plan you can track." },
            { icon: CalendarDays, title: "Daily Challenge", desc: "A fresh topic every day. Earn points, build streaks, stay consistent." },
            { icon: TrendingUp, title: "Career Readiness", desc: "Composite score classifying you Beginner → Highly Employable, with insights." },
            { icon: Sparkles, title: "AI Mentor Chat", desc: "Always-on coach for interview prep, resume tweaks, and career questions." },
            { icon: Star, title: "Progress Analytics", desc: "Beautiful charts across speaking, interview, and scenario progress over time." },
          ].map((f) => (
            <Card key={f.title} className="shadow-card border-0 hover:shadow-glow transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="size-11 rounded-xl bg-gradient-primary grid place-items-center mb-4 shadow-soft"><f.icon className="size-5 text-primary-foreground" /></div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-soft border-y">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-sm uppercase tracking-wider text-primary mb-3">Why it works</div>
            <h2 className="text-4xl font-bold mb-6">Real practice. Real feedback. Real growth.</h2>
            <div className="space-y-4">
              {[
                "Instant scoring across fluency, grammar, vocabulary, clarity & confidence",
                "Voice-first practice with automatic transcription",
                "Targeted weakness detection and personalized improvement tasks",
                "Daily streaks and gamified progress to keep you consistent",
                "Composite career readiness score employers understand",
              ].map((b) => (
                <div key={b} className="flex gap-3"><CheckCircle2 className="size-5 text-success mt-0.5 shrink-0" /><span>{b}</span></div>
              ))}
            </div>
          </div>
          <div className="relative">
            <Card className="shadow-card border-0">
              <CardContent className="p-8">
                <div className="text-sm text-muted-foreground">Career readiness</div>
                <div className="text-6xl font-bold text-gradient mt-2 mb-1">87</div>
                <div className="text-sm text-success font-medium mb-6">Highly Employable</div>
                {[
                  ["Speaking", 88], ["Interview", 84], ["Scenarios", 89], ["Resume", 85],
                ].map(([l, v]) => (
                  <div key={l as string} className="mb-3">
                    <div className="flex justify-between text-xs mb-1"><span>{l}</span><span className="font-medium">{v}</span></div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-primary" style={{ width: `${v}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div className="text-sm uppercase tracking-wider text-primary mb-3">How it works</div>
          <h2 className="text-4xl md:text-5xl font-bold">Three steps to interview-ready</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Take an assessment", d: "Pick speaking, interview, scenarios, or upload your resume." },
            { n: "02", t: "Get AI feedback", d: "GPT scores you across multiple dimensions with specific suggestions." },
            { n: "03", t: "Follow your roadmap", d: "Practice the weak areas, build a streak, watch your score climb." },
          ].map((s) => (
            <Card key={s.n} className="shadow-card border-0 relative overflow-hidden">
              <CardContent className="p-8">
                <div className="text-6xl font-bold text-gradient opacity-30 absolute top-2 right-4">{s.n}</div>
                <h3 className="text-xl font-bold mb-2 relative">{s.t}</h3>
                <p className="text-muted-foreground relative">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gradient-soft border-y">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <div className="text-sm uppercase tracking-wider text-primary mb-3">Loved by students</div>
            <h2 className="text-4xl md:text-5xl font-bold">Built for the next generation of professionals</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "Priya S.", r: "CS Senior", q: "The scenario practice helped me land my first PM internship. The feedback was scarily accurate." },
              { n: "Marcus L.", r: "MBA student", q: "I went from rambling answers to STAR-structured ones in a week. The interview score chart is addictive." },
              { n: "Aisha K.", r: "Recent grad", q: "Resume score jumped 22 points after applying the suggestions. Got 3 callbacks the next week." },
            ].map((t) => (
              <Card key={t.n} className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-primary text-primary" />)}</div>
                  <p className="text-sm mb-4 leading-relaxed">"{t.q}"</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center font-semibold">{t.n[0]}</div>
                    <div><div className="text-sm font-semibold">{t.n}</div><div className="text-xs text-muted-foreground">{t.r}</div></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <Card className="bg-gradient-hero text-primary-foreground border-0 shadow-glow overflow-hidden relative">
          <CardContent className="p-12 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-4">Start your first assessment in 60 seconds</h2>
            <p className="opacity-90 mb-8 max-w-xl mx-auto">Free to begin. No card required. Find out where you stand and how to level up.</p>
            <Link to="/auth"><Button size="lg" variant="secondary" className="h-12 px-8 gap-2">Get started free <ArrowRight className="size-4" /></Button></Link>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><div className="size-7 rounded-lg bg-gradient-primary grid place-items-center"><Sparkles className="size-4 text-primary-foreground" /></div> <span className="font-semibold text-foreground">SpeakEval AI</span> © {new Date().getFullYear()}</div>
          <div className="flex gap-6"><a href="#features" className="hover:text-foreground">Features</a><a href="#how" className="hover:text-foreground">How it works</a><Link to="/auth" className="hover:text-foreground">Sign in</Link></div>
        </div>
      </footer>
    </div>
  );
}
