import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Archive, MoreVertical, Calendar, Users, MapPin, DollarSign, Clock, Target } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

export const RecruiterJobs: React.FC = () => {
  const { user } = useAuthStore();
  const { jobs, applications, isLoading, fetchJobs, fetchApplications, updateJob } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  // Fetch jobs and applications on mount
  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // Filter jobs for current recruiter
  const myJobs = jobs.filter(job => job.recruiterId === user?.id);
  
  // Apply filters
  const filteredJobs = myJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getApplicationCount = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId).length;
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    updateJob(jobId, { status: newStatus as 'active' | 'draft' | 'archived' });
    setShowDropdown(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-namuh-navy">Meine Stellenanzeigen</h1>
            <p className="mt-2 text-gray-600">
              Verwalten Sie Ihre Stellenausschreibungen und verfolgen Sie deren Performance.
            </p>
          </div>
          <Link to="/recruiter/jobs/create" className="mt-4 sm:mt-0 btn-primary inline-flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Neue Stelle erstellen
          </Link>
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
                <option value="active">Aktiv</option>
                <option value="draft">Entwurf</option>
                <option value="archived">Archiviert</option>
              </select>
              <button className="btn-outline flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-namuh-teal mb-2">
              {myJobs.filter(job => job.status === 'active').length}
            </div>
            <div className="text-gray-600">Aktive Stellen</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {myJobs.filter(job => job.status === 'draft').length}
            </div>
            <div className="text-gray-600">Entwürfe</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {applications.length}
            </div>
            <div className="text-gray-600">Gesamt Bewerbungen</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-namuh-teal"></div>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-semibold text-namuh-navy">{job.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            job.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : job.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status === 'active' ? 'Aktiv' : job.status === 'draft' ? 'Entwurf' : 'Archiviert'}
                          </span>
                        </div>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Erstellt: {job.postedDate.toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            €{job.salaryMin.toLocaleString()} - €{job.salaryMax.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === job.id ? null : job.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </button>

                        <AnimatePresence>
                          {showDropdown === job.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1 border border-gray-200"
                            >
                              <Link 
                                to={`/recruiter/jobs/${job.id}`}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Details ansehen
                              </Link>
                              <Link 
                                to={`/recruiter/jobs/${job.id}/edit`}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Bearbeiten
                              </Link>
                              {job.status !== 'active' && (
                                <button
                                  onClick={() => handleStatusChange(job.id, 'active')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Aktivieren
                                </button>
                              )}
                              {job.status !== 'draft' && (
                                <button
                                  onClick={() => handleStatusChange(job.id, 'draft')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Auf Entwurf setzen
                                </button>
                              )}
                              {job.status !== 'archived' && (
                                <button
                                  onClick={() => handleStatusChange(job.id, 'archived')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archivieren
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>Aufrufe</span>
                        </div>
                        <p className="text-lg font-semibold text-namuh-navy">
                          {job.performanceStats?.impressions || 0}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Klicks</span>
                        </div>
                        <p className="text-lg font-semibold text-namuh-navy">
                          {job.performanceStats?.clicks || 0}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Bewerbungen</span>
                        </div>
                        <p className="text-lg font-semibold text-namuh-navy">
                          {getApplicationCount(job.id)}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Target className="h-4 w-4 mr-1" />
                          <span>Conversion</span>
                        </div>
                        <p className="text-lg font-semibold text-namuh-teal">
                          {job.performanceStats?.impressions ? 
                            `${((getApplicationCount(job.id) / job.performanceStats.impressions) * 100).toFixed(1)}%` : 
                            '0%'}
                        </p>
                      </div>
                    </div>

                    {/* Tags / Attributes */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.isLeadershipRole && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Führungsposition
                        </span>
                      )}
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                        {job.employmentType || 'Vollzeit'}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {job.applicationPhases?.length || 0} Bewerbungsphasen
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 mt-4 lg:mt-0">
                    <Link to={`/recruiter/jobs/${job.id}/applications`} className="btn-primary">
                      Bewerbungen ({getApplicationCount(job.id)})
                    </Link>
                    <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn-outline flex items-center justify-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>Bearbeiten</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Stellen gefunden</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Passen Sie Ihre Suchkriterien an oder erstellen Sie eine neue Stelle.'
                  : 'Sie haben noch keine Stellenanzeigen erstellt.'
                }
              </p>
              <Link to="/recruiter/jobs/create" className="btn-primary">
                Erste Stellenausschreibung erstellen
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};