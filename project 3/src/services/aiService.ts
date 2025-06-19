import supabase from './supabaseClient';
import { auditService } from './auditService';

export const aiService = {
  /**
   * Generate cover letter for job application
   */
  generateCoverLetter: async (jobId: string, customizationPrompts?: string) => {
    try {
      // Check if user has tokens
      const hasTokens = await checkAndDeductTokens(1, 'cover_letter_generation');
      if (!hasTokens) {
        throw new Error('Nicht genügend Tokens verfügbar. Bitte laden Sie Ihr Token-Guthaben auf.');
      }
      
      const { data, error } = await supabase.rpc('generate_cover_letter', {
        p_job_id: jobId,
        p_customization_prompts: customizationPrompts
      });
      
      if (error) throw error;
      
      // Log AI interaction
      auditService.logAuditEvent('ai_feature_used', {
        feature: 'cover_letter_generation',
        jobId,
        tokensUsed: 1
      }, 'ai_interactions');
      
      return data;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  },
  
  /**
   * Calculate CV match score against job
   */
  calculateCVMatch: async (jobId: string, cvText: string) => {
    try {
      // Check if user has tokens
      const hasTokens = await checkAndDeductTokens(1, 'cv_match_calculation');
      if (!hasTokens) {
        throw new Error('Nicht genügend Tokens verfügbar. Bitte laden Sie Ihr Token-Guthaben auf.');
      }
      
      const { data, error } = await supabase.rpc('calculate_cv_match', {
        p_job_id: jobId,
        p_cv_text: cvText
      });
      
      if (error) throw error;
      
      // Log AI interaction
      auditService.logAuditEvent('ai_feature_used', {
        feature: 'cv_match_calculation',
        jobId,
        tokensUsed: 1
      }, 'ai_interactions');
      
      return data;
    } catch (error) {
      console.error('Error calculating CV match:', error);
      throw error;
    }
  },
  
  /**
   * Generate AI suggestions for job posting
   */
  generateJobSuggestions: async (jobId: string) => {
    try {
      // Check if user has tokens
      const hasTokens = await checkAndDeductTokens(1, 'job_suggestions');
      if (!hasTokens) {
        throw new Error('Nicht genügend Tokens verfügbar. Bitte laden Sie Ihr Token-Guthaben auf.');
      }
      
      const { data, error } = await supabase.rpc('generate_job_ai_suggestions', {
        p_job_id: jobId
      });
      
      if (error) throw error;
      
      // Log AI interaction
      auditService.logAuditEvent('ai_feature_used', {
        feature: 'job_suggestions',
        jobId,
        tokensUsed: 1
      }, 'ai_interactions');
      
      return data;
    } catch (error) {
      console.error('Error generating job suggestions:', error);
      throw error;
    }
  },
  
  /**
   * Generate AI interview questions based on job
   */
  generateInterviewQuestions: async (jobId: string) => {
    try {
      // Check if user has tokens
      const hasTokens = await checkAndDeductTokens(2, 'interview_questions');
      if (!hasTokens) {
        throw new Error('Nicht genügend Tokens verfügbar. Bitte laden Sie Ihr Token-Guthaben auf.');
      }
      
      const { data, error } = await supabase.rpc('generate_interview_questions', {
        p_job_id: jobId
      });
      
      if (error) throw error;
      
      // Log AI interaction
      auditService.logAuditEvent('ai_feature_used', {
        feature: 'interview_questions',
        jobId,
        tokensUsed: 2
      }, 'ai_interactions');
      
      return data;
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw error;
    }
  },
  
  /**
   * Log AI interaction without token deduction
   */
  logAiInteraction: async (flowName: string, input: any, output: any) => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return; // Silently fail if no user
      
      const { error } = await supabase.from('token_transactions').insert({
        user_id: userData.user.id,
        type: 'log_only',
        amount: 0,
        flow_name: flowName,
        description: 'AI interaction log',
        timestamp: new Date().toISOString()
      });
      
      if (error) console.error('Error logging AI interaction:', error);
      
    } catch (error) {
      console.error('Error logging AI interaction:', error);
      // Don't throw error to avoid breaking app flow
    }
  }
};

/**
 * Helper function to check token balance and deduct tokens if available
 */
async function checkAndDeductTokens(amount: number, flowName: string): Promise<boolean> {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Get current token balance
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('token_balance')
      .eq('user_id', userData.user.id)
      .single();
    
    if (subError) throw subError;
    
    // Check if user has enough tokens
    if (!subscription || subscription.token_balance < amount) {
      return false;
    }
    
    // Deduct tokens
    const { data, error } = await supabase.rpc('deduct_ai_token', {
      user_id: userData.user.id,
      token_count: amount,
      flow_name: flowName
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error checking or deducting tokens:', error);
    return false;
  }
}