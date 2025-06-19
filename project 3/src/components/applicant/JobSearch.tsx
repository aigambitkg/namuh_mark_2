import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Filter,
  Heart,
  BookmarkPlus,
  Building2,
  Clock,
  Users,
  Sparkles,
  Zap,
  Target,
  Bot,
  Send,
  ArrowRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import JobCard from '../common/JobCard';

// Debounced search hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const JobSearch: React.FC = () => {
  const { jobs, isLoading, searchQuery, setSearchQuery, filters, updateFilters, fetchJobs } = useAppStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // Local state
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState<string[]>([]);
  const [isAISearching, setIsAISearching] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Debounced search
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Update global search when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  // Fetch jobs when filters or search query change
  useEffect(() => {
    fetchJobs();
  }, [filters, debouncedSearchQuery]);

  // AI search handler
  const handleAISearch = useCallback(async () => {
    if (!aiSearchQuery.trim()) return;
    
    setIsAISearching(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = [
      `Basierend auf "${aiSearchQuery}" wurden ${Math.floor(Math.random() * 50 + 10)} relevante Stellen gefunden`,
      'KI-Empfehlung: Frontend Developer Positionen passen zu 95% zu Ihren Anforderungen',
      'Zusätzlich gefunden: 3 Remote-Positionen mit flexiblen Arbeitszeiten',
      'Gehaltsbereich-Analyse: €60.000 - €85.000 entspricht Ihren Vorstellungen',
      'Skill-Match: React, TypeScript und Node.js sind besonders gefragt'
    ];
    
    setAiSearchResults(mockResults);
    setIsAISearching(false);
    setSearchQuery(aiSearchQuery);
  }, [aiSearchQuery, setSearchQuery]);

  const toggleSaveJob = useCallback((jobId: string) => {
    setSavedJobs(prev => {
      const newSavedJobs = new Set(prev);
      if (newSavedJobs.has(jobId)) {
        newSavedJobs.delete(jobId);
      } else {
        newSavedJobs.add(jobId);
      }
      return newSavedJobs;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy">Stellenausschreibungen</h1>
          <p className="mt-2 text-gray-600">
            {isAuthenticated 
              ? 'Entdecken Sie Möglichkeiten, die zu Ihren Fähigkeiten und Ambitionen passen'
              : 'Entdecken Sie Karrieremöglichkeiten bei führenden Unternehmen'
            }
          </p>
        </div>

        {/* Search Bar */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Suchen Sie nach Jobs, Unternehmen oder Schlüsselwörtern..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAISearch(!showAISearch)}
                className={`btn-primary flex items-center space-x-2 ${
                  showAISearch ? 'bg-namuh-navy' : ''
                }`}
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">KI-Suche</span>
              </motion.button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* AI Search Section */}
          <AnimatePresence>
            {showAISearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="bg-gradient-to-r from-namuh-teal/5 to-namuh-navy/5 rounded-lg p-6 border border-namuh-teal/20">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-6 w-6 text-namuh-teal mr-3" />
                    <h3 className="text-lg font-semibold text-namuh-navy">KI-gestützte Jobsuche</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Beschreiben Sie Ihre ideale Position, gewünschte Skills oder Arbeitsumgebung. 
                    Unsere KI durchsucht alle verfügbaren Stellen für Sie.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <textarea
                        placeholder="z.B.: 'Frontend Developer mit React Erfahrung, Remote-Arbeit möglich, kreatives Umfeld, Startup-Atmosphäre...'"
                        value={aiSearchQuery}
                        onChange={(e) => setAiSearchQuery(e.target.value)}
                        rows={3}
                        className="input-field resize-none"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAISearch}
                        disabled={!aiSearchQuery.trim() || isAISearching}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isAISearching ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Suche läuft...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            <span>KI-Suche starten</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* AI Search Results */}
                  {aiSearchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-white rounded-lg border border-namuh-teal/10"
                    >
                      <h4 className="font-medium text-namuh-navy mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        KI-Suchergebnisse:
                      </h4>
                      <ul className="space-y-2">
                        {aiSearchResults.map((result, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-sm text-gray-700 flex items-start"
                          >
                            <div className="w-2 h-2 bg-namuh-teal rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            {result}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Standort</label>
                    <input
                      type="text"
                      placeholder="z.B., Berlin, München..."
                      value={filters.location}
                      onChange={(e) => updateFilters({ location: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Anstellungsart</label>
                    <select
                      value={filters.employmentType}
                      onChange={(e) => updateFilters({ employmentType: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Alle Arten</option>
                      <option value="full-time">Vollzeit</option>
                      <option value="part-time">Teilzeit</option>
                      <option value="contract">Vertrag</option>
                      <option value="internship">Praktikum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min. Gehalt (€)</label>
                    <input
                      type="number"
                      placeholder="z.B., 50000"
                      value={filters.salaryMin || ''}
                      onChange={(e) => updateFilters({ salaryMin: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="leadership"
                      checked={filters.isLeadershipRole}
                      onChange={(e) => updateFilters({ isLeadershipRole: e.target.checked })}
                      className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                    />
                    <label htmlFor="leadership" className="ml-2 text-sm text-gray-700">
                      Nur Führungspositionen
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {jobs.length} Stelle{jobs.length !== 1 ? 'n' : ''} gefunden
          </p>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Relevanteste</option>
            <option>Neueste zuerst</option>
            <option>Höchstes Gehalt</option>
            {isAuthenticated && <option>Beste Übereinstimmung</option>}
          </select>
        </div>

        {/* Job Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-namuh-teal"></div>
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <JobCard 
                key={job.id}
                job={job}
                index={index}
                savedJobs={savedJobs}
                onToggleSave={toggleSaveJob}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Stellen gefunden</h3>
            <p className="text-gray-500 mb-4">
              Versuchen Sie, Ihre Suchkriterien oder Filter anzupassen
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setLocalSearchQuery('');
                  updateFilters({
                    location: '',
                    employmentType: '',
                    salaryMin: 0,
                    isLeadershipRole: false,
                  });
                }}
                className="btn-outline"
              >
                Filter zurücksetzen
              </button>
              <button
                onClick={() => setShowAISearch(true)}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Bot className="h-4 w-4" />
                <span>KI-Suche versuchen</span>
              </button>
            </div>
          </div>
        )}

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="card p-8 bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10">
              <h3 className="text-xl font-bold text-namuh-navy mb-4">
                Bereit für den nächsten Karriereschritt?
              </h3>
              <p className="text-gray-600 mb-6">
                Registrieren Sie sich kostenlos und erhalten Sie Zugang zu erweiterten Suchfunktionen, 
                Match-Scores und KI-gestützten Bewerbungstools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary">
                  Kostenlos registrieren
                </Link>
                <Link to="/login" className="btn-outline">
                  Bereits Mitglied? Anmelden
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};