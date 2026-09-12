import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { UserRoleLabels } from '../../types';
import {
  ShieldCheck,
  Check,
  X,
  FileText,
  ExternalLink,
  Eye,
  AlertTriangle,
  User,
  Clock,
} from 'lucide-react';

export const AdminApprovalQueue = () => {
  const { showToast } = useToast();
  const [pendingApplicants, setPendingApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected applicant for detail review
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Rejection modal
  const [rejectingApplicant, setRejectingApplicant] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const list = await userApi.getPendingApprovals();
      setPendingApplicants(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (applicant) => {
    setActionLoading(true);
    try {
      await userApi.approveUser(applicant.userId);
      showToast('Applicant Approved', `${applicant.fullName} has been granted active clinic access.`, 'success');
      setSelectedApplicant(null);
      fetchPending();
    } catch (err) {
      showToast('Approval Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      showToast('Reason Required', 'Please enter a rejection reason for compliance records.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await userApi.rejectUser(rejectingApplicant.userId, rejectionReason);
      showToast('Applicant Rejected', `${rejectingApplicant.fullName}'s registration was rejected.`, 'warning');
      setRejectingApplicant(null);
      setSelectedApplicant(null);
      setRejectionReason('');
      fetchPending();
    } catch (err) {
      showToast('Rejection Error', err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Applicant',
      key: 'fullName',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatarUrl || '/avatars/default-avatar.svg'}
            alt={row.fullName}
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div className="font-bold text-sm text-main">{row.fullName}</div>
            <div className="text-xs text-muted">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Requested Role',
      key: 'role',
      sortable: true,
      render: (row) => (
        <div>
          <span className="badge badge-primary">{UserRoleLabels[row.role] || row.role}</span>
          {row.licenseNumber && (
            <div className="text-xs text-muted mt-1 font-mono">Lic: {row.licenseNumber}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Applied Date',
      key: 'createdAt',
      sortable: true,
      render: (row) => (
        <div className="text-xs text-muted">
          {new Date(row.createdAt).toLocaleDateString()} at{' '}
          {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      ),
    },
    {
      header: 'Documents',
      key: 'documents',
      render: (row) => (
        <div className="flex items-center gap-1">
          <span className="badge badge-secondary text-xs">
            <FileText size={12} /> {row.verificationDocuments?.length || 0} file(s)
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedApplicant(row)}
            title="Inspect application details and documents"
          >
            <Eye size={14} /> Review
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleApprove(row)}
            title="Direct Approve"
          >
            <Check size={14} /> Approve
          </button>
          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            onClick={() => setRejectingApplicant(row)}
            title="Reject Application"
          >
            <X size={14} /> Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-warning mb-1">COMPLIANCE & CREDENTIALING</span>
          <h2>Applicant Verification Queue</h2>
          <p className="text-sm text-muted">
            Review submitted professional credentials, medical licenses, and identity documents before granting clinic workspace permissions.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pendingApplicants}
        searchPlaceholder="Search applicants by name, email, license..."
        emptyMessage="No pending registrations currently awaiting verification."
      />

      {/* Review Detail Modal */}
      {selectedApplicant && (
        <Modal
          isOpen={!!selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          title={`Review Application: ${selectedApplicant.fullName}`}
          subtitle={`User ID: ${selectedApplicant.userId} • Role: ${UserRoleLabels[selectedApplicant.role]}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between" style={{ width: '100%' }}>
              <button
                type="button"
                className="btn btn-danger-outline"
                onClick={() => setRejectingApplicant(selectedApplicant)}
                disabled={actionLoading}
              >
                <X size={16} /> Reject Application
              </button>

              <div className="flex items-center gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedApplicant(null)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleApprove(selectedApplicant)}
                  disabled={actionLoading}
                >
                  <Check size={16} /> Approve & Grant Access
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Applicant Profile Grid */}
            <div className="grid-2" style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div>
                <span className="text-xs font-semibold text-muted">Full Legal Name:</span>
                <p className="text-sm font-bold text-main">{selectedApplicant.fullName}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted">Email Address:</span>
                <p className="text-sm font-semibold text-main">{selectedApplicant.email}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted">Phone Number:</span>
                <p className="text-sm text-main">{selectedApplicant.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted">Physical Address:</span>
                <p className="text-sm text-main">{selectedApplicant.address || 'N/A'}</p>
              </div>
              {selectedApplicant.licenseNumber && (
                <div>
                  <span className="text-xs font-semibold text-muted">Medical License #:</span>
                  <p className="text-sm font-bold text-primary font-mono">{selectedApplicant.licenseNumber}</p>
                </div>
              )}
              {selectedApplicant.specialization && (
                <div>
                  <span className="text-xs font-semibold text-muted">Clinical Specialty:</span>
                  <p className="text-sm text-main">{selectedApplicant.specialization}</p>
                </div>
              )}
            </div>

            {/* Uploaded Verification Documents */}
            <div>
              <h4 className="text-sm font-bold text-main mb-2">Uploaded Identity & Credential Documents</h4>
              {selectedApplicant.verificationDocuments && selectedApplicant.verificationDocuments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedApplicant.verificationDocuments.map((doc) => (
                    <div
                      key={doc.documentId}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--primary-subtle)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-main">{doc.documentType}</p>
                          <p className="text-xs text-muted">{doc.fileName} • {doc.fileSize}</p>
                        </div>
                      </div>

                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          <ExternalLink size={14} /> Open Document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">No documents attached.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Confirmation Modal */}
      {rejectingApplicant && (
        <Modal
          isOpen={!!rejectingApplicant}
          onClose={() => setRejectingApplicant(null)}
          title="Reject Registration Application"
          subtitle={`Applicant: ${rejectingApplicant.fullName} (${rejectingApplicant.email})`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2" style={{ width: '100%' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRejectingApplicant(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleRejectSubmit}
                disabled={actionLoading}
              >
                <X size={16} /> Confirm Rejection
              </button>
            </div>
          }
        >
          <div>
            <div
              style={{
                backgroundColor: 'var(--status-danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
              }}
            >
              <div className="flex items-center gap-2 text-danger font-bold text-xs">
                <AlertTriangle size={16} />
                <span>Rejection Notice Requirement</span>
              </div>
              <p className="text-xs text-danger mt-1">
                The rejection reason will be recorded on the applicant's record and presented if they attempt to sign in.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Rejection Reason / Explanation <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. The medical board license could not be verified on the state registry..."
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
