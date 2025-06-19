import React, { useState } from 'react';
import { 
  Eye, 
  Check, 
  Send,
  Loader2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Building2,
  Calendar,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PreviewStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  autoSaving: boolean;
  onSubmit: () => void;
  isProcessing: boolean;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ 
  formData, 
  updateFormData, 
  autoSaving, 
  onSubmit, 
  isProcessing 
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToAccuracy, setAgreedToAccuracy] = useState(false);
  const [agreedToProcessing, setAgreedToProcessing] = useState(false);

  const canSubmit = agreedToTerms && agreedToAccuracy && agreedToProcessing && formData.aggCompliant;

  const formatSalary = () => {
    if (!formData.salaryMin || !formData.salaryMax) return 'Nach Vereinbarung';
    const symbol = formData.currency === 'EUR' ? '€' : formData.currency === 'USD' ? '$' : '£';
    return `${symbol}${formData.salaryMin.toLocaleString()} - ${symbol}${formData.salaryMax.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <Eye className="h-12 w-12 text-namuh-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-namuh-navy mb-2">Vorschau & Veröffentlichung</h2>
        <p className="text-gray-600">Überprüfen Sie alle Details vor der finalen Veröffentlichung</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Job Preview - 2/3 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Job Header */}
            <div className="bg-gradient-to-r from-namuh-teal to-namuh-navy p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-3">{formData.title}</h1>
                  <div className="flex items-center space-x-6 text-namuh-teal-light">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span className="font-medium">{formData.companyName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>{formData.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span className="capitalize">{formData.employmentType}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {formData.salaryTransparency && (
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-sm opacity-90">Gehalt</div>
                      <div className="text-xl font-bold">{formatSalary()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Content */}
            <div className="p-8 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-namuh-navy mb-4">Über die Position</h3>
                <p className="text-gray-700 leading-relaxed">{formData.description}</p>
              </div>

              {/* Responsibilities */}
              {formData.responsibilities?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-namuh-navy mb-4">Ihre Aufgaben</h3>
                  <ul className="space-y-3">
                    {formData.responsibilities.map((responsibility: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-namuh-teal rounded-full mt-2 mr-4 flex-shrink-0" />
                        <span className="text-gray-700">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {formData.qualifications?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-namuh-navy mb-4">Das bringen Sie mit</h3>
                  <ul className="space-y-3">
                    {formData.qualifications.map((qualification: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {formData.skills?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-namuh-navy mb-4">Technische Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {formData.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="bg-namuh-teal/10 text-namuh-teal px-4 py-2 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {formData.benefits?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-namuh-navy mb-4">Das bieten wir</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {formData.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-namuh-navy mb-4">Job-Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium">Anstellungsart</div>
                        <div className="text-gray-600 capitalize">{formData.employmentType}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium">Arbeitsmodell</div>
                        <div className="text-gray-600 capitalize">{formData.workModel}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium">Erfahrungslevel</div>
                        <div className="text-gray-600 capitalize">{formData.experience}</div>
                      </div>
                    </div>
                    {formData.salaryTransparency && (
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium">Gehalt</div>
                          <div className="text-gray-600">{formatSalary()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="text-center pt-6 border-t border-gray-200">
                <button className="bg-namuh-teal hover:bg-namuh-teal-dark text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors">
                  Jetzt bewerben
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Bewerbungen werden direkt an {formData.companyName} weitergeleitet
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* AGG Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-lg p-6 border-2 ${
              formData.aggCompliant
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center mb-4">
              {formData.aggCompliant ? (
                <Check className="h-6 w-6 text-green-600 mr-3" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              )}
              <h3 className="font-semibold">AGG-Compliance</h3>
            </div>
            <p className={`text-sm ${
              formData.aggCompliant ? 'text-green-700' : 'text-red-700'
            }`}>
              {formData.aggCompliant
                ? 'Ihre Stellenausschreibung ist AGG-konform und kann veröffentlicht werden.'
                : 'Bitte beheben Sie die AGG-Verstöße vor der Veröffentlichung.'
              }
            </p>
          </motion.div>

          {/* Publication Checklist */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-namuh-navy mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Veröffentlichungs-Bestätigung
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToAccuracy}
                  onChange={(e) => setAgreedToAccuracy(e.target.checked)}
                  className="mt-1 h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Ich bestätige, dass alle Angaben korrekt und vollständig sind und der aktuellen Stellenausschreibung entsprechen.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToProcessing}
                  onChange={(e) => setAgreedToProcessing(e.target.checked)}
                  className="mt-1 h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Ich stimme der Verarbeitung der Bewerberdaten gemäß DSGVO zu und bestätige, dass interne Daten vertraulich behandelt werden.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Ich akzeptiere die{' '}
                  <a href="/terms" className="text-namuh-teal hover:text-namuh-teal-dark underline" target="_blank">
                    Nutzungsbedingungen
                  </a>{' '}
                  und{' '}
                  <a href="/privacy" className="text-namuh-teal hover:text-namuh-teal-dark underline" target="_blank">
                    Datenschutzrichtlinien
                  </a>{' '}
                  von namuH.
                </span>
              </label>
            </div>
          </div>

          {/* Publication Summary */}
          <div className="bg-namuh-teal/10 rounded-lg p-6 border border-namuh-teal/20">
            <h3 className="font-semibold text-namuh-navy mb-4">📋 Zusammenfassung</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unternehmen:</span>
                <span className="font-medium">{formData.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Standort:</span>
                <span className="font-medium">{formData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arbeitsmodell:</span>
                <span className="font-medium capitalize">{formData.workModel}</span>
              </div>
              {formData.salaryTransparency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Gehalt:</span>
                  <span className="font-medium">{formatSalary()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">AGG-Status:</span>
                <span className={`font-medium ${
                  formData.aggCompliant ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formData.aggCompliant ? 'Konform' : 'Nicht konform'}
                </span>
              </div>
            </div>
          </div>

          {/* Publish Button */}
          <motion.button
            whileHover={{ scale: canSubmit ? 1.02 : 1 }}
            whileTap={{ scale: canSubmit ? 0.98 : 1 }}
            onClick={onSubmit}
            disabled={!canSubmit || isProcessing}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              canSubmit
                ? 'bg-namuh-teal hover:bg-namuh-teal-dark text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Wird veröffentlicht...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Stellenausschreibung veröffentlichen</span>
              </div>
            )}
          </motion.button>

          {!canSubmit && (
            <p className="text-sm text-gray-500 text-center">
              {!formData.aggCompliant
                ? 'AGG-Compliance erforderlich'
                : 'Bitte bestätigen Sie alle Punkte'
              }
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PreviewStep;