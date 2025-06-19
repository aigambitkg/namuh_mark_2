import React, { useState } from 'react';
import { 
  Globe,
  Plus,
  Check,
  Settings,
  Eye,
  Calendar,
  DollarSign,
  Zap,
  Image as ImageIcon,
  Target,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Platform {
  id: string;
  name: string;
  logo: string;
  audience: string;
  reach: string;
  cost: string;
  successChance: number;
  features: string[];
  isSelected: boolean;
}

export const Multiposting: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedJob, setSelectedJob] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: 'xing',
      name: 'XING Jobs',
      logo: '🔗',
      audience: 'DACH Professionals',
      reach: '19M+ Mitglieder',
      cost: '€89',
      successChance: 85,
      features: ['Premium Placement', 'Company Branding', 'Analytics'],
      isSelected: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Jobs',
      logo: '💼',
      audience: 'Global Professionals',
      reach: '900M+ Mitglieder',
      cost: '€120',
      successChance: 78,
      features: ['Sponsored Promotion', 'Talent Insights', 'Smart Targeting'],
      isSelected: false
    },
    {
      id: 'stepstone',
      name: 'StepStone',
      logo: '📍',
      audience: 'German Job Seekers',
      reach: '6M+ monatlich',
      cost: '€150',
      successChance: 82,
      features: ['Featured Job', 'Logo Placement', 'Performance Analytics'],
      isSelected: false
    },
    {
      id: 'indeed',
      name: 'Indeed',
      logo: '🔍',
      audience: 'Global Audience',
      reach: '350M+ visitors',
      cost: '€75',
      successChance: 71,
      features: ['Sponsored Job', 'Company Page', 'Resume Database'],
      isSelected: false
    },
    {
      id: 'monster',
      name: 'Monster',
      logo: '👹',
      audience: 'Diverse Industries',
      reach: '2M+ monatlich',
      cost: '€95',
      successChance: 65,
      features: ['Job Branding', 'Resume Search', 'Employer Branding'],
      isSelected: false
    },
    {
      id: 'glassdoor',
      name: 'Glassdoor',
      logo: '🏢',
      audience: 'Company-Focused',
      reach: '59M+ monthly',
      cost: '€110',
      successChance: 73,
      features: ['Employer Brand', 'Reviews Integration', 'Salary Insights'],
      isSelected: false
    }
  ]);

  // Check if user has access to multiposting
  const hasAccess = user?.tier !== 'recruiter_basis';
  const isIncluded = user?.tier !== 'recruiter_basis'; // Free for all paid tiers
  const serviceFee = user?.tier === 'recruiter_basis' ? 49.99 : 0;

  const togglePlatform = (platformId: string) => {
    setPlatforms(platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, isSelected: !platform.isSelected }
        : platform
    ));
  };

  const selectedPlatforms = platforms.filter(p => p.isSelected);
  const totalCost = selectedPlatforms.reduce((sum, p) => sum + parseInt(p.cost.replace('€', '')), 0);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Globe className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-namuh-navy mb-4">Multiposting</h1>
            <p className="text-xl text-gray-600 mb-8">
              Diese Funktion ist für Basis-Nutzer kostenpflichtig verfügbar
            </p>
            <div className="card p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-namuh-navy mb-4">Pay-per-Use Service</h3>
              <p className="text-gray-600 mb-6">
                Nutzen Sie Multiposting für €49,99 pro Stellenausschreibung oder upgraden Sie 
                für kostenlosen Zugang.
              </p>
              <div className="space-y-3">
                <button className="btn-primary w-full">
                  Einmalig nutzen (€49,99)
                </button>
                <button className="btn-outline w-full">
                  Auf Starter Business upgraden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy mb-4">Multiposting</h1>
          <p className="text-xl text-gray-600 mb-6">
            Veröffentlichen Sie Ihre Stellenanzeige auf mehreren Plattformen gleichzeitig
          </p>
          
          {/* Service Fee Notice */}
          {serviceFee > 0 && (
            <div className="inline-flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Servicepauschale: €{serviceFee} pro Posting
              </span>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Stelle auswählen' },
              { step: 2, title: 'Plattformen wählen' },
              { step: 3, title: 'Design anpassen' },
              { step: 4, title: 'Veröffentlichen' }
            ].map((item) => (
              <div key={item.step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= item.step 
                    ? 'bg-namuh-teal text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > item.step ? <Check className="h-4 w-4" /> : item.step}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep >= item.step ? 'text-namuh-navy font-medium' : 'text-gray-500'
                }`}>
                  {item.title}
                </span>
                {item.step < 4 && (
                  <div className={`ml-8 w-16 h-0.5 ${
                    currentStep > item.step ? 'bg-namuh-teal' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Job Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-8 max-w-2xl mx-auto"
            >
              <h2 className="text-xl font-semibold text-namuh-navy mb-6">Stellenausschreibung auswählen</h2>
              
              <div className="space-y-4">
                {/* Existing Job Option */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-namuh-teal transition-colors">
                  <h3 className="font-medium text-namuh-navy mb-2">Vorhandene Stelle verwenden</h3>
                  <p className="text-gray-600 mb-4">Wählen Sie eine Ihrer aktiven namuH Stellenausschreibungen</p>
                  <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Stelle auswählen...</option>
                    <option value="frontend-dev">Senior Frontend Developer - Tech Solutions</option>
                    <option value="ux-designer">UX/UI Designer - Creative Minds</option>
                    <option value="product-manager">Product Manager - Innovate Hub</option>
                  </select>
                </div>

                {/* New Job Option */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-namuh-teal transition-colors">
                  <h3 className="font-medium text-namuh-navy mb-2">Neue Stellenausschreibung</h3>
                  <p className="text-gray-600 mb-4">Erstellen Sie eine neue Stelle nur für Multiposting</p>
                  <button className="btn-outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Stelle erstellen
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedJob}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter zu Plattformen
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Platform Selection */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Platform Selection */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold text-namuh-navy mb-6">Plattformen auswählen</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {platforms.map((platform, index) => (
                      <motion.div
                        key={platform.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`card p-6 cursor-pointer transition-all duration-200 ${
                          platform.isSelected 
                            ? 'border-namuh-teal bg-namuh-teal/5' 
                            : 'hover:border-namuh-teal/50'
                        }`}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{platform.logo}</div>
                            <div>
                              <h3 className="font-semibold text-namuh-navy">{platform.name}</h3>
                              <p className="text-sm text-gray-600">{platform.audience}</p>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            platform.isSelected 
                              ? 'border-namuh-teal bg-namuh-teal' 
                              : 'border-gray-300'
                          }`}>
                            {platform.isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Reichweite:</span>
                            <span className="font-medium">{platform.reach}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Kosten:</span>
                            <span className="font-medium text-green-600">{platform.cost}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Erfolgswahrscheinlichkeit:</span>
                            <span className="font-medium text-namuh-teal">{platform.successChance}%</span>
                          </div>

                          {/* Success Probability Bar */}
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-namuh-teal h-2 rounded-full transition-all duration-500"
                              style={{ width: `${platform.successChance}%` }}
                            />
                          </div>

                          {/* Features */}
                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-700 mb-2">Features:</p>
                            <div className="flex flex-wrap gap-1">
                              {platform.features.map((feature, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="card p-6 sticky top-8">
                    <h3 className="text-lg font-semibold text-namuh-navy mb-4">Zusammenfassung</h3>
                    
                    {selectedPlatforms.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Ausgewählte Plattformen:</p>
                          <div className="space-y-2">
                            {selectedPlatforms.map(platform => (
                              <div key={platform.id} className="flex justify-between text-sm">
                                <span>{platform.name}</span>
                                <span className="font-medium">{platform.cost}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <hr />

                        <div className="flex justify-between">
                          <span className="font-medium">Gesamtkosten:</span>
                          <span className="font-bold text-namuh-teal">€{totalCost}</span>
                        </div>

                        {serviceFee > 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Servicepauschale:</span>
                              <span>€{serviceFee}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Endpreis:</span>
                              <span className="text-namuh-navy">€{totalCost + serviceFee}</span>
                            </div>
                          </>
                        )}

                        <div className="pt-4">
                          <div className="text-sm text-gray-600 mb-2">Erwartete Reichweite:</div>
                          <div className="text-2xl font-bold text-namuh-teal">
                            {selectedPlatforms.length > 0 ? `${(selectedPlatforms.length * 2.5).toFixed(1)}M+` : '0'}
                          </div>
                          <div className="text-xs text-gray-500">potentielle Kandidaten</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Wählen Sie Plattformen aus, um eine Zusammenfassung zu sehen
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-outline"
                >
                  Zurück
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={selectedPlatforms.length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter zu Design
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Design Customization */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="card p-8">
                <h2 className="text-xl font-semibold text-namuh-navy mb-6">Design anpassen</h2>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Design Options */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anzeigentitel anpassen
                      </label>
                      <input
                        type="text"
                        defaultValue="Senior Frontend Developer - Join Our Team!"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kurzbeschreibung
                      </label>
                      <textarea
                        rows={3}
                        defaultValue="Wir suchen einen erfahrenen Frontend Developer für unser dynamisches Team..."
                        className="input-field resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Firmenlogo hochladen
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-namuh-teal transition-colors">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Logo hier ablegen oder klicken</p>
                        <button className="btn-outline">Datei auswählen</button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farbschema
                      </label>
                      <div className="flex space-x-3">
                        {[
                          { name: 'namuH Teal', color: 'bg-namuh-teal' },
                          { name: 'Professional Blue', color: 'bg-blue-600' },
                          { name: 'Creative Purple', color: 'bg-purple-600' },
                          { name: 'Corporate Gray', color: 'bg-gray-600' }
                        ].map((theme) => (
                          <button
                            key={theme.name}
                            className={`w-12 h-12 rounded-lg ${theme.color} hover:scale-105 transition-transform`}
                            title={theme.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <h3 className="text-lg font-medium text-namuh-navy mb-4">Vorschau</h3>
                    <div className="border border-gray-200 rounded-lg p-6 bg-white">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-namuh-teal rounded-lg flex items-center justify-center text-white font-bold">
                          TS
                        </div>
                        <div>
                          <h4 className="font-semibold">Tech Solutions Inc.</h4>
                          <p className="text-sm text-gray-600">Berlin, Deutschland</p>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-namuh-navy mb-2">
                        Senior Frontend Developer - Join Our Team!
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Wir suchen einen erfahrenen Frontend Developer für unser dynamisches Team...
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">React</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">TypeScript</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Remote</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600 font-medium">€70,000 - €90,000</span>
                        <button className="bg-namuh-teal text-white px-4 py-2 rounded text-sm">
                          Jetzt bewerben
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-outline"
                >
                  Zurück
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="btn-primary"
                >
                  Zur Veröffentlichung
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Publishing */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-8 max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-namuh-navy mb-4">Bereit zur Veröffentlichung</h2>
                <p className="text-gray-600">
                  Überprüfen Sie alle Details vor der finalen Veröffentlichung
                </p>
              </div>

              {/* Final Summary */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-namuh-navy mb-4">Stellendetails</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium">Senior Frontend Developer</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unternehmen:</span>
                      <span className="font-medium">Tech Solutions Inc.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standort:</span>
                      <span className="font-medium">Berlin, Deutschland</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gehalt:</span>
                      <span className="font-medium">€70,000 - €90,000</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-namuh-navy mb-4">Plattformen & Kosten</h3>
                  <div className="space-y-3 text-sm">
                    {selectedPlatforms.map(platform => (
                      <div key={platform.id} className="flex justify-between">
                        <span className="text-gray-600">{platform.name}:</span>
                        <span className="font-medium">{platform.cost}</span>
                      </div>
                    ))}
                    {serviceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Servicepauschale:</span>
                        <span className="font-medium">€{serviceFee}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-bold">
                      <span>Gesamtkosten:</span>
                      <span className="text-namuh-teal">€{totalCost + serviceFee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publishing Schedule */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-namuh-navy mb-4">Veröffentlichungsplan</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="radio" name="schedule" className="mr-3" defaultChecked />
                    <span>Sofort veröffentlichen</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="schedule" className="mr-3" />
                    <span>Geplante Veröffentlichung</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-outline"
                >
                  Zurück
                </button>
                <button className="btn-primary flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Jetzt veröffentlichen (€{totalCost + serviceFee})</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};