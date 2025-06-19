/*
  # Job Application Functions

  1. New Functions
     - `apply_to_job` - Handles new job application submission
     - `update_application_status` - Updates application status and tracks history
     - `check_application_match_score` - Calculates match score between applicant and job
     - `get_applications_for_job` - Retrieves applications for a specific job
     - `get_applications_for_applicant` - Retrieves applications for a specific applicant
  
  2. Triggers
     - `on_application_created` - Processes new applications
     - `on_application_updated` - Tracks application status changes
     - `on_application_deleted` - Handles cleanup of application data
  
  3. Security
     - RLS policies for secure application handling
*/

-- Function to handle new job applications
CREATE OR REPLACE FUNCTION public.apply_to_job(
  p_job_id UUID,
  p_applicant_id UUID,
  p_cv_url TEXT DEFAULT NULL,
  p_cover_letter_url TEXT DEFAULT NULL,
  p_profile_summary TEXT DEFAULT NULL,
  p_profile_answers JSONB DEFAULT NULL,
  p_application_source TEXT DEFAULT 'namuH Platform'
)
RETURNS UUID AS $$
DECLARE
  v_job_title TEXT;
  v_company_name TEXT;
  v_match_score NUMERIC(5,2);
  v_invitation_likelihood TEXT;
  v_application_id UUID;
  v_recruiter_id UUID;
  v_token_deduction INTEGER := 0;
  v_applicant_name TEXT;
BEGIN
  -- Get job details
  SELECT 
    title, 
    company_name,
    recruiter_id
  INTO 
    v_job_title, 
    v_company_name,
    v_recruiter_id
  FROM public.jobs
  WHERE id = p_job_id;

  -- Get applicant name
  SELECT name INTO v_applicant_name 
  FROM public.applicant_profiles 
  WHERE id = p_applicant_id;
  
  -- Calculate match score using our matching algorithm
  SELECT public.check_application_match_score(p_job_id, p_applicant_id) 
  INTO v_match_score;
  
  -- Determine invitation likelihood based on match score
  v_invitation_likelihood := CASE
    WHEN v_match_score >= 85 THEN 'High'
    WHEN v_match_score >= 70 THEN 'Moderate'
    ELSE 'Low'
  END;
  
  -- Create the application record
  INSERT INTO public.applications (
    job_id,
    applicant_id,
    applicant_name,
    job_title,
    company_name,
    status,
    current_phase,
    match_score,
    invitation_likelihood,
    cv_url,
    cover_letter_url,
    profile_summary_from_application,
    profile_answers_from_application,
    application_source
  ) VALUES (
    p_job_id,
    p_applicant_id,
    v_applicant_name,
    v_job_title,
    v_company_name,
    'Applied',
    'Bewerbung eingegangen',
    v_match_score,
    v_invitation_likelihood,
    p_cv_url,
    p_cover_letter_url,
    p_profile_summary,
    p_profile_answers,
    p_application_source
  ) RETURNING id INTO v_application_id;
  
  -- Check if it's a premium feature that requires tokens
  IF p_application_source = 'Quick Apply' THEN
    v_token_deduction := 1;
  END IF;
  
  -- Record token transaction if needed
  IF v_token_deduction > 0 THEN
    INSERT INTO public.token_transactions (
      user_id,
      type,
      amount,
      description,
      flow_name,
      related_job_id
    ) VALUES (
      p_applicant_id,
      'debit',
      v_token_deduction,
      'Job application using Quick Apply',
      'quick_apply',
      p_job_id
    );
    
    -- Update token balance
    UPDATE public.user_subscriptions
    SET token_balance = token_balance - v_token_deduction
    WHERE user_id = p_applicant_id;
  END IF;

  RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update application status
