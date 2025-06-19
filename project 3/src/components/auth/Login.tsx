import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Check, Loader2, LogIn } from 'lucide-react';
import { useAuthStore, UserRole } from '../../store/authStore';
import { motion } from 'framer-motion';
import { OAuthProvider } from '../../services/authService';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('applicant');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOAuthLoading, setIsOAuthLoading] = useState<OAuthProvider | null>(null);
  const { login, signInWithOAuth, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message in location state (from email verification, etc)
  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await login(email, password, role);
      // Redirect to the appropriate dashboard based on role
      navigate(role === 'applicant' ? '/dashboard' : '/recruiter/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';
      setError(errorMessage);
    }
  };
  
  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setError('');
    setSuccess('');
    setIsOAuthLoading(provider);
    
    try {
      await signInWithOAuth(provider);
      // The redirect will happen automatically
    } catch (err) {
      setError(`${provider} Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.`);
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-namuh-teal/10 to-namuh-navy/10 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <iframe 
            src="/Logo-min.html" 
            className="h-[160px] w-[160px] sm:h-[180px] sm:w-[180px] md:h-[200px] md:w-[200px] mx-auto mb-4 border-0" 
            title="Logo"
            style={{ background: 'transparent' }}
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-namuh-navy">Willkommen zurück</h2>
          <p className="mt-2 text-gray-600">Melden Sie sich bei Ihrem Konto an</p>
        </div>

        <div className="card p-6 sm:p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
              <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Social Login */}
          <div className="mb-6 space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading || isOAuthLoading !== null}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-namuh-teal disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isOAuthLoading === 'google' ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-1.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Mit Google anmelden
            </button>
            
            <button
              type="button"
              onClick={() => handleOAuthLogin('microsoft')}
              disabled={isLoading || isOAuthLoading !== null}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-namuh-teal disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isOAuthLoading === 'microsoft' ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z"></path>
                  <path fill="#f35325" d="M1 1h10v10H1z"></path>
                  <path fill="#81bc06" d="M12 1h10v10H12z"></path>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"></path>
                  <path fill="#ffba08" d="M12 12h10v10H12z"></path>
                </svg>
              )}
              Mit Microsoft anmelden
            </button>
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute w-full border-t border-gray-300"></div>
            <span className="relative bg-white px-3 text-sm text-gray-500">oder</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ich bin ein...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setRole('applicant')}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    role === 'applicant'
                      ? 'border-namuh-teal bg-namuh-teal/5 text-namuh-teal'
                      : 'border-gray-200 hover:border-namuh-teal/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium">Bewerber</div>
                    <div className="text-xs text-gray-500 mt-1">Auf der Suche nach Jobs</div>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    role === 'recruiter'
                      ? 'border-namuh-teal bg-namuh-teal/5 text-namuh-teal'
                      : 'border-gray-200 hover:border-namuh-teal/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium">Recruiter</div>
                    <div className="text-xs text-gray-500 mt-1">Suche nach Talenten</div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="ihre.email@beispiel.de"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Passwort
                </label>
                <Link to="/forgot-password" className="text-xs text-namuh-teal hover:text-namuh-teal-dark">
                  Passwort vergessen?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Ihr Passwort"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Angemeldet bleiben
              </label>
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || isOAuthLoading !== null}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Anmeldung...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Anmelden
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Demo-Zugangsdaten:</p>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Bewerber:</strong> applicant@test.com / password</p>
              <p><strong>Recruiter:</strong> recruiter@test.com / password</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Noch kein Konto?{' '}
              <Link to="/register" className="text-namuh-teal hover:text-namuh-teal-dark font-medium">
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};