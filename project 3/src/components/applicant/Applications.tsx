import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Building2, 
  Clock, 
  Target, 
  TrendingUp, 
  MessageCircle, 
  FileText,
  MoreVertical, 
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Applications: React.FC = () => {
  const { user } = useAuthStore();
  const { applications, isLoading, fetchApplications } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [expandedApplications, setExpandedApplications] = useState<string[]>([]);

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter applications for current user
  const myApplications = user ? applications.filter(app => app.applicantId === user?.id) : [];

  // Apply filters
  const filteredApplications = myApplications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                          app.status.toLowerCase().includes(statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

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

  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'applied': return 'text-blue-600';
      case 'screening': return 'text-yellow-600';
      case 'portfolio review': return 'text-purple-600';
      case 'technical interview': return 'text-indigo-600';
      case 'final interview': return 'text-green-600';
      case 'offer': return 'text-green-700';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Heute';
    if (diffInDays === 1) return 'Gestern';
    if (diffInDays < 7) return `vor ${diffInDays} Tagen`;
    if (diffInDays < 30) return `vor ${Math.floor(diffInDays / 7)} Wochen`;
    return date.toLocaleDateString('de-DE');
  };

  const toggleExpandApplication = (applicationId: string) => {
    setExpandedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy">Meine Bewerbungen</h1>
          <p className="mt-2 text-gray-600">
            Verfolgen Sie den Status Ihrer Bewerbungen und verwalten Sie Ihre Kommunikation.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-namuh-teal mb-2">
              {myApplications.length}
            </div>
            <div className="text-gray-600">Gesamt Bewerbungen</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {myApplications.filter(app => app.status === 'Under Review').length}
            </div>
            <div className="text-gray-600">In Bearbeitung</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {myApplications.filter(app => app.currentPhase.includes('Interview')).length}
            </div>
            <div className="text-gray-600">Interviews geplant</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round(myApplications.reduce((sum, app) => sum + app.matchScore, 0) / Math.max(1, myApplications.length))}%
            </div>
            <div className="text-gray-600">Ø Match Score</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Stellentitel oder Unternehmen suchen..."
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
            filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => toggleExpandApplication(application.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-namuh-navy mb-2">
                          {application.jobTitle}
                        </h3>
                        <div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>{application.companyName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Beworben: {application.appliedDate.toLocaleDateString('de-DE')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Aktualisiert: {formatTimeAgo(application.lastUpdated)}</span>
                          </div>
                        </div>

                        {/* Status and Phase */}
                        <div className="flex items-center space-x-3 mb-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                          <span className={`text-sm font-medium ${getPhaseColor(application.currentPhase)}`}>
                            Phase: {application.currentPhase}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform ${
                      expandedApplications.includes(application.id) ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>
                
                {/* Expanded details */}
                <AnimatePresence>
                  {expandedApplications.includes(application.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 pt-4 mt-4 space-y-4"
                    >
                      {/* Application Process Visualization */}
                      {application.job?.applicationPhases && (
                        <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Bewerbungsprozess:</h4>
                            <span className="text-xs text-gray-500">Aktuelle Phase: {application.currentPhase}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 overflow-x-auto pb-2">
                            {application.job.applicationPhases.map((phase: string, phaseIndex: number) => {
                              const isCurrentPhase = phase === application.currentPhase;
                              const isPastPhase = application.job.applicationPhases.indexOf(application.currentPhase) > phaseIndex;
                              
                              return (
                                <React.Fragment key={phaseIndex}>
                                  <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                    isCurrentPhase 
                                      ? 'bg-namuh-teal text-white' 
                                      : isPastPhase
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {phase}
                                  </div>
                                  {phaseIndex < application.job.applicationPhases.length - 1 && (
                                    <ArrowRight className={`h-3 w-3 flex-shrink-0 ${
                                      isPastPhase ? 'text-green-500' : 'text-gray-300'
                                    }`} />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Metrics */}
                      <div className="flex items-center space-x-6 text-sm mb-4">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 text-namuh-teal mr-1" />
                          <span className="text-gray-600">Match Score:</span>
                          <span className="ml-1 font-semibold text-namuh-teal">{application.matchScore}%</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-gray-600">Einladungswahrscheinlichkeit:</span>
                          <span className={`ml-1 font-semibold ${
                            application.invitationLikelihood === 'High' ? 'text-green-600' :
                            application.invitationLikelihood === 'Moderate' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {application.invitationLikelihood === 'High' ? 'Hoch' :
                             application.invitationLikelihood === 'Moderate' ? 'Mittel' : 'Niedrig'}
                          </span>
                        </div>
                      </div>

                      {/* Last Communication */}
                      {application.lastCommunication && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Letzte Kommunikation ({application.lastCommunication.phase}):
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(application.lastCommunication.date).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            "{application.lastCommunication.messageSnippet}"
                          </p>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex space-x-3">
                        <button className="btn-primary text-sm">
                          Bewerbungsdetails anzeigen
                        </button>
                        <button className="btn-outline text-sm flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Nachricht senden
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Keine Bewerbungen gefunden'
                  : 'Noch keine Bewerbungen'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Passen Sie Ihre Suchkriterien an oder erstellen Sie eine neue Bewerbung.'
                  : 'Starten Sie Ihre Jobsuche und bewerben Sie sich auf interessante Stellen.'
                }
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="btn-outline mr-4"
              >
                Filter zurücksetzen
              </button>
              <Link to="/jobs" className="btn-primary">
                Jobs durchsuchen
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};