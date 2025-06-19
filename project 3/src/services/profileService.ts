import supabase from './supabaseClient';
import { auditService } from './auditService';

export const profileService = {
  /**
   * Get current user's profile
   */
  getUserProfile: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Get user data to determine profile type
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('id, email, role, profile_id')
        .eq('id', userData.user.id)
        .single();
      
      if (userError) throw userError;
      
      if (userInfo.role === 'applicant') {
        // Get applicant profile with full details
        const { data: profileData, error: profileError } = await supabase.rpc('get_applicant_full_profile');
        
        if (profileError) throw profileError;
        
        return profileData;
      } else {
        // Get recruiter profile
        const { data: profileData, error: profileError } = await supabase
          .from('recruiter_profiles')
          .select(`
            *,
            company_profiles(*)
          `)
          .eq('id', userInfo.profile_id)
          .single();
        
        if (profileError) throw profileError;
        
        return profileData;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },
  
  /**
   * Update applicant profile
   */
  updateApplicantProfile: async (profileData: any) => {
    try {
      // Call RPC function with all profile fields
      const { data, error } = await supabase.rpc('update_applicant_profile', {
        p_name: profileData.name,
        p_summary: profileData.summary,
        p_contact_email: profileData.contact_email,
        p_contact_phone: profileData.contact_phone,
        p_hard_skills: profileData.hard_skills,
        p_soft_skills: profileData.soft_skills,
        p_visibility: profileData.visibility,
        p_linkedin_profile_url: profileData.linkedin_profile_url,
        p_xing_profile_url: profileData.xing_profile_url,
        p_allow_in_talent_pool: profileData.allow_in_talent_pool
      });
      
      if (error) throw error;
      
      // Log profile update
      auditService.logAuditEvent('profile_updated', {
        profile_type: 'applicant',
        fields_updated: Object.keys(profileData)
      }, 'applicant_profiles', data);
      
      return data;
    } catch (error) {
      console.error('Error updating applicant profile:', error);
      throw error;
    }
  },
  
  /**
   * Update recruiter profile
   */
  updateRecruiterProfile: async (profileData: any) => {
    try {
      // Call RPC function with all profile fields
      const { data, error } = await supabase.rpc('update_recruiter_profile', {
        p_name: profileData.name,
        p_role_title: profileData.role_title,
        p_company_name: profileData.company_name,
        p_bio: profileData.bio,
        p_linkedin_profile_url: profileData.linkedin_profile_url,
        p_availability_notes: profileData.availability_notes,
        p_share_calendar: profileData.share_calendar,
        p_calendar_url: profileData.calendar_url,
        p_allow_applicant_feedback: profileData.allow_applicant_feedback
      });
      
      if (error) throw error;
      
      // Log profile update
      auditService.logAuditEvent('profile_updated', {
        profile_type: 'recruiter',
        fields_updated: Object.keys(profileData)
      }, 'recruiter_profiles', data);
      
      return data;
    } catch (error) {
      console.error('Error updating recruiter profile:', error);
      throw error;
    }
  },
  
  /**
   * Add education to applicant profile
   */
  addEducation: async (educationData: any) => {
    try {
      const { data, error } = await supabase.rpc('add_applicant_education', {
        p_institution: educationData.institution,
        p_degree: educationData.degree,
        p_field_of_study: educationData.fieldOfStudy,
        p_start_date: educationData.startDate,
        p_end_date: educationData.endDate,
        p_grade: educationData.grade,
        p_activities: educationData.activities,
        p_description: educationData.description,
        p_is_current: educationData.isCurrent
      });
      
      if (error) throw error;
      
      // Log education added
      auditService.logAuditEvent('education_added', {
        institution: educationData.institution,
        degree: educationData.degree
      }, 'applicant_educations', data);
      
      return data;
    } catch (error) {
      console.error('Error adding education:', error);
      throw error;
    }
  },
  
  /**
   * Add experience to applicant profile
   */
  addExperience: async (experienceData: any) => {
    try {
      const { data, error } = await supabase.rpc('add_applicant_experience', {
        p_company: experienceData.company,
        p_position: experienceData.position,
        p_start_date: experienceData.startDate,
        p_location: experienceData.location,
        p_end_date: experienceData.endDate,
        p_is_current: experienceData.isCurrent,
        p_description: experienceData.description,
        p_skills: experienceData.skills
      });
      
      if (error) throw error;
      
      // Log experience added
      auditService.logAuditEvent('experience_added', {
        company: experienceData.company,
        position: experienceData.position
      }, 'applicant_experiences', data);
      
      return data;
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  },
  
  /**
   * Add certification to applicant profile
   */
  addCertification: async (certificationData: any) => {
    try {
      const { data, error } = await supabase.rpc('add_applicant_certification', {
        p_name: certificationData.name,
        p_organization: certificationData.organization,
        p_issue_date: certificationData.issueDate,
        p_expiration_date: certificationData.expirationDate,
        p_credential_id: certificationData.credentialId,
        p_credential_url: certificationData.credentialUrl
      });
      
      if (error) throw error;
      
      // Log certification added
      auditService.logAuditEvent('certification_added', {
        name: certificationData.name,
        organization: certificationData.organization
      }, 'applicant_certifications', data);
      
      return data;
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error;
    }
  },
  
  /**
   * Get applicant profile by ID (for recruiters viewing applicants)
   */
  getApplicantProfileById: async (profileId: string) => {
    try {
      // Check if user is a recruiter
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      
      if (userError) throw userError;
      
      if (userInfo.role !== 'recruiter') {
        throw new Error('Only recruiters can view applicant profiles by ID');
      }
      
      // Get applicant profile with limited visibility
      const { data: profileData, error: profileError } = await supabase.rpc('get_applicant_full_profile', {
        p_profile_id: profileId
      });
      
      if (profileError) throw profileError;
      
      // Log profile view for analytics
      auditService.logAuditEvent('applicant_profile_viewed', {
        profile_id: profileId
      }, 'applicant_profiles', profileId);
      
      return profileData;
    } catch (error) {
      console.error('Error getting applicant profile by ID:', error);
      throw error;
    }
  }
};