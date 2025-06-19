import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText,
  Upload,
  Send,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  ArrowLeft,
  Sparkles,
  UserPlus,
  Zap,
  Linkedin,
  ExternalLink,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickApplication: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs } = useAppStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'form' | 'documents' | 'success'>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    xingUrl: '',
    otherProfileUrl: '',
    coverLetter: '',
    experience: '',
    motivation: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<{
    cv: File | null;
    coverLetterFile: File | null;
    portfolio: File | null;
  }>({
    cv: null,
    coverLetterFile: null,
    portfolio: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stelle nicht gefunden</h1>
          <Link to="/jobs" className="btn-primary">
            Zurück zur Stellensuche
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (type: keyof typeof uploadedFiles) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles({
        ...uploadedFiles,
        [type]: file
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToPrivacy) {
      alert('Bitte bestätigen Sie die Datenschutzbestimmungen.');
      return;
    }
    
    setIsSubmitting(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setStep('success');
  };

  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.email && 
           (uploadedFiles.cv || formData.experience) && agreedToPrivacy;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={`/jobs/${jobId}`}
            className="inline-flex items-center text-namuh-teal hover:text-namuh-teal-dark mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Stellenausschreibung
          </Link>
          
          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-namuh-navy mb-2">
                  Schnellbewerbung
                </h1>
                <div className="flex items-center space-x-4 text-gray-600 text-sm">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {job.title}
                  </div>
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {job.companyName}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-namuh-teal/10 text-namuh-teal px-3 py-1 rounded-full text-sm font-medium mb-2">
                  Gast-Bewerbung
                </div>
                <p className="text-xs text-gray-500">Keine Registrierung erforderlich</p>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-namuh-navy mb-6 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Persönliche Angaben
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vorname *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Ihr Vorname"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nachname *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Ihr Nachname"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-Mail-Adresse *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="ihre.email@beispiel.de"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefonnummer
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="+49 123 456 789"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aktueller Standort
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="z.B. Berlin, Deutschland"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Profiles */}
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-namuh-navy mb-6 flex items-center">
                    <Linkedin className="h-5 w-5 mr-2" />
                    Professionelle Profile (optional)
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Teilen Sie Links zu Ihren beruflichen Profilen, um Ihre Bewerbung zu stärken.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profil
                      </label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                        <input
                          type="url"
                          name="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        XING Profil
                      </label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-4 w-4" />
                        <input
                          type="url"
                          name="xingUrl"
                          value={formData.xingUrl}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="https://xing.com/profile/..."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anderes Profil
                      </label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="url"
                          name="otherProfileUrl"
                          value={formData.otherProfileUrl}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="https://github.com/... oder Portfolio-URL"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-500">
                    <p>💡 Tipp: Stellen Sie sicher, dass Ihre Profile öffentlich zugänglich und aktuell sind.</p>
                  </div>
                </div>

                {/* Documents Upload */}
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-namuh-navy mb-6 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Dokumente
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CV Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lebenslauf {!formData.experience && '*'}
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-namuh-teal transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          onChange={handleFileUpload('cv')}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id="cv-upload"
                        />
                        <label htmlFor="cv-upload" className="cursor-pointer">
                          <p className="text-sm text-gray-600 mb-1">
                            {uploadedFiles.cv ? uploadedFiles.cv.name : 'Datei auswählen'}
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                        </label>
                      </div>
                    </div>

                    {/* Cover Letter Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anschreiben
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-namuh-teal transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          onChange={handleFileUpload('coverLetterFile')}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id="cover-letter-upload"
                        />
                        <label htmlFor="cover-letter-upload" className="cursor-pointer">
                          <p className="text-sm text-gray-600 mb-1">
                            {uploadedFiles.coverLetterFile ? uploadedFiles.coverLetterFile.name : 'Datei auswählen'}
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                        </label>
                      </div>
                    </div>

                    {/* Portfolio Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Portfolio/Arbeitsproben
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-namuh-teal transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          onChange={handleFileUpload('portfolio')}
                          accept=".pdf,.zip,.rar"
                          className="hidden"
                          id="portfolio-upload"
                        />
                        <label htmlFor="portfolio-upload" className="cursor-pointer">
                          <p className="text-sm text-gray-600 mb-1">
                            {uploadedFiles.portfolio ? uploadedFiles.portfolio.name : 'Datei auswählen'}
                          </p>
                          <p className="text-xs text-gray-500">PDF, ZIP, RAR</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Alternative */}
                {!uploadedFiles.cv && (
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-namuh-navy mb-6 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Alternativ: Kurze Beschreibung
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Falls Sie keinen Lebenslauf hochladen möchten, beschreiben Sie kurz Ihre Erfahrungen.
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Berufserfahrung und Qualifikationen *
                      </label>
                      <textarea
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        rows={4}
                        className="input-field resize-none"
                        placeholder="Beschreiben Sie Ihre relevante Berufserfahrung, Ausbildung und Fähigkeiten..."
                      />
                    </div>
                  </div>
                )}

                {/* Cover Letter Text */}
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-namuh-navy mb-6">
                    Anschreiben & Motivation
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warum interessieren Sie sich für diese Position?
                      </label>
                      <textarea
                        name="motivation"
                        value={formData.motivation}
                        onChange={handleInputChange}
                        rows={3}
                        className="input-field resize-none"
                        placeholder="Beschreiben Sie Ihre Motivation für diese Stelle..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zusätzliche Informationen oder Anschreiben
                      </label>
                      <textarea
                        name="coverLetter"
                        value={formData.coverLetter}
                        onChange={handleInputChange}
                        rows={4}
                        className="input-field resize-none"
                        placeholder="Weitere Informationen, die Sie mitteilen möchten..."
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy and Data Protection */}
                <div className="card p-6 border-2 border-yellow-200 bg-yellow-50/50">
                  <h2 className="text-lg font-semibold text-namuh-navy mb-6 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Datenschutz und Einverständniserklärung
                  </h2>
                  
                  <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <AlertCircle className="h-5 w-5 text-namuh-teal mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-namuh-navy mb-2">
                          Verarbeitung Ihrer Bewerbungsdaten
                        </h3>
                        <div className="text-sm text-gray-700 space-y-3">
                          <p>
                            <strong>Zweckgebundene Datenverarbeitung:</strong> Ihre persönlichen Daten werden ausschließlich 
                            für die Bearbeitung Ihrer Bewerbung auf die Position "{job.title}" bei {job.companyName} verwendet. 
                            Eine Weitergabe an Dritte erfolgt nicht ohne Ihre ausdrückliche Einwilligung.
                          </p>
                          
                          <p>
                            <strong>KI-gestützte Analyse mit menschlicher Kontrolle (HITL):</strong> Ihre Bewerbungsunterlagen 
                            können durch KI-Systeme auf Relevanz und Passgenauigkeit analysiert werden. Jede KI-Bewertung wird 
                            jedoch von qualifizierten Mitarbeitern überprüft und validiert (Human-in-the-Loop Prinzip).
                          </p>
                          
                          <p>
                            <strong>Datenspeicherung:</strong> Ihre Daten werden für maximal 6 Monate nach Abschluss des 
                            Bewerbungsverfahrens gespeichert, sofern nicht gesetzliche Aufbewahrungsfristen entgegenstehen.
                          </p>
                          
                          <p>
                            <strong>Ihre Rechte:</strong> Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung 
                            oder Einschränkung der Verarbeitung Ihrer Daten sowie das Recht auf Datenübertragbarkeit.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-600">
                        Weitere Informationen zum Datenschutz finden Sie in unserer{' '}
                        <Link to="/privacy" className="text-namuh-teal hover:text-namuh-teal-dark underline" target="_blank">
                          Datenschutzerklärung
                        </Link>
                        . Bei Fragen kontaktieren Sie unseren Datenschutzbeauftragen unter{' '}
                        <a href="mailto:privacy@namuh.de" className="text-namuh-teal hover:text-namuh-teal-dark underline">
                          privacy@namuh.de
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="privacy-agreement"
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="mt-1 h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="privacy-agreement" className="text-sm text-gray-700 cursor-pointer">
                      <span className="font-medium">Ich stimme zu *</span>, dass meine Daten zweckgebunden für das 
                      Bewerbungsverfahren verarbeitet werden und einer KI-gestützten Analyse mit menschlicher 
                      Kontrolle (HITL) unterzogen werden können. Ich habe die{' '}
                      <Link to="/privacy" className="text-namuh-teal hover:text-namuh-teal-dark underline" target="_blank">
                        Datenschutzerklärung
                      </Link>{' '}
                      gelesen und verstanden.
                    </label>
                  </div>
                  
                  {!agreedToPrivacy && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-700">
                          Die Zustimmung zur Datenverarbeitung ist für die Bewerbung erforderlich.
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-between items-center">
                  <Link to={`/jobs/${jobId}`} className="btn-outline">
                    Abbrechen
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Bewerbung wird gesendet...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Bewerbung absenden</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="card p-12 max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-namuh-navy mb-4">
                  Bewerbung erfolgreich gesendet! 🎉
                </h1>
                
                <p className="text-gray-600 mb-6">
                  Vielen Dank für Ihre Bewerbung auf die Position <strong>{job.title}</strong> bei <strong>{job.companyName}</strong>. 
                  Das Unternehmen wird Ihre Bewerbung prüfen und sich bei Interesse bei Ihnen melden.
                </p>

                <div className="bg-namuh-teal/10 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-namuh-navy mb-4 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Möchten Sie mehr Chancen haben?
                  </h3>
                  
                  <p className="text-gray-700 mb-6">
                    Mit einem kostenlosen namuH-Account erhalten Sie Zugang zu:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>KI-gestütztes Job-Matching</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Bewerbungsmanagement</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>KI-Tools für Bewerbungen</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Community-Zugang</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Personalisierte Empfehlungen</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>Chat mit Recruitern</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register" className="btn-primary flex items-center justify-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Jetzt kostenlos registrieren</span>
                    </Link>
                    <Link to="/jobs" className="btn-outline flex items-center justify-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Weitere Jobs entdecken</span>
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-namuh-navy">Was passiert als Nächstes?</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-namuh-teal text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-medium">Bewerbung wird geprüft</div>
                        <div className="text-gray-500">Das Unternehmen erhält Ihre Bewerbung</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-namuh-teal text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-medium">Rückmeldung</div>
                        <div className="text-gray-500">Sie erhalten eine E-Mail-Benachrichtigung</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-namuh-teal text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-medium">Interview</div>
                        <div className="text-gray-500">Bei Interesse werden Sie kontaktiert</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Data Protection Notice */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Ihre Daten sind sicher</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    Ihre Bewerbungsdaten werden zweckgebunden verarbeitet und nach spätestens 6 Monaten gelöscht.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};