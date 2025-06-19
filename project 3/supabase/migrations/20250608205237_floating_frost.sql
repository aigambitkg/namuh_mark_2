/*
  # Authentication and User Management Functions

  1. New Functions
     - `handle_new_user` - Creates user profile on signup
     - `handle_user_deletion` - Cleans up user data on account deletion
     - `generate_user_pseudonym` - Creates anonymous identifiers for users
  
  2. Triggers
     - `on_auth_user_created` - Trigger for new user signup
     - `on_auth_user_deleted` - Trigger for user deletion
  
  3. Security
     - RLS policies added for secure data access
*/

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_profile_id UUID;
BEGIN
  -- Create appropriate profile based on user's role
  IF NEW.raw_user_meta_data->>'role' = 'applicant' THEN
    -- Create applicant profile
    INSERT INTO public.applicant_profiles (
      name, 
      contact_email, 
      visibility
    ) VALUES (
      NEW.raw_user_meta_data->>'name', 
      NEW.email, 
      'public'
    )
    RETURNING id INTO new_profile_id;
  ELSIF NEW.raw_user_meta_data->>'role' = 'recruiter' THEN
    -- Create recruiter profile
    INSERT INTO public.recruiter_profiles (
      name, 
      company_name
    ) VALUES (
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'company' -- Could be null initially
    )
    RETURNING id INTO new_profile_id;
  END IF;

  -- Create initial subscription for free tier
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    tier_name,
    status,
    token_balance,
    monthly_token_allowance,
    quiz_uses_remaining,
    active_job_posting_limit,
    profile_matcher_searches_remaining
  ) VALUES (
    NEW.id,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'applicant' THEN 'applicant_starter'
      ELSE 'recruiter_basis'
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'applicant' THEN 'Starter'
      ELSE 'Basis'
    END,
    'active',
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'applicant' THEN 2
      ELSE 0
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'applicant' THEN 2
      ELSE 0
    END,
    0,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'applicant' THEN 0
      ELSE 2
    END,
    0
  );

  -- Create user record in our users table
  INSERT INTO public.users (
    id,
    email,
    role,
    profile_id
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'role',
    new_profile_id
  );

  -- Generate pseudonym for the user
  INSERT INTO public.user_pseudonym_maps (
    uid,
    pseudonym
  ) 
  SELECT 
    NEW.id,
    'SYNONYM_ID_' || substr(md5(random()::text), 1, 8)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_pseudonym_maps WHERE uid = NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up related records
  DELETE FROM public.users WHERE id = OLD.id;
  
  -- Note: The foreign key cascades should handle most of the deletions
  -- But we can add specific cleanup here if needed

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate anonymous pseudonym for users
CREATE OR REPLACE FUNCTION public.generate_user_pseudonym(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  existing_pseudonym TEXT;
  new_pseudonym TEXT;
BEGIN
  -- Check if user already has a pseudonym
  SELECT pseudonym INTO existing_pseudonym 
  FROM public.user_pseudonym_maps
  WHERE uid = user_id;
  
  IF existing_pseudonym IS NOT NULL THEN
    RETURN existing_pseudonym;
  END IF;
  
  -- Generate new pseudonym
  new_pseudonym := 'SYNONYM_ID_' || substr(md5(random()::text), 1, 8);
  
  -- Save it
  INSERT INTO public.user_pseudonym_maps (uid, pseudonym)
  VALUES (user_id, new_pseudonym);
  
  RETURN new_pseudonym;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for user deletion
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Enable RLS on all user-related tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pseudonym_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Create policies for user_pseudonym_maps table
CREATE POLICY "Users can read own pseudonym" 
  ON public.user_pseudonym_maps 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = uid);

-- Create policies for user_subscriptions table  
CREATE POLICY "Users can read own subscription" 
  ON public.user_subscriptions 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);