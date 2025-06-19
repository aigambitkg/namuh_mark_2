import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Login } from './Login';
import { Register } from './Register';
import { EmailConfirmation } from './EmailConfirmation';
import { ForgotPassword } from './ForgotPassword';
import { ResetPassword } from './ResetPassword';
import { OAuthCallback } from './OAuthCallback';
import { VerifyEmail } from './VerifyEmail';
import { Loader2 } from 'lucide-react';

export const AuthRoutes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, checkAuthState, handleOAuthCallback } = useAuthStore();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Handle OAuth callback
  useEffect(() => {
    if (location.pathname === '/auth/callback') {
      const processOAuthCallback = async () => {
        try {
          await handleOAuthCallback();
          // Redirect after successful login
          navigate('/dashboard');
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          navigate('/login', { state: { error: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.' } });
        }
      };
      
      processOAuthCallback();
    }
  }, [location.pathname]);

  // Initial auth state check
  useEffect(() => {
    const initialCheck = async () => {
      await checkAuthState();
      setInitialCheckDone(true);
    };
    
    initialCheck();
  }, []);

  if (isLoading || !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 mx-auto animate-spin text-namuh-teal" />
          <p className="mt-2 text-gray-600">Lade...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/auth/confirm" element={<EmailConfirmation />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* Redirect from auth paths to appropriate routes */}
      <Route path="/auth/*" element={<Navigate to="/login" />} />
    </Routes>
  );
};