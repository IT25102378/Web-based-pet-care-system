import React, { useState, useEffect } from 'react';
import { careServiceApi } from '../../api/careServiceApi';
import { rescueApi } from '../../api/rescueApi';
import { RescueCaseStatus, ServiceStatus } from '../../types';
import { USE_MOCK_DATA } from '../../api/client';
import { mockStore } from '../../data/mockStore';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Scissors, Check, Clock, User, Phone, CheckCircle2, UserCheck, Home, Heart } from 'lucide-react';

export const ServiceStatusPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferStatus, setTransferStatus] = useState(RescueCaseStatus.IN_FOSTER);
  const [transferNotes, setTransferNotes] = useState('');

  const loadLogs = async () => {
    try {
      const [list, rescueCases] = await Promise.all([
        careServiceApi.getServiceLogs(),
        rescueApi.getRescueCases(),
      ]);

      const awaitingCare = (rescueCases || []).filter(
        (r) => r.status === RescueCaseStatus.READY_FOR_FOSTER || r.status === RescueCaseStatus.IN_FOSTER
      );

      const virtualLogs = [];
      awaitingCare.forEach((rc) => {
        const exists = (list || []).some((l) => l.caseId === rc.caseId);
        if (!exists) {
          virtualLogs.push({
            serviceLogId: `RSC-LOG-${rc.caseId}`,
            caseId: rc.caseId,
            petName: rc.temporaryName,
            species: rc.species,
            breed: rc.breed,
            ownerName: 'Rescue Organization',
            serviceType: 'Rehabilitation & Foster Care Intake',
            status: ServiceStatus.CHECKED_IN,
            intakeCondition: rc.medicalSummary || 'Cleared by Veterinarian for foster care',
            returnToRescue: true,
            isVirtual: true,
          });
        }
      });

      setLogs([...(list || []), ...virtualLogs]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleUpdate = async (log, newStatus) => {
    try {
      if (log.isVirtual) {
        await careServiceApi.createServiceLog({
          caseId: log.caseId,
          petId: null,
          petName: log.petName,
          ownerName: 'Rescue Organization',
          serviceType: log.serviceType,
          intakeCondition: log.intakeCondition,
          status: newStatus,
          providerId: currentUser?.userId || 'USR-004',
          providerName: currentUser?.fullName || 'Dilshan Bandara',
          returnToRescue: true,
        });
      } else {
        await careServiceApi.updateServiceStatus(log.serviceLogId, newStatus);
      }

      showToast('Status Updated', `${log.petName} moved to ${newStatus}`, 'success');

      // If rescue pet is marked Completed, offer transfer to Rescue Officer
      if (log.caseId && newStatus === ServiceStatus.COMPLETED) {
        openTransferModal({ ...log, status: ServiceStatus.COMPLETED });
      }

      loadLogs();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const openTransferModal = (log) => {
    setTransferTarget(log);
    setTransferStatus(RescueCaseStatus.IN_FOSTER);
    setTransferNotes(
      `Rehabilitation care (${log.serviceType}) completed by Pet Care Provider (${currentUser?.fullName || 'Dilshan Bandara'}). Companion groomed, healthy, and ready for handoff.`
    );
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = async (e) => {
    e?.preventDefault();
    if (!transferTarget?.caseId) return;

    try {
      // 1. Ensure service log is marked Completed
      if (transferTarget.status !== ServiceStatus.COMPLETED && !transferTarget.isVirtual) {
        await careServiceApi.updateServiceStatus(transferTarget.serviceLogId, ServiceStatus.COMPLETED);
      }

      // 2. Update Rescue Case status
      await rescueApi.updateRescueCase(transferTarget.caseId, {
        status: transferStatus,
      });

      // 3. Add timeline entry
      await rescueApi.addProgressLog(transferTarget.caseId, {
        title: `Care Completed: Transferred to Rescue Officer (${transferStatus === RescueCaseStatus.READY_FOR_ADOPTION ? 'Ready for Adoption' : 'In Foster Care'})`,
        logType: 'Behavioral',
        notes: transferNotes,
        loggedBy: `${currentUser?.fullName || 'Dilshan Bandara'} (Pet Care Provider)`,
      });

      // 4. Dispatch notification in mock mode
      if (USE_MOCK_DATA) {
        mockStore.insertItem('notifications', {
          notificationId: `NTF-${Date.now()}`,
          userId: 'USR-006',
          type: 'Rescue',
          title: 'Rescue Companion Transferred from Care Provider',
          message: `${transferTarget.petName} completed care and is transferred to Rescue Officer with status ${transferStatus}.`,
          isRead: false,
          link: `/rescue/cases/${transferTarget.caseId}`,
          createdAt: new Date().toISOString(),
        });
      }

      showToast(
        'Transferred to Rescue Officer',
        `${transferTarget.petName} transferred to Rescue Officer (${transferStatus === RescueCaseStatus.READY_FOR_ADOPTION ? 'Ready for Adoption' : 'In Foster Care'}).`,
        'success'
      );

      setIsTransferModalOpen(false);
      setTransferTarget(null);
      loadLogs();
    } catch (err) {
      showToast('Transfer Failed', err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">LIVE SERVICE TRACKER</span>
          <h2>Update Care & Grooming Status</h2>
          <p className="text-sm text-muted">
            Transition patients through service milestones from Checked-In to In Progress, Ready for Pickup, and Completed, then transfer rescue pets to Rescue Officers.
          </p>
        </div>
      </div>

      <div className="grid-3">
        {logs.map((log) => (
          <div key={log.serviceLogId} className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-xs text-primary">{log.serviceLogId}</span>
                {log.caseId && (
                  <span className="badge badge-warning text-xs font-semibold" style={{ fontSize: '0.65rem' }}>
                    🐾 Rescue
                  </span>
                )}
              </div>
              <StatusBadge status={log.status} />
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{log.petName}</h3>
            <p className="text-xs text-primary font-semibold mb-3">{log.serviceType}</p>

            <div
              className="text-xs text-muted mb-4"
              style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}
            >
              <div>
                Owner: <strong>{log.ownerName}</strong>
              </div>
              <div>Intake: {log.intakeCondition}</div>
            </div>

            <h4 className="text-xs font-bold uppercase text-muted tracking-wider mb-2">Advance Service Phase:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${log.status === 'CheckedIn' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => handleUpdate(log, ServiceStatus.CHECKED_IN)}
              >
                Checked-In
              </button>
              <button
                type="button"
                className={`btn btn-sm ${log.status === 'InProgress' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => handleUpdate(log, ServiceStatus.IN_PROGRESS)}
              >
                In Progress
              </button>
              <button
                type="button"
                className={`btn btn-sm ${log.status === 'ReadyForPickup' ? 'btn-warning' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => handleUpdate(log, ServiceStatus.READY_FOR_PICKUP)}
              >
                Ready Pickup
              </button>
              <button
                type="button"
                className={`btn btn-sm ${log.status === 'Completed' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => handleUpdate(log, ServiceStatus.COMPLETED)}
              >
                Completed
              </button>
            </div>

            {log.caseId && (
              <button
                type="button"
                className="btn btn-sm btn-warning"
                style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', justifyContent: 'center' }}
                onClick={() => openTransferModal(log)}
              >
                <UserCheck size={14} /> Transfer to Rescue Officer
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Transfer to Rescue Officer Modal */}
      {isTransferModalOpen && transferTarget && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setTransferTarget(null);
          }}
          title="Transfer Rescue Animal to Rescue Officer"
          subtitle={`Case: ${transferTarget.caseId} • Patient: ${transferTarget.petName}`}
          size="md"
        >
          <form onSubmit={handleConfirmTransfer}>
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-main">{transferTarget.petName}</span>
                <span className="badge badge-success text-xs">Care Service Completed</span>
              </div>
              <p className="text-xs text-muted">
                Service: <strong>{transferTarget.serviceType}</strong>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label font-bold text-sm">
                Select Handoff Destination for Rescue Officer: <span className="required">*</span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border:
                      transferStatus === RescueCaseStatus.IN_FOSTER
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border)',
                    backgroundColor:
                      transferStatus === RescueCaseStatus.IN_FOSTER
                        ? 'rgba(14, 165, 233, 0.06)'
                        : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="transferStatus"
                    value={RescueCaseStatus.IN_FOSTER}
                    checked={transferStatus === RescueCaseStatus.IN_FOSTER}
                    onChange={() => setTransferStatus(RescueCaseStatus.IN_FOSTER)}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Home size={16} color="var(--primary)" />
                      <strong className="text-sm text-main">Ready for Foster Care Placement</strong>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Companion is stabilized and returned to Rescue Officer to assign a licensed foster parent home.
                    </p>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border:
                      transferStatus === RescueCaseStatus.READY_FOR_ADOPTION
                        ? '2px solid var(--accent)'
                        : '1px solid var(--border)',
                    backgroundColor:
                      transferStatus === RescueCaseStatus.READY_FOR_ADOPTION
                        ? 'rgba(231, 111, 81, 0.06)'
                        : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="transferStatus"
                    value={RescueCaseStatus.READY_FOR_ADOPTION}
                    checked={transferStatus === RescueCaseStatus.READY_FOR_ADOPTION}
                    onChange={() => setTransferStatus(RescueCaseStatus.READY_FOR_ADOPTION)}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Heart size={16} color="var(--accent)" />
                      <strong className="text-sm text-main">Ready for Public Adoption Listing</strong>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Companion has finished all care, grooming, and behavioral evaluation. Cleared for public adoption gallery publishing.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">
                Provider Handover Report & Notes for Rescue Officer <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="Detail the animal's behavior, grooming condition, diet adherence, and readiness..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsTransferModalOpen(false);
                  setTransferTarget(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-warning flex items-center gap-2">
                <CheckCircle2 size={16} /> Confirm Transfer to Rescue Officer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
