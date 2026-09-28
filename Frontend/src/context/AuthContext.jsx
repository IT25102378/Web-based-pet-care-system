// =============================================================================
// Pet Nexus — AuthContext
// Phase 11A: Real backend integration
//
// In real mode (VITE_USE_MOCK_DATA=false):
//   - Authentication state comes from /api/auth/me (validated on mount + login)
//   - JWT is stored in localStorage via tokenStore
//   - switchUserRole is disabled (mock-only feature)
//   - refreshUser re-fetches from /api/auth/me
//
// In mock mode (VITE_USE_MOCK_DATA=true):
//   - All existing mock behaviour is preserved exactly
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { USE_MOCK_DATA, tokenStore } from '../api/client';
import { mockStore } from '../data/mockStore';
import { UserStatus } from '../types';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Start with whatever is cached in localStorage; will be validated against
  // /api/auth/me in the useEffect below (real mode only).
  const [currentUser, setCurrentUser] = useState(() => authApi.getCurrentUser());
  const [isLoading,   setIsLoading]   = useState(true); // true until we've validated

  // ---------------------------------------------------------------------------
  // On mount — validate the stored JWT / session
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const validateSession = async () => {
      if (USE_MOCK_DATA) {
        // Mock mode: if no user in storage, default to the Pet Owner demo account
        if (!currentUser) {
          const defaultUser = mockStore.getItem('users', 'userId', 'USR-001');
          if (defaultUser) {
            setCurrentUser(defaultUser);
            tokenStore.setUser(defaultUser);
            tokenStore.setToken(`mock-token-${defaultUser.userId}`);
          }
        }
        setIsLoading(false);
        return;
      }

      // Real mode: try to validate the stored token with the backend
      const freshUser = await authApi.fetchCurrentUser();
      if (!cancelled) {
        if (freshUser) {
          setCurrentUser(freshUser);
          tokenStore.setUser(freshUser); // keep cache in sync
        } else {
          // Token missing or rejected — clear stale state
          tokenStore.clear();
          setCurrentUser(null);
        }
        setIsLoading(false);
      }
    };

    validateSession();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------------------------
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { user } = await authApi.login(email, password);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // REGISTER
  // ---------------------------------------------------------------------------
  const register = async (registrationData) => {
    setIsLoading(true);
    try {
      return await authApi.register(registrationData);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------------------------
  const logout = useCallback(() => {
    authApi.logout();
    setCurrentUser(null);
  }, []);

  // ---------------------------------------------------------------------------
  // REFRESH USER  (re-fetches from /api/auth/me in real mode)
  // ---------------------------------------------------------------------------
  const refreshUser = useCallback(async () => {
    if (!currentUser) return;

    if (USE_MOCK_DATA) {
      const freshUser = mockStore.getItem('users', 'userId', currentUser.userId);
      if (freshUser) {
        setCurrentUser(freshUser);
        tokenStore.setUser(freshUser);
      }
      return;
    }

    const freshUser = await authApi.fetchCurrentUser();
    if (freshUser) {
      setCurrentUser(freshUser);
      tokenStore.setUser(freshUser);
    }
  }, [currentUser]);

  // ---------------------------------------------------------------------------
  // SWITCH USER ROLE  (mock/dev mode only — disabled in real mode)
  // ---------------------------------------------------------------------------
  const switchUserRole = (targetRole, customUserId = null) => {
    if (!USE_MOCK_DATA) {
      // In real mode this is a no-op — role switching requires real login
      console.warn('[PetNexus] switchUserRole() is a mock-only feature and has no effect in real-backend mode.');
      return;
    }
    const users = mockStore.getTable('users');
    let targetUser = null;
    if (customUserId) {
      targetUser = users.find((u) => u.userId === customUserId);
    } else {
      targetUser = users.find((u) => u.role === targetRole && u.status === UserStatus.ACTIVE);
    }
    if (targetUser) {
      setCurrentUser(targetUser);
      tokenStore.setUser(targetUser);
      tokenStore.setToken(`mock-token-${targetUser.userId}`);
    }
  };

  // ---------------------------------------------------------------------------
  // 401 handler — called by pages/components when they get a 401 from API calls
  // ---------------------------------------------------------------------------
  const handleUnauthorized = useCallback(() => {
    tokenStore.clear();
    setCurrentUser(null);
    // Pages should redirect to /login after calling this
  }, []);

  // ---------------------------------------------------------------------------
  // APPROVAL LOGIN (automatic login after administrator approval)
  // ---------------------------------------------------------------------------
  const approvalLogin = async (approvalToken) => {
    setIsLoading(true);
    try {
      const { user } = await authApi.approvalLogin(approvalToken);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Derived auth state
  // ---------------------------------------------------------------------------
  const isAuthenticated = !!currentUser && currentUser.status === UserStatus.ACTIVE;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role:            currentUser?.role   || null,
        isAuthenticated,
        userStatus:      currentUser?.status || null,
        isLoading,
        login,
        approvalLogin,
        register,
        logout,
        switchUserRole,
        refreshUser,
        handleUnauthorized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
