import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';

// Layout Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LoadingPage } from './components/common/LoadingSpinner';
import { MobileNavigation } from './components/common/MobileNavigation';
import { ScrollToTop } from './components/ScrollToTop';

// Auth Components
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { EmailConfirmation } from './components/auth/EmailConfirmation';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import { OAuthCallback } from './components/auth/OAuthCallback';
import { VerifyEmail } from './components/auth/VerifyEmail';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Landing Page
import { LandingPage } from './components/landing/LandingPage';

// Common Components
import { Pricing } from './components/common/Pricing';
import { Chat } from './components/common/Chat';
import { Community } from './components/common/Community';
import { QuickApplication } from './components/common/QuickApplication';
import { JobDetails } from './components/common/JobDetails';

// Applicant Components
import { ApplicantDashboard } from './components/applicant/Dashboard';
import { JobSearch } from './components/applicant/JobSearch';
import { AIHub } from './components/applicant/AIHub';
import { ApplicantProfile } from './components/applicant/Profile';
import { QuizMe } from './components/applicant/QuizMe';
import { Applications } from './components/applicant/Applications';
import { QuickApplyBatch } from './components/applicant/QuickApplyBatch';
import { GeminiAIChat } from './components/applicant/GeminiAIChat';

// Recruiter Components
import { RecruiterDashboard } from './components/recruiter/Dashboard';
import { RecruiterJobs } from './components/recruiter/Jobs';
import { CreateJob } from './components/recruiter/CreateJob';
import { TalentPool } from './components/recruiter/TalentPool';
import { Analytics } from './components/recruiter/Analytics';
import { Multiposting } from './components/recruiter/Multiposting';
import { RecruiterApplications } from './components/recruiter/Applications';
import { RecruiterProfile } from './components/recruiter/Profile';

// Settings Components
import { PrivacySettings } from './components/Settings/PrivacySettings';
import { ProcessingActivitiesRegister } from './components/Settings/ProcessingActivitiesRegister';
import { SubscriptionSettings } from './components/Settings/SubscriptionSettings';

// Legal pages - Import these from AdditionalSections
import {
  MediaDataSection,
  LegalSections,
  EnhancedContactSection
} from './components/landing/AdditionalSections';

// Standalone legal pages
const DatenschutzPage = () => (
  <div className="py-8">
    <div id="datenschutz">
      {LegalSections().props.children[0]}
    </div>
  </div>
);

const ImpressumPage = () => (
  <div className="py-8">
    <div id="impressum">
      {LegalSections().props.children[1]}
    </div>
  </div>
);

const CookieRichtliniePage = () => (
  <div className="py-8">
    <div id="cookie-policy">
      {LegalSections().props.children[2]}
    </div>
  </div>
);

const KontaktPage = () => (
  <div className="py-8">
    <EnhancedContactSection />
  </div>
);

const MediadatenPage = () => (
  <div className="py-8">
    <MediaDataSection />
  </div>
);

