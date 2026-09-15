// =============================================================================
// Pet Nexus — Authentication API
// Phase 11A: Real backend integration
//
// Backend contract:
//   POST /api/auth/login         → { user: UserResponse, token: String }
//   POST /api/auth/register      → { message, userId, email }
//   POST /api/auth/forgot-password → { message }
//   POST /api/auth/reset-password  → { message }
//   GET  /api/auth/me            → UserResponse  (Bearer JWT required)
//
// Error responses from backend: { status, error, message }
// Account-status errors are surfaced via the 'message' field in BadRequestException.
// =============================================================================

import { USE_MOCK_DATA, simulateDelay, publicFetch, apiFetch, tokenStore } from './client';
import { mockStore } from '../data/mockStore';
import { UserStatus } from '../types';
import { DEFAULT_AVATAR_URL } from '../utils/constants';

// ---------------------------------------------------------------------------
// Helpers to detect account-status errors from backend message strings
// (the backend sends plain BadRequestException messages — no separate code)
// ---------------------------------------------------------------------------
function detectStatusCode(message = '') {
  const m = message.toLowerCase();
  if (m.includes('pending approval') || m.includes('awaiting') || m.includes('admin review'))
    return 'PENDING_APPROVAL';
  if (m.includes('rejected'))
    return 'REJECTED';
  if (m.includes('suspended'))
    return 'SUSPENDED';
  return null;
}

