-- ==============================================================================
-- CareerLadder: Two User Roles + Recruiter Multi-Candidate AI Ranker Schema
-- ==============================================================================

-- 1. Ensure 'role' column in profiles table supports 'job_seeker' and 'recruiter'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'job_seeker';
  END IF;
END $$;

-- Add check constraint for roles if not already present
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_profile_role;
  ALTER TABLE public.profiles ADD CONSTRAINT check_profile_role CHECK (role IN ('job_seeker', 'recruiter', 'admin', 'user'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Update the handle_new_user() trigger function to respect the user's selected role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Career Member'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'job_seeker')
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Recruiter Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  employment_type TEXT DEFAULT 'Full-time', -- 'Full-time', 'Part-time', 'Contract', 'Internship'
  description TEXT NOT NULL,
  responsibilities TEXT,
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  experience_required TEXT,
  education_required TEXT,
  salary_range TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Candidate Resumes Table (Uploads per Job)
CREATE TABLE IF NOT EXISTS public.candidate_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT,
  extracted_text TEXT NOT NULL,
  upload_status TEXT DEFAULT 'uploaded' CHECK (upload_status IN ('uploaded', 'parsing', 'analyzed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Candidate AI Analysis Results Table
CREATE TABLE IF NOT EXISTS public.candidate_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_resume_id UUID NOT NULL REFERENCES public.candidate_resumes(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  overall_match_score INTEGER NOT NULL CHECK (overall_match_score >= 0 AND overall_match_score <= 100),
  skill_match_score INTEGER DEFAULT 0,
  experience_match_score INTEGER DEFAULT 0,
  education_match_score INTEGER DEFAULT 0,
  project_match_score INTEGER DEFAULT 0,
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  experience_status TEXT DEFAULT 'Moderate Fit', -- 'Strong Match', 'Moderate Fit', 'Low Fit'
  education_status TEXT DEFAULT 'Match',        -- 'Match', 'Partial Match', 'Mismatch'
  strengths TEXT[] DEFAULT '{}',
  concerns TEXT[] DEFAULT '{}',
  skill_gaps TEXT[] DEFAULT '{}',
  recommendation TEXT NOT NULL CHECK (recommendation IN ('STRONGLY RECOMMEND', 'RECOMMEND', 'CONSIDER', 'LOW MATCH', 'NOT RECOMMENDED')),
  recommendation_reason TEXT,
  full_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Candidate Shortlist / Review Status Table
CREATE TABLE IF NOT EXISTS public.candidate_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_resume_id UUID NOT NULL REFERENCES public.candidate_resumes(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'ANALYZED', 'SHORTLISTED', 'REJECTED')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_candidate_per_job UNIQUE (candidate_resume_id, job_id)
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_status ENABLE ROW LEVEL SECURITY;

-- 1. Jobs Policies
-- Recruiters can view, create, update, and delete ONLY their own jobs
CREATE POLICY "Recruiters manage own jobs"
ON public.jobs
FOR ALL
USING (auth.uid() = recruiter_id)
WITH CHECK (auth.uid() = recruiter_id);

-- Job Seekers can view active jobs
CREATE POLICY "Job seekers can view active jobs"
ON public.jobs
FOR SELECT
USING (status = 'active');

-- 2. Candidate Resumes Policies
-- Recruiters can view and manage only resumes uploaded for their own jobs
CREATE POLICY "Recruiters manage own candidate resumes"
ON public.candidate_resumes
FOR ALL
USING (auth.uid() = recruiter_id)
WITH CHECK (auth.uid() = recruiter_id);

-- 3. Candidate Analysis Policies
-- Recruiters can view and insert analyses only for their own candidates
CREATE POLICY "Recruiters access own candidate analyses"
ON public.candidate_analysis
FOR ALL
USING (auth.uid() = recruiter_id)
WITH CHECK (auth.uid() = recruiter_id);

-- 4. Candidate Status Policies
-- Recruiters can view and update shortlist status only for their own candidates
CREATE POLICY "Recruiters manage candidate statuses"
ON public.candidate_status
FOR ALL
USING (auth.uid() = recruiter_id)
WITH CHECK (auth.uid() = recruiter_id);

-- ==============================================================================
-- Storage Bucket for Resumes
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Recruiters only access recruiter/{auth.uid()}/*
CREATE POLICY "Recruiters access own resume folder"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND (storage.foldername(name))[1] = 'recruiter'
)
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND (storage.foldername(name))[1] = 'recruiter'
);

-- Storage RLS: Job Seekers only access job-seeker/{auth.uid()}/*
CREATE POLICY "Job Seekers access own resume folder"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND (storage.foldername(name))[1] = 'job-seeker'
)
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND (storage.foldername(name))[1] = 'job-seeker'
);
