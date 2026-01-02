import { v4 as uuidv4 } from 'uuid';
import { execute } from '../database';

export enum AuditAction {
    USER_REGISTER = 'USER_REGISTER',
    USER_LOGIN = 'USER_LOGIN',
    USER_LOGOUT = 'USER_LOGOUT',
    PATIENT_CREATE = 'PATIENT_CREATE',
    PATIENT_VIEW = 'PATIENT_VIEW',
    PATIENT_LIST = 'PATIENT_LIST',
    PATIENT_UPDATE = 'PATIENT_UPDATE',
    PATIENT_DELETE = 'PATIENT_DELETE',
    CHART_CREATE = 'CHART_CREATE',
    CHART_VIEW = 'CHART_VIEW',
    CHART_UPDATE = 'CHART_UPDATE',
    CHART_DELETE = 'CHART_DELETE'
}

export function logAudit(
    userId: string | null, 
    action: AuditAction | string, 
    resource: string, 
    resourceId: string | null, 
    details?: string,
    ipAddress?: string
): void {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Run async to not block main thread, but using execute() queue essentially
    try {
        execute(
            `INSERT INTO audit_logs (id, user_id, action, resource, resource_id, details, ip_address, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, 
                userId, 
                action, 
                resource, 
                resourceId, 
                details || null, 
                ipAddress || null, 
                createdAt
            ]
        );
        console.log(`[AUDIT] ${action} by ${userId} on ${resource}:${resourceId}`);
    } catch (err) {
        console.error('[AUDIT ERROR] Failed to write audit log:', err);
    }
}
