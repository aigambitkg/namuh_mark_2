import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  MessageCircle, 
  FileText,
  MoreVertical, 
  Download,
  ChevronDown,
  ChevronUp,
  Target,
  AlertCircle,
  CheckCircle,
  Save,
  Trash2,
  Edit,
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

// Utility function to calculate days since application for data retention timer
const calculateDataRetentionDays = (appliedDate: Date) => {
  const now = new Date();
  const diffTime = now.getTime() - appliedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// ApplicationDetails component to be used within the ApplicationCard
const ApplicationDetails = ({ application, onStatusUpdate }: { 
  application: any;
  onStatusUpdate: (id: string, status: string, phase: string, evaluation?: any) => Promise<void>;
}) => {
  const [isRating, setIsRating] = useState(false);
  const [rating, setRating] = useState(application.rating || 0);
  const [ratingSubject, setRatingSubject] = useState(application.ratingSubject || '');
  const [feedback, setFeedback] = useState(application.feedback || '');
  const [showDocuments, setShowDocuments] = useState(false);
  const [contractNotes, setContractNotes] = useState(application.contractNotes || '');
  const [showContractNotes, setShowContractNotes] = useState(false);

  // Phase options
  const phaseOptions = [
    'Bewerbung eingegangen',
    'Screening',
    'Telefoninterview',
    'Technisches Interview',
    'Persönliches Gespräch',
    'Team-Kennenlernen',
    'Angebot',
    'Abgelehnt'
  ];

  const handleUpdateRating = () => {
    onStatusUpdate(application.id, application.status, application.currentPhase, {
      rating,
      ratingSubject,
      feedback
    });
    setIsRating(false);
  };

  const handleSaveContractNotes = () => {
    onStatusUpdate(application.id, application.status, application.currentPhase, {
      contractNotes
    });
    setShowContractNotes(false);
  };

  // Check if application is in offer phase
  const isInOfferPhase = application.currentPhase === 'Angebot' || application.status === 'offer';

  const retentionDays = calculateDataRetentionDays(application.appliedDate);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-gray-200 pt-4 mt-4 space-y-4"
    >
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary text-xs py-1.5 px-3">
          Zum Interview einladen
        </button>
        <button 
          onClick={() => setIsRating(!isRating)}
          className="btn-outline text-xs py-1.5 px-3"
        >
          {isRating ? 'Abbrechen' : 'Bewerten'}
        </button>
        <button 
          onClick={() => setShowDocuments(!showDocuments)} 
          className="btn-outline text-xs py-1.5 px-3"
        >
          {showDocuments ? 'Dokumente ausblenden' : 'Dokumente anzeigen'}
        </button>
        <button className="btn-outline text-xs py-1.5 px-3">
          <MessageCircle className="h-3 w-3 mr-1 inline" />
          Nachricht
        </button>
      </div>

      {/* Rating Form */}
      <AnimatePresence>
        {isRating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <h4 className="text-sm font-medium text-gray-700 mb-3">Kandidat bewerten</h4>
            <div className="space-y-3">
              {/* Rating Subject/Category Field */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bewertungsthema:</label>
                <input
                  type="text"
                  value={ratingSubject}
                  onChange={(e) => setRatingSubject(e.target.value)}
                  placeholder="z.B. Technische Fähigkeiten, Kommunikation, Kulturelle Passung..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-namuh-teal focus:border-namuh-teal"
                />
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <label className="text-xs text-gray-600">Bewertung:</label>
                  <div className="flex items-center ml-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} 
                        type="button"
                        onClick={() => setRating(star)}
                        className={`h-6 w-6 ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        <Star className={`h-5 w-5 ${rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Feedback zum Kandidaten eingeben..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-namuh-teal focus:border-namuh-teal"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleUpdateRating}
                  disabled={!ratingSubject.trim()}
                  className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Speichern
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Notes Section - Only visible for applications in offer phase */}
      {isInOfferPhase && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 p-4 rounded-lg border border-green-200"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-green-800 flex items-center">
              <FileText className="h-4 w-4 text-green-600 mr-2" />
              Notizen für Arbeitsvertrag
            </h4>
            <button 
              onClick={() => setShowContractNotes(!showContractNotes)}
              className="text-xs text-green-700 hover:text-green-900 underline flex items-center"
            >
              {showContractNotes ? 'Ausblenden' : 'Bearbeiten'}
              <Edit className="h-3 w-3 ml-1" />
            </button>
          </div>

          {showContractNotes ? (
            <div className="space-y-3">
              <textarea
                value={contractNotes}
                onChange={(e) => setContractNotes(e.target.value)}
                placeholder="Wichtige Informationen für den Arbeitsvertrag eingeben (z.B. Sonderkonditionen, Urlaubsanspruch, Arbeitszeit, etc.)"
                className="w-full text-sm border border-green-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 bg-white"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowContractNotes(false)}
                  className="text-xs py-1.5 px-3 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveContractNotes}
                  className="text-xs py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Speichern
                </button>
              </div>
            </div>
          ) : (
            <div>
              {contractNotes ? (
                <p className="text-sm text-green-700 whitespace-pre-line">{contractNotes}</p>
              ) : (
                <p className="text-sm text-green-600 italic">
                  Keine Notizen vorhanden. Klicken Sie auf "Bearbeiten", um Notizen für den Arbeitsvertrag hinzuzufügen.
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Show Saved Ratings */}
      {application.rating > 0 && application.ratingSubject && (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-yellow-800 flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
              Bewertung: {application.ratingSubject}
            </h4>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`h-4 w-4 ${application.rating >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
          {application.feedback && (
            <p className="text-xs text-yellow-700 italic">{application.feedback}</p>
          )}
        </div>
      )}

      {/* Documents Viewer */}
      <AnimatePresence>
        {showDocuments && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* CV Document */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-namuh-teal mr-2" />
                  <span className="text-sm font-medium">Lebenslauf</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-500 hover:text-namuh-teal">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-namuh-teal">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="h-60 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Dokument-Vorschau wird geladen...</p>
              </div>
            </div>

            {/* Cover Letter Document */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-namuh-teal mr-2" />
                  <span className="text-sm font-medium">Anschreiben</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-500 hover:text-namuh-teal">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-namuh-teal">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="h-60 bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Dokument-Vorschau wird geladen...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase Management */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Bewerbungsphase ändern</h4>
        <div className="flex items-center space-x-3">
          <select 
            className="border border-gray-300 rounded-lg text-sm p-2 focus:ring-namuh-teal focus:border-namuh-teal flex-1"
            value={application.currentPhase}
            onChange={(e) => onStatusUpdate(
              application.id, 
              e.target.value === 'Angebot' ? 'offer' : 
              e.target.value === 'Abgelehnt' ? 'rejected' : 'Under Review', 
              e.target.value
            )}
          >
            {phaseOptions.map(phase => (
              <option key={phase} value={phase}>{phase}</option>
            ))}
          </select>
          <button className="btn-outline text-xs py-1.5 px-3">
            Aktualisieren
          </button>
        </div>
      </div>

      {/* Application Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">E-Mail:</span>
          <span className="ml-2 font-medium">bewerber@example.com</span>
        </div>
        <div>
          <span className="text-gray-500">Telefon:</span>
          <span className="ml-2 font-medium">+49 123 456789</span>
        </div>
        <div>
          <span className="text-gray-500">Quelle:</span>
          <span className="ml-2 font-medium">{application.applicationSource}</span>
        </div>
        <div>
          <span className="text-gray-500">Einladungswahrscheinlichkeit:</span>
          <span className={`ml-2 font-medium ${
            application.invitationLikelihood === 'High' ? 'text-green-600' :
            application.invitationLikelihood === 'Moderate' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {application.invitationLikelihood}
          </span>
        </div>
      </div>

      {/* Data Retention Information */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center mb-2">
          <Clock className="h-4 w-4 text-gray-500 mr-2" />
          <h4 className="text-sm font-medium text-gray-700">Datenschutz & Aufbewahrung</h4>
        </div>
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            Gemäß DSGVO werden Bewerbungsdaten nach 180 Tagen automatisch gelöscht.
            Bewerbung eingegangen am {application.appliedDate.toLocaleDateString('de-DE')}.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                retentionDays > 150 
                  ? 'bg-orange-500' 
                  : retentionDays > 120
                  ? 'bg-yellow-500'
                  : 'bg-namuh-teal'
              }`}
              style={{ 
                width: `${Math.min(100, (retentionDays / 180) * 100)}%` 
              }}
            />
          </div>
          <div className="flex justify-between">
            <span>0 Tage</span>
            <span>180 Tage</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const RecruiterApplications: React.FC = () => {
  const { user } = useAuthStore();
  const { applications, jobs, isLoading, fetchJobs, fetchApplications, updateApplicationStatus } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedApplications, setExpandedApplications] = useState<string[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // Filter applications for current recruiter
  const myJobs = jobs.filter(job => job.recruiterId === user?.id);
  const myJobIds = myJobs.map(job => job.id);
  const myApplications = applications.filter(app => myJobIds.includes(app.jobId));

  // Apply filters
  const filteredApplications = myApplications.filter(app => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      app.status.toLowerCase().includes(statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  // Toggle expanded application state
  const toggleExpandApplication = (applicationId: string) => {
    setExpandedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'under review': return 'bg-yellow-100 text-yellow-800';
      case 'interviewing': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle application status update
  const handleUpdateStatus = async (
    applicationId: string, 
    status: string, 
    phase: string, 
    evaluation = {}
  ) => {
    try {
      await updateApplicationStatus(applicationId, status, phase, evaluation);
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy">Bewerbungen</h1>
          <p className="mt-2 text-gray-600">
            Verwalten und organisieren Sie alle Bewerbungen auf Ihre Stellenanzeigen.
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Nach Name oder Position suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">Alle Status</option>
                <option value="applied">Beworben</option>
                <option value="review">In Bearbeitung</option>
                <option value="interview">Interview</option>
                <option value="offer">Angebot</option>
                <option value="rejected">Abgelehnt</option>
              </select>
              <button className="btn-outline flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-namuh-teal"></div>
            </div>
          ) : filteredApplications.length > 0 ? (
            filteredApplications.map((application, index) => {
              // Calculate days for data retention
              const retentionDays = calculateDataRetentionDays(application.appliedDate);
              const daysUntilDeletion = 180 - retentionDays;
              const isNearDeletion = daysUntilDeletion <= 30;
              const isWarningPeriod = daysUntilDeletion <= 30 && daysUntilDeletion > 0;
              
              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`card p-6 hover:shadow-lg transition-shadow ${
                    isWarningPeriod ? 'border-l-4 border-l-orange-500' : ''
                  }`}
                >
                  {/* Data Retention Warning */}
                  {isWarningPeriod && (
                    <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start">
                      <AlertCircle className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">
                          Hinweis zur Datenlöschung
                        </p>
                        <p className="text-xs text-orange-700">
                          Diese Bewerbungsdaten werden in {daysUntilDeletion} Tagen automatisch aus dem System gelöscht.
                          Gemäß DSGVO werden alle Bewerbungsdaten nach 180 Tagen automatisch entfernt.
                        </p>
                      </div>
                    </div>
                  )}

                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleExpandApplication(application.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-namuh-teal rounded-full flex items-center justify-center text-white font-medium">
                          {application.applicantName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-namuh-navy">
                            {application.applicantName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                            <span className="text-gray-600">Phase: {application.currentPhase}</span>
                            
                            {/* Data Retention Timer */}
                            <div className="flex items-center space-x-1 text-xs">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className={`${isNearDeletion ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                                {retentionDays} / 180 Tage
                              </span>
                            </div>
                            
                            {/* Show Rating if exists */}
                            {application.rating > 0 && application.ratingSubject && (
                              <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded">
                                <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                                <span className="text-xs font-medium text-yellow-700">
                                  {application.ratingSubject}: {application.rating}/5
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center space-x-6 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-namuh-teal" />
                          <span>Match Score: <span className="font-medium text-namuh-teal">{application.matchScore}%</span></span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Beworben: {application.appliedDate.toLocaleDateString('de-DE')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{application.jobTitle}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform ${
                        expandedApplications.includes(application.id) ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                  
                  {/* Expanded Application Details */}
                  <AnimatePresence>
                    {expandedApplications.includes(application.id) && (
                      <ApplicationDetails 
                        application={application} 
                        onStatusUpdate={handleUpdateStatus}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Bewerbungen gefunden</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Passen Sie Ihre Suchkriterien an, um Ergebnisse zu sehen.'
                  : 'Sie haben noch keine Bewerbungen erhalten.'
                }
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="btn-outline"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};