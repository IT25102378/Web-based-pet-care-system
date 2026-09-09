import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import { UserRole, UserRoleLabels, UserStatus } from '../../types';
import {
  Users,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Ban,
  UserX,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const UserAccountsPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals State
  const [selectedUserForView, setSelectedUserForView] = useState(null);
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      showToast('Error', 'Failed to load user accounts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Suspend User
  const handleConfirmSuspend = async () => {
    if (!userToSuspend) return;
    if (userToSuspend.role === 'Admin' || userToSuspend.userId === currentUser?.userId) {
      showToast('Action Prohibited', 'You cannot suspend an Administrator account.', 'error');
      setUserToSuspend(null);
      return;
    }

    setActionLoading(true);
    try {
      await userApi.suspendUser(
        userToSuspend.userId,
        suspensionReason.trim() || 'Administrative policy suspension.'
      );
      showToast('Account Suspended', `${userToSuspend.fullName}'s account access is now suspended.`, 'warning');
      setUserToSuspend(null);
      setSuspensionReason('');
      fetchUsers();
    } catch (err) {
      showToast('Suspension Failed', err.message || 'Unable to suspend user.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reactivate User
  const handleReactivate = async (user) => {
    setActionLoading(true);
    try {
      await userApi.reactivateUser(user.userId);
      showToast('Account Reactivated', `${user.fullName}'s access has been restored to Active.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Reactivation Failed', err.message || 'Unable to reactivate account.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered dataset
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    return true;
  });

  const columns = [
    {
      header: 'User Account',
      key: 'fullName',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.userId}`}
            alt={row.fullName}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div className="font-bold text-sm text-main flex items-center gap-1.5">
              {row.fullName}
              {row.role === 'Admin' && (
                <span className="badge badge-primary text-xs" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  Admin
                </span>
              )}
            </div>
            <div className="text-xs text-muted">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'System Role',
      key: 'role',
      sortable: true,
      render: (row) => (
        <div>
          <span className="badge badge-secondary">{UserRoleLabels[row.role] || row.role}</span>
          {row.licenseNumber && (
            <div className="text-xs text-muted mt-0.5 font-mono">Lic: {row.licenseNumber}</div>
          )}
          {row.staffId && (
            <div className="text-xs text-muted mt-0.5 font-mono">ID: {row.staffId}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Account Status',
      key: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Registered On',
      key: 'createdAt',
      sortable: true,
      render: (row) => (
        <div className="text-xs text-muted">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => {
        const isSelf = row.userId === currentUser?.userId || row.role === 'Admin';

        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedUserForView(row)}
              title="View Account Details"
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <Eye size={15} />
            </button>

            {row.status === UserStatus.ACTIVE && !isSelf && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setUserToSuspend(row);
                  setSuspensionReason('');
                }}
                title="Suspend User Account"
                style={{ color: 'var(--status-danger)', padding: '0.35rem 0.5rem' }}
              >
                <Ban size={15} />
              </button>
            )}

            {row.status === UserStatus.SUSPENDED && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleReactivate(row)}
                title="Reactivate Account"
                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', color: 'var(--status-success)' }}
              >
                <RotateCcw size={13} /> Reactivate
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">USER DIRECTORY</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            User Account Management
          </h2>
          <p className="text-sm text-muted">
            Inspect all registered accounts, review role assignments, enforce compliance suspension, or reactivate accounts.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="card p-4 mb-6"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted" />
            <label className="text-xs font-bold text-main uppercase">Filter Role:</label>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Stakeholder Roles</option>
              <option value={UserRole.PET_OWNER}>🐾 Pet Owners</option>
              <option value={UserRole.VETERINARIAN}>🩺 Veterinarians</option>
              <option value={UserRole.CLINIC_STAFF}>📋 Clinic Staff</option>
              <option value={UserRole.PET_CARE_PROVIDER}>✂️ Care Providers</option>
              <option value={UserRole.RESCUE_OFFICER}>🦺 Rescue Officers</option>
              <option value={UserRole.CLINIC_MANAGER}>📊 Clinic Managers</option>
              <option value={UserRole.ADMIN}>🛡️ Administrators</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-main uppercase">Status:</label>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.PENDING_APPROVAL}>Pending Approval</option>
              <option value={UserStatus.PENDING_EMAIL}>Pending Email</option>
              <option value={UserStatus.REJECTED}>Rejected</option>
              <option value={UserStatus.SUSPENDED}>Suspended</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-muted font-medium">
          Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> accounts
        </div>
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        searchPlaceholder="Search users by name, email, license number..."
        emptyMessage="No user accounts matched the filter criteria."
      />

      {/* ========================================================================= */}
      {/* 1. VIEW USER DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedUserForView && (
        <Modal
          isOpen={!!selectedUserForView}
          onClose={() => setSelectedUserForView(null)}
          title={`User Profile: ${selectedUserForView.fullName}`}
          subtitle={`User ID: ${selectedUserForView.userId} • Role: ${UserRoleLabels[selectedUserForView.role] || selectedUserForView.role}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header Avatar Card */}
            <div className="flex items-center gap-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <img
                src={selectedUserForView.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUserForView.userId}`}
                alt={selectedUserForView.fullName}
                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedUserForView.fullName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedUserForView.status} />
                  <span className="badge badge-secondary">{UserRoleLabels[selectedUserForView.role] || selectedUserForView.role}</span>
                </div>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid-2 gap-3 text-sm">
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-xs text-muted font-semibold block flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </span>
                <span className="font-medium text-main">{selectedUserForView.email}</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-xs text-muted font-semibold block flex items-center gap-1">
                  <Phone size={12} /> Phone Number
                </span>
                <span className="font-medium text-main">{selectedUserForView.phone || 'Not recorded'}</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-xs text-muted font-semibold block flex items-center gap-1">
                  <MapPin size={12} /> Physical Address
                </span>
                <span className="font-medium text-main">{selectedUserForView.address || 'Not recorded'}</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-xs text-muted font-semibold block flex items-center gap-1">
                  <Calendar size={12} /> Account Created
                </span>
                <span className="font-medium text-main">
                  {selectedUserForView.createdAt ? new Date(selectedUserForView.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Professional Info */}
            {(selectedUserForView.licenseNumber || selectedUserForView.specialization || selectedUserForView.staffId || selectedUserForView.serviceSpecialty || selectedUserForView.emergencyContact) && (
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <span className="text-xs text-muted font-semibold block mb-2 uppercase">Role & Clinical Information</span>
                {selectedUserForView.licenseNumber && (
                  <p className="text-xs text-main mb-1">
                    <strong>Medical License #:</strong> <span className="font-mono text-primary font-bold">{selectedUserForView.licenseNumber}</span>
                  </p>
                )}
                {selectedUserForView.specialization && (
                  <p className="text-xs text-main mb-1">
                    <strong>Specialization:</strong> {selectedUserForView.specialization}
                  </p>
                )}
                {selectedUserForView.serviceSpecialty && (
                  <p className="text-xs text-main mb-1">
                    <strong>Care Specialty:</strong> {selectedUserForView.serviceSpecialty}
                  </p>
                )}
                {selectedUserForView.emergencyContact && (
                  <p className="text-xs text-main mb-1">
                    <strong>Emergency Contact:</strong> {selectedUserForView.emergencyContact}
                  </p>
                )}
              </div>
            )}

            {/* Status-specific notices */}
            {selectedUserForView.status === UserStatus.REJECTED && selectedUserForView.rejectionReason && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--status-danger-bg)', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA' }}>
                <span className="font-bold text-xs text-danger block mb-0.5">Rejection Reason on Record:</span>
                <p className="text-xs text-muted">{selectedUserForView.rejectionReason}</p>
              </div>
            )}

            {selectedUserForView.status === UserStatus.SUSPENDED && selectedUserForView.suspensionReason && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--status-danger-bg)', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA' }}>
                <span className="font-bold text-xs text-danger block mb-0.5">Suspension Notice:</span>
                <p className="text-xs text-muted">{selectedUserForView.suspensionReason}</p>
              </div>
            )}

            <div className="flex items-center justify-end pt-2 border-top" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedUserForView(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 2. SUSPEND USER CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {userToSuspend && (
        <Modal
          isOpen={!!userToSuspend}
          onClose={() => !actionLoading && setUserToSuspend(null)}
          title="Confirm Account Suspension"
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'var(--status-danger-bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #FECACA',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#991B1B' }}>
                  Suspend Access for {userToSuspend.fullName}?
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  The user will be immediately locked out of their {UserRoleLabels[userToSuspend.role]} workspace until reactivated.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Suspension Reason / Policy Violation Notice <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={3}
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="State the compliance or administrative reason for this suspension..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setUserToSuspend(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmSuspend}
                disabled={actionLoading}
                style={{ minWidth: '160px' }}
              >
                {actionLoading ? 'Suspending Account...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
