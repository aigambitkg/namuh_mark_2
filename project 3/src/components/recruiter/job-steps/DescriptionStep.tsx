import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  Loader2, 
  Plus, 
  X,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DescriptionStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  autoSaving: boolean;
}

const DescriptionStep: React.FC<DescriptionStepProps> = ({ formData, updateFormData, autoSaving }) => {
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [contentType, setContentType] = useState<'description' | 'responsibilities' | null>(null);
  const [newResponsibility, setNewResponsibility] = useState('');

  // AI Content generation
  const generateContent = async (type: 'description' | 'responsibilities') => {
    setIsGeneratingContent(true);
    setContentType(type);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (type === 'description') {
      const aiDescription = `Werden Sie Teil unseres innovativen Teams als ${formData.title} bei ${formData.companyName}. In dieser spannenden Position arbeiten Sie an der Entwicklung zukunftsweisender Lösungen und tragen maßgeblich zum Erfolg unseres Unternehmens bei. Wir bieten Ihnen ein dynamisches Arbeitsumfeld mit modernen Technologien und exzellenten Entwicklungsmöglichkeiten.`;
      updateFormData({ description: aiDescription });
    } else {
      const aiResponsibilities = [
        'Entwicklung und Implementierung innovativer Softwarelösungen',
        'Zusammenarbeit mit interdisziplinären Teams zur Projektumsetzung',
        'Code-Reviews und Qualitätssicherung von Entwicklungsprojekten',
        'Mentoring von Junior-Entwicklern und Wissenstransfer',
        'Kontinuierliche Verbesserung der Entwicklungsprozesse'
      ];
      updateFormData({ responsibilities: aiResponsibilities });
    }
    
    setIsGeneratingContent(false);
    setContentType(null);
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      const updated = [...(formData.responsibilities || []), newResponsibility.trim()];
      updateFormData({ responsibilities: updated });
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    const updated = formData.responsibilities.filter((_: any, i: number) => i !== index);
    updateFormData({ responsibilities: updated });
  };

  // Content quality analysis
  const contentAnalysis = useMemo(() => {
    const description = formData.description || '';
    const wordCount = description.split(' ').filter(word => word.length > 0).length;
    
    return {
      wordCount,
      isOptimalLength: wordCount >= 100 && wordCount <= 300,
      hasKeywords: description.toLowerCase().includes(formData.title?.toLowerCase() || ''),
      readabilityScore: Math.min(100, Math.max(0, 100 - (wordCount * 0.1)))
    };
  }, [formData.description, formData.title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <FileText className="h-12 w-12 text-namuh-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-namuh-navy mb-2">Stellenbeschreibung</h2>
        <p className="text-gray-600">Erstellen Sie überzeugende Inhalte mit KI-Unterstützung</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Stellenbeschreibung *
              </label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => generateContent('description')}
                disabled={isGeneratingContent}
                className="btn-outline text-xs py-1 px-3 flex items-center space-x-2"
              >
                {isGeneratingContent && contentType === 'description' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>KI generieren</span>
              </motion.button>
            </div>
            
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={6}
              className="input-field resize-none"
              placeholder="Beschreiben Sie die Position, das Arbeitsumfeld und was den Kandidaten erwartet..."
              required
            />
            
            {/* Content Analysis */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4">
                <span className={contentAnalysis.wordCount < 100 ? 'text-red-600' : 'text-green-600'}>
                  {contentAnalysis.wordCount} Wörter
                </span>
                <span className={contentAnalysis.isOptimalLength ? 'text-green-600' : 'text-yellow-600'}>
                  {contentAnalysis.isOptimalLength ? '✓ Optimale Länge' : '⚠ 100-300 Wörter empfohlen'}
                </span>
              </div>
              <span className="text-gray-500">
                SEO Score: {Math.round(contentAnalysis.readabilityScore)}%
              </span>
            </div>
          </div>

          {/* Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Aufgaben & Verantwortungen *
              </label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => generateContent('responsibilities')}
                disabled={isGeneratingContent}
                className="btn-outline text-xs py-1 px-3 flex items-center space-x-2"
              >
                {isGeneratingContent && contentType === 'responsibilities' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>KI vorschlagen</span>
              </motion.button>
            </div>

            {/* Responsibilities List */}
            <div className="space-y-3 mb-4">
              <AnimatePresence>
                {formData.responsibilities?.map((responsibility: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-namuh-teal rounded-full flex-shrink-0" />
                    <span className="flex-1 text-sm">{responsibility}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add New Responsibility */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                placeholder="Neue Aufgabe hinzufügen..."
                className="flex-1 input-field"
                onKeyPress={(e) => e.key === 'Enter' && addResponsibility()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addResponsibility}
                className="btn-outline px-4 py-2"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Content Quality Score */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-namuh-teal/10 to-namuh-navy/10 rounded-lg p-6 border border-namuh-teal/20"
          >
            <div className="flex items-center mb-4">
              <Target className="h-5 w-5 text-namuh-teal mr-2" />
              <h3 className="font-semibold text-namuh-navy">Content Quality</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wortanzahl</span>
                <span className={`text-sm font-medium ${
                  contentAnalysis.isOptimalLength ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {contentAnalysis.wordCount}/300
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    contentAnalysis.isOptimalLength ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(100, (contentAnalysis.wordCount / 300) * 100)}%` }}
                />
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center">
                  {contentAnalysis.hasKeywords ? (
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <X className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span>Jobtitel erwähnt</span>
                </div>
                <div className="flex items-center">
                  {formData.responsibilities?.length >= 3 ? (
                    <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <X className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span>Min. 3 Aufgaben</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Writing Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 rounded-lg p-6 border border-blue-200"
          >
            <div className="flex items-center mb-4">
              <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">Schreibtipps</h3>
            </div>
            
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Verwenden Sie aktive Sprache und konkrete Verben</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Erwähnen Sie Unternehmenskultur und Werte</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Betonen Sie Wachstums- und Lernmöglichkeiten</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Verwenden Sie inklusive und diverse Sprache</span>
              </div>
            </div>
          </motion.div>

          {/* Industry Benchmarks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-50 rounded-lg p-6 border border-green-200"
          >
            <h3 className="font-semibold text-green-900 mb-4">📊 Branchenstandards</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Ø Beschreibung:</span>
                <span className="font-medium text-green-800">180 Wörter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Ø Aufgaben:</span>
                <span className="font-medium text-green-800">5-7 Punkte</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Lesezeit:</span>
                <span className="font-medium text-green-800">45-60 Sek.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DescriptionStep;