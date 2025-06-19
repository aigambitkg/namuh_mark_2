/*
  # Talent Pool Functions

  1. New Functions
     - `add_to_talent_pool` - Adds applicant to a talent pool category
     - `remove_from_talent_pool` - Removes applicant from a talent pool category
     - `get_talent_pool` - Retrieves talent pool entries for a recruiter
     - `search_talent_pool` - Searches for talent with specific skills
  
  2. Triggers
     - `on_talent_pool_entry_created` - Logs and processes new talent pool entries
  
  3. Security
     - RLS policies for secure talent pool management
*/

-- Function to add applicant to talent pool
CREATE OR REPLACE FUNCTION public.add_to_talent_pool(
  p_applicant_id UUID,
  p_pool_id UUID,
  p_potential_role TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_entry_id UUID;
  v_profile_summary TEXT;
  v_token_cost INTEGER := 1; -- Cost for professional tier
  v_user_id UUID;
  v_searches_remaining INTEGER;
BEGIN
  -- Get profile summary to store
  SELECT 
    COALESCE(summary, '')
  INTO 
    v_profile_summary
  FROM 
    public.applicant_profiles
  WHERE 
    id = p_applicant_id;
    
  -- Get user ID of recruiter
  SELECT 
    r.id 
  INTO 
    v_user_id
  FROM 
    public.talent_pool_categories tpc
  JOIN 
    public.recruiter_profiles r ON tpc.recruiter_id = r.id
  JOIN 
    public.users u ON r.id = u.profile_id
  WHERE 
    tpc.id = p_pool_id;
    
  -- Check remaining searches
  SELECT 
    profile_matcher_searches_remaining 
  INTO 
    v_searches_remaining
  FROM 
    public.user_subscriptions
  WHERE 
    user_id = v_user_id;
    
  -- Validate remaining searches
  IF v_searches_remaining <= 0 THEN
    RAISE EXCEPTION 'No remaining profile matcher searches. Please upgrade your subscription.';
  END IF;
  
  -- Check if entry already exists
  IF EXISTS (
    SELECT 1 
    FROM public.talent_pool_entries 
    WHERE pool_id = p_pool_id AND applicant_id = p_applicant_id
  ) THEN
    RAISE EXCEPTION 'This applicant is already in this talent pool.';
  END IF;
  
  -- Create talent pool entry
  INSERT INTO public.talent_pool_entries (
    pool_id,
    applicant_id,
    profile_summary_snippet,
    potential_role,
    notes
  ) VALUES (
    p_pool_id,
    p_applicant_id,
    v_profile_summary,
    p_potential_role,
    p_notes
  ) RETURNING id INTO v_entry_id;
  
  -- Deduct a search
  UPDATE public.user_subscriptions
  SET profile_matcher_searches_remaining = profile_matcher_searches_remaining - v_token_cost
  WHERE user_id = v_user_id;
  
  -- Log token transaction
  INSERT INTO public.token_transactions (
    user_id,
    type,
    amount,
    description,
    flow_name
  ) VALUES (
    v_user_id,
    'debit',
    v_token_cost,
    'Added applicant to talent pool',
    'talent_pool_add'
  );

  -- Update talent pool category count
  UPDATE public.talent_pool_categories
  SET member_count = member_count + 1
  WHERE id = p_pool_id;
  
  RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove applicant from talent pool
CREATE OR REPLACE FUNCTION public.remove_from_talent_pool(
  p_entry_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_pool_id UUID;
BEGIN
  -- Get pool id for updating count
  SELECT pool_id INTO v_pool_id
  FROM public.talent_pool_entries
  WHERE id = p_entry_id;
  
  -- Remove the entry
  DELETE FROM public.talent_pool_entries
  WHERE id = p_entry_id;
  
  -- Update talent pool category count if found
  IF v_pool_id IS NOT NULL THEN
    UPDATE public.talent_pool_categories
    SET member_count = GREATEST(0, member_count - 1)
    WHERE id = v_pool_id;
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get talent pool entries for recruiter
CREATE OR REPLACE FUNCTION public.get_talent_pool(
  p_recruiter_id UUID,
  p_pool_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  entry_id UUID,
  applicant_id UUID,
  applicant_name TEXT,
  category_name TEXT,
  category_id UUID,
  profile_summary TEXT,
  potential_role TEXT,
  added_date TIMESTAMPTZ,
  notes TEXT,
  hard_skills TEXT[],
  soft_skills TEXT[],
  avatar_url TEXT,
  match_score NUMERIC(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tpe.id AS entry_id,
    ap.id AS applicant_id,
    ap.name AS applicant_name,
    tpc.name AS category_name,
    tpc.id AS category_id,
    tpe.profile_summary_snippet AS profile_summary,
    tpe.potential_role,
    tpe.added_date,
    tpe.notes,
    ap.hard_skills,
    ap.soft_skills,
    ap.avatar_url,
    -- Generate a pseudo match score for demo
    (random() * 30 + 70)::NUMERIC(5,2) AS match_score
  FROM
    public.talent_pool_entries tpe
  JOIN
    public.talent_pool_categories tpc ON tpe.pool_id = tpc.id
  JOIN
    public.applicant_profiles ap ON tpe.applicant_id = ap.id
  WHERE
    tpc.recruiter_id = p_recruiter_id
    AND (p_pool_id IS NULL OR tpc.id = p_pool_id)
    AND ap.allow_in_talent_pool = TRUE
  ORDER BY
    tpe.added_date DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search talent pool by skills
CREATE OR REPLACE FUNCTION public.search_talent_pool(
  p_recruiter_id UUID,
  p_search_skills TEXT[],
  p_pool_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  applicant_id UUID,
  applicant_name TEXT,
  profile_summary TEXT,
  match_score NUMERIC(5,2),
  hard_skills TEXT[],
  soft_skills TEXT[],
  avatar_url TEXT,
  match_details JSONB
) AS $$
DECLARE
  v_skill_count INTEGER;
  v_user_id UUID;
  v_tier TEXT;
  v_searches_remaining INTEGER;
  v_searches_cost INTEGER := 1;
BEGIN
  -- Get recruiter's user_id and subscription tier
  SELECT
    u.id,
    us.tier_name,
    us.profile_matcher_searches_remaining
  INTO
    v_user_id,
    v_tier,
    v_searches_remaining
  FROM
    public.recruiter_profiles rp
  JOIN
    public.users u ON rp.id = u.profile_id
  JOIN
    public.user_subscriptions us ON u.id = us.user_id
  WHERE
    rp.id = p_recruiter_id;
    
  -- Check remaining searches
  IF v_searches_remaining <= 0 AND v_tier != 'Enterprise' THEN
    RAISE EXCEPTION 'No remaining profile matcher searches. Please upgrade your subscription.';
  END IF;
  
  -- Count search skills
  v_skill_count := array_length(p_search_skills, 1);
  
  -- Perform the search
  RETURN QUERY
  WITH skill_matches AS (
    SELECT
      ap.id AS applicant_id,
      COUNT(DISTINCT s) AS matched_skills
    FROM
      public.applicant_profiles ap,
      unnest(p_search_skills) s
    WHERE
      ap.allow_in_talent_pool = TRUE
      AND (
        EXISTS (
          SELECT 1 FROM unnest(ap.hard_skills) hs
          WHERE LOWER(hs) LIKE '%' || LOWER(s) || '%'
        )
        OR
        EXISTS (
          SELECT 1 FROM unnest(ap.soft_skills) ss
          WHERE LOWER(ss) LIKE '%' || LOWER(s) || '%'
        )
      )
    GROUP BY
      ap.id
  )
  SELECT
    ap.id AS applicant_id,
    ap.name AS applicant_name,
    ap.summary AS profile_summary,
    -- Calculate match score based on skill matches
    ROUND((sm.matched_skills::NUMERIC / GREATEST(v_skill_count, 1) * 100), 2) AS match_score,
    ap.hard_skills,
    ap.soft_skills,
    ap.avatar_url,
    jsonb_build_object(
      'matched_skills', sm.matched_skills,
      'total_skills', v_skill_count,
      'matched_skill_names', (
        SELECT jsonb_agg(s)
        FROM unnest(p_search_skills) s
        WHERE EXISTS (
          SELECT 1 FROM unnest(ap.hard_skills) hs
          WHERE LOWER(hs) LIKE '%' || LOWER(s) || '%'
        )
        OR EXISTS (
          SELECT 1 FROM unnest(ap.soft_skills) ss
          WHERE LOWER(ss) LIKE '%' || LOWER(s) || '%'
        )
      )
    ) AS match_details
  FROM
    skill_matches sm
  JOIN
    public.applicant_profiles ap ON sm.applicant_id = ap.id
  LEFT JOIN
    public.talent_pool_entries tpe ON ap.id = tpe.applicant_id
  LEFT JOIN
    public.talent_pool_categories tpc ON tpe.pool_id = tpc.id AND tpc.recruiter_id = p_recruiter_id
  WHERE
    ap.allow_in_talent_pool = TRUE
    AND (p_pool_id IS NULL OR tpc.id = p_pool_id)
  ORDER BY
    match_score DESC
  LIMIT p_limit;
  
  -- Deduct search if not Enterprise tier
  IF v_tier != 'Enterprise' THEN
    UPDATE public.user_subscriptions
    SET profile_matcher_searches_remaining = profile_matcher_searches_remaining - v_searches_cost
    WHERE user_id = v_user_id;
    
    -- Log token transaction
    INSERT INTO public.token_transactions (
      user_id,
      type,
      amount,
      description,
      flow_name
    ) VALUES (
      v_user_id,
      'debit',
      v_searches_cost,
      'Talent pool search',
      'talent_search'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for talent pool entry creation
CREATE OR REPLACE FUNCTION public.on_talent_pool_entry_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default last communication object
  NEW.last_communication := jsonb_build_object(
    'date', NOW(),
    'messageSnippet', 'Added to talent pool'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_talent_pool_entry_created
  BEFORE INSERT ON public.talent_pool_entries
  FOR EACH ROW EXECUTE FUNCTION public.on_talent_pool_entry_created();

-- Enable RLS on talent pool tables
ALTER TABLE public.talent_pool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pool_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Recruiters can manage their own talent pool categories"
  ON public.talent_pool_categories
  FOR ALL
  TO authenticated
  USING (recruiter_id IN (
    SELECT profile_id 
    FROM public.users 
    WHERE id = auth.uid() AND role = 'recruiter'
  ));

CREATE POLICY "Recruiters can manage their own talent pool entries"
  ON public.talent_pool_entries
  FOR ALL
  TO authenticated
  USING (
    pool_id IN (
      SELECT id 
      FROM public.talent_pool_categories
      WHERE recruiter_id IN (
        SELECT profile_id 
        FROM public.users 
        WHERE id = auth.uid() AND role = 'recruiter'
      )
    )
  );