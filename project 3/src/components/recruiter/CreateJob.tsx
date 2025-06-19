import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  AlertTriangle,
  Sparkles,
  Eye,
  Save,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// Lazy load heavy components for better initial load time
const BasicInfoStep = lazy(() => import('./job-steps/BasicInfoStep'));
const DescriptionStep = lazy(() => import('./job-steps/DescriptionStep'));
const RequirementsStep = lazy(() => import('./job-steps/RequirementsStep'));
const ApplicationProcessStep = lazy(() => import('./job-steps/ApplicationProcessStep'));
const BenefitsStep = lazy(() => import('./job-steps/BenefitsStep'));
const SalaryStep = lazy(() => import('./job-steps/SalaryStep'));
const InternalDataStep = lazy(() => import('./job-steps/InternalDataStep'));
const AGGComplianceStep = lazy(() => import('./job-steps/AGGComplianceStep'));
const PreviewStep = lazy(() => import('./job-steps/PreviewStep'));

// Loading fallback component
const StepLoader = React.memo(() => (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-namuh-teal" />
      <p className="text-gray-600 text-sm">Schritt wird geladen...</p>
    </div>
  </div>
));

// Optimized step configuration
const STEPS = [
  { id: 1, title: 'Grundinfo', description: 'Position & Unternehmen' },
  { id: 2, title: 'Beschreibung', description: 'KI-unterstützte Inhalte' },
  { id: 3, title: 'Anforderungen', description: 'Skills & Qualifikationen' },
  { id: 4, title: 'Bewerbungsprozess', description: 'Phasen & Ablauf' },
  { id: 5, title: 'Benefits', description: 'Zusatzleistungen' },
  { id: 6, title: 'Vergütung', description: 'Gehalt & Konditionen' },
  { id: 7, title: 'Interne Daten', description: 'Registrierung & IDs' },
  { id: 8, title: 'AGG-Check', description: 'Rechtsprüfung' },
  { id: 9, title: 'Vorschau', description: 'Finale Bestätigung' }
] as const;

interface JobFormData {
  // Basic Info
  title: string;
  companyName: string;
  location: string;
  employmentType: string;
  workModel: string;
  
  // Description
  description: string;
  responsibilities: string[];
  metaTags: string[];
  
  // Requirements
  qualifications: string[];
  skills: string[];
  experience: string;
  
  // Application Process
  applicationPhases: string[];
  applicationDeadline?: Date;
  applicationInstructions: string;
  requiredDocuments: string[];
  
  // Benefits
  benefits: string[];
  
  // Salary
  salaryMin: number;
  salaryMax: number;
  currency: string;
  salaryTransparency: boolean;
  
  // Internal Data (not public)
  registrationNumber: string;
  internalJobId: string;
  internalNotes: string;
  
  // AGG Compliance
  aggCompliant: boolean;
  aggViolations: string[];
  
  // Meta
  isLeadershipRole: boolean;
  remoteAllowed: boolean;
}

const defaultFormData: JobFormData = {
  title: '',
  companyName: '',
  location: '',
  employmentType: 'full-time',
  workModel: 'hybrid',
  description: '',
  responsibilities: [],
  metaTags: [],
  qualifications: [],
  skills: [],
  experience: '',
  applicationPhases: ['Bewerbung eingegangen', 'Prüfung der Unterlagen', 'Persönliches Gespräch', 'Entscheidung'],
  applicationInstructions: '',
  requiredDocuments: ['Lebenslauf', 'Anschreiben'],
  benefits: [],
  salaryMin: 0,
  salaryMax: 0,
  currency: 'EUR',
  salaryTransparency: true,
  registrationNumber: '',
  internalJobId: '',
  internalNotes: '',
  aggCompliant: false,
  aggViolations: [],
  isLeadershipRole: false,
  remoteAllowed: false
};

