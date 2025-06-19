import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Download,
  Edit,
  Trash2,
  Info,
  CheckCircle,
  X,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  FileBadge,
  RefreshCw,
  Lock,
  History,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { SettingsSidebar } from './SettingsSidebar';

export const PrivacySettings = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [consentSettings, setConsentSettings] = useState({
    essentialData: true, // Cannot be turned off
    analyticsData: true,
    marketingData: false,
    thirdPartySharing: false,
    profileVisibility: 'public' as 'public' | 'restricted' | 'hidden',
    talentPoolInclusion: true,
    cookiesAccepted: true
  });
  const [dataProcessingHistory, setDataProcessingHistory] = useState([
    { 
      id: '1', 
      action: 'Profile created', 
      date: new Date('2024-01-15'),
      details: 'User profile created with basic information',
      consentGiven: true
    },
    { 
      id: '2', 
      action: 'Applied to job: Senior Frontend Developer', 
      date: new Date('2024-01-16'),
      details: 'Application data shared with TechCorp GmbH',
      consentGiven: true
    },
    { 
      id: '3', 
      action: 'CV analyzed with AI', 
      date: new Date('2024-01-18'),
      details: 'CV processed for job matching',
      consentGiven: true
    }
  ]);
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleConsentChange = (setting: keyof typeof consentSettings, value: any) => {
    setConsentSettings({
      ...consentSettings,
      [setting]: value
    });
    
    // In a real implementation, this would update the user's consent settings in the database
    setSuccessMessage('Privacy settings updated successfully');
  };

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // In a real implementation, this would call a Supabase function to export the user's data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Format the data for export
      const userData = {
        profile: {
          name: user?.name,
          email: user?.email,
          role: user?.role,
          createdAt: user?.createdAt
        },
        applications: [],
        messages: [],
        consentHistory: dataProcessingHistory
      };
      
      // Create a downloadable file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create a link and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `namuh-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Your data has been exported successfully');
    } catch (error) {
      setErrorMessage('Failed to export data. Please try again later.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== user?.email) {
      setErrorMessage('Please enter your email correctly to confirm deletion');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // In a real implementation, this would call a Supabase function to delete the user's account
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Log the user out after successful deletion
      logout();
      navigate('/');
    } catch (error) {
      setErrorMessage('Failed to delete account. Please try again later.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-namuh-navy">Privacy Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your data and privacy preferences in compliance with GDPR.
          </p>
        </div>
        
        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
            >
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-800">{successMessage}</span>
            </motion.div>
          )}
          
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
            >
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-800">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Layout with Sidebar */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <SettingsSidebar />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Consent Management */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Consent Management
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Essential Data Processing</span>
                    <p className="text-sm text-gray-600">Required for basic platform functionality</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="essentialData"
                      checked={consentSettings.essentialData}
                      disabled={true}
                      className="h-4 w-4 text-namuh-teal border-gray-300 rounded focus:ring-namuh-teal"
                    />
                    <label htmlFor="essentialData" className="ml-2 text-sm text-gray-700">
                      Required
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <span className="font-medium">Analytics Data</span>
                    <p className="text-sm text-gray-600">Helps us improve our services through usage statistics</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="analyticsData"
                      checked={consentSettings.analyticsData}
                      onChange={(e) => handleConsentChange('analyticsData', e.target.checked)}
                      className="h-4 w-4 text-namuh-teal border-gray-300 rounded focus:ring-namuh-teal"
                    />
                    <label htmlFor="analyticsData" className="ml-2 text-sm text-gray-700">
                      Allow
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <span className="font-medium">Marketing Communications</span>
                    <p className="text-sm text-gray-600">Updates about our services, features, and offers</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="marketingData"
                      checked={consentSettings.marketingData}
                      onChange={(e) => handleConsentChange('marketingData', e.target.checked)}
                      className="h-4 w-4 text-namuh-teal border-gray-300 rounded focus:ring-namuh-teal"
                    />
                    <label htmlFor="marketingData" className="ml-2 text-sm text-gray-700">
                      Allow
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <span className="font-medium">Third-Party Data Sharing</span>
                    <p className="text-sm text-gray-600">Sharing data with trusted partners for improved services</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="thirdPartySharing"
                      checked={consentSettings.thirdPartySharing}
                      onChange={(e) => handleConsentChange('thirdPartySharing', e.target.checked)}
                      className="h-4 w-4 text-namuh-teal border-gray-300 rounded focus:ring-namuh-teal"
                    />
                    <label htmlFor="thirdPartySharing" className="ml-2 text-sm text-gray-700">
                      Allow
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <span className="font-medium">Cookie Usage</span>
                    <p className="text-sm text-gray-600">Personalize your experience with cookies</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="cookiesAccepted"
                      checked={consentSettings.cookiesAccepted}
                      onChange={(e) => handleConsentChange('cookiesAccepted', e.target.checked)}
                      className="h-4 w-4 text-namuh-teal border-gray-300 rounded focus:ring-namuh-teal"
                    />
                    <label htmlFor="cookiesAccepted" className="ml-2 text-sm text-gray-700">
                      Accept
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    You have the right to withdraw your consent at any time. However, this will not affect the lawfulness
                    of processing based on consent before its withdrawal.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Profile Visibility */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Profile Visibility
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Profile Visibility Level</span>
                    <p className="text-sm text-gray-600">Control who can see your profile information</p>
                  </div>
                  <div className="relative">
                    <select
                      value={consentSettings.profileVisibility}
                      onChange={(e) => handleConsentChange('profileVisibility', e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-namuh-teal focus:border-namuh-teal"
                    >
                      <option value="public">Public</option>
                      <option value="restricted">Restricted</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <span className="font-medium">Talent Pool Inclusion</span>
                    <p className="text-sm text-gray-600">Allow recruiters to add you to their talent pools</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="talentPoolInclusion"
                      checked={consentSettings.talentPoolInclusion}
                      onChange={(e) => handleConsentChange('talentPoolInclusion', e.target.checked)}
                      className="h-4 w-4 text-namuh-teal border-gray-300 rounded focus:ring-namuh-teal"
                    />
                    <label htmlFor="talentPoolInclusion" className="ml-2 text-sm text-gray-700">
                      Allow
                    </label>
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Visibility Levels Explained:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <span className="font-medium text-green-600 mr-2">Public:</span> 
                      <span>Your profile is visible to all recruiters and can appear in search results.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-yellow-600 mr-2">Restricted:</span> 
                      <span>Your profile is only visible to recruiters with whom you've interacted.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-red-600 mr-2">Hidden:</span> 
                      <span>Your profile is not visible to any recruiters and won't appear in search results.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Data Processing History */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-namuh-navy flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Data Processing History
                </h2>
                <Link to="/settings/processing-register" className="text-namuh-teal hover:text-namuh-teal-dark text-sm flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  View Full Register
                </Link>
              </div>
              
              <div className="space-y-4">
                {dataProcessingHistory.map((item) => (
                  <div key={item.id} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.action}</p>
                        <p className="text-sm text-gray-600">{item.details}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500">
                          {item.date.toLocaleDateString('de-DE')}
                        </span>
                        <span className={`text-xs ${item.consentGiven ? 'text-green-600' : 'text-red-600'}`}>
                          {item.consentGiven ? 'Consent given' : 'No consent recorded'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* GDPR Rights */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-namuh-navy mb-6 flex items-center">
                <FileBadge className="h-5 w-5 mr-2" />
                Your GDPR Rights
              </h2>
              
              <div className="space-y-6">
                {/* Right to Access */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold">Right to Access</h3>
                      <p className="text-sm text-gray-600">Export all data we have about you</p>
                    </div>
                    <button 
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="btn-primary flex items-center"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Your data will be exported in JSON format, which can be imported into other systems.
                  </p>
                </div>
                
                {/* Right to Rectification */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold">Right to Rectification</h3>
                      <p className="text-sm text-gray-600">Update your personal information</p>
                    </div>
                    <Link to="/profile" className="btn-outline flex items-center">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500">
                    You can update your personal information at any time from your profile settings.
                  </p>
                </div>
                
                {/* Right to Data Portability */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold">Right to Data Portability</h3>
                      <p className="text-sm text-gray-600">Transfer your data to another service</p>
                    </div>
                    <button 
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="btn-outline flex items-center"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    We provide your data in a commonly used, machine-readable format.
                  </p>
                </div>
                
                {/* Right to Object */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold">Right to Object</h3>
                      <p className="text-sm text-gray-600">Object to processing of your data</p>
                    </div>
                    <Link to="/profile" className="btn-outline flex items-center">
                      <EyeOff className="h-4 w-4 mr-2" />
                      Manage Privacy
                    </Link>
                  </div>
                  <p className="text-sm text-gray-500">
                    You can object to processing of your personal data by updating your privacy settings.
                  </p>
                </div>
                
                {/* Right to Erasure */}
                <div className="pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold text-red-600">Right to Erasure</h3>
                      <p className="text-sm text-gray-600">Delete your account and all associated data</p>
                    </div>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p>
                      Account deletion is permanent. All your data will be removed from our systems within 30 days.
                      Some data may be retained for legal reasons as outlined in our privacy policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delete Account Confirmation Modal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-xl p-6 max-w-md w-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-red-600">Delete Account</h2>
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-red-50 p-4 rounded-lg text-red-800 text-sm">
                        <p className="font-semibold mb-2">Warning: This action cannot be undone</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>All your personal data will be permanently deleted</li>
                          <li>Your profile will be removed from the platform</li>
                          <li>All applications and messages will be deleted</li>
                          <li>You will lose access to all platform features</li>
                        </ul>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Please enter your email to confirm deletion:
                        </label>
                        <input
                          type="email"
                          value={confirmDelete}
                          onChange={(e) => setConfirmDelete(e.target.value)}
                          placeholder={user?.email}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter your email address: {user?.email}
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || confirmDelete !== user?.email}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {isDeleting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Permanently Delete Account
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            
            {/* Privacy Documentation */}
            <div className="card p-6 bg-gradient-to-r from-gray-50 to-blue-50">
              <h2 className="text-xl font-semibold text-namuh-navy mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Privacy Documentation
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/datenschutz" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-namuh-teal hover:shadow-md transition-all">
                  <div className="flex items-center text-namuh-navy font-medium">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Privacy Policy</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Details on how we collect, process and protect your data
                  </p>
                </Link>
                
                <Link to="/cookie-richtlinie" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-namuh-teal hover:shadow-md transition-all">
                  <div className="flex items-center text-namuh-navy font-medium">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Cookie Policy</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Information about cookies and tracking technologies
                  </p>
                </Link>
                
                <Link to="/settings/processing-register" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-namuh-teal hover:shadow-md transition-all md:col-span-2">
                  <div className="flex items-center text-namuh-navy font-medium">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Records of Processing Activities</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete documentation of how we process your data in accordance with GDPR Article 30
                  </p>
                </Link>
                
                <div className="p-4 bg-white rounded-lg border border-gray-200 md:col-span-2">
                  <div className="flex items-center text-namuh-navy font-medium mb-2">
                    <Info className="h-4 w-4 mr-2" />
                    <span>Data Processing Information</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    We process your data in accordance with the General Data Protection Regulation (GDPR).
                    Your data is stored securely within the European Union. For any privacy-related inquiries,
                    please contact our Data Protection Officer at <a href="mailto:privacy@namuh.de" className="text-namuh-teal hover:underline">privacy@namuh.de</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};