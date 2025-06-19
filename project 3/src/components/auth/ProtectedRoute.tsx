import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole, SubscriptionTier } from '../../store/authStore';
import { LoadingPage } from '../common/LoadingSpinner';
import { useSubscriptionAccess } from '../../hooks/useSubscriptionAccess';
import { UpgradeRequired } from '../common/UpgradeRequired';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredTier?: SubscriptionTier;
  redirectTo?: string;
}

/**
 * Component to protect routes based on authentication, roles, and subscription tiers
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredTier,
  redirectTo = '/login' 
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // If subscription tier check is required
  const subscriptionCheck = requiredTier 
    ? useSubscriptionAccess(requiredTier)
    : { hasAccess: true, isLoading: false };

  // Loading state
  if (isLoading || subscriptionCheck.isLoading) {
    return <LoadingPage />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role check
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to the appropriate dashboard
    return <Navigate to={user?.role === 'applicant' ? '/dashboard' : '/recruiter/dashboard'} replace />;
  }

  // Subscription tier check
  if (requiredTier && !subscriptionCheck.hasAccess) {
    // Show upgrade required component
    const roleTitle = user?.role === 'applicant' ? 'Bewerbenden' : 'Recruiter';
    const features = getFeaturesByTier(requiredTier);
    
    return (
      <UpgradeRequired 
        title={`Upgrade auf ${getTierName(requiredTier)} erforderlich`}
        description={`Diese Funktion ist nur im ${getTierName(requiredTier)} ${roleTitle}-Plan verfügbar.`}
        requiredTier={requiredTier}
        features={features}
      />
    );
  }

  // All checks passed, render the protected component
  return <>{children}</>;
};

// Helper function to get human-readable tier name
function getTierName(tier: SubscriptionTier): string {
  const tierMap: Record<string, string> = {
    'applicant_starter': 'Starter',
    'applicant_professional': 'Professional',
    'applicant_premium': 'Premium',
    'recruiter_basis': 'Basis',
    'recruiter_starter': 'Starter Business',
    'recruiter_professional': 'Professional Business',
    'recruiter_enterprise': 'Enterprise'
  };
  
  return tierMap[tier] || tier.split('_')[1];
}

// Helper function to get feature list by tier
function getFeaturesByTier(tier: SubscriptionTier): string[] {
  switch(tier) {
    case 'applicant_professional':
      return [
        '50 Tokens pro Monat',
        'Bis zu 20 Dokumente im Speicher',
        'Unbegrenzte Bewerbungshistorie',
        'Zugang zu Quiz-Me mit Tokens',
        'Priority Support'
      ];
    case 'applicant_premium':
      return [
        '150 Tokens pro Monat',
        'Bis zu 50 Dokumente im Speicher',
        'Erweiterte Bewerbungsverwaltung',
        'Alle Premium-Features ohne Einschränkungen',
        'Priority Support'
      ];
    case 'recruiter_starter':
      return [
        'Bis zu 7 aktive Stellenanzeigen',
        '5 GB Datenspeicher',
        'Multiposting ohne Servicepauschale',
        'Basis-Statistiken und -Analysen',
        '3 Team-Mitglieder'
      ];
    case 'recruiter_professional':
      return [
        'Bis zu 20 aktive Stellenanzeigen',
        '25 GB Datenspeicher',
        'Erweiterte Bewerber-verwaltung',
        'Vollständige Statistiken und Analysen',
        'Bis zu 10 Team-Mitglieder'
      ];
    case 'recruiter_enterprise':
      return [
        'Unbegrenzte aktive Stellenanzeigen',
        '100 GB Datenspeicher',
        'API-Integrationen',
        'Personalisierte Beratung',
        'Unbegrenzte Team-Mitglieder'
      ];
    default:
      return [];
  }
}