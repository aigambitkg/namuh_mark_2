import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  FileText, 
  Brain, 
  MessageCircle, 
  Users,
  Target,
  BarChart3,
  User,
  Hash,
  Globe,
  Settings,
  TrendingUp,
  Calendar,
  Zap,
  Mail,
  Bot
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { scrollToTop } from '../../utils/scrollHelper';

export const MobileNavigation: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  
  // Define navigation items based on user role
  const applicantNavItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/applications', label: 'Bewerbungen', icon: FileText },
    { path: '/ai-hub', label: 'AI Hub', icon: Brain },
    { path: '/quiz-me', label: 'Quiz-Me', icon: Zap, desktop: true },
    { path: '/chat', label: 'Chat', icon: MessageCircle, desktop: true },
    { path: '/gemini-chat', label: 'Gemini AI', icon: Bot },
    { path: '/community', label: 'Community', icon: Hash, desktop: true },
    { path: '/profile', label: 'Profil', icon: User }
  ];
  
  const recruiterNavItems = [
    { path: '/recruiter/dashboard', label: 'Home', icon: Home },
    { path: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/recruiter/applications', label: 'Bewerbungen', icon: FileText },
    { path: '/recruiter/talent-pool', label: 'Talent', icon: Users },
    { path: '/recruiter/analytics', label: 'Analytics', icon: BarChart3, desktop: true },
    { path: '/recruiter/multiposting', label: 'Posting', icon: Globe, desktop: true },
    { path: '/chat', label: 'Chat', icon: MessageCircle, desktop: true },
    { path: '/profile', label: 'Profil', icon: User }
  ];

  // Filter items for mobile view (only show first 5 items)
  const mobileNavItems = user?.role === 'applicant' 
    ? applicantNavItems.filter((_, index) => index < 5)
    : recruiterNavItems.filter((_, index) => index < 5);
    
  // Full navigation for desktop
  const desktopNavItems = user?.role === 'applicant' ? applicantNavItems : recruiterNavItems;

  const isActiveRoute = (path: string) => {
    // For dashboard, exact match only
    if (path === '/dashboard' || path === '/recruiter/dashboard') {
      return location.pathname === path;
    }
    // For other routes, check if path is included in the current pathname
    return location.pathname.startsWith(path);
  };

  // Handle navigation with scroll to top
  const handleNavigation = (path: string) => {
    if (location.pathname !== path) {
      scrollToTop();
    }
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center h-16">
          {mobileNavItems.map((item, index) => {
            const active = isActiveRoute(item.path);
            return (
              <Link
                key={index}
                to={item.path}
                className="flex flex-col items-center justify-center w-full h-full relative"
                onClick={() => handleNavigation(item.path)}
              >
                {active && (
                  <motion.div 
                    layoutId="activeTab-mobile"
                    className="absolute inset-x-0 -top-0.5 h-0.5 bg-namuh-teal"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <div 
                  className={`flex flex-col items-center justify-center transition-all duration-200 ${
                    active ? 'text-namuh-teal -translate-y-1' : 'text-gray-500'
                  }`}
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Side Navigation */}
      <div className="hidden lg:block fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30 overflow-y-auto">
        <div className="py-6 px-4">
          {/* User Profile Summary */}
          <div className="mb-8 px-2">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-namuh-teal rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-namuh-navy truncate">{user?.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm bg-namuh-teal/10 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-namuh-teal mr-2" />
              <span className="text-namuh-teal">{user?.role === 'applicant' ? `${user.tokenBalance} Tokens` : 'Pro Account'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {desktopNavItems.map((item, index) => {
              const active = isActiveRoute(item.path);
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                    active 
                      ? 'bg-namuh-teal/10 text-namuh-teal' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-namuh-teal'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {active && (
                    <motion.div 
                      layoutId="activeTab-desktop"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-namuh-teal rounded-r-full"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <item.icon className={`h-5 w-5 mr-3 ${
                    active ? 'text-namuh-teal' : 'text-gray-400 group-hover:text-namuh-teal'
                  }`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Settings Link */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              to="/settings"
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                location.pathname === '/settings' 
                  ? 'bg-namuh-teal/10 text-namuh-teal' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-namuh-teal'
              }`}
              onClick={() => handleNavigation('/settings')}
            >
              <Settings className={`h-5 w-5 mr-3 ${
                location.pathname === '/settings' ? 'text-namuh-teal' : 'text-gray-400 group-hover:text-namuh-teal'
              }`} />
              <span className="font-medium">Einstellungen</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};