export const CreateJob: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Optimized state management
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobFormData>(defaultFormData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  // Memoized step validation
  const stepValidation = useMemo(() => ({
    1: formData.title && formData.companyName && formData.location,
    2: formData.description && formData.responsibilities.length > 0,
    3: formData.qualifications.length > 0 && formData.skills.length > 0,
    4: formData.applicationPhases.length > 0 && formData.requiredDocuments.length > 0,
    5: formData.benefits.length > 0,
    6: formData.salaryMin > 0 && formData.salaryMax >= formData.salaryMin,
    7: formData.registrationNumber && formData.internalJobId,
    8: formData.aggCompliant,
    9: true
  }), [formData]);

  // Optimized form update with auto-save
  const updateFormData = useCallback(async (updates: Partial<JobFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Auto-save with debounce
    setAutoSaving(true);
    setTimeout(() => {
      // Simulate auto-save to localStorage or API
      localStorage.setItem('jobDraft', JSON.stringify({ ...formData, ...updates }));
      setAutoSaving(false);
    }, 1000);
  }, [formData]);

  // Preload next step component
  const preloadNextStep = useCallback((step: number) => {
    const nextStep = step + 1;
    if (nextStep <= 9) {
      switch (nextStep) {
        case 2: import('./job-steps/DescriptionStep'); break;
        case 3: import('./job-steps/RequirementsStep'); break;
        case 4: import('./job-steps/ApplicationProcessStep'); break;
        case 5: import('./job-steps/BenefitsStep'); break;
        case 6: import('./job-steps/SalaryStep'); break;
        case 7: import('./job-steps/InternalDataStep'); break;
        case 8: import('./job-steps/AGGComplianceStep'); break;
        case 9: import('./job-steps/PreviewStep'); break;
      }
    }
  }, []);

  // Optimized navigation
  const nextStep = useCallback(() => {
    if (currentStep < 9 && stepValidation[currentStep as keyof typeof stepValidation]) {
      const next = currentStep + 1;
      setCurrentStep(next);
      preloadNextStep(next);
    }
  }, [currentStep, stepValidation, preloadNextStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Optimized step progress calculation
  const progress = useMemo(() => (currentStep / 9) * 100, [currentStep]);

  // Submit job
  const handleSubmit = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear draft
      localStorage.removeItem('jobDraft');
      
      navigate('/recruiter/jobs', { 
        state: { message: 'Stellenausschreibung erfolgreich erstellt!' }
      });
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [navigate]);

  // Render optimized step component
  const renderStep = useMemo(() => {
    const stepProps = {
      formData,
      updateFormData,
      autoSaving
    };

    switch (currentStep) {
      case 1:
        return (
          <Suspense fallback={<StepLoader />}>
            <BasicInfoStep {...stepProps} />
          </Suspense>
        );
      case 2:
        return (
          <Suspense fallback={<StepLoader />}>
            <DescriptionStep {...stepProps} />
          </Suspense>
        );
      case 3:
        return (
          <Suspense fallback={<StepLoader />}>
            <RequirementsStep {...stepProps} />
          </Suspense>
        );
      case 4:
        return (
          <Suspense fallback={<StepLoader />}>
            <ApplicationProcessStep {...stepProps} />
          </Suspense>
        );
      case 5:
        return (
          <Suspense fallback={<StepLoader />}>
            <BenefitsStep {...stepProps} />
          </Suspense>
        );
      case 6:
        return (
          <Suspense fallback={<StepLoader />}>
            <SalaryStep {...stepProps} />
          </Suspense>
        );
      case 7:
        return (
          <Suspense fallback={<StepLoader />}>
            <InternalDataStep {...stepProps} />
          </Suspense>
        );
      case 8:
        return (
          <Suspense fallback={<StepLoader />}>
            <AGGComplianceStep {...stepProps} />
          </Suspense>
        );
      case 9:
        return (
          <Suspense fallback={<StepLoader />}>
            <PreviewStep {...stepProps} onSubmit={handleSubmit} isProcessing={isProcessing} />
          </Suspense>
        );
      default:
        return <StepLoader />;
    }
  }, [currentStep, formData, updateFormData, autoSaving, handleSubmit, isProcessing]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col max-w-7xl mx-auto">
        {/* Optimized Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/recruiter/jobs')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-namuh-navy">Stellenausschreibung erstellen</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Schritt {currentStep} von {STEPS.length}: {STEPS[currentStep - 1]?.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Auto-save indicator */}
              <AnimatePresence>
                {autoSaving && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center space-x-2 text-sm text-gray-500"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Speichert...</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Manual save button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline flex items-center space-x-2"
                onClick={() => updateFormData({})}
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Entwurf speichern</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Optimized Progress Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-namuh-teal"
              />
            </div>
            
            {/* Optimized step indicators */}
            <div className="flex justify-between">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                    currentStep > step.id 
                      ? 'bg-namuh-teal text-white' 
                      : currentStep === step.id
                      ? 'bg-namuh-teal text-white ring-4 ring-namuh-teal/20'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`mt-2 text-xs sm:text-sm font-medium transition-colors ${
                    currentStep >= step.id ? 'text-namuh-teal' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Optimized Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="max-w-4xl mx-auto"
              >
                {renderStep}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Optimized Navigation Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Zurück</span>
            </motion.button>

            <div className="text-center">
              <span className="text-sm text-gray-500">
                {currentStep} / {STEPS.length}
              </span>
            </div>

            {currentStep < 9 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                disabled={!stepValidation[currentStep as keyof typeof stepValidation]}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Weiter</span>
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isProcessing || !formData.aggCompliant}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Wird erstellt...</span>
                  </>
                ) : (
                  <>
                    <span>Veröffentlichen</span>
                    <Check className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};