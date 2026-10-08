import React, { useState, useEffect, useMemo } from 'react';
import { careServiceApi } from '../../api/careServiceApi';
import { rescueApi } from '../../api/rescueApi';
import { RescueCaseStatus, ServiceStatus } from '../../types';
import { USE_MOCK_DATA } from '../../api/client';
import { mockStore } from '../../data/mockStore';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Scissors,
  Check,
  Clock,
  User,
  Search,
  CheckCircle2,
  UserCheck,
  Home,
  Heart,
  Calendar,
  Eye,
} from 'lucide-react';

export const ServiceStatusPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailLog, setSelectedDetailLog] = useState(null);

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferStatus, setTransferStatus] = useState(RescueCaseStatus.READY_FOR_FOSTER);
  const [transferNotes, setTransferNotes] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const loadLogs = async () => {
    try {
      const [list, rescueCases] = await Promise.all([
        careServiceApi.getServiceLogs(),
        rescueApi.getRescueCases(),
      ]);

      const completedCaseIds = new Set(
        (list || [])
          .filter(l => l.caseId && (l.status === ServiceStatus.COMPLETED || l.transferredToRescue || l.handedOverToRescue || l.notes?.includes('Transferred to Rescue Officer')))
          .map(l => l.caseId)
      );

      const awaitingCare = (rescueCases || []).filter(
        (r) => r.status === RescueCaseStatus.READY_FOR_FOSTER && !completedCaseIds.has(r.caseId)
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
            serviceDate: rc.intakeDate || new Date().toISOString().split('T')[0],
            status: ServiceStatus.CHECKED_IN,
            intakeCondition: rc.medicalSummary || 'Cleared by Veterinarian for foster care',
            servicesPerformed: 'Pending grooming & intake assessment',
            notes: rc.description || '',
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
      let activeLogId = log.serviceLogId;
      if (log.isVirtual) {
        const created = await careServiceApi.createServiceLog({
          caseId: log.caseId,
          petId: null,
          petName: log.petName,
          ownerName: 'Rescue Organization',
          serviceType: log.serviceType,
          intakeCondition: log.intakeCondition,
          servicesPerformed: log.servicesPerformed || 'Grooming and care underway',
          status: newStatus,
          providerId: currentUser?.userId || 'USR-004',
          providerName: currentUser?.fullName || 'Dilshan Bandara',
          returnToRescue: true,
          serviceDate: log.serviceDate || new Date().toISOString().split('T')[0],
        });
        activeLogId = created.serviceLogId;
      } else {
        await careServiceApi.updateServiceStatus(log.serviceLogId, newStatus);
      }

      showToast('Status Updated', `${log.petName} moved to ${newStatus}`, 'success');

      // If rescue pet is marked Completed, offer transfer to Rescue Officer
      if (log.caseId && newStatus === ServiceStatus.COMPLETED) {
        openTransferModal({ ...log, serviceLogId: activeLogId, status: ServiceStatus.COMPLETED, isVirtual: false });
      }

      await loadLogs();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const openTransferModal = (log) => {
    setTransferTarget(log);
    setTransferStatus(RescueCaseStatus.READY_FOR_FOSTER);
    setTransferNotes(
      `Rehabilitation care (${log.serviceType}) completed by Pet Care Provider (${currentUser?.fullName || 'Dilshan Bandara'}). Companion groomed, healthy, and ready for handoff.`
    );
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = async (e) => {
    e?.preventDefault();
    if (!transferTarget?.caseId || isTransferring) return;

    setIsTransferring(true);
    try {
      // 1. Ensure service log is marked Completed AND transferred
      if (!transferTarget.isVirtual && transferTarget.serviceLogId) {
        const notesWithTag = transferNotes.startsWith('[Transferred to Rescue Officer]')
          ? transferNotes
          : `[Transferred to Rescue Officer] ${transferNotes}`;

        try {
          await careServiceApi.updateServiceLog(transferTarget.serviceLogId, {
            status: ServiceStatus.COMPLETED,
            transferredToRescue: true,
            handedOverToRescue: true,
            returnToRescue: false,
            notes: notesWithTag,
          });
        } catch (ignored) {}
      } else if (transferTarget.isVirtual) {
        const notesWithTag = transferNotes.startsWith('[Transferred to Rescue Officer]')
          ? transferNotes
          : `[Transferred to Rescue Officer] ${transferNotes}`;

        try {
          await careServiceApi.createServiceLog({
            caseId: transferTarget.caseId,
            petId: null,
            petName: transferTarget.petName,
            ownerName: 'Rescue Organization',
            serviceType: transferTarget.serviceType || 'Rehabilitation & Foster Care Intake',
            intakeCondition: transferTarget.intakeCondition || 'Cleared by Vet',
            servicesPerformed: transferTarget.servicesPerformed || 'Completed grooming & care',
            notes: notesWithTag,
            status: ServiceStatus.COMPLETED,
            transferredToRescue: true,
            handedOverToRescue: true,
            providerId: currentUser?.userId || 'USR-004',
            providerName: currentUser?.fullName || 'Dilshan Bandara',
            returnToRescue: false,
            serviceDate: new Date().toISOString().split('T')[0],
          });
        } catch (ignored) {}
      }

      // 2. Update Rescue Case status
      await rescueApi.updateRescueCase(transferTarget.caseId, {
        status: transferStatus,
      });

      const destinationLabel =
        transferStatus === RescueCaseStatus.READY_FOR_ADOPTION
          ? 'Ready for Adoption'
          : 'Ready for Foster Care';

      // 3. Add timeline entry
      await rescueApi.addProgressLog(transferTarget.caseId, {
        title: `Care Completed: Transferred to Rescue Officer (${destinationLabel})`,
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
          message: `${transferTarget.petName} completed care and is transferred to Rescue Officer with status ${destinationLabel}.`,
          isRead: false,
          link: `/rescue/cases/${transferTarget.caseId}`,
          createdAt: new Date().toISOString(),
        });
      }

      showToast(
        'Transferred to Rescue Officer',
        `${transferTarget.petName} transferred to Rescue Officer (${destinationLabel}).`,
        'success'
      );

      setIsTransferModalOpen(false);
      setTransferTarget(null);
      await loadLogs();
    } catch (err) {
      showToast('Transfer Failed', err.message, 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      ALL: logs.length,
      [ServiceStatus.CHECKED_IN]: logs.filter((l) => l.status === ServiceStatus.CHECKED_IN).length,
      [ServiceStatus.IN_PROGRESS]: logs.filter((l) => l.status === ServiceStatus.IN_PROGRESS).length,
      [ServiceStatus.READY_FOR_PICKUP]: logs.filter((l) => l.status === ServiceStatus.READY_FOR_PICKUP).length,
      [ServiceStatus.COMPLETED]: logs.filter((l) => l.status === ServiceStatus.COMPLETED).length,
    };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesTab = activeTab === 'ALL' || log.status === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (log.petName && log.petName.toLowerCase().includes(q)) ||
        (log.ownerName && log.ownerName.toLowerCase().includes(q)) ||
        (log.serviceType && log.serviceType.toLowerCase().includes(q)) ||
        (log.caseId && log.caseId.toLowerCase().includes(q)) ||
        (log.serviceLogId && log.serviceLogId.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [logs, activeTab, searchQuery]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">LIVE SERVICE TRACKER</span>
          <h2>Update Care & Grooming Status</h2>
          <p className="text-sm text-muted">
            Transition patients through service milestones from Checked-In to In Progress, Ready for Pickup, and Completed, then transfer rescue pets to Rescue Officers.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          backgroundColor: '#FFFFFF',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'ALL', label: 'All Services' },
            { id: ServiceStatus.CHECKED_IN, label: 'Checked-In' },
            { id: ServiceStatus.IN_PROGRESS, label: 'In Progress' },
            { id: ServiceStatus.READY_FOR_PICKUP, label: 'Ready for Pickup' },
            { id: ServiceStatus.COMPLETED, label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}{' '}
              <span
                style={{
                  marginLeft: '4px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                {tabCounts[tab.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '32px', fontSize: '0.85rem', height: '36px' }}
            placeholder="Search pet, owner, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div
          className="card p-8"
          style={{ textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}
        >
          <Scissors size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            No Service Logs Found
          </h3>
          <p className="text-sm text-muted">
            No pet care logs match the selected filter {searchQuery ? `"${searchQuery}"` : ''}.
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredLogs.map((log) => (
            <div key={log.serviceLogId} className="card p-6 flex flex-col justify-between">
              <div>
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

                <div className="flex items-center justify-between">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{log.petName}</h3>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.2rem 0.4rem' }}
                    onClick={() => setSelectedDetailLog(log)}
                    title="View Log Details"
                  >
                    <Eye size={15} />
                  </button>
                </div>
                <p className="text-xs text-primary font-semibold mb-3">{log.serviceType}</p>

                <div
                  className="text-xs text-muted mb-4"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <User size={13} />
                    <span>
                      {log.caseId ? 'Case Organiser: ' : 'Owner: '}
                      <strong>{log.ownerName}</strong>
                    </span>
                  </div>
                  {log.serviceDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>Date: {log.serviceDate}</span>
                    </div>
                  )}
                  {log.intakeCondition && (
                    <div className="mt-1" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.25rem' }}>
                      <span className="font-semibold text-main">Intake:</span> {log.intakeCondition}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-muted tracking-wider mb-2">
                  Advance Service Phase:
                </h4>
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

                {log.caseId && (log.transferredToRescue || log.handedOverToRescue || log.notes?.includes('Transferred to Rescue Officer') || log.notes?.includes('Rehabilitation care')) ? (
                  <div
                    className="badge badge-success text-xs flex items-center justify-center gap-1"
                    style={{ width: '100%', marginTop: '0.75rem', padding: '0.45rem', fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                  >
                    <CheckCircle2 size={13} /> Transferred to Rescue Officer
                  </div>
                ) : log.caseId && (
                  <button
                    type="button"
                    className={`btn btn-sm ${log.status === ServiceStatus.COMPLETED ? 'btn-warning' : 'btn-secondary'}`}
                    style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', justifyContent: 'center' }}
                    onClick={() => openTransferModal(log)}
                  >
                    <UserCheck size={14} /> Transfer to Rescue Officer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Details Modal */}
      {selectedDetailLog && (
        <Modal
          isOpen={!!selectedDetailLog}
          onClose={() => setSelectedDetailLog(null)}
          title="Care Service Log Details"
          subtitle={`Log Ref: ${selectedDetailLog.serviceLogId}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{selectedDetailLog.petName}</h3>
                  <p className="text-xs text-muted" style={{ margin: '2px 0 0 0' }}>
                    {selectedDetailLog.caseId ? `Rescue Case ID: ${selectedDetailLog.caseId}` : `Owner: ${selectedDetailLog.ownerName}`}
                  </p>
                </div>
                <StatusBadge status={selectedDetailLog.status} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge badge-primary text-xs">{selectedDetailLog.serviceType}</span>
                {selectedDetailLog.caseId && (
                  <span className="badge badge-warning text-xs">🐾 Rescue Animal</span>
                )}
              </div>
            </div>

            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="card p-3" style={{ fontSize: '0.85rem' }}>
                <strong className="text-muted text-xs block mb-1">Service Date</strong>
                <div>{selectedDetailLog.serviceDate || 'N/A'}</div>
              </div>
              <div className="card p-3" style={{ fontSize: '0.85rem' }}>
                <strong className="text-muted text-xs block mb-1">Assigned Provider</strong>
                <div>{selectedDetailLog.providerName || currentUser?.fullName || 'Pet Care Specialist'}</div>
              </div>
            </div>

            {selectedDetailLog.intakeCondition && (
              <div className="card p-3" style={{ fontSize: '0.85rem' }}>
                <strong className="text-muted text-xs block mb-1">Intake Condition & Assessment</strong>
                <div style={{ whiteSpace: 'pre-wrap' }}>{selectedDetailLog.intakeCondition}</div>
              </div>
            )}

            {selectedDetailLog.servicesPerformed && (
              <div className="card p-3" style={{ fontSize: '0.85rem' }}>
                <strong className="text-muted text-xs block mb-1">Services Performed & Treatments</strong>
                <div style={{ whiteSpace: 'pre-wrap' }}>{selectedDetailLog.servicesPerformed}</div>
              </div>
            )}

            {selectedDetailLog.notes && (
              <div className="card p-3" style={{ fontSize: '0.85rem' }}>
                <strong className="text-muted text-xs block mb-1">Notes & Provider Observations</strong>
                <div style={{ whiteSpace: 'pre-wrap' }}>{selectedDetailLog.notes}</div>
              </div>
            )}

            <div className="flex justify-end mt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedDetailLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

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

            <div className="form-group" style={{ backgroundColor: 'rgba(14, 165, 233, 0.06)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '1rem' }}>
              <div className="flex items-center gap-2 mb-1">
                <Home size={16} color="var(--primary)" />
                <strong className="text-sm text-main">Handover to Rescue Officer</strong>
              </div>
              <p className="text-xs text-muted">
                The companion will be returned to the Rescue Officer to coordinate foster care placement or adoption listing.
              </p>
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
                disabled={isTransferring}
                onClick={() => {
                  setIsTransferModalOpen(false);
                  setTransferTarget(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-warning flex items-center gap-2" disabled={isTransferring}>
                <CheckCircle2 size={16} /> {isTransferring ? 'Transferring...' : 'Confirm Transfer to Rescue Officer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

