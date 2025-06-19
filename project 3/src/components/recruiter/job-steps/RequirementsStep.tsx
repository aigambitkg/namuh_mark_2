import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  X, 
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Clock,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RequirementsStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  autoSaving: boolean;
}

const RequirementsStep: React.FC<RequirementsStepProps> = ({ formData, updateFormData, autoSaving }) => {
  const [newQualification, setNewQualification] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [aggWarnings, setAggWarnings] = useState<string[]>([]);

  // AGG-Check for discriminatory language
  const checkAGGCompliance = (text: string) => {
    const warnings: string[] = [];
    const discriminatoryTerms = [
      'jung', 'alt', 'männlich', 'weiblich', 'deutsch', 'muttersprache',
      'native', 'einheimisch', 'bildschön', 'attraktiv', 'sportlich'
    ];
    
    discriminatoryTerms.forEach(term => {
      if (text.toLowerCase().includes(term)) {
        warnings.push(`Möglicherweise diskriminierender Begriff: "${term}"`);
      }
    });
    
    return warnings;
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      const warnings = checkAGGCompliance(newQualification);
      if (warnings.length > 0) {
        setAggWarnings(warnings);
        return;
      }
      
      const updated = [...(formData.qualifications || []), newQualification.trim()];
      updateFormData({ qualifications: updated });
      setNewQualification('');
      setAggWarnings([]);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const warnings = checkAGGCompliance(newSkill);
      if (warnings.length > 0) {
        setAggWarnings(warnings);
        return;
      }
      
      const updated = [...(formData.skills || []), newSkill.trim()];
      updateFormData({ skills: updated });
      setNewSkill('');
      setAggWarnings([]);
    }
  };

  const removeQualification = (index: number) => {
    const updated = formData.qualifications.filter((_: any, i: number) => i !== index);
    updateFormData({ qualifications: updated });
  };

  const removeSkill = (index: number) => {
    const updated = formData.skills.filter((_: any, i: number) => i !== index);
    updateFormData({ skills: updated });
  };

  const experienceLevels = [
    { value: 'entry', label: 'Berufseinsteiger', years: '0-2 Jahre' },
    { value: 'mid', label: 'Erfahren', years: '3-5 Jahre' },
    { value: 'senior', label: 'Senior', years: '5+ Jahre' },
    { value: 'expert', label: 'Expert', years: '10+ Jahre' }
  ];

  const suggestedSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS',
    'Docker', 'Git', 'Agile', 'Scrum', 'CSS', 'HTML', 'SQL', 'API'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <GraduationCap className="h-12 w-12 text-namuh-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-namuh-navy mb-2">Anforderungen</h2>
        <p className="text-gray-600">Definieren Sie Qualifikationen und Skills mit AGG-Konformität</p>
      </div>

      {/* AGG Warnings */}
      <AnimatePresence>
        {aggWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h4 className="font-semibold text-red-800">AGG-Warnung</h4>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {aggWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
            <p className="text-red-600 text-xs mt-2">
              Bitte verwenden Sie neutrale, nicht-diskriminierende Formulierungen.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Qualifications */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Qualifikationen & Ausbildung *
            </label>
            
            {/* Qualifications List */}
            <div className="space-y-3 mb-4">
              <AnimatePresence>
                {formData.qualifications?.map((qualification: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="flex-1 text-sm">{qualification}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeQualification(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add New Qualification */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                placeholder="z.B. Bachelor in Informatik oder vergleichbare Ausbildung"
                className="flex-1 input-field"
                onKeyPress={(e) => e.key === 'Enter' && addQualification()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addQualification}
                className="btn-outline px-4 py-2"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Erfahrungslevel *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {experienceLevels.map((level) => (
                <motion.button
                  key={level.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => updateFormData({ experience: level.value })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.experience === level.value
                      ? 'border-namuh-teal bg-namuh-teal/5 text-namuh-teal'
                      : 'border-gray-200 hover:border-namuh-teal/50'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{level.label}</div>
                    <div className="text-xs text-gray-500">{level.years}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Skills */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Technische Skills & Fähigkeiten *
            </label>
            
            {/* Skills List */}
            <div className="space-y-3 mb-4">
              <AnimatePresence>
                {formData.skills?.map((skill: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3 p-3 bg-namuh-teal/5 rounded-lg border border-namuh-teal/20"
                  >
                    <Award className="h-4 w-4 text-namuh-teal flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium">{skill}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add New Skill */}
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="z.B. React, TypeScript, AWS..."
                className="flex-1 input-field"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addSkill}
                className="btn-outline px-4 py-2"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Suggested Skills */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-namuh-teal" />
                Häufig geforderte Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.map((skill) => (
                  <motion.button
                    key={skill}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      if (!formData.skills?.includes(skill)) {
                        const updated = [...(formData.skills || []), skill];
                        updateFormData({ skills: updated });
                      }
                    }}
                    disabled={formData.skills?.includes(skill)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      formData.skills?.includes(skill)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-namuh-teal/10 text-namuh-teal hover:bg-namuh-teal/20'
                    }`}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AGG Compliance Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-green-50 rounded-lg p-6 border border-green-200"
      >
        <div className="flex items-center mb-4">
          <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
          <h3 className="text-lg font-semibold text-green-900">AGG-konforme Formulierungen</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-green-800 mb-3">✅ Empfohlene Formulierungen</h4>
            <ul className="text-green-700 space-y-2">
              <li>• "Mehrjährige Berufserfahrung"</li>
              <li>• "Sehr gute Deutschkenntnisse"</li>
              <li>• "Kommunikationsstärke"</li>
              <li>• "Teamplayer mit Eigeninitiative"</li>
              <li>• "Analytisches Denkvermögen"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-800 mb-3">❌ Zu vermeiden</h4>
            <ul className="text-red-700 space-y-2">
              <li>• Alters- oder Geschlechtsbezug</li>
              <li>• "Muttersprache Deutsch"</li>
              <li>• Äußerliche Beschreibungen</li>
              <li>• Nationalitätsbezug</li>
              <li>• Familienstatus</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RequirementsStep;