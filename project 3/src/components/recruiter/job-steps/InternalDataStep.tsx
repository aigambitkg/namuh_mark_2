import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Building2, 
  Hash,
  FileText,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

interface InternalDataStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  autoSaving: boolean;
}

const InternalDataStep: React.FC<InternalDataStepProps> = ({ formData, updateFormData, autoSaving }) => {
  const [showRegistrationNumber, setShowRegistrationNumber] = useState(false);
  const [isValidRegistration, setIsValidRegistration] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate Handelsregisternummer format
  const validateRegistrationNumber = async (number: string) => {
    if (!number || number.length < 8) {
      setIsValidRegistration(null);
      return;
    }

    setIsValidating(true);
    
    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation logic (simplified)
    const isValid = /^HR[A-Z]\s?\d{1,6}$/.test(number.toUpperCase()) || 
                   /^[A-Z]{2,3}\s?\d{3,6}$/.test(number.toUpperCase());
    
    setIsValidRegistration(isValid);
    setIsValidating(false);
  };

  useEffect(() => {
    if (formData.registrationNumber) {
      const timeoutId = setTimeout(() => {
        validateRegistrationNumber(formData.registrationNumber);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.registrationNumber]);

  const generateInternalId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const jobId = `JOB-${timestamp}-${random}`.toUpperCase();
    updateFormData({ internalJobId: jobId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <Shield className="h-12 w-12 text-namuh-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-namuh-navy mb-2">Interne Daten</h2>
        <p className="text-gray-600">Vertrauliche Informationen für rechtliche Verifizierung</p>
      </div>

      {/* Privacy Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-lg p-6 border border-blue-200"
      >
        <div className="flex items-center mb-4">
          <Lock className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-blue-900">Datenschutz & Vertraulichkeit</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">🔒 Nicht öffentlich sichtbar</h4>
            <ul className="space-y-1">
              <li>• Handelsregisternummer</li>
              <li>• Interne Job-ID</li>
              <li>• Interne Notizen</li>
              <li>• Kontaktdaten des Erstellers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">⚖️ Verwendungszweck</h4>
            <ul className="space-y-1">
              <li>• Rechtliche Verifizierung</li>
              <li>• Interne Zuordnung</li>
              <li>• Compliance-Checks</li>
              <li>• Audit-Protokolle</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Registration Data */}
        <div className="space-y-6">
          {/* Company Registration Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Handelsregisternummer *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type={showRegistrationNumber ? 'text' : 'password'}
                value={formData.registrationNumber}
                onChange={(e) => updateFormData({ registrationNumber: e.target.value })}
                className="input-field pl-10 pr-20"
                placeholder="z.B. HRB 123456"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {isValidating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-namuh-teal"></div>
                )}
                {isValidRegistration === true && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {isValidRegistration === false && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowRegistrationNumber(!showRegistrationNumber)}
                  className="text-gray-400 hover:text-namuh-teal"
                >
                  {showRegistrationNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </motion.button>
              </div>
            </div>
            <div className="mt-2 text-xs">
              {isValidRegistration === false && (
                <p className="text-red-600">
                  ❌ Ungültiges Format. Beispiele: HRB 123456, HRA 123456, oder lokale Formate
                </p>
              )}
              {isValidRegistration === true && (
                <p className="text-green-600">
                  ✅ Gültiges Format erkannt
                </p>
              )}
              {!isValidRegistration && !isValidating && (
                <p className="text-gray-500">
                  💡 Format wird automatisch überprüft. Beispiel: HRB 123456
                </p>
              )}
            </div>
          </div>

          {/* Internal Job ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interne Job-ID *
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={formData.internalJobId}
                  onChange={(e) => updateFormData({ internalJobId: e.target.value })}
                  className="input-field pl-10"
                  placeholder="JOB-2024-001"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={generateInternalId}
                className="btn-outline px-4 py-2 whitespace-nowrap"
              >
                Generieren
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Für interne Zuordnung und Tracking. Wird automatisch generiert.
            </p>
          </div>

          {/* Company Verification Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg p-4 border-2 ${
              isValidRegistration === true
                ? 'bg-green-50 border-green-200'
                : isValidRegistration === false
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center mb-3">
              {isValidRegistration === true ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : isValidRegistration === false ? (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              ) : (
                <Building2 className="h-5 w-5 text-gray-500 mr-2" />
              )}
              <h4 className="font-medium">
                Unternehmensverifizierung
              </h4>
            </div>
            <div className="text-sm space-y-2">
              {isValidRegistration === true ? (
                <div className="text-green-700">
                  <p className="font-medium">✅ Unternehmen verifiziert</p>
                  <p>Die Handelsregisternummer wurde erfolgreich validiert.</p>
                </div>
              ) : isValidRegistration === false ? (
                <div className="text-red-700">
                  <p className="font-medium">❌ Verifizierung fehlgeschlagen</p>
                  <p>Bitte überprüfen Sie die Handelsregisternummer.</p>
                </div>
              ) : (
                <div className="text-gray-600">
                  <p className="font-medium">⏳ Warten auf Eingabe</p>
                  <p>Geben Sie eine gültige Handelsregisternummer ein.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Notes & Additional Info */}
        <div className="space-y-6">
          {/* Internal Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interne Notizen
            </label>
            <textarea
              value={formData.internalNotes}
              onChange={(e) => updateFormData({ internalNotes: e.target.value })}
              rows={6}
              className="input-field resize-none"
              placeholder="Interne Kommentare, Budgetinfos, Besonderheiten..."
            />
            <p className="text-xs text-gray-500 mt-1">
              🔒 Diese Notizen sind nur für interne Zwecke und werden nicht veröffentlicht.
            </p>
          </div>

          {/* Job Classification */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Stellenklassifizierung</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={formData.isUrgent}
                  onChange={(e) => updateFormData({ isUrgent: e.target.checked })}
                  className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                />
                <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">
                  Dringend zu besetzen
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={formData.isConfidential}
                  onChange={(e) => updateFormData({ isConfidential: e.target.checked })}
                  className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                />
                <label htmlFor="confidential" className="ml-2 text-sm text-gray-700">
                  Vertrauliche Position
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="replacement"
                  checked={formData.isReplacement}
                  onChange={(e) => updateFormData({ isReplacement: e.target.checked })}
                  className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                />
                <label htmlFor="replacement" className="ml-2 text-sm text-gray-700">
                  Nachfolgeposition
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="expansion"
                  checked={formData.isExpansion}
                  onChange={(e) => updateFormData({ isExpansion: e.target.checked })}
                  className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                />
                <label htmlFor="expansion" className="ml-2 text-sm text-gray-700">
                  Erweiterung des Teams
                </label>
              </div>
            </div>
          </div>

          {/* Data Processing Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 rounded-lg p-6 border border-yellow-200"
          >
            <div className="flex items-center mb-3">
              <FileText className="h-5 w-5 text-yellow-600 mr-2" />
              <h4 className="font-medium text-yellow-900">Datenverarbeitung</h4>
            </div>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>
                <strong>Speicherung:</strong> Interne Daten werden verschlüsselt und getrennt von öffentlichen Informationen gespeichert.
              </p>
              <p>
                <strong>Zugriff:</strong> Nur autorisierte Mitarbeiter und Compliance-Systeme haben Zugriff.
              </p>
              <p>
                <strong>Aufbewahrung:</strong> Daten werden gemäß gesetzlicher Vorgaben aufbewahrt.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InternalDataStep;