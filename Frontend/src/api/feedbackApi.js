import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

export const feedbackApi = {
  async getFeedbacks(filters = {}) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams(filters).toString();
      return await apiFetch(`/feedback?${params}`);
    }
    await simulateDelay();
    let list = mockStore.getTable('feedback');
    if (filters.userId) {
      list = list.filter((f) => f.userId === filters.userId);
    }
    if (filters.category) {
      list = list.filter((f) => f.serviceCategory === filters.category);
    }
    return list;
  },

  async submitFeedback(feedbackData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      });
    }
    await simulateDelay(350);
    const list = mockStore.getTable('feedback');
    const newId = `FDB-${String(list.length + 1).padStart(3, '0')}`;

    const newFeedback = {
      ...feedbackData,
      feedbackId: newId,
      rating: Number(feedbackData.rating) || 5,
      createdAt: new Date().toISOString(),
      managerResponse: null,
      managerRespondedAt: null,
    };

    mockStore.insertItem('feedback', newFeedback);

    // Notify Clinic Manager (mock only)
    mockStore.insertItem('notifications', {
      notificationId: `NTF-${Date.now()}`,
      userId: 'USR-005',
      type: 'System',
      title: 'New Client Feedback Submitted',
      message: `${feedbackData.userName} submitted a ${feedbackData.rating}-star review for ${feedbackData.serviceCategory}.`,
      isRead: false,
      link: '/manager/feedback',
      createdAt: new Date().toISOString(),
    });

    return newFeedback;
  },

  async respondToFeedback(feedbackId, responseText) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/feedback/${feedbackId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ responseText }),
      });
    }
    await simulateDelay(300);
    return mockStore.updateItem('feedback', 'feedbackId', feedbackId, {
      managerResponse: responseText,
      managerRespondedAt: new Date().toISOString(),
    });
  }
};