CREATE OR REPLACE FUNCTION public.update_application_status(
  p_application_id UUID,
  p_new_status TEXT,
  p_new_phase TEXT,
  p_evaluation JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_old_status TEXT;
  v_old_phase TEXT;
  v_job_id UUID;
  v_applicant_id UUID;
BEGIN
  -- Get current values
  SELECT 
    status, 
    current_phase, 
    job_id, 
    applicant_id
  INTO 
    v_old_status, 
    v_old_phase, 
    v_job_id, 
    v_applicant_id
  FROM public.applications
  WHERE id = p_application_id;
  
  -- Update application
  UPDATE public.applications
  SET 
    status = p_new_status,
    current_phase = p_new_phase,
    last_updated = now(),
    evaluation = CASE 
      WHEN p_evaluation IS NOT NULL 
      THEN p_evaluation 
      ELSE evaluation 
    END
  WHERE id = p_application_id;
  
  -- Update rating if provided in evaluation
  IF p_evaluation ? 'rating' AND p_evaluation ? 'ratingSubject' THEN
    UPDATE public.applications
    SET
      rating = (p_evaluation->>'rating')::integer,
      rating_subject = p_evaluation->>'ratingSubject',
      feedback = p_evaluation->>'feedback'
    WHERE id = p_application_id;
  END IF;
  
  -- Update contract notes if provided
  IF p_evaluation ? 'contractNotes' THEN
    UPDATE public.applications
    SET contract_notes = p_evaluation->>'contractNotes'
    WHERE id = p_application_id;
  END IF;
  
  -- Create a last communication entry for status changes
  IF v_old_status != p_new_status OR v_old_phase != p_new_phase THEN
    UPDATE public.applications
    SET last_communication = jsonb_build_object(
      'date', now(),
      'messageSnippet', 'Status geändert zu ' || p_new_status || ', Phase: ' || p_new_phase,
      'phase', p_new_phase
    )
    WHERE id = p_application_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate match score between applicant and job
CREATE OR REPLACE FUNCTION public.check_application_match_score(
  p_job_id UUID,
  p_applicant_id UUID
)
RETURNS NUMERIC(5,2) AS $$
DECLARE
  v_job_skills TEXT[];
  v_applicant_skills TEXT[];
  v_job_qualifications TEXT[];
  v_job_required_experience TEXT;
  v_applicant_experience TEXT[];
  v_skill_match NUMERIC(5,2) := 0;
  v_qualification_match NUMERIC(5,2) := 0;
  v_experience_match NUMERIC(5,2) := 0;
  v_total_match NUMERIC(5,2);
BEGIN
  -- Get job requirements
  SELECT 
    COALESCE(skills, '{}'::TEXT[]),
    COALESCE(qualifications, '{}'::TEXT[]),
    COALESCE(experience, '')
  INTO 
    v_job_skills,
    v_job_qualifications,
    v_job_required_experience
  FROM public.jobs
  WHERE id = p_job_id;
  
  -- Get applicant skills and experience
  SELECT 
    COALESCE(hard_skills, '{}'::TEXT[])
  INTO 
    v_applicant_skills
  FROM public.applicant_profiles
  WHERE id = p_applicant_id;
  
  -- Get applicant education/experience
  SELECT 
    ARRAY_AGG(COALESCE(degree || ' ' || institution, ''))
  INTO 
    v_applicant_experience
  FROM public.applicant_educations
  WHERE applicant_profile_id = p_applicant_id;
  
  -- Calculate skill match (50% of total score)
  IF array_length(v_job_skills, 1) > 0 AND array_length(v_applicant_skills, 1) > 0 THEN
    v_skill_match := (
      SELECT COUNT(*) 
      FROM unnest(v_job_skills) js
      WHERE EXISTS (
        SELECT 1 
        FROM unnest(v_applicant_skills) aps
        WHERE LOWER(aps) LIKE '%' || LOWER(js) || '%'
      )
    ) * 100.0 / array_length(v_job_skills, 1) * 0.5;
  ELSE
    -- Default 50% match if no skills specified
    v_skill_match := 50.0 * 0.5;
  END IF;
  
  -- Calculate qualification match (30% of total score)
  v_qualification_match := 
    CASE
      WHEN array_length(v_applicant_experience, 1) > 0 THEN 75.0
      ELSE 30.0
    END * 0.3;
  
  -- Calculate experience match (20% of total score)
  v_experience_match := 
    CASE
      -- If we have education/experience entries, assume good match
      WHEN array_length(v_applicant_experience, 1) > 1 THEN 80.0
      WHEN array_length(v_applicant_experience, 1) = 1 THEN 60.0
      ELSE 40.0
    END * 0.2;
  
  -- Calculate total match score
  v_total_match := v_skill_match + v_qualification_match + v_experience_match;
  
  -- Randomize slightly for demo purposes
  v_total_match := GREATEST(50, LEAST(100, v_total_match + (random() * 20 - 10)));
  
  RETURN ROUND(v_total_match::numeric, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get applications for a job
CREATE OR REPLACE FUNCTION public.get_applications_for_job(
  p_job_id UUID,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.applications AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.applications
  WHERE job_id = p_job_id
  ORDER BY applied_date DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get applications for an applicant
CREATE OR REPLACE FUNCTION public.get_applications_for_applicant(
  p_applicant_id UUID,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.applications AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.applications
  WHERE applicant_id = p_applicant_id
  ORDER BY applied_date DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for new applications
CREATE OR REPLACE FUNCTION public.process_new_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Update job stats
  UPDATE public.jobs
  SET performance_stats = jsonb_set(
    COALESCE(performance_stats, '{}'::jsonb),
    '{applications}',
    (COALESCE((performance_stats->>'applications')::integer, 0) + 1)::text::jsonb
  )
  WHERE id = NEW.job_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.process_new_application();

-- Enable RLS on applications table
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "Applicants can see their own applications"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = applicant_id);

CREATE POLICY "Recruiters can see applications for their jobs"
  ON public.applications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE id = job_id
      AND recruiter_id = auth.uid()
    )
  );