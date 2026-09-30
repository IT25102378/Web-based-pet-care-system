import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';
import { UserStatus } from '../types';

export const userApi = {
  async getUsers() {
    if (!USE_MOCK_DATA) return await apiFetch('/users');
    await simulateDelay();
    return mockStore.getTable('users');
  },

  async getUserById(userId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/users/${userId}`);
    await simulateDelay();
    return mockStore.getItem('users', 'userId', userId);
  },

  async getPendingApprovals() {
    if (!USE_MOCK_DATA) return await apiFetch('/users/pending-approvals');
    await simulateDelay();
    const users = mockStore.getTable('users');
    const documents = mockStore.getTable('userVerificationDocuments');

    // Filter users pending approval
    const pendingUsers = users.filter((u) => u.status === UserStatus.PENDING_APPROVAL);

    // Attach documents
    return pendingUsers.map((user) => {
      const userDocs = documents.filter((doc) => doc.userId === user.userId);
      return {
        ...user,
        verificationDocuments: userDocs,
      };
    });
  },

  async approveUser(userId, adminName = 'System Administrator') {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/users/${userId}/approve`, { method: 'POST' });
    }
    await simulateDelay(300);
    const user = mockStore.getItem('users', 'userId', userId);
    const updated = mockStore.updateItem('users', 'userId', userId, {
      status: UserStatus.ACTIVE,
      rejectionReason: null,
      suspensionReason: null,
    });

    // Record in Approval History
    mockStore.insertItem('approvalHistory', {
      historyId: `APH-${Date.now()}`,
      userId,
      applicantName: user?.fullName || 'Applicant',
      applicantEmail: user?.email || '',
      requestedRole: user?.role || '',
      decision: 'Approved',
      reason: 'Identity and credential verification confirmed.',
      reviewDate: new Date().toISOString(),
      reviewedBy: adminName,
    });

    // Notify user
    mockStore.insertItem('notifications', {
      notificationId: `NTF-${Date.now()}`,
      userId,
      type: 'Approval',
      title: 'Account Approved!',
      message: 'Your Pet Nexus professional account has been reviewed and approved. Welcome aboard!',
      isRead: false,
      link: '/login',
      createdAt: new Date().toISOString(),
    });

    return updated;
  },

  async rejectUser(userId, rejectionReason, adminName = 'System Administrator') {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/users/${userId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason }),
      });
    }
    await simulateDelay(300);
    const user = mockStore.getItem('users', 'userId', userId);
    const updated = mockStore.updateItem('users', 'userId', userId, {
      status: UserStatus.REJECTED,
      rejectionReason: rejectionReason || 'Documentation could not be verified by clinic compliance team.',
    });

    // Record in Approval History
    mockStore.insertItem('approvalHistory', {
      historyId: `APH-${Date.now()}`,
      userId,
      applicantName: user?.fullName || 'Applicant',
      applicantEmail: user?.email || '',
      requestedRole: user?.role || '',
      decision: 'Rejected',
      reason: rejectionReason || 'Documentation could not be verified.',
      reviewDate: new Date().toISOString(),
      reviewedBy: adminName,
    });

    return updated;
  },

  async suspendUser(userId, suspensionReason = 'Account suspended by System Administrator.') {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/users/${userId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ suspensionReason }),
      });
    }
    await simulateDelay(300);
    const user = mockStore.getItem('users', 'userId', userId);
    if (!user) throw new Error('User not found.');
    if (user.role === 'Admin') {
      throw new Error('System Administrator accounts cannot be suspended.');
    }

    const updated = mockStore.updateItem('users', 'userId', userId, {
      status: UserStatus.SUSPENDED,
      suspensionReason,
    });

    // Notify user
    mockStore.insertItem('notifications', {
      notificationId: `NTF-${Date.now()}`,
      userId,
      type: 'System',
      title: 'Account Suspended',
      message: `Your account access has been suspended: ${suspensionReason}`,
      isRead: false,
      link: '/login',
      createdAt: new Date().toISOString(),
    });

    return updated;
  },

  async reactivateUser(userId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/users/${userId}/reactivate`, { method: 'POST' });
    }
    await simulateDelay(300);
    const updated = mockStore.updateItem('users', 'userId', userId, {
      status: UserStatus.ACTIVE,
      suspensionReason: null,
      rejectionReason: null,
    });

    // Notify user
    mockStore.insertItem('notifications', {
      notificationId: `NTF-${Date.now()}`,
      userId,
      type: 'System',
      title: 'Account Reactivated',
      message: 'Your Pet Nexus account has been reactivated. You may now access your workspace.',
      isRead: false,
      link: '/login',
      createdAt: new Date().toISOString(),
    });

    return updated;
  },

  async getApprovalHistory() {
    if (!USE_MOCK_DATA) return await apiFetch('/admin/approval-history');
    await simulateDelay();
    return mockStore.getTable('approvalHistory');
  },

  async updateUserProfile(userId, profileData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    }
    await simulateDelay();
    return mockStore.updateItem('users', 'userId', userId, profileData);
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/users/${userId}/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    }
    await simulateDelay(300);
    const user = mockStore.getItem('users', 'userId', userId);
    if (!user) {
      throw new Error('User account not found.');
    }
    if (user.password && user.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }
    return mockStore.updateItem('users', 'userId', userId, { password: newPassword });
  }
};
