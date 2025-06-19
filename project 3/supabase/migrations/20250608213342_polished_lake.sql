/*
  # Community Forum, Multiposting and Profile Management Features
  
  1. Forum Functions
     - Functions to create and manage forum groups, posts, and comments
     - Anonymous posting capabilities for applicants
     
  2. Multiposting Features
     - Job posting to multiple platforms
     - Campaign management
     
  3. Applicant Profile Management
     - Education, experience, and certification tracking
     - Profile visibility controls
     
  4. Company Updates
     - Company news and updates management
     - Publishing controls
     
  5. Analytics Views
     - Application statistics
     - Applicant success metrics
*/

-- Community Forum Functions

-- Function to create a forum group
CREATE OR REPLACE FUNCTION public.create_forum_group(
  p_name TEXT,
  p_description TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_creator_type TEXT;
  v_group_id UUID;
BEGIN
  -- Determine creator type
  SELECT role INTO v_creator_type
  FROM public.users
  WHERE id = v_user_id;
  
  -- Insert new group
  INSERT INTO public.forum_groups (
    name,
    description,
    creator_id,
    creator_type,
    post_count,
    member_count
  ) VALUES (
    p_name,
    p_description,
    v_user_id,
    v_creator_type,
    0,
    1 -- Creator is first member
  ) RETURNING id INTO v_group_id;
  
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a forum post
CREATE OR REPLACE FUNCTION public.create_forum_post(
  p_group_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_tags TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_author_type TEXT;
  v_author_name TEXT;
  v_post_id UUID;
  v_pseudonym TEXT;
BEGIN
  -- Determine author type
  SELECT role INTO v_author_type
  FROM public.users
  WHERE id = v_user_id;
  
  -- Get user's pseudonym for anonymous posting
  SELECT pseudonym INTO v_pseudonym
  FROM public.user_pseudonym_maps
  WHERE uid = v_user_id;
  
  -- Set author name based on role
  v_author_name := CASE
    WHEN v_author_type = 'applicant' THEN 'Anonymer Bewerber'
    ELSE 'HR Specialist' -- For recruiters
  END;
  
  -- Insert new post
  INSERT INTO public.forum_posts (
    group_id,
    title,
    content,
    author_id,
    author_name,
    author_type,
    tags
  ) VALUES (
    p_group_id,
    p_title,
    p_content,
    v_user_id,
    v_author_name,
    v_author_type,
    p_tags
  ) RETURNING id INTO v_post_id;
  
  -- Update group post count
  UPDATE public.forum_groups
  SET post_count = post_count + 1
  WHERE id = p_group_id;
  
  RETURN v_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upvote a post
CREATE OR REPLACE FUNCTION public.upvote_forum_post(
  p_post_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_already_voted BOOLEAN;
BEGIN
  -- Check if user already voted
  SELECT EXISTS (
    SELECT 1 FROM public.forum_post_votes
    WHERE post_id = p_post_id AND user_id = v_user_id
  ) INTO v_already_voted;
  
  -- If already voted, return false
  IF v_already_voted THEN
    RETURN FALSE;
  END IF;
  
  -- Record the vote
  INSERT INTO public.forum_post_votes (
    post_id,
    user_id
  ) VALUES (
    p_post_id,
    v_user_id
  );
  
  -- Update post upvotes count
  UPDATE public.forum_posts
  SET upvotes = upvotes + 1
  WHERE id = p_post_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a comment to a post
CREATE OR REPLACE FUNCTION public.add_forum_comment(
  p_post_id UUID,
  p_content TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_author_type TEXT;
  v_author_name TEXT;
  v_pseudonym TEXT;
  v_comment_id UUID;
BEGIN
  -- Determine author type
  SELECT role INTO v_author_type
  FROM public.users
  WHERE id = v_user_id;
  
  -- Get user's pseudonym for anonymous posting
  SELECT pseudonym INTO v_pseudonym
  FROM public.user_pseudonym_maps
  WHERE uid = v_user_id;
  
  -- Set author name based on role
  v_author_name := CASE
    WHEN v_author_type = 'applicant' THEN 'Anonymer Bewerber'
    ELSE 'HR Specialist' -- For recruiters
  END;
  
  -- Insert new comment
  INSERT INTO public.forum_comments (
    post_id,
    content,
    author_id,
    author_name,
    author_type
  ) VALUES (
    p_post_id,
    p_content,
    v_user_id,
    v_author_name,
    v_author_type
  ) RETURNING id INTO v_comment_id;
  
  -- Update post comment count
  UPDATE public.forum_posts
  SET comment_count = comment_count + 1
  WHERE id = p_post_id;
  
  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get forum posts
CREATE OR REPLACE FUNCTION public.get_forum_posts(
  p_group_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_sort_by TEXT DEFAULT 'newest' -- 'newest', 'popular', 'trending'
)
RETURNS SETOF public.forum_posts AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order_by TEXT;
BEGIN
  -- Determine order clause based on sort parameter
  v_order_by := CASE p_sort_by
    WHEN 'popular' THEN 'upvotes DESC, created_date DESC'
    WHEN 'trending' THEN 'created_date + (upvotes * interval ''1 hour'') DESC'
    ELSE 'created_date DESC' -- Default to newest
  END;
  
  -- Return filtered and sorted posts
  RETURN QUERY EXECUTE '
    SELECT * FROM public.forum_posts
    WHERE ($1 IS NULL OR group_id = $1)
    ORDER BY ' || v_order_by || '
    LIMIT $2
    OFFSET $3
  ' USING p_group_id, p_limit, p_offset;
END;
$$ LANGUAGE plpgsql;

-- Create forum_post_votes table if not exists
CREATE TABLE IF NOT EXISTS public.forum_post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create forum_comments table if not exists
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  content TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name TEXT,
  author_type TEXT,
  created_date TIMESTAMPTZ DEFAULT now(),
  upvotes INTEGER DEFAULT 0
);

-- Enable RLS on forum tables
ALTER TABLE public.forum_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for forum tables
CREATE POLICY "Everyone can see forum groups"
  ON public.forum_groups
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Everyone can see forum posts"
  ON public.forum_posts
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can create forum posts"
  ON public.forum_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can vote on posts once"
  ON public.forum_post_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can see votes"
  ON public.forum_post_votes
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Everyone can see comments"
  ON public.forum_comments
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can create comments"
  ON public.forum_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Multiposting Functions

-- Create job_external_posting_platforms table if not exists
CREATE TABLE IF NOT EXISTS public.job_external_posting_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  base_cost NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  audience_description TEXT,
  audience_size TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  ranking INTEGER DEFAULT 1
);

-- Initialize with common job platforms
INSERT INTO public.job_external_posting_platforms
  (name, description, audience_description, audience_size, base_cost, features, ranking)
VALUES
  ('LinkedIn Jobs', 'Global professional network', 'Global Professionals', '900M+ members', 120.00, '["Sponsored Promotion", "Talent Insights", "Smart Targeting"]', 1),
  ('XING Jobs', 'DACH region professional network', 'DACH Professionals', '19M+ members', 89.00, '["Premium Placement", "Company Branding", "Analytics"]', 2),
  ('StepStone', 'Leading German job board', 'German Job Seekers', '6M+ monthly', 150.00, '["Featured Job", "Logo Placement", "Performance Analytics"]', 3),
  ('Indeed', 'Global job search engine', 'Global Audience', '350M+ visitors', 75.00, '["Sponsored Job", "Company Page", "Resume Database"]', 4),
  ('Monster', 'International job board', 'Diverse Industries', '2M+ monthly', 95.00, '["Job Branding", "Resume Search", "Employer Branding"]', 5),
  ('Glassdoor', 'Company review and job site', 'Company-Focused', '59M+ monthly', 110.00, '["Employer Brand", "Reviews Integration", "Salary Insights"]', 6)
ON CONFLICT (id) DO NOTHING;

-- Function to create multiposting campaign
CREATE OR REPLACE FUNCTION public.create_multiposting_campaign(
  p_job_id UUID,
  p_platforms UUID[],
  p_custom_content JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_recruiter_id UUID;
  v_campaign_id UUID;
  v_platform_record RECORD;
  v_total_cost NUMERIC(10,2) := 0;
  v_service_fee NUMERIC(10,2) := 0;
  v_tier TEXT;
BEGIN
  -- Get recruiter profile and subscription tier
  SELECT u.profile_id, s.tier_name 
  INTO v_recruiter_id, v_tier
  FROM public.users u
  JOIN public.user_subscriptions s ON u.id = s.user_id
  WHERE u.id = v_user_id AND u.role = 'recruiter';
  
  IF v_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'User is not a recruiter';
  END IF;
  
  -- Calculate service fee based on tier
  v_service_fee := CASE
    WHEN v_tier = 'recruiter_basis' THEN 49.99
    ELSE 0 -- Free for paid tiers
  END;
  
  -- Calculate total cost of selected platforms
  SELECT SUM(base_cost) INTO v_total_cost
  FROM public.job_external_posting_platforms
  WHERE id = ANY(p_platforms);
  
  -- Create campaign record
  INSERT INTO public.multiposting_campaigns (
    job_id,
    recruiter_id,
    status,
    total_cost,
    service_fee,
    currency,
    custom_content,
    selected_platforms
  ) VALUES (
    p_job_id,
    v_recruiter_id,
    'draft',
    v_total_cost,
    v_service_fee,
    'EUR',
    p_custom_content,
    p_platforms
  ) RETURNING id INTO v_campaign_id;
  
  -- Create individual platform postings
  FOR v_platform_record IN (
    SELECT * FROM public.job_external_posting_platforms
    WHERE id = ANY(p_platforms)
  ) LOOP
    INSERT INTO public.job_external_postings (
      job_id,
      platform_id,
      platform_name,
      status,
      campaign_id
    ) VALUES (
      p_job_id,
      v_platform_record.id,
      v_platform_record.name,
      'pending',
      v_campaign_id
    );
  END LOOP;
  
  RETURN v_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to launch multiposting campaign
CREATE OR REPLACE FUNCTION public.launch_multiposting_campaign(
  p_campaign_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_campaign RECORD;
  v_job RECORD;
  v_total_cost NUMERIC(10,2);
  v_posting_count INTEGER;
  v_result JSONB;
BEGIN
  -- Get campaign details and validate ownership
  SELECT mc.*, j.title, j.company_name
  INTO v_campaign
  FROM public.multiposting_campaigns mc
  JOIN public.jobs j ON mc.job_id = j.id
  JOIN public.recruiter_profiles rp ON mc.recruiter_id = rp.id
  JOIN public.users u ON rp.id = u.profile_id
  WHERE mc.id = p_campaign_id AND u.id = v_user_id;
  
  IF v_campaign IS NULL THEN
    RAISE EXCEPTION 'Campaign not found or not owned by user';
  END IF;
  
  -- Get total cost
  v_total_cost := v_campaign.total_cost + v_campaign.service_fee;
  
  -- Update campaign status
  UPDATE public.multiposting_campaigns
  SET 
    status = 'active',
    launched_at = now(),
    end_date = now() + interval '30 days' -- Typical duration
  WHERE id = p_campaign_id;
  
  -- Update job postings status
  UPDATE public.job_external_postings
  SET 
    status = 'active',
    posted_date = now(),
    end_date = now() + interval '30 days'
  WHERE campaign_id = p_campaign_id
  RETURNING COUNT(*) INTO v_posting_count;
  
  -- If this is a paid feature, record the transaction
  -- This would normally integrate with a payment processor
  
  -- Record the multiposting in job analytics
  UPDATE public.jobs
  SET performance_stats = jsonb_set(
    COALESCE(performance_stats, '{}'::jsonb),
    '{multiposting}',
    jsonb_build_object(
      'campaign_id', p_campaign_id,
      'platforms', v_posting_count,
      'launched_at', now(),
      'total_cost', v_total_cost
    )
  )
  WHERE id = v_campaign.job_id;
  
  -- Build result
  v_result := jsonb_build_object(
    'success', TRUE,
    'campaign_id', p_campaign_id,
    'job_id', v_campaign.job_id,
    'job_title', v_campaign.title,
    'platforms', v_posting_count,
    'total_cost', v_total_cost,
    'currency', v_campaign.currency,
    'launched_at', now(),
    'end_date', now() + interval '30 days'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create multiposting_campaigns table if not exists
CREATE TABLE IF NOT EXISTS public.multiposting_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL REFERENCES public.recruiter_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, completed, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  launched_at TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  total_cost NUMERIC(10,2) NOT NULL,
  service_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  custom_content JSONB, -- title, description, etc. customizations
  selected_platforms UUID[], -- IDs of selected platforms
  performance_stats JSONB -- platform-specific analytics
);

-- Enable RLS on multiposting tables
ALTER TABLE public.job_external_posting_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_external_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiposting_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for multiposting
CREATE POLICY "Everyone can read job platforms"
  ON public.job_external_posting_platforms
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Recruiters can see their job external postings"
  ON public.job_external_postings
  FOR SELECT
  TO authenticated
  USING (
    job_id IN (
      SELECT id FROM public.jobs
      WHERE recruiter_id IN (
        SELECT profile_id FROM public.users
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Recruiters can manage their campaigns"
  ON public.multiposting_campaigns
  FOR ALL
  TO authenticated
  USING (
    recruiter_id IN (
      SELECT profile_id FROM public.users
      WHERE id = auth.uid() AND role = 'recruiter'
    )
  );

-- Company Update Functions

-- Function to create company update
CREATE OR REPLACE FUNCTION public.create_company_update(
  p_company_id UUID,
  p_title TEXT,
  p_content TEXT,
  p_image_url TEXT DEFAULT NULL,
  p_published BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_update_id UUID;
BEGIN
  -- Verify user is a recruiter for this company
  IF NOT EXISTS (
    SELECT 1
    FROM public.recruiter_profiles rp
    JOIN public.users u ON rp.id = u.profile_id
    WHERE u.id = v_user_id AND rp.company_id = p_company_id
  ) THEN
    RAISE EXCEPTION 'User is not authorized for this company';
  END IF;
  
  -- Create company update
  INSERT INTO public.company_update_items (
    company_id,
    title,
    content,
    image_url,
    published
  ) VALUES (
    p_company_id,
    p_title,
    p_content,
    p_image_url,
    p_published
  ) RETURNING id INTO v_update_id;
  
  RETURN v_update_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to publish/unpublish company update
CREATE OR REPLACE FUNCTION public.toggle_company_update_status(
  p_update_id UUID,
  p_published BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Verify user is a recruiter for this company
  IF NOT EXISTS (
    SELECT 1
    FROM public.company_update_items cui
    JOIN public.recruiter_profiles rp ON cui.company_id = rp.company_id
    JOIN public.users u ON rp.id = u.profile_id
    WHERE cui.id = p_update_id AND u.id = v_user_id
  ) THEN
    RAISE EXCEPTION 'User is not authorized for this update';
  END IF;
  
  -- Update published status
  UPDATE public.company_update_items
  SET published = p_published
  WHERE id = p_update_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get company updates
CREATE OR REPLACE FUNCTION public.get_company_updates(
  p_company_id UUID,
  p_include_unpublished BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.company_update_items AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_is_company_recruiter BOOLEAN;
BEGIN
  -- Check if user is a recruiter for this company
  SELECT EXISTS (
    SELECT 1
    FROM public.recruiter_profiles rp
    JOIN public.users u ON rp.id = u.profile_id
    WHERE u.id = v_user_id AND rp.company_id = p_company_id
  ) INTO v_is_company_recruiter;
  
  -- Return updates
  RETURN QUERY
  SELECT * FROM public.company_update_items
  WHERE 
    company_id = p_company_id AND
    (published = TRUE OR (p_include_unpublished = TRUE AND v_is_company_recruiter))
  ORDER BY date DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on company updates
ALTER TABLE public.company_update_items ENABLE ROW LEVEL SECURITY;

-- Create policies for company updates
CREATE POLICY "Everyone can see published company updates"
  ON public.company_update_items
  FOR SELECT
  TO authenticated
  USING (published = TRUE);

CREATE POLICY "Recruiters can manage their company updates"
  ON public.company_update_items
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.recruiter_profiles
      WHERE id IN (
        SELECT profile_id FROM public.users
        WHERE id = auth.uid() AND role = 'recruiter'
      )
    )
  );

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  preferences JSONB DEFAULT NULL,
  last_sent_at TIMESTAMPTZ
);

-- Education and Experience Tables

-- Create applicant_educations table if not exists
CREATE TABLE IF NOT EXISTS public.applicant_educations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_profile_id UUID NOT NULL REFERENCES public.applicant_profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  grade TEXT,
  activities TEXT,
  description TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create applicant_experiences table if not exists
CREATE TABLE IF NOT EXISTS public.applicant_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_profile_id UUID NOT NULL REFERENCES public.applicant_profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  skills TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create applicant_certifications table if not exists
CREATE TABLE IF NOT EXISTS public.applicant_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_profile_id UUID NOT NULL REFERENCES public.applicant_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  issue_date DATE,
  expiration_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to add education to applicant profile
CREATE OR REPLACE FUNCTION public.add_applicant_education(
  p_institution TEXT,
  p_degree TEXT,
  p_field_of_study TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_grade TEXT DEFAULT NULL,
  p_activities TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_is_current BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile_id UUID;
  v_education_id UUID;
BEGIN
  -- Get applicant profile ID
  SELECT profile_id INTO v_profile_id
  FROM public.users
  WHERE id = v_user_id AND role = 'applicant';
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User is not an applicant or profile not found';
  END IF;
  
  -- Insert education
  INSERT INTO public.applicant_educations (
    applicant_profile_id,
    institution,
    degree,
    field_of_study,
    start_date,
    end_date,
    grade,
    activities,
    description,
    is_current
  ) VALUES (
    v_profile_id,
    p_institution,
    p_degree,
    p_field_of_study,
    p_start_date,
    p_end_date,
    p_grade,
    p_activities,
    p_description,
    p_is_current
  ) RETURNING id INTO v_education_id;
  
  RETURN v_education_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add experience to applicant profile
-- Fixed parameter order: parameters with defaults must come after those without defaults
CREATE OR REPLACE FUNCTION public.add_applicant_experience(
  p_company TEXT,
  p_position TEXT,
  p_start_date DATE, -- Moved before the optional parameters
  p_location TEXT DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_is_current BOOLEAN DEFAULT FALSE,
  p_description TEXT DEFAULT NULL,
  p_skills TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile_id UUID;
  v_experience_id UUID;
BEGIN
  -- Get applicant profile ID
  SELECT profile_id INTO v_profile_id
  FROM public.users
  WHERE id = v_user_id AND role = 'applicant';
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User is not an applicant or profile not found';
  END IF;
  
  -- Insert experience
  INSERT INTO public.applicant_experiences (
    applicant_profile_id,
    company,
    position,
    location,
    start_date,
    end_date,
    is_current,
    description,
    skills
  ) VALUES (
    v_profile_id,
    p_company,
    p_position,
    p_location,
    p_start_date,
    p_end_date,
    p_is_current,
    p_description,
    p_skills
  ) RETURNING id INTO v_experience_id;
  
  RETURN v_experience_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add certification to applicant profile
CREATE OR REPLACE FUNCTION public.add_applicant_certification(
  p_name TEXT,
  p_organization TEXT,
  p_issue_date DATE DEFAULT NULL,
  p_expiration_date DATE DEFAULT NULL,
  p_credential_id TEXT DEFAULT NULL,
  p_credential_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile_id UUID;
  v_certification_id UUID;
BEGIN
  -- Get applicant profile ID
  SELECT profile_id INTO v_profile_id
  FROM public.users
  WHERE id = v_user_id AND role = 'applicant';
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User is not an applicant or profile not found';
  END IF;
  
  -- Insert certification
  INSERT INTO public.applicant_certifications (
    applicant_profile_id,
    name,
    organization,
    issue_date,
    expiration_date,
    credential_id,
    credential_url
  ) VALUES (
    v_profile_id,
    p_name,
    p_organization,
    p_issue_date,
    p_expiration_date,
    p_credential_id,
    p_credential_url
  ) RETURNING id INTO v_certification_id;
  
  RETURN v_certification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get applicant profile with education, experience and certifications
CREATE OR REPLACE FUNCTION public.get_applicant_full_profile(
  p_profile_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile_id UUID;
  v_result JSONB;
BEGIN
  -- Determine which profile to get
  IF p_profile_id IS NULL THEN
    -- Get own profile
    SELECT profile_id INTO v_profile_id
    FROM public.users
    WHERE id = v_user_id AND role = 'applicant';
  ELSE
    -- Get specified profile
    v_profile_id := p_profile_id;
  END IF;
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  
  -- Get profile data
  WITH profile_data AS (
    SELECT 
      ap.*,
      (SELECT pseudonym FROM public.user_pseudonym_maps WHERE uid = (SELECT id FROM public.users WHERE profile_id = ap.id)) as pseudonym
    FROM public.applicant_profiles ap
    WHERE ap.id = v_profile_id
  ),
  education_data AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'institution', institution,
          'degree', degree,
          'field_of_study', field_of_study,
          'start_date', start_date,
          'end_date', end_date,
          'grade', grade,
          'activities', activities,
          'description', description,
          'is_current', is_current
        )
        ORDER BY 
          is_current DESC,
          COALESCE(end_date, '9999-12-31'::date) DESC,
          COALESCE(start_date, '1900-01-01'::date) DESC
      ) AS education_items
    FROM public.applicant_educations
    WHERE applicant_profile_id = v_profile_id
  ),
  experience_data AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'company', company,
          'position', position,
          'location', location,
          'start_date', start_date,
          'end_date', end_date,
          'is_current', is_current,
          'description', description,
          'skills', skills
        )
        ORDER BY 
          is_current DESC,
          COALESCE(end_date, '9999-12-31'::date) DESC,
          COALESCE(start_date, '1900-01-01'::date) DESC
      ) AS experience_items
    FROM public.applicant_experiences
    WHERE applicant_profile_id = v_profile_id
  ),
  certification_data AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'organization', organization,
          'issue_date', issue_date,
          'expiration_date', expiration_date,
          'credential_id', credential_id,
          'credential_url', credential_url
        )
        ORDER BY 
          COALESCE(issue_date, '1900-01-01'::date) DESC
      ) AS certification_items
    FROM public.applicant_certifications
    WHERE applicant_profile_id = v_profile_id
  ),
  applications_data AS (
    SELECT 
      COUNT(*) AS total_applications,
      COUNT(*) FILTER (WHERE status = 'Offer') AS successful_applications
    FROM public.applications
    WHERE applicant_id = v_profile_id
  )
  SELECT 
    jsonb_build_object(
      'profile', jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'avatar_url', p.avatar_url,
        'summary', p.summary,
        'contact_email', CASE 
          WHEN auth.uid() = (SELECT id FROM public.users WHERE profile_id = v_profile_id) OR
               EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'recruiter')
          THEN p.contact_email
          ELSE NULL
        END,
        'contact_phone', CASE 
          WHEN auth.uid() = (SELECT id FROM public.users WHERE profile_id = v_profile_id) OR
               EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'recruiter')
          THEN p.contact_phone
          ELSE NULL
        END,
        'pseudonym', p.pseudonym,
        'hard_skills', p.hard_skills,
        'soft_skills', p.soft_skills,
        'linkedin_profile_url', p.linkedin_profile_url,
        'xing_profile_url', p.xing_profile_url,
        'visibility', p.visibility,
        'allow_in_talent_pool', p.allow_in_talent_pool
      ),
      'education', COALESCE((SELECT education_items FROM education_data), '[]'::jsonb),
      'experience', COALESCE((SELECT experience_items FROM experience_data), '[]'::jsonb),
      'certifications', COALESCE((SELECT certification_items FROM certification_data), '[]'::jsonb),
      'stats', jsonb_build_object(
        'total_applications', (SELECT total_applications FROM applications_data),
        'successful_applications', (SELECT successful_applications FROM applications_data)
      )
    )
  INTO v_result
  FROM profile_data p;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Communication Templates

