import React, { useState, useRef } from 'react';
import { 
  User,
  Mail,
  Phone, 
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  Linkedin,
  ExternalLink,
  Edit,
  Save,
  Plus,
  X,
  Eye,
  EyeOff,
  Clock,
  Image as ImageIcon,
  FileText,
  MessageCircle,
  Check,
  Share2,
  Info,
  Upload,
  Star,
  CalendarClock,
  BookOpen,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export const RecruiterProfile: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'calendar' | 'updates'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Anna Schmidt',
    email: user?.email || 'recruiter@test.com',
    phone: '+49 176 1234 5678',
    location: 'Berlin, Deutschland',
    company: 'TechCorp GmbH',
    role: 'Senior Talent Acquisition Manager',
    bio: 'Erfahrene Recruiterin mit Fokus auf Tech-Talente. Ich helfe Kandidaten dabei, ihre Traumjobs zu finden und Unternehmen, die besten Talente zu entdecken.',
    linkedinUrl: 'https://linkedin.com/in/annaschmidrec',
    xingUrl: 'https://xing.com/profile/Anna_Schmidt',
    specializations: ['Softwareentwicklung', 'UX/UI Design', 'Data Science', 'DevOps'],
    shareCalendar: true,
    calendarUrl: 'https://calendly.com/anna-schmidt-recruiter',
    allowApplicantFeedback: true,
    visibility: 'public' as 'public' | 'restricted' | 'hidden',
    availabilityNotes: 'Verfügbar für Gespräche Dienstag bis Donnerstag, 10:00 - 16:00 Uhr'
  });

  // Company update items
  const [companyUpdates, setCompanyUpdates] = useState([
    {
      id: '1',
      title: 'Neue Büroräume in Berlin-Mitte',
      date: new Date('2024-01-15'),
      content: 'Wir freuen uns, unseren Umzug in neue, moderne Büroräume im Herzen von Berlin bekannt zu geben. Mit mehr Platz für Zusammenarbeit und Kreativität schaffen wir eine inspirierende Arbeitsumgebung für unser wachsendes Team.',
      imageUrl: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=800',
      published: true
    },
    {
      id: '2',
      title: 'Tech Talk Series: "Future of Work"',
      date: new Date('2024-01-28'),
      content: 'Unsere monatliche Tech Talk Serie startet mit dem Thema "Future of Work". Wir diskutieren die neuesten Trends in Remote-Arbeit, digitaler Zusammenarbeit und KI-unterstützten Workflows. Alle Teammitglieder und externe Gäste sind herzlich eingeladen.',
      imageUrl: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
      published: true
    }
  ]);

  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    imageUrl: '',
    published: false
  });

  // Availability time slots
  const [availabilitySlots, setAvailabilitySlots] = useState([
    { day: 'Montag', slots: [] },
    { day: 'Dienstag', slots: ['10:00 - 12:00', '14:00 - 16:00'] },
    { day: 'Mittwoch', slots: ['10:00 - 12:00', '14:00 - 16:00'] },
    { day: 'Donnerstag', slots: ['10:00 - 12:00', '14:00 - 16:00'] },
    { day: 'Freitag', slots: [] }
  ]);

  // Handle file upload
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Save profile changes
  const handleSave = () => {
    setIsEditing(false);
    // Here would be API call to save changes
    console.log('Profile saved:', profileData);
  };

  // Add new time slot
  const addTimeSlot = (day: string) => {
    setAvailabilitySlots(
      availabilitySlots.map(item => 
        item.day === day 
          ? { ...item, slots: [...item.slots, '09:00 - 10:00'] } 
          : item
      )
    );
  };

  // Remove time slot
  const removeTimeSlot = (day: string, index: number) => {
    setAvailabilitySlots(
      availabilitySlots.map(item => 
        item.day === day 
          ? { ...item, slots: item.slots.filter((_, i) => i !== index) } 
          : item
      )
    );
  };

  // Add company update
  const addCompanyUpdate = () => {
    if (!newUpdate.title || !newUpdate.content) return;
    
    setCompanyUpdates([
      {
        id: Date.now().toString(),
        title: newUpdate.title,
        content: newUpdate.content,
        imageUrl: newUpdate.imageUrl || 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
        date: new Date(),
        published: newUpdate.published
      },
      ...companyUpdates
    ]);
    
    setNewUpdate({
      title: '',
      content: '',
      imageUrl: '',
      published: false
    });
  };

  // Delete company update
  const deleteUpdate = (id: string) => {
    setCompanyUpdates(companyUpdates.filter(update => update.id !== id));
  };

  // Toggle update publish status
  const togglePublishStatus = (id: string) => {
    setCompanyUpdates(companyUpdates.map(update => 
      update.id === id ? { ...update, published: !update.published } : update
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-namuh-navy">Recruiter Profil</h1>
            <p className="mt-2 text-gray-600">
              Verwalten Sie Ihre persönlichen Informationen, Verfügbarkeit und Unternehmens-Updates
            </p>
          </div>
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={isEditing ? 'btn-primary' : 'btn-outline'}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </>
            )}
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                activeTab === 'profile' 
                  ? 'text-namuh-teal border-b-2 border-namuh-teal' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="h-5 w-5 mb-1 mx-auto" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                activeTab === 'calendar' 
                  ? 'text-namuh-teal border-b-2 border-namuh-teal' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-5 w-5 mb-1 mx-auto" />
              Verfügbarkeit
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                activeTab === 'updates' 
                  ? 'text-namuh-teal border-b-2 border-namuh-teal' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-5 w-5 mb-1 mx-auto" />
              Updates
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Basic Information */}
              <div className="card p-8">
                <div className="flex items-start gap-8">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md">
                        <img 
                          src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300"
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isEditing && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={handleImageUpload}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                          />
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-2" />
                        Vollständiger Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{profileData.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="h-4 w-4 inline mr-2" />
                        E-Mail-Adresse
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Telefonnummer
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Standort
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="card p-8">
                <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Berufliche Informationen
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Berufsbezeichnung
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.role}
                        onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.role}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unternehmen
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profileData.company}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografie & Expertise
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        rows={4}
                        className="input-field resize-none"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="card p-8">
                <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Spezialisierungen
                </h2>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {profileData.specializations.map((specialization, index) => (
                        <div key={index} className="flex items-center bg-namuh-teal/10 text-namuh-teal px-3 py-1.5 rounded-full">
                          <span>{specialization}</span>
                          <button 
                            onClick={() => {
                              setProfileData({
                                ...profileData,
                                specializations: profileData.specializations.filter((_, i) => i !== index)
                              })
                            }}
                            className="ml-2 text-namuh-teal hover:text-namuh-teal-dark"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newSpecialization = prompt('Neue Spezialisierung hinzufügen:');
                          if (newSpecialization?.trim()) {
                            setProfileData({
                              ...profileData,
                              specializations: [...profileData.specializations, newSpecialization.trim()]
                            });
                          }
                        }}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm text-gray-700 flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Hinzufügen
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Klicken Sie auf 'Hinzufügen' um Bereiche einzutragen, in denen Sie spezialisiert sind.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.specializations.map((specialization, index) => (
                      <span key={index} className="bg-namuh-teal/10 text-namuh-teal px-3 py-1.5 rounded-full">
                        {specialization}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Professional Links */}
              <div className="card p-8">
                <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                  <Linkedin className="h-5 w-5 mr-2" />
                  Professionelle Profile
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profil
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.linkedinUrl}
                        onChange={(e) => setProfileData({...profileData, linkedinUrl: e.target.value})}
                        className="input-field"
                        placeholder="https://linkedin.com/in/..."
                      />
                    ) : (
                      <a 
                        href={profileData.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-namuh-teal hover:text-namuh-teal-dark flex items-center"
                      >
                        {profileData.linkedinUrl}
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      XING Profil
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.xingUrl}
                        onChange={(e) => setProfileData({...profileData, xingUrl: e.target.value})}
                        className="input-field"
                        placeholder="https://xing.com/profile/..."
                      />
                    ) : (
                      <a 
                        href={profileData.xingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-namuh-teal hover:text-namuh-teal-dark flex items-center"
                      >
                        {profileData.xingUrl}
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy & Sharing Settings */}
              <div className="card p-8">
                <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Sichtbarkeit & Einstellungen
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Profil-Sichtbarkeit
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.visibility}
                          onChange={(e) => setProfileData({...profileData, visibility: e.target.value as any})}
                          className="ml-2 border border-gray-300 rounded-md text-sm p-1.5 focus:ring-namuh-teal focus:border-namuh-teal"
                        >
                          <option value="public">Öffentlich</option>
                          <option value="restricted">Eingeschränkt</option>
                          <option value="hidden">Versteckt</option>
                        </select>
                      ) : (
                        <div className="flex items-center">
                          {profileData.visibility === 'public' ? (
                            <Eye className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-600 mr-2" />
                          )}
                          <span className="capitalize">{
                            profileData.visibility === 'public' ? 'Öffentlich' : 
                            profileData.visibility === 'restricted' ? 'Eingeschränkt' : 'Versteckt'
                          }</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Bestimmt, wer Ihr vollständiges Profil und Ihre Kontaktdaten sehen kann
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Kalender-Freigabe aktivieren
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Erlaubt Bewerbern, direkt Termine mit Ihnen zu vereinbaren
                      </p>
                    </div>
                    <div className="relative">
                      {isEditing ? (
                        <div className="flex h-6 items-center">
                          <input
                            id="shareCalendar"
                            type="checkbox"
                            checked={profileData.shareCalendar}
                            onChange={(e) => setProfileData({...profileData, shareCalendar: e.target.checked})}
                            className="h-4 w-4 rounded border-gray-300 text-namuh-teal focus:ring-namuh-teal"
                          />
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profileData.shareCalendar ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profileData.shareCalendar ? 'Aktiviert' : 'Deaktiviert'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Bewerber-Feedback erlauben
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Ermöglicht Bewerbern, Feedback zu Ihrem Rekrutierungsprozess zu geben
                      </p>
                    </div>
                    <div className="relative">
                      {isEditing ? (
                        <div className="flex h-6 items-center">
                          <input
                            id="allowFeedback"
                            type="checkbox"
                            checked={profileData.allowApplicantFeedback}
                            onChange={(e) => setProfileData({...profileData, allowApplicantFeedback: e.target.checked})}
                            className="h-4 w-4 rounded border-gray-300 text-namuh-teal focus:ring-namuh-teal"
                          />
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profileData.allowApplicantFeedback ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profileData.allowApplicantFeedback ? 'Aktiviert' : 'Deaktiviert'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Calendar Integration */}
              <div className="card p-8">
                <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Kalenderverfügbarkeit
                </h2>
                
                {profileData.shareCalendar ? (
                  <div className="space-y-6">
                    <div className="bg-namuh-teal/10 border border-namuh-teal/20 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <CalendarClock className="h-6 w-6 text-namuh-teal mr-3" />
                        <h3 className="text-lg font-medium text-namuh-navy">Ihr Buchungskalender</h3>
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kalendar-URL (Calendly, Cal.com, o.ä.)
                            </label>
                            <input
                              type="url"
                              value={profileData.calendarUrl}
                              onChange={(e) => setProfileData({...profileData, calendarUrl: e.target.value})}
                              className="input-field"
                              placeholder="https://calendly.com/your-name"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              Integration mit Calendly, Cal.com oder anderen Kalender-Tools
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Verfügbarkeitsnotizen
                            </label>
                            <textarea
                              value={profileData.availabilityNotes}
                              onChange={(e) => setProfileData({...profileData, availabilityNotes: e.target.value})}
                              rows={3}
                              className="input-field resize-none"
                              placeholder="Geben Sie Informationen zu Ihrer Verfügbarkeit..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-gray-600">{profileData.availabilityNotes}</p>
                          
                          <a 
                            href={profileData.calendarUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-primary inline-flex items-center"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Termin buchen
                          </a>
                          
                          <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                            <Check className="h-4 w-4 text-green-600 mr-2" />
                            Bewerber können direkt Termine mit Ihnen vereinbaren
                          </div>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-namuh-navy mt-6 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Verfügbare Zeiten
                    </h3>
                    
                    <div className="grid gap-4">
                      {availabilitySlots.map((daySlot, dayIndex) => (
                        <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">{daySlot.day}</h4>
                            {isEditing && (
                              <button
                                onClick={() => addTimeSlot(daySlot.day)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 py-1 px-2 rounded flex items-center"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Slot hinzufügen
                              </button>
                            )}
                          </div>
                          
                          {daySlot.slots.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {daySlot.slots.map((slot, slotIndex) => (
                                <div 
                                  key={slotIndex}
                                  className="bg-namuh-teal/10 text-namuh-teal px-3 py-1.5 rounded-full text-sm flex items-center"
                                >
                                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                                  {slot}
                                  {isEditing && (
                                    <button 
                                      onClick={() => removeTimeSlot(daySlot.day, slotIndex)}
                                      className="ml-2 text-namuh-teal hover:text-namuh-teal-dark"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Nicht verfügbar</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Kalender-Freigabe deaktiviert</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Aktivieren Sie die Kalender-Freigabe, um Bewerbern zu ermöglichen, direkt Termine mit Ihnen zu buchen.
                    </p>
                    {isEditing && (
                      <button
                        onClick={() => setProfileData({...profileData, shareCalendar: true})}
                        className="btn-primary"
                      >
                        Kalender-Freigabe aktivieren
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Calendar Integration Tips */}
              <div className="card p-6 bg-blue-50 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Info className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-medium text-blue-900">Kalender-Integration: Tipps</h3>
                </div>
                
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3">1.</div>
                    <p>Erstellen Sie einen Account bei Calendly, Microsoft Bookings oder ähnlichen Diensten</p>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3">2.</div>
                    <p>Richten Sie Ihre Verfügbarkeitszeiten und Terminlängen ein</p>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3">3.</div>
                    <p>Kopieren Sie den Freigabe-Link und fügen Sie ihn in Ihr namuH-Profil ein</p>
                  </div>
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3">4.</div>
                    <p>Synchronisieren Sie mit Ihrem persönlichen Kalender (Google, Outlook, etc.)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <motion.div
              key="updates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Create Update */}
              <div className="card p-8">
                <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Unternehmens-Updates
                </h2>
                
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Teilen Sie Neuigkeiten über Ihr Unternehmen mit potenziellen Bewerbern. Updates erscheinen auf Ihrem Profil und in den Feeds relevanter Bewerber.
                  </p>
                  
                  <div className="bg-namuh-teal/10 border border-namuh-teal/20 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-namuh-navy mb-4 flex items-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Neues Update erstellen
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titel
                        </label>
                        <input
                          type="text"
                          value={newUpdate.title}
                          onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                          className="input-field"
                          placeholder="z.B. Neue Büroräume, Firmenevent, Technologie-Update..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Inhalt
                        </label>
                        <textarea
                          value={newUpdate.content}
                          onChange={(e) => setNewUpdate({...newUpdate, content: e.target.value})}
                          rows={4}
                          className="input-field resize-none"
                          placeholder="Beschreiben Sie das Update ausführlich..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bild-URL (optional)
                        </label>
                        <input
                          type="url"
                          value={newUpdate.imageUrl}
                          onChange={(e) => setNewUpdate({...newUpdate, imageUrl: e.target.value})}
                          className="input-field"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="publishNow"
                          type="checkbox"
                          checked={newUpdate.published}
                          onChange={(e) => setNewUpdate({...newUpdate, published: e.target.checked})}
                          className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                        />
                        <label htmlFor="publishNow" className="ml-2 block text-sm text-gray-700">
                          Sofort veröffentlichen (oder als Entwurf speichern)
                        </label>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={addCompanyUpdate}
                          disabled={!newUpdate.title || !newUpdate.content}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Update erstellen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Updates List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Ihre Updates ({companyUpdates.length})
                </h3>
                
                <div className="space-y-6">
                  {companyUpdates.length > 0 ? (
                    companyUpdates.map((update, index) => (
                      <motion.div
                        key={update.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`card p-6 border-l-4 ${
                          update.published ? 'border-l-green-500' : 'border-l-yellow-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-lg text-namuh-navy">{update.title}</h4>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                update.published 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {update.published ? 'Veröffentlicht' : 'Entwurf'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                              {update.date.toLocaleDateString('de-DE', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-6">
                              {update.imageUrl && (
                                <div className="sm:w-1/3 flex-shrink-0">
                                  <img 
                                    src={update.imageUrl} 
                                    alt={update.title}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-gray-700 mb-4">{update.content}</p>
                                
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => togglePublishStatus(update.id)}
                                    className={`text-xs px-3 py-1.5 rounded-full flex items-center ${
                                      update.published
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {update.published 
                                      ? <>
                                          <EyeOff className="h-3 w-3 mr-1" />
                                          Zurück zu Entwurf
                                        </> 
                                      : <>
                                          <Eye className="h-3 w-3 mr-1" />
                                          Veröffentlichen
                                        </>
                                    }
                                  </button>
                                  
                                  <button
                                    className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full flex items-center"
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Bearbeiten
                                  </button>
                                  
                                  <button
                                    onClick={() => deleteUpdate(update.id)}
                                    className="bg-red-100 text-red-800 text-xs px-3 py-1.5 rounded-full flex items-center"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Löschen
                                  </button>
                                  
                                  <button
                                    className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full flex items-center"
                                  >
                                    <Share2 className="h-3 w-3 mr-1" />
                                    Teilen
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Keine Updates</h4>
                      <p className="text-gray-500 mb-4">
                        Sie haben noch keine Unternehmens-Updates erstellt
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};