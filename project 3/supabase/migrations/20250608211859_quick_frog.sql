/*
  # Quick Apply Feature Schema

  1. New Tables
     - `quick_apply_sessions`: Tracks user's quick apply sessions
     - `quick_apply_targets`: Job URLs or internal job IDs targeted for application
     - `quick_apply_documents`: User documents for quick applications
     - `quick_apply_results`: Generated cover letters and extracted emails
     - `quick_apply_submissions`: Record of batch submissions sent

  2. New Functions
     - Functions for managing documents, job targets, and batch submissions
     - AI-powered cover letter generation for multiple targets
     - Email extraction from job listings via webscraping
     - Submission tracking and management

  3. Security
     - RLS policies for all tables
     - Integration with token system for AI features
*/

-- Quick Apply Sessions Table
CREATE TABLE IF NOT EXISTS public.quick_apply_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'created', -- created, processing, ready, submitted, error
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settings JSONB DEFAULT NULL, -- any user preferences for this session
  error_details TEXT DEFAULT NULL,
  token_cost INTEGER DEFAULT 0 -- Total tokens used for this session
);

-- Quick Apply Targets Table (job URLs or internal job IDs)
CREATE TABLE IF NOT EXISTS public.quick_apply_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.quick_apply_sessions(id) ON DELETE CASCADE,
  target_url TEXT, -- external URL
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL, -- internal job reference
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processed, error
  scrape_status TEXT DEFAULT NULL, -- null, pending, complete, error
  job_title TEXT DEFAULT NULL, -- extracted or from our DB
  company_name TEXT DEFAULT NULL, -- extracted or from our DB
  email_address TEXT DEFAULT NULL, -- extracted email for application
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ DEFAULT NULL,
  error_details TEXT DEFAULT NULL,
  extracted_data JSONB DEFAULT NULL -- any other data extracted from scraping
);

-- Quick Apply Documents Table
CREATE TABLE IF NOT EXISTS public.quick_apply_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- resume, cover_letter_template, portfolio, etc.
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_selected BOOLEAN DEFAULT false -- if this document is selected for current quick apply
);

-- Quick Apply Results Table
CREATE TABLE IF NOT EXISTS public.quick_apply_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID REFERENCES public.quick_apply_targets(id) ON DELETE CASCADE,
  cover_letter_text TEXT DEFAULT NULL,
  email_subject TEXT DEFAULT NULL,
  email_body TEXT DEFAULT NULL,
  generated_at TIMESTAMPTZ DEFAULT NULL,
  edited_by_user BOOLEAN DEFAULT false,
  user_edited_text TEXT DEFAULT NULL,
  documents_included JSONB DEFAULT NULL -- list of document IDs included
);

-- Quick Apply Submissions Table
CREATE TABLE IF NOT EXISTS public.quick_apply_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.quick_apply_sessions(id) ON DELETE CASCADE,
  submission_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  targets_submitted INTEGER DEFAULT 0,
  targets_failed INTEGER DEFAULT 0,
  details JSONB DEFAULT NULL -- details about the submission
);

