import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

export const notificationApi = {
  async getNotifications(userId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/notifications?userId=${userId}`);
    await simulateDelay(150);
    const notifications = mockStore.getTable('notifications');
    return notifications
      .filter((n) => !userId || n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async markAsRead(notificationId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/notifications/${notificationId}/read`, { method: 'PUT' });
    }
    return mockStore.updateItem('notifications', 'notificationId', notificationId, { isRead: true });
  },

  async markAllAsRead(userId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/notifications/read-all?userId=${userId}`, { method: 'PUT' });
    }
    const notifications = mockStore.getTable('notifications');
    const updated = notifications.map((n) => (n.userId === userId ? { ...n, isRead: true } : n));
    mockStore.setTable('notifications', updated);
    return true;
  }
};
