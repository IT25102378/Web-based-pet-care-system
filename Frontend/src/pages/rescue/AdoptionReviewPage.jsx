import React, { useState, useEffect } from 'react';
import { adoptionApi } from '../../api/adoptionApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileCheck,
  Check,
  X,
  FileText,
  ExternalLink,
  ShieldCheck,
  User,
  Heart,
  Home,
  Clock,
  PenTool,
} from 'lucide-react';

export const AdoptionReviewPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadApplications = async () => {
    try {
      const list = await adoptionApi.getAdoptionApplications();
      setApplications(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleDecision = async (status) => {
    if (!selectedApp) return;

    setSubmitting(true);
    try {
      await adoptionApi.reviewApplication(selectedApp.applicationId, {
        status,
        reviewNotes: reviewNotes || (status === 'Approved' ? 'Application criteria verified.' : 'Application declined.'),
        reviewedBy: currentUser?.userId || 'USR-006',
      });

      showToast(
        status === 'Approved' ? 'Adoption Approved!' : 'Application Declined',
        `Decision recorded for ${selectedApp.applicantName} (${selectedApp.petName}).`,
        status === 'Approved' ? 'success' : 'warning'
      );

      setSelectedApp(null);
      setReviewNotes('');
      loadApplications();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Application ID',
      key: 'applicationId',
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.applicationId}</span>,
    },
    {
      header: 'Target Pet',
      key: 'petName',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 font-bold text-sm text-main">
          <Heart size={14} className="text-accent" /> {row.petName}
        </div>
      ),
    },
    {
      header: 'Applicant',
      key: 'applicantName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm text-main">{row.applicantName}</div>
          <div className="text-xs text-muted">{row.applicantEmail} • {row.applicantPhone}</div>
        </div>
      ),
    },
    {
      header: 'Housing & Yard',
      key: 'housingType',
      render: (row) => (
        <span className="text-xs text-main">
          {row.housingType} {row.hasFencedYard ? '• Fenced Yard' : ''}
        </span>
      ),
    },
    {
      header: 'Submitted On',
      key: 'createdAt',
      sortable: true,
      render: (row) => <span className="text-xs">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Review & Action',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setSelectedApp(row);
            setReviewNotes(row.reviewNotes || '');
          }}
        >
          <FileCheck size={14} /> Full Review
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-warning mb-1">APPLICANT SCREENING</span>
          <h2>Adoption Applications Review Hub</h2>
          <p className="text-sm text-muted">
            Inspect applicant living situation, examine uploaded identity/residence documents, verify signed adoption agreements, and submit decisions.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={applications}
        searchPlaceholder="Search by application ID, pet, applicant name..."
        emptyMessage="No adoption applications found."
      />

      {/* Comprehensive Full Review Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Adoption Review: ${selectedApp.applicantName} for ${selectedApp.petName}`}
          subtitle={`Application ID: ${selectedApp.applicationId} • Status: ${selectedApp.status}`}
          size="xl"
          footer={
            <div className="flex items-center justify-between" style={{ width: '100%' }}>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedApp.status} />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedApp(null)}
                  disabled={submitting}
                >
                  Close
                </button>

                {selectedApp.status !== 'Approved' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger-outline"
                      onClick={() => handleDecision('Rejected')}
                      disabled={submitting}
                    >
                      <X size={16} /> Decline Application
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleDecision('Approved')}
                      disabled={submitting}
                    >
                      <Check size={16} /> Approve & Finalize Adoption
                    </button>
                  </>
                )}
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Section 1: Applicant Profile & Living Situation */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
              }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                <User size={14} className="text-primary" /> 1. Applicant Profile & Household Details
              </h4>

              <div className="grid-3 mb-3">
                <div>
                  <span className="text-xs text-muted">Legal Name:</span>
                  <p className="text-sm font-bold text-main">{selectedApp.applicantName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Email Address:</span>
                  <p className="text-sm font-semibold text-main">{selectedApp.applicantEmail}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Phone Contact:</span>
                  <p className="text-sm text-main">{selectedApp.applicantPhone}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Occupation:</span>
                  <p className="text-sm text-main">{selectedApp.occupation}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Housing Environment:</span>
                  <p className="text-sm font-semibold text-main">
                    {selectedApp.housingType} {selectedApp.hasFencedYard ? '(Fenced Yard)' : '(No Fenced Yard)'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted">Pet Experience:</span>
                  <p className="text-sm text-main">{selectedApp.petExperienceYears} Years</p>
                </div>
              </div>

              <div className="grid-2 pt-2 border-top" style={{ borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <span className="text-xs text-muted">Daily Hours Pet Alone:</span>
                  <p className="text-xs font-semibold text-main">{selectedApp.dailyAloneHours}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">Other Household Pets:</span>
                  <p className="text-xs text-main">{selectedApp.otherPetsDetails || 'None'}</p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-top" style={{ borderTop: '1px solid var(--border-light)' }}>
                <span className="text-xs text-muted">Reason for Adoption:</span>
                <p className="text-sm text-main mt-1 italic" style={{ lineHeight: '1.5' }}>
                  "{selectedApp.reasonForAdoption}"
                </p>
              </div>
            </div>

            {/* Section 2: Uploaded Verification Proof Documents */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                <FileText size={14} className="text-primary" /> 2. Uploaded Proof Documents ({selectedApp.documents?.length || 0})
              </h4>

              <div className="grid-2">
                {selectedApp.documents?.map((doc) => (
                  <div
                    key={doc.docId}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
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
                        <p className="text-xs font-bold text-main">{doc.documentType}</p>
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
                        <ExternalLink size={12} /> Inspect File
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Executed Adoption Agreement & Digital Signature */}
            <div
              style={{
                border: '1px solid #CBD5E1',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#FFFFFF',
                padding: '1.25rem',
              }}
            >
              <div className="flex items-center justify-between mb-3 border-bottom pb-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <PenTool size={16} />
                  <span>3. Executed Legal Adoption Agreement & Signature</span>
                </div>
                <span className="badge badge-success text-xs">
                  <Check size={12} /> Terms Acknowledged
                </span>
              </div>

              <div className="grid-2 items-center">
                <div>
                  <p className="text-xs text-muted">
                    The applicant signed and executed the Pet Nexus Adoption Covenants electronically.
                  </p>
                  <p className="text-xs text-muted mt-2">
                    Signed At: <strong>{new Date(selectedApp.signedAt || selectedApp.createdAt).toLocaleString()}</strong>
                  </p>
                </div>

                <div
                  style={{
                    border: '1px dashed var(--primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-subtle)',
                    textAlign: 'center',
                  }}
                >
                  <span className="text-xs font-bold text-muted block mb-1">DIGITAL SIGNATURE ON FILE:</span>
                  {selectedApp.signatureDataUrl ? (
                    <img
                      src={selectedApp.signatureDataUrl}
                      alt="Applicant Signature"
                      style={{ maxHeight: '50px', margin: '0 auto' }}
                    />
                  ) : (
                    <span className="text-xs text-muted italic">Signature verified during intake form</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Rescue Officer Review Notes */}
            <div className="form-group">
              <label className="form-label">Rescue Officer Evaluation Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter background check notes, phone interview findings, or condition requirements..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