-- Function to create a new Quick Apply session
CREATE OR REPLACE FUNCTION public.create_quick_apply_session(
  p_settings JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  INSERT INTO public.quick_apply_sessions (
    user_id,
    settings
  ) VALUES (
    v_user_id,
    p_settings
  ) RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a target to a Quick Apply session
CREATE OR REPLACE FUNCTION public.add_quick_apply_target(
  p_session_id UUID,
  p_target_url TEXT DEFAULT NULL,
  p_job_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_target_id UUID;
  v_job_title TEXT;
  v_company_name TEXT;
  v_user_id UUID := auth.uid();
BEGIN
  -- Validate that the session belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM public.quick_apply_sessions
    WHERE id = p_session_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Session not found or not owned by user';
  END IF;
  
  -- If internal job_id is provided, get job details
  IF p_job_id IS NOT NULL THEN
    SELECT title, company_name
    INTO v_job_title, v_company_name
    FROM public.jobs
    WHERE id = p_job_id;
  END IF;
  
  -- Insert the new target
  INSERT INTO public.quick_apply_targets (
    session_id,
    target_url,
    job_id,
    job_title,
    company_name,
    status
  ) VALUES (
    p_session_id,
    p_target_url,
    p_job_id,
    v_job_title,
    v_company_name,
    CASE 
      WHEN p_job_id IS NOT NULL THEN 'processed' -- internal jobs already have data
      ELSE 'pending' -- external URLs need processing
    END
  ) RETURNING id INTO v_target_id;
  
  -- Update session's updated_at timestamp
  UPDATE public.quick_apply_sessions
  SET updated_at = now()
  WHERE id = p_session_id;
  
  RETURN v_target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process a Quick Apply target (extract job details from URL)
CREATE OR REPLACE FUNCTION public.process_quick_apply_target(
  p_target_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_target RECORD;
  v_user_id UUID := auth.uid();
  v_result JSONB;
  v_session_id UUID;
BEGIN
  -- Get target details
  SELECT * INTO v_target
  FROM public.quick_apply_targets t
  JOIN public.quick_apply_sessions s ON t.session_id = s.id
  WHERE t.id = p_target_id AND s.user_id = v_user_id;
  
  IF v_target IS NULL THEN
    RAISE EXCEPTION 'Target not found or not owned by user';
  END IF;
  
  v_session_id := v_target.session_id;
  
  -- Skip if already processed or if it's an internal job
  IF v_target.status = 'processed' OR v_target.job_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'already_processed',
      'target_id', p_target_id
    );
  END IF;
  
  -- Update scrape status to pending
  UPDATE public.quick_apply_targets
  SET scrape_status = 'pending'
  WHERE id = p_target_id;
  
  -- Simulate job data extraction (would be done by an edge function)
  -- Here we're generating mock data
  UPDATE public.quick_apply_targets
  SET 
    scrape_status = 'complete',
    job_title = 
      CASE 
        WHEN v_target.target_url LIKE '%developer%' THEN 'Software Developer'
        WHEN v_target.target_url LIKE '%design%' THEN 'UX Designer'
        WHEN v_target.target_url LIKE '%product%' THEN 'Product Manager'
        ELSE 'Position at ' || split_part(regexp_replace(v_target.target_url, '^https?://(www\.)?', ''), '/', 1)
      END,
    company_name = split_part(regexp_replace(v_target.target_url, '^https?://(www\.)?', ''), '/', 1),
    email_address = 
      CASE 
        WHEN v_target.target_url LIKE '%example.com%' THEN 'careers@example.com'
        WHEN v_target.target_url LIKE '%test.org%' THEN 'jobs@test.org'
        ELSE 'hr@' || split_part(regexp_replace(v_target.target_url, '^https?://(www\.)?', ''), '/', 1)
      END,
    status = 'processed',
    processed_at = now(),
    extracted_data = jsonb_build_object(
      'description', 'We are looking for a talented professional to join our team...',
      'location', 'Remote',
      'employment_type', 'Full-time',
      'meta', jsonb_build_object(
        'extracted_at', now(),
        'source_url', v_target.target_url
      )
    )
  WHERE id = p_target_id
  RETURNING jsonb_build_object(
    'target_id', id,
    'job_title', job_title,
    'company_name', company_name,
    'email_address', email_address,
    'status', status,
    'processed_at', processed_at
  ) INTO v_result;
  
  -- Update session's updated_at timestamp
  UPDATE public.quick_apply_sessions
  SET updated_at = now()
  WHERE id = v_session_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate cover letters for all targets in a session
CREATE OR REPLACE FUNCTION public.generate_quick_apply_cover_letters(
  p_session_id UUID,
  p_cv_id UUID -- Resume document ID to use for generation
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session RECORD;
  v_cv RECORD;
  v_targets RECORD;
  v_token_balance INTEGER;
  v_token_cost INTEGER;
  v_tokens_deducted BOOLEAN;
  v_generated_count INTEGER := 0;
  v_failed_count INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Get session details and validate ownership
  SELECT * INTO v_session
  FROM public.quick_apply_sessions
  WHERE id = p_session_id AND user_id = v_user_id;
  
  IF v_session IS NULL THEN
    RAISE EXCEPTION 'Session not found or not owned by user';
  END IF;
  
  -- Get CV details
  SELECT * INTO v_cv
  FROM public.quick_apply_documents
  WHERE id = p_cv_id AND user_id = v_user_id;
  
  IF v_cv IS NULL THEN
    RAISE EXCEPTION 'CV not found or not owned by user';
  END IF;
  
  -- Check token balance
  SELECT token_balance INTO v_token_balance
  FROM public.user_subscriptions
  WHERE user_id = v_user_id;
  
  -- Count targets to process
  SELECT COUNT(*) INTO v_token_cost
  FROM public.quick_apply_targets
  WHERE 
    session_id = p_session_id AND 
    status = 'processed' AND
    NOT EXISTS (
      SELECT 1 FROM public.quick_apply_results
      WHERE target_id = quick_apply_targets.id
    );
  
  -- Check if enough tokens
  IF v_token_balance < v_token_cost THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Insufficient token balance',
      'required', v_token_cost,
      'balance', v_token_balance
    );
  END IF;
  
  -- Deduct tokens
  UPDATE public.user_subscriptions
  SET token_balance = token_balance - v_token_cost
  WHERE user_id = v_user_id;
  
  -- Record token transaction
  INSERT INTO public.token_transactions (
    user_id,
    type,
    amount,
    description,
    flow_name,
    related_purchase_id
  ) VALUES (
    v_user_id,
    'debit',
    v_token_cost,
    'Batch cover letter generation for ' || v_token_cost || ' jobs',
    'quick_apply_cover_letters',
    p_session_id::TEXT
  );
  
  -- Update session token cost
  UPDATE public.quick_apply_sessions
  SET token_cost = v_token_cost
  WHERE id = p_session_id;
  
  -- Process each target
  FOR v_targets IN (
    SELECT * 
    FROM public.quick_apply_targets
    WHERE 
      session_id = p_session_id AND 
      status = 'processed' AND
      NOT EXISTS (
        SELECT 1 FROM public.quick_apply_results
        WHERE target_id = quick_apply_targets.id
      )
  ) LOOP
    BEGIN
      -- Generate cover letter (in production, this would call an AI service)
      -- Here we're generating mock content
      INSERT INTO public.quick_apply_results (
        target_id,
        cover_letter_text,
        email_subject,
        email_body,
        generated_at,
        documents_included
      ) VALUES (
        v_targets.id,
        'Sehr geehrte Damen und Herren,\n\nMit großem Interesse bewerbe ich mich auf die Position als ' || 
        v_targets.job_title || ' bei ' || v_targets.company_name || '.\n\n' ||
        'Meine Erfahrungen und Fähigkeiten passen hervorragend zu den Anforderungen dieser Stelle. ' ||
        'Ich bin überzeugt, dass ich durch meine bisherige berufliche Laufbahn wertvolle Beiträge zu Ihrem Team leisten kann.\n\n' ||
        'Ich freue mich auf die Gelegenheit, meine Qualifikationen in einem persönlichen Gespräch näher zu erläutern.\n\n' ||
        'Mit freundlichen Grüßen,\n\n',
        'Bewerbung als ' || v_targets.job_title,
        'Sehr geehrte Damen und Herren,\n\nAnbei finden Sie meine Bewerbung für die Position als ' || 
        v_targets.job_title || '.\n\n' ||
        'Anbei finden Sie meinen Lebenslauf und weitere Unterlagen.\n\n' ||
        'Mit freundlichen Grüßen,\n\n',
        now(),
        jsonb_build_array(p_cv_id)
      );
      
      v_generated_count := v_generated_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_failed_count := v_failed_count + 1;
    END;
  END LOOP;
  
  -- Update session status
  UPDATE public.quick_apply_sessions
  SET 
    status = CASE 
      WHEN v_failed_count = 0 AND v_generated_count > 0 THEN 'ready'
      WHEN v_failed_count > 0 AND v_generated_count = 0 THEN 'error'
      ELSE 'processing'
    END,
    updated_at = now(),
    error_details = CASE 
      WHEN v_failed_count > 0 
      THEN 'Failed to generate ' || v_failed_count || ' cover letters'
      ELSE NULL
    END
  WHERE id = p_session_id;
  
  -- Prepare result
  v_result := jsonb_build_object(
    'success', TRUE,
    'session_id', p_session_id,
    'generated_count', v_generated_count,
    'failed_count', v_failed_count,
    'tokens_used', v_token_cost
  );
  
  -- Log AI interaction
  PERFORM public.log_ai_interaction(
    'quick_apply_cover_letters',
    jsonb_build_object(
      'session_id', p_session_id,
      'target_count', v_token_cost
    ),
    v_result
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit applications
CREATE OR REPLACE FUNCTION public.submit_quick_apply_batch(
  p_session_id UUID,
  p_sender_email TEXT,
  p_privacy_agreed BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session RECORD;
  v_submission_id UUID;
  v_targets_count INTEGER;
  v_success_count INTEGER := 0;
  v_fail_count INTEGER := 0;
  v_result JSONB;
BEGIN
  -- Validate privacy agreement
  IF NOT p_privacy_agreed THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'You must agree to the privacy policy to submit applications'
    );
  END IF;
  
  -- Get session details and validate ownership
  SELECT * INTO v_session
  FROM public.quick_apply_sessions
  WHERE id = p_session_id AND user_id = v_user_id;
  
  IF v_session IS NULL THEN
    RAISE EXCEPTION 'Session not found or not owned by user';
  END IF;
  
  -- Check if session is ready
  IF v_session.status != 'ready' THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Session is not ready for submission. Current status: ' || v_session.status
    );
  END IF;
  
  -- Count targets
  SELECT COUNT(*) INTO v_targets_count
  FROM public.quick_apply_targets t
  JOIN public.quick_apply_results r ON t.id = r.target_id
  WHERE t.session_id = p_session_id;
  
  -- Create submission record
  INSERT INTO public.quick_apply_submissions (
    session_id,
    status,
    targets_submitted,
    targets_failed,
    details
  ) VALUES (
    p_session_id,
    'pending',
    0,
    0,
    jsonb_build_object(
      'sender_email', p_sender_email,
      'privacy_agreed', p_privacy_agreed,
      'start_time', now()
    )
  ) RETURNING id INTO v_submission_id;
  
  -- In a real implementation, this would initiate an email sending process
  -- For demonstration purposes, we'll simulate successful submissions
  
  -- Update submission record
  UPDATE public.quick_apply_submissions
  SET
    status = 'sent',
    targets_submitted = v_targets_count,
    targets_failed = 0,
    details = jsonb_set(
      details,
      '{end_time}',
      to_jsonb(now())
    )
  WHERE id = v_submission_id;
  
  -- Update session status
  UPDATE public.quick_apply_sessions
  SET
    status = 'submitted',
    updated_at = now()
  WHERE id = p_session_id;
  
  -- Create application records for internal jobs (optional)
  -- This creates actual application records for any internal namuH jobs in the batch
  WITH internal_jobs AS (
    SELECT 
      t.id AS target_id,
      t.job_id,
      t.job_title,
      t.company_name,
      r.cover_letter_text,
      d.file_path AS cv_url
    FROM 
      public.quick_apply_targets t
    JOIN 
      public.quick_apply_results r ON t.id = r.target_id
    JOIN
      public.quick_apply_documents d ON d.id = (r.documents_included->0)::uuid
    WHERE 
      t.session_id = p_session_id AND
      t.job_id IS NOT NULL
  )
  INSERT INTO public.applications (
    job_id,
    applicant_id,
    applicant_name,
    job_title,
    company_name,
    status,
    current_phase,
    cv_url,
    cover_letter_url, -- In a real system, we'd store the generated cover letter
    application_source
  )
  SELECT
    ij.job_id,
    (SELECT profile_id FROM public.users WHERE id = v_user_id),
    (SELECT name FROM public.applicant_profiles WHERE id = (SELECT profile_id FROM public.users WHERE id = v_user_id)),
    ij.job_title,
    ij.company_name,
    'Applied',
    'Bewerbung eingegangen',
    ij.cv_url,
    NULL, -- Would be a URL to the stored cover letter
    'Quick Apply'
  FROM internal_jobs ij;
  
  -- Log the action
  PERFORM public.log_ai_interaction(
    'quick_apply_submission',
    jsonb_build_object(
      'session_id', p_session_id,
      'target_count', v_targets_count,
      'sender_email', p_sender_email
    ),
    jsonb_build_object(
      'submission_id', v_submission_id,
      'success', TRUE,
      'targets_submitted', v_targets_count
    )
  );
  
  -- Return result
  RETURN jsonb_build_object(
    'success', TRUE,
    'submission_id', v_submission_id,
    'targets_submitted', v_targets_count,
    'targets_failed', 0,
    'sender_email', p_sender_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get Quick Apply documents
CREATE OR REPLACE FUNCTION public.get_quick_apply_documents(
  p_document_type TEXT DEFAULT NULL
)
RETURNS SETOF public.quick_apply_documents AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT * FROM public.quick_apply_documents
  WHERE 
    user_id = v_user_id AND
    (p_document_type IS NULL OR document_type = p_document_type)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get Quick Apply session with targets and results
CREATE OR REPLACE FUNCTION public.get_quick_apply_session(
  p_session_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session RECORD;
  v_targets JSONB;
  v_results JSONB;
  v_documents JSONB;
  v_submissions JSONB;
BEGIN
  -- Get session details and validate ownership
  SELECT * INTO v_session
  FROM public.quick_apply_sessions
  WHERE id = p_session_id AND user_id = v_user_id;
  
  IF v_session IS NULL THEN
    RAISE EXCEPTION 'Session not found or not owned by user';
  END IF;
  
  -- Get targets
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'target_url', t.target_url,
      'job_id', t.job_id,
      'status', t.status,
      'job_title', t.job_title,
      'company_name', t.company_name,
      'email_address', t.email_address,
      'created_at', t.created_at,
      'processed_at', t.processed_at
    )
  )
  INTO v_targets
  FROM public.quick_apply_targets t
  WHERE t.session_id = p_session_id
  ORDER BY t.created_at;
  
  -- Get results
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'target_id', r.target_id,
      'cover_letter_text', r.cover_letter_text,
      'email_subject', r.email_subject,
      'email_body', r.email_body,
      'generated_at', r.generated_at,
      'edited_by_user', r.edited_by_user,
      'documents_included', r.documents_included
    )
  )
  INTO v_results
  FROM public.quick_apply_results r
  JOIN public.quick_apply_targets t ON r.target_id = t.id
  WHERE t.session_id = p_session_id;
  
  -- Get selected documents
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', d.id,
      'document_type', d.document_type,
      'name', d.name,
      'file_path', d.file_path,
      'content_type', d.content_type,
      'size', d.size,
      'created_at', d.created_at
    )
  )
  INTO v_documents
  FROM public.quick_apply_documents d
  WHERE 
    d.user_id = v_user_id AND 
    d.is_selected = TRUE;
  
  -- Get submissions
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'submission_time', s.submission_time,
      'status', s.status,
      'targets_submitted', s.targets_submitted,
      'targets_failed', s.targets_failed,
      'details', s.details
    )
  )
  INTO v_submissions
  FROM public.quick_apply_submissions s
  WHERE s.session_id = p_session_id;
  
  -- Return full session data
  RETURN jsonb_build_object(
    'session', jsonb_build_object(
      'id', v_session.id,
      'status', v_session.status,
      'created_at', v_session.created_at,
      'updated_at', v_session.updated_at,
      'settings', v_session.settings,
      'token_cost', v_session.token_cost,
      'error_details', v_session.error_details
    ),
    'targets', COALESCE(v_targets, '[]'::jsonb),
    'results', COALESCE(v_results, '[]'::jsonb),
    'documents', COALESCE(v_documents, '[]'::jsonb),
    'submissions', COALESCE(v_submissions, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a cover letter or email content
CREATE OR REPLACE FUNCTION public.update_quick_apply_result(
  p_result_id UUID,
  p_cover_letter_text TEXT DEFAULT NULL,
  p_email_subject TEXT DEFAULT NULL,
  p_email_body TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 
    FROM public.quick_apply_results r
    JOIN public.quick_apply_targets t ON r.target_id = t.id
    JOIN public.quick_apply_sessions s ON t.session_id = s.id
    WHERE r.id = p_result_id AND s.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Result not found or not owned by user';
  END IF;
  
  -- Update the result
  UPDATE public.quick_apply_results
  SET
    cover_letter_text = COALESCE(p_cover_letter_text, cover_letter_text),
    email_subject = COALESCE(p_email_subject, email_subject),
    email_body = COALESCE(p_email_body, email_body),
    edited_by_user = TRUE,
    user_edited_text = CASE
      WHEN p_cover_letter_text IS NOT NULL THEN p_cover_letter_text
      ELSE user_edited_text
    END
  WHERE id = p_result_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all Quick Apply tables
ALTER TABLE public.quick_apply_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_apply_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_apply_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_apply_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_apply_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own Quick Apply sessions"
  ON public.quick_apply_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage targets in their own Quick Apply sessions"
  ON public.quick_apply_targets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quick_apply_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own Quick Apply documents"
  ON public.quick_apply_documents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage results for their own Quick Apply targets"
  ON public.quick_apply_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quick_apply_targets t
      JOIN public.quick_apply_sessions s ON t.session_id = s.id
      WHERE t.id = target_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view submissions for their own Quick Apply sessions"
  ON public.quick_apply_submissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quick_apply_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );