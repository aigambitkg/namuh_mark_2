import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  X, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Download,
  Upload,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApplicationProcessStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  autoSaving: boolean;
}

const ApplicationProcessStep: React.FC<ApplicationProcessStepProps> = ({ formData, updateFormData, autoSaving }) => {
  const [newPhase, setNewPhase] = useState('');
  const [newDocument, setNewDocument] = useState('');

  // Predefined application phases templates
  const phaseTemplates = [
    {
      name: 'Standard-Prozess',
      phases: ['Bewerbung eingegangen', 'Prüfung der Unterlagen', 'Erstes Gespräch', 'Zweites Gespräch', 'Entscheidung'],
      description: 'Klassischer 5-stufiger Bewerbungsprozess'
    },
    {
      name: 'Tech-Unternehmen',
      phases: ['Bewerbung eingegangen', 'Screening', 'Technische Aufgabe', 'Technisches Interview', 'Kulturelles Interview', 'Entscheidung'],
      description: 'Prozess mit technischer Challenge für IT-Positionen'
    },
    {
      name: 'Startup-Stil',
      phases: ['Bewerbung eingegangen', 'Kurzes Telefonat', 'Persönliches Gespräch', 'Probearbeitstag', 'Entscheidung'],
      description: 'Schneller, direkter Prozess mit Probearbeit'
    },
    {
      name: 'Führungsposition',
      phases: ['Bewerbung eingegangen', 'Prüfung der Unterlagen', 'HR-Interview', 'Fachliches Interview', 'Assessment Center', 'Finale Runde', 'Entscheidung'],
      description: 'Umfassender Prozess für Führungskräfte'
    }
  ];

  // Common required documents
  const documentOptions = [
    'Lebenslauf',
    'Anschreiben',
    'Zeugnisse',
    'Zertifikate',
    'Portfolio',
    'Arbeitsproben',
    'Referenzen',
    'Gehaltsnachweis',
    'Führungszeugnis'
  ];

  const addPhase = () => {
    if (newPhase.trim()) {
      const updated = [...(formData.applicationPhases || []), newPhase.trim()];
      updateFormData({ applicationPhases: updated });
      setNewPhase('');
    }
  };

  const removePhase = (index: number) => {
    const updated = formData.applicationPhases.filter((_: any, i: number) => i !== index);
    updateFormData({ applicationPhases: updated });
  };

  const movePhase = (index: number, direction: 'up' | 'down') => {
    const phases = [...formData.applicationPhases];
    if (direction === 'up' && index > 0) {
      [phases[index], phases[index - 1]] = [phases[index - 1], phases[index]];
    } else if (direction === 'down' && index < phases.length - 1) {
      [phases[index], phases[index + 1]] = [phases[index + 1], phases[index]];
    }
    updateFormData({ applicationPhases: phases });
  };

  const addDocument = () => {
    if (newDocument.trim()) {
      const updated = [...(formData.requiredDocuments || []), newDocument.trim()];
      updateFormData({ requiredDocuments: updated });
      setNewDocument('');
    }
  };

  const removeDocument = (index: number) => {
    const updated = formData.requiredDocuments.filter((_: any, i: number) => i !== index);
    updateFormData({ requiredDocuments: updated });
  };

  const applyTemplate = (template: any) => {
    updateFormData({ applicationPhases: [...template.phases] });
  };

  const toggleDocument = (document: string) => {
    const current = formData.requiredDocuments || [];
    const updated = current.includes(document)
      ? current.filter((doc: string) => doc !== document)
      : [...current, document];
    updateFormData({ requiredDocuments: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <FileText className="h-12 w-12 text-namuh-teal mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-namuh-navy mb-2">Bewerbungsprozess</h2>
        <p className="text-gray-600">Definieren Sie transparente Bewerbungsphasen und erforderliche Dokumente</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Application Phases - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phase Templates */}
          <div>
            <h3 className="text-lg font-semibold text-namuh-navy mb-4">Prozess-Vorlagen</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {phaseTemplates.map((template, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="card p-4 cursor-pointer"
                  onClick={() => applyTemplate(template)}
                >
                  <h4 className="font-semibold text-namuh-navy mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="text-xs text-gray-500">
                    {template.phases.length} Phasen
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current Application Phases */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-namuh-navy">Bewerbungsphasen *</h3>
              <span className="text-sm text-gray-500">
                {formData.applicationPhases?.length || 0} Phasen definiert
              </span>
            </div>

            {/* Phases List */}
            <div className="space-y-3 mb-4">
              <AnimatePresence>
                {formData.applicationPhases?.map((phase: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-namuh-teal/5 to-namuh-navy/5 rounded-lg border border-namuh-teal/20"
                  >
                    <div className="flex items-center space-x-2 text-namuh-teal">
                      <div className="w-6 h-6 bg-namuh-teal text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      {index < formData.applicationPhases.length - 1 && (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </div>
                    <span className="flex-1 font-medium">{phase}</span>
                    <div className="flex items-center space-x-1">
                      {index > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => movePhase(index, 'up')}
                          className="p-1 text-gray-500 hover:text-namuh-teal"
                          title="Nach oben"
                        >
                          ↑
                        </motion.button>
                      )}
                      {index < formData.applicationPhases.length - 1 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => movePhase(index, 'down')}
                          className="p-1 text-gray-500 hover:text-namuh-teal"
                          title="Nach unten"
                        >
                          ↓
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removePhase(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add New Phase */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newPhase}
                onChange={(e) => setNewPhase(e.target.value)}
                placeholder="Neue Phase hinzufügen..."
                className="flex-1 input-field"
                onKeyPress={(e) => e.key === 'Enter' && addPhase()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addPhase}
                className="btn-outline px-4 py-2"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h3 className="text-lg font-semibold text-namuh-navy mb-4">Erforderliche Bewerbungsunterlagen *</h3>
            
            {/* Common Documents */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Häufige Dokumente:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {documentOptions.map((document) => (
                  <motion.button
                    key={document}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => toggleDocument(document)}
                    className={`p-3 rounded-lg border-2 transition-all text-left text-sm ${
                      formData.requiredDocuments?.includes(document)
                        ? 'border-namuh-teal bg-namuh-teal/10 text-namuh-teal'
                        : 'border-gray-200 hover:border-namuh-teal/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{document}</span>
                      {formData.requiredDocuments?.includes(document) && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Selected Documents */}
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700">Ausgewählte Dokumente:</h4>
              <AnimatePresence>
                {formData.requiredDocuments?.map((document: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="h-4 w-4 text-namuh-teal" />
                    <span className="flex-1 text-sm font-medium">{document}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Custom Document */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                placeholder="Zusätzliches Dokument hinzufügen..."
                className="flex-1 input-field"
                onKeyPress={(e) => e.key === 'Enter' && addDocument()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={addDocument}
                className="btn-outline px-4 py-2"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Application Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-namuh-navy mb-4">Bewerbungshinweise</h3>
            <textarea
              value={formData.applicationInstructions}
              onChange={(e) => updateFormData({ applicationInstructions: e.target.value })}
              rows={4}
              className="input-field resize-none"
              placeholder="Besondere Hinweise für Bewerbende (z.B. gewünschte Dateiformate, spezielle Anforderungen...)"
            />
          </div>

          {/* Application Deadline */}
          <div>
            <h3 className="text-lg font-semibold text-namuh-navy mb-4">Bewerbungsfrist (optional)</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="date"
                  value={formData.applicationDeadline ? formData.applicationDeadline.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormData({ 
                    applicationDeadline: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="input-field"
                />
              </div>
              {formData.applicationDeadline && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => updateFormData({ applicationDeadline: undefined })}
                  className="btn-outline px-4 py-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Entfernen
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Process Overview Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Process Timeline Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-namuh-teal/10 to-namuh-navy/10 rounded-lg p-6 border border-namuh-teal/20"
          >
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-namuh-teal mr-2" />
              <h3 className="font-semibold text-namuh-navy">Prozess-Vorschau</h3>
            </div>
            
            <div className="space-y-3">
              {formData.applicationPhases?.map((phase: string, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-namuh-teal text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700">{phase}</span>
                </div>
              ))}
            </div>
            
            {formData.applicationDeadline && (
              <div className="mt-4 pt-4 border-t border-namuh-teal/20">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Bewerbungsfrist: {formData.applicationDeadline.toLocaleDateString('de-DE')}
                </div>
              </div>
            )}
          </motion.div>

          {/* Best Practices */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 rounded-lg p-6 border border-blue-200"
          >
            <div className="flex items-center mb-4">
              <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">Best Practices</h3>
            </div>
            
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>4-6 Phasen sind optimal für die meisten Positionen</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Transparenz schafft Vertrauen bei Bewerbenden</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Klare Zeitangaben reduzieren Nachfragen</span>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Nur notwendige Dokumente anfordern</span>
              </div>
            </div>
          </motion.div>

          {/* Impact Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-50 rounded-lg p-6 border border-green-200"
          >
            <h3 className="font-semibold text-green-900 mb-4">📊 Transparenz-Impact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Bewerbungsqualität:</span>
                <span className="font-medium text-green-800">+35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Completion Rate:</span>
                <span className="font-medium text-green-800">+28%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Kandidaten-Zufriedenheit:</span>
                <span className="font-medium text-green-800">+42%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Time-to-hire:</span>
                <span className="font-medium text-green-800">-15%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ApplicationProcessStep;