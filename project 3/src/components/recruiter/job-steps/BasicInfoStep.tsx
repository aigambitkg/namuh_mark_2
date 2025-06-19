import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Briefcase,
  Sparkles,
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BasicInfoStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  autoSaving: boolean;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, updateFormData, autoSaving }) => {
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);

  // Auto-generate meta tags when title changes
  useEffect(() => {
    if (formData.title && formData.title.length > 3) {
      const timeoutId = setTimeout(() => {
        generateMetaTags(formData.title);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.title]);

  const generateMetaTags = async (title: string) => {
    setIsGeneratingMeta(true);
    
    // Simulate AI meta tag generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const metaTags = [
      title.toLowerCase().includes('senior') ? 'Senior-Level' : 'Mid-Level',
      title.toLowerCase().includes('frontend') ? 'Frontend' : 
      title.toLowerCase().includes('backend') ? 'Backend' : 'Full-Stack',
      'Remote möglich',
      'Wettbewerbsfähiges Gehalt',
      'Moderne Tools'
    ];
    
    updateFormData({ metaTags });
    setIsGeneratingMeta(false);
  };

  const employmentTypes = [
    { value: 'full-time', label: 'Vollzeit' },
    { value: 'part-time', label: 'Teilzeit' },
    { value: 'contract', label: 'Freiberuflich' },
    { value: 'internship', label: 'Praktikum' },
    { value: 'temporary', label: 'Zeitarbeit' }
  ];

  const workModels = [
    { value: 'office', label: 'Vor Ort', icon: '🏢' },
    { value: 'remote', label: 'Remote', icon: '🏠' },
    { value: 'hybrid', label: 'Hybrid', icon: '🔄' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <Building2 className="h-12 w-12 text-namuh-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-namuh-navy mb-2">Grundinformationen</h2>
        <p className="text-gray-600">Definieren Sie die Eckdaten Ihrer Stellenausschreibung</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stellentitel *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="input-field"
                placeholder="z.B. Senior Frontend Developer"
                required
              />
              {isGeneratingMeta && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-namuh-teal" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 KI generiert automatisch Meta-Tags basierend auf dem Titel
            </p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unternehmensname *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => updateFormData({ companyName: e.target.value })}
              className="input-field"
              placeholder="Ihr Unternehmensname"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Standort *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData({ location: e.target.value })}
                className="input-field pl-10"
                placeholder="z.B. Berlin, Deutschland"
                required
              />
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Anstellungsart *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {employmentTypes.map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => updateFormData({ employmentType: type.value })}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.employmentType === type.value
                      ? 'border-namuh-teal bg-namuh-teal/5 text-namuh-teal'
                      : 'border-gray-200 hover:border-namuh-teal/50'
                  }`}
                >
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Work Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Arbeitsmodell *
            </label>
            <div className="space-y-3">
              {workModels.map((model) => (
                <motion.button
                  key={model.value}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => updateFormData({ workModel: model.value })}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                    formData.workModel === model.value
                      ? 'border-namuh-teal bg-namuh-teal/5 text-namuh-teal'
                      : 'border-gray-200 hover:border-namuh-teal/50'
                  }`}
                >
                  <span className="text-2xl">{model.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{model.label}</div>
                    <div className="text-sm text-gray-500">
                      {model.value === 'office' && 'Tägliche Anwesenheit im Büro'}
                      {model.value === 'remote' && 'Vollständig von zu Hause'}
                      {model.value === 'hybrid' && 'Flexible Kombination'}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="leadership"
                checked={formData.isLeadershipRole}
                onChange={(e) => updateFormData({ isLeadershipRole: e.target.checked })}
                className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
              />
              <label htmlFor="leadership" className="ml-2 text-sm text-gray-700">
                Führungsposition
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remote"
                checked={formData.remoteAllowed}
                onChange={(e) => updateFormData({ remoteAllowed: e.target.checked })}
                className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
              />
              <label htmlFor="remote" className="ml-2 text-sm text-gray-700">
                Remote-Arbeit möglich
              </label>
            </div>
          </div>

          {/* Auto-generated Meta Tags */}
          {formData.metaTags && formData.metaTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-namuh-teal/5 to-namuh-navy/5 rounded-lg p-4 border border-namuh-teal/20"
            >
              <div className="flex items-center mb-3">
                <Sparkles className="h-5 w-5 text-namuh-teal mr-2" />
                <h4 className="font-medium text-namuh-navy">KI-generierte Meta-Tags</h4>
                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.metaTags.map((tag: string, index: number) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-namuh-teal/10 text-namuh-teal px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* AI Suggestions Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 rounded-lg p-6 border border-blue-200"
      >
        <div className="flex items-center mb-4">
          <Sparkles className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-blue-900">KI-Empfehlungen</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">✨ Titel-Optimierung</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Verwenden Sie spezifische Senioritätslevel</li>
              <li>• Technologie-Stack erwähnen</li>
              <li>• Standort für lokale SEO hinzufügen</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">🎯 Best Practices</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• 60% mehr Bewerbungen bei Remote-Option</li>
              <li>• Hybrid-Modell ist am beliebtesten</li>
              <li>• Führungspositionen brauchen mehr Details</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BasicInfoStep;