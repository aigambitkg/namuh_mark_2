/*
  # AI Feature Functions

  1. New Functions
     - `log_ai_interaction` - Logs AI feature usage with input/output
     - `deduct_ai_token` - Handles token deduction for AI features
     - `generate_cover_letter` - Function stub for cover letter generation
     - `calculate_cv_match` - Function stub for CV matching with job
     - `generate_job_ai_suggestions` - Function stub for job posting enhancements
  
  2. Security
     - RLS policies for AI interaction logs
*/

-- Function to log AI feature usage
CREATE OR REPLACE FUNCTION public.log_ai_interaction(
  p_flow_name TEXT,
  p_input JSONB,
  p_output JSONB
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  INSERT INTO public.ai_interaction_logs (
    flow_name,
    user_id,
    input,
    output,
    status
  ) VALUES (
    p_flow_name,
    v_user_id,
    p_input,
    p_output,
    'success'
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle token deduction for AI features
CREATE OR REPLACE FUNCTION public.deduct_ai_token(
  p_flow_name TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_token_balance INTEGER;
  v_token_cost INTEGER := 1; -- Default cost is 1 token per use
BEGIN
  -- Get current token balance
  SELECT token_balance INTO v_token_balance
  FROM public.user_subscriptions
  WHERE user_id = v_user_id;
  
  -- Check if sufficient balance
  IF v_token_balance < v_token_cost THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct token
  UPDATE public.user_subscriptions
  SET token_balance = token_balance - v_token_cost
  WHERE user_id = v_user_id;
  
  -- Log transaction
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
    COALESCE(p_description, 'AI feature usage: ' || p_flow_name),
    p_flow_name
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function stub for cover letter generation
-- In a real implementation, this would call an AI service
CREATE OR REPLACE FUNCTION public.generate_cover_letter(
  p_job_id UUID,
  p_applicant_id UUID,
  p_customization_prompts TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_job RECORD;
  v_applicant RECORD;
  v_token_deducted BOOLEAN;
  v_result JSONB;
BEGIN
  -- Deduct token
  SELECT public.deduct_ai_token(
    'cover_letter_generation',
    'Generated cover letter for job application'
  ) INTO v_token_deducted;
  
  IF NOT v_token_deducted THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Insufficient token balance'
    );
  END IF;
  
  -- Get job details
  SELECT title, company_name, description
  INTO v_job
  FROM public.jobs
  WHERE id = p_job_id;
  
  -- Get applicant details
  SELECT name, summary
  INTO v_applicant
  FROM public.applicant_profiles
  WHERE id = p_applicant_id;
  
  -- In a real implementation, would call OpenAI or other AI service
  -- For demo, return a mockup result
  v_result := jsonb_build_object(
    'success', TRUE,
    'cover_letter', 'Sehr geehrte Damen und Herren,\n\n' ||
                    'mit großem Interesse bewerbe ich mich auf die ausgeschriebene Position als ' || 
                    v_job.title || ' bei ' || v_job.company_name || '.\n\n' ||
                    'Mein Name ist ' || v_applicant.name || ' und ich verfüge über umfangreiche Erfahrung in diesem Bereich. ' ||
                    COALESCE(v_applicant.summary, 'Meine Fähigkeiten und Erfahrungen passen hervorragend zu den Anforderungen dieser Position.') || '\n\n' ||
                    'Ich freue mich auf die Möglichkeit, meine Qualifikationen in einem persönlichen Gespräch näher zu erläutern.\n\n' ||
                    'Mit freundlichen Grüßen,\n' ||
                    v_applicant.name,
    'token_used', TRUE
  );
  
  -- Log the interaction
  PERFORM public.log_ai_interaction(
    'cover_letter_generation',
    jsonb_build_object(
      'job_id', p_job_id,
      'job_title', v_job.title,
      'customization', p_customization_prompts
    ),
    v_result
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function stub for CV matching with job posting
CREATE OR REPLACE FUNCTION public.calculate_cv_match(
  p_job_id UUID,
  p_cv_text TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_job RECORD;
  v_token_deducted BOOLEAN;
  v_result JSONB;
  v_match_score NUMERIC(5,2);
  v_strengths TEXT[];
  v_gaps TEXT[];
BEGIN
  -- Deduct token
  SELECT public.deduct_ai_token(
    'cv_job_matching',
    'Analyzed CV match against job posting'
  ) INTO v_token_deducted;
  
  IF NOT v_token_deducted THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Insufficient token balance'
    );
  END IF;
  
  -- Get job details
  SELECT title, company_name, qualifications, responsibilities
  INTO v_job
  FROM public.jobs
  WHERE id = p_job_id;
  
  -- In a real implementation, would use AI to analyze the CV against job
  -- For demo, generate a mockup result with random score
  v_match_score := 50 + (random() * 50);
  
  -- Generate mock strengths and gaps
  IF v_match_score > 80 THEN
    v_strengths := ARRAY['Relevant technical skills', 'Matching experience level', 'Industry knowledge'];
    v_gaps := ARRAY['Consider highlighting leadership experience'];
  ELSIF v_match_score > 65 THEN
    v_strengths := ARRAY['Good technical foundation', 'Some relevant experience'];
    v_gaps := ARRAY['More experience with specific technologies needed', 'Leadership experience recommended'];
  ELSE
    v_strengths := ARRAY['Basic qualifications present'];
    v_gaps := ARRAY['Technical skill gap', 'Experience level below requirements', 'Different industry background'];
  END IF;
  
  -- Build result
  v_result := jsonb_build_object(
    'success', TRUE,
    'match_score', v_match_score,
    'job_title', v_job.title,
    'company_name', v_job.company_name,
    'strengths', v_strengths,
    'gaps', v_gaps,
    'token_used', TRUE,
    'improvement_suggestions', ARRAY['Focus your summary on relevant experience', 
                                  'Highlight skills that match job requirements',
                                  'Quantify your achievements with metrics']
  );
  
  -- Log the interaction
  PERFORM public.log_ai_interaction(
    'cv_job_matching',
    jsonb_build_object(
      'job_id', p_job_id,
      'job_title', v_job.title,
      'cv_length', length(p_cv_text)
    ),
    v_result
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function stub for job posting AI suggestions
CREATE OR REPLACE FUNCTION public.generate_job_ai_suggestions(
  p_job_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_job RECORD;
  v_token_deducted BOOLEAN;
  v_result JSONB;
  v_user_id UUID := auth.uid();
BEGIN
  -- Deduct token
  SELECT public.deduct_ai_token(
    'job_posting_suggestions',
    'Generated AI suggestions for job posting improvement'
  ) INTO v_token_deducted;
  
  IF NOT v_token_deducted THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Insufficient token balance'
    );
  END IF;
  
  -- Get job details
  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id;
  
  -- In a real implementation, would use AI to analyze and suggest improvements
  -- For demo, generate mockup suggestions
  v_result := jsonb_build_object(
    'success', TRUE,
    'title_suggestions', ARRAY[
      'Consider adding technologies to the title for better search visibility',
      'Avoid abbreviations in the title for better clarity'
    ],
    'description_improvements', ARRAY[
      'Add more details about day-to-day responsibilities',
      'Include information about the team structure',
      'Mention specific projects the candidate would work on'
    ],
    'benefits_suggestions', ARRAY[
      'Remote work options are highly valued by candidates',
      'Mention professional development opportunities',
      'Include details about company culture'
    ],
    'diversity_suggestions', ARRAY[
      'Include a diversity and inclusion statement',
      'Use inclusive language throughout the posting',
      'Emphasize your commitment to equal opportunity'
    ],
    'token_used', TRUE
  );
  
  -- Log the interaction
  PERFORM public.log_ai_interaction(
    'job_posting_suggestions',
    jsonb_build_object(
      'job_id', p_job_id,
      'job_title', v_job.title
    ),
    v_result
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on AI logs
ALTER TABLE public.ai_interaction_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can see their own AI interactions"
  ON public.ai_interaction_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());