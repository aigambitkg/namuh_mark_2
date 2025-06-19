-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_id UUID;
    subscription_id UUID;
    user_role TEXT;
    default_tier TEXT;
    default_token_balance INT;
    default_token_allowance INT;
BEGIN
    -- Get role from metadata
    user_role := NEW.raw_user_meta_data->>'role';

    -- Default role to 'applicant' if not set
    IF user_role IS NULL THEN
        user_role := 'applicant';
    END IF;
    
    -- Create appropriate profile based on role
    IF user_role = 'applicant' THEN
        INSERT INTO public.applicant_profiles (
            name,
            avatar_url,
            visibility,
            allow_in_talent_pool
        ) VALUES (
            COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
            NULL, -- Default avatar
            'public', -- Default visibility
            true -- Default allow in talent pool
        ) RETURNING id INTO profile_id;
        
        default_tier := 'applicant_starter';
        default_token_balance := 20;
        default_token_allowance := 20;
    ELSE
        -- For recruiters
        INSERT INTO public.recruiter_profiles (
            name,
            avatar_url,
            share_calendar,
            allow_applicant_feedback
        ) VALUES (
            COALESCE(NEW.raw_user_meta_data->>'name', 'New Recruiter'),
            NULL, -- Default avatar
            false, -- Default share calendar
            true -- Default allow feedback
        ) RETURNING id INTO profile_id;
        
        default_tier := 'recruiter_basis';
        default_token_balance := 0;
        default_token_allowance := 0;
    END IF;
    
    -- Create subscription
    INSERT INTO public.user_subscriptions (
        user_id,
        plan_id,
        tier_name,
        status,
        current_period_start,
        current_period_end,
        token_balance,
        monthly_token_allowance,
        quiz_uses_remaining,
        active_job_posting_limit,
        profile_matcher_searches_remaining,
        last_token_refresh
    ) VALUES (
        NEW.id,
        default_tier,
        default_tier,
        'active',
        CURRENT_TIMESTAMP,
        (CURRENT_TIMESTAMP + INTERVAL '30 days'),
        default_token_balance,
        default_token_allowance,
        CASE WHEN user_role = 'applicant' THEN 2 ELSE 0 END, -- Only applicants get quiz uses
        CASE WHEN user_role = 'recruiter' THEN 2 ELSE 0 END, -- Only recruiters get job posting limits
        CASE WHEN user_role = 'recruiter' THEN 0 ELSE 0 END, -- Only paid recruiters get profile matcher searches
        CURRENT_TIMESTAMP
    ) RETURNING id INTO subscription_id;
    
    -- Create user entry in our custom users table
    INSERT INTO public.users (
        id,
        email,
        role,
        profile_id,
        subscription_id
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role,
        profile_id,
        subscription_id
    );

    -- Create pseudonym mapping for privacy
    INSERT INTO public.user_pseudonym_maps (
        uid,
        pseudonym
    ) VALUES (
        NEW.id,
        'SYNONYM_ID_USER' || substr(md5(random()::text || clock_timestamp()::text), 1, 8)
    );
    
    -- Log the creation in audit logs
    INSERT INTO public.audit_logs (
        user_id,
        action_type,
        action_details,
        resource_type,
        resource_id,
        status,
        severity
    ) VALUES (
        NEW.id,
        'user_created',
        jsonb_build_object(
            'email', NEW.email,
            'role', user_role
        ),
        'users',
        NEW.id,
        'success',
        'info'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and create a job (enforcing limits on backend)
CREATE OR REPLACE FUNCTION public.create_job(
    p_title TEXT,
    p_company_name TEXT,
    p_company_id UUID,
    p_location TEXT,
    p_description TEXT,
    p_salary_min NUMERIC(10,2),
    p_salary_max NUMERIC(10,2),
    p_currency TEXT DEFAULT 'EUR',
    p_responsibilities TEXT[] DEFAULT NULL,
    p_qualifications TEXT[] DEFAULT NULL,
    p_benefits TEXT[] DEFAULT NULL,
    p_is_leadership_role BOOLEAN DEFAULT false,
    p_employment_type TEXT DEFAULT 'full-time',
    p_application_phases TEXT[] DEFAULT NULL,
    p_status TEXT DEFAULT 'draft'
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_recruiter_id UUID;
    v_user_role TEXT;
    v_job_id UUID;
    v_active_job_count INT;
    v_job_posting_limit INT;
BEGIN
    -- Get recruiter profile ID
    SELECT profile_id, role INTO v_recruiter_id, v_user_role
    FROM public.users
    WHERE id = v_user_id;
    
    -- Ensure user is a recruiter
    IF v_user_role != 'recruiter' THEN
        RAISE EXCEPTION 'Only recruiters can create jobs';
    END IF;
    
    -- Check if user has available job posting slots
    SELECT active_job_posting_limit INTO v_job_posting_limit
    FROM public.user_subscriptions
    WHERE user_id = v_user_id;
    
    -- Count active jobs by this recruiter
    SELECT COUNT(*) INTO v_active_job_count
    FROM public.jobs
    WHERE recruiter_id = v_recruiter_id AND status = 'active';
    
    -- Check if limit has been reached
    IF v_active_job_count >= v_job_posting_limit THEN
        RAISE EXCEPTION 'Job posting limit reached: % of % slots used', 
                       v_active_job_count, v_job_posting_limit;
    END IF;
    
    -- Create new job
    INSERT INTO public.jobs (
        title,
        company_name,
        company_id,
        location,
        salary_min,
        salary_max,
        currency,
        description,
        responsibilities,
        qualifications,
        benefits,
        recruiter_id,
        posted_date,
        is_leadership_role,
        employment_type,
        application_phases,
        status,
        performance_stats
    ) VALUES (
        p_title,
        p_company_name,
        p_company_id,
        p_location,
        p_salary_min,
        p_salary_max,
        p_currency,
        p_description,
        p_responsibilities,
        p_qualifications,
        p_benefits,
        v_recruiter_id,
        NOW(),
        p_is_leadership_role,
        p_employment_type,
        p_application_phases,
        p_status,
        jsonb_build_object(
            'impressions', 0,
            'clicks', 0,
            'avgDwellTimeSeconds', 0,
            'cvMatcherUses', 0
        )
    ) RETURNING id INTO v_job_id;
    
    -- Log job creation
    INSERT INTO public.audit_logs (
        user_id,
        action_type,
        action_details,
        resource_type,
        resource_id
    ) VALUES (
        v_user_id,
        'job_created',
        jsonb_build_object(
            'job_id', v_job_id,
            'job_title', p_title
        ),
        'jobs',
        v_job_id
    );
    
    RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for applying to jobs - handles applicant ID lookup
CREATE OR REPLACE FUNCTION public.apply_to_job(
    p_job_id UUID,
    p_cv_url TEXT DEFAULT NULL,
    p_cover_letter_url TEXT DEFAULT NULL,
    p_profile_summary TEXT DEFAULT NULL,
    p_application_source TEXT DEFAULT 'website'
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_applicant_id UUID;
    v_applicant_name TEXT;
    v_job_title TEXT;
    v_company_name TEXT;
    v_match_score NUMERIC(5,2);
    v_application_id UUID;
BEGIN
    -- Get applicant profile ID
    SELECT profile_id INTO v_applicant_id
    FROM public.users
    WHERE id = v_user_id AND role = 'applicant';
    
    IF v_applicant_id IS NULL THEN
        RAISE EXCEPTION 'You must be logged in as an applicant to apply for jobs';
    END IF;
    
    -- Get applicant name
    SELECT name INTO v_applicant_name
    FROM public.applicant_profiles
    WHERE id = v_applicant_id;
    
    -- Get job details
    SELECT title, company_name INTO v_job_title, v_company_name
    FROM public.jobs
    WHERE id = p_job_id;
    
    IF v_job_title IS NULL THEN
        RAISE EXCEPTION 'Job not found';
    END IF;
    
    -- Calculate match score
    SELECT check_application_match_score(p_job_id, v_applicant_id) INTO v_match_score;
    
    -- Create application
    INSERT INTO public.applications (
        job_id,
        applicant_id,
        applicant_name,
        job_title,
        company_name,
        status,
        current_phase,
        match_score,
        cv_url,
        cover_letter_url,
        profile_summary_from_application,
        application_source
    ) VALUES (
        p_job_id,
        v_applicant_id,
        v_applicant_name,
        v_job_title,
        v_company_name,
        'Applied',
        'Bewerbung eingegangen',
        v_match_score,
        p_cv_url,
        p_cover_letter_url,
        p_profile_summary,
        p_application_source
    ) RETURNING id INTO v_application_id;
    
    -- Log the application
    INSERT INTO public.audit_logs (
        user_id,
        action_type,
        action_details,
        resource_type,
        resource_id
    ) VALUES (
        v_user_id,
        'application_submitted',
        jsonb_build_object(
            'job_id', p_job_id,
            'job_title', v_job_title,
            'application_id', v_application_id
        ),
        'applications',
        v_application_id
    );
    
    RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies

-- Users can only see their own profile data
ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applicant profile"
  ON public.applicant_profiles
  FOR SELECT
  USING (
    id IN (
      SELECT profile_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own applicant profile"
  ON public.applicant_profiles
  FOR UPDATE
  USING (
    id IN (
      SELECT profile_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Same for recruiter profiles
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recruiter profile"
  ON public.recruiter_profiles
  FOR SELECT
  USING (
    id IN (
      SELECT profile_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own recruiter profile"
  ON public.recruiter_profiles
  FOR UPDATE
  USING (
    id IN (
      SELECT profile_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Make sure the "get user by profile" function exists
CREATE OR REPLACE FUNCTION public.get_user_by_profile_id(profile_id UUID)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id
    FROM public.users
    WHERE profile_id = get_user_by_profile_id.profile_id;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check user's own profile
CREATE OR REPLACE FUNCTION public.is_own_profile(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND profile_id = is_own_profile.profile_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;