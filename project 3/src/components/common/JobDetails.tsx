import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  Users, 
  Clock,
  Zap,
  CheckCircle,
  Target,
  MessageCircle,
  Heart,
  Share2,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { jobService } from '../../services/jobService';
import { aiService } from '../../services/aiService';

interface MatchDetails {
  score: number;
  strengths: string[];
  gaps: string[];
}

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const [job, setJob] = useState<any | null>(null);
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(id);
        setJob(jobData);
        
        // If user is authenticated applicant, calculate match score
        if (isAuthenticated && user?.role === 'applicant') {
          setIsAnalyzing(true);
          try {
            // Simulate CV text for the analysis
            const mockCvText = "Frontend Developer with experience in React, TypeScript, and modern web technologies";
            const matchResult = await aiService.calculateCVMatch(id, mockCvText);
            
            if (matchResult.success) {
              setMatchDetails({
                score: matchResult.match_score,
                strengths: matchResult.strengths || [],
                gaps: matchResult.gaps || []
              });
            }
          } catch (error) {
            console.error('Error calculating match score:', error);
          } finally {
            setIsAnalyzing(false);
          }
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id, isAuthenticated, user]);

  if (loading || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-namuh-teal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/jobs" 
          className="inline-flex items-center text-namuh-teal hover:text-namuh-navy mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Jobsuche
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-namuh-navy mb-2">{job.title}</h1>
              <div className="flex items-center text-gray-600 mb-2">
                <Building className="h-4 w-4 mr-2" />
                <span className="font-medium">{job.company_name}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{job.location}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-lg border transition-colors ${
                  isSaved ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-400 hover:text-red-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-namuh-teal transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Job Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {job.salary_min && job.salary_max && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm">
                  {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} {job.currency}
                </span>
              </div>
            )}
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm">{job.employment_type || 'Vollzeit'}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-sm">
                Veröffentlicht: {new Date(job.posted_date).toLocaleDateString('de-DE')}
              </span>
            </div>
          </div>

          {/* Apply Button */}
          {isAuthenticated && user?.role === 'applicant' && (
            <Link 
              to={`/jobs/${job.id}/apply`}
              className="btn-primary w-full md:w-auto"
            >
              Jetzt bewerben
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-namuh-navy mb-4">Stellenbeschreibung</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>{job.description}</p>
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-namuh-navy mb-4">Ihre Aufgaben</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ul>
                    {job.responsibilities.map((responsibility: string, index: number) => (
                      <li key={index}>{responsibility}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-namuh-navy mb-4">Ihr Profil</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ul>
                    {job.qualifications.map((qualification: string, index: number) => (
                      <li key={index}>{qualification}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-namuh-navy mb-4">Wir bieten</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ul>
                    {job.benefits.map((benefit: string, index: number) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Analysis for authenticated applicants */}
            <AnimatePresence>
              {isAuthenticated && user?.role === 'applicant' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 bg-gradient-to-br from-namuh-teal/5 to-namuh-navy/5 border-namuh-teal/20"
                >
                  <div className="flex items-center mb-4">
                    <Zap className="h-5 w-5 text-namuh-teal mr-2" />
                    <h3 className="text-lg font-semibold text-namuh-navy">Match Analyse</h3>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-namuh-teal"></div>
                    </div>
                  ) : matchDetails ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-namuh-teal to-namuh-navy text-white text-2xl font-bold">
                          {matchDetails.score}%
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-namuh-teal mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ihre Stärken
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {matchDetails.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                              <span className="text-gray-700">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-yellow-600 mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Entwicklungsbereiche
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {matchDetails.gaps.map((gap, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></div>
                              <span className="text-gray-700">{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link to="/ai-hub" className="btn-outline text-sm w-full flex items-center justify-center">
                          <Zap className="h-4 w-4 mr-2" />
                          Skills verbessern
                        </Link>
                        <Link to="/chat" className="btn-outline text-sm w-full flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Beratung
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">
                        Laden Sie Ihren Lebenslauf hoch, um eine Match-Analyse zu erhalten.
                      </p>
                      <button className="btn-primary mt-4">Lebenslauf hochladen</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-namuh-navy mb-4">Über das Unternehmen</h3>
              <div className="flex items-center mb-3">
                <Building className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-medium">{job.company_name}</span>
              </div>
              <div className="flex items-center mb-3">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{job.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Mittelständisches Unternehmen</span>
              </div>
              
              {job.company_profiles && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    {job.company_profiles.description || 'Ein innovatives Unternehmen in seiner Branche.'}
                  </p>
                </div>
              )}
            </div>

            {/* Application Process */}
            {job.application_phases && job.application_phases.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-namuh-navy mb-4">Bewerbungsprozess</h3>
                <div className="space-y-3">
                  {job.application_phases.map((phase: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-6 h-6 bg-namuh-teal text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{phase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};