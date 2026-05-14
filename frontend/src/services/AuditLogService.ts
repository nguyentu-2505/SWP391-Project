import axios from 'axios';

const API_URL = '/audit-logs';

export interface AuditLog {
    id: number;
    userEmail: string;
    action: string;
    timestamp: string;
    details: string;
}

const getAllAuditLogs = async (): Promise<AuditLog[]> => {
    const response = await axios.get(API_URL, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

const getAuditLogsByUser = async (userId: number): Promise<AuditLog[]> => {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
    });
    return response.data;
};

export const AuditLogService = {
    getAllAuditLogs,
    getAuditLogsByUser,
};