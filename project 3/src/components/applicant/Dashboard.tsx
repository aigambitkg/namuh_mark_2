import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  BookOpen, 
  Calendar, 
  MessageCircle, 
  FileText, 
  Briefcase as BriefcaseBusiness, 
  Award, 
  PlusCircle, 
  BookMarked, 
  Sparkles, 
  Zap, 
  Users, 
  Briefcase, 
  User, 
  Bell, 
  ArrowRight, 
  Clock, 
  MapPin, 
  DollarSign, 
  Send, 
  ExternalLink, 
  Upload, 
  X 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { jobService } from '../../services/jobService';
import { chatService } from '../../services/chatService';

export const ApplicantDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { applications, jobs, fetchJobs, fetchApplications } = useAppStore();
  const [greeting, setGreeting] = useState('');
  const [showQuickApplyTooltip, setShowQuickApplyTooltip] = useState(false);
  const [recentlyViewedJobs, setRecentlyViewedJobs] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);

  // Get time-based greeting
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    
    let newGreeting;
    if (hour < 12) newGreeting = 'Guten Morgen';
    else if (hour < 18) newGreeting = 'Guten Tag';
    else newGreeting = 'Guten Abend';
    
    setGreeting(newGreeting);

    // Show Quick Apply tooltip after 2 seconds for new users
    const hasSeenTooltip = localStorage.getItem('hasSeenQuickApplyTooltip');
    if (!hasSeenTooltip) {
      setTimeout(() => {
        setShowQuickApplyTooltip(true);
        // Hide after 8 seconds
        setTimeout(() => {
          setShowQuickApplyTooltip(false);
          localStorage.setItem('hasSeenQuickApplyTooltip', 'true');
        }, 8000);
      }, 2000);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch applications and jobs
        await fetchApplications();
        await fetchJobs();
        
        // Fetch recently viewed jobs
        const { data: recentJobs } = await supabase
          .from('user_job_views')
          .select(`
            job_id,
            viewed_at,
            jobs(
              id,
              title,
              company_name,
              location,
              salary_min,
              salary_max,
              currency,
              posted_date,
              performance_stats
            )
          `)
          .order('viewed_at', { ascending: false })
          .limit(2);
          
        if (recentJobs) {
          setRecentlyViewedJobs(recentJobs.map(item => ({
            ...item.jobs,
            postedDate: new Date(item.jobs.posted_date)
          })));
        }
        
        // Fetch unread message count
        const { data: conversations } = await chatService.getConversations();
        if (conversations) {
          const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
          setUnreadMessages(totalUnread);
        }
        
        // Fetch upcoming interviews from calendar if available
        // This would require integration with a calendar service
        // For now, we'll use mock data
        setUpcomingInterviews([
          {
            id: '1',
            title: 'Vorstellungsgespräch',
            company: 'TechCorp GmbH',
            date: new Date(2025, 0, 25), // January 25, 2025
            time: '14:00 - 15:00'
          },
          {
            id: '2',
            title: 'Tech Meetup',
            company: 'Berlin Tech Hub',
            date: new Date(2025, 1, 2), // February 2, 2025
            time: '18:30 - 21:00'
          }
        ]);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, []);

  // Filter to this user's applications
  const userApplications = applications.filter(app => app.applicantId === user?.id);

  // Personalized job recommendations - get jobs with high match scores
  const recommendedJobs = jobs
    .filter(job => job.matchScore && job.matchScore > 80)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy">
            {greeting}, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">
            Hier ist ein Überblick zu Ihren Bewerbungen und passenden Jobs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Apply Feature */}
            <div className="relative">
              <motion.div 
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                className="card p-6 bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 border border-namuh-teal/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-namuh-navy mb-2 flex items-center">
                      <Zap className="h-5 w-5 text-namuh-teal mr-2" />
                      Quick Apply: Mehrfachbewerbungen
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Bewerben Sie sich mit wenigen Klicks auf bis zu 10 Stellen gleichzeitig. 
                      Unsere KI erstellt passende Anschreiben für jede Stelle.
                    </p>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-6">
                      <li className="flex items-center text-sm text-gray-600">
                        <Send className="h-4 w-4 text-namuh-teal mr-2" />
                        <span>Gleichzeitig auf mehrere Stellen bewerben</span>
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <Sparkles className="h-4 w-4 text-namuh-teal mr-2" />
                        <span>KI-generierte personalisierte Anschreiben</span>
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <ExternalLink className="h-4 w-4 text-namuh-teal mr-2" />
                        <span>Externe Stellenangebote hinzufügen</span>
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <Upload className="h-4 w-4 text-namuh-teal mr-2" />
                        <span>Dokumente in einem Schritt beifügen</span>
                      </li>
                    </ul>
                  </div>

                  <Link 
                    to="/quick-apply" 
                    className="btn-primary px-4 py-2 text-sm md:text-base flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Quick Apply starten
                  </Link>
                </div>
              </motion.div>

              {/* Tooltip */}
              <AnimatePresence>
                {showQuickApplyTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -right-4 -top-4 bg-namuh-navy text-white px-4 py-3 rounded-lg shadow-lg max-w-xs z-10"
                  >
                    <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-namuh-navy"></div>
                    <p className="text-sm">
                      <strong>NEU!</strong> Mit Quick Apply können Sie sich zeitsparend auf bis zu 10 Stellen gleichzeitig bewerben!
                    </p>
                    <button 
                      onClick={() => setShowQuickApplyTooltip(false)} 
                      className="absolute top-1 right-1 text-white/70 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Application Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div 
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aktive Bewerbungen</p>
                    <p className="text-3xl font-bold text-namuh-navy">{userApplications.length}</p>
                  </div>
                  <div className="bg-namuh-teal/10 p-3 rounded-full">
                    <Briefcase className="h-6 w-6 text-namuh-teal" />
                  </div>
                </div>
                <div className="mt-2">
                  <Link to="/applications" className="text-xs text-namuh-teal hover:underline flex items-center">
                    Alle anzeigen
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Anstehende Interviews</p>
                    <p className="text-3xl font-bold text-purple-600">{upcomingInterviews.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <Link to="/calendar" className="text-xs text-purple-600 hover:underline flex items-center">
                    Kalender ansehen
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Neue Nachrichten</p>
                    <p className="text-3xl font-bold text-namuh-teal">{unreadMessages}</p>
                  </div>
                  <div className="bg-namuh-teal/10 p-3 rounded-full">
                    <MessageCircle className="h-6 w-6 text-namuh-teal" />
                  </div>
                </div>
                <div className="mt-2">
                  <Link to="/chat" className="text-xs text-namuh-teal hover:underline flex items-center">
                    Zum Postfach
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Recent Applications */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-namuh-navy">Letzten Bewerbungen</h2>
                <Link to="/applications" className="text-sm text-namuh-teal hover:underline flex items-center">
                  Alle ansehen
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {userApplications.length > 0 ? (
                  userApplications.slice(0, 3).map((application) => (
                    <div key={application.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                        application.status === 'Applied' ? 'bg-blue-500' :
                        application.status === 'Under Review' ? 'bg-yellow-500' :
                        application.status === 'Interviewing' ? 'bg-purple-600' :
                        application.status === 'Offer' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}>
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900">{application.jobTitle}</h3>
                        <p className="text-sm text-gray-500">{application.companyName}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          application.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'Interviewing' ? 'bg-purple-100 text-purple-800' :
                          application.status === 'Offer' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {application.appliedDate.toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Noch keine Bewerbungen</p>
                    <Link to="/jobs" className="btn-primary mt-3 inline-block">
                      Jobs entdecken
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Job Recommendations */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-namuh-navy">Empfohlene Jobs</h2>
                <Link to="/jobs" className="text-sm text-namuh-teal hover:underline flex items-center">
                  Alle Jobs
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {recommendedJobs.map(job => (
                  <div key={job.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link to={`/jobs/${job.id}`} className="font-medium text-namuh-navy hover:text-namuh-teal transition-colors">
                          {job.title}
                        </Link>
                        <div className="text-sm text-gray-500">{job.companyName}</div>
                      </div>
                      <div className="bg-namuh-teal/10 text-namuh-teal px-2 py-1 rounded-full text-xs font-medium">
                        {job.matchScore}% Match
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {job.currency}{job.salaryMin.toLocaleString()} - {job.currency}{job.salaryMax.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {job.postedDate.toLocaleDateString('de-DE')}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Link to={`/jobs/${job.id}`} className="btn-outline text-xs px-3 py-1.5">
                        Details
                      </Link>
                      <Link to={`/jobs/${job.id}/apply`} className="btn-primary text-xs px-3 py-1.5 flex items-center">
                        <Send className="h-3 w-3 mr-1" />
                        Bewerben
                      </Link>
                    </div>
                  </div>
                ))}

                {recommendedJobs.length === 0 && (
                  <div className="text-center py-6">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Noch keine Jobempfehlungen verfügbar</p>
                    <p className="text-sm text-gray-400 mb-3">Erstellen Sie Ihr Profil, um passende Jobs zu erhalten</p>
                    <Link to="/profile" className="btn-primary inline-block">
                      Profil vervollständigen
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-namuh-teal to-namuh-navy rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h2 className="font-semibold text-namuh-navy">{user?.name}</h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <div className="flex items-center mt-2">
                    <Target className="h-4 w-4 text-namuh-teal mr-1" />
                    <span className="text-xs font-medium">{user?.tier.split('_')[1].charAt(0).toUpperCase() + user?.tier.split('_')[1].slice(1)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link to="/profile" className="btn-outline w-full text-center text-sm">
                  Profil bearbeiten
                </Link>
              </div>
            </div>
            
            {/* KI-Tokens & Tools */}
            <div className="card p-6 bg-gradient-to-br from-namuh-teal/10 to-namuh-navy/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-namuh-navy">KI-Tokens</h2>
                <div className="bg-namuh-teal/20 text-namuh-teal px-3 py-1 rounded-full text-sm font-medium">
                  {user?.tokenBalance} verfügbar
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Verwenden Sie Ihre KI-Tokens für smarte Tools, die Ihren Bewerbungsprozess optimieren
              </p>
              
              <div className="space-y-3">
                <Link to="/ai-hub/cv-optimizer" className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-namuh-teal mr-3" />
                    <div>
                      <div className="font-medium text-sm">CV Optimizer</div>
                      <div className="text-xs text-gray-500">1 Token</div>
                    </div>
                  </div>
                  <Zap className="h-4 w-4 text-namuh-teal" />
                </Link>
                
                <Link to="/ai-hub/interview-prep" className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-namuh-teal mr-3" />
                    <div>
                      <div className="font-medium text-sm">Interview Prep</div>
                      <div className="text-xs text-gray-500">2 Tokens</div>
                    </div>
                  </div>
                  <Zap className="h-4 w-4 text-namuh-teal" />
                </Link>
                
                <Link to="/ai-hub/cover-letter" className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <BookMarked className="h-5 w-5 text-namuh-teal mr-3" />
                    <div>
                      <div className="font-medium text-sm">Cover Letter</div>
                      <div className="text-xs text-gray-500">1 Token</div>
                    </div>
                  </div>
                  <Zap className="h-4 w-4 text-namuh-teal" />
                </Link>
              </div>
              
              <div className="mt-4">
                <Link to="/pricing" className="text-namuh-teal hover:underline text-sm flex items-center justify-center">
                  Mehr Tokens erwerben
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Upcoming Events */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-namuh-navy">Anstehende Events</h2>
                <Bell className="h-4 w-4 text-namuh-navy" />
              </div>
              
              {upcomingInterviews.length > 0 ? (
                <div className="space-y-3">
                  {upcomingInterviews.map((event, index) => (
                    <div key={index} className="flex p-3 border border-gray-100 rounded-lg">
                      <div className="mr-3 flex flex-col items-center justify-center bg-namuh-teal/10 px-2 rounded text-namuh-teal">
                        <span className="text-xs font-bold">{event.date.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase()}</span>
                        <span className="text-lg font-bold">{event.date.getDate()}</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time}
                        </div>
                        <div className="text-xs text-namuh-teal mt-1">{event.company}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Keine anstehenden Termine</p>
                </div>
              )}
              
              <div className="mt-4">
                <Link to="/calendar" className="text-namuh-teal hover:underline text-sm flex items-center justify-center">
                  Alle Events anzeigen
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Community Activity */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-namuh-navy">Community</h2>
                <Users className="h-4 w-4 text-namuh-navy" />
              </div>
              
              <div className="space-y-3">
                <Link to="/community" className="block p-3 border border-gray-100 rounded-lg hover:border-namuh-teal/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">React vs Vue.js</span>
                    <span className="text-xs bg-namuh-teal/10 text-namuh-teal px-2 py-0.5 rounded-full">Diskussion</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">23 neue Kommentare</p>
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-white">
                        U
                      </div>
                    ))}
                  </div>
                </Link>
                
                <Link to="/community" className="block p-3 border border-gray-100 rounded-lg hover:border-namuh-teal/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Remote Work Tips</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Beliebt</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">42 Upvotes • 18 Kommentare</p>
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-white">
                        U
                      </div>
                    ))}
                  </div>
                </Link>
              </div>
              
              <div className="mt-4">
                <Link to="/community" className="text-namuh-teal hover:underline text-sm flex items-center justify-center">
                  Zum Community Forum
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};