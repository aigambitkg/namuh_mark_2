import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  X,
  Globe,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  Upload,
  Trash2,
  Check,
  Sparkles,
  MessageSquare,
  Copy,
  Settings,
  Mail,
  Briefcase,
  Building2,
  MapPin,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  RefreshCw,
  Search
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
  id: string;
  title: string;
  company: string;
  source: 'namuh' | 'external';
  url?: string;
  email?: string;
  status: 'pending' | 'analyzing' | 'ready' | 'error';
  coverLetter?: string;
  matchScore?: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  selected: boolean;
  url?: string;
  size: string;
  dateUploaded: Date;
}

export const QuickApplyBatch: React.FC = () => {
  const { user } = useAuthStore();
  const { jobs } = useAppStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'jobs' | 'documents' | 'review' | 'submit' | 'success'>('jobs');
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [namuHJobsSearchQuery, setNamuHJobsSearchQuery] = useState('');
  const [showAddExternalModal, setShowAddExternalModal] = useState(false);
  const [externalJobUrl, setExternalJobUrl] = useState('');
  const [externalJobTitle, setExternalJobTitle] = useState('');
  const [externalJobCompany, setExternalJobCompany] = useState('');
  const [externalJobEmail, setExternalJobEmail] = useState('');
  const [isAnalyzingExternal, setIsAnalyzingExternal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated documents
  useEffect(() => {
    setDocuments([
      {
        id: '1',
        name: 'Lebenslauf_2024.pdf',
        type: 'resume',
        selected: true,
        size: '1.2 MB',
        dateUploaded: new Date('2024-01-10')
      },
      {
        id: '2',
        name: 'CV_English_2024.pdf',
        type: 'resume',
        selected: false,
        size: '1.1 MB',
        dateUploaded: new Date('2024-01-08')
      },
      {
        id: '3',
        name: 'Arbeitszeugnis_TechCorp.pdf',
        type: 'reference',
        selected: false,
        size: '423 KB',
        dateUploaded: new Date('2023-12-15')
      },
      {
        id: '4',
        name: 'Zertifikat_AWS_Developer.pdf',
        type: 'certificate',
        selected: false,
        size: '512 KB',
        dateUploaded: new Date('2023-11-20')
      }
    ]);
  }, []);

  // Add a job from namuH platform
  const addNamuHJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    if (selectedJobs.length >= 10) {
      alert('Sie können maximal 10 Jobs hinzufügen.');
      return;
    }
    
    if (selectedJobs.some(j => j.id === jobId)) {
      alert('Dieser Job wurde bereits hinzugefügt.');
      return;
    }
    
    setSelectedJobs([
      ...selectedJobs,
      {
        id: job.id,
        title: job.title,
        company: job.companyName,
        source: 'namuh',
        status: 'pending',
        matchScore: job.matchScore
      }
    ]);
  };

  // Add external job
  const addExternalJob = () => {
    if (!externalJobUrl || !externalJobTitle || !externalJobCompany) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }
    
    if (selectedJobs.length >= 10) {
      alert('Sie können maximal 10 Jobs hinzufügen.');
      return;
    }
    
    setIsAnalyzingExternal(true);
    
    // Simulate URL analysis to extract email
    setTimeout(() => {
      const newJob: Job = {
        id: `ext_${Date.now()}`,
        title: externalJobTitle,
        company: externalJobCompany,
        source: 'external',
        url: externalJobUrl,
        email: externalJobEmail || 'jobs@' + externalJobCompany.toLowerCase().replace(/\s+/g, '') + '.com',
        status: 'pending'
      };
      
      setSelectedJobs([...selectedJobs, newJob]);
      setIsAnalyzingExternal(false);
      setExternalJobUrl('');
      setExternalJobTitle('');
      setExternalJobCompany('');
      setExternalJobEmail('');
      setShowAddExternalModal(false);
    }, 2000);
  };

  // Remove job
  const removeJob = (jobId: string) => {
    setSelectedJobs(selectedJobs.filter(job => job.id !== jobId));
  };

  // Toggle document selection
  const toggleDocument = (documentId: string) => {
    setDocuments(documents.map(doc => 
      doc.id === documentId ? { ...doc, selected: !doc.selected } : doc
    ));
  };

  // Upload new document
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Simulate upload
      setTimeout(() => {
        const newDocument: Document = {
          id: `doc_${Date.now()}`,
          name: file.name,
          type: file.name.toLowerCase().includes('cv') || file.name.toLowerCase().includes('resume') 
            ? 'resume' 
            : 'other',
          selected: true,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          dateUploaded: new Date()
        };
        
        setDocuments([newDocument, ...documents]);
      }, 1000);
    }
  };

  // Generate cover letters
  const generateCoverLetters = () => {
    // Check if at least one resume is selected
    const hasResume = documents.some(doc => doc.type === 'resume' && doc.selected);
    
    if (!hasResume) {
      alert('Bitte wählen Sie mindestens einen Lebenslauf aus.');
      return;
    }
    
    setIsGenerating(true);
    setStep('review');
    
    // Simulate AI generation for each job
    const updatedJobs = [...selectedJobs];
    
    const processJobs = async () => {
      for (let i = 0; i < updatedJobs.length; i++) {
        updatedJobs[i].status = 'analyzing';
        setSelectedJobs([...updatedJobs]);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Generate a cover letter based on job details
        updatedJobs[i].status = 'ready';
        updatedJobs[i].coverLetter = generateMockCoverLetter(updatedJobs[i]);
        setSelectedJobs([...updatedJobs]);
      }
      
      setIsGenerating(false);
      setEmailSubject('Bewerbung als [Position]');
    };
    
    processJobs();
  };

  // Mock cover letter generator
  const generateMockCoverLetter = (job: Job): string => {
    return `Sehr geehrte Damen und Herren,

ich bewerbe mich hiermit für die Position als ${job.title} bei ${job.company}. Mit meinem Hintergrund in Softwareentwicklung und meiner Erfahrung mit modernen Webtechnologien bin ich überzeugt, einen wertvollen Beitrag zu Ihrem Team leisten zu können.

In meiner aktuellen Position habe ich erfolgreich verschiedene Projekte mit React, TypeScript und Node.js umgesetzt. Besonders meine Fähigkeiten in der Frontend-Entwicklung und mein Verständnis für benutzerfreundliche Interfaces würden perfekt zu dieser Stelle passen.

Ich bin ein Teamplayer mit ausgeprägter Kommunikationsfähigkeit und bringe mich gerne aktiv in Projekte ein. Die Möglichkeit, bei ${job.company} an innovativen Lösungen zu arbeiten, begeistert mich sehr.

Gerne stelle ich Ihnen meine Qualifikationen in einem persönlichen Gespräch vor.

Mit freundlichen Grüßen,
${user?.name}`;
  };

  // Update cover letter
  const updateCoverLetter = (jobId: string, content: string) => {
    setSelectedJobs(selectedJobs.map(job => 
      job.id === jobId ? { ...job, coverLetter: content } : job
    ));
  };

  // Update job email
  const updateJobEmail = (jobId: string, email: string) => {
    setSelectedJobs(selectedJobs.map(job => 
      job.id === jobId ? { ...job, email: email } : job
    ));
  };

  // Submit applications
  const submitApplications = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 3000);
  };

  // Filter namuH jobs based on search query
  const filteredNamuHJobs = jobs
    .filter(job => job.status === 'active')
    .filter(job => 
      job.title.toLowerCase().includes(namuHJobsSearchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(namuHJobsSearchQuery.toLowerCase())
    )
    .slice(0, 8); // Limit to 8 results

  // Calculate if can move to next step
  const canProceed = {
    jobs: selectedJobs.length > 0,
    documents: documents.some(doc => doc.selected),
    review: selectedJobs.every(job => job.status === 'ready' && job.coverLetter && 
      (job.source === 'namuh' || (job.source === 'external' && job.email)))
  };

  // Determine selected resume name
  const selectedResumeName = documents.find(doc => doc.type === 'resume' && doc.selected)?.name || '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy mb-2">Quick Apply</h1>
          <p className="text-gray-600">
            Bewerben Sie sich gleichzeitig auf bis zu 10 Stellen mit KI-optimierten Anschreiben
          </p>
        </div>
        
        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  className="bg-namuh-teal transition-all duration-500"
                  style={{ 
                    width: step === 'jobs' ? '25%' : 
                           step === 'documents' ? '50%' : 
                           step === 'review' ? '75%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
            <div className="ml-4 text-sm text-gray-500">
              Schritt {
                step === 'jobs' ? '1/4' : 
                step === 'documents' ? '2/4' : 
                step === 'review' ? '3/4' : 
                step === 'success' ? '4/4' : ''
              }
            </div>
          </div>
          
          <div className="flex justify-between mt-2">
            <div className={`text-xs font-medium ${step === 'jobs' ? 'text-namuh-teal' : 'text-gray-500'}`}>Stellen auswählen</div>
            <div className={`text-xs font-medium ${step === 'documents' ? 'text-namuh-teal' : 'text-gray-500'}`}>Dokumente</div>
            <div className={`text-xs font-medium ${step === 'review' ? 'text-namuh-teal' : 'text-gray-500'}`}>Überprüfen</div>
            <div className={`text-xs font-medium ${step === 'success' ? 'text-namuh-teal' : 'text-gray-500'}`}>Absenden</div>
          </div>
        </div>

        {/* Steps Content */}
        <AnimatePresence mode="wait">
          {step === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Selected Jobs List */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-namuh-navy mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-namuh-teal" />
                  Ausgewählte Stellen ({selectedJobs.length}/10)
                </h2>
                
                {selectedJobs.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Noch keine Stellen ausgewählt</p>
                    <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                      Fügen Sie Stellen von namuH hinzu oder geben Sie externe URLs ein, um sich auf mehrere Stellen gleichzeitig zu bewerben
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {selectedJobs.map(job => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-namuh-teal/50 transition-all">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{job.title}</h3>
                            <p className="text-gray-500 text-sm">{job.company}</p>
                            <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                              <span className="flex items-center">
                                {job.source === 'namuh' ? (
                                  <>
                                    <Briefcase className="h-3 w-3 mr-1 text-namuh-teal" />
                                    <span>namuH Stelle</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe className="h-3 w-3 mr-1 text-blue-500" />
                                    <span>Externe Stelle</span>
                                  </>
                                )}
                              </span>
                              {job.matchScore && (
                                <span className="flex items-center text-namuh-teal">
                                  <Target className="h-3 w-3 mr-1" />
                                  <span>{job.matchScore}% Match</span>
                                </span>
                              )}
                              {job.source === 'external' && job.url && (
                                <a 
                                  href={job.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700 flex items-center"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  <span>URL öffnen</span>
                                </a>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeJob(job.id)} 
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedJobs.length < 10 && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowAddExternalModal(true)}
                      className="btn-outline text-sm flex items-center"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Externe Stelle hinzufügen
                    </button>
                  </div>
                )}
              </div>

              {/* namuH Job Search */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-namuh-navy mb-4">
                  Stellen auf namuH
                </h2>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input 
                    type="text" 
                    placeholder="Nach Stellentitel oder Unternehmen suchen..." 
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                    value={namuHJobsSearchQuery}
                    onChange={(e) => setNamuHJobsSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredNamuHJobs.map(job => (
                    <div 
                      key={job.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                      onClick={() => addNamuHJob(job.id)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-namuh-navy">{job.title}</h3>
                          <p className="text-gray-600 text-sm">{job.companyName}</p>
                          <div className="flex items-center mt-2 space-x-2 text-xs">
                            <span className="flex items-center text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.location}
                            </span>
                            {job.matchScore && (
                              <span className="flex items-center text-namuh-teal">
                                <Target className="h-3 w-3 mr-1" />
                                <span>{job.matchScore}% Match</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Plus className="h-4 w-4 text-namuh-teal" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredNamuHJobs.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Keine passenden Stellen gefunden</p>
                  </div>
                )}
                
                <div className="mt-4 text-center">
                  <Link to="/jobs" className="text-sm text-namuh-teal hover:underline">
                    Alle Jobs durchsuchen
                  </Link>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="btn-outline"
                >
                  Abbrechen
                </button>
                <button 
                  onClick={() => setStep('documents')} 
                  disabled={!canProceed.jobs}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter zu Dokumenten
                </button>
              </div>
            </motion.div>
          )}

          {step === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-namuh-navy mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-namuh-teal" />
                  Dokumente auswählen
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Wählen Sie die Dokumente aus, die Sie Ihren Bewerbungen beifügen möchten
                </p>
                
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-gray-700">Lebensläufe (mindestens einen auswählen)</h3>
                  <div className="space-y-3">
                    {documents.filter(doc => doc.type === 'resume').map(doc => (
                      <div key={doc.id} className={`border rounded-lg p-4 flex items-center ${doc.selected ? 'border-namuh-teal bg-namuh-teal/5' : 'border-gray-200'}`}>
                        <input
                          type="checkbox"
                          checked={doc.selected}
                          onChange={() => toggleDocument(doc.id)}
                          className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded mr-4"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <FileText className="h-3 w-3 mr-1" />
                            <span>{doc.size} • Hochgeladen am {doc.dateUploaded.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {doc.selected ? (
                            <Check className="h-5 w-5 text-namuh-teal" />
                          ) : (
                            <Plus className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Weitere Dokumente (optional)</h3>
                  <div className="space-y-3">
                    {documents.filter(doc => doc.type !== 'resume').map(doc => (
                      <div key={doc.id} className={`border rounded-lg p-4 flex items-center ${doc.selected ? 'border-namuh-teal bg-namuh-teal/5' : 'border-gray-200'}`}>
                        <input
                          type="checkbox"
                          checked={doc.selected}
                          onChange={() => toggleDocument(doc.id)}
                          className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded mr-4"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <FileText className="h-3 w-3 mr-1" />
                            <span>{doc.size} • Hochgeladen am {doc.dateUploaded.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <button onClick={handleFileUpload} className="btn-outline flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Neues Dokument hochladen
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep('jobs')} 
                  className="btn-outline"
                >
                  Zurück
                </button>
                <button 
                  onClick={generateCoverLetters}
                  disabled={!canProceed.documents}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Anschreiben generieren
                </button>
              </div>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                <div className="mr-3 mt-1 text-blue-500 flex-shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">Anschreiben erstellt mit KI</h3>
                  <p className="text-sm text-blue-600">
                    Deine Anschreiben wurden basierend auf deinem Lebenslauf ({selectedResumeName}) und den Stellenbeschreibungen erstellt. 
                    Überprüfe und bearbeite sie nach Bedarf vor dem Absenden.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6 mb-6">
                {selectedJobs.map(job => (
                  <div 
                    key={job.id} 
                    className={`card p-6 ${job.status === 'analyzing' ? 'border-blue-300 bg-blue-50/50' : 
                      job.status === 'ready' ? 'border-green-300 bg-green-50/10' : 
                      job.status === 'error' ? 'border-red-300 bg-red-50/10' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-4 cursor-pointer"
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            {job.company}
                          </span>
                        </div>
                        
                        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                          <span className="flex items-center">
                            {job.source === 'namuh' ? (
                              <>
                                <Briefcase className="h-3 w-3 mr-1 text-namuh-teal" />
                                <span>namuH Stelle</span>
                              </>
                            ) : (
                              <>
                                <Globe className="h-3 w-3 mr-1 text-blue-500" />
                                <span>Externe Stelle</span>
                              </>
                            )}
                          </span>
                          {job.matchScore && (
                            <span className="flex items-center text-namuh-teal">
                              <Target className="h-3 w-3 mr-1" />
                              <span>{job.matchScore}% Match</span>
                            </span>
                          )}
                          {job.status === 'analyzing' && (
                            <span className="flex items-center text-blue-600">
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              <span>Wird analysiert...</span>
                            </span>
                          )}
                          {job.status === 'ready' && (
                            <span className="flex items-center text-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              <span>Bereit zum Absenden</span>
                            </span>
                          )}
                          {job.status === 'error' && (
                            <span className="flex items-center text-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              <span>Fehler bei Erstellung</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        {expandedJob === job.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedJob === job.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {job.status === 'analyzing' ? (
                            <div className="py-10 text-center">
                              <RefreshCw className="h-10 w-10 animate-spin text-namuh-teal mx-auto mb-4" />
                              <p className="text-gray-600">KI generiert personalisiertes Anschreiben...</p>
                            </div>
                          ) : job.status === 'ready' && job.coverLetter ? (
                            <div className="border-t border-gray-200 pt-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium text-gray-700">Anschreiben</h4>
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(job.coverLetter || '');
                                    }}
                                    className="text-namuh-teal hover:text-namuh-teal-dark p-1"
                                    title="Kopieren"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const regenerated = generateMockCoverLetter(job);
                                      updateCoverLetter(job.id, regenerated);
                                    }}
                                    className="text-namuh-teal hover:text-namuh-teal-dark p-1"
                                    title="Neu generieren"
                                  >
                                    <Sparkles className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <textarea
                                  value={job.coverLetter}
                                  onChange={(e) => updateCoverLetter(job.id, e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg p-3 h-60 focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                                ></textarea>
                              </div>
                              
                              {/* Email settings */}
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium text-gray-700 flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                    Email-Einstellungen
                                  </h4>
                                  <Settings className="h-4 w-4 text-gray-500" />
                                </div>
                                
                                <div className="mb-4">
                                  <label className="block text-xs text-gray-500 mb-1">
                                    Empfänger-Email
                                  </label>
                                  <input
                                    type="email"
                                    value={job.email || ''}
                                    onChange={(e) => updateJobEmail(job.id, e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                                    placeholder="bewerbung@unternehmen.de"
                                    required={job.source === 'external'}
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">
                                    Betreff
                                  </label>
                                  <input
                                    type="text"
                                    value={emailSubject.replace('[Position]', job.title)}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-10 text-center">
                              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                              <p className="text-red-600">
                                Es gab ein Problem bei der Generierung des Anschreibens. 
                                Bitte versuchen Sie es erneut.
                              </p>
                              <button 
                                className="btn-outline mt-4 text-sm"
                                onClick={() => {
                                  const jobIndex = selectedJobs.findIndex(j => j.id === job.id);
                                  const updatedJobs = [...selectedJobs];
                                  updatedJobs[jobIndex].status = 'analyzing';
                                  setSelectedJobs(updatedJobs);
                                  
                                  setTimeout(() => {
                                    updatedJobs[jobIndex].status = 'ready';
                                    updatedJobs[jobIndex].coverLetter = generateMockCoverLetter(job);
                                    setSelectedJobs([...updatedJobs]);
                                  }, 2000);
                                }}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Erneut versuchen
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep('documents')} 
                  className="btn-outline"
                >
                  Zurück
                </button>
                <button 
                  onClick={() => setStep('submit')}
                  disabled={isGenerating || !canProceed.review}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter zur Übersicht
                </button>
              </div>
            </motion.div>
          )}

          {step === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-namuh-teal" />
                  Bereit zum Absenden
                </h2>
                
                <div className="bg-namuh-teal/10 border border-namuh-teal/20 rounded-lg p-6 mb-6">
                  <h3 className="font-medium text-namuh-navy mb-4">Übersicht Ihrer Bewerbungen</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Bewerbungen</div>
                      <div className="text-2xl font-bold text-namuh-navy">{selectedJobs.length} Stellen</div>
                      <ul className="mt-3 space-y-2">
                        {selectedJobs.map(job => (
                          <li key={job.id} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-gray-700">{job.title} bei {job.company}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Beigefügte Dokumente</div>
                      <ul className="space-y-2">
                        {documents.filter(doc => doc.selected).map(doc => (
                          <li key={doc.id} className="flex items-center text-sm">
                            <FileText className="h-4 w-4 text-namuh-teal mr-2" />
                            <span className="text-gray-700">{doc.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Zeitschätzung</h3>
                      <p className="text-sm text-blue-700">
                        Das Versenden von {selectedJobs.length} Bewerbungen dauert etwa 2-3 Minuten. Bitte verlassen Sie die Seite während des Vorgangs nicht.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h3 className="font-medium text-amber-900 mb-3">Datenschutzhinweis</h3>
                  <p className="text-sm text-amber-700 mb-4">
                    Mit dem Absenden werden Ihre ausgewählten Dokumente und Anschreiben an die jeweiligen Unternehmen weitergeleitet. 
                    Ihre Daten werden gemäß unserer Datenschutzerklärung verarbeitet.
                  </p>
                  
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      id="privacy-consent"
                      className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-amber-300 rounded mt-0.5"
                    />
                    <label htmlFor="privacy-consent" className="ml-2 text-sm text-amber-800">
                      Ich stimme der Verarbeitung meiner Daten zum Zweck der Bewerbung zu und bestätige, dass alle angegebenen Informationen korrekt sind.
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => setStep('review')} 
                  className="btn-outline"
                >
                  Zurück
                </button>
                <button 
                  onClick={submitApplications}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Bewerbungen werden gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {selectedJobs.length} Bewerbungen absenden
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="card p-8 max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-namuh-navy mb-4">
                  Alle {selectedJobs.length} Bewerbungen erfolgreich gesendet!
                </h2>
                
                <p className="text-gray-600 mb-8">
                  Ihre Bewerbungen wurden erfolgreich an die jeweiligen Unternehmen gesendet. 
                  Sie können den Status Ihrer Bewerbungen in Ihrem Dashboard verfolgen.
                </p>
                
                <div className="bg-namuh-teal/10 border border-namuh-teal/20 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-namuh-navy mb-3">Übersicht der gesendeten Bewerbungen</h3>
                  <ul className="space-y-3 text-left">
                    {selectedJobs.map(job => (
                      <li key={job.id} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500">{job.company}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/applications" className="btn-primary">
                    <FileText className="h-4 w-4 mr-2" />
                    Meine Bewerbungen anzeigen
                  </Link>
                  <Link to="/dashboard" className="btn-outline">
                    Zurück zum Dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* External Job Modal */}
        <AnimatePresence>
          {showAddExternalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-namuh-navy">
                      Externe Stelle hinzufügen
                    </h3>
                    <button 
                      onClick={() => setShowAddExternalModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stellenanzeige URL *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="url"
                          value={externalJobUrl}
                          onChange={(e) => setExternalJobUrl(e.target.value)}
                          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                          placeholder="https://example.com/job-posting"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stellentitel *
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          value={externalJobTitle}
                          onChange={(e) => setExternalJobTitle(e.target.value)}
                          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                          placeholder="z.B. Frontend Developer"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unternehmen *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          value={externalJobCompany}
                          onChange={(e) => setExternalJobCompany(e.target.value)}
                          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                          placeholder="z.B. TechCorp GmbH"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bewerbungs-Email (optional)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="email"
                          value={externalJobEmail}
                          onChange={(e) => setExternalJobEmail(e.target.value)}
                          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                          placeholder="z.B. jobs@unternehmen.de"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Wenn leer, versuchen wir die Email automatisch zu extrahieren
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button 
                      onClick={() => setShowAddExternalModal(false)}
                      className="btn-outline"
                    >
                      Abbrechen
                    </button>
                    <button 
                      onClick={addExternalJob}
                      disabled={isAnalyzingExternal || !externalJobUrl || !externalJobTitle || !externalJobCompany}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzingExternal ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analysiere...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Hinzufügen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};