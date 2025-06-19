import supabase from './supabaseClient';

export interface Message {
  role: "user" | "model";
  content: string;
}

export interface ChatCompletionRequest {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatCompletionResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
}

export const geminiService = {
  /**
   * Create a chat completion with Gemini AI
   */
  createChatCompletion: async (chatRequest: ChatCompletionRequest): Promise<string> => {
    try {
      // Check auth state
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData.user) {
        throw new Error('Authentication required');
      }

      // First, try to deduct a token
      const { data: tokenDeducted, error: tokenError } = await supabase.rpc(
        'deduct_ai_token',
        {
          p_user_id: userData.user.id,
          p_token_count: 1,
          p_flow_name: 'gemini_chat'
        }
      );

      if (tokenError) {
        throw tokenError;
      }

      if (!tokenDeducted) {
        throw new Error('Insufficient tokens. Please upgrade your subscription or purchase more tokens.');
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          messages: chatRequest.messages,
          userId: userData.user.id,
          temperature: chatRequest.temperature || 0.7,
          maxTokens: chatRequest.maxTokens || 2048
        }
      });

      if (error) throw error;

      // Log the interaction (success)
      await logChatInteraction(
        userData.user.id,
        'success',
        chatRequest.messages[chatRequest.messages.length - 1]?.content || '',
        data.candidates[0]?.content.parts[0]?.text || ''
      );

      return data.candidates[0]?.content.parts[0]?.text || 'No response generated.';
    } catch (error) {
      console.error('Error creating chat completion:', error);
      
      // Log the interaction (error)
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await logChatInteraction(
            userData.user.id,
            'error',
            chatRequest.messages[chatRequest.messages.length - 1]?.content || '',
            error.message || 'Unknown error'
          );
        }
      } catch (logError) {
        console.error('Error logging chat interaction:', logError);
      }
      
      throw error;
    }
  },
};

// Helper function to log chat interactions
const logChatInteraction = async (
  userId: string,
  status: 'success' | 'error',
  input: string,
  output: string
) => {
  try {
    await supabase.from('ai_interaction_logs').insert({
      user_id: userId,
      flow_name: 'gemini_chat',
      status,
      input: { message: input },
      output: { response: output },
      metadata: {
        model: 'gemini-pro',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error logging chat interaction:', error);
    // Non-critical error, don't throw
  }
};