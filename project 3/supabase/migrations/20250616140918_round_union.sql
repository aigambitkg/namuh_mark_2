/*
  # Fix user creation function syntax error

  1. Changes
    - Replace JavaScript-style ternary operators with proper PostgreSQL CASE WHEN syntax
    - Fix function to handle new user creation with correct quiz uses and job posting limits

  2. Security
    - Maintains existing security policies 
    - No changes to RLS
*/

-- Function to handle new user creation
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
            NEW.raw_user_meta_data->>'name',
            NULL, -- Default avatar
            'public', -- Default visibility
            true -- Default allow in talent pool
        ) RETURNING id INTO profile_id;
        
        default_tier := 'applicant_starter';
        default_token_balance := 20;
        default_token_allowance := 20;
    ELSE
        INSERT INTO public.recruiter_profiles (
            name,
            avatar_url,
            share_calendar,
            allow_applicant_feedback
        ) VALUES (
            NEW.raw_user_meta_data->>'name',
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
    INSERT INTO user_pseudonym_maps (
        uid,
        pseudonym
    ) VALUES (
        NEW.id,
        'SYNONYM_ID_USER' || floor(random() * 1000)::text
    );
    
    -- Log the creation in audit logs
    INSERT INTO audit_logs (
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

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    profile_id UUID;
BEGIN
    -- Get user info before deleting
    SELECT role, profile_id INTO user_role, profile_id
    FROM public.users
    WHERE id = OLD.id;
    
    -- Delete the appropriate profile based on role
    IF user_role = 'applicant' THEN
        DELETE FROM public.applicant_profiles
        WHERE id = profile_id;
    ELSE
        DELETE FROM public.recruiter_profiles
        WHERE id = profile_id;
    END IF;
    
    -- Delete subscription
    DELETE FROM public.user_subscriptions
    WHERE user_id = OLD.id;
    
    -- Delete from our users table
    DELETE FROM public.users
    WHERE id = OLD.id;
    
    -- Delete pseudonym mapping
    DELETE FROM user_pseudonym_maps
    WHERE uid = OLD.id;
    
    -- Log the deletion in audit logs
    INSERT INTO audit_logs (
        user_id,
        action_type,
        action_details,
        resource_type,
        resource_id,
        status,
        severity
    ) VALUES (
        NULL, -- No user ID since they're deleted
        'user_deleted',
        jsonb_build_object(
            'email', OLD.email
        ),
        'users',
        OLD.id,
        'success',
        'info'
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle auth user creation (bridge to our custom function)
CREATE OR REPLACE FUNCTION public.handle_auth_user_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Call our custom handler
    PERFORM public.handle_new_user();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle auth user deletion (bridge to our custom function)
CREATE OR REPLACE FUNCTION public.handle_auth_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Call our custom handler
    PERFORM public.handle_user_deletion();
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_creation();

-- Create trigger for auth user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
BEFORE DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_deletion();