-- Function to create communication template
CREATE OR REPLACE FUNCTION public.create_communication_template(
  p_name TEXT,
  p_type TEXT, -- email, message, etc.
  p_body TEXT,
  p_subject TEXT DEFAULT NULL,
  p_trigger_rule TEXT DEFAULT NULL,
  p_timing_detail TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_recruiter_id UUID;
  v_template_id UUID;
BEGIN
  -- Get recruiter profile ID
  SELECT profile_id INTO v_recruiter_id
  FROM public.users
  WHERE id = v_user_id AND role = 'recruiter';
  
  IF v_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'User is not a recruiter or profile not found';
  END IF;
  
  -- Insert template
  INSERT INTO public.communication_templates (
    recruiter_id,
    name,
    type,
    subject,
    body,
    trigger_rule,
    timing_detail
  ) VALUES (
    v_recruiter_id,
    p_name,
    p_type,
    p_subject,
    p_body,
    p_trigger_rule,
    p_timing_detail
  ) RETURNING id INTO v_template_id;
  
  RETURN v_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get communication templates
CREATE OR REPLACE FUNCTION public.get_communication_templates(
  p_type TEXT DEFAULT NULL
)
RETURNS SETOF public.communication_templates AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_recruiter_id UUID;
BEGIN
  -- Get recruiter profile ID
  SELECT profile_id INTO v_recruiter_id
  FROM public.users
  WHERE id = v_user_id AND role = 'recruiter';
  
  IF v_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'User is not a recruiter or profile not found';
  END IF;
  
  -- Return templates
  RETURN QUERY
  SELECT * FROM public.communication_templates
  WHERE 
    recruiter_id = v_recruiter_id AND
    (p_type IS NULL OR type = p_type)
  ORDER BY name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send template-based communication
CREATE OR REPLACE FUNCTION public.send_template_communication(
  p_template_id UUID,
  p_recipient_id UUID,
  p_custom_variables JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_template RECORD;
  v_conversation_id UUID;
  v_message_id UUID;
  v_recipient_type TEXT;
  v_result JSONB;
BEGIN
  -- Get template details
  SELECT * INTO v_template
  FROM public.communication_templates ct
  JOIN public.recruiter_profiles rp ON ct.recruiter_id = rp.id
  JOIN public.users u ON rp.id = u.profile_id
  WHERE ct.id = p_template_id AND u.id = v_user_id;
  
  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Template not found or not owned by user';
  END IF;
  
  -- Get recipient type
  SELECT role INTO v_recipient_type
  FROM public.users
  WHERE id = p_recipient_id;
  
  -- Process template placeholders
  -- In a real implementation, this would replace variables in the template
  -- For simplicity, we'll just append a note
  
  -- Create or get conversation
  SELECT public.create_conversation(
    ARRAY[v_user_id, p_recipient_id]
  ) INTO v_conversation_id;
  
  -- Send message
  SELECT public.send_message(
    v_conversation_id,
    p_recipient_id,
    v_template.body || E'\n\n[Sent via Template: ' || v_template.name || ']'
  ) INTO v_message_id;
  
  -- Build result
  v_result := jsonb_build_object(
    'success', TRUE,
    'template_id', p_template_id,
    'recipient_id', p_recipient_id,
    'message_id', v_message_id,
    'conversation_id', v_conversation_id,
    'sent_at', now()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on applicant profile related tables
ALTER TABLE public.applicant_educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for applicant profile tables
CREATE POLICY "Applicants can manage their own education"
  ON public.applicant_educations
  FOR ALL
  TO authenticated
  USING (
    applicant_profile_id IN (
      SELECT profile_id FROM public.users
      WHERE id = auth.uid() AND role = 'applicant'
    )
  );

CREATE POLICY "Applicants can manage their own experience"
  ON public.applicant_experiences
  FOR ALL
  TO authenticated
  USING (
    applicant_profile_id IN (
      SELECT profile_id FROM public.users
      WHERE id = auth.uid() AND role = 'applicant'
    )
  );

CREATE POLICY "Applicants can manage their own certifications"
  ON public.applicant_certifications
  FOR ALL
  TO authenticated
  USING (
    applicant_profile_id IN (
      SELECT profile_id FROM public.users
      WHERE id = auth.uid() AND role = 'applicant'
    )
  );

CREATE POLICY "Recruiters can see public applicant educations"
  ON public.applicant_educations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'recruiter'
    ) AND
    EXISTS (
      SELECT 1 FROM public.applicant_profiles
      WHERE id = applicant_profile_id AND 
      (visibility = 'public' OR visibility = 'restricted')
    )
  );

CREATE POLICY "Recruiters can see public applicant experiences"
  ON public.applicant_experiences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'recruiter'
    ) AND
    EXISTS (
      SELECT 1 FROM public.applicant_profiles
      WHERE id = applicant_profile_id AND 
      (visibility = 'public' OR visibility = 'restricted')
    )
  );

