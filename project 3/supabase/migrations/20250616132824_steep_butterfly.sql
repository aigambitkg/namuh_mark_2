/*
  # Subscription Access Control Functions
  
  1. New Functions
    - check_subscription_access: Checks if a user has access to features based on their subscription tier
    - get_user_subscription_tier: Gets the current subscription tier for a user
    - is_feature_available_for_tier: Checks if a specific feature is available for a subscription tier
    
  2. Security
    - All functions are security definer to enforce consistent access control
*/

-- Function to get a user's current subscription tier
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    tier TEXT;
BEGIN
    SELECT tier_name INTO tier
    FROM user_subscriptions
    WHERE user_id = get_user_subscription_tier.user_id
    AND status = 'active';
    
    RETURN tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a feature is available for a subscription tier
CREATE OR REPLACE FUNCTION public.is_feature_available_for_tier(
    feature_name TEXT,
    tier_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    tier_level INT;
    required_level INT;
BEGIN
    -- Get the tier level
    CASE tier_name
        -- Applicant tiers
        WHEN 'applicant_starter' THEN tier_level := 0;
        WHEN 'applicant_professional' THEN tier_level := 1;
        WHEN 'applicant_premium' THEN tier_level := 2;
        
        -- Recruiter tiers
        WHEN 'recruiter_basis' THEN tier_level := 0;
        WHEN 'recruiter_starter' THEN tier_level := 1;
        WHEN 'recruiter_professional' THEN tier_level := 2;
        WHEN 'recruiter_enterprise' THEN tier_level := 3;
        
        ELSE tier_level := -1; -- Invalid tier
    END CASE;
    
    -- Get the required level for the feature
    CASE feature_name
        -- Applicant features
        WHEN 'quiz_me' THEN required_level := 1; -- Professional+
        WHEN 'cv_visual_creator' THEN required_level := 2; -- Premium only
        WHEN 'unlimited_applications_history' THEN required_level := 1; -- Professional+
        
        -- Recruiter features
        WHEN 'talent_pool' THEN required_level := 2; -- Professional+
        WHEN 'analytics' THEN required_level := 1; -- Starter+
        WHEN 'api_access' THEN required_level := 3; -- Enterprise only
        WHEN 'team_members' THEN 
            -- Different limits per tier, but access starts at Starter
            required_level := 1;
        
        -- Common features
        WHEN 'community_posting' THEN required_level := 0; -- All tiers
        
        ELSE required_level := 999; -- Feature not found
    END CASE;
    
    -- Check if the user's tier level is sufficient
    RETURN tier_level >= required_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has access to a specific feature
CREATE OR REPLACE FUNCTION public.check_subscription_access(
    user_id UUID,
    feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier TEXT;
BEGIN
    -- Get the user's subscription tier
    user_tier := public.get_user_subscription_tier(user_id);
    
    -- If no valid subscription found
    IF user_tier IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if the feature is available for the user's tier
    RETURN public.is_feature_available_for_tier(feature_name, user_tier);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct tokens based on subscription
CREATE OR REPLACE FUNCTION public.deduct_ai_token(
    user_id UUID,
    token_count INT DEFAULT 1,
    flow_name TEXT DEFAULT 'generic_ai_usage'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INT;
    updated_balance INT;
BEGIN
    -- Get current token balance
    SELECT token_balance INTO current_balance
    FROM user_subscriptions
    WHERE user_id = deduct_ai_token.user_id
    AND status = 'active';
    
    -- Check if user has enough tokens
    IF current_balance < token_count THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct tokens
    updated_balance := current_balance - token_count;
    
    -- Update token balance
    UPDATE user_subscriptions
    SET token_balance = updated_balance
    WHERE user_id = deduct_ai_token.user_id
    AND status = 'active';
    
    -- Log the transaction
    INSERT INTO token_transactions (
        user_id,
        type,
        amount,
        flow_name,
        description
    ) VALUES (
        deduct_ai_token.user_id,
        'usage',
        -token_count,
        flow_name,
        'AI feature usage: ' || flow_name
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;