import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, UserStatus } from '../../types';
import { mockStore } from '../../data/mockStore';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Users, RotateCcw, ShieldCheck, Clock, UserX } from 'lucide-react';

export const RoleSwitcherBar = () => {
  const { currentUser, role, userStatus, isAuthenticated, switchUserRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Hide demo role switcher, auth tests, and reset data controls from normal/public presentation.
  // Preserved for development/testing only via environment variable guard VITE_SHOW_DEMO_CONTROLS=true.
  const showDemoControls = import.meta.env.VITE_SHOW_DEMO_CONTROLS === 'true';
  if (!showDemoControls || isAuthenticated) {
    return null;
  }

  const handleRoleClick = (targetRole, path) => {
    switchUserRole(targetRole);
    showToast('Role Switched', `Switched active session to ${targetRole}`, 'info', 2500);
    navigate(path);
  };

  const handlePendingDemo = () => {
    // USR-008 is Dr. Amanda Ramirez (Pending Approval)
    switchUserRole(null, 'USR-008');
    showToast('Switched to Pending Applicant', 'Logged in as Dr. Amanda Ramirez (Pending Approval)', 'warning');
    navigate('/login');
  };

  const handleRejectedDemo = () => {
    // USR-010 is Robert Sterling (Rejected)
    switchUserRole(null, 'USR-010');
    showToast('Switched to Rejected Applicant', 'Logged in as Robert Sterling (Rejected)', 'warning');
    navigate('/login');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to initial seed data?')) {
      mockStore.resetAll();
      switchUserRole(UserRole.PET_OWNER);
      showToast('Database Reset', 'All tables have been reset to default seeds.', 'success');
      window.location.reload();
    }
  };

  return (
    <div className="role-switcher-banner">
      <div className="flex items-center gap-2">
        <Users size={16} color="#48A99F" />
        <span className="font-semibold text-xs" style={{ color: '#94A3B8' }}>
          DEMO ROLE SWITCHER:
        </span>
        <div className="role-tags">
          <button
            type="button"
            className={`role-tag-btn ${role === UserRole.PET_OWNER && userStatus === UserStatus.ACTIVE ? 'active' : ''}`}
            onClick={() => handleRoleClick(UserRole.PET_OWNER, '/owner/overview')}
          >
            🐾 Pet Owner
          </button>
          <button
            type="button"
            className={`role-tag-btn ${role === UserRole.VETERINARIAN && userStatus === UserStatus.ACTIVE ? 'active' : ''}`}
            onClick={() => handleRoleClick(UserRole.VETERINARIAN, '/vet/schedule')}
          >
            🩺 Veterinarian
          </button>
          <button
            type="button"
            className={`role-tag-btn ${role === UserRole.CLINIC_STAFF && userStatus === UserStatus.ACTIVE ? 'active' : ''}`}
            onClick={() => handleRoleClick(UserRole.CLINIC_STAFF, '/staff/queue')}
          >
            📋 Clinic Staff
          </button>
          <button
            type="button"
            className={`role-tag-btn ${role === UserRole.RESCUE_OFFICER && userStatus === UserStatus.ACTIVE ? 'active' : ''}`}
            onClick={() => handleRoleClick(UserRole.RESCUE_OFFICER, '/rescue/dashboard')}
          >
            🦺 Rescue Officer
          </button>
          <button
            type="button"
            className={`role-tag-btn ${role === UserRole.PET_CARE_PROVIDER && userStatus === UserStatus.ACTIVE ? 'active' : ''}`}
            onClick={() => handleRoleClick(UserRole.PET_CARE_PROVIDER, '/provider/dashboard')}
          >
            ✂️ Care Provider
          </button>
          <button
            type="button"
            className={`role-tag-btn ${role === UserRole.CLINIC_MANAGER && userStatus === UserStatus.ACTIVE ? 'active' : ''}`}
            onClick={() => handleRoleClick(UserRole.CLINIC_MANAGER, '/manager/dashboard')}
          >
            📊 Clinic Manager
          </button>
          <button
            type="button"
            className={`role-tag-btn ${role === UserRole.ADMIN && userStatus === UserStatus.ACTIVE ? 'active' : ''}`}
            onClick={() => handleRoleClick(UserRole.ADMIN, '/admin/dashboard')}
          >
            🛡️ Administrator
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: '#64748B' }}>Auth Tests:</span>
        <button
          type="button"
          className={`role-tag-btn ${currentUser?.userId === 'USR-008' ? 'active' : ''}`}
          onClick={handlePendingDemo}
          title="Test Pending Approval Login gating"
        >
          <Clock size={12} color="#F59E0B" /> Pending Vet
        </button>
        <button
          type="button"
          className={`role-tag-btn ${currentUser?.userId === 'USR-010' ? 'active' : ''}`}
          onClick={handleRejectedDemo}
          title="Test Rejected Login screen"
        >
          <UserX size={12} color="#EF4444" /> Rejected User
        </button>
        <button
          type="button"
          className="role-tag-btn"
          onClick={handleResetData}
          title="Reset local storage mock database"
          style={{ marginLeft: '4px', borderColor: 'rgba(255,255,255,0.2)' }}
        >
          <RotateCcw size={12} /> Reset Data
        </button>
      </div>
    </div>
  );
};