CREATE POLICY "Recruiters can see public applicant certifications"
  ON public.applicant_certifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'recruiter'
    ) AND
    EXISTS (
      SELECT 1 FROM public.applicant_profiles
      WHERE id = applicant_profile_id AND 
      (visibility = 'public' OR visibility = 'restricted')
    )
  );

CREATE POLICY "Recruiters can manage their own templates"
  ON public.communication_templates
  FOR ALL
  TO authenticated
  USING (
    recruiter_id IN (
      SELECT profile_id FROM public.users
      WHERE id = auth.uid() AND role = 'recruiter'
    )
  );

-- Create views for analytics

-- View for application statistics by job
CREATE OR REPLACE VIEW public.application_stats_by_job AS
SELECT
  j.id AS job_id,
  j.title AS job_title,
  j.company_name,
  COUNT(a.id) AS total_applications,
  COUNT(a.id) FILTER (WHERE a.status = 'Applied') AS new_applications,
  COUNT(a.id) FILTER (WHERE a.status = 'Under Review') AS in_review,
  COUNT(a.id) FILTER (WHERE a.status = 'Interviewing') AS interviewing,
  COUNT(a.id) FILTER (WHERE a.status = 'Offer') AS offers,
  COUNT(a.id) FILTER (WHERE a.status = 'Rejected') AS rejected,
  AVG(a.match_score) AS avg_match_score,
  MIN(a.applied_date) AS first_application,
  MAX(a.applied_date) AS latest_application
