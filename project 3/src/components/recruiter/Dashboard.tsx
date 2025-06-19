import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus,
  FileText, 
  Users, 
  MessageCircle, 
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  Eye,
  Clock,
  Bell,
  CheckCircle,
  AlertCircle,
  Building2,
  Zap,
  User,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { motion } from 'framer-motion';
import supabase from '../../services/supabaseClient';
import { jobService } from '../../services/jobService';
import { chatService } from '../../services/chatService';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { applications, jobs, fetchJobs, fetchApplications } = useAppStore();
  const [newApplications, setNewApplications] = useState<any[]>([]);
  const [greeting, setGreeting] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [performanceStats, setPerformanceStats] = useState({
    viewsLastMonth: 0,
    applicationRate: 0,
    avgMatchScore: 0,
    timeToHire: 0
  });
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);

  // Filter data for current recruiter
  const myJobs = jobs.filter(job => job.recruiterId === user?.profileId);
  const myJobIds = myJobs.map(job => job.id);
  
  const myApplications = applications.filter(app => 
    myJobIds.includes(app.jobId)
  );
  
  // Get new/unprocessed applications
  useEffect(() => {
    const unprocessed = myApplications.filter(app => 
      app.status === 'Applied' || app.currentPhase === 'Bewerbung eingegangen'
    );
    setNewApplications(unprocessed);
  }, [myApplications]);

  // Get time-based greeting
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    
    let newGreeting;
    if (hour < 12) newGreeting = 'Guten Morgen';
    else if (hour < 18) newGreeting = 'Guten Tag';
    else newGreeting = 'Guten Abend';
    
    setGreeting(newGreeting);
  }, []);

  // Fetch additional data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch applications and jobs
        await fetchApplications();
        await fetchJobs();
        
        // Fetch performance stats
        const { data: stats } = await supabase.rpc('get_recruiter_performance_stats');
        if (stats) {
          setPerformanceStats({
            viewsLastMonth: stats.views_last_month || 0,
            applicationRate: stats.application_rate || 0,
            avgMatchScore: stats.avg_match_score || 0,
            timeToHire: stats.avg_time_to_hire || 0
          });
        }
        
        // Fetch unread message count
        const { data: conversations } = await chatService.getConversations();
        if (conversations) {
          const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
          setUnreadMessages(totalUnread);
        }
        
        // Fetch upcoming interviews from calendar if available
        // This would require integration with a calendar service
        // For now, we'll use placeholder data
        setUpcomingInterviews([
          {
            id: '1',
            title: 'Interview: Frontend Dev',
            candidate: 'Max Mustermann',
            date: new Date(2025, 0, 26),
            time: '10:00 - 11:00'
          },
          {
            id: '2',
            title: 'Team Meeting',
            candidate: 'Recruiting-Team',
            date: new Date(2025, 0, 29),
            time: '14:30 - 15:30'
          }
        ]);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, []);

  const stats = [
    { 
      label: 'Aktive Stellenanzeigen', 
      value: myJobs.filter(job => job.status === 'active').length, 
      icon: FileText,
      color: 'text-namuh-teal',
      bgColor: 'bg-namuh-teal/10'
    },
    { 
      label: 'Neue Bewerbungen', 
      value: newApplications.length, 
      icon: Bell,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      highlight: true
    },
    { 
      label: 'Ungelesene Nachrichten', 
      value: unreadMessages, 
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Diese Woche', 
      value: myApplications.filter(app => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return app.appliedDate >= weekAgo;
      }).length, 
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy">
            {greeting}, {user?.name.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            Hier ist ein Überblick zu Ihren Stellenausschreibungen und Kandidaten
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-6 shadow-sm border ${stat.highlight ? 'border-red-200 animate-pulse' : 'border-gray-100'} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-namuh-navy">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Unprocessed Applications */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-namuh-navy">
                  Neue unbearbeitete Bewerbungen ({newApplications.length})
                </h2>
                <Link 
                  to="/recruiter/applications" 
                  className="text-namuh-teal hover:text-namuh-teal-dark font-medium text-sm flex items-center"
                >
                  Alle anzeigen →
                </Link>
              </div>

              {newApplications.length > 0 ? (
                <div className="space-y-4">
                  {newApplications.slice(0, 3).map((application, index) => (
                    <div
                      key={application.id}
                      className="border border-red-100 bg-red-50/30 rounded-lg p-6 hover:border-red-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-namuh-navy">{application.applicantName}</h3>
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Neu</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Bewerbung für: {application.jobTitle}
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            Eingegangen: {application.appliedDate.toLocaleDateString('de-DE')} ({Math.floor((new Date().getTime() - application.appliedDate.getTime()) / (1000 * 3600 * 24))} Tage)
                          </p>
                          
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Unbearbeitet
                            </span>
                          </div>

                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center">
                              <Target className="h-4 w-4 text-namuh-teal mr-1" />
                              <span className="text-namuh-teal font-medium">Match Score</span>
                              <span className="ml-2 font-semibold">{application.matchScore}%</span>
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                              <span className="text-gray-600">Einladungswahrscheinlichkeit</span>
                              <span className={`ml-2 font-semibold ${
                                application.invitationLikelihood === 'High' ? 'text-green-600' :
                                application.invitationLikelihood === 'Moderate' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {application.invitationLikelihood === 'High' ? 'Hoch' :
                                 application.invitationLikelihood === 'Moderate' ? 'Mittel' : 'Niedrig'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Link 
                            to={`/recruiter/applications/${application.id}`}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            Jetzt prüfen
                          </Link>
                          <button className="btn-outline text-sm px-4 py-2">
                            Kontaktieren
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {newApplications.length > 3 && (
                    <div className="text-center mt-4">
                      <Link to="/recruiter/applications" className="btn-outline">
                        {newApplications.length - 3} weitere unbearbeitete Bewerbungen anzeigen
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Alle neuen Bewerbungen wurden bearbeitet</p>
                  <Link to="/recruiter/applications" className="btn-outline">
                    Alle Bewerbungen anzeigen
                  </Link>
                </div>
              )}
            </div>

            {/* Analytics Overview */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-namuh-navy flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-namuh-teal" />
                  Performance-Übersicht
                </h2>
                <Link to="/recruiter/analytics" className="text-namuh-teal hover:text-namuh-teal-dark font-medium text-sm">
                  Details →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Stellenaufrufe (letzte 30 Tage)</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-namuh-navy">{performanceStats.viewsLastMonth.toLocaleString()}</div>
                    <div className="text-green-600 text-sm font-medium flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.5%
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-namuh-teal rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Durchschnittlicher Match Score</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-namuh-navy">{performanceStats.avgMatchScore}%</div>
                    <div className="text-green-600 text-sm font-medium flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5.2%
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{width: `${performanceStats.avgMatchScore}%`}}></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Conversion Rate</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-namuh-navy">{performanceStats.applicationRate.toFixed(1)}%</div>
                    <div className="text-red-600 text-sm font-medium flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                      -0.8%
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{width: `${performanceStats.applicationRate * 10}%`}}></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Time-to-Hire (Tage)</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-namuh-navy">{performanceStats.timeToHire.toFixed(1)}</div>
                    <div className="text-green-600 text-sm font-medium flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                      -2.3
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-purple-500 rounded-full" style={{width: '70%'}}></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 text-sm text-gray-500 flex justify-center">
                <span className="text-center">Die Daten basieren auf Ihrer Aktivität der letzten 30 Tage</span>
              </div>
            </div>

            {/* Active Job Postings */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-namuh-navy mb-6">
                Meine aktiven Stellenausschreibungen ({myJobs.filter(job => job.status === 'active').length})
              </h2>

              {myJobs.filter(job => job.status === 'active').length > 0 ? (
                <div className="space-y-4">
                  {myJobs.filter(job => job.status === 'active').slice(0, 3).map((job, index) => {
                    const jobApplications = myApplications.filter(app => app.jobId === job.id);
                    const newApplicationsCount = jobApplications.filter(app => 
                      app.status === 'Applied' || app.currentPhase === 'Bewerbung eingegangen'
                    ).length;
                    
                    return (
                      <div
                        key={job.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-namuh-teal/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-namuh-navy">{job.title}</h3>
                            <p className="text-gray-600">{job.companyName}</p>
                            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Veröffentlicht: {job.postedDate.toLocaleDateString('de-DE')}
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {job.performanceStats.impressions} Aufrufe
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {job.performanceStats.clicks} Klicks
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-namuh-teal" />
                              <span className="text-lg font-semibold text-namuh-teal">
                                {jobApplications.length} Bewerbung{jobApplications.length !== 1 ? 'en' : ''}
                              </span>
                            </div>
                            {newApplicationsCount > 0 && (
                              <div className="mt-1 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full inline-flex items-center">
                                <Bell className="h-3 w-3 mr-1" />
                                {newApplicationsCount} neue
                              </div>
                            )}
                            <Link 
                              to={`/recruiter/jobs/${job.id}/applications`}
                              className="text-sm text-namuh-teal hover:text-namuh-teal-dark mt-2 inline-block"
                            >
                              Details anzeigen →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Keine aktiven Stellenausschreibungen</p>
                  <Link to="/recruiter/jobs/create" className="btn-primary">
                    Erste Stellenausschreibung erstellen
                  </Link>
                </div>
              )}

              {myJobs.filter(job => job.status === 'active').length > 3 && (
                <div className="text-center mt-4">
                  <Link to="/recruiter/jobs" className="btn-outline">
                    Alle Stellenausschreibungen anzeigen
                  </Link>
                </div>
              )}
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
                  <p className="text-sm text-gray-500">Senior Recruiter</p>
                  <p className="text-xs text-namuh-teal mt-1">{user?.email}</p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link to="/profile" className="btn-outline text-center text-sm">
                  <User className="h-3 w-3 mr-1 inline-block" />
                  Profil
                </Link>
                <Link to="/chat" className="btn-outline text-center text-sm">
                  <MessageCircle className="h-3 w-3 mr-1 inline-block" />
                  Nachrichten
                </Link>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="font-semibold text-namuh-navy mb-4">Schnellaktionen</h2>
              
              <div className="space-y-3">
                <Link to="/recruiter/jobs/create" className="flex items-center justify-between p-3 bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 text-namuh-teal mr-3" />
                    <div>
                      <div className="font-medium text-sm">Stelle ausschreiben</div>
                      <div className="text-xs text-gray-500">Neue Stellenanzeige erstellen</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-namuh-teal" />
                </Link>
                
                <Link to="/recruiter/talent-pool" className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-namuh-navy mr-3" />
                    <div>
                      <div className="font-medium text-sm">Talent Pool</div>
                      <div className="text-xs text-gray-500">Kandidaten verwalten</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-namuh-navy" />
                </Link>
                
                <Link to="/recruiter/multiposting" className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-namuh-navy mr-3" />
                    <div>
                      <div className="font-medium text-sm">Multiposting</div>
                      <div className="text-xs text-gray-500">Stellen verbreiten</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-namuh-navy" />
                </Link>
              </div>
            </div>
            
            {/* Subscription & Limits */}
            <div className="card p-6 bg-gradient-to-br from-namuh-navy/10 to-namuh-teal/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-namuh-navy">Ihr {user?.tier.split('_')[1].charAt(0).toUpperCase() + user?.tier.split('_')[1].slice(1)} Plan</h2>
                <span className="bg-namuh-navy/20 text-namuh-navy px-2 py-1 rounded text-xs font-medium">
                  {user?.tier.split('_')[1].charAt(0).toUpperCase() + user?.tier.split('_')[1].slice(1)}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Aktive Stellenanzeigen</span>
                    <span className="font-medium">{myJobs.filter(job => job.status === 'active').length} / {getLimitForTier(user?.tier, 'job_postings')}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-namuh-teal rounded-full" 
                      style={{ 
                        width: `${(myJobs.filter(job => job.status === 'active').length / getLimitForTier(user?.tier, 'job_postings')) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Talent Pool Suchen</span>
                    <span className="font-medium">12 / {getLimitForTier(user?.tier, 'talent_searches')} verbleibend</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-namuh-navy rounded-full" 
                      style={{ width: '76%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Speicherplatz</span>
                    <span className="font-medium">4.2GB / {getLimitForTier(user?.tier, 'storage')}GB</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: '17%' }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                Ihr Plan verlängert sich automatisch am 15.02.2024
              </div>
              
              <div className="mt-4">
                <Link to="/settings/subscription" className="btn-outline w-full text-center text-sm">
                  Plan verwalten
                </Link>
              </div>
            </div>
            
            {/* Upcoming Events */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-namuh-navy">Anstehende Termine</h2>
                <Calendar className="h-4 w-4 text-namuh-navy" />
              </div>
              
              {upcomingInterviews.length > 0 ? (
                <div className="space-y-3">
                  {upcomingInterviews.map((event, index) => (
                    <div key={index} className="flex p-3 border border-gray-100 rounded-lg">
                      <div className="mr-3 flex flex-col items-center justify-center bg-purple-100 px-2 rounded text-purple-600">
                        <span className="text-xs font-bold">{event.date.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase()}</span>
                        <span className="text-lg font-bold">{event.date.getDate()}</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time}
                        </div>
                        <div className="text-xs text-purple-600 mt-1">{event.candidate}</div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get limits based on subscription tier
function getLimitForTier(tier?: string, limitType?: string): number {
  const limits: Record<string, Record<string, number>> = {
    recruiter_basis: {
      job_postings: 2,
      talent_searches: 0,
      storage: 1,
      team_members: 1
    },
    recruiter_starter: {
      job_postings: 7,
      talent_searches: 10, 
      storage: 5,
      team_members: 3
    },
    recruiter_professional: {
      job_postings: 20,
      talent_searches: 50,
      storage: 25,
      team_members: 10
    },
    recruiter_enterprise: {
      job_postings: 999, // Unlimited
      talent_searches: 200,
      storage: 100,
      team_members: 999 // Unlimited
    }
  };
  
  if (!tier || !limitType || !limits[tier]) return 0;
  return limits[tier][limitType] || 0;
}