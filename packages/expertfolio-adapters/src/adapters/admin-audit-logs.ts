// Admin audit logs adapter
// [pkg-04-admin-audit-logs]

import { api } from '../fetch-wrapper';
import { config } from '../config';
import { 
  AuditLogEntry, 
  AuditLogsQuery, 
  AuditLogsResponse,
  AuditLogEntrySchema,
  AuditLogsResponseSchema,
  AuditLogsQuerySchema
} from '../schemas/audit-logs.v1';

export class AdminAuditLogsAdapter {
  private getBaseUrl(): string {
    return config.baseUrl || '/api';
  }

  /**
   * Fetch audit logs with optional filtering and pagination
   */
  async getLogs(query: Partial<AuditLogsQuery> = {}): Promise<AuditLogsResponse> {
    // Apply defaults using Zod schema so callers can pass partial inputs
    const q = AuditLogsQuerySchema.parse(query);
    const params = new URLSearchParams();
    
    // Add pagination
    if (typeof q.limit === 'number') params.set('limit', q.limit.toString());
    if (typeof q.offset === 'number') params.set('offset', q.offset.toString());
    
    // Add sorting
    if (q.sortBy) params.set('sortBy', q.sortBy);
    if (q.sortOrder) params.set('sortOrder', q.sortOrder);
    
    // Add filters
    if (q.actor_id) params.set('actor_id', q.actor_id);
    if (q.action) params.set('action', q.action);
    if (q.entity_type) params.set('entity_type', q.entity_type);
    if (q.from_date) params.set('from_date', q.from_date);
    if (q.to_date) params.set('to_date', q.to_date);
    
    const url = `${this.getBaseUrl()}/admin/audit-logs${params.toString() ? `?${params.toString()}` : ''}`;
    
    const result = await api.get(url);
    
    if (result.error) {
      throw new Error(`Failed to fetch audit logs: ${result.error.message}`);
    }
    
    // Validate response with Zod
    const validated = AuditLogsResponseSchema.safeParse(result.data);
    if (!validated.success) {
      console.error('Invalid audit logs response:', validated.error);
      throw new Error('Invalid response format from audit logs API');
    }
    
    return validated.data;
  }

  /**
   * Fetch a single audit log by ID
   */
  async getLogById(id: string): Promise<AuditLogEntry> {
    const url = `${this.getBaseUrl()}/admin/audit-logs/${id}`;
    
    const result = await api.get(url);
    
    if (result.error) {
      throw new Error(`Failed to fetch audit log: ${result.error.message}`);
    }
    
    // Validate response with Zod
    const validated = AuditLogEntrySchema.safeParse(result.data);
    if (!validated.success) {
      console.error('Invalid audit log response:', validated.error);
      throw new Error('Invalid response format from audit log API');
    }
    
    return validated.data;
  }
}

// Export singleton instance
export const adminAuditLogsAdapter = new AdminAuditLogsAdapter();