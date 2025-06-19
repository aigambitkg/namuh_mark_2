import React, { useState } from 'react';
import { 
  FileText, 
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Calendar,
  Shield,
  Info,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

// Processing activity types
enum ProcessingCategory {
  Authentication = 'authentication',
  ProfileManagement = 'profile_management',
  JobApplications = 'job_applications',
  Communication = 'communication',
  Analytics = 'analytics',
  ArtificialIntelligence = 'artificial_intelligence',
  Talent = 'talent_management'
}

// Data categories
enum DataCategory {
  Basic = 'basic',
  Contact = 'contact',
  Professional = 'professional',
  Documents = 'documents',
  Authentication = 'authentication',
  Technical = 'technical',
  Communication = 'communication',
  Analytical = 'analytical'
}

// Data subjects
enum DataSubject {
  Applicants = 'applicants',
  Recruiters = 'recruiters',
  Visitors = 'visitors',
  Companies = 'companies'
}

// Legal basis
enum LegalBasis {
  Consent = 'consent',
  Contract = 'contract',
  LegalObligation = 'legal_obligation',
  VitalInterests = 'vital_interests',
  PublicInterest = 'public_interest',
  LegitimateInterests = 'legitimate_interests'
}

interface ProcessingActivity {
  id: string;
  category: ProcessingCategory;
  title: string;
  description: string;
  dataCategories: DataCategory[];
  dataSubjects: DataSubject[];
  purpose: string;
  legalBasis: LegalBasis;
  retention: string;
  recipients: string[];
  thirdCountryTransfers: boolean;
  securityMeasures: string[];
  dataControllerResponsibility: string;
}

export const ProcessingActivitiesRegister: React.FC = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ProcessingCategory | ''>('');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // In a real app, this would be determined by the user's role

  const processingActivities: ProcessingActivity[] = [
    {
      id: '1',
      category: ProcessingCategory.Authentication,
      title: 'User Registration and Authentication',
      description: 'Processing of personal data for user registration, login, and account management.',
      dataCategories: [DataCategory.Basic, DataCategory.Contact, DataCategory.Authentication],
      dataSubjects: [DataSubject.Applicants, DataSubject.Recruiters],
      purpose: 'To provide secure access to the platform and personalized services.',
      legalBasis: LegalBasis.Contract,
      retention: '7 years after account deletion',
      recipients: ['Internal IT Team', 'Supabase (Auth Provider)'],
      thirdCountryTransfers: false,
      securityMeasures: ['Encryption in transit and at rest', 'Multi-factor authentication', 'Access controls'],
      dataControllerResponsibility: 'namuH GmbH acts as data controller'
    },
    {
      id: '2',
      category: ProcessingCategory.ProfileManagement,
      title: 'User Profile Management',
      description: 'Processing of personal data to create and maintain user profiles.',
      dataCategories: [DataCategory.Basic, DataCategory.Contact, DataCategory.Professional],
      dataSubjects: [DataSubject.Applicants, DataSubject.Recruiters],
      purpose: 'To enable users to create and manage their profiles on the platform.',
      legalBasis: LegalBasis.Contract,
      retention: 'Until account deletion + 30 days for backup retention',
      recipients: ['Internal Product Team'],
      thirdCountryTransfers: false,
      securityMeasures: ['Role-based access control', 'Data encryption', 'Regular security assessments'],
      dataControllerResponsibility: 'namuH GmbH acts as data controller'
    },
    {
      id: '3',
      category: ProcessingCategory.JobApplications,
      title: 'Job Application Processing',
      description: 'Processing of personal data submitted as part of job applications.',
      dataCategories: [DataCategory.Professional, DataCategory.Documents, DataCategory.Contact],
      dataSubjects: [DataSubject.Applicants],
      purpose: 'To facilitate job applications and recruitment processes.',
      legalBasis: LegalBasis.Consent,
      retention: '6 months after conclusion of application process',
      recipients: ['Hiring Companies', 'Internal Recruitment Team'],
      thirdCountryTransfers: false,
      securityMeasures: ['End-to-end encryption', 'Access logging', 'Strict access controls'],
      dataControllerResponsibility: 'namuH GmbH acts as data controller, hiring companies as joint controllers'
    },
    {
      id: '4',
      category: ProcessingCategory.Communication,
      title: 'Messaging and Communications',
      description: 'Processing of personal data for messaging and communications between users.',
      dataCategories: [DataCategory.Communication, DataCategory.Contact],
      dataSubjects: [DataSubject.Applicants, DataSubject.Recruiters],
      purpose: 'To enable communications between applicants and recruiters.',
      legalBasis: LegalBasis.LegitimateInterests,
      retention: 'Until account deletion + 90 days for legal compliance',
      recipients: ['Message Recipients', 'Internal IT Team'],
      thirdCountryTransfers: false,
      securityMeasures: ['Message encryption', 'Access controls', 'Anti-abuse monitoring'],
      dataControllerResponsibility: 'namuH GmbH acts as data processor'
    },
    {
      id: '5',
      category: ProcessingCategory.Analytics,
      title: 'Usage Analytics',
      description: 'Processing of usage data to understand platform performance and user behavior.',
      dataCategories: [DataCategory.Technical, DataCategory.Analytical],
      dataSubjects: [DataSubject.Applicants, DataSubject.Recruiters, DataSubject.Visitors],
      purpose: 'To improve user experience and platform performance.',
      legalBasis: LegalBasis.Consent,
      retention: '25 months',
      recipients: ['Internal Product Team', 'Analytics Provider (pseudonymized data)'],
      thirdCountryTransfers: false,
      securityMeasures: ['Data pseudonymization', 'Access controls', 'Data minimization'],
      dataControllerResponsibility: 'namuH GmbH acts as data controller'
    },
    {
      id: '6',
      category: ProcessingCategory.ArtificialIntelligence,
      title: 'AI-Powered Job Matching',
      description: 'Processing of profile and job data to provide AI-based matching recommendations.',
      dataCategories: [DataCategory.Professional, DataCategory.Analytical],
      dataSubjects: [DataSubject.Applicants],
      purpose: 'To provide relevant job matches based on applicant skills and preferences.',
      legalBasis: LegalBasis.Consent,
      retention: 'Active profile duration + 6 months',
      recipients: ['Internal AI Team', 'AI Service Providers (pseudonymized data)'],
      thirdCountryTransfers: false,
      securityMeasures: ['Data pseudonymization', 'Model privacy protection', 'Privacy-by-design approach'],
      dataControllerResponsibility: 'namuH GmbH acts as data controller'
    },
    {
      id: '7',
      category: ProcessingCategory.Talent,
      title: 'Talent Pool Management',
      description: 'Processing of applicant data for inclusion in talent pools.',
      dataCategories: [DataCategory.Professional, DataCategory.Basic, DataCategory.Contact],
      dataSubjects: [DataSubject.Applicants],
      purpose: 'To enable recruiters to maintain pools of talent for future opportunities.',
      legalBasis: LegalBasis.Consent,
      retention: '2 years with periodic consent renewal',
      recipients: ['Recruiter Companies (with specific consent)'],
      thirdCountryTransfers: false,
      securityMeasures: ['Granular access controls', 'Consent management', 'Regular data reviews'],
      dataControllerResponsibility: 'namuH GmbH acts as data controller, recruiter companies as data processors'
    }
  ];

  // Filter activities based on search and category
  const filteredActivities = processingActivities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !filterCategory || activity.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Toggle activity expansion
  const toggleActivity = (id: string) => {
    if (expandedActivity === id) {
      setExpandedActivity(null);
    } else {
      setExpandedActivity(id);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('');
  };
  
  // Generate PDF report (simplified for this example)
  const generatePdfReport = () => {
    alert('Generating PDF report...');
    // In a real app, this would generate a proper PDF document
  };
  
  // Format data categories for display
  const formatDataCategories = (categories: DataCategory[]) => {
    const displayNames: Record<DataCategory, string> = {
      [DataCategory.Basic]: 'Basic Personal Data',
      [DataCategory.Contact]: 'Contact Information',
      [DataCategory.Professional]: 'Professional Information',
      [DataCategory.Documents]: 'Documents & Files',
      [DataCategory.Authentication]: 'Authentication Data',
      [DataCategory.Technical]: 'Technical Metadata',
      [DataCategory.Communication]: 'Communication Content',
      [DataCategory.Analytical]: 'Analytical Data'
    };
    
    return categories.map(category => displayNames[category]);
  };
  
  // Format legal basis for display
  const formatLegalBasis = (basis: LegalBasis) => {
    const displayNames: Record<LegalBasis, string> = {
      [LegalBasis.Consent]: 'Consent (Art. 6(1)(a) GDPR)',
      [LegalBasis.Contract]: 'Performance of a Contract (Art. 6(1)(b) GDPR)',
      [LegalBasis.LegalObligation]: 'Legal Obligation (Art. 6(1)(c) GDPR)',
      [LegalBasis.VitalInterests]: 'Vital Interests (Art. 6(1)(d) GDPR)',
      [LegalBasis.PublicInterest]: 'Public Interest (Art. 6(1)(e) GDPR)',
      [LegalBasis.LegitimateInterests]: 'Legitimate Interests (Art. 6(1)(f) GDPR)'
    };
    
    return displayNames[basis];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-namuh-navy">Records of Processing Activities</h1>
            <p className="mt-2 text-gray-600">
              Documentation of all data processing activities in accordance with GDPR Article 30.
            </p>
          </div>
          
          <button 
            onClick={generatePdfReport}
            className="mt-4 lg:mt-0 btn-primary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </button>
        </div>
        
        {/* Controller Information */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-namuh-navy mb-4">Data Controller Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
              <p className="mt-1 text-gray-900">namuH GmbH</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1 text-gray-900">Musterstraße 123, 10115 Berlin, Germany</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Legal Representative</h3>
              <p className="mt-1 text-gray-900">Dr. Max Mustermann, CEO</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data Protection Officer</h3>
              <p className="mt-1 text-gray-900">Dr. Maria Schmidt (datenschutzbeauftragter@namuh.de)</p>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search processing activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ProcessingCategory | '')}
                className="input-field"
              >
                <option value="">All Categories</option>
                {Object.values(ProcessingCategory).map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())}
                  </option>
                ))}
              </select>
              
              {(searchQuery || filterCategory) && (
                <button 
                  onClick={clearFilters}
                  className="btn-outline flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Processing Activities List */}
        <div className="space-y-6 mb-8">
          {filteredActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="card p-6 border-l-4 border-l-namuh-teal"
            >
              <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => toggleActivity(activity.id)}
              >
                <div>
                  <h2 className="text-xl font-semibold text-namuh-navy">{activity.title}</h2>
                  <p className="text-gray-600 mt-2">{activity.description}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-namuh-teal/10 text-namuh-teal rounded-full text-xs font-medium">
                      {activity.category.replace('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.legalBasis === LegalBasis.Consent 
                        ? 'bg-blue-100 text-blue-800'
                        : activity.legalBasis === LegalBasis.Contract
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {activity.legalBasis.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                </div>
                
                <div>
                  {expandedActivity === activity.id ? (
                    <ChevronUp className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </div>
              
              <AnimatePresence>
                {expandedActivity === activity.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Purpose of Processing</h3>
                        <p className="text-gray-900">{activity.purpose}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Legal Basis</h3>
                        <p className="text-gray-900">{formatLegalBasis(activity.legalBasis)}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Data Categories</h3>
                        <div className="flex flex-wrap gap-1">
                          {formatDataCategories(activity.dataCategories).map((category, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Data Subjects</h3>
                        <div className="flex flex-wrap gap-1">
                          {activity.dataSubjects.map((subject, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              {subject.charAt(0).toUpperCase() + subject.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Recipients</h3>
                        <ul className="list-disc pl-5 text-gray-900 space-y-1">
                          {activity.recipients.map((recipient, index) => (
                            <li key={index}>{recipient}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Retention Period</h3>
                        <p className="text-gray-900">{activity.retention}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Security Measures</h3>
                        <ul className="list-disc pl-5 text-gray-900 space-y-1">
                          {activity.securityMeasures.map((measure, index) => (
                            <li key={index}>{measure}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">International Transfers</h3>
                        <p className="text-gray-900">
                          {activity.thirdCountryTransfers ? 
                            'Data may be transferred outside the EU/EEA' : 
                            'No data is transferred outside the EU/EEA'}
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Controller/Processor Responsibility</h3>
                        <p className="text-gray-900">{activity.dataControllerResponsibility}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No processing activities found</h3>
              <p className="text-gray-500">
                {searchQuery || filterCategory ? 
                  'Try adjusting your filters or search terms.' : 
                  'No processing activities have been defined yet.'}
              </p>
              {(searchQuery || filterCategory) && (
                <button 
                  onClick={clearFilters}
                  className="mt-4 btn-outline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* GDPR Information */}
        <div className="card p-6 bg-blue-50">
          <div className="flex items-center mb-4">
            <Info className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-blue-900">About Records of Processing Activities</h2>
          </div>
          
          <p className="text-blue-800 mb-4">
            This documentation is maintained in accordance with Article 30 of the General Data Protection Regulation (GDPR).
            It outlines all processing activities carried out by namuH as a data controller and processor.
          </p>
          
          <p className="text-blue-800 mb-6">
            As a data subject, you have the right to access, rectify, erase, restrict, and port your personal data. 
            To exercise these rights, please visit our <a href="/settings/privacy" className="text-namuh-teal hover:underline">Privacy Settings</a> page 
            or contact our Data Protection Officer at <a href="mailto:datenschutz@namuh.de" className="text-namuh-teal hover:underline">datenschutz@namuh.de</a>.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="/datenschutz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-namuh-teal hover:underline flex items-center"
            >
              <Shield className="h-4 w-4 mr-1" />
              Privacy Policy
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
            
            <a 
              href="https://gdpr-info.eu/art-30-gdpr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-namuh-teal hover:underline flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              GDPR Article 30
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingActivitiesRegister;