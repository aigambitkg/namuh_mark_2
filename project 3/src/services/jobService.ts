import supabase from './supabaseClient';
import { auditService } from './auditService';
import { Job } from '../store/appStore';

export const jobService = {
  /**
   * Get all jobs with optional filters
   */
  getJobs: async (filters?: {
    location?: string;
    employmentType?: string;
    salaryMin?: number;
    isLeadershipRole?: boolean;
    searchQuery?: string;
  }) => {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_name,
          company_id,
          location,
          salary_min,
          salary_max,
          currency,
          description,
          responsibilities,
          qualifications,
          benefits,
          posted_date,
          end_date,
          employment_type,
          is_leadership_role,
          status,
          recruiter_id,
          application_phases,
          performance_stats
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters) {
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.employmentType) {
          query = query.eq('employment_type', filters.employmentType);
        }
        if (filters.salaryMin) {
          query = query.gte('salary_min', filters.salaryMin);
        }
        if (filters.isLeadershipRole !== undefined) {
          query = query.eq('is_leadership_role', filters.isLeadershipRole);
        }
        if (filters.searchQuery) {
          query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Log this search activity
      auditService.logAuditEvent('job_search', { filters }, 'jobs');

      // Get user session to calculate match score
      const { data: userData } = await supabase.auth.getUser();
      
      // Map to our application format and calculate match scores when authenticated
      const jobs: Job[] = data.map(job => {
        // Attempt to calculate match score for authenticated users
        let matchScore: number | undefined = undefined;
        
        if (userData?.user) {
          // Calculate a deterministic but seemingly random score based on job ID and user ID
          // This is a placeholder - in a real app, you'd use the AI-based match score
          const combinedId = job.id + userData.user.id;
          const hashCode = Array.from(combinedId).reduce(
            (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);
          matchScore = Math.abs(hashCode % 30) + 70; // Score between 70-99
        }
        
        return {
          id: job.id,
          title: job.title,
          companyName: job.company_name || '',
          companyId: job.company_id,
          location: job.location || '',
          salaryMin: job.salary_min || 0,
          salaryMax: job.salary_max || 0,
          currency: job.currency || 'EUR',
          description: job.description,
          responsibilities: job.responsibilities || [],
          qualifications: job.qualifications || [],
          benefits: job.benefits || [],
          postedDate: new Date(job.posted_date),
          endDate: job.end_date ? new Date(job.end_date) : undefined,
          employmentType: job.employment_type as any || 'full-time',
          isLeadershipRole: job.is_leadership_role || false,
          status: job.status as 'active' | 'draft' | 'archived',
          recruiterId: job.recruiter_id,
          matchScore,
          applicationPhases: job.application_phases || [],
          performanceStats: job.performance_stats || {
            impressions: 0,
            clicks: 0,
            avgDwellTimeSeconds: 0,
            cvMatcherUses: 0
          }
        };
      });

      return jobs;
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  },

  /**
   * Get a specific job by ID
   */
  getJobById: async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company_profiles(*)
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;

      // Log view activity
      auditService.logAuditEvent('job_view', { jobId }, 'jobs', jobId);
      
      // Update job view count atomically
      await supabase.rpc('increment_job_views', { p_job_id: jobId });

      return {
        ...data,
        postedDate: new Date(data.posted_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined
      };
    } catch (error) {
      console.error('Error getting job by ID:', error);
      throw error;
    }
  },

  /**
   * Apply to a job
   */
  applyToJob: async (
    jobId: string,
    formData: {
      coverLetter?: string,
      profileSummary?: string
    },
    cv?: File,
    coverLetterFile?: File,
    additionalDocs?: File[]
  ) => {
    try {
      // First, upload documents if provided
      let cvUrl, coverLetterUrl, additionalDocUrls = [];

      // Helper function for file upload
      const uploadFile = async (file: File, path: string) => {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(`${path}/${fileName}`, file);
        
        if (error) throw error;
        return data.path;
      };

      if (cv) {
        cvUrl = await uploadFile(cv, 'cv');
      }

      if (coverLetterFile) {
        coverLetterUrl = await uploadFile(coverLetterFile, 'cover_letters');
      }

      if (additionalDocs?.length) {
        for (const doc of additionalDocs) {
          const url = await uploadFile(doc, 'additional');
          additionalDocUrls.push(url);
        }
      }

      // Apply to job using RPC function
      const { data: applicationData, error: applicationError } = await supabase.rpc('apply_to_job', {
        p_job_id: jobId,
        p_cv_url: cvUrl,
        p_cover_letter_url: coverLetterUrl,
        p_profile_summary: formData.profileSummary || formData.coverLetter,
        p_application_source: 'website'
      });

      if (applicationError) throw applicationError;

      // Log the application
      auditService.logAuditEvent('job_application_submitted', { 
        jobId, 
        hasCV: !!cvUrl,
        hasCoverLetter: !!coverLetterUrl || !!formData.coverLetter
      }, 'applications', applicationData);

      return applicationData;
    } catch (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
  },

  /**
   * Create a new job (for recruiters)
   */
  createJob: async (jobData: any) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Create new job - all validation happens on the backend
      const { data, error } = await supabase.rpc('create_job', {
        p_title: jobData.title,
        p_company_name: jobData.companyName,
        p_company_id: jobData.companyId,
        p_location: jobData.location,
        p_description: jobData.description,
        p_salary_min: jobData.salaryMin,
        p_salary_max: jobData.salaryMax,
        p_currency: jobData.currency || 'EUR',
        p_responsibilities: jobData.responsibilities,
        p_qualifications: jobData.qualifications,
        p_benefits: jobData.benefits,
        p_is_leadership_role: jobData.isLeadershipRole,
        p_employment_type: jobData.employmentType,
        p_application_phases: jobData.applicationPhases,
        p_status: jobData.status || 'draft'
      });

      if (error) {
        // Handle specific error cases from backend validation
        if (error.message.includes('job posting limit reached')) {
          throw new Error('Sie haben Ihr Limit an aktiven Stellenanzeigen erreicht. Bitte upgraden Sie Ihr Abonnement.');
        }
        throw error;
      }

      // Get the created job
      const { data: jobData, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', data)
        .single();
        
      if (fetchError) throw fetchError;

      // Log job creation
      auditService.logAuditEvent('job_created', {
        jobId: data,
        title: jobData.title
      }, 'jobs', data);

      return {
        ...jobData,
        postedDate: new Date(jobData.posted_date),
        endDate: jobData.end_date ? new Date(jobData.end_date) : undefined
      };
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  /**
   * Update an existing job
   */
  updateJob: async (jobId: string, updates: Partial<Job>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Prepare data for update
      const updateData: any = {};
      
      // Map from our frontend model to the database model
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.companyName !== undefined) updateData.company_name = updates.companyName;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.salaryMin !== undefined) updateData.salary_min = updates.salaryMin;
      if (updates.salaryMax !== undefined) updateData.salary_max = updates.salaryMax;
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.responsibilities !== undefined) updateData.responsibilities = updates.responsibilities;
      if (updates.qualifications !== undefined) updateData.qualifications = updates.qualifications;
      if (updates.benefits !== undefined) updateData.benefits = updates.benefits;
      if (updates.employmentType !== undefined) updateData.employment_type = updates.employmentType;
      if (updates.isLeadershipRole !== undefined) updateData.is_leadership_role = updates.isLeadershipRole;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.applicationPhases !== undefined) updateData.application_phases = updates.applicationPhases;
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate.toISOString();

      // Update the job
      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      // Log job update
      auditService.logAuditEvent('job_updated', {
        jobId,
        updates: Object.keys(updateData)
      }, 'jobs', jobId);

      return {
        ...data,
        postedDate: new Date(data.posted_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined
      };
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  /**
   * Delete a job (or set it to archived status)
   */
  deleteJob: async (jobId: string, hardDelete: boolean = false) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      if (hardDelete) {
        // Completely delete the job (rarely used - mostly for testing/development)
        const { error } = await supabase
          .from('jobs')
          .delete()
          .eq('id', jobId);
          
        if (error) throw error;
        
        // Log job deletion
        auditService.logAuditEvent('job_deleted', { jobId }, 'jobs', jobId, 'warning');
      } else {
        // Soft delete by setting status to 'archived'
        const { error } = await supabase
          .from('jobs')
          .update({ status: 'archived' })
          .eq('id', jobId);
          
        if (error) throw error;
        
        // Log job archival
        auditService.logAuditEvent('job_archived', { jobId }, 'jobs', jobId);
      }

      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },
  
  /**
   * Search for jobs with advanced filters
   */
  searchJobs: async (filters: {
    query?: string;
    location?: string;
    employmentTypes?: string[];
    salaryRange?: [number, number];
    skills?: string[];
    remote?: boolean;
    isLeadershipRole?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    try {
      // Use the search_jobs RPC function which implements full-text search
      const { data, error } = await supabase.rpc('search_jobs', {
        p_search_query: filters.query || '',
        p_location: filters.location || '',
        p_employment_types: filters.employmentTypes || [],
        p_min_salary: filters.salaryRange ? filters.salaryRange[0] : null,
        p_max_salary: filters.salaryRange ? filters.salaryRange[1] : null,
        p_required_skills: filters.skills || [],
        p_remote_only: filters.remote || false,
        p_leadership_role: filters.isLeadershipRole || false,
        p_page: filters.page || 1,
        p_page_size: filters.pageSize || 20
      });

      if (error) throw error;

      // Log search query
      auditService.logAuditEvent('job_search_advanced', { 
        filters,
        resultCount: data.length 
      }, 'jobs');

      return data.map((job: any) => ({
        ...job,
        postedDate: new Date(job.posted_date),
        endDate: job.end_date ? new Date(job.end_date) : undefined
      }));
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }
};