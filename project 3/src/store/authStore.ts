import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, OAuthProvider } from '../services/authService';

export type UserRole = 'applicant' | 'recruiter';
export type SubscriptionTier = 
  | 'applicant_starter' 
  | 'applicant_professional' 
  | 'applicant_premium'
  | 'recruiter_basis'
  | 'recruiter_starter'
  | 'recruiter_professional'
  | 'recruiter_enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: SubscriptionTier;
  tokenBalance: number;
  avatarUrl?: string;
  createdAt: Date;
  emailConfirmed?: boolean;
  profileId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Authentication methods
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<any>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  handleOAuthCallback: () => Promise<void>;
  confirmEmail: (token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  
  // Session methods
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  
  // User data methods
  updateTokenBalance: (amount: number) => void;
  setUser: (user: User) => void;
  
  // Permission methods
  hasAccess: (requiredTier: SubscriptionTier) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, role?: UserRole) => {
        set({ isLoading: true });
        
        try {
          const user = await authService.login(email, password, role);
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, role: UserRole) => {
        set({ isLoading: true });
        
        try {
          const result = await authService.register(email, password, name, role);
          
          // If email confirmation is required, don't set user as authenticated
          if (result.emailConfirmed === false) {
            set({ isLoading: false });
            return result;
          }
          
          // Otherwise set user as authenticated
          set({ 
            user: result, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      signInWithOAuth: async (provider: OAuthProvider) => {
        set({ isLoading: true });
        
        try {
          await authService.signInWithOAuth(provider);
          // The page will be redirected to the provider, so we don't need to update state
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      handleOAuthCallback: async () => {
        set({ isLoading: true });
        
        try {
          const user = await authService.handleOAuthCallback();
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      confirmEmail: async (token: string) => {
        set({ isLoading: true });
        
        try {
          const user = await authService.confirmEmail(token);
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      resetPassword: async (email: string) => {
        set({ isLoading: true });
        
        try {
          await authService.resetPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      updatePassword: async (newPassword: string) => {
        set({ isLoading: true });
        
        try {
          const user = await authService.updatePasswordWithToken(newPassword);
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateTokenBalance: (amount: number) => {
        const { user } = get();
        if (user) {
          set({ 
            user: { 
              ...user, 
              tokenBalance: Math.max(0, user.tokenBalance + amount) 
            } 
          });
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      
      checkAuthState: async () => {
        set({ isLoading: true });
        
        try {
          const user = await authService.getCurrentUser();
          
          if (user) {
            // Check if email is verified
            const isEmailVerified = await authService.checkEmailVerification();
            
            if (isEmailVerified) {
              set({ 
                user, 
                isAuthenticated: true 
              });
            } else {
              // User exists but email not verified
              set({ 
                user: null, 
                isAuthenticated: false 
              });
            }
          } else {
            set({ 
              user: null, 
              isAuthenticated: false 
            });
          }
        } catch (error) {
          console.error('Error checking auth state:', error);
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      hasAccess: async (requiredTier: SubscriptionTier) => {
        return await authService.hasSubscriptionAccess(requiredTier);
      },
      
      resendVerificationEmail: async (email: string) => {
        set({ isLoading: true });
        
        try {
          await authService.resendVerificationEmail(email);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'namuh-auth',
      // Don't persist sensitive data
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user ? {
          id: state.user.id,
          email: state.user.email,
          name: state.user.name,
          role: state.user.role,
          tier: state.user.tier,
          tokenBalance: state.user.tokenBalance,
          avatarUrl: state.user.avatarUrl,
          createdAt: state.user.createdAt,
          profileId: state.user.profileId,
        } : null,
      }),
    }
  )
);