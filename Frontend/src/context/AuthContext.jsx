import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { mockStore } from '../data/mockStore';
import { UserRole, UserStatus } from '../types';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => authApi.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If no user is saved in localStorage, default to Pet Owner demo account
    if (!currentUser) {
      const defaultUser = mockStore.getItem('users', 'userId', 'USR-001');
      if (defaultUser) {
        setCurrentUser(defaultUser);
        localStorage.setItem('petnexus_current_user', JSON.stringify(defaultUser));
      }
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { user, token } = await authApi.login(email, password);
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registrationData) => {
    setIsLoading(true);
    try {
      return await authApi.register(registrationData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
  };

  /**
   * Demo utility to switch roles instantly from UI
   */
  const switchUserRole = (targetRole, customUserId = null) => {
    const users = mockStore.getTable('users');
    let targetUser = null;

    if (customUserId) {
      targetUser = users.find((u) => u.userId === customUserId);
    } else {
      targetUser = users.find((u) => u.role === targetRole && u.status === UserStatus.ACTIVE);
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem('petnexus_current_user', JSON.stringify(targetUser));
      localStorage.setItem('petnexus_auth_token', `mock-token-${targetUser.userId}`);
    }
  };

  const refreshUser = () => {
    if (!currentUser) return;
    const freshUser = mockStore.getItem('users', 'userId', currentUser.userId);
    if (freshUser) {
      setCurrentUser(freshUser);
      localStorage.setItem('petnexus_current_user', JSON.stringify(freshUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser && currentUser.status === UserStatus.ACTIVE,
        userStatus: currentUser?.status || null,
        isLoading,
        login,
        register,
        logout,
        switchUserRole,
        refreshUser,
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
