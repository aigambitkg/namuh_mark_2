import supabase from './supabaseClient';

/**
 * Service for handling audit logging and access controls
 */
export const auditService = {
  /**
   * Log a custom audit event
   */
  logAuditEvent: async (
    actionType: string,
    actionDetails: Record<string, any>,
    resourceType?: string,
    resourceId?: string,
    status: 'success' | 'failure' | 'warning' = 'success',
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info'
  ) => {
    try {
      const { data, error } = await supabase.rpc('log_audit_event', {
        p_action_type: actionType,
        p_action_details: actionDetails,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_status: status,
        p_severity: severity
      });
      
      if (error) throw new Error(error.message || 'Failed to log audit event');
      
      return data;
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw here to avoid breaking app flow
      // Just log the error and continue
    }
  },
  
  /**
   * Check if user has a specific permission
   */
  checkPermission: async (permission: string) => {
    try {
      const { data, error } = await supabase.rpc('check_user_permission', {
        p_permission: permission
      });
      
      if (error) throw new Error(error.message || 'Failed to check permission');
      
      return !!data;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  },
  
  /**
   * Get audit logs for current user
   */
  getUserAuditLogs: async (limit = 50, offset = 0) => {
    try {
      const { data, error } = await supabase.rpc('get_audit_logs', {
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) throw error;
      
      return data.map((log: any) => ({
        id: log.id,
        actionType: log.action_type,
        actionDetails: log.action_details,
        timestamp: new Date(log.created_at),
        resourceType: log.resource_type,
        resourceId: log.resource_id,
        status: log.status,
        severity: log.severity
      }));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },
  
  /**
   * Get user's data processing history
   */
  getDataProcessingHistory: async () => {
    try {
      const { data, error } = await supabase.rpc('get_data_processing_history');
      
      if (error) throw error;
      
      return data.map((record: any) => ({
        id: record.id,
        processType: record.process_type,
        description: record.description,
        legalBasis: record.legal_basis,
        timestamp: new Date(record.created_at),
        relatedEntityType: record.related_entity_type,
        relatedEntityId: record.related_entity_id,
        processor: record.processor
      }));
    } catch (error) {
      console.error('Error fetching data processing history:', error);
      throw error;
    }
  }
};