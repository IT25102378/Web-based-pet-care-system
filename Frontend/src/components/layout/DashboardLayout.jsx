import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { UserStatus } from '../../types';

export const DashboardLayout = ({ allowedRoles = [] }) => {
  const { currentUser, role, userStatus, isAuthenticated } = useAuth();

  // Helper to determine the user's own home dashboard route
  const getOwnDashboardRoute = (userRole) => {
    switch (userRole) {
      case 'PetOwner': return '/owner/overview';
      case 'ClinicStaff': return '/staff/queue';
      case 'RescueOfficer': return '/rescue/dashboard';
      case 'Veterinarian': return '/vet/schedule';
      case 'PetCareProvider': return '/provider/dashboard';
      case 'ClinicManager': return '/manager/dashboard';
      case 'Admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  // If unauthenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user status is pending approval, rejected, or pending email, redirect to login screen
  if (userStatus === UserStatus.PENDING_APPROVAL || userStatus === UserStatus.REJECTED || userStatus === UserStatus.PENDING_EMAIL) {
    return <Navigate to="/login" replace />;
  }

  // Strict route protection: If user's role is not in allowedRoles for this route, redirect to their own dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getOwnDashboardRoute(role)} replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <Navbar />

      <div className="dashboard-layout-body">
        <Sidebar />
        <main className="dashboard-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
