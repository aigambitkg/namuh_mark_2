import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const OAuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { handleOAuthCallback, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const user = await handleOAuthCallback();
        // Navigate to the appropriate dashboard based on user role
        navigate(user?.role === 'applicant' ? '/dashboard' : '/recruiter/dashboard', { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
        setTimeout(() => {
          navigate('/login', { 
            state: { error: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.' },
            replace: true
          });
        }, 3000);
      }
    };
    
    processCallback();
  }, [handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-namuh-teal/10 to-namuh-navy/10">
      <div className="text-center">
        {error ? (
          <div className="card p-8 max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Anmeldung fehlgeschlagen</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-gray-500">Sie werden zur Anmeldeseite weitergeleitet...</p>
          </div>
        ) : (
          <>
            <Loader2 className="h-16 w-16 text-namuh-teal mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Anmeldung wird verarbeitet</h2>
            <p className="text-gray-600">Bitte warten Sie einen Moment...</p>
          </>
        )}
      </div>
    </div>
  );
};