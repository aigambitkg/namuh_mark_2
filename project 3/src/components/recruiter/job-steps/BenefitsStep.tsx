import React, { useState } from 'react';
import { 
  Gift, 
  Plus, 
  X, 
  Sparkles,
  Heart,
  DollarSign,
  Clock,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BenefitsStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  autoSaving: boolean;
}

const BenefitsStep: React.FC<BenefitsStepProps> = ({ formData, updateFormData, autoSaving }) => {
  const [newBenefit, setNewBenefit] = useState('');

  const benefitCategories = [
    {
      title: 'Arbeitszeit & Flexibilität',
      icon: Clock,
      color: 'bg-blue-500',
      benefits: [
        'Flexible Arbeitszeiten',
        'Home-Office Möglichkeit',
        'Gleitzeit',
        '4-Tage-Woche Option',
        'Sabbatical Möglichkeit'
      ]
    },
    {
      title: 'Gesundheit & Wellness',
      icon: Heart,
      color: 'bg-green-500',
      benefits: [
        'Betriebliche Krankenversicherung',
        'Fitness-Studio Mitgliedschaft',
        'Gesundheitschecks',
        'Mental Health Support',
        'Ergonomischer Arbeitsplatz'
      ]
    },
    {
      title: 'Finanzielles & Zusatzleistungen',
      icon: DollarSign,
      color: 'bg-yellow-500',
      benefits: [
        'Betriebliche Altersvorsorge',
        'Firmenwagen oder Mobilitätsbudget',
        'Essenszuschuss',
        'Kinderbetreuung',
        'Mitarbeiterrabatte'
      ]
    },
    {
      title: 'Entwicklung & Ausstattung',
      icon: Laptop,
      color: 'bg-purple-500',
      benefits: [
        'Weiterbildungsbudget',
        'Konferenzbesuche',
        'Moderne Hardware',
        'Mentoring Programme',
        'Interne Schulungen'
      ]
    }
  ];

  const addBenefit = () => {
    if (newBenefit.trim()) {
      const updated = [...(formData.benefits || []), newBenefit.trim()];
      updateFormData({ benefits: updated });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    const updated = formData.benefits.filter((_: any, i: number) => i !== index);
    updateFormData({ benefits: updated });
  };

  const addPredefinedBenefit = (benefit: string) => {
    if (!formData.benefits?.includes(benefit)) {
      const updated = [...(formData.benefits || []), benefit];
      updateFormData({ benefits: updated });
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
        <Gift className="h-12 w-12 text-namuh-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-namuh-navy mb-2">Benefits & Zusatzleistungen</h2>
        <p className="text-gray-600">Zeigen Sie, was Ihr Unternehmen besonders macht</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Current Benefits - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Ausgewählte Benefits *
            </label>
            
            <div className="space-y-3 mb-6">
              <AnimatePresence>
                {formData.benefits?.map((benefit: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-namuh-teal/5 to-namuh-navy/5 rounded-lg border border-namuh-teal/20"
                  >
                    <Gift className="h-5 w-5 text-namuh-teal flex-shrink-0" />
                    <span className="flex-1 font-medium">{benefit}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Custom Benefit */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Eigenen Benefit hinzufügen..."
                className="flex-1 input-field"
                onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addBenefit}
                className="btn-outline px-4 py-2"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Predefined Benefits by Category */}
          <div className="space-y-6">
            {benefitCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="bg-white rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <div className={`${category.color} p-2 rounded-lg mr-3`}>
                    <category.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-namuh-navy">{category.title}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.benefits.map((benefit, benefitIndex) => (
                    <motion.button
                      key={benefit}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => addPredefinedBenefit(benefit)}
                      disabled={formData.benefits?.includes(benefit)}
                      className={`p-3 rounded-lg border-2 transition-all text-left text-sm ${
                        formData.benefits?.includes(benefit)
                          ? 'border-namuh-teal bg-namuh-teal/10 text-namuh-teal cursor-not-allowed'
                          : 'border-gray-200 hover:border-namuh-teal/50 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{benefit}</span>
                        {formData.benefits?.includes(benefit) && (
                          <span className="text-namuh-teal text-xs">✓</span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Analytics Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Benefits Impact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200"
          >
            <div className="flex items-center mb-4">
              <Sparkles className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">Benefits Impact</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700">Attraktivität</span>
                  <span className="text-sm font-medium text-green-800">
                    {Math.min(100, (formData.benefits?.length || 0) * 15)}%
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (formData.benefits?.length || 0) * 15)}%` }}
                  />
                </div>
              </div>
              
              <div className="text-xs text-green-700 space-y-1">
                <p>• {formData.benefits?.length || 0} von 10+ empfohlenen Benefits</p>
                <p>• Erhöht Bewerbungsrate um {Math.min(45, (formData.benefits?.length || 0) * 7)}%</p>
                <p>• Reduziert Fluktuation um {Math.min(30, (formData.benefits?.length || 0) * 5)}%</p>
              </div>
            </div>
          </motion.div>

          {/* Top Benefits in Industry */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 rounded-lg p-6 border border-blue-200"
          >
            <h3 className="font-semibold text-blue-900 mb-4">🏆 Top Benefits 2024</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Home-Office</span>
                <span className="font-medium text-blue-800">89%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Flexible Zeiten</span>
                <span className="font-medium text-blue-800">84%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Weiterbildung</span>
                <span className="font-medium text-blue-800">76%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Gesundheit</span>
                <span className="font-medium text-blue-800">71%</span>
              </div>
            </div>
          </motion.div>

          {/* Benefits Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-yellow-50 rounded-lg p-6 border border-yellow-200"
          >
            <h3 className="font-semibold text-yellow-900 mb-4">💡 Empfehlungen</h3>
            <div className="space-y-3 text-sm text-yellow-800">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Mind. 5 Benefits für optimale Wirkung</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Mischen Sie verschiedene Kategorien</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Moderne Benefits bevorzugen</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Work-Life-Balance betonen</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BenefitsStep;