import React from 'react';
import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const TokenPackages = React.memo(() => {
  const { user, isAuthenticated } = useAuthStore();
  
  // Nur für registrierte Bewerber anzeigen
  // Ausblenden für nicht angemeldete Benutzer oder Recruiter/Unternehmen
  if (!isAuthenticated || user?.role !== 'applicant') {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-20"
    >
      <h2 className="text-3xl font-bold text-namuh-navy text-center mb-12">
        Token-Pakete
      </h2>
      
      <div className="flex justify-center">
        <div className="card p-8 text-center max-w-md">
          <div className="bg-gradient-to-br from-namuh-teal to-namuh-teal-dark p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Coins className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-namuh-navy mb-4">Token-Pakete</h3>
          <p className="text-gray-600 mb-6">
            Erweitern Sie Ihr KI-Token-Guthaben nach Bedarf
          </p>
          <div className="bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 rounded-lg p-6 mb-6">
            <div className="text-3xl font-bold text-namuh-teal mb-2">10 Tokens</div>
            <div className="text-lg font-semibold text-namuh-navy mb-1">€2,99</div>
            <div className="text-sm text-gray-600">Einmalige Zahlung</div>
          </div>
          <button className="btn-primary w-full">
            Token-Paket kaufen
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default TokenPackages;