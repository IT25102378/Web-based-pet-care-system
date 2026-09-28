import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppTopbar } from '../common/AppTopbar';
import { Sidebar } from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { UserStatus } from '../../types';

export const DashboardLayout = ({ allowedRoles = [] }) => {
  const { currentUser, role, userStatus, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper to determine the user's own home dashboard route
  const getOwnDashboardRoute = (userRole) => {
    switch (userRole) {
      case 'PetOwner':        return '/owner/overview';
      case 'ClinicStaff':     return '/staff/queue';
      case 'RescueOfficer':   return '/rescue/dashboard';
      case 'Veterinarian':    return '/vet/schedule';
      case 'PetCareProvider': return '/provider/dashboard';
      case 'ClinicManager':   return '/manager/dashboard';
      case 'Admin':           return '/admin/dashboard';
      default:                return '/';
    }
  };

  // Wait for JWT validation before deciding to redirect.
  // Prevents a flash-redirect to /login on page reload with a valid token.
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <p style={{ color: 'var(--text-subtle)', fontSize: '0.9rem' }}>Loading session…</p>
      </div>
    );
  }

  // If unauthenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Blocked status → redirect to login with context
  if (
    userStatus === UserStatus.PENDING_APPROVAL ||
    userStatus === UserStatus.REJECTED ||
    userStatus === UserStatus.PENDING_EMAIL
  ) {
    return <Navigate to="/login" replace />;
  }

  // Role guard: if the user's role is not allowed for this route, redirect to their own dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getOwnDashboardRoute(role)} replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <AppTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard-main-content" id="main-content">
          <div className="dashboard-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
