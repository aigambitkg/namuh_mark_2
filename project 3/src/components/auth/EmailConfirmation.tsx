import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, AlertCircle, Mail, Loader2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export const EmailConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const { confirmEmail, resendVerificationEmail } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token') || '';
    
    const verifyEmail = async () => {
      try {
        await confirmEmail(token);
        setStatus('success');
        
        // Navigate to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Bestätigung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    };
    
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setError('Kein Bestätigungstoken gefunden. Bitte klicken Sie auf den Link in Ihrer E-Mail.');
    }
  }, [searchParams, confirmEmail, navigate]);
  
  const handleResendVerification = async () => {
    if (!email) return;
    
    setResendLoading(true);
    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (err) {
      setError('Senden der Bestätigungs-E-Mail fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-namuh-teal/10 to-namuh-navy/10 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <iframe 
            src="/Logo-min.html" 
            className="h-[160px] w-[160px] sm:h-[180px] sm:w-[180px] mx-auto mb-4 border-0" 
            title="Logo"
            style={{ background: 'transparent' }}
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-namuh-navy">
            {status === 'loading' ? 'E-Mail wird bestätigt...' : 
             status === 'success' ? 'E-Mail bestätigt!' : 
             'Bestätigung fehlgeschlagen'}
          </h2>
        </div>

        <div className="card p-6 sm:p-8 text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-namuh-teal animate-spin mb-6" />
              <p className="text-gray-600">Ihre E-Mail-Adresse wird bestätigt. Bitte warten Sie einen Moment...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-6">
                <Check className="h-16 w-16 text-green-600" />
              </div>
              <p className="text-green-700 text-lg mb-2">Vielen Dank! Ihre E-Mail-Adresse wurde erfolgreich bestätigt.</p>
              <p className="text-gray-600 mb-6">Sie werden in wenigen Sekunden zum Dashboard weitergeleitet.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Zum Dashboard
              </motion.button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-4 rounded-full mb-6">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
              <p className="text-red-700 text-lg mb-2">Bestätigung fehlgeschlagen</p>
              <p className="text-gray-600 mb-6">{error}</p>
              
              <div className="bg-gray-50 p-6 rounded-lg w-full mb-6">
                <h3 className="font-medium text-gray-900 mb-4">Neue Bestätigungs-E-Mail anfordern</h3>
                <div className="mb-4">
                  <label htmlFor="email" className="sr-only">E-Mail-Adresse</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Ihre E-Mail-Adresse"
                      required
                    />
                  </div>
                </div>
                
                {resendSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Eine neue Bestätigungs-E-Mail wurde gesendet. Bitte überprüfen Sie Ihren Posteingang.
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleResendVerification}
                  disabled={!email || resendLoading}
                  className="btn-primary w-full flex items-center justify-center py-3"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Bestätigungs-E-Mail erneut senden
                    </>
                  )}
                </motion.button>
              </div>
              
              <p className="text-sm text-gray-500">
                Sie können auch zurück zur{' '}
                <Link
                  to="/login"
                  className="text-namuh-teal hover:text-namuh-teal-dark"
                >
                  Anmeldeseite
                </Link> gehen.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};