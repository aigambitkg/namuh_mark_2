-- Create necessary tables for GDPR compliance

-- Table to track user consent
CREATE TABLE IF NOT EXISTS public.user_consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- e.g., 'essential', 'analytics', 'marketing', 'third-party'
  consent_given BOOLEAN NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_version TEXT,
  consent_text TEXT -- Full text of what was consented to
);

-- Table to record data processing activities
CREATE TABLE IF NOT EXISTS public.data_processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_type TEXT NOT NULL, -- e.g., 'profile_creation', 'application_submission', 'ai_processing'
  description TEXT NOT NULL,
  legal_basis TEXT NOT NULL, -- e.g., 'consent', 'contract', 'legitimate_interest'
  processor TEXT, -- Who processed the data (internal/third-party)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  related_entity_type TEXT, -- e.g., 'job', 'application', 'message'
  related_entity_id UUID
);

-- Table to track data access requests
CREATE TABLE IF NOT EXISTS public.data_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL, -- e.g., 'export', 'deletion', 'rectification'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  request_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  completion_date TIMESTAMPTZ,
  request_details JSONB,
  admin_notes TEXT
);

-- Function to export user data (data portability)
CREATE OR REPLACE FUNCTION public.export_user_data()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSONB;
BEGIN
  -- Record the access request
  INSERT INTO public.data_access_requests (
    user_id,
    request_type,
    status,
    request_details
  ) VALUES (
    v_user_id,
    'export',
    'processing',
    jsonb_build_object(
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::json->'user-agent',
      'ip_address', current_setting('request.headers', true)::json->'x-forwarded-for'
    )
  );
  
  -- Compile user data from various tables
  WITH user_data AS (
    SELECT 
      u.id,
      u.email,
      u.role,
      u.created_at,
      u.profile_id,
      CASE
        WHEN u.role = 'applicant' THEN (
          SELECT jsonb_build_object(
            'id', ap.id,
            'name', ap.name,
            'summary', ap.summary,
            'contact_email', ap.contact_email,
            'contact_phone', ap.contact_phone,
            'hard_skills', ap.hard_skills,
            'soft_skills', ap.soft_skills,
            'linkedin_profile_url', ap.linkedin_profile_url,
            'xing_profile_url', ap.xing_profile_url,
            'visibility', ap.visibility,
            'allow_in_talent_pool', ap.allow_in_talent_pool
          )
          FROM public.applicant_profiles ap
          WHERE ap.id = u.profile_id
        )
        WHEN u.role = 'recruiter' THEN (
          SELECT jsonb_build_object(
            'id', rp.id,
            'name', rp.name,
            'role_title', rp.role_title,
            'company_name', rp.company_name,
            'company_id', rp.company_id,
            'bio', rp.bio,
            'linkedin_profile_url', rp.linkedin_profile_url
          )
          FROM public.recruiter_profiles rp
          WHERE rp.id = u.profile_id
        )
        ELSE NULL
      END AS profile
    FROM public.users u
    WHERE u.id = v_user_id
  ),
  user_applications AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'job_id', a.job_id,
        'job_title', a.job_title,
        'company_name', a.company_name,
        'status', a.status,
        'current_phase', a.current_phase,
        'applied_date', a.applied_date,
        'last_updated', a.last_updated,
        'match_score', a.match_score
      )
    ) AS applications
    FROM public.applications a
    JOIN user_data ud ON a.applicant_id = ud.profile_id
    WHERE ud.role = 'applicant'
  ),
  user_educations AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', e.id,
        'institution', e.institution,
        'degree', e.degree,
        'field_of_study', e.field_of_study,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'grade', e.grade,
        'activities', e.activities,
        'description', e.description,
        'is_current', e.is_current
      )
    ) AS educations
    FROM public.applicant_educations e
    JOIN user_data ud ON e.applicant_profile_id = ud.profile_id
    WHERE ud.role = 'applicant'
  ),
  user_experiences AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', e.id,
        'company', e.company,
        'position', e.position,
        'location', e.location,
        'start_date', e.start_date,
        'end_date', e.end_date,
        'is_current', e.is_current,
        'description', e.description,
        'skills', e.skills
      )
    ) AS experiences
    FROM public.applicant_experiences e
    JOIN user_data ud ON e.applicant_profile_id = ud.profile_id
    WHERE ud.role = 'applicant'
  ),
  user_certifications AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'organization', c.organization,
        'issue_date', c.issue_date,
        'expiration_date', c.expiration_date,
        'credential_id', c.credential_id,
        'credential_url', c.credential_url
      )
    ) AS certifications
    FROM public.applicant_certifications c
    JOIN user_data ud ON c.applicant_profile_id = ud.profile_id
    WHERE ud.role = 'applicant'
  ),
  user_conversations AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'participant_ids', c.participant_ids,
        'job_id', c.job_id,
        'job_title', c.job_title,
        'last_message', c.last_message,
        'last_message_timestamp', c.last_message_timestamp
      )
    ) AS conversations
    FROM public.chat_conversations c
    WHERE c.participant_ids @> ARRAY[v_user_id]
  ),
  user_messages AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'conversation_id', m.conversation_id,
        'content', m.content,
        'created_at', m.timestamp,
        'is_read', m.is_read
      )
    ) AS messages
    FROM public.chat_messages m
    WHERE m.sender_id = v_user_id OR m.receiver_id = v_user_id
  ),
  user_consent_history AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'consent_type', c.consent_type,
        'consent_given', c.consent_given,
        'created_at', c.created_at,
        'consent_version', c.consent_version,
        'consent_text', c.consent_text
      )
      ORDER BY c.created_at DESC
    ) AS consent_history
    FROM public.user_consent_logs c
    WHERE c.user_id = v_user_id
  ),
  user_processing_history AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'process_type', p.process_type,
        'description', p.description,
        'legal_basis', p.legal_basis,
        'processor', p.processor,
        'created_at', p.created_at,
        'related_entity_type', p.related_entity_type,
        'related_entity_id', p.related_entity_id
      )
      ORDER BY p.created_at DESC
    ) AS processing_history
    FROM public.data_processing_records p
    WHERE p.user_id = v_user_id
  )
  SELECT 
    jsonb_build_object(
      'user', (SELECT row_to_json(ud.*) FROM user_data ud),
      'applications', COALESCE((SELECT applications FROM user_applications), '[]'::jsonb),
      'profile', (SELECT profile FROM user_data),
      'educations', COALESCE((SELECT educations FROM user_educations), '[]'::jsonb),
      'experiences', COALESCE((SELECT experiences FROM user_experiences), '[]'::jsonb),
      'certifications', COALESCE((SELECT certifications FROM user_certifications), '[]'::jsonb),
      'conversations', COALESCE((SELECT conversations FROM user_conversations), '[]'::jsonb),
      'messages', COALESCE((SELECT messages FROM user_messages), '[]'::jsonb),
      'consent_history', COALESCE((SELECT consent_history FROM user_consent_history), '[]'::jsonb),
      'processing_history', COALESCE((SELECT processing_history FROM user_processing_history), '[]'::jsonb),
      'export_date', now(),
      'export_format_version', '1.0'
    )
  INTO v_result;
  
  -- Update request status
  UPDATE public.data_access_requests
  SET 
    status = 'completed',
    completion_date = now()
  WHERE 
    user_id = v_user_id AND
    request_type = 'export' AND
    status = 'processing';
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete user data (right to erasure)
CREATE OR REPLACE FUNCTION public.delete_user_data(
  p_user_id UUID DEFAULT NULL -- Admin can provide user_id, otherwise self
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
  v_profile_id UUID;
  v_user_role TEXT;
BEGIN
  -- Check if admin operation or self-operation
  v_is_admin := EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin'
  );
  
  -- Determine which user to delete
  IF p_user_id IS NOT NULL AND v_is_admin THEN
    v_user_id := p_user_id;
  ELSE
    v_user_id := auth.uid();
  END IF;
  
  -- Get user profile info
  SELECT profile_id, role 
  INTO v_profile_id, v_user_role 
  FROM public.users 
  WHERE id = v_user_id;
  
  -- Record the deletion request
  INSERT INTO public.data_access_requests (
    user_id,
    request_type,
    status,
    request_details
  ) VALUES (
    v_user_id,
    'deletion',
    'processing',
    jsonb_build_object(
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::json->'user-agent',
      'ip_address', current_setting('request.headers', true)::json->'x-forwarded-for',
      'requested_by', auth.uid()
    )
  );

  -- Pseudonymize data in applications
  -- Instead of outright deletion, pseudonymize for applications to maintain
  -- integrity where legally required
  IF v_user_role = 'applicant' THEN
    UPDATE public.applications 
    SET 
      applicant_name = 'Deleted User',
      profile_summary_from_application = '[Deleted]',
      profile_answers_from_application = NULL,
      cv_url = NULL,
      cover_letter_url = NULL
    WHERE applicant_id = v_profile_id;
    
    -- Delete education, experience, and certifications
    DELETE FROM public.applicant_educations WHERE applicant_profile_id = v_profile_id;
    DELETE FROM public.applicant_experiences WHERE applicant_profile_id = v_profile_id;
    DELETE FROM public.applicant_certifications WHERE applicant_profile_id = v_profile_id;
  END IF;
  
  -- Pseudonymize messages rather than deleting to maintain conversation integrity
  UPDATE public.chat_messages
  SET content = '[Message deleted by user]'
  WHERE sender_id = v_user_id;
  
  -- Delete forum posts by this user or anonymize them
  UPDATE public.forum_posts
  SET 
    author_name = 'Deleted User',
    content = CASE 
      -- Keep content when it's a public thread with replies
      WHEN comment_count > 0 THEN content || E'\n\n[User account has been deleted]'
      ELSE '[Content deleted]'
    END
  WHERE author_id = v_user_id;
  
  -- Anonymize comments
  UPDATE public.forum_comments
  SET 
    author_name = 'Deleted User',
    content = '[Comment deleted]'
  WHERE author_id = v_user_id;
  
  -- Delete private user data
  IF v_user_role = 'applicant' THEN
    UPDATE public.applicant_profiles
    SET 
      name = 'Deleted User',
      avatar_url = NULL,
      data_ai_hint_avatar = NULL,
      summary = NULL,
      contact_email = NULL,
      contact_phone = NULL,
      linkedin_profile_url = NULL,
      xing_profile_url = NULL,
      visibility = 'hidden'
    WHERE id = v_profile_id;
  ELSIF v_user_role = 'recruiter' THEN
    UPDATE public.recruiter_profiles
    SET 
      name = 'Former Recruiter',
      avatar_url = NULL,
      data_ai_hint_avatar = NULL,
      bio = NULL,
      linkedin_profile_url = NULL,
      share_calendar = false,
      calendar_url = NULL
    WHERE id = v_profile_id;
  END IF;
  
  -- Update user record
  UPDATE public.users
  SET email = 'deleted-' || md5(random()::text || clock_timestamp()::text) || '@deleted.namuh.de'
  WHERE id = v_user_id;
  
  -- Mark deletion request as completed
  UPDATE public.data_access_requests
  SET 
    status = 'completed',
    completion_date = now()
  WHERE 
    user_id = v_user_id AND
    request_type = 'deletion' AND
    status = 'processing';
  
  -- In a real implementation, we might have a delayed actual deletion that
  -- would completely remove records after a retention period
  -- But for the sake of this example, we'll consider the data "deleted"
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update consent preferences
CREATE OR REPLACE FUNCTION public.update_user_consent(
  p_consent_type TEXT,
  p_consent_given BOOLEAN,
  p_consent_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_ip_address TEXT;
  v_consent_version TEXT := '1.0'; -- Should match current version of consent forms
BEGIN
  -- Get IP address (in real implementation)
  v_ip_address := split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1);
  
  -- Record consent change
  INSERT INTO public.user_consent_logs (
    user_id,
    consent_type,
    consent_given,
    ip_address,
    consent_version,
    consent_text
  ) VALUES (
    v_user_id,
    p_consent_type,
    p_consent_given,
    v_ip_address,
    v_consent_version,
    COALESCE(p_consent_text, CASE 
      WHEN p_consent_type = 'marketing' THEN 'Consent to receive marketing communications'
      WHEN p_consent_type = 'analytics' THEN 'Consent to data analytics processing'
      WHEN p_consent_type = 'third_party' THEN 'Consent to share data with third parties'
      WHEN p_consent_type = 'talent_pool' THEN 'Consent to inclusion in talent pools'
      ELSE 'General data processing consent'
    END)
  );
  
  -- Update applicant profile settings if applicable
  IF p_consent_type = 'talent_pool' THEN
    UPDATE public.applicant_profiles
    SET allow_in_talent_pool = p_consent_given
    WHERE id IN (
      SELECT profile_id FROM public.users WHERE id = v_user_id
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data processing history
CREATE OR REPLACE FUNCTION public.get_data_processing_history(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  process_type TEXT,
  description TEXT,
  legal_basis TEXT,
  created_at TIMESTAMPTZ,
  related_entity_type TEXT,
  related_entity_id UUID,
  processor TEXT
) AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.process_type,
    p.description,
    p.legal_basis,
    p.created_at,
    p.related_entity_type,
    p.related_entity_id,
    p.processor
  FROM public.data_processing_records p
  WHERE p.user_id = v_user_id
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log data processing activity
CREATE OR REPLACE FUNCTION public.log_data_processing(
  p_user_id UUID,
  p_process_type TEXT,
  p_description TEXT,
  p_legal_basis TEXT,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_processor TEXT DEFAULT 'namuH'
)
RETURNS UUID AS $$
DECLARE
  v_record_id UUID;
BEGIN
  INSERT INTO public.data_processing_records (
    user_id,
    process_type,
    description,
    legal_basis,
    processor,
    related_entity_type,
    related_entity_id
  ) VALUES (
    p_user_id,
    p_process_type,
    p_description,
    p_legal_basis,
    p_processor,
    p_related_entity_type,
    p_related_entity_id
  ) RETURNING id INTO v_record_id;
  
  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current consent settings
CREATE OR REPLACE FUNCTION public.get_user_consent_settings()
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSONB;
  v_profile_id UUID;
  v_role TEXT;
  v_talent_pool_consent BOOLEAN;
BEGIN
  -- Get user info
  SELECT profile_id, role INTO v_profile_id, v_role
  FROM public.users
  WHERE id = v_user_id;
  
  -- Get talent pool consent if applicable
  IF v_role = 'applicant' THEN
    SELECT allow_in_talent_pool INTO v_talent_pool_consent
    FROM public.applicant_profiles
    WHERE id = v_profile_id;
  END IF;
  
  -- Get latest consent values for each type
  WITH latest_consents AS (
    SELECT DISTINCT ON (consent_type)
      consent_type,
      consent_given,
      created_at
    FROM public.user_consent_logs
    WHERE user_id = v_user_id
    ORDER BY consent_type, created_at DESC
  )
  SELECT 
    jsonb_build_object(
      'analytics', COALESCE((SELECT consent_given FROM latest_consents WHERE consent_type = 'analytics'), false),
      'marketing', COALESCE((SELECT consent_given FROM latest_consents WHERE consent_type = 'marketing'), false),
      'third_party', COALESCE((SELECT consent_given FROM latest_consents WHERE consent_type = 'third_party'), false),
      'essential', true, -- Essential data processing is always required
      'talent_pool', COALESCE(v_talent_pool_consent, false),
      'cookies', COALESCE((SELECT consent_given FROM latest_consents WHERE consent_type = 'cookies'), false),
      'profile_visibility', CASE 
        WHEN v_role = 'applicant' THEN (
          SELECT visibility FROM public.applicant_profiles WHERE id = v_profile_id
        )
        ELSE NULL
      END,
      'last_updated', (
        SELECT MAX(created_at) FROM latest_consents
      )
    )
  INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE public.user_consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Users can view their own consent logs"
  ON public.user_consent_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can see their own data processing records"
  ON public.data_processing_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can see their own data access requests"
  ON public.data_access_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create data access requests"
  ON public.data_access_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());