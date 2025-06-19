import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  CreditCard, 
  Bell,
  Lock,
  Key,
  UserCog,
  Clock,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { scrollToTop } from '../../utils/scrollHelper';

export const SettingsSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  const settingsItems = [
    {
      id: 'privacy',
      name: 'Privacy & Data',
      icon: Shield,
      path: '/settings/privacy'
    },
    {
      id: 'processing-register',
      name: 'Processing Register',
      icon: FileText,
      path: '/settings/processing-register'
    },
    {
      id: 'subscription',
      name: 'Subscription',
      icon: CreditCard,
      path: '/settings/subscription'
    },
    {
      id: 'account',
      name: 'Account Settings',
      icon: UserCog,
      path: '/settings'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      path: '/settings/notifications',
      disabled: true
    },
    {
      id: 'security',
      name: 'Security',
      icon: Lock,
      path: '/settings/security',
      disabled: true
    },
    {
      id: 'api',
      name: 'API Keys',
      icon: Key,
      path: '/settings/api',
      disabled: true,
      recruiterOnly: true
    },
    {
      id: 'activity',
      name: 'Account Activity',
      icon: Clock,
      path: '/settings/activity',
      disabled: true
    },
    {
      id: 'calendar',
      name: 'Calendar Settings',
      icon: Calendar,
      path: '/settings/calendar',
      disabled: true,
      recruiterOnly: true
    }
  ].filter(item => !(item.recruiterOnly && user?.role !== 'recruiter'));
  
  const handleNavigation = (path: string) => {
    scrollToTop();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full">
      <h2 className="text-lg font-semibold text-namuh-navy mb-6 px-2">Settings</h2>
      <nav className="space-y-1">
        {settingsItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.id === 'privacy' && location.pathname === '/settings/privacy') ||
                          (item.id === 'processing-register' && location.pathname === '/settings/processing-register') ||
                          (item.id === 'subscription' && location.pathname === '/settings/subscription');
          
          return (
            <Link
              key={item.id}
              to={item.disabled ? '#' : item.path}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-namuh-teal/10 text-namuh-teal' 
                  : 'text-gray-700 hover:bg-gray-100'
              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                } else {
                  handleNavigation(item.path);
                }
              }}
            >
              <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-namuh-teal' : 'text-gray-400'}`} />
              <span className="font-medium">{item.name}</span>
              {item.disabled && (
                <span className="ml-auto text-xs font-medium text-gray-400">Soon</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};