function App() {
  const { user, isAuthenticated, isLoading, checkAuthState } = useAuthStore();
  const { fetchJobs, fetchApplications, fetchForumGroups } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);

  // Check auth state on app load
  useEffect(() => {
    checkAuthState();
  }, []);
  
  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs();
      fetchApplications();
      fetchForumGroups();
    }
  }, [isAuthenticated]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Scroll to top on route change */}
        <ScrollToTop />
        
        {/* Main Layout Container */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1 flex flex-col">
            <div className={`flex-1 ${isAuthenticated ? 'lg:pl-64 pt-2' : ''}`}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to={user?.role === 'applicant' ? '/dashboard' : '/recruiter/dashboard'} />} />
                <Route path="/jobs" element={<JobSearch />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/jobs/:jobId/apply" element={<QuickApplication />} />
                <Route path="/community" element={<Community />} />
                <Route path="/pricing" element={<Pricing />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'applicant' ? '/dashboard' : '/recruiter/dashboard'} />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={user?.role === 'applicant' ? '/dashboard' : '/recruiter/dashboard'} />} />
                <Route path="/auth/confirm" element={<EmailConfirmation />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Legal Routes */}
                <Route path="/datenschutz" element={<DatenschutzPage />} />
                <Route path="/impressum" element={<ImpressumPage />} />
                <Route path="/cookie-richtlinie" element={<CookieRichtliniePage />} />
                <Route path="/kontakt" element={<KontaktPage />} />
                <Route path="/mediadaten" element={<MediadatenPage />} />

                {/* Protected Applicant Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="applicant">
                    <ApplicantDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/applications" element={
                  <ProtectedRoute requiredRole="applicant">
                    <Applications />
                  </ProtectedRoute>
                } />
                <Route path="/ai-hub" element={
                  <ProtectedRoute requiredRole="applicant">
                    <AIHub />
                  </ProtectedRoute>
                } />
                <Route path="/ai-hub/:tool" element={
                  <ProtectedRoute requiredRole="applicant">
                    <AIHub />
                  </ProtectedRoute>
                } />
                <Route path="/quiz-me" element={
                  <ProtectedRoute requiredRole="applicant" requiredTier="applicant_professional">
                    <QuizMe />
                  </ProtectedRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/gemini-chat" element={
                  <ProtectedRoute requiredRole="applicant">
                    <GeminiAIChat />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    {user?.role === 'applicant' ? <ApplicantProfile /> : <RecruiterProfile />}
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <PrivacySettings />
                  </ProtectedRoute>
                } />
                <Route path="/settings/privacy" element={
                  <ProtectedRoute>
                    <PrivacySettings />
                  </ProtectedRoute>
                } />
                <Route path="/settings/processing-register" element={
                  <ProtectedRoute>
                    <ProcessingActivitiesRegister />
                  </ProtectedRoute>
                } />
                <Route path="/settings/subscription" element={
                  <ProtectedRoute>
                    <SubscriptionSettings />
                  </ProtectedRoute>
                } />
                <Route path="/quick-apply" element={
                  <ProtectedRoute requiredRole="applicant">
                    <QuickApplyBatch />
                  </ProtectedRoute>
                } />

                {/* Protected Recruiter Routes */}
                <Route path="/recruiter/dashboard" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/jobs" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterJobs />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/jobs/create" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <CreateJob />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/jobs/:id" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <JobDetails />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/jobs/:id/edit" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <div className="p-4 sm:p-6 lg:p-8 text-center">Edit Job Page - Coming Soon</div>
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/jobs/:id/applications" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <div className="p-4 sm:p-6 lg:p-8 text-center">Job Applications Page - Coming Soon</div>
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/jobs/:id/analytics" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <div className="p-4 sm:p-6 lg:p-8 text-center">Job Analytics Page - Coming Soon</div>
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/applications" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterApplications />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/applications/:id" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <div className="p-4 sm:p-6 lg:p-8 text-center">Application Details Page - Coming Soon</div>
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/talent-pool" element={
                  <ProtectedRoute requiredRole="recruiter" requiredTier="recruiter_professional">
                    <TalentPool />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/analytics" element={
                  <ProtectedRoute requiredRole="recruiter" requiredTier="recruiter_starter">
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/templates" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <div className="p-4 sm:p-6 lg:p-8 text-center">Communication Templates Page - Coming Soon</div>
                  </ProtectedRoute>
                } />
                <Route path="/recruiter/multiposting" element={
                  <ProtectedRoute requiredRole="recruiter">
                    <Multiposting />
                  </ProtectedRoute>
                } />

                {/* Fallback Routes */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            
            {/* Footer - Only show for non-authenticated users */}
            {!isAuthenticated && <Footer />}
          </main>
        </div>
        
        {/* Navigation - Show for all authenticated users (mobile and desktop) */}
        {isAuthenticated && <MobileNavigation />}

        {/* Add bottom padding on mobile when authenticated to avoid content being hidden behind mobile nav */}
        {isAuthenticated && isMobile && <div className="h-16 pb-4"></div>}
      </div>
    </Router>
  );
}

export default App