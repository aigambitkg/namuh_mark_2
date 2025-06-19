import supabase from './supabaseClient';
import { auditService } from './auditService';

export const communityService = {
  /**
   * Get all forum groups
   */
  getForumGroups: async () => {
    try {
      const { data, error } = await supabase
        .from('forum_groups')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        creatorId: group.creator_id,
        creatorType: group.creator_type,
        createdDate: new Date(group.created_date),
        postCount: group.post_count || 0,
        memberCount: group.member_count || 0
      }));
    } catch (error) {
      console.error('Error getting forum groups:', error);
      throw error;
    }
  },
  
  /**
   * Create a new forum group
   */
  createForumGroup: async (name: string, description: string) => {
    try {
      // Check authentication
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Create group
      const { data, error } = await supabase.rpc('create_forum_group', {
        p_name: name,
        p_description: description
      });
      
      if (error) throw error;
      
      // Log group creation
      auditService.logAuditEvent('forum_group_created', { 
        groupId: data,
        name
      }, 'forum_groups', data);
      
      return data;
    } catch (error) {
      console.error('Error creating forum group:', error);
      throw error;
    }
  },
  
  /**
   * Get forum posts
   */
  getForumPosts: async (groupId?: string, sortBy = 'newest', limit = 20, offset = 0) => {
    try {
      // Call the RPC function to get forum posts
      const { data, error } = await supabase.rpc('get_forum_posts', {
        p_group_id: groupId || null,
        p_sort_by: sortBy,
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) throw error;
      
      // Map to frontend format
      return data.map(post => ({
        id: post.id,
        groupId: post.group_id,
        title: post.title,
        content: post.content,
        authorId: post.author_id,
        authorName: post.author_name,
        authorType: post.author_type,
        createdDate: new Date(post.created_date),
        upvotes: post.upvotes || 0,
        commentCount: post.comment_count || 0,
        tags: post.tags || []
      }));
    } catch (error) {
      console.error('Error getting forum posts:', error);
      throw error;
    }
  },
  
  /**
   * Create a forum post
   */
  createForumPost: async (groupId: string, title: string, content: string, tags?: string[]) => {
    try {
      // Check authentication
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Create post - backend will handle author name and type
      const { data, error } = await supabase.rpc('create_forum_post', {
        p_group_id: groupId,
        p_title: title,
        p_content: content,
        p_tags: tags
      });
      
      if (error) throw error;
      
      // Log post creation
      auditService.logAuditEvent('forum_post_created', { 
        postId: data,
        groupId
      }, 'forum_posts', data);
      
      return data;
    } catch (error) {
      console.error('Error creating forum post:', error);
      throw error;
    }
  },
  
  /**
   * Upvote a post
   */
  upvotePost: async (postId: string) => {
    try {
      // Check authentication
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Call RPC to atomically handle upvote
      const { data, error } = await supabase.rpc('upvote_forum_post', {
        p_post_id: postId
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error upvoting post:', error);
      throw error;
    }
  },
  
  /**
   * Remove upvote from a post
   */
  removeUpvote: async (postId: string) => {
    try {
      // Check authentication
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Call RPC to handle upvote removal
      const { data, error } = await supabase.rpc('remove_forum_post_upvote', {
        p_post_id: postId
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error removing upvote:', error);
      throw error;
    }
  },
  
  /**
   * Add a comment to a post
   */
  addComment: async (postId: string, content: string) => {
    try {
      // Check authentication
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      // Create comment - backend will handle author name and type
      const { data, error } = await supabase.rpc('add_forum_comment', {
        p_post_id: postId,
        p_content: content
      });
      
      if (error) throw error;
      
      // Log comment creation
      auditService.logAuditEvent('forum_comment_created', { 
        commentId: data,
        postId
      }, 'forum_comments', data);
      
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
  
  /**
   * Get comments for a post
   */
  getComments: async (postId: string, limit = 20, offset = 0) => {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_date', { ascending: true })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      return data.map(comment => ({
        id: comment.id,
        postId: comment.post_id,
        content: comment.content,
        authorId: comment.author_id,
        authorName: comment.author_name,
        authorType: comment.author_type,
        createdDate: new Date(comment.created_date),
        upvotes: comment.upvotes || 0
      }));
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }
};