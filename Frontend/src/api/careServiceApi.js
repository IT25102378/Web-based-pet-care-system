import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';
import { ServiceStatus } from '../types';

export const careServiceApi = {
  async getServiceLogs(filters = {}) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams(filters).toString();
      return await apiFetch(`/care-services/logs?${params}`);
    }
    await simulateDelay();
    let logs = mockStore.getTable('careServiceLogs');
    if (filters.providerId) {
      logs = logs.filter((l) => l.providerId === filters.providerId);
    }
    if (filters.status) {
      logs = logs.filter((l) => l.status === filters.status);
    }
    // Optional caseId filter for rescue animal care sessions
    if (filters.caseId) {
      logs = logs.filter((l) => l.caseId === filters.caseId);
    }
    return logs;
  },

  async createServiceLog(logData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/care-services/logs', {
        method: 'POST',
        body: JSON.stringify(logData),
      });
    }
    await simulateDelay(300);
    const logs = mockStore.getTable('careServiceLogs');
    const newId = `CSL-${200 + logs.length + 1}`;

    const newLog = {
      ...logData,
      serviceLogId: newId,
      serviceDate: logData.serviceDate || new Date().toISOString().split('T')[0],
      status: logData.status || ServiceStatus.CHECKED_IN,
      // Preserve caseId when provided for rescue animals; null for owned pets
      caseId: logData.caseId || null,
    };

    return mockStore.insertItem('careServiceLogs', newLog);
  },

  async updateServiceStatus(serviceLogId, status, notes = null) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/care-services/logs/${serviceLogId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      });
    }
    await simulateDelay(250);
    const updates = { status };
    if (notes) updates.notes = notes;
    return mockStore.updateItem('careServiceLogs', 'serviceLogId', serviceLogId, updates);
  },

  // Package Bookings (Addition #1)
  async getPackageBookings(filters = {}) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams(filters).toString();
      return await apiFetch(`/packages/bookings?${params}`);
    }
    await simulateDelay();
    let bookings = mockStore.getTable('packageBookings');
    if (filters.ownerId) {
      bookings = bookings.filter((b) => b.ownerId === filters.ownerId);
    }
    return bookings;
  },

  async bookPackage(bookingData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/packages/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    }
    await simulateDelay(400);
    const bookings = mockStore.getTable('packageBookings');
    const newId = `PKB-${100 + bookings.length + 1}`;

    const newBooking = {
      ...bookingData,
      bookingId: newId,
      completedSessions: 0,
      remainingSessions: bookingData.totalSessions || 3,
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: 'Active',
    };

    mockStore.insertItem('packageBookings', newBooking);

    // Create Notification
    if (bookingData.ownerId) {
      mockStore.insertItem('notifications', {
        notificationId: `NTF-${Date.now()}`,
        userId: bookingData.ownerId,
        type: 'System',
        title: 'Package Activated!',
        message: `Your booking for "${bookingData.packageName}" has been confirmed. You can now schedule your included sessions.`,
        isRead: false,
        link: '/owner/packages',
        createdAt: new Date().toISOString(),
      });
    }

    return newBooking;
  },

  async redeemPackageSession(bookingId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/packages/bookings/${bookingId}/redeem`, { method: 'POST' });
    }
    await simulateDelay(300);
    const booking = mockStore.getItem('packageBookings', 'bookingId', bookingId);
    if (!booking) throw new Error('Package booking not found');
    if (booking.remainingSessions <= 0) throw new Error('No remaining sessions on this package');

    const updated = mockStore.updateItem('packageBookings', 'bookingId', bookingId, {
      completedSessions: booking.completedSessions + 1,
      remainingSessions: booking.remainingSessions - 1,
      status: booking.remainingSessions - 1 === 0 ? 'Completed' : 'Active',
    });

    return updated;
  }
};
