import supabase from './supabaseClient';
import { auditService } from './auditService';
import { Application } from '../store/appStore';

export const applicationService = {
  /**
   * Get applications for current user based on role
   */
  getUserApplications: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Get profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('profile_id, role')
        .eq('id', userData.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Different queries based on role
      if (profileData.role === 'applicant') {
        // For applicants, get their applications
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            job_id,
            applicant_id,
            applicant_name,
            job_title,
            company_name,
            status,
            current_phase,
            applied_date,
            last_updated,
            match_score,
            invitation_likelihood,
            cv_url,
            cover_letter_url,
            profile_summary_from_application,
            profile_answers_from_application,
            application_source,
            last_communication,
            evaluation,
            jobs(
              id,
              title,
              company_name,
              application_phases
            )
          `)
          .eq('applicant_id', profileData.profile_id)
          .order('applied_date', { ascending: false });
        
        if (error) throw error;
        
        // Format dates and map to frontend model
        return data.map((app) => {
          const application: Application = {
            id: app.id,
            jobId: app.job_id,
            applicantId: app.applicant_id,
            applicantName: app.applicant_name || '',
            jobTitle: app.job_title || '',
            companyName: app.company_name || '',
            status: app.status || 'Applied',
            currentPhase: app.current_phase || 'Bewerbung eingegangen',
            appliedDate: new Date(app.applied_date),
            lastUpdated: new Date(app.last_updated),
            matchScore: app.match_score || 0,
            invitationLikelihood: app.invitation_likelihood as any || 'Moderate',
            cvUrl: app.cv_url,
            coverLetterUrl: app.cover_letter_url,
            applicationSource: app.application_source || 'Website',
            job: app.jobs ? {
              id: app.jobs.id,
              title: app.jobs.title,
              companyName: app.jobs.company_name || '',
              applicationPhases: app.jobs.application_phases || []
            } as any : undefined,
            // Handle evaluation data if it exists
            rating: app.evaluation?.rating,
            ratingSubject: app.evaluation?.ratingSubject,
            feedback: app.evaluation?.feedback,
            contractNotes: app.evaluation?.contractNotes
          };
          
          // Handle last communication if it exists
          if (app.last_communication) {
            application.lastCommunication = {
              date: new Date(app.last_communication.date),
              messageSnippet: app.last_communication.messageSnippet,
              phase: app.last_communication.phase
            };
          }
          
          return application;
        });
      } else {
        // For recruiters, get applications for their jobs
        const { data: applications, error } = await supabase
          .from('applications')
          .select(`
            id,
            job_id,
            applicant_id,
            applicant_name,
            job_title,
            company_name,
            status,
            current_phase,
            applied_date,
            last_updated,
            match_score,
            invitation_likelihood,
            cv_url,
            cover_letter_url,
            profile_summary_from_application,
            profile_answers_from_application,
            application_source,
            last_communication,
            evaluation,
            jobs!inner(
              id,
              title,
              company_name,
              application_phases,
              recruiter_id
            )
          `)
          .eq('jobs.recruiter_id', profileData.profile_id);
        
        if (error) throw error;
        
        // Format dates and map to frontend model
        return applications.map((app) => {
          const application: Application = {
            id: app.id,
            jobId: app.job_id,
            applicantId: app.applicant_id,
            applicantName: app.applicant_name || '',
            jobTitle: app.job_title || '',
            companyName: app.company_name || '',
            status: app.status || 'Applied',
            currentPhase: app.current_phase || 'Bewerbung eingegangen',
            appliedDate: new Date(app.applied_date),
            lastUpdated: new Date(app.last_updated),
            matchScore: app.match_score || 0,
            invitationLikelihood: app.invitation_likelihood as any || 'Moderate',
            cvUrl: app.cv_url,
            coverLetterUrl: app.cover_letter_url,
            applicationSource: app.application_source || 'Website',
            job: app.jobs ? {
              id: app.jobs.id,
              title: app.jobs.title,
              companyName: app.jobs.company_name || '',
              applicationPhases: app.jobs.application_phases || []
            } as any : undefined,
            // Handle evaluation data if it exists
            rating: app.evaluation?.rating,
            ratingSubject: app.evaluation?.ratingSubject,
            feedback: app.evaluation?.feedback,
            contractNotes: app.evaluation?.contractNotes
          };
          
          // Handle last communication if it exists
          if (app.last_communication) {
            application.lastCommunication = {
              date: new Date(app.last_communication.date),
              messageSnippet: app.last_communication.messageSnippet,
              phase: app.last_communication.phase
            };
          }
          
          return application;
        });
      }
    } catch (error) {
      console.error('Error getting user applications:', error);
      throw error;
    }
  },
  
  /**
   * Update application status (for recruiters)
   */
  updateApplicationStatus: async (
    applicationId: string, 
    status: string, 
    phase: string,
    evaluation?: any
  ) => {
    try {
      const { data, error } = await supabase.rpc('update_application_status', {
        p_application_id: applicationId,
        p_new_status: status,
        p_new_phase: phase,
        p_evaluation: evaluation || null
      });
      
      if (error) throw error;
      
      // Log the status update
      auditService.logAuditEvent('application_status_updated', {
        applicationId,
        newStatus: status,
        newPhase: phase,
        hasEvaluation: !!evaluation
      }, 'applications', applicationId);
      
      return data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },
  
  /**
   * Get application details by ID
   */
  getApplicationById: async (applicationId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('profile_id, role')
        .eq('id', userData.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Different queries based on user role
      let query;
      if (profileData.role === 'applicant') {
        // Applicants can only view their own applications
        query = supabase
          .from('applications')
          .select(`
            *,
            jobs(*),
            documents(*)
          `)
          .eq('id', applicationId)
          .eq('applicant_id', profileData.profile_id);
      } else {
        // Recruiters can view applications for jobs they own
        query = supabase
          .from('applications')
          .select(`
            *,
            jobs!inner(*),
            documents(*)
          `)
          .eq('id', applicationId)
          .eq('jobs.recruiter_id', profileData.profile_id);
      }
      
      const { data, error } = await query.single();
      
      if (error) throw error;
      
      // Log the view
      auditService.logAuditEvent('application_viewed', {
        applicationId
      }, 'applications', applicationId);
      
      return {
        ...data,
        appliedDate: new Date(data.applied_date),
        lastUpdated: new Date(data.last_updated)
      };
    } catch (error) {
      console.error('Error getting application by ID:', error);
      throw error;
    }
  },
  
  /**
   * Add a note to an application
   */
  addApplicationNote: async (applicationId: string, note: string, isInternal: boolean = false) => {
    try {
      const { data, error } = await supabase.rpc('add_application_note', {
        p_application_id: applicationId,
        p_note: note,
        p_is_internal: isInternal
      });
      
      if (error) throw error;
      
      // Log note creation
      auditService.logAuditEvent('application_note_added', {
        applicationId
      }, 'applications', applicationId);
      
      return data;
    } catch (error) {
      console.error('Error adding application note:', error);
      throw error;
    }
  },
  
  /**
   * Get notes for an application
   */
  getApplicationNotes: async (applicationId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_application_notes', {
        p_application_id: applicationId
      });
      
      if (error) throw error;
      
      return data.map((note: any) => ({
        id: note.id,
        note: note.note,
        createdAt: new Date(note.created_at),
        userRole: note.user_role,
        isInternal: note.is_internal
      }));
    } catch (error) {
      console.error('Error getting application notes:', error);
      throw error;
    }
  },
  
  /**
   * Get application statistics for a job
   */
  getApplicationStats: async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('application_stats_by_job')
        .select('*')
        .eq('job_id', jobId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" - not an error in this case
      
      // Return empty stats if none exist yet
      if (!data) {
        return {
          jobId,
          totalApplications: 0,
          newApplications: 0,
          inReview: 0,
          interviewing: 0,
          offers: 0,
          rejected: 0,
          avgMatchScore: 0,
          firstApplication: null,
          latestApplication: null
        };
      }
      
      return {
        ...data,
        firstApplication: data.first_application ? new Date(data.first_application) : null,
        latestApplication: data.latest_application ? new Date(data.latest_application) : null
      };
    } catch (error) {
      console.error('Error getting application statistics:', error);
      throw error;
    }
  }
};