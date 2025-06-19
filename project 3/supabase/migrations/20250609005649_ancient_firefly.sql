-- Enhanced Access Controls and Audit Logging for namuH

-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- login, logout, data_access, data_modification, permission_change, etc.
  action_details JSONB NOT NULL, -- structured details about the action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resource_type TEXT, -- users, jobs, applications, etc.
  resource_id UUID, -- ID of the affected resource
  status TEXT NOT NULL DEFAULT 'success', -- success, failure, warning
  severity TEXT DEFAULT 'info' -- info, warning, error, critical
);

-- 2. Create User Roles and Permissions Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb, -- structured permissions data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default roles if they don't exist
INSERT INTO public.user_roles (name, description, permissions)
VALUES
  ('applicant', 'Job seeker looking for opportunities', jsonb_build_object(
    'can_apply_jobs', true,
    'can_view_community', true,
    'can_create_profile', true,
    'can_use_ai_tools', true
  )),
  ('recruiter', 'Hiring manager looking for candidates', jsonb_build_object(
    'can_create_jobs', true,
    'can_view_applications', true,
    'can_create_company_profile', true,
    'can_manage_talent_pool', true,
    'can_contact_applicants', true,
    'can_use_multiposting', true
  )),
  ('admin', 'System administrator with full access', jsonb_build_object(
    'can_manage_users', true,
    'can_view_audit_logs', true,
    'can_manage_roles', true,
    'can_manage_all_content', true,
    'can_access_analytics', true
  ))
ON CONFLICT (name) DO NOTHING;

-- 3. Audit Logging Function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action_type TEXT,
  p_action_details JSONB,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_audit_id UUID;
  v_ip_address TEXT;
  v_user_agent TEXT;
BEGIN
  -- Get request metadata (in real implementation)
  BEGIN
    v_ip_address := split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1);
    v_user_agent := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ip_address := NULL;
    v_user_agent := NULL;
  END;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    action_details,
    ip_address,
    user_agent,
    resource_type,
    resource_id,
    status,
    severity
  ) VALUES (
    v_user_id,
    p_action_type,
    p_action_details,
    v_ip_address,
    v_user_agent,
    p_resource_type,
    p_resource_id,
    p_status,
    p_severity
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enhanced Authentication Triggers
CREATE OR REPLACE FUNCTION public.handle_auth_user_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_action_type TEXT;
  v_action_details JSONB;
BEGIN
  -- Determine action type and details based on operation
  IF TG_OP = 'INSERT' THEN
    v_action_type := 'user_signup';
    v_action_details := jsonb_build_object(
      'email', NEW.email,
      'created_at', NEW.created_at,
      'signup_method', COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if this is a login update (last_sign_in_at changed)
    IF OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
      v_action_type := 'user_login';
      v_action_details := jsonb_build_object(
        'email', NEW.email,
        'sign_in_at', NEW.last_sign_in_at,
        'login_method', COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
      );
    -- Check for email change
    ELSIF OLD.email IS DISTINCT FROM NEW.email THEN
      v_action_type := 'user_email_changed';
      v_action_details := jsonb_build_object(
        'old_email', OLD.email,
        'new_email', NEW.email
      );
    -- Other account updates
    ELSE
      v_action_type := 'user_updated';
      v_action_details := jsonb_build_object(
        'email', NEW.email,
        'updated_fields', (
          SELECT jsonb_object_agg(key, value)
          FROM jsonb_each(row_to_json(NEW)::jsonb)
          WHERE key != 'encrypted_password'
            AND key != 'raw_user_meta_data'
            AND key != 'raw_app_meta_data'
            AND (row_to_json(OLD)::jsonb ->> key) IS DISTINCT FROM value
        )
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_action_type := 'user_deleted';
    v_action_details := jsonb_build_object(
      'email', OLD.email,
      'created_at', OLD.created_at,
      'deleted_at', now()
    );
  END IF;

  -- Log the action if we have a valid action type
  IF v_action_type IS NOT NULL THEN
    PERFORM public.log_audit_event(
      v_action_type,
      v_action_details,
      'users',
      CASE TG_OP
        WHEN 'DELETE' THEN OLD.id
        ELSE NEW.id
      END
    );
  END IF;

  -- For INSERT or UPDATE operations, return the NEW record
  -- For DELETE operations, return the OLD record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for auth user events if they don't exist already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_activity'
  ) THEN
    CREATE TRIGGER on_auth_user_activity
      AFTER INSERT OR UPDATE OR DELETE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_activity();
  END IF;
END $$;

-- 5. Functions to check user permissions

CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_role TEXT;
  v_permissions JSONB;
  v_has_permission BOOLEAN;
BEGIN
  -- Get user's role
  SELECT role INTO v_role
  FROM public.users
  WHERE id = v_user_id;

  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get role permissions
  SELECT permissions INTO v_permissions
  FROM public.user_roles
  WHERE name = v_role;

  -- Check if permission exists
  v_has_permission := COALESCE(v_permissions->>p_permission, 'false')::boolean;

  -- Log permission check (optional)
  PERFORM public.log_audit_event(
    'permission_check',
    jsonb_build_object(
      'permission', p_permission,
      'role', v_role,
      'result', v_has_permission
    ),
    'permissions',
    NULL,
    CASE WHEN v_has_permission THEN 'success' ELSE 'failure' END
  );

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enhanced Data Access Function
CREATE OR REPLACE FUNCTION public.get_audit_logs(
  p_user_id UUID DEFAULT NULL,
  p_action_type TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT (now() - INTERVAL '30 days'),
  p_end_date TIMESTAMPTZ DEFAULT now(),
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.audit_logs AS $$
DECLARE
  v_current_user_id UUID := auth.uid();
  v_is_admin BOOLEAN;
BEGIN
  -- Check if current user is an admin
  v_is_admin := EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.user_roles r ON u.role = r.name
    WHERE u.id = v_current_user_id AND r.name = 'admin'
  );

  -- If not admin, restrict to own logs
  IF NOT v_is_admin THEN
    p_user_id := v_current_user_id;
  END IF;

  -- Return filtered audit logs
  RETURN QUERY
  SELECT *
  FROM public.audit_logs
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_action_type IS NULL OR action_type = p_action_type)
    AND (p_resource_type IS NULL OR resource_type = p_resource_type)
    AND created_at BETWEEN p_start_date AND p_end_date
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to track failed login attempts
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_failure_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_ip_address TEXT;
  v_user_agent TEXT;
BEGIN
  -- Try to get the user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- Get request metadata
  BEGIN
    v_ip_address := split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1);
    v_user_agent := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ip_address := NULL;
    v_user_agent := NULL;
  END;

  -- Log the login attempt
  PERFORM public.log_audit_event(
    CASE WHEN p_success THEN 'login_success' ELSE 'login_failure' END,
    jsonb_build_object(
      'email', p_email,
      'failure_reason', p_failure_reason,
      'ip_address', v_ip_address,
      'user_agent', v_user_agent
    ),
    'authentication',
    v_user_id,
    CASE WHEN p_success THEN 'success' ELSE 'failure' END,
    CASE WHEN p_success THEN 'info' ELSE 'warning' END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enhanced RLS policies

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin policy for audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.user_roles r ON u.role = r.name
      WHERE u.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Everyone can read roles
CREATE POLICY "Everyone can read roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type_resource_id ON public.audit_logs(resource_type, resource_id);