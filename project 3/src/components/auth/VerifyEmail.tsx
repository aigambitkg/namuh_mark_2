import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export const VerifyEmail: React.FC<{ email?: string }> = ({ email = '' }) => {
  const [emailInput, setEmailInput] = useState(email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { resendVerificationEmail } = useAuthStore();
  
  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailInput) {
      setError('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await resendVerificationEmail(emailInput);
      setSuccess(true);
      
      // Reset success state after 1 minute
      setTimeout(() => setSuccess(false), 60000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Senden fehlgeschlagen. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
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
          <Mail className="h-16 w-16 text-namuh-teal mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-namuh-navy">E-Mail bestätigen</h2>
          <p className="mt-2 text-gray-600">
            Bitte bestätigen Sie Ihre E-Mail-Adresse, um fortzufahren
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          {success ? (
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bestätigungs-E-Mail gesendet</h3>
              <p className="text-gray-600 mb-6">
                Wir haben eine Bestätigungs-E-Mail an <strong>{emailInput}</strong> gesendet.
                Bitte prüfen Sie Ihren Posteingang und klicken Sie auf den Bestätigungslink.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Wenn Sie die E-Mail nicht finden können, überprüfen Sie bitte Ihren Spam-Ordner.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSuccess(false)}
                className="btn-primary"
              >
                Erneut senden
              </motion.button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">E-Mail-Bestätigung erforderlich</h3>
                    <p className="text-xs text-blue-700">
                      Um die Sicherheit Ihres Kontos zu gewährleisten, müssen Sie Ihre E-Mail-Adresse bestätigen.
                      Die Bestätigung muss innerhalb von 24 Stunden erfolgen, sonst wird Ihr Konto automatisch gelöscht.
                    </p>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <form onSubmit={handleResendVerification} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="input-field"
                    placeholder="Ihre E-Mail-Adresse"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting || !emailInput}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center py-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Bestätigungs-E-Mail senden
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Bereits bestätigt?{' '}
                  <Link to="/login" className="text-namuh-teal hover:text-namuh-teal-dark font-medium">
                    Zur Anmeldeseite
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};