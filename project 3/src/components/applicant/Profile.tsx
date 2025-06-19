import React, { useState, useRef, useEffect } from 'react';
import { 
  User,
  Mail,
  Phone, 
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Linkedin,
  ExternalLink,
  Edit,
  Save,
  Plus,
  X,
  Eye,
  EyeOff,
  Upload,
  Camera,
  Trash2,
  FileText,
  File,
  Download,
  Check,
  AlertCircle,
  Lock,
  Image as ImageIcon,
  Folder,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { profileService } from '../../services/profileService';

export const ApplicantProfile: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'documents'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    linkedinUrl: '',
    xingUrl: '',
    visibility: 'public' as 'public' | 'restricted' | 'hidden',
    allowInTalentPool: true,
    profilePicture: null as string | null
  });

  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [hardSkills, setHardSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await profileService.getUserProfile();
        
        if (profileData) {
          // Set profile data
          setProfileData({
            name: profileData.profile.name || '',
            email: user?.email || '',
            phone: profileData.profile.contact_phone || '',
            location: profileData.profile.location || '',
            summary: profileData.profile.summary || '',
            linkedinUrl: profileData.profile.linkedin_profile_url || '',
            xingUrl: profileData.profile.xing_profile_url || '',
            visibility: profileData.profile.visibility || 'public',
            allowInTalentPool: profileData.profile.allow_in_talent_pool || false,
            profilePicture: profileData.profile.avatar_url
          });
          
          // Set experience, education, certifications
          setExperience(profileData.experience || []);
          setEducation(profileData.education || []);
          setCertificates(profileData.certifications || []);
          
          // Set skills
          setHardSkills(profileData.profile.hard_skills || []);
          setSoftSkills(profileData.profile.soft_skills || []);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Handle file upload
  const handleProfilePictureUpload = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      try {
        // In a real implementation, this would upload to Supabase Storage
        // For now, just use FileReader to display the image
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            setProfileData({
              ...profileData,
              profilePicture: event.target.result as string
            });
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  };

  const removeProfilePicture = () => {
    setProfileData({
      ...profileData,
      profilePicture: null
    });
  };

  // Handle document upload
  const handleDocumentUpload = () => {
    documentInputRef.current?.click();
  };

  const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadingDocument(true);
      
      try {
        // In a real implementation, this would upload to Supabase Storage
        // For now, just simulate the upload
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newDoc = {
          id: Date.now().toString(),
          name: file.name,
          type: 'other', // Default type, can be changed later
          dateUploaded: new Date(),
          size: `${(file.size / 1024).toFixed(0)} KB`,
          url: '#'
        };
        
        setDocuments([newDoc, ...documents]);
      } catch (error) {
        console.error('Error uploading document:', error);
      } finally {
        setUploadingDocument(false);
      }
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  // Save profile changes
  const handleSave = async () => {
    setIsEditing(false);
    
    try {
      await profileService.updateApplicantProfile({
        name: profileData.name,
        contact_phone: profileData.phone,
        summary: profileData.summary,
        linkedin_profile_url: profileData.linkedinUrl,
        xing_profile_url: profileData.xingUrl,
        visibility: profileData.visibility,
        allow_in_talent_pool: profileData.allowInTalentPool,
        // In a real implementation, avatar_url would be updated after uploading to storage
      });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Add new experience entry
  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: ''
    };
    
    setExperience([...experience, newExp]);
  };

  // Save experience
  const saveExperience = async (exp: any) => {
    try {
      // Format dates properly
      const formattedExp = {
        company: exp.company,
        position: exp.position,
        location: exp.location,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        isCurrent: exp.isCurrent,
        description: exp.description
      };
      
      await profileService.addExperience(formattedExp);
    } catch (error) {
      console.error('Error saving experience:', error);
    }
  };

  // Add new education entry
  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: '',
      activities: '',
      description: '',
      isCurrent: false
    };
    
    setEducation([...education, newEdu]);
  };

  // Save education
  const saveEducation = async (edu: any) => {
    try {
      // Format dates properly
      const formattedEdu = {
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate ? new Date(edu.startDate) : undefined,
        endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        grade: edu.grade,
        activities: edu.activities,
        description: edu.description,
        isCurrent: edu.isCurrent
      };
      
      await profileService.addEducation(formattedEdu);
    } catch (error) {
      console.error('Error saving education:', error);
    }
  };

  // Filter documents by type
  const filteredDocuments = selectedDocumentType === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === selectedDocumentType);

  // Get document icon
  const getDocumentIcon = (type: string) => {
    switch(type) {
      case 'resume': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'cover_letter': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'certificate': return <Award className="h-4 w-4 text-amber-600" />;
      case 'reference': return <Briefcase className="h-4 w-4 text-green-600" />;
      default: return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-namuh-teal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-namuh-navy">Mein Profil</h1>
            <p className="mt-2 text-gray-600">
              Verwalten Sie Ihre persönlichen Informationen und Berufserfahrung
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'profile'
                ? 'text-namuh-teal border-b-2 border-namuh-teal'
                : 'text-gray-500 hover:text-namuh-navy'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profil
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'documents'
                ? 'text-namuh-teal border-b-2 border-namuh-teal'
                : 'text-gray-500 hover:text-namuh-navy'
            }`}
          >
            <Folder className="h-4 w-4 inline mr-2" />
            Meine Dokumente
          </button>
        </div>

        {activeTab === 'profile' && (
          <>
            {/* Basic Information with Profile Picture */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md">
                      {profileData.profilePicture ? (
                        <img 
                          src={profileData.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-namuh-teal/10 flex items-center justify-center">
                          <User className="h-16 w-16 text-namuh-teal/40" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleProfilePictureUpload}
                            className="p-2 bg-white rounded-full hover:bg-namuh-teal hover:text-white transition-colors"
                            title="Profilbild hochladen"
                          >
                            <Camera className="h-5 w-5" />
                          </button>
                          {profileData.profilePicture && (
                            <button 
                              onClick={removeProfilePicture}
                              className="p-2 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                              title="Profilbild entfernen"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          className="hidden" 
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                        />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button 
                      onClick={handleProfilePictureUpload}
                      className="text-sm text-namuh-teal hover:text-namuh-teal-dark"
                    >
                      {profileData.profilePicture ? 'Bild ändern' : 'Bild hinzufügen'}
                    </button>
                  )}
                </div>

                {/* Personal Information */}
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
                      <p className="text-gray-900">{profileData.name}</p>
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
                        disabled // Email can't be changed through profile
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profil-Zusammenfassung
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profileData.summary}
                        onChange={(e) => setProfileData({...profileData, summary: e.target.value})}
                        rows={4}
                        className="input-field resize-none"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.summary}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Privacy Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-namuh-navy mb-6">Datenschutz-Einstellungen</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profil-Sichtbarkeit
                  </label>
                  {isEditing ? (
                    <select
                      value={profileData.visibility}
                      onChange={(e) => setProfileData({...profileData, visibility: e.target.value as any})}
                      className="input-field"
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
                      <span className="capitalize">{profileData.visibility === 'public' ? 'Öffentlich' : 
                        profileData.visibility === 'restricted' ? 'Eingeschränkt' : 'Versteckt'}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="talentPool"
                    checked={profileData.allowInTalentPool}
                    onChange={(e) => setProfileData({...profileData, allowInTalentPool: e.target.checked})}
                    disabled={!isEditing}
                    className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                  />
                  <label htmlFor="talentPool" className="ml-2 text-sm text-gray-700">
                    Im Talent Pool sichtbar sein (verfügbar ab Professional Tier)
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Professional Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 mb-8"
            >
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
            </motion.div>

            {/* Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-namuh-navy">
                  <Briefcase className="h-5 w-5 inline mr-2" />
                  Berufserfahrung
                </h2>
                {isEditing && (
                  <button onClick={addExperience} className="btn-outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Hinzufügen
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {experience.length > 0 ? experience.map((exp, index) => (
                  <div key={exp.id} className="border-l-4 border-namuh-teal pl-6 relative">
                    {isEditing && (
                      <button
                        onClick={() => setExperience(experience.filter(e => e.id !== exp.id))}
                        className="absolute -left-2 -top-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => {
                              const updatedExp = [...experience];
                              updatedExp[index].position = e.target.value;
                              setExperience(updatedExp);
                            }}
                            placeholder="Jobtitel"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Unternehmen</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const updatedExp = [...experience];
                              updatedExp[index].company = e.target.value;
                              setExperience(updatedExp);
                            }}
                            placeholder="Unternehmen"
                            className="input-field"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Startdatum</label>
                            <input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => {
                                const updatedExp = [...experience];
                                updatedExp[index].startDate = e.target.value;
                                setExperience(updatedExp);
                              }}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Enddatum</label>
                            <input
                              type="date"
                              value={exp.endDate}
                              disabled={exp.isCurrent}
                              onChange={(e) => {
                                const updatedExp = [...experience];
                                updatedExp[index].endDate = e.target.value;
                                setExperience(updatedExp);
                              }}
                              className="input-field disabled:bg-gray-100"
                            />
                            <div className="mt-1 flex items-center">
                              <input
                                type="checkbox"
                                id={`current-job-${exp.id}`}
                                checked={exp.isCurrent}
                                onChange={(e) => {
                                  const updatedExp = [...experience];
                                  updatedExp[index].isCurrent = e.target.checked;
                                  setExperience(updatedExp);
                                }}
                                className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                              />
                              <label htmlFor={`current-job-${exp.id}`} className="ml-2 text-xs text-gray-700">
                                Aktuelle Position
                              </label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Beschreibung</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => {
                              const updatedExp = [...experience];
                              updatedExp[index].description = e.target.value;
                              setExperience(updatedExp);
                            }}
                            placeholder="Beschreibung der Tätigkeit..."
                            rows={3}
                            className="input-field resize-none"
                          />
                        </div>
                        <button 
                          onClick={() => saveExperience(exp)}
                          className="btn-primary text-xs mt-2"
                        >
                          Erfahrung speichern
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-namuh-navy">{exp.position}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(exp.startDate).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })} - 
                          {exp.isCurrent 
                            ? ' Aktuell'
                            : exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}` : ''
                          }
                        </p>
                        <p className="text-gray-700">{exp.description}</p>
                      </>
                    )}
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">Noch keine Berufserfahrung hinzugefügt</p>
                )}
              </div>
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-namuh-navy">
                  <GraduationCap className="h-5 w-5 inline mr-2" />
                  Ausbildung
                </h2>
                {isEditing && (
                  <button onClick={addEducation} className="btn-outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Hinzufügen
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {education.length > 0 ? education.map((edu, index) => (
                  <div key={edu.id} className="border-l-4 border-namuh-teal pl-6 relative">
                    {isEditing && (
                      <button
                        onClick={() => setEducation(education.filter(e => e.id !== edu.id))}
                        className="absolute -left-2 -top-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Abschluss</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[index].degree = e.target.value;
                              setEducation(updated);
                            }}
                            placeholder="z.B. Bachelor of Science"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[index].institution = e.target.value;
                              setEducation(updated);
                            }}
                            placeholder="z.B. Technische Universität Berlin"
                            className="input-field"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Startdatum</label>
                            <input
                              type="date"
                              value={edu.startDate}
                              onChange={(e) => {
                                const updated = [...education];
                                updated[index].startDate = e.target.value;
                                setEducation(updated);
                              }}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Enddatum</label>
                            <input
                              type="date"
                              value={edu.endDate}
                              disabled={edu.isCurrent}
                              onChange={(e) => {
                                const updated = [...education];
                                updated[index].endDate = e.target.value;
                                setEducation(updated);
                              }}
                              className="input-field disabled:bg-gray-100"
                            />
                            <div className="mt-1 flex items-center">
                              <input
                                type="checkbox"
                                id={`current-edu-${edu.id}`}
                                checked={edu.isCurrent}
                                onChange={(e) => {
                                  const updated = [...education];
                                  updated[index].isCurrent = e.target.checked;
                                  setEducation(updated);
                                }}
                                className="h-4 w-4 text-namuh-teal focus:ring-namuh-teal border-gray-300 rounded"
                              />
                              <label htmlFor={`current-edu-${edu.id}`} className="ml-2 text-xs text-gray-700">
                                Aktuelles Studium
                              </label>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => saveEducation(edu)}
                          className="btn-primary text-xs mt-2"
                        >
                          Ausbildung speichern
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-namuh-navy">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500 mb-2">
                          {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - 
                          {edu.isCurrent 
                            ? ' Aktuell'
                            : edu.endDate ? ` ${new Date(edu.endDate).getFullYear()}` : ''
                          }
                        </p>
                        {edu.description && <p className="text-gray-700">{edu.description}</p>}
                      </>
                    )}
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">Noch keine Ausbildung hinzugefügt</p>
                )}
              </div>
            </motion.div>

            {/* Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Hard Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-namuh-navy mb-6">Technische Fähigkeiten</h2>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        id="new-hard-skill"
                        placeholder="Neue Fähigkeit hinzufügen"
                        className="input-field flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                            setHardSkills([...hardSkills, (e.target as HTMLInputElement).value.trim()]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button 
                        className="btn-outline p-2"
                        onClick={() => {
                          const input = document.getElementById('new-hard-skill') as HTMLInputElement;
                          if (input.value.trim()) {
                            setHardSkills([...hardSkills, input.value.trim()]);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {hardSkills.map((skill, index) => (
                        <div key={index} className="bg-namuh-teal/10 text-namuh-teal px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                          <span>{skill}</span>
                          <button 
                            onClick={() => setHardSkills(hardSkills.filter((_, i) => i !== index))}
                            className="ml-2 text-namuh-teal hover:text-namuh-teal-dark"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {hardSkills.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-namuh-teal/10 text-namuh-teal px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Soft Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-namuh-navy mb-6">Soziale Kompetenzen</h2>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        id="new-soft-skill"
                        placeholder="Neue Kompetenz hinzufügen"
                        className="input-field flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                            setSoftSkills([...softSkills, (e.target as HTMLInputElement).value.trim()]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button 
                        className="btn-outline p-2"
                        onClick={() => {
                          const input = document.getElementById('new-soft-skill') as HTMLInputElement;
                          if (input.value.trim()) {
                            setSoftSkills([...softSkills, input.value.trim()]);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {softSkills.map((skill, index) => (
                        <div key={index} className="bg-namuh-navy/10 text-namuh-navy px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                          <span>{skill}</span>
                          <button 
                            onClick={() => setSoftSkills(softSkills.filter((_, i) => i !== index))}
                            className="ml-2 text-namuh-navy hover:text-namuh-navy-dark"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-namuh-navy/10 text-namuh-navy px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}

        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Document Repository Header */}
            <div className="card p-6 bg-gradient-to-r from-namuh-teal/10 to-namuh-navy/10 border border-namuh-teal/20">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Folder className="h-8 w-8 text-namuh-teal" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-namuh-navy mb-2">Meine Dokumente</h2>
                  <p className="text-gray-700 mb-4">
                    Hier können Sie alle Ihre Bewerbungsunterlagen sicher speichern und verwalten. Diese Dokumente sind privat und können bei Bedarf für Quick Applications verwendet werden.
                  </p>
                  <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-namuh-teal/20 inline-flex">
                    <Lock className="h-4 w-4 text-namuh-teal mr-2" />
                    <span>Nur für Sie sichtbar und verwendbar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Filter by Document Type */}
              <div>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Alle Dokumente</option>
                  <option value="resume">Lebensläufe</option>
                  <option value="cover_letter">Anschreiben</option>
                  <option value="certificate">Zertifikate</option>
                  <option value="reference">Zeugnisse</option>
                  <option value="other">Sonstige</option>
                </select>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleDocumentUpload}
                className="btn-primary flex items-center"
                disabled={uploadingDocument}
              >
                {uploadingDocument ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Dokument hochladen
                  </>
                )}
                <input
                  type="file"
                  ref={documentInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleDocumentChange}
                />
              </button>
            </div>

            {/* Document List */}
            <div className="space-y-4">
              {documents.length > 0 ? (
                filteredDocuments.map((document) => (
                  <motion.div
                    key={document.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(document.type)}
                        <div>
                          <h3 className="font-medium text-namuh-navy">{document.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>Hochgeladen: {document.dateUploaded.toLocaleDateString('de-DE')}</span>
                            <span>Größe: {document.size}</span>
                            <div className="flex items-center text-namuh-teal">
                              <Lock className="h-3 w-3 mr-1" />
                              <span>Privat</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-namuh-teal transition-colors"
                          title="Herunterladen"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
                          title="Löschen"
                          onClick={() => deleteDocument(document.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                      <div className="flex space-x-3">
                        <select
                          value={document.type}
                          onChange={(e) => {
                            setDocuments(documents.map(doc => 
                              doc.id === document.id ? {...doc, type: e.target.value} : doc
                            ));
                          }}
                          className="text-xs border border-gray-300 rounded-md px-2 py-1"
                        >
                          <option value="resume">Lebenslauf</option>
                          <option value="cover_letter">Anschreiben</option>
                          <option value="certificate">Zertifikat</option>
                          <option value="reference">Zeugnis</option>
                          <option value="other">Sonstiges</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <button className="text-xs text-namuh-teal hover:text-namuh-teal-dark">
                          Vorschau anzeigen
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Keine Dokumente</h3>
                  <p className="text-gray-600 mb-4">
                    Sie haben noch keine Dokumente hochgeladen
                  </p>
                  <button 
                    onClick={handleDocumentUpload}
                    className="btn-primary"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Erstes Dokument hochladen
                  </button>
                </div>
              )}
            </div>

            {/* Quick Application Integration Info */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <Sparkles className="h-5 w-5 text-blue-600 mr-3" />
                <h3 className="font-semibold text-blue-900">Quick Application Integration</h3>
              </div>
              <p className="text-sm text-blue-800 mb-4">
                Alle hier hochgeladenen Dokumente stehen Ihnen automatisch in Quick Application zur Verfügung. 
                So sparen Sie Zeit bei jeder Bewerbung, da Sie Ihre Dokumente nicht erneut hochladen müssen.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-blue-100 text-center">
                  <div className="bg-blue-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-800 font-medium">Zeit sparen</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100 text-center">
                  <div className="bg-blue-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-800 font-medium">100% privat</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100 text-center">
                  <div className="bg-blue-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-800 font-medium">Schneller bewerben</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};