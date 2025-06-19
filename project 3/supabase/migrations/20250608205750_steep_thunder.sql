/*
  # Statistics and Analytics Functions

  1. New Functions
     - `get_user_statistics` - Retrieves statistics for applicant or recruiter dashboard
     - `get_recruiter_performance` - Analyzes recruiter performance metrics
     - `get_application_funnel` - Analyzes application conversion funnel
     - `get_token_usage_stats` - Retrieves token usage statistics
  
  2. Security
     - RLS policies for secure analytics access
*/

-- Function to get user statistics for dashboard
CREATE OR REPLACE FUNCTION public.get_user_statistics(
  p_period TEXT DEFAULT 'month' -- 'week', 'month', 'year'
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_role TEXT;
  v_result JSONB;
  v_period_start TIMESTAMP;
  v_period_end TIMESTAMP := NOW();
BEGIN
  -- Get user role
  SELECT role INTO v_user_role
  FROM public.users
  WHERE id = v_user_id;
  
  -- Set period start date
  v_period_start := CASE p_period
    WHEN 'week' THEN NOW() - INTERVAL '1 week'
    WHEN 'month' THEN NOW() - INTERVAL '1 month' 
    WHEN 'year' THEN NOW() - INTERVAL '1 year'
    ELSE NOW() - INTERVAL '1 month' -- Default to month
  END;
  
  -- Generate different statistics based on user role
  IF v_user_role = 'applicant' THEN
    -- Applicant statistics
    WITH application_stats AS (
      SELECT
        COUNT(*) AS total_applications,
        COUNT(*) FILTER (WHERE applied_date BETWEEN v_period_start AND v_period_end) AS recent_applications,
        COUNT(*) FILTER (WHERE status = 'Applied') AS pending_applications,
        COUNT(*) FILTER (WHERE status = 'Under Review') AS in_review_applications,
        COUNT(*) FILTER (WHERE status = 'Interviewing') AS interviewing_applications,
        COUNT(*) FILTER (WHERE status = 'Offer') AS offer_applications,
        COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected_applications,
        AVG(match_score) AS avg_match_score
      FROM 
        public.applications a
      WHERE 
        a.applicant_id IN (
          SELECT profile_id 
          FROM public.users 
          WHERE id = v_user_id
        )
    )
    SELECT
      jsonb_build_object(
        'applications', jsonb_build_object(
          'total', COALESCE((SELECT total_applications FROM application_stats), 0),
          'recent', COALESCE((SELECT recent_applications FROM application_stats), 0),
          'by_status', jsonb_build_object(
            'pending', COALESCE((SELECT pending_applications FROM application_stats), 0),
            'in_review', COALESCE((SELECT in_review_applications FROM application_stats), 0),
            'interviewing', COALESCE((SELECT interviewing_applications FROM application_stats), 0),
            'offer', COALESCE((SELECT offer_applications FROM application_stats), 0),
            'rejected', COALESCE((SELECT rejected_applications FROM application_stats), 0)
          )
        ),
        'performance', jsonb_build_object(
          'avg_match_score', ROUND(COALESCE((SELECT avg_match_score FROM application_stats), 0)),
          'profile_views', (SELECT COUNT(*) FROM public.ai_interaction_logs WHERE flow_name = 'profile_view' AND user_id = v_user_id AND timestamp BETWEEN v_period_start AND v_period_end),
          'token_usage', (
            SELECT COUNT(*) 
            FROM public.token_transactions 
            WHERE user_id = v_user_id AND type = 'debit' AND timestamp BETWEEN v_period_start AND v_period_end
          )
        ),
        'token_balance', (
          SELECT token_balance
          FROM public.user_subscriptions
          WHERE user_id = v_user_id
        ),
        'period', p_period,
        'generated_at', NOW()
      )
    INTO v_result;
    
  ELSIF v_user_role = 'recruiter' THEN
    -- Recruiter statistics
    WITH job_stats AS (
      SELECT
        COUNT(*) AS total_jobs,
        COUNT(*) FILTER (WHERE status = 'active') AS active_jobs,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft_jobs,
        COUNT(*) FILTER (WHERE status = 'archived') AS archived_jobs,
        COUNT(*) FILTER (WHERE posted_date BETWEEN v_period_start AND v_period_end) AS new_jobs
      FROM 
        public.jobs j
      WHERE 
        j.recruiter_id IN (
          SELECT profile_id 
          FROM public.users 
          WHERE id = v_user_id
        )
    ),
    application_stats AS (
      SELECT
        COUNT(*) AS total_applications,
        COUNT(*) FILTER (WHERE a.applied_date BETWEEN v_period_start AND v_period_end) AS new_applications,
        COUNT(*) FILTER (WHERE a.status = 'Applied') AS pending_review,
        AVG(a.match_score) AS avg_match_score
      FROM 
        public.applications a
      JOIN
        public.jobs j ON a.job_id = j.id
      WHERE 
        j.recruiter_id IN (
          SELECT profile_id 
          FROM public.users 
          WHERE id = v_user_id
        )
    ),
    talent_pool_stats AS (
      SELECT
        COUNT(DISTINCT tpe.id) AS talent_pool_size,
        COUNT(DISTINCT tpc.id) AS categories_count
      FROM
        public.talent_pool_categories tpc
      LEFT JOIN
        public.talent_pool_entries tpe ON tpc.id = tpe.pool_id
      WHERE
        tpc.recruiter_id IN (
          SELECT profile_id 
          FROM public.users 
          WHERE id = v_user_id
        )
    )
    SELECT
      jsonb_build_object(
        'jobs', jsonb_build_object(
          'total', COALESCE((SELECT total_jobs FROM job_stats), 0),
          'active', COALESCE((SELECT active_jobs FROM job_stats), 0),
          'draft', COALESCE((SELECT draft_jobs FROM job_stats), 0),
          'archived', COALESCE((SELECT archived_jobs FROM job_stats), 0),
          'new', COALESCE((SELECT new_jobs FROM job_stats), 0)
        ),
        'applications', jsonb_build_object(
          'total', COALESCE((SELECT total_applications FROM application_stats), 0),
          'new', COALESCE((SELECT new_applications FROM application_stats), 0),
          'pending_review', COALESCE((SELECT pending_review FROM application_stats), 0),
          'avg_match_score', ROUND(COALESCE((SELECT avg_match_score FROM application_stats), 0))
        ),
        'talent_pool', jsonb_build_object(
          'size', COALESCE((SELECT talent_pool_size FROM talent_pool_stats), 0),
          'categories', COALESCE((SELECT categories_count FROM talent_pool_stats), 0)
        ),
        'token_balance', (
          SELECT token_balance
          FROM public.user_subscriptions
          WHERE user_id = v_user_id
        ),
        'job_posting_limit', (
          SELECT active_job_posting_limit
          FROM public.user_subscriptions
          WHERE user_id = v_user_id
        ),
        'period', p_period,
        'generated_at', NOW()
      )
    INTO v_result;
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze recruiter performance metrics
CREATE OR REPLACE FUNCTION public.get_recruiter_performance(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_recruiter_id UUID;
  v_result JSONB;
  v_actual_start TIMESTAMP;
  v_actual_end TIMESTAMP := COALESCE(p_end_date, NOW());
BEGIN
  -- Set default start date if not provided (last 90 days)
  v_actual_start := COALESCE(p_start_date, NOW() - INTERVAL '90 days');
  
  -- Get recruiter profile ID
  SELECT profile_id INTO v_recruiter_id
  FROM public.users
  WHERE id = v_user_id AND role = 'recruiter';
  
  IF v_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'User is not a recruiter or not found';
  END IF;
  
  -- Calculate performance metrics
  WITH job_metrics AS (
    SELECT
      j.id AS job_id,
      j.title,
      COALESCE(j.performance_stats->>'impressions', '0')::INTEGER AS impressions,
      COALESCE(j.performance_stats->>'clicks', '0')::INTEGER AS clicks,
      (
        SELECT COUNT(*)
        FROM public.applications a
        WHERE a.job_id = j.id
      ) AS applications,
      (
        SELECT COUNT(*)
        FROM public.applications a
        WHERE 
          a.job_id = j.id AND
          a.status = 'Offer'
      ) AS offers
    FROM
      public.jobs j
    WHERE
      j.recruiter_id = v_recruiter_id AND
      j.posted_date BETWEEN v_actual_start AND v_actual_end
  ),
  aggregate_metrics AS (
    SELECT
      COUNT(DISTINCT job_id) AS total_jobs,
      SUM(impressions) AS total_impressions,
      SUM(clicks) AS total_clicks,
      SUM(applications) AS total_applications,
      SUM(offers) AS total_offers,
      CASE
        WHEN SUM(impressions) > 0 THEN ROUND((SUM(clicks)::NUMERIC / SUM(impressions)) * 100, 2)
        ELSE 0
      END AS click_through_rate,
      CASE
        WHEN SUM(clicks) > 0 THEN ROUND((SUM(applications)::NUMERIC / SUM(clicks)) * 100, 2)
        ELSE 0
      END AS application_rate,
      CASE
        WHEN SUM(applications) > 0 THEN ROUND((SUM(offers)::NUMERIC / SUM(applications)) * 100, 2)
        ELSE 0
      END AS offer_rate
    FROM
      job_metrics
  ),
  time_metrics AS (
    SELECT
      AVG(
        EXTRACT(EPOCH FROM (
          SELECT MIN(last_updated) 
          FROM public.applications a2 
          WHERE 
            a2.job_id = a1.job_id AND 
            (a2.status = 'Offer' OR a2.status = 'Rejected')
        ) - a1.applied_date) / 86400
      ) AS avg_time_to_decision_days
    FROM
      public.applications a1
    JOIN
      public.jobs j ON a1.job_id = j.id
    WHERE
      j.recruiter_id = v_recruiter_id AND
      a1.applied_date BETWEEN v_actual_start AND v_actual_end AND
      EXISTS (
        SELECT 1 
        FROM public.applications a2 
        WHERE 
          a2.job_id = a1.job_id AND 
          (a2.status = 'Offer' OR a2.status = 'Rejected')
      )
  )
  SELECT
    jsonb_build_object(
      'summary', jsonb_build_object(
        'total_jobs', COALESCE((SELECT total_jobs FROM aggregate_metrics), 0),
        'total_impressions', COALESCE((SELECT total_impressions FROM aggregate_metrics), 0),
        'total_clicks', COALESCE((SELECT total_clicks FROM aggregate_metrics), 0),
        'total_applications', COALESCE((SELECT total_applications FROM aggregate_metrics), 0),
        'total_offers', COALESCE((SELECT total_offers FROM aggregate_metrics), 0)
      ),
      'rates', jsonb_build_object(
        'click_through_rate', COALESCE((SELECT click_through_rate FROM aggregate_metrics), 0),
        'application_rate', COALESCE((SELECT application_rate FROM aggregate_metrics), 0),
        'offer_rate', COALESCE((SELECT offer_rate FROM aggregate_metrics), 0)
      ),
      'timing', jsonb_build_object(
        'avg_time_to_decision_days', ROUND(COALESCE((SELECT avg_time_to_decision_days FROM time_metrics), 0), 1)
      ),
      'period', jsonb_build_object(
        'start_date', v_actual_start,
        'end_date', v_actual_end
      ),
      'generated_at', NOW()
    )
  INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze application conversion funnel
CREATE OR REPLACE FUNCTION public.get_application_funnel(
  p_job_id UUID DEFAULT NULL,
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_recruiter_id UUID;
  v_result JSONB;
  v_actual_start TIMESTAMP;
  v_actual_end TIMESTAMP := COALESCE(p_end_date, NOW());
  v_job_filter TEXT;
BEGIN
  -- Set default start date if not provided (last 30 days)
  v_actual_start := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
  
  -- Get recruiter profile ID
  SELECT profile_id INTO v_recruiter_id
  FROM public.users
  WHERE id = v_user_id AND role = 'recruiter';
  
  IF v_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'User is not a recruiter or not found';
  END IF;
  
  -- Set job filter condition
  IF p_job_id IS NOT NULL THEN
    v_job_filter := 'j.id = ' || quote_literal(p_job_id);
  ELSE
    v_job_filter := 'j.recruiter_id = ' || quote_literal(v_recruiter_id);
  END IF;
  
  -- Build and execute the dynamic query
  EXECUTE '
    WITH funnel_data AS (
      SELECT
        j.id AS job_id,
        j.title AS job_title,
        COALESCE(j.performance_stats->>''impressions'', ''0'')::INTEGER AS views,
        COALESCE(j.performance_stats->>''clicks'', ''0'')::INTEGER AS clicks,
        (
          SELECT COUNT(*)
          FROM public.applications a
          WHERE 
            a.job_id = j.id AND
            a.applied_date BETWEEN $1 AND $2
        ) AS applications,
        (
          SELECT COUNT(*)
          FROM public.applications a
          WHERE 
            a.job_id = j.id AND
            a.status = ''Under Review'' AND
            a.applied_date BETWEEN $1 AND $2
        ) AS reviews,
        (
          SELECT COUNT(*)
          FROM public.applications a
          WHERE 
            a.job_id = j.id AND
            a.current_phase LIKE ''%Interview%'' AND
            a.applied_date BETWEEN $1 AND $2
        ) AS interviews,
        (
          SELECT COUNT(*)
          FROM public.applications a
          WHERE 
            a.job_id = j.id AND
            a.status = ''Offer'' AND
            a.applied_date BETWEEN $1 AND $2
        ) AS offers
      FROM
        public.jobs j
      WHERE
        ' || v_job_filter || '
    ),
    aggregate_data AS (
      SELECT
        SUM(views) AS total_views,
        SUM(clicks) AS total_clicks,
        SUM(applications) AS total_applications,
        SUM(reviews) AS total_reviews,
        SUM(interviews) AS total_interviews,
        SUM(offers) AS total_offers
      FROM
        funnel_data
    ),
    conversion_rates AS (
      SELECT
        CASE WHEN total_views > 0 THEN ROUND((total_clicks::NUMERIC / total_views) * 100, 2) ELSE 0 END AS view_to_click,
        CASE WHEN total_clicks > 0 THEN ROUND((total_applications::NUMERIC / total_clicks) * 100, 2) ELSE 0 END AS click_to_application,
        CASE WHEN total_applications > 0 THEN ROUND((total_reviews::NUMERIC / total_applications) * 100, 2) ELSE 0 END AS application_to_review,
        CASE WHEN total_reviews > 0 THEN ROUND((total_interviews::NUMERIC / total_reviews) * 100, 2) ELSE 0 END AS review_to_interview,
        CASE WHEN total_interviews > 0 THEN ROUND((total_offers::NUMERIC / total_interviews) * 100, 2) ELSE 0 END AS interview_to_offer,
        CASE WHEN total_views > 0 THEN ROUND((total_offers::NUMERIC / total_views) * 100, 2) ELSE 0 END AS overall_conversion
      FROM
        aggregate_data
    )
    SELECT
      jsonb_build_object(
        ''funnel_stages'', jsonb_build_object(
          ''views'', COALESCE((SELECT total_views FROM aggregate_data), 0),
          ''clicks'', COALESCE((SELECT total_clicks FROM aggregate_data), 0),
          ''applications'', COALESCE((SELECT total_applications FROM aggregate_data), 0),
          ''reviews'', COALESCE((SELECT total_reviews FROM aggregate_data), 0),
          ''interviews'', COALESCE((SELECT total_interviews FROM aggregate_data), 0),
          ''offers'', COALESCE((SELECT total_offers FROM aggregate_data), 0)
        ),
        ''conversion_rates'', jsonb_build_object(
          ''view_to_click'', COALESCE((SELECT view_to_click FROM conversion_rates), 0),
          ''click_to_application'', COALESCE((SELECT click_to_application FROM conversion_rates), 0),
          ''application_to_review'', COALESCE((SELECT application_to_review FROM conversion_rates), 0),
          ''review_to_interview'', COALESCE((SELECT review_to_interview FROM conversion_rates), 0),
          ''interview_to_offer'', COALESCE((SELECT interview_to_offer FROM conversion_rates), 0),
          ''overall_conversion'', COALESCE((SELECT overall_conversion FROM conversion_rates), 0)
        ),
        ''period'', jsonb_build_object(
          ''start_date'', $1,
          ''end_date'', $2
        ),
        ''job_id'', $3,
        ''generated_at'', NOW()
      )
  ' INTO v_result USING v_actual_start, v_actual_end, p_job_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get token usage statistics
CREATE OR REPLACE FUNCTION public.get_token_usage_stats(
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSONB;
  v_actual_start TIMESTAMP;
  v_actual_end TIMESTAMP := COALESCE(p_end_date, NOW());
BEGIN
  -- Set default start date if not provided (last 30 days)
  v_actual_start := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
  
  -- Get token usage statistics
  WITH token_stats AS (
    SELECT
      flow_name,
      COUNT(*) AS usage_count,
      SUM(amount) AS tokens_used
    FROM
      public.token_transactions
    WHERE
      user_id = v_user_id AND
      type = 'debit' AND
      timestamp BETWEEN v_actual_start AND v_actual_end
    GROUP BY
      flow_name
  ),
  summary_stats AS (
    SELECT
      SUM(tokens_used) AS total_used,
      COUNT(DISTINCT DATE(timestamp)) AS active_days
    FROM
      public.token_transactions
    WHERE
      user_id = v_user_id AND
      type = 'debit' AND
      timestamp BETWEEN v_actual_start AND v_actual_end
  ),
  subscription_info AS (
    SELECT
      token_balance,
      monthly_token_allowance
    FROM
      public.user_subscriptions
    WHERE
      user_id = v_user_id
  )
  SELECT
    jsonb_build_object(
      'total_tokens_used', COALESCE((SELECT total_used FROM summary_stats), 0),
      'current_balance', COALESCE((SELECT token_balance FROM subscription_info), 0),
      'monthly_allowance', COALESCE((SELECT monthly_token_allowance FROM subscription_info), 0),
      'active_days', COALESCE((SELECT active_days FROM summary_stats), 0),
      'usage_by_feature', (
        SELECT jsonb_object_agg(
          flow_name, 
          jsonb_build_object(
            'count', usage_count,
            'tokens', tokens_used
          )
        )
        FROM token_stats
      ),
      'period', jsonb_build_object(
        'start_date', v_actual_start,
        'end_date', v_actual_end
      ),
      'generated_at', NOW()
    )
  INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on analytics-related tables
ALTER TABLE public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can see their own AI interaction logs"
  ON public.ai_interaction_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());