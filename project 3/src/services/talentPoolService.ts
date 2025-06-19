import supabase from './supabaseClient';
import { auditService } from './auditService';

export interface TalentPoolCategory {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
}

export interface TalentEntry {
  id: string;
  applicantId: string;
  applicantName: string;
  profileSummary?: string;
  potentialRole?: string;
  addedDate: Date;
  notes?: string;
  lastContact?: Date;
  skills?: string[];
  matchScore?: number;
}

export interface TalentSearchResult {
  applicantId: string;
  applicantName: string;
  summary?: string;
  matchScore: number;
  skills: string[];
  experienceYears: number;
  avatarUrl?: string;
}

export const talentPoolService = {
  /**
   * Get all talent pool categories for the current recruiter
   */
  getTalentPoolCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('talent_pool_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        memberCount: category.member_count || 0
      }));
    } catch (error) {
      console.error('Error fetching talent pool categories:', error);
      throw error;
    }
  },

  /**
   * Create a new talent pool category
   */
  createTalentPoolCategory: async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase.rpc('create_talent_pool_category', {
        p_name: name,
        p_description: description
      });
      
      if (error) throw error;
      
      // Log category creation
      auditService.logAuditEvent('talent_pool_category_created', { 
        name, 
        description 
      });
      
      return data;
    } catch (error) {
      console.error('Error creating talent pool category:', error);
      throw error;
    }
  },

  /**
   * Add an applicant to a talent pool category
   */
  addToTalentPool: async (applicantId: string, poolId: string, notes?: string, potentialRole?: string) => {
    try {
      const { data, error } = await supabase.rpc('add_to_talent_pool', {
        p_applicant_id: applicantId,
        p_pool_id: poolId,
        p_notes: notes,
        p_potential_role: potentialRole
      });
      
      if (error) throw error;
      
      // Log adding to talent pool
      auditService.logAuditEvent('talent_added_to_pool', { 
        applicantId, 
        poolId 
      }, 'talent_pool_entries', data);
      
      return data;
    } catch (error) {
      console.error('Error adding to talent pool:', error);
      throw error;
    }
  },

  /**
   * Get all entries in a talent pool category
   */
  getTalentPoolEntries: async (poolId?: string) => {
    try {
      const { data, error } = await supabase.rpc('get_talent_pool', {
        p_pool_id: poolId
      });
      
      if (error) throw error;
      
      return data.map((entry: any) => ({
        id: entry.entry_id,
        applicantId: entry.applicant_id,
        applicantName: entry.applicant_name,
        profileSummary: entry.profile_summary,
        potentialRole: entry.potential_role,
        addedDate: new Date(entry.added_date),
        notes: entry.notes,
        skills: entry.hard_skills || [],
        matchScore: entry.match_score
      }));
    } catch (error) {
      console.error('Error fetching talent pool entries:', error);
      throw error;
    }
  },

  /**
   * Search for talent by skills or other criteria
   */
  searchTalents: async (searchQuery: string, skills?: string[], minMatchScore = 70) => {
    try {
      const { data, error } = await supabase.rpc('search_talents', {
        p_search_query: searchQuery,
        p_skills: skills,
        p_min_match_score: minMatchScore
      });
      
      if (error) throw error;
      
      // Log search
      auditService.logAuditEvent('talent_search', { 
        searchQuery, 
        skills, 
        minMatchScore 
      });
      
      return data.map((result: any) => ({
        applicantId: result.applicant_id,
        applicantName: result.applicant_name,
        summary: result.summary,
        matchScore: result.match_score,
        skills: result.skills || [],
        experienceYears: result.experience_years,
        avatarUrl: result.avatar_url
      }));
    } catch (error) {
      console.error('Error searching talents:', error);
      throw error;
    }
  },

  /**
   * Remove an entry from a talent pool
   */
  removeFromTalentPool: async (entryId: string) => {
    try {
      const { data, error } = await supabase.rpc('remove_from_talent_pool', {
        p_entry_id: entryId
      });
      
      if (error) throw error;
      
      // Log removal
      auditService.logAuditEvent('talent_removed_from_pool', { 
        entryId 
      });
      
      return data;
    } catch (error) {
      console.error('Error removing from talent pool:', error);
      throw error;
    }
  },

  /**
   * Update talent pool entry notes
   */
  updateTalentPoolEntry: async (entryId: string, notes?: string, potentialRole?: string) => {
    try {
      const updates: any = {};
      if (notes !== undefined) updates.notes = notes;
      if (potentialRole !== undefined) updates.potential_role = potentialRole;
      
      const { data, error } = await supabase
        .from('talent_pool_entries')
        .update(updates)
        .eq('id', entryId)
        .select();
      
      if (error) throw error;
      
      // Log update
      auditService.logAuditEvent('talent_pool_entry_updated', { 
        entryId, 
        updates 
      }, 'talent_pool_entries', entryId);
      
      return data[0];
    } catch (error) {
      console.error('Error updating talent pool entry:', error);
      throw error;
    }
  },
  
  /**
   * Get remaining talent search count
   */
  getRemainingSearches: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('profile_matcher_searches_remaining, tier_name')
        .eq('user_id', userData.user.id)
        .single();
      
      if (error) throw error;
      
      return {
        remaining: data.profile_matcher_searches_remaining || 0,
        tier: data.tier_name
      };
    } catch (error) {
      console.error('Error getting remaining talent searches:', error);
      throw error;
    }
  }
};