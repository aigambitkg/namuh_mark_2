import { create } from 'zustand';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { communityService } from '../services/communityService';

export interface Job {
  id: string;
  title: string;
  companyName: string;
  companyId: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  postedDate: Date;
  endDate?: Date;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  isLeadershipRole: boolean;
  status: 'active' | 'draft' | 'archived';
  recruiterId: string;
  matchScore?: number;
  profileQuestions?: string[];
  applicationPhases: string[];
  requiredDocuments?: string[];
  performanceStats: {
    impressions: number;
    clicks: number;
    avgDwellTimeSeconds: number;
    cvMatcherUses: number;
  };
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: string;
  currentPhase: string;
  appliedDate: Date;
  lastUpdated: Date;
  matchScore: number;
  invitationLikelihood: 'High' | 'Moderate' | 'Low';
  cvUrl?: string;
  coverLetterUrl?: string;
  applicationSource: string;
  job?: Job;
  rating?: number;
  ratingSubject?: string;
  feedback?: string;
  contractNotes?: string;
  lastCommunication?: {
    date: Date;
    messageSnippet: string;
    phase: string;
  };
}

export interface ForumGroup {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorType: 'applicant' | 'recruiter';
  createdDate: Date;
  postCount: number;
  memberCount: number;
}

interface AppState {
  jobs: Job[];
  applications: Application[];
  forumGroups: ForumGroup[];
  selectedJob: Job | null;
  searchQuery: string;
  filters: {
    location: string;
    employmentType: string;
    salaryMin: number;
    isLeadershipRole: boolean;
  };
  isLoading: {
    jobs: boolean;
    applications: boolean;
    forums: boolean;
  };
  
  // Actions
  fetchJobs: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  fetchForumGroups: () => Promise<void>;
  setSelectedJob: (job: Job | null) => void;
  setSearchQuery: (query: string) => void;
  updateFilters: (filters: Partial<AppState['filters']>) => void;
  addApplication: (application: Application) => void;
  updateApplicationStatus: (applicationId: string, status: string, phase: string, evaluation?: any) => Promise<void>;
  addJob: (job: Job) => Promise<void>;
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
}

// Initialize with empty data, will be populated from Supabase
export const useAppStore = create<AppState>((set, get) => ({
  jobs: [],
  applications: [],
  forumGroups: [],
  selectedJob: null,
  searchQuery: '',
  filters: {
    location: '',
    employmentType: '',
    salaryMin: 0,
    isLeadershipRole: false,
  },
  isLoading: {
    jobs: false,
    applications: false,
    forums: false,
  },

  fetchJobs: async () => {
    set(state => ({ isLoading: { ...state.isLoading, jobs: true } }));
    try {
      const filters = get().filters;
      const searchQuery = get().searchQuery;
      const jobsData = await jobService.getJobs({
        ...filters,
        searchQuery: searchQuery || undefined,
      });
      set({ jobs: jobsData, isLoading: { ...get().isLoading, jobs: false } });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      set(state => ({ isLoading: { ...state.isLoading, jobs: false } }));
    }
  },

  fetchApplications: async () => {
    set(state => ({ isLoading: { ...state.isLoading, applications: true } }));
    try {
      const applicationsData = await applicationService.getUserApplications();
      set({ applications: applicationsData, isLoading: { ...get().isLoading, applications: false } });
    } catch (error) {
      console.error('Error fetching applications:', error);
      set(state => ({ isLoading: { ...state.isLoading, applications: false } }));
    }
  },

  fetchForumGroups: async () => {
    set(state => ({ isLoading: { ...state.isLoading, forums: true } }));
    try {
      const forumGroupsData = await communityService.getForumGroups();
      set({ forumGroups: forumGroupsData, isLoading: { ...get().isLoading, forums: false } });
    } catch (error) {
      console.error('Error fetching forum groups:', error);
      set(state => ({ isLoading: { ...state.isLoading, forums: false } }));
    }
  },

  setSelectedJob: (job) => set({ selectedJob: job }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  updateFilters: (newFilters) => 
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  
  addApplication: (application) =>
    set((state) => ({ applications: [...state.applications, application] })),
  
  updateApplicationStatus: async (applicationId, status, phase, evaluation = {}) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, status, phase, evaluation);
      
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === applicationId
            ? { 
                ...app, 
                status, 
                currentPhase: phase, 
                lastUpdated: new Date(),
                ...evaluation
              }
            : app
        ),
      }));
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  addJob: async (job) => {
    try {
      const newJob = await jobService.createJob(job);
      set((state) => ({ jobs: [...state.jobs, newJob] }));
      return;
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  },

  updateJob: async (jobId, updates) => {
    try {
      // In a real implementation, this would call the API
      // For now, just update local state
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === jobId ? { ...job, ...updates } : job
        ),
      }));
      return;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  deleteJob: async (jobId) => {
    try {
      // In a real implementation, this would call the API
      // For now, just update local state
      set((state) => ({
        jobs: state.jobs.filter((job) => job.id !== jobId),
      }));
      return;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },
}));