import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Coins, 
  ChevronDown, 
  Menu, 
  X, 
  MessageCircle, 
  Hash as Hashtag, 
  Send,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToTop } from '../../utils/scrollHelper';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDirectMessagesOpen, setIsDirectMessagesOpen] = useState(false);
  const [isLobbyMessagesOpen, setIsLobbyMessagesOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [lobbyMessage, setLobbyMessage] = useState('');
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Mock direct messages data
  const directMessages = [
    {
      id: 'msg1',
      sender: 'Anna Schmidt',
      content: 'Vielen Dank für Ihre Bewerbung. Ich würde gerne einen Termin für ein erstes Gespräch vereinbaren.',
      time: '10:30',
      unread: true,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    {
      id: 'msg2',
      sender: 'Thomas Weber',
      content: 'Können wir einen Termin für nächste Woche vereinbaren?',
      time: '09:15',
      unread: true,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    {
      id: 'msg3',
      sender: 'Maria Müller',
      content: 'Ich habe Ihre Unterlagen erhalten und bin beeindruckt von Ihrem Profil.',
      time: 'Gestern',
      unread: false,
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    }
  ];

  // Mock lobby messages data
  const lobbyMessages = [
    {
      id: 'lobby1',
      sender: 'Anonymer Bewerber',
      content: 'Hat jemand Erfahrung mit Remote-Interviews?',
      time: '11:45',
      avatar: 'A'
    },
    {
      id: 'lobby2',
      sender: 'HR Specialist',
      content: 'Ja, bereitet euch gut vor und testet die Technik im Voraus!',
      time: '11:50',
      avatar: 'H'
    }
  ];

  // Reset state of dropdowns when changing route
  useEffect(() => {
    setIsProfileMenuOpen(false);
    setIsDirectMessagesOpen(false);
    setIsLobbyMessagesOpen(false);
    setIsNotificationsOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll detection for visual effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    scrollToTop();
  };

  const handleSendDirectMessage = (e: React.FormEvent, replyToId?: string) => {
    e.preventDefault();
    
    // Determine which message text to use and reset
    const messageText = replyToId ? replyText : newMessage;
    if (!messageText.trim()) return;
    
    // In a real app, this would send the message to the backend
    console.log('Sending direct message:', messageText, replyToId ? `(Reply to ${replyToId})` : '');
    
    if (replyToId) {
      setReplyText('');
      setExpandedMessageId(null); // Close reply form after sending
    } else {
      setNewMessage('');
      setIsDirectMessagesOpen(false); // Only close dropdown for main message, not for replies
    }
  };

  const handleSendLobbyMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (lobbyMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log('Sending lobby message:', lobbyMessage);
      setLobbyMessage('');
      // Close the dropdown after sending
      setIsLobbyMessagesOpen(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (!target.closest('.profile-menu') && isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
      }
      
      if (!target.closest('.notifications-dropdown') && isNotificationsOpen) {
        setIsNotificationsOpen(false);
      }
      
      if (!target.closest('.direct-messages-dropdown') && isDirectMessagesOpen) {
        setIsDirectMessagesOpen(false);
      }
      
      if (!target.closest('.lobby-messages-dropdown') && isLobbyMessagesOpen) {
        setIsLobbyMessagesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen, isNotificationsOpen, isDirectMessagesOpen, isLobbyMessagesOpen]);

  // Public navigation items
  const publicNavItems = [
    { path: '/', label: 'Startseite' },
    { path: '/jobs', label: 'Stellensuche' },
    { path: '/community', label: 'Community' },
    { path: '/pricing', label: 'Preise' }
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Count unread messages
  const unreadDirectCount = directMessages.filter(msg => msg.unread).length;

  // Toggle message expansion
  const toggleMessageExpansion = (messageId: string) => {
    if (expandedMessageId === messageId) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(messageId);
      setReplyText(''); // Reset reply text when opening a new message
    }
  };

  // Handle navigation with scroll behavior
  const handleNavigation = (path: string) => {
    navigate(path);
    scrollToTop();
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`bg-white/95 backdrop-blur-sm ${isScrolled ? 'shadow-md' : 'shadow-sm'} border-b border-gray-100 sticky top-0 z-40 transition-shadow duration-200`}
    >
      <div className="px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
          {/* Left side - Responsive Logo */}
          <div className="flex items-center min-w-0">
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="flex items-center group"
                onClick={() => scrollToTop()}
              >
                <iframe 
                  src="/Logo-min.html" 
                  className="h-[120px] w-[120px] md:h-[150px] md:w-[150px] lg:h-[200px] lg:w-[200px] border-0" 
                  title="Logo"
                  style={{ background: 'transparent' }}
                />
              </Link>
            </div>
          </div>

          {/* Center - Public Navigation (only for non-authenticated users on desktop) */}
          {!user && (
            <nav className="hidden md:flex space-x-2 lg:space-x-8 flex-shrink-0">
              {publicNavItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`${
                      isActiveRoute(item.path)
                        ? 'text-namuh-teal border-b-2 border-namuh-teal'
                        : 'text-gray-600 hover:text-namuh-teal'
                    } px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-all duration-200 border-b-2 border-transparent hover:border-namuh-teal/30 whitespace-nowrap`}
                    onClick={() => scrollToTop()}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          )}

          {/* Right side - Responsive Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
            {user ? (
              /* Authenticated user controls - Responsive */
              <>
                {/* Token Balance - Tablet+ only */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border border-namuh-teal/20 cursor-pointer"
                >
                  <Coins className="h-3 w-3 lg:h-4 lg:w-4 text-namuh-teal flex-shrink-0" />
                  <span className="text-xs lg:text-sm font-medium text-namuh-navy">{user.tokenBalance}</span>
                </motion.div>

                {/* Direct Messages Dropdown */}
                <div className="relative direct-messages-dropdown">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsDirectMessagesOpen(!isDirectMessagesOpen);
                      setIsNotificationsOpen(false);
                      setIsLobbyMessagesOpen(false);
                      setIsProfileMenuOpen(false);
                      setExpandedMessageId(null); // Reset expanded message when toggling dropdown
                    }}
                    className="relative p-1.5 sm:p-2 text-gray-600 hover:text-namuh-teal hover:bg-gray-50 rounded-lg transition-all duration-200 flex-shrink-0"
                  >
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadDirectCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {unreadDirectCount}
                      </span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isDirectMessagesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900">Direkte Nachrichten</h3>
                          <p className="text-xs text-gray-500">Ihre letzten Konversationen</p>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                          {directMessages.map((message) => (
                            <div 
                              key={message.id} 
                              className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${message.unread ? 'bg-namuh-teal/5' : ''} cursor-pointer`}
                              onClick={() => toggleMessageExpansion(message.id)}
                              id={`message-${message.id}`}
                            >
                              <div className="flex items-start space-x-3">
                                <img 
                                  src={message.avatar} 
                                  alt={message.sender} 
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <p className="font-medium text-sm text-gray-900">{message.sender}</p>
                                    <span className="text-xs text-gray-500">{message.time}</span>
                                  </div>
                                  
                                  {/* Message content - collapsed or expanded */}
                                  {expandedMessageId === message.id ? (
                                    <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                                  ) : (
                                    <p className="text-xs text-gray-600 truncate">{message.content}</p>
                                  )}
                                  
                                  {/* Reply form - only shown when message is expanded */}
                                  {expandedMessageId === message.id && (
                                    <div className="mt-3">
                                      <form onSubmit={(e) => handleSendDirectMessage(e, message.id)} className="flex space-x-2">
                                        <input
                                          type="text"
                                          placeholder="Antworten..."
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                          className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                                          autoFocus
                                        />
                                        <button 
                                          type="submit" 
                                          disabled={!replyText.trim()}
                                          className="bg-namuh-teal text-white p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <Send className="h-4 w-4" />
                                        </button>
                                      </form>
                                    </div>
                                  )}
                                </div>
                                {message.unread && (
                                  <span className="w-2 h-2 bg-namuh-teal rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="p-3 text-center border-t border-gray-100">
                          <Link 
                            to="/chat" 
                            className="text-xs text-namuh-teal hover:underline"
                            onClick={() => {
                              setIsDirectMessagesOpen(false);
                              scrollToTop();
                            }}
                          >
                            Alle Nachrichten anzeigen
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Lobby Chat Dropdown */}
                <div className="relative lobby-messages-dropdown">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsLobbyMessagesOpen(!isLobbyMessagesOpen);
                      setIsDirectMessagesOpen(false);
                      setIsNotificationsOpen(false);
                      setIsProfileMenuOpen(false);
                    }}
                    className="relative p-1.5 sm:p-2 text-gray-600 hover:text-namuh-teal hover:bg-gray-50 rounded-lg transition-all duration-200 flex-shrink-0"
                  >
                    <Hashtag className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.button>

                  <AnimatePresence>
                    {isLobbyMessagesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900">Chat Lobby</h3>
                          <p className="text-xs text-gray-500">Öffentliche Diskussionen</p>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                          {lobbyMessages.map((message) => (
                            <div 
                              key={message.id} 
                              className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-namuh-teal rounded-full flex items-center justify-center text-white font-medium">
                                  {message.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <p className="font-medium text-sm text-gray-900">{message.sender}</p>
                                    <span className="text-xs text-gray-500">{message.time}</span>
                                  </div>
                                  <p className="text-xs text-gray-600">{message.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="p-3 border-t border-gray-100">
                          <form onSubmit={handleSendLobbyMessage} className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Nachricht an alle..."
                              value={lobbyMessage}
                              onChange={(e) => setLobbyMessage(e.target.value)}
                              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-namuh-teal focus:border-transparent"
                            />
                            <button 
                              type="submit" 
                              disabled={!lobbyMessage.trim()}
                              className="bg-namuh-teal text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </form>
                          <div className="mt-2 text-center">
                            <Link 
                              to="/community" 
                              className="text-xs text-namuh-teal hover:underline"
                              onClick={() => {
                                setIsLobbyMessagesOpen(false);
                                scrollToTop();
                              }}
                            >
                              Community Forum besuchen
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notifications - Responsive */}
                <div className="relative notifications-dropdown">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsDirectMessagesOpen(false);
                      setIsLobbyMessagesOpen(false);
                      setIsProfileMenuOpen(false);
                    }}
                    className="relative p-1.5 sm:p-2 text-gray-600 hover:text-namuh-teal hover:bg-gray-50 rounded-lg transition-all duration-200 flex-shrink-0"
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full animate-pulse"></span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900">Benachrichtigungen</h3>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                          <div className="p-3 border-b border-gray-100 bg-namuh-teal/5">
                            <p className="text-sm font-medium text-gray-900">Neue Bewerbung eingegangen</p>
                            <p className="text-xs text-gray-600">Ihre Bewerbung für "Senior Frontend Developer" wurde erfolgreich übermittelt.</p>
                            <p className="text-xs text-gray-500 mt-1">Vor 2 Stunden</p>
                          </div>
                          <div className="p-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">Interview-Einladung</p>
                            <p className="text-xs text-gray-600">Sie wurden zu einem Interview für die Position "UX/UI Designer" eingeladen.</p>
                            <p className="text-xs text-gray-500 mt-1">Gestern</p>
                          </div>
                          <div className="p-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">Neue passende Stelle</p>
                            <p className="text-xs text-gray-600">Wir haben eine neue Stelle gefunden, die zu Ihrem Profil passt: "Frontend Developer"</p>
                            <p className="text-xs text-gray-500 mt-1">Vor 2 Tagen</p>
                          </div>
                        </div>
                        
                        <div className="p-3 text-center">
                          <Link 
                            to="/notifications" 
                            className="text-xs text-namuh-teal hover:underline"
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              scrollToTop();
                            }}
                          >
                            Alle Benachrichtigungen anzeigen
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Menu - Responsive */}
                <div className="relative profile-menu">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                      setIsDirectMessagesOpen(false);
                      setIsLobbyMessagesOpen(false);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-namuh-teal to-namuh-navy rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-xs sm:text-sm font-medium text-gray-700 max-w-20 lg:max-w-none truncate">
                      {user.name}
                    </span>
                    <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      isProfileMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden z-50"
                      >
                        <motion.div whileHover={{ backgroundColor: '#f9fafb' }}>
                          <Link
                            to="/profile"
                            className="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 transition-colors"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              scrollToTop();
                            }}
                          >
                            <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
                            <span className="truncate">Profil</span>
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ backgroundColor: '#f9fafb' }}>
                          <Link
                            to="/settings"
                            className="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 transition-colors"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              scrollToTop();
                            }}
                          >
                            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
                            <span className="truncate">Einstellungen</span>
                          </Link>
                        </motion.div>
                        <hr className="my-2 border-gray-100" />
                        <motion.div whileHover={{ backgroundColor: '#fef2f2' }}>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-600 transition-colors"
                          >
                            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 flex-shrink-0" />
                            <span className="truncate">Abmelden</span>
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Public navigation for non-authenticated users - Responsive */
              <>
                {/* Mobile menu button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-1.5 sm:p-2 text-gray-600 hover:text-namuh-teal hover:bg-gray-50 rounded-lg transition-all duration-200 flex-shrink-0"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.button>

                {/* Desktop auth buttons - Responsive */}
                <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/login" 
                      className="text-gray-600 hover:text-namuh-teal font-medium transition-colors px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-50 text-sm lg:text-base whitespace-nowrap"
                      onClick={() => scrollToTop()}
                    >
                      Anmelden
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/register" 
                      className="btn-primary text-sm lg:text-base px-4 lg:px-6 py-2 lg:py-2.5 whitespace-nowrap"
                      onClick={() => scrollToTop()}
                    >
                      Registrieren
                    </Link>
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu for non-authenticated users - Responsive */}
        <AnimatePresence>
          {!user && isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-100 py-3 sm:py-4"
            >
              <div className="space-y-2">
                {publicNavItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 ${
                        isActiveRoute(item.path)
                          ? 'text-namuh-teal bg-namuh-teal/10'
                          : 'text-gray-600 hover:text-namuh-teal hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile auth buttons - Responsive */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col space-y-2 pt-3 sm:pt-4 border-t border-gray-100 mx-3 sm:mx-4"
                >
                  <Link 
                    to="/login" 
                    className="btn-outline w-full text-center text-sm sm:text-base py-2.5"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Anmelden
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary w-full text-center text-sm sm:text-base py-2.5"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      scrollToTop();
                    }}
                  >
                    Registrieren
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Menu for authenticated users */}
        <AnimatePresence>
          {user && isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-100 py-2"
            >
              <div className="grid grid-cols-2 gap-2 px-2">
                {user.role === 'applicant' ? (
                  // Applicant quick links
                  <>
                    <Link
                      to="/dashboard"
                      className="btn-outline text-center text-xs py-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/jobs"
                      className="btn-outline text-center text-xs py-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      Stellensuche
                    </Link>
                    <Link
                      to="/applications"
                      className="btn-outline text-center text-xs py-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      Bewerbungen
                    </Link>
                    <Link
                      to="/ai-hub"
                      className="btn-outline text-center text-xs py-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      AI-Hub
                    </Link>
                  </>
                ) : (
                  // Recruiter quick links
                  <>
                    <Link
                      to="/recruiter/dashboard"
                      className="btn-outline text-center text-xs py-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/recruiter/jobs"
                      className="btn-outline text-center text-xs py-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      Stellenanzeigen
                    </Link>
                    <Link
                      to="/recruiter/applications"
                      className="btn-outline text-center text-xs py-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      Bewerbungen
                    </Link>
                    <Link
                      to="/recruiter/talent-pool"
                      className="btn-outline text-center text-xs py-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        scrollToTop();
                      }}
                    >
                      Talent Pool
                    </Link>
                  </>
                )}
              </div>
              
              <div className="mt-3 border-t border-gray-100 pt-3 px-3">
                <Link 
                  to="/profile" 
                  className="flex items-center w-full text-sm text-gray-600 py-2"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToTop();
                  }}
                >
                  <User className="h-4 w-4 mr-3 text-gray-500" />
                  <span>Profil</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center w-full text-sm text-gray-600 py-2"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToTop();
                  }}
                >
                  <Settings className="h-4 w-4 mr-3 text-gray-500" />
                  <span>Einstellungen</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-sm text-red-600 py-2 mt-1"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span>Abmelden</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};