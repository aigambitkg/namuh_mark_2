/*
  # Token Management Functions

  1. New Functions
     - `process_token_transaction` - Handles token debit and credit operations
     - `refresh_monthly_tokens` - Refreshes token allowances on a monthly basis
     - `purchase_token_package` - Processes token package purchases
     - `get_user_token_history` - Retrieves token transaction history
  
  2. Triggers
     - `on_token_transaction_created` - Updates user's token balance
  
  3. Security
     - RLS policies for token transaction management
*/

-- Function to process token transactions
CREATE OR REPLACE FUNCTION public.process_token_transaction(
  p_user_id UUID,
  p_type TEXT, -- 'debit' or 'credit'
  p_amount INTEGER,
  p_description TEXT,
  p_flow_name TEXT,
  p_related_job_id UUID DEFAULT NULL,
  p_related_purchase_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Validate parameters
  IF p_type NOT IN ('debit', 'credit') THEN
    RAISE EXCEPTION 'Invalid transaction type. Must be "debit" or "credit".';
  END IF;
  
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero.';
  END IF;
  
  -- Get current token balance
  SELECT token_balance INTO v_current_balance
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- For debits, check if sufficient tokens are available
  IF p_type = 'debit' AND v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient token balance.';
  END IF;
  
  -- Calculate new balance
  v_new_balance := CASE 
    WHEN p_type = 'debit' THEN v_current_balance - p_amount
    ELSE v_current_balance + p_amount
  END;
  
  -- Create transaction record
  INSERT INTO public.token_transactions (
    user_id,
    type,
    amount,
    description,
    flow_name,
    related_job_id,
    related_purchase_id
  ) VALUES (
    p_user_id,
    p_type,
    p_amount,
    p_description,
    p_flow_name,
    p_related_job_id,
    p_related_purchase_id
  ) RETURNING id INTO v_transaction_id;
  
  -- Update user's token balance
  UPDATE public.user_subscriptions
  SET token_balance = v_new_balance
  WHERE user_id = p_user_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh monthly token allowance
CREATE OR REPLACE FUNCTION public.refresh_monthly_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_update_count INTEGER := 0;
  v_starter_tokens INTEGER := 2;
  v_professional_tokens INTEGER := 10;
  v_premium_tokens INTEGER := 30;
BEGIN
  -- Update token balances based on subscription tier
  UPDATE public.user_subscriptions
  SET 
    token_balance = CASE 
      WHEN tier_name = 'applicant_starter' THEN v_starter_tokens
      WHEN tier_name = 'applicant_professional' THEN v_professional_tokens
      WHEN tier_name = 'applicant_premium' THEN v_premium_tokens
      ELSE token_balance -- No change for recruiter tiers
    END,
    quiz_uses_remaining = CASE 
      WHEN tier_name = 'applicant_professional' THEN 2
      WHEN tier_name = 'applicant_premium' THEN 999 -- Effectively unlimited
      ELSE 0
    END,
    profile_matcher_searches_remaining = CASE 
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
  
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  
  -- Log refresh event
  INSERT INTO public.ai_interaction_logs (
    flow_name,
    status,
    input,
    output
  ) VALUES (
    'monthly_token_refresh',
    'success',
    jsonb_build_object('date', NOW()),
    jsonb_build_object('refreshed_accounts', v_update_count)
  );
  
  RETURN v_update_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purchase token package
CREATE OR REPLACE FUNCTION public.purchase_token_package(
  p_user_id UUID,
  p_package_size INTEGER,
  p_payment_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_transaction_id UUID;
  v_previous_balance INTEGER;
  v_new_balance INTEGER;
  v_price NUMERIC(10,2);
BEGIN
  -- Validate package size
  IF p_package_size NOT IN (10, 20, 50) THEN
    RAISE EXCEPTION 'Invalid package size. Must be 10, 20, or 50 tokens.';
  END IF;
  
  -- Determine price based on package size
  v_price := CASE
    WHEN p_package_size = 10 THEN 2.99
    WHEN p_package_size = 20 THEN 4.99
    WHEN p_package_size = 50 THEN 9.99
    ELSE 0
  END;
  
  -- Get previous balance
  SELECT token_balance INTO v_previous_balance
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- Process the token credit transaction
  v_transaction_id := public.process_token_transaction(
    p_user_id,
    'credit',
    p_package_size,
    'Token package purchase: ' || p_package_size || ' tokens',
    'token_purchase',
    NULL,
    p_payment_id
  );
  
  -- Get updated balance
  SELECT token_balance INTO v_new_balance
  FROM public.user_subscriptions
  WHERE user_id = p_user_id;
  
  -- Return purchase summary
  RETURN jsonb_build_object(
    'transaction_id', v_transaction_id,
    'package_size', p_package_size,
    'price', v_price,
    'previous_balance', v_previous_balance,
    'new_balance', v_new_balance,
    'payment_id', p_payment_id,
    'purchase_date', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's token history
CREATE OR REPLACE FUNCTION public.get_user_token_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.token_transactions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.token_transactions
  WHERE user_id = p_user_id
  ORDER BY timestamp DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for token transaction logging
CREATE OR REPLACE FUNCTION public.on_token_transaction_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the transaction in AI interaction logs
  INSERT INTO public.ai_interaction_logs (
    flow_name,
    user_id,
    status,
    input,
    output
  ) VALUES (
    'token_transaction_' || NEW.type,
    NEW.user_id,
    'success',
    jsonb_build_object(
      'amount', NEW.amount,
      'description', NEW.description,
      'flow_name', NEW.flow_name
    ),
    jsonb_build_object(
      'transaction_id', NEW.id,
      'timestamp', NEW.timestamp
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create token transaction trigger
CREATE TRIGGER on_token_transaction_created
  AFTER INSERT ON public.token_transactions
  FOR EACH ROW EXECUTE FUNCTION public.on_token_transaction_created();

-- Enable RLS on token transactions table
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own token transactions"
  ON public.token_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());