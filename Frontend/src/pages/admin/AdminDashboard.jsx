import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import { UserRoleLabels } from '../../types';
import {
  ShieldCheck,
  Users,
  Clock,
  UserX,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  FileText,
  Activity,
  History,
  Eye,
  Check,
  X,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [pendingApplicants, setPendingApplicants] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      const [allUsers, pending, history] = await Promise.all([
        userApi.getUsers(),
        userApi.getPendingApprovals(),
        userApi.getApprovalHistory(),
      ]);
      setUsers(allUsers);
      setPendingApplicants(pending);
      setApprovalHistory(history);
    } catch (e) {
      console.error('Error loading admin dashboard metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const activeCount = users.filter((u) => u.status === 'Active').length;
  const pendingCount = pendingApplicants.length;
  const rejectedCount = users.filter((u) => u.status === 'Rejected').length;
  const suspendedCount = users.filter((u) => u.status === 'Suspended').length;
  const totalUsersCount = users.length;

  // Role Breakdown Stats
  const rolesCount = {
    PetOwner: users.filter((u) => u.role === 'PetOwner').length,
    Veterinarian: users.filter((u) => u.role === 'Veterinarian').length,
    ClinicStaff: users.filter((u) => u.role === 'ClinicStaff').length,
    PetCareProvider: users.filter((u) => u.role === 'PetCareProvider').length,
    RescueOfficer: users.filter((u) => u.role === 'RescueOfficer').length,
    ClinicManager: users.filter((u) => u.role === 'ClinicManager').length,
    Admin: users.filter((u) => u.role === 'Admin').length,
  };

  return (
    <div style={{ color: '#1F2937' }}>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="badge"
              style={{ backgroundColor: '#1E293B', color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem' }}
            >
              SYSTEM ADMINISTRATOR WORKSPACE
            </span>
            <span className="badge badge-success">Online & Audited</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            System Administration & Credential Verification
          </h1>
          <p className="text-sm text-muted mt-1">
            Oversee clinic workspace access, review professional applicant credentials, manage user statuses, and maintain audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/approvals" className="btn btn-primary">
            <ShieldCheck size={16} /> Review Approvals ({pendingCount})
          </Link>
          <Link to="/admin/users" className="btn btn-outline">
            <Users size={16} /> User Accounts
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid-4 mb-8">
        <StatCard
          title="Pending Approvals"
          value={pendingCount}
          subtitle="Applicants awaiting verification"
          icon={Clock}
          trend={pendingCount > 0 ? `${pendingCount} action(s) needed` : 'All caught up'}
          trendType={pendingCount > 0 ? 'warning' : 'positive'}
        />

        <StatCard
          title="Active Users"
          value={activeCount}
          subtitle="Authorized accounts"
          icon={CheckCircle2}
          trend="Fully active"
          trendType="positive"
        />

        <StatCard
          title="Rejected Accounts"
          value={rejectedCount}
          subtitle="Failed credential checks"
          icon={UserX}
          trendType="neutral"
        />

        <StatCard
          title="Total Registered"
          value={totalUsersCount}
          subtitle="All platform accounts"
          icon={Users}
          trendType="positive"
        />
      </div>

      {/* Split Grid: Pending Queue & Role Distribution */}
      <div className="grid-2 mb-8" style={{ alignItems: 'start' }}>
        {/* Left Card: Urgent Pending Applicants */}
        <Card
          title="Pending Applicant Verifications"
          subtitle="Newly registered medical and care personnel requiring credential validation"
          icon={ShieldAlert}
          actions={
            <Link to="/admin/approvals" className="text-xs font-bold text-primary flex items-center gap-1">
              View All Queue ({pendingCount}) <ArrowRight size={14} />
            </Link>
          }
        >
          {pendingApplicants.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingApplicants.slice(0, 3).map((applicant) => (
                <div
                  key={applicant.userId}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={applicant.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${applicant.userId}`}
                      alt={applicant.fullName}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{applicant.fullName}</h4>
                      <p className="text-xs text-muted">
                        {applicant.email} • <span className="text-primary font-semibold">{UserRoleLabels[applicant.role] || applicant.role}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge badge-warning text-xs">
                      <Clock size={12} /> Pending Review
                    </span>
                    <Link
                      to="/admin/approvals"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} /> Inspect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="var(--status-success)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Approval Queue Clear</h4>
              <p className="text-xs text-muted mt-1">There are currently no new registration applications awaiting verification.</p>
            </div>
          )}
        </Card>

        {/* Right Card: Role Breakdown & Platform Health */}
        <Card
          title="Account Distribution by Stakeholder Role"
          subtitle="Directory composition across all system workspaces"
          icon={Activity}
          actions={
            <Link to="/admin/users" className="text-xs font-bold text-primary flex items-center gap-1">
              Browse Directory <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { role: 'PetOwner', label: '🐾 Pet Owners', count: rolesCount.PetOwner, color: '#2A8C82' },
              { role: 'Veterinarian', label: '🩺 Veterinarians', count: rolesCount.Veterinarian, color: '#0EA5E9' },
              { role: 'ClinicStaff', label: '📋 Clinic Staff', count: rolesCount.ClinicStaff, color: '#8B5CF6' },
              { role: 'PetCareProvider', label: '✂️ Care Providers', count: rolesCount.PetCareProvider, color: '#F4A261' },
              { role: 'RescueOfficer', label: '🦺 Rescue Officers', count: rolesCount.RescueOfficer, color: '#E76F51' },
              { role: 'ClinicManager', label: '📊 Clinic Managers', count: rolesCount.ClinicManager, color: '#6366F1' },
              { role: 'Admin', label: '🛡️ Administrators', count: rolesCount.Admin, color: '#1E293B' },
            ].map((item) => (
              <div key={item.role}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-main">{item.label}</span>
                  <span className="text-muted">{item.count} user(s)</span>
                </div>
                <div
                  style={{
                    height: '6px',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: totalUsersCount > 0 ? `${(item.count / totalUsersCount) * 100}%` : '0%',
                      backgroundColor: item.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Approval Audit Log Preview */}
      <Card
        title="Recent Credential Decisions & Audit History"
        subtitle="Chronological log of approvals and compliance rejections"
        icon={History}
        actions={
          <Link to="/admin/approval-history" className="text-xs font-bold text-primary flex items-center gap-1">
            Full Audit History <ArrowRight size={14} />
          </Link>
        }
      >
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Requested Role</th>
                <th>Decision</th>
                <th>Audit Reason / Explanation</th>
                <th>Review Date</th>
                <th>Reviewer</th>
              </tr>
            </thead>
            <tbody>
              {approvalHistory.length > 0 ? (
                approvalHistory.slice(0, 5).map((log) => (
                  <tr key={log.historyId}>
                    <td className="font-semibold text-main">{log.applicantName}</td>
                    <td>
                      <span className="badge badge-secondary">{UserRoleLabels[log.requestedRole] || log.requestedRole}</span>
                    </td>
                    <td>
                      <span className={`badge ${log.decision === 'Approved' ? 'badge-success' : 'badge-danger'}`}>
                        {log.decision === 'Approved' ? <Check size={12} /> : <X size={12} />}
                        {log.decision}
                      </span>
                    </td>
                    <td className="text-xs text-muted" style={{ maxWidth: '300px' }}>{log.reason}</td>
                    <td className="text-xs text-muted">
                      {new Date(log.reviewDate).toLocaleDateString()} at {new Date(log.reviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="font-mono text-xs font-semibold text-primary">{log.reviewedBy}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No audit records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
