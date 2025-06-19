import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anfrage fehlgeschlagen. Bitte versuchen Sie es erneut.');
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
          <h2 className="text-2xl sm:text-3xl font-bold text-namuh-navy">Passwort zurücksetzen</h2>
          <p className="mt-2 text-gray-600">
            Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Überprüfen Sie Ihre E-Mails</h3>
              <p className="text-gray-600 mb-6">
                Wir haben eine E-Mail an <strong>{email}</strong> gesendet, die einen Link zum Zurücksetzen Ihres Passworts enthält.
                Der Link ist für 24 Stunden gültig.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Wenn Sie keine E-Mail erhalten haben, überprüfen Sie bitte Ihren Spam-Ordner oder stellen Sie sicher, dass Sie die richtige E-Mail-Adresse eingegeben haben.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="btn-outline"
                >
                  Andere E-Mail-Adresse verwenden
                </button>
                <Link to="/login" className="btn-primary">
                  Zurück zum Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail-Adresse
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-field pl-10"
                      placeholder="Ihre E-Mail-Adresse"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : 'Link zum Zurücksetzen senden'}
                </motion.button>
              </form>

              <div className="mt-6 flex justify-center">
                <Link to="/login" className="text-namuh-teal hover:text-namuh-teal-dark flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zum Login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};