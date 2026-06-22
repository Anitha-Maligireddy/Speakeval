
-- ===== ROLES =====
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles owner select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles owner insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles owner update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== SPEAKING ASSESSMENTS =====
CREATE TABLE public.speaking_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  transcript TEXT,
  duration_seconds INTEGER,
  overall_score INTEGER,
  fluency_score INTEGER,
  grammar_score INTEGER,
  vocabulary_score INTEGER,
  relevance_score INTEGER,
  clarity_score INTEGER,
  confidence_score INTEGER,
  strengths TEXT[],
  weaknesses TEXT[],
  suggestions TEXT[],
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.speaking_assessments TO authenticated;
GRANT ALL ON public.speaking_assessments TO service_role;
ALTER TABLE public.speaking_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "speaking own" ON public.speaking_assessments FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id);

-- ===== SCENARIO ASSESSMENTS =====
CREATE TABLE public.scenario_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario TEXT NOT NULL,
  response TEXT,
  response_mode TEXT DEFAULT 'text',
  overall_score INTEGER,
  communication_score INTEGER,
  professionalism_score INTEGER,
  problem_solving_score INTEGER,
  emotional_intelligence_score INTEGER,
  clarity_score INTEGER,
  feedback TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  suggestions TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scenario_assessments TO authenticated;
GRANT ALL ON public.scenario_assessments TO service_role;
ALTER TABLE public.scenario_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scenario own" ON public.scenario_assessments FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id);

-- ===== INTERVIEW ASSESSMENTS =====
CREATE TABLE public.interview_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  response_mode TEXT DEFAULT 'text',
  overall_score INTEGER,
  answer_quality_score INTEGER,
  communication_score INTEGER,
  structure_score INTEGER,
  confidence_score INTEGER,
  professionalism_score INTEGER,
  feedback TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  suggestions TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_assessments TO authenticated;
GRANT ALL ON public.interview_assessments TO service_role;
ALTER TABLE public.interview_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interview own" ON public.interview_assessments FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id);

-- ===== RESUME ASSESSMENTS =====
CREATE TABLE public.resume_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT,
  file_name TEXT,
  extracted_text TEXT,
  overall_score INTEGER,
  structure_score INTEGER,
  skills_score INTEGER,
  formatting_score INTEGER,
  summary_score INTEGER,
  projects_score INTEGER,
  feedback TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  suggestions TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_assessments TO authenticated;
GRANT ALL ON public.resume_assessments TO service_role;
ALTER TABLE public.resume_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resume own" ON public.resume_assessments FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id);

-- ===== DAILY CHALLENGES =====
CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  topic TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  response TEXT,
  score INTEGER,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_challenges TO authenticated;
GRANT ALL ON public.daily_challenges TO service_role;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily own" ON public.daily_challenges FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id);

-- ===== IMPROVEMENT PLANS =====
CREATE TABLE public.improvement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weak_areas TEXT[],
  recommendations TEXT[],
  tasks JSONB DEFAULT '[]'::jsonb,
  completed_tasks INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.improvement_plans TO authenticated;
GRANT ALL ON public.improvement_plans TO service_role;
ALTER TABLE public.improvement_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plan own" ON public.improvement_plans FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON public.improvement_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== CAREER READINESS =====
CREATE TABLE public.career_readiness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  speaking_avg INTEGER DEFAULT 0,
  interview_avg INTEGER DEFAULT 0,
  scenario_avg INTEGER DEFAULT 0,
  resume_score INTEGER DEFAULT 0,
  level TEXT NOT NULL,
  insights TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_readiness_scores TO authenticated;
GRANT ALL ON public.career_readiness_scores TO service_role;
ALTER TABLE public.career_readiness_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "career own" ON public.career_readiness_scores FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id);

-- ===== MENTOR CHATS =====
CREATE TABLE public.mentor_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_chats TO authenticated;
GRANT ALL ON public.mentor_chats TO service_role;
ALTER TABLE public.mentor_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chats own" ON public.mentor_chats FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id);

-- ===== USER PROGRESS =====
CREATE TABLE public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  total_assessments INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress own" ON public.user_progress FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== STORAGE POLICIES (resumes, recordings) =====
CREATE POLICY "user upload own resumes" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user read own resumes" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user delete own resumes" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "user upload own recordings" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user read own recordings" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
