import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Eye, 
  EyeOff,
  TrendingUp,
  Calculator,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SalaryStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  autoSaving: boolean;
}

const SalaryStep: React.FC<SalaryStepProps> = ({ formData, updateFormData, autoSaving }) => {
  const [showBenchmarks, setShowBenchmarks] = useState(false);

  // Salary benchmarks based on role and location
  const salaryBenchmarks = useMemo(() => {
    const baseSalaries: Record<string, { min: number; max: number; median: number }> = {
      'frontend': { min: 45000, max: 85000, median: 65000 },
      'backend': { min: 50000, max: 90000, median: 70000 },
      'fullstack': { min: 55000, max: 95000, median: 75000 },
      'designer': { min: 40000, max: 75000, median: 57500 },
      'product': { min: 60000, max: 120000, median: 90000 },
      'devops': { min: 55000, max: 100000, median: 77500 }
    };

    const title = formData.title?.toLowerCase() || '';
    let benchmark = baseSalaries['frontend']; // default

    Object.keys(baseSalaries).forEach(key => {
      if (title.includes(key)) {
        benchmark = baseSalaries[key];
      }
    });

    // Location adjustment
    const locationMultiplier = formData.location?.toLowerCase().includes('münchen') ? 1.1 :
                              formData.location?.toLowerCase().includes('hamburg') ? 1.05 :
                              formData.location?.toLowerCase().includes('berlin') ? 1.0 : 0.95;

    return {
      min: Math.round(benchmark.min * locationMultiplier),
      max: Math.round(benchmark.max * locationMultiplier),
      median: Math.round(benchmark.median * locationMultiplier)
    };
  }, [formData.title, formData.location]);

  const currencies = [
    { value: 'EUR', label: '€ Euro', symbol: '€' },
    { value: 'USD', label: '$ Dollar', symbol: '$' },
    { value: 'GBP', label: '£ Pfund', symbol: '£' }
  ];

  const additionalBenefits = [
    { key: 'bonus', label: 'Leistungsbonus möglich', icon: '🎯' },
    { key: 'equity', label: 'Firmenanteile/Aktien', icon: '📈' },
    { key: 'car', label: 'Firmenwagen', icon: '🚗' },
    { key: 'pension', label: 'Betriebsrente', icon: '💰' }
  ];

  const validateSalaryRange = () => {
    if (formData.salaryMax < formData.salaryMin) {
      updateFormData({ salaryMax: formData.salaryMin });
    }
  };

  const applySalaryBenchmark = (type: 'min' | 'max' | 'median') => {
    const value = salaryBenchmarks[type];
    if (type === 'min') {
      updateFormData({ salaryMin: value });
    } else if (type === 'max') {
      updateFormData({ salaryMax: value });
    } else {
      updateFormData({ 
        salaryMin: value - 10000,
        salaryMax: value + 10000
      });
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
        <DollarSign className="h-12 w-12 text-namuh-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-namuh-navy mb-2">Vergütung & Konditionen</h2>
        <p className="text-gray-600">Transparente Gehaltsangaben steigern die Bewerbungsqualität</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Salary Configuration - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Währung
            </label>
            <div className="grid grid-cols-3 gap-3">
              {currencies.map((currency) => (
                <motion.button
                  key={currency.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => updateFormData({ currency: currency.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.currency === currency.value
                      ? 'border-namuh-teal bg-namuh-teal/5 text-namuh-teal'
                      : 'border-gray-200 hover:border-namuh-teal/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{currency.symbol}</div>
                    <div className="text-xs font-medium">{currency.label}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mindestgehalt *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencies.find(c => c.value === formData.currency)?.symbol || '€'}
                </span>
                <input
                  type="number"
                  value={formData.salaryMin || ''}
                  onChange={(e) => updateFormData({ salaryMin: parseInt(e.target.value) || 0 })}
                  onBlur={validateSalaryRange}
                  className="input-field pl-8"
                  placeholder="45000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximalgehalt *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currencies.find(c => c.value === formData.currency)?.symbol || '€'}
                </span>
                <input
                  type="number"
                  value={formData.salaryMax || ''}
                  onChange={(e) => updateFormData({ salaryMax: parseInt(e.target.value) || 0 })}
                  onBlur={validateSalaryRange}
                  className="input-field pl-8"
                  placeholder="85000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Salary Transparency */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {formData.salaryTransparency ? (
                  <Eye className="h-5 w-5 text-blue-600 mr-3" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-500 mr-3" />
                )}
                <h3 className="font-semibold text-blue-900">Gehaltstransparenz</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => updateFormData({ salaryTransparency: !formData.salaryTransparency })}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  formData.salaryTransparency
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {formData.salaryTransparency ? 'Aktiviert' : 'Deaktiviert'}
              </motion.button>
            </div>
            
            <p className="text-blue-800 text-sm mb-4">
              {formData.salaryTransparency 
                ? 'Das Gehalt wird öffentlich in der Stellenausschreibung angezeigt.'
                : 'Das Gehalt wird nicht öffentlich angezeigt, nur intern gespeichert.'
              }
            </p>
            
            <div className="bg-blue-100 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Info className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900 text-sm">Warum Transparenz?</span>
              </div>
              <ul className="text-blue-800 text-xs space-y-1">
                <li>• 73% mehr qualifizierte Bewerbungen</li>
                <li>• Reduziert Verhandlungsaufwand</li>
                <li>• Zeigt faire Unternehmenskultur</li>
                <li>• Entspricht modernen Erwartungen</li>
              </ul>
            </div>
          </div>

          {/* Additional Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Zusätzliche finanzielle Leistungen
            </label>
            <div className="grid grid-cols-2 gap-3">
              {additionalBenefits.map((benefit) => (
                <motion.button
                  key={benefit.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    const current = formData.additionalBenefits || [];
                    const updated = current.includes(benefit.key)
                      ? current.filter((b: string) => b !== benefit.key)
                      : [...current, benefit.key];
                    updateFormData({ additionalBenefits: updated });
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    formData.additionalBenefits?.includes(benefit.key)
                      ? 'border-namuh-teal bg-namuh-teal/5 text-namuh-teal'
                      : 'border-gray-200 hover:border-namuh-teal/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{benefit.icon}</span>
                    <span className="text-sm font-medium">{benefit.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Insights Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Market Benchmarks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-namuh-teal/10 to-namuh-navy/10 rounded-lg p-6 border border-namuh-teal/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-namuh-navy">Markt-Benchmark</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBenchmarks(!showBenchmarks)}
                className="text-namuh-teal hover:text-namuh-teal-dark"
              >
                <Calculator className="h-5 w-5" />
              </motion.button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Markt-Minimum:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">€{salaryBenchmarks.min.toLocaleString()}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => applySalaryBenchmark('min')}
                    className="text-xs text-namuh-teal hover:text-namuh-teal-dark"
                  >
                    Übernehmen
                  </motion.button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Median:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">€{salaryBenchmarks.median.toLocaleString()}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => applySalaryBenchmark('median')}
                    className="text-xs text-namuh-teal hover:text-namuh-teal-dark"
                  >
                    Übernehmen
                  </motion.button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Markt-Maximum:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">€{salaryBenchmarks.max.toLocaleString()}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => applySalaryBenchmark('max')}
                    className="text-xs text-namuh-teal hover:text-namuh-teal-dark"
                  >
                    Übernehmen
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Your Position vs Market */}
            {formData.salaryMin && formData.salaryMax && (
              <div className="mt-4 pt-4 border-t border-namuh-teal/20">
                <div className="text-sm text-gray-600 mb-2">Ihre Position im Markt:</div>
                <div className="w-full bg-gray-200 rounded-full h-3 relative">
                  <div 
                    className="bg-namuh-teal h-3 rounded-full"
                    style={{ 
                      width: `${Math.min(100, ((formData.salaryMin + formData.salaryMax) / 2 / salaryBenchmarks.max) * 100)}%` 
                    }}
                  />
                  <div className="absolute top-0 left-0 w-full h-3 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {Math.round(((formData.salaryMin + formData.salaryMax) / 2 / salaryBenchmarks.max) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Salary Impact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 rounded-lg p-6 border border-green-200"
          >
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">Gehalt-Impact</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Bewerbungsrate:</span>
                <span className="font-medium text-green-800">
                  {formData.salaryTransparency ? '+73%' : 'Standard'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Qualität:</span>
                <span className="font-medium text-green-800">
                  {formData.salaryMin >= salaryBenchmarks.median ? 'Hoch' : 'Mittel'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Konkurrenzfähigkeit:</span>
                <span className="font-medium text-green-800">
                  {formData.salaryMax >= salaryBenchmarks.max * 0.8 ? 'Sehr gut' : 'Gut'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Salary Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-yellow-50 rounded-lg p-6 border border-yellow-200"
          >
            <h3 className="font-semibold text-yellow-900 mb-4">💡 Gehalts-Tipps</h3>
            <div className="space-y-3 text-sm text-yellow-800">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Transparenz erhöht Bewerbungsqualität signifikant</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Gehaltsspannen von max. 30% sind optimal</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Zusatzleistungen können Gehalt kompensieren</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Marktgerechte Gehälter reduzieren Fluktuation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SalaryStep;