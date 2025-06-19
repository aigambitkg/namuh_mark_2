import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface UpgradeRequiredProps {
  title?: string;
  description?: string;
  requiredTier?: string;
  features?: string[];
  icon?: React.ReactNode;
}

export const UpgradeRequired: React.FC<UpgradeRequiredProps> = ({
  title = 'Upgrade erforderlich',
  description = 'Für diese Funktion ist ein höheres Abonnement erforderlich.',
  requiredTier,
  features = [],
  icon = <Crown className="h-24 w-24 text-amber-500" />
}) => {
  // Format the required tier name
  const formatTierName = (tier?: string) => {
    if (!tier) return '';
    
    const parts = tier.split('_');
    if (parts.length < 2) return tier;
    
    const role = parts[0] === 'applicant' ? 'Bewerber' : 'Recruiter';
    const level = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    
    return `${role} ${level}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-6 bg-amber-100 p-5 rounded-full inline-block"
          >
            {icon}
          </motion.div>
          
          <h1 className="text-2xl font-bold text-namuh-navy mb-4">{title}</h1>
          <p className="text-gray-600 mb-6">{description}</p>
          
          {requiredTier && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium">
                Diese Funktion ist im <span className="text-namuh-teal">{formatTierName(requiredTier)}</span> Plan enthalten.
              </p>
            </div>
          )}
          
          {features.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold text-namuh-navy mb-3">
                Was Sie mit dem Upgrade erhalten:
              </h2>
              <ul className="space-y-2 text-left">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start"
                  >
                    <Zap className="h-5 w-5 text-namuh-teal mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              <Link to="/pricing">Upgrade durchführen</Link>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline"
            >
              <Link to="/">Zurück zur Startseite</Link>
            </motion.button>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            Fragen zu unseren Abonnements? Kontaktieren Sie uns unter{' '}
            <a href="mailto:support@namuh.de" className="text-namuh-teal hover:underline">
              support@namuh.de
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};