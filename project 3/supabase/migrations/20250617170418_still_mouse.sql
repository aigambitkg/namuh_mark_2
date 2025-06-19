-- Erweiterung der Datenbankfunktionen für namuH

-- AI Interaction und Token Management
CREATE TABLE IF NOT EXISTS public.ai_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_name TEXT NOT NULL, -- gemini_chat, cv_optimizer, cover_letter_generator, etc.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  input JSONB,
  output JSONB,
  status TEXT DEFAULT 'success', -- success, error, etc.
  metadata JSONB -- additional metadata
);

-- Funktion zum Abziehen von AI-Tokens - mit korrekter Signatur zum Löschen
DO $$
BEGIN
  -- Löschen mit vollständiger Funktionssignatur
  DROP FUNCTION IF EXISTS public.deduct_ai_token(UUID, INT, TEXT);
  DROP FUNCTION IF EXISTS public.deduct_ai_token(UUID, INTEGER, TEXT);
END $$;

CREATE FUNCTION public.deduct_ai_token(
  p_user_id UUID,
  p_token_count INT DEFAULT 1,
  p_flow_name TEXT DEFAULT 'generic_ai_usage'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INT;
  v_updated_balance INT;
BEGIN
  -- Prüfen, ob Benutzer genügend Tokens hat
  SELECT token_balance INTO v_current_balance
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
  AND status = 'active';
  
  IF v_current_balance IS NULL OR v_current_balance < p_token_count THEN
    RETURN FALSE;
  END IF;
  
  -- Tokens abziehen
  v_updated_balance := v_current_balance - p_token_count;
  
  -- Token-Guthaben aktualisieren
  UPDATE public.user_subscriptions
  SET token_balance = v_updated_balance
  WHERE user_id = p_user_id
  AND status = 'active';
  
  -- Transaktion protokollieren
  INSERT INTO public.token_transactions (
    user_id,
    type,
    amount,
    flow_name,
    description
  ) VALUES (
    p_user_id,
    'debit',
    p_token_count,
    p_flow_name,
    'AI feature usage: ' || p_flow_name
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion zum Prüfen der Zugriffsberechtigungen
DO $$
BEGIN
  -- Löschen mit vollständiger Funktionssignatur
  DROP FUNCTION IF EXISTS public.check_subscription_access(UUID, TEXT);
END $$;

CREATE FUNCTION public.check_subscription_access(
  p_user_id UUID,
  p_required_tier TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  user_role TEXT;
  tier_level INT;
  required_level INT;
BEGIN
  -- Benutzerrolle und aktuellen Tarif abrufen
  SELECT u.role, us.tier_name 
  INTO user_role, user_tier
  FROM public.users u
  JOIN public.user_subscriptions us ON u.id = us.user_id
  WHERE u.id = p_user_id
  AND us.status = 'active';
  
  -- Wenn kein Abonnement gefunden wurde
  IF user_tier IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Prüfen, ob die Rollen übereinstimmen (applicant vs. recruiter)
  IF split_part(user_tier, '_', 1) != split_part(p_required_tier, '_', 1) THEN
    RETURN FALSE;
  END IF;
  
  -- Stufen der Tarife bestimmen
  CASE user_tier
    -- Applicant Tarife
    WHEN 'applicant_starter' THEN tier_level := 0;
    WHEN 'applicant_professional' THEN tier_level := 1;
    WHEN 'applicant_premium' THEN tier_level := 2;
    
    -- Recruiter Tarife
    WHEN 'recruiter_basis' THEN tier_level := 0;
    WHEN 'recruiter_starter' THEN tier_level := 1;
    WHEN 'recruiter_professional' THEN tier_level := 2;
    WHEN 'recruiter_enterprise' THEN tier_level := 3;
    
    ELSE tier_level := -1; -- Ungültiger Tarif
  END CASE;
  
  -- Stufe des erforderlichen Tarifs bestimmen
  CASE p_required_tier
    -- Applicant Tarife
    WHEN 'applicant_starter' THEN required_level := 0;
    WHEN 'applicant_professional' THEN required_level := 1;
    WHEN 'applicant_premium' THEN required_level := 2;
    
    -- Recruiter Tarife
    WHEN 'recruiter_basis' THEN required_level := 0;
    WHEN 'recruiter_starter' THEN required_level := 1;
    WHEN 'recruiter_professional' THEN required_level := 2;
    WHEN 'recruiter_enterprise' THEN required_level := 3;
    
    ELSE required_level := 999; -- Unbekannter Tarif
  END CASE;
  
  -- Prüfen, ob der Benutzer Zugriff hat
  RETURN tier_level >= required_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion zum Auffüllen der monatlichen Tokens
DROP FUNCTION IF EXISTS public.refresh_monthly_tokens();
CREATE OR REPLACE FUNCTION public.refresh_monthly_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- Tokens basierend auf Abonnement aktualisieren
  UPDATE public.user_subscriptions
  SET 
    token_balance = CASE
      WHEN tier_name = 'applicant_starter' THEN 20
      WHEN tier_name = 'applicant_professional' THEN 50
      WHEN tier_name = 'applicant_premium' THEN 150
      ELSE token_balance -- Keine Änderung für Recruiter-Tarife
    END,
    quiz_uses_remaining = CASE
      WHEN tier_name = 'applicant_starter' THEN 0
      WHEN tier_name = 'applicant_professional' THEN 2
      WHEN tier_name = 'applicant_premium' THEN 999 -- Praktisch unbegrenzt
      ELSE 0
    END,
    profile_matcher_searches_remaining = CASE
      WHEN tier_name = 'recruiter_basis' THEN 0
      WHEN tier_name = 'recruiter_starter' THEN 0
      WHEN tier_name = 'recruiter_professional' THEN 10
      WHEN tier_name = 'recruiter_enterprise' THEN 40
      ELSE 0
    END,
    last_token_refresh = NOW()
  WHERE 
    status = 'active' AND
    (
      last_token_refresh IS NULL OR
      EXTRACT(MONTH FROM NOW()) != EXTRACT(MONTH FROM last_token_refresh) OR
      EXTRACT(YEAR FROM NOW()) != EXTRACT(YEAR FROM last_token_refresh)
    );
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabelle für die Auffrischungshistorie
CREATE TABLE IF NOT EXISTS public.token_refresh_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refresh_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  refresh_count INT NOT NULL DEFAULT 0
);

-- Trigger für Token-Auffrischung
DROP FUNCTION IF EXISTS public.refresh_tokens_on_midnight();
CREATE OR REPLACE FUNCTION public.refresh_tokens_on_midnight()
RETURNS TRIGGER AS $$
BEGIN
  -- Prüfen, ob es Mitternacht ist
  IF EXTRACT(HOUR FROM NOW()) = 0 AND EXTRACT(MINUTE FROM NOW()) BETWEEN 0 AND 5 THEN
    -- Prüfen, ob das Datum der letzten Auffrischung ein anderer Monat ist
    IF NOT EXISTS (
      SELECT 1
      FROM public.token_refresh_history
      WHERE 
        EXTRACT(MONTH FROM refresh_date) = EXTRACT(MONTH FROM NOW()) AND
        EXTRACT(YEAR FROM refresh_date) = EXTRACT(YEAR FROM NOW())
    ) THEN
      -- Tokens auffrischen
      PERFORM public.refresh_monthly_tokens();
      
      -- Auffrischungsprotokoll erstellen
      INSERT INTO public.token_refresh_history (
        refresh_date,
        refresh_count
      ) VALUES (
        NOW(),
        (
          SELECT COUNT(*)
          FROM public.user_subscriptions
          WHERE status = 'active'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Volltext-Suche für Jobs
DO $$
BEGIN
  DROP FUNCTION IF EXISTS public.search_jobs(TEXT, TEXT, NUMERIC, TEXT[], BOOLEAN, BOOLEAN, INTEGER, INTEGER);
END $$;

CREATE FUNCTION public.search_jobs(
  p_search_text TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_min_salary NUMERIC DEFAULT NULL,
  p_employment_types TEXT[] DEFAULT NULL,
  p_is_remote BOOLEAN DEFAULT NULL,
  p_is_leadership BOOLEAN DEFAULT NULL,
  p_limit_count INT DEFAULT 20,
  p_offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company_name TEXT,
  location TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  currency TEXT,
  posted_date TIMESTAMPTZ,
  employment_type TEXT,
  is_leadership_role BOOLEAN,
  match_score INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.company_name,
    j.location,
    j.salary_min,
    j.salary_max,
    j.currency,
    j.posted_date,
    j.employment_type,
    j.is_leadership_role,
    -- Simulate match score based on query relevance
    CASE 
      WHEN p_search_text IS NULL THEN 80
      WHEN j.title ILIKE '%' || p_search_text || '%' THEN 90
      WHEN j.description ILIKE '%' || p_search_text || '%' THEN 80
      ELSE 75
    END AS match_score
  FROM public.jobs j
  WHERE 
    j.status = 'active'
    AND (p_search_text IS NULL OR 
         j.title ILIKE '%' || p_search_text || '%' OR
         j.description ILIKE '%' || p_search_text || '%' OR
         j.company_name ILIKE '%' || p_search_text || '%')
    AND (p_location IS NULL OR j.location ILIKE '%' || p_location || '%')
    AND (p_min_salary IS NULL OR j.salary_min >= p_min_salary)
    AND (p_employment_types IS NULL OR j.employment_type = ANY(p_employment_types))
    AND (p_is_remote IS NULL OR j.description ILIKE '%remote%' = p_is_remote)
    AND (p_is_leadership IS NULL OR j.is_leadership_role = p_is_leadership)
  ORDER BY 
    CASE 
      WHEN p_search_text IS NULL THEN j.posted_date
      WHEN j.title ILIKE '%' || p_search_text || '%' THEN 0
      WHEN j.description ILIKE '%' || p_search_text || '%' THEN 1
      ELSE 2
    END,
    j.posted_date DESC
  LIMIT p_limit_count
  OFFSET p_offset_count;
  
  -- Log search for analytics
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      user_id,
      action_type,
      action_details,
      resource_type
    ) VALUES (
      auth.uid(),
      'job_search',
      jsonb_build_object(
        'search_text', p_search_text,
        'location', p_location,
        'min_salary', p_min_salary,
        'employment_types', p_employment_types,
        'is_remote', p_is_remote,
        'is_leadership', p_is_leadership
      ),
      'jobs'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies für alle relevanten Tabellen
DO $$
BEGIN
  -- RLS für AI-Interaktionsprotokoll
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_interaction_logs' 
    AND policyname = 'Users can see their own AI interactions'
  ) THEN
    ALTER TABLE public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can see their own AI interactions"
      ON public.ai_interaction_logs
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
  
  -- RLS für AI-Logs erweitern
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ai_interaction_logs' 
    AND policyname = 'Admins can see all AI interactions'
  ) THEN
    CREATE POLICY "Admins can see all AI interactions"
      ON public.ai_interaction_logs
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.users u
          JOIN public.user_roles r ON u.role = r.name
          WHERE 
            u.id = auth.uid() 
            AND r.name = 'admin'
        )
      );
  END IF;
  
  -- RLS für Token-Transaktionen
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'token_transactions' 
    AND policyname = 'Users can view their own token transactions'
  ) THEN
    ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own token transactions"
      ON public.token_transactions
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
  
  -- Zusätzliche RLS-Richtlinien für Stellenausschreibungen
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'jobs' 
    AND policyname = 'Recruiters can manage their own jobs'
  ) THEN
    ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Recruiters can manage their own jobs"
      ON public.jobs
      FOR ALL
      USING (
        recruiter_id IN (
          SELECT profile_id
          FROM public.users
          WHERE id = auth.uid() AND role = 'recruiter'
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'jobs' 
    AND policyname = 'Everyone can view active jobs'
  ) THEN
    CREATE POLICY "Everyone can view active jobs"
      ON public.jobs
      FOR SELECT
      USING (status = 'active');
  END IF;
END
$$;

-- Tabellenreferenzen prüfen und nur hinzufügen, wenn sie nicht existieren
DO $$
BEGIN
  -- Constraint für talent_pool_entries prüfen
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_pool' AND conrelid = 'talent_pool_entries'::regclass
  ) THEN
    ALTER TABLE public.talent_pool_entries
      ADD CONSTRAINT fk_pool FOREIGN KEY (pool_id) REFERENCES talent_pool_categories(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_applicant' AND conrelid = 'talent_pool_entries'::regclass
  ) THEN
    ALTER TABLE public.talent_pool_entries
      ADD CONSTRAINT fk_applicant FOREIGN KEY (applicant_id) REFERENCES applicant_profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Constraint für job_external_postings prüfen
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_job' AND conrelid = 'job_external_postings'::regclass
  ) THEN
    ALTER TABLE public.job_external_postings
      ADD CONSTRAINT fk_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
  END IF;
  
  -- Constraint für token_transactions prüfen
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_job' AND conrelid = 'token_transactions'::regclass
  ) THEN
    ALTER TABLE public.token_transactions
      ADD CONSTRAINT fk_job FOREIGN KEY (related_job_id) REFERENCES jobs(id) ON DELETE SET NULL;
  END IF;
END $$;