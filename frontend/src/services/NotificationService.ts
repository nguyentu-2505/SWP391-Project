import api from './api';

export interface NotificationItem {
    id: number;
    title: string;
    message: string;
    type: string;
    referenceType: string;
    referenceId: number;
    isRead: boolean;
    createdAt: string;
}

export const NotificationService = {
    getMyNotifications: async (): Promise<NotificationItem[]> => {
        const response = await api.get('/notifications');
        return response.data.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await api.get('/notifications/unread-count');
        return response.data.data.count;
    },

    markAsRead: async (id: number): Promise<NotificationItem> => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data.data;
    },

    markAllAsRead: async (): Promise<void> => {
        await api.post('/notifications/read-all');
    },
};
