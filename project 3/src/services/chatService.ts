import supabase from './supabaseClient';
import { auditService } from './auditService';

export const chatService = {
  /**
   * Get conversations for current user
   */
  getConversations: async (limit = 50, offset = 0) => {
    try {
      // Use RPC function to get conversations
      const { data, error } = await supabase.rpc('get_user_conversations', {
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) throw error;
      
      // Format the result
      return data.map((conv: any) => ({
        id: conv.id,
        participantIds: conv.participant_ids,
        jobId: conv.job_id,
        jobTitle: conv.job_title,
        lastMessage: conv.last_message,
        lastMessageTimestamp: conv.last_message_timestamp 
          ? new Date(conv.last_message_timestamp) 
          : null,
        unreadCount: conv.unread_count || 0,
        otherParticipantName: conv.other_participant_name,
        otherParticipantId: conv.other_participant_id
      }));
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },
  
  /**
   * Get messages for a specific conversation
   */
  getMessages: async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      
      // Format the result
      return data.map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        isRead: msg.is_read
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },
  
  /**
   * Send a message in a conversation
   */
  sendMessage: async (conversationId: string, receiverId: string, content: string) => {
    try {
      // Call RPC function to send message
      const { data, error } = await supabase.rpc('send_message', {
        p_conversation_id: conversationId,
        p_receiver_id: receiverId,
        p_content: content
      });
      
      if (error) throw error;
      
      // Log message sent for analytics
      auditService.logAuditEvent('message_sent', {
        conversation_id: conversationId,
        content_length: content.length
      }, 'chat_messages', data);
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  /**
   * Create a new conversation
   */
  createConversation: async (participantIds: string[], jobId?: string, jobTitle?: string) => {
    try {
      // Call RPC function to create conversation
      const { data, error } = await supabase.rpc('create_conversation', {
        p_participant_ids: participantIds,
        p_job_id: jobId,
        p_job_title: jobTitle
      });
      
      if (error) throw error;
      
      // Log conversation created
      auditService.logAuditEvent('conversation_created', {
        participant_count: participantIds.length,
        has_job_context: !!jobId
      }, 'chat_conversations', data);
      
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },
  
  /**
   * Mark all messages in a conversation as read
   */
  markMessagesAsRead: async (conversationId: string) => {
    try {
      // Call RPC function to mark messages as read
      const { data, error } = await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },
  
  /**
   * Get unread message count for current user
   */
  getUnreadMessageCount: async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_conversations');
      
      if (error) throw error;
      
      // Sum up all unread counts
      return data.reduce((sum: number, conv: any) => sum + (conv.unread_count || 0), 0);
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0; // Return 0 as fallback
    }
  }
};