export const authApi = {
  // ---------------------------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------------------------
  async login(email, password) {
    if (!USE_MOCK_DATA) {
      // POST /api/auth/login — public endpoint, no Bearer header needed
      const data = await publicFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      // data = { user: UserResponse, token: String }
      const { user, token } = data;

      // Persist JWT and user profile
      tokenStore.setToken(token);
      tokenStore.setUser(user);

      return { user, token };
    }

    // ── Mock mode ──────────────────────────────────────────────────────────
    await simulateDelay(300);
    const users = mockStore.getTable('users');
    const user  = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) throw new Error('Invalid email or password. Please check your credentials.');
    if (user.password !== password) throw new Error('Invalid password. Please try again.');

    if (user.status === UserStatus.PENDING_APPROVAL) {
      const err = new Error('Your account is awaiting admin approval.');
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
    const token = `mock-token-${user.userId}-${Date.now()}`;
    tokenStore.setToken(token);
    tokenStore.setUser(user);
    return { user, token };
  },

  // ---------------------------------------------------------------------------
  // REGISTER
  // ---------------------------------------------------------------------------
  async register(registrationData) {
    if (!USE_MOCK_DATA) {
      // The whole payload goes, including the uploaded identity or credential
      // document. It used to be stripped here, which left the administrator
      // approving a role claim with nothing to check it against.
      const data = await publicFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });
      if (data?.approvalToken) {
        localStorage.setItem('petnexus_approval_token', data.approvalToken);
      }
      return data;
    }

    // ── Mock mode ──────────────────────────────────────────────────────────
    await simulateDelay(400);
    const users    = mockStore.getTable('users');
    const existing = users.find((u) => u.email.toLowerCase() === registrationData.email.toLowerCase());
    if (existing) throw new Error('An account with this email address already exists.');

    const newUserId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const mockApprovalToken = `mock-approval-${newUserId}-${Date.now()}`;
    const newUser   = {
      userId:           newUserId,
      email:            registrationData.email,
      password:         registrationData.password,
      fullName:         registrationData.fullName,
      phone:            registrationData.phone || '',
      address:          registrationData.address || '',
      role:             registrationData.role,
      status:           UserStatus.PENDING_APPROVAL,
      avatarUrl:        DEFAULT_AVATAR_URL,
      licenseNumber:    registrationData.licenseNumber || null,
      staffId:          registrationData.staffId || null,
      managerCode:      registrationData.managerCode || null,
      badgeNumber:      registrationData.badgeNumber || null,
      serviceSpecialty: registrationData.serviceSpecialty || null,
      createdAt:        new Date().toISOString(),
      rejectionReason:  null,
      approvalToken:    mockApprovalToken,
    };
    mockStore.insertItem('users', newUser);
    localStorage.setItem('petnexus_approval_token', mockApprovalToken);

    if (registrationData.verificationDocument) {
      const doc = {
        documentId:   `UVD-${Date.now()}`,
        userId:        newUserId,
        documentType:  registrationData.verificationDocument.type || 'Identity & Credential Proof',
        fileName:      registrationData.verificationDocument.name,
        fileUrl:       registrationData.verificationDocument.url,
        fileSize:      registrationData.verificationDocument.size || '1.0 MB',
        uploadedAt:    new Date().toISOString(),
        status:        'Pending',
      };
      mockStore.insertItem('userVerificationDocuments', doc);
    }

    // Tell the administrator straight away — the application is already in the queue.
    mockStore.insertItem('notifications', {
      notificationId: `NTF-${Date.now()}`,
      userId:  'USR-007',
      type:    'Approval',
      title:   'New Applicant Awaiting Approval',
      message: `${newUser.fullName} (${newUser.role}) registered and is awaiting account approval.`,
      isRead:  false,
      link:    '/admin/approvals',
      createdAt: new Date().toISOString(),
    });

    return {
      message: 'Registration successful! Your application is now pending administrator review.',
      userId: newUserId,
      email:  newUser.email,
      approvalToken: mockApprovalToken,
    };
  },

  // ---------------------------------------------------------------------------
  // GET APPROVAL STATUS (polls account status using secure approvalToken)
  // ---------------------------------------------------------------------------
  async getApprovalStatus(token) {
    if (!USE_MOCK_DATA) {
      return await publicFetch(`/auth/approval-status?token=${encodeURIComponent(token)}`);
    }

    // ── Mock mode ──────────────────────────────────────────────────────────
    // Look the applicant up by their own approval token, the same way the
    // backend does with findByApprovalToken.
    await simulateDelay(200);
    const users = mockStore.getTable('users');
    const user  = users.find((u) => u.approvalToken === token);
    if (!user) {
      throw new Error('Invalid or expired approval token.');
    }

    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      approved: user.status === UserStatus.ACTIVE,
      rejectionReason: user.rejectionReason || null,
    };
  },

  // ---------------------------------------------------------------------------
  // APPROVAL LOGIN (exchanges approvalToken for real JWT upon account activation)
  // ---------------------------------------------------------------------------
  async approvalLogin(approvalToken) {
    if (!USE_MOCK_DATA) {
      const data = await publicFetch('/auth/approval-login', {
        method: 'POST',
        body: JSON.stringify({ approvalToken }),
      });
      const { user, token } = data;
      tokenStore.setToken(token);
      tokenStore.setUser(user);
      localStorage.removeItem('petnexus_approval_token');
      return { user, token };
    }

    // ── Mock mode ──────────────────────────────────────────────────────────
    // Only the applicant holding this approval token may be signed in, and only
    // once their account has actually been approved.
    await simulateDelay(200);
    const users = mockStore.getTable('users');
    const user  = users.find((u) => u.approvalToken === approvalToken);
    if (!user) {
      throw new Error('Invalid or expired approval token.');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error(`Account is not active yet. Current status: ${user.status}`);
    }

    const token = `mock-token-${user.userId}-${Date.now()}`;
    tokenStore.setToken(token);
    tokenStore.setUser(user);
    // Invalidate the approval token once it has been exchanged for a session.
    mockStore.updateItem('users', 'userId', user.userId, { approvalToken: null });
    localStorage.removeItem('petnexus_approval_token');
    return { user, token };
  },

  // ---------------------------------------------------------------------------
  // FORGOT PASSWORD
  // ---------------------------------------------------------------------------
  async forgotPassword(email) {
    if (!USE_MOCK_DATA) {
      return await publicFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    }

    // ── Mock mode ──────────────────────────────────────────────────────────
    await simulateDelay(300);
    const users = mockStore.getTable('users');
    const user  = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return { message: 'No account exists with this email address.', resetToken: null };
    }

    const resetToken = `mock-reset-${user.userId}-${Date.now()}`;
    mockStore.updateItem('users', 'userId', user.userId, { passwordResetToken: resetToken });
    return {
      message: 'Your password reset link is ready. Continue to choose a new password.',
      resetToken,
    };
  },

  // ---------------------------------------------------------------------------
  // RESET PASSWORD
  // ---------------------------------------------------------------------------
  async resetPassword(token, newPassword) {
    if (!USE_MOCK_DATA) {
      return await publicFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    }

    // ── Mock mode ──────────────────────────────────────────────────────────
    await simulateDelay(300);
    const users = mockStore.getTable('users');
    const user  = users.find((u) => u.passwordResetToken === token);
    if (!user) {
      throw new Error('Invalid or expired password reset token.');
    }

    mockStore.updateItem('users', 'userId', user.userId, {
      password: newPassword,
      passwordResetToken: null,
    });
    return { message: 'Your password has been successfully reset. You may now log in.' };
  },

  // ---------------------------------------------------------------------------
  // GET CURRENT USER  (used by AuthContext on page reload)
  // ---------------------------------------------------------------------------
  /**
   * In real mode, returns the locally-cached user from tokenStore.
   * AuthContext validates this against /api/auth/me on mount.
   */
  getCurrentUser() {
    return tokenStore.getUser();
  },

  /**
   * Validates the stored JWT against the real backend and returns a fresh
   * UserResponse, or null if the token is missing / expired / invalid.
   */
  async fetchCurrentUser() {
    if (!USE_MOCK_DATA) {
      try {
        return await apiFetch('/auth/me');
      } catch (_) {
        return null;
      }
    }
    // Mock mode: trust localStorage
    return tokenStore.getUser();
  },

  // ---------------------------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------------------------
  logout() {
    tokenStore.clear();
  },

  // ---------------------------------------------------------------------------
  // Detect status code from backend error message (used by AuthContext / pages)
  // ---------------------------------------------------------------------------
  detectStatusCode,
};
