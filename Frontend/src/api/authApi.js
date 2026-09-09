import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';
import { UserStatus } from '../types';

export const authApi = {
  async login(email, password) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    }

    await simulateDelay(300);
    const users = mockStore.getTable('users');
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    if (user.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    // Check account approval status
    if (user.status === UserStatus.PENDING_APPROVAL) {
      const err = new Error('Your account is awaiting admin approval. You will receive an email once reviewed.');
      err.code = 'PENDING_APPROVAL';
      err.user = user;
      throw err;
    }

    if (user.status === UserStatus.REJECTED) {
      const reason = user.rejectionReason || 'Application criteria were not met.';
      const err = new Error(`Your application was rejected: ${reason}`);
      err.code = 'REJECTED';
      err.rejectionReason = reason;
      err.user = user;
      throw err;
    }

    if (user.status === UserStatus.PENDING_EMAIL) {
      const err = new Error('Please verify your email address before logging in.');
      err.code = 'PENDING_EMAIL';
      err.user = user;
      throw err;
    }

    // Simulated JWT token
    const token = `mock-token-${user.userId}-${Date.now()}`;
    localStorage.setItem('petnexus_auth_token', token);
    localStorage.setItem('petnexus_current_user', JSON.stringify(user));

    return { user, token };
  },

  async register(registrationData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });
    }

    await simulateDelay(400);
    const users = mockStore.getTable('users');
    const existing = users.find((u) => u.email.toLowerCase() === registrationData.email.toLowerCase());

    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUserId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const newUser = {
      userId: newUserId,
      email: registrationData.email,
      password: registrationData.password,
      fullName: registrationData.fullName,
      phone: registrationData.phone || '',
      address: registrationData.address || '',
      role: registrationData.role,
      status: UserStatus.PENDING_EMAIL, // Starts at pending email verification
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${newUserId}`,
      licenseNumber: registrationData.licenseNumber || null,
      staffId: registrationData.staffId || null,
      managerCode: registrationData.managerCode || null,
      badgeNumber: registrationData.badgeNumber || null,
      serviceSpecialty: registrationData.serviceSpecialty || null,
      createdAt: new Date().toISOString(),
      rejectionReason: null,
    };

    mockStore.insertItem('users', newUser);

    // If verification document was uploaded during registration
    if (registrationData.verificationDocument) {
      const doc = {
        documentId: `UVD-${Date.now()}`,
        userId: newUserId,
        documentType: registrationData.verificationDocument.type || 'Identity & Credential Proof',
        fileName: registrationData.verificationDocument.name,
        fileUrl: registrationData.verificationDocument.url,
        fileSize: registrationData.verificationDocument.size || '1.0 MB',
        uploadedAt: new Date().toISOString(),
        status: 'Pending',
      };
      mockStore.insertItem('userVerificationDocuments', doc);
    }

    return {
      message: 'Registration successful! Please check your email to verify your account.',
      userId: newUserId,
      email: newUser.email,
    };
  },

  async verifyEmail(token) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/auth/verify-email?token=${token}`);
    }

    await simulateDelay(300);
    // Find any user in pending email verification or target user
    const users = mockStore.getTable('users');
    const pendingUser = users.find((u) => u.status === UserStatus.PENDING_EMAIL) || users[users.length - 1];

    if (pendingUser) {
      // Advance user to pending admin approval
      mockStore.updateItem('users', 'userId', pendingUser.userId, {
        status: UserStatus.PENDING_APPROVAL,
      });

      // Add a notification for system administrator
      mockStore.insertItem('notifications', {
        notificationId: `NTF-${Date.now()}`,
        userId: 'USR-007', // Administrator
        type: 'Approval',
        title: 'New Applicant Verification Pending',
        message: `${pendingUser.fullName} (${pendingUser.role}) verified their email and is awaiting account approval.`,
        isRead: false,
        link: '/admin/approvals',
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Email verified successfully! Your application is now pending admin review.',
        user: pendingUser,
      };
    }

    return {
      success: true,
      message: 'Email verified successfully! Your application is now pending admin review.',
    };
  },

  async forgotPassword(email) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    }

    await simulateDelay(300);
    return {
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    };
  },

  async resetPassword(token, newPassword) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    }

    await simulateDelay(300);
    return {
      message: 'Your password has been successfully reset. You may now log in.',
    };
  },

  getCurrentUser() {
    const raw = localStorage.getItem('petnexus_current_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('petnexus_auth_token');
    localStorage.removeItem('petnexus_current_user');
  }
};
