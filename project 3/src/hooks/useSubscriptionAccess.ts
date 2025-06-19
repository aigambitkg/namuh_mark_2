import { useState, useEffect } from 'react';
import { useAuthStore, SubscriptionTier } from '../store/authStore';
import supabase from '../services/supabaseClient';

/**
 * Hook to check if a user has access to a feature based on their subscription tier
 * @param requiredTier The minimum subscription tier required for access
 * @returns Object with hasAccess and isLoading properties
 */
export function useSubscriptionAccess(requiredTier: SubscriptionTier) {
  const { user, isLoading: authLoading } = useAuthStore();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      
      try {
        // If not authenticated, no access
        if (!user) {
          setHasAccess(false);
          return;
        }
        
        // If the user's role doesn't match the tier type, no access
        // (applicant tiers for applicants, recruiter tiers for recruiters)
        const tierRole = requiredTier.split('_')[0];
        if (user.role !== tierRole) {
          setHasAccess(false);
          return;
        }
        
        // Call the Supabase function to check subscription access
        const { data, error } = await supabase.rpc('check_subscription_access', {
          user_id: user.id,
          required_tier: requiredTier
        });
        
        if (error) {
          console.error('Error checking subscription access:', error);
          setHasAccess(false);
          return;
        }
        
        setHasAccess(!!data);
      } catch (error) {
        console.error('Error checking subscription access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, requiredTier]);

  return { 
    hasAccess, 
    isLoading: isLoading || authLoading 
  };
}