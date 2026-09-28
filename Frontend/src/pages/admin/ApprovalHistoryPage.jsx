import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { UserRoleLabels } from '../../types';
import {
  History,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  FileText,
  User,
  Calendar,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';

export const ApprovalHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await userApi.getApprovalHistory();
      setHistory(data);
    } catch (e) {
      console.error('Failed to load approval history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (decisionFilter !== 'ALL' && item.decision !== decisionFilter) return false;
    return true;
  });

  const columns = [
    {
      header: 'Applicant',
      key: 'applicantName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm text-main">{row.applicantName}</div>
          <div className="text-xs text-muted">{row.applicantEmail}</div>
        </div>
      ),
    },
    {
      header: 'Requested Role',
      key: 'requestedRole',
      sortable: true,
      render: (row) => (
        <span className="badge badge-secondary">{UserRoleLabels[row.requestedRole] || row.requestedRole}</span>
      ),
    },
    {
      header: 'Decision',
      key: 'decision',
      sortable: true,
      render: (row) => (
        <span
          className={`badge ${row.decision === 'Approved' ? 'badge-success' : 'badge-danger'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          {row.decision === 'Approved' ? <Check size={13} /> : <X size={13} />}
          {row.decision}
        </span>
      ),
    },
    {
      header: 'Reason / Compliance Notes',
      key: 'reason',
      render: (row) => (
        <p className="text-xs text-muted" style={{ maxWidth: '340px', lineHeight: '1.4' }}>
          {row.reason || 'No detailed reason provided.'}
        </p>
      ),
    },
    {
      header: 'Review Timestamp',
      key: 'reviewDate',
      sortable: true,
      render: (row) => (
        <div className="text-xs text-muted">
          <div className="font-medium text-main">{new Date(row.reviewDate).toLocaleDateString()}</div>
          <div>{new Date(row.reviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      ),
    },
    {
      header: 'Reviewer',
      key: 'reviewedBy',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-primary">{row.reviewedBy || 'System Administrator'}</span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setSelectedRecord(row)}
          title="View Audit Record Details"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">AUDIT TRAIL</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Application Approval & Decision History
          </h2>
          <p className="text-sm text-muted">
            Immutable audit record of all administrative credential approvals, verified licenses, and rejected registrations.
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
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-muted" />
          <label className="text-xs font-bold text-main uppercase">Filter Decision:</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm ${decisionFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDecisionFilter('ALL')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              All Decisions ({history.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${decisionFilter === 'Approved' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDecisionFilter('Approved')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Approved ({history.filter((h) => h.decision === 'Approved').length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${decisionFilter === 'Rejected' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDecisionFilter('Rejected')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Rejected ({history.filter((h) => h.decision === 'Rejected').length})
            </button>
          </div>
        </div>

        <div className="text-xs text-muted font-medium">
          Showing <strong>{filteredHistory.length}</strong> logged decisions
        </div>
      </div>

      {/* Audit DataTable */}
      <DataTable
        columns={columns}
        data={filteredHistory}
        searchPlaceholder="Search audit history by applicant name, email, role, reviewer..."
        emptyMessage="No historical approval records found."
      />

      {/* Audit Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Audit Log: ${selectedRecord.historyId || 'Decision Record'}`}
          subtitle={`Applicant: ${selectedRecord.applicantName}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: selectedRecord.decision === 'Approved' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${selectedRecord.decision === 'Approved' ? 'var(--status-success)' : 'var(--status-danger)'}`,
              }}
            >
              <div>
                <span className="text-xs font-semibold text-muted block">Decision Status:</span>
                <span className="font-bold text-base" style={{ color: selectedRecord.decision === 'Approved' ? 'var(--status-success-text)' : 'var(--status-danger-text)' }}>
                  {selectedRecord.decision}
                </span>
              </div>
              <span className="badge badge-secondary">{UserRoleLabels[selectedRecord.requestedRole] || selectedRecord.requestedRole}</span>
            </div>

            <div className="grid-2 gap-3 text-sm">
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-xs text-muted font-semibold block">Applicant Email</span>
                <span className="font-medium text-main">{selectedRecord.applicantEmail}</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-xs text-muted font-semibold block">Reviewer</span>
                <span className="font-medium text-main">{selectedRecord.reviewedBy || 'System Administrator'}</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-xs text-muted font-semibold block">Review Date & Time</span>
                <span className="font-medium text-main">{new Date(selectedRecord.reviewDate).toLocaleString()}</span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span className="text-xs text-muted font-semibold block">User ID Reference</span>
                <span className="font-mono text-primary font-semibold">{selectedRecord.userId}</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <span className="text-xs text-muted font-semibold block mb-1">Audit Reason / Explanation</span>
              <p className="text-xs text-main font-medium" style={{ lineHeight: '1.6' }}>
                {selectedRecord.reason || 'No detailed explanation recorded.'}
              </p>
            </div>

            <div className="flex items-center justify-end pt-2 border-top" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedRecord(null)}>
                Close Audit Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
