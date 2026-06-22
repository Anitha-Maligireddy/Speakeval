ALTER TABLE public.resume_assessments
  ADD COLUMN IF NOT EXISTS ats_score integer,
  ADD COLUMN IF NOT EXISTS technical_skills text[],
  ADD COLUMN IF NOT EXISTS soft_skills text[],
  ADD COLUMN IF NOT EXISTS projects_detected text[],
  ADD COLUMN IF NOT EXISTS certifications text[],
  ADD COLUMN IF NOT EXISTS experience_summary text;