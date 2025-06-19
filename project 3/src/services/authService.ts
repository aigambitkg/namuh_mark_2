import supabase from './supabaseClient';
import { auditService } from './auditService';
import { UserRole, SubscriptionTier } from '../store/authStore';

export type OAuthProvider = 'google' | 'github' | 'microsoft';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string, role?: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      return await getUserDataAfterAuth(data.user.id, role);
    } catch (error) {
      console.error('Login error:', error);
      // Log failed login
      auditService.logAuditEvent('login_failure', { email, error: (error as Error).message }, 'authentication');
      throw error;
    }
  },
  
  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth: async (provider: OAuthProvider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
      
      // OAuth redirects to an external site, so we don't return user data here
      return data;
    } catch (error) {
      console.error(`${provider} OAuth sign in error:`, error);
      throw error;
    }
  },
  
  /**
   * Process OAuth callback
   * Call this when user is redirected back from OAuth provider
   */
  handleOAuthCallback: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!data.session) throw new Error('No session found');
      
      // Get the user data
      return await getUserDataAfterAuth(data.session.user.id);
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user with email and password
   */
  register: async (email: string, password: string, name: string, role: UserRole) => {
    try {
      // Check if a user with this email already exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .eq('email', email);
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits.');
      }
      
      // Sign up WITHOUT requiring immediate email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            // Set to true to allow immediate access, although we still send verification email
            email_confirmed: true,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        }
      });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error('Benutzer konnte nicht erstellt werden.');
      }
      
      if (data.user.identities?.length === 0) {
        throw new Error('Diese E-Mail-Adresse wird bereits verwendet.');
      }
      
      // Wait for profile and subscription creation by the database trigger
      // This short delay ensures the trigger has time to execute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get user data including profile and subscription
      return await getUserDataAfterAuth(data.user.id);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Confirm email after registration
   */
  confirmEmail: async (token: string) => {
    try {
      // This is automatically handled by Supabase when the user clicks the email link
      // We just need to check the current session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!data.session) {
        throw new Error('Email-Bestätigung fehlgeschlagen. Bitte versuchen Sie erneut sich anzumelden.');
      }
      
      // Update user metadata to mark email as confirmed
      await supabase.auth.updateUser({
        data: { email_confirmed: true }
      });
      
      return await getUserDataAfterAuth(data.session.user.id);
    } catch (error) {
      console.error('Email confirmation error:', error);
      throw error;
    }
  },
  
  /**
   * Send password reset email
   */
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
  
  /**
   * Update password with reset token
   */
  updatePasswordWithToken: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Get current user data after password update
      const { data: userData } = await supabase.auth.getUser();
      return await getUserDataAfterAuth(userData.user.id);
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  },
  
  /**
   * Logout the current user
   */
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Get the current logged in user
   */
  getCurrentUser: async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) return null;
      
      return await getUserDataAfterAuth(authData.user.id);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  /**
   * Check if user has verified email
   */
  checkEmailVerification: async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) return false;
      
      // Check user metadata - we now allow access even without email confirmation
      // but we still track it for reference
      return true;
    } catch (error) {
      console.error('Email verification check error:', error);
      return false;
    }
  },
  
  /**
   * Resend verification email
   */
  resendVerificationEmail: async (email: string) => {
    try {
      // For security, we don't check if the email exists, just send the email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        }
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw error;
    }
  },
  
  /**
   * Verify subscription tier access
   * Check if user has access to a feature based on their subscription tier
   */
  hasSubscriptionAccess: async (requiredTier: SubscriptionTier) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      // Check subscription access with the backend function
      const { data, error } = await supabase.rpc('check_subscription_access', {
        user_id: userData.user.id,
        required_tier: requiredTier
      });
      
      if (error) {
        console.error('Subscription access check error:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Subscription access check error:', error);
      return false;
    }
  }
};

// Helper function to get user data after authentication
async function getUserDataAfterAuth(userId: string, expectedRole?: UserRole) {
  try {
    // Get user profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, profile_id, created_at, subscription_id')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    // Check if role matches if expected role is provided
    if (expectedRole && userData.role !== expectedRole) {
      throw new Error('Role mismatch');
    }
    
    // Get subscription data
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, tier_name, token_balance, monthly_token_allowance, status')
      .eq('user_id', userId)
      .single();
    
    if (subError && subError.code !== 'PGRST116') throw subError;
    
    // Get profile data (depends on role)
    let profile;
    if (userData.role === 'applicant') {
      const { data: profileData } = await supabase
        .from('applicant_profiles')
        .select('id, name, avatar_url')
        .eq('id', userData.profile_id)
        .single();
        
      profile = profileData;
    } else {
      const { data: profileData } = await supabase
        .from('recruiter_profiles')
        .select('id, name, avatar_url, company_id, company_name')
        .eq('id', userData.profile_id)
        .single();
        
      profile = profileData;
    }
    
    // Log successful login
    auditService.logAuditEvent('user_login', { email: userData.email }, 'authentication', userId);
    
    return {
      id: userData.id,
      email: userData.email,
      name: profile?.name || '',
      role: userData.role as UserRole,
      tier: subscription?.tier_name as SubscriptionTier,
      tokenBalance: subscription?.token_balance || 0,
      avatarUrl: profile?.avatar_url,
      createdAt: new Date(userData.created_at),
      profileId: userData.profile_id
    };
  } catch (error) {
    console.error('Error getting user data after auth:', error);
    throw error;
  }
}