FROM
  public.jobs j
LEFT JOIN
  public.applications a ON j.id = a.job_id
GROUP BY
  j.id, j.title, j.company_name;

-- View for applicant success metrics
CREATE OR REPLACE VIEW public.applicant_success_metrics AS
SELECT
  ap.id AS applicant_id,
  ap.name AS applicant_name,
  COUNT(a.id) AS total_applications,
  COUNT(a.id) FILTER (WHERE a.status = 'Offer') AS offers_received,
  COUNT(a.id) FILTER (WHERE a.status = 'Interviewing' OR a.current_phase LIKE '%Interview%') AS interviews,
  AVG(a.match_score) AS avg_match_score,
  CASE 
    WHEN COUNT(a.id) > 0 
    THEN ROUND((COUNT(a.id) FILTER (WHERE a.status = 'Offer')::NUMERIC / COUNT(a.id)) * 100, 2)
    ELSE 0
  END AS success_rate
FROM
  public.applicant_profiles ap
LEFT JOIN
  public.applications a ON ap.id = a.applicant_id
GROUP BY
  ap.id, ap.name;

-- Add RLS policies for applicant profiles (using DO blocks)

-- Check if policy exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applicant_profiles' 
    AND policyname = 'Applicants can manage their own profiles'
  ) THEN
    CREATE POLICY "Applicants can manage their own profiles"
      ON public.applicant_profiles
      FOR ALL
      TO authenticated
      USING (
        id IN (
          SELECT profile_id FROM public.users
          WHERE id = auth.uid() AND role = 'applicant'
        )
      );
  END IF;
END $$;

-- Check if policy exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applicant_profiles' 
    AND policyname = 'Recruiters can see applicant profiles'
  ) THEN
    CREATE POLICY "Recruiters can see applicant profiles"
      ON public.applicant_profiles
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE id = auth.uid() AND role = 'recruiter'
        ) AND
        (visibility = 'public' OR visibility = 'restricted')
      );
  END IF;
END $$;

-- RLS for recruiter profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'recruiter_profiles' 
    AND policyname = 'Recruiters can manage their own profiles'
  ) THEN
    CREATE POLICY "Recruiters can manage their own profiles"
      ON public.recruiter_profiles
      FOR ALL
      TO authenticated
      USING (
        id IN (
          SELECT profile_id FROM public.users
          WHERE id = auth.uid() AND role = 'recruiter'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'recruiter_profiles' 
    AND policyname = 'Everyone can see recruiter profiles'
  ) THEN
    CREATE POLICY "Everyone can see recruiter profiles"
      ON public.recruiter_profiles
      FOR SELECT
      TO authenticated
      USING (TRUE);
  END IF;
END $$;

-- RLS for company profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'company_profiles' 
    AND policyname = 'Everyone can see company profiles'
  ) THEN
    CREATE POLICY "Everyone can see company profiles"
      ON public.company_profiles
      FOR SELECT
      TO authenticated
      USING (TRUE);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'company_profiles' 
    AND policyname = 'Recruiters can manage their company profiles'
  ) THEN
    CREATE POLICY "Recruiters can manage their company profiles"
      ON public.company_profiles
      FOR UPDATE
      TO authenticated
      USING (
        id IN (
          SELECT company_id FROM public.recruiter_profiles
          WHERE id IN (
            SELECT profile_id FROM public.users
            WHERE id = auth.uid() AND role = 'recruiter'
          )
        )
      );
  END IF;
END $$;

-- Create indexes for performance

-- Indexes for applications
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON public.applications(applied_date);

-- Indexes for talent pool
CREATE INDEX IF NOT EXISTS idx_talent_pool_entries_applicant_id ON public.talent_pool_entries(applicant_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_entries_pool_id ON public.talent_pool_entries(pool_id);

-- Indexes for forum
CREATE INDEX IF NOT EXISTS idx_forum_posts_group_id ON public.forum_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_date ON public.forum_posts(created_date);

-- Indexes for chat
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON public.chat_messages(receiver_id);

-- Indexes for job search
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON public.jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON public.jobs(posted_date);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs USING gin(to_tsvector('german', location));
CREATE INDEX IF NOT EXISTS idx_jobs_title ON public.jobs USING gin(to_tsvector('german', title));