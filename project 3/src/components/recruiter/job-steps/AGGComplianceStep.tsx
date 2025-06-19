import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Lightbulb,
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AGGComplianceStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  autoSaving: boolean;
}

interface AGGViolation {
  type: 'critical' | 'warning' | 'suggestion';
  field: string;
  line?: number;
  text: string;
  violation: string;
  suggestion: string;
  lawReference: string;
}

const AGGComplianceStep: React.FC<AGGComplianceStepProps> = ({ formData, updateFormData, autoSaving }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [violations, setViolations] = useState<AGGViolation[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  // AGG Compliance Analysis
  const analyzeCompliance = async () => {
    setIsAnalyzing(true);
    
    // Simulate comprehensive AGG analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const foundViolations: AGGViolation[] = [];
    
    // Check all form fields for discriminatory content
    const checkFields = [
      { field: 'title', content: formData.title },
      { field: 'description', content: formData.description },
      { field: 'qualifications', content: formData.qualifications?.join(' ') },
      { field: 'responsibilities', content: formData.responsibilities?.join(' ') }
    ];
    
    // Critical violations
    const criticalTerms = [
      { term: 'männlich', suggestion: 'Verwenden Sie geschlechtsneutrale Formulierungen', law: '§ 1 AGG' },
      { term: 'weiblich', suggestion: 'Verwenden Sie geschlechtsneutrale Formulierungen', law: '§ 1 AGG' },
      { term: 'jung', suggestion: 'Formulieren Sie altersunabhängig', law: '§ 1 AGG' },
      { term: 'alt', suggestion: 'Verwenden Sie "erfahren" statt altersbezogene Begriffe', law: '§ 1 AGG' },
      { term: 'muttersprache', suggestion: 'Verwenden Sie "sehr gute [Sprache]-Kenntnisse"', law: '§ 1 AGG' },
      { term: 'deutsche', suggestion: 'Spezifizieren Sie erforderliche Sprachkenntnisse', law: '§ 1 AGG' }
    ];
    
    // Warning terms
    const warningTerms = [
      { term: 'sportlich', suggestion: 'Entfernen Sie physische Beschreibungen', law: '§ 1 AGG' },
      { term: 'attraktiv', suggestion: 'Fokussieren Sie auf fachliche Qualifikationen', law: '§ 1 AGG' },
      { term: 'native', suggestion: 'Verwenden Sie "sehr gute Kenntnisse"', law: '§ 1 AGG' },
      { term: 'einheimisch', suggestion: 'Verwenden Sie neutrale Formulierungen', law: '§ 1 AGG' }
    ];
    
    checkFields.forEach(({ field, content }) => {
      if (!content) return;
      
      const lowerContent = content.toLowerCase();
      
      criticalTerms.forEach(({ term, suggestion, law }) => {
        if (lowerContent.includes(term)) {
          foundViolations.push({
            type: 'critical',
            field,
            text: term,
            violation: `Potentiell diskriminierender Begriff: "${term}"`,
            suggestion,
            lawReference: law
          });
        }
      });
      
      warningTerms.forEach(({ term, suggestion, law }) => {
        if (lowerContent.includes(term)) {
          foundViolations.push({
            type: 'warning',
            field,
            text: term,
            violation: `Problematischer Begriff: "${term}"`,
            suggestion,
            lawReference: law
          });
        }
      });
    });
    
    // Additional suggestions
    if (!formData.description?.toLowerCase().includes('vielfalt') && 
        !formData.description?.toLowerCase().includes('diversity')) {
      foundViolations.push({
        type: 'suggestion',
        field: 'description',
        text: '',
        violation: 'Diversity-Statement fehlt',
        suggestion: 'Erwähnen Sie Ihr Engagement für Vielfalt und Inklusion',
        lawReference: 'Best Practice'
      });
    }
    
    setViolations(foundViolations);
    setLastAnalysis(new Date());
    setIsAnalyzing(false);
    
    // Update compliance status
    const isCompliant = foundViolations.filter(v => v.type === 'critical').length === 0;
    updateFormData({ 
      aggCompliant: isCompliant,
      aggViolations: foundViolations.map(v => v.violation)
    });
  };
  
  // Auto-analyze on content change
  useEffect(() => {
    if (formData.title || formData.description) {
      const timeoutId = setTimeout(() => {
        analyzeCompliance();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.title, formData.description, formData.qualifications, formData.responsibilities]);

  // Compliance score calculation
  const complianceScore = useMemo(() => {
    const totalIssues = violations.length;
    const criticalIssues = violations.filter(v => v.type === 'critical').length;
    const warningIssues = violations.filter(v => v.type === 'warning').length;
    
    if (totalIssues === 0) return 100;
    
    const deduction = (criticalIssues * 30) + (warningIssues * 15) + ((totalIssues - criticalIssues - warningIssues) * 5);
    return Math.max(0, 100 - deduction);
  }, [violations]);

  const getViolationIcon = (type: AGGViolation['type']) => {
    switch (type) {
      case 'critical': return <X className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'suggestion': return <Lightbulb className="h-5 w-5 text-blue-600" />;
    }
  };

  const getViolationColor = (type: AGGViolation['type']) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'suggestion': return 'border-blue-200 bg-blue-50';
    }
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
        <h2 className="text-2xl font-bold text-namuh-navy mb-2">AGG-Compliance Check</h2>
        <p className="text-gray-600">Automatische Prüfung auf Rechtkonformität nach dem Allgemeinen Gleichbehandlungsgesetz</p>
      </div>

      {/* Compliance Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl p-8 border-2 ${
          complianceScore >= 90
            ? 'bg-green-50 border-green-200'
            : complianceScore >= 70
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl font-bold ${
            complianceScore >= 90
              ? 'bg-green-100 text-green-700'
              : complianceScore >= 70
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {complianceScore}%
          </div>
          
          <h3 className={`text-2xl font-bold mb-2 ${
            complianceScore >= 90
              ? 'text-green-800'
              : complianceScore >= 70
              ? 'text-yellow-800'
              : 'text-red-800'
          }`}>
            {complianceScore >= 90
              ? '✅ AGG-konform'
              : complianceScore >= 70
              ? '⚠️ Verbesserung empfohlen'
              : '❌ AGG-Verstöße erkannt'
            }
          </h3>
          
          <p className={`text-lg ${
            complianceScore >= 90
              ? 'text-green-700'
              : complianceScore >= 70
              ? 'text-yellow-700'
              : 'text-red-700'
          }`}>
            {complianceScore >= 90
              ? 'Ihre Stellenausschreibung entspricht den AGG-Anforderungen.'
              : complianceScore >= 70
              ? 'Kleinere Anpassungen werden empfohlen.'
              : 'Wichtige Änderungen sind erforderlich.'
            }
          </p>
          
          {lastAnalysis && (
            <p className="text-sm text-gray-500 mt-4">
              Letzte Analyse: {lastAnalysis.toLocaleTimeString('de-DE')}
            </p>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Violations List - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-namuh-navy">
              Detailanalyse ({violations.length} Punkte gefunden)
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={analyzeCompliance}
              disabled={isAnalyzing}
              className="btn-outline flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analysiere...' : 'Neu analysieren'}</span>
            </motion.button>
          </div>

          {/* Violations */}
          <div className="space-y-4">
            <AnimatePresence>
              {violations.map((violation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-lg border p-6 ${getViolationColor(violation.type)}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getViolationIcon(violation.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {violation.violation}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          violation.type === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : violation.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {violation.type === 'critical' ? 'Kritisch' :
                           violation.type === 'warning' ? 'Warnung' : 'Vorschlag'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Bereich:</span>
                          <span className="ml-2 text-gray-600 capitalize">{violation.field}</span>
                        </div>
                        
                        {violation.text && (
                          <div>
                            <span className="font-medium text-gray-700">Problematischer Text:</span>
                            <span className="ml-2 text-gray-600 italic">"{violation.text}"</span>
                          </div>
                        )}
                        
                        <div>
                          <span className="font-medium text-gray-700">Empfehlung:</span>
                          <span className="ml-2 text-gray-600">{violation.suggestion}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Rechtsgrundlage:</span>
                          <span className="ml-2 text-gray-600">{violation.lawReference}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {violations.length === 0 && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Keine AGG-Verstöße gefunden!
                </h3>
                <p className="text-green-700">
                  Ihre Stellenausschreibung entspricht den Anforderungen des Allgemeinen Gleichbehandlungsgesetzes.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* AGG Guidelines Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* AGG Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-namuh-teal/10 rounded-lg p-6 border border-namuh-teal/20"
          >
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-namuh-teal mr-2" />
              <h3 className="font-semibold text-namuh-navy">AGG-Grundlagen</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-namuh-navy mb-1">Geschützte Merkmale:</h4>
                <ul className="text-gray-700 space-y-1">
                  <li>• Geschlecht & Identität</li>
                  <li>• Alter</li>
                  <li>• Ethnische Herkunft</li>
                  <li>• Religion & Weltanschauung</li>
                  <li>• Behinderung</li>
                  <li>• Sexuelle Orientierung</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Best Practices */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 rounded-lg p-6 border border-green-200"
          >
            <div className="flex items-center mb-4">
              <Sparkles className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">Best Practices</h3>
            </div>
            
            <div className="space-y-3 text-sm text-green-800">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Verwenden Sie geschlechtsneutrale Sprache</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Fokussieren Sie auf fachliche Qualifikationen</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Erwähnen Sie Diversity & Inklusion</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Vermeiden Sie physische Beschreibungen</span>
              </div>
            </div>
          </motion.div>

          {/* Legal References */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 rounded-lg p-6 border border-blue-200"
          >
            <h3 className="font-semibold text-blue-900 mb-4">📚 Rechtliche Hinweise</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <span className="font-medium">§ 1 AGG:</span>
                <span className="ml-1">Verbot der Diskriminierung</span>
              </div>
              <div>
                <span className="font-medium">§ 7 AGG:</span>
                <span className="ml-1">Benachteiligung im Beruf</span>
              </div>
              <div>
                <span className="font-medium">§ 11 AGG:</span>
                <span className="ml-1">Stellenausschreibungen</span>
              </div>
              <div>
                <span className="font-medium">§ 15 AGG:</span>
                <span className="ml-1">Entschädigungsanspruch</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AGGComplianceStep;