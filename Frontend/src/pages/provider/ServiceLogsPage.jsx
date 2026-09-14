import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { careServiceApi } from '../../api/careServiceApi';
import { petApi } from '../../api/petApi';
import { rescueApi } from '../../api/rescueApi';
import { RescueCaseStatus, ServiceStatus } from '../../types';
import { USE_MOCK_DATA } from '../../api/client';
import { mockStore } from '../../data/mockStore';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Plus,
  Scissors,
  Check,
  Eye,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Heart,
  Home,
  CheckCircle2,
} from 'lucide-react';

export const ServiceLogsPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const [logs, setLogs] = useState([]);
  const [pets, setPets] = useState([]);
  const [rescueCases, setRescueCases] = useState([]);
  const [patientType, setPatientType] = useState('owned');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState('');

  // Transfer to Rescue Officer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferTargetStatus, setTransferTargetStatus] = useState(RescueCaseStatus.IN_FOSTER);
  const [transferNotes, setTransferNotes] = useState('');

  const [formData, setFormData] = useState({
    serviceType: 'Deluxe Spa & Grooming Session',
    intakeCondition: 'Coat in good condition. Calm demeanor.',
    servicesPerformed: 'Hydro-bath, ear clean, nail dremel trim, de-shedding.',
    notes: '',
    returnToRescue: true,
  });

  const loadData = async () => {
    try {
      const [petList, rescueList, logList] = await Promise.all([
        petApi.getPets(),
        rescueApi.getRescueCases(),
        careServiceApi.getServiceLogs(),
      ]);

      const awaitingCare = rescueList.filter(
        (r) => r.status === RescueCaseStatus.READY_FOR_FOSTER || r.status === RescueCaseStatus.IN_FOSTER
      );
      setPets(petList);
      setRescueCases(awaitingCare);

      // Merge rescue cases that don't have a service log yet directly into daily service logs
      const virtualRescueLogs = [];
      awaitingCare.forEach((rc) => {
        const hasExistingLog = (logList || []).some((l) => l.caseId === rc.caseId);
        if (!hasExistingLog) {
          virtualRescueLogs.push({
            serviceLogId: `RSC-LOG-${rc.caseId}`,
            caseId: rc.caseId,
            petName: rc.temporaryName,
            species: rc.species,
            breed: rc.breed,
            coverPhotoUrl: rc.coverPhotoUrl,
            ownerName: 'Rescue Organization',
            serviceType: 'Rehabilitation & Foster Care Intake',
            serviceDate: rc.intakeDate || new Date().toISOString().split('T')[0],
            status: ServiceStatus.CHECKED_IN,
            intakeCondition: rc.medicalSummary || 'Cleared by Veterinarian for foster care',
            servicesPerformed: 'Pending provider grooming & care',
            notes: rc.description || '',
            returnToRescue: true,
            isVirtual: true,
          });
        }
      });

      setLogs([...(logList || []), ...virtualRescueLogs]);

      // Auto-select rescue case if passed via navigation state
      const inboundCaseId = location.state?.rescueCaseId;
      if (inboundCaseId) {
        const matched = awaitingCare.find((r) => r.caseId === inboundCaseId) || rescueList.find((r) => r.caseId === inboundCaseId);
        if (matched) {
          setPatientType('rescue');
          setSelectedPetId(matched.caseId);
          setFormData((prev) => ({ ...prev, returnToRescue: true }));
          setIsAddModalOpen(true);
          return;
        }
      }

      if (petList.length > 0 && !selectedPetId) {
        setSelectedPetId(petList[0].petId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [location.state?.rescueCaseId]);

  // Handle Status Progression in table
  const handleStatusChange = async (row, newStatus) => {
    try {
      let activeLogId = row.serviceLogId;

      // If this is a virtual rescue log, persist it first
      if (row.isVirtual) {
        const created = await careServiceApi.createServiceLog({
          caseId: row.caseId,
          petId: null,
          petName: row.petName,
          ownerName: 'Rescue Organization',
          serviceType: row.serviceType,
          intakeCondition: row.intakeCondition,
          servicesPerformed: row.servicesPerformed,
          notes: row.notes,
          status: newStatus,
          providerId: currentUser?.userId || 'USR-004',
          providerName: currentUser?.fullName || 'Dilshan Bandara',
          returnToRescue: true,
          serviceDate: row.serviceDate,
        });
        activeLogId = created.serviceLogId;
      } else {
        await careServiceApi.updateServiceStatus(activeLogId, newStatus);
      }

      showToast('Status Updated', `${row.petName} moved to ${newStatus}`, 'success');

      // If rescue pet is marked Completed, prompt for transfer to Rescue Officer
      if (row.caseId && newStatus === ServiceStatus.COMPLETED) {
        openTransferModal({ ...row, serviceLogId: activeLogId, status: ServiceStatus.COMPLETED });
      }

      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  // Open Transfer to Rescue Officer modal
  const openTransferModal = (row) => {
    setTransferTarget(row);
    setTransferTargetStatus(RescueCaseStatus.IN_FOSTER);
    setTransferNotes(
      `Care & grooming rehabilitation completed by Pet Care Provider (${currentUser?.fullName || 'Dilshan Bandara'}). Companion groomed, calm, and ready for handoff.`
    );
    setIsTransferModalOpen(true);
  };

  // Confirm Transfer to Rescue Officer
  const handleConfirmTransfer = async (e) => {
    e?.preventDefault();
    if (!transferTarget?.caseId) return;

    try {
      // 1. Ensure service log is marked Completed
      if (transferTarget.status !== ServiceStatus.COMPLETED && !transferTarget.isVirtual) {
        await careServiceApi.updateServiceStatus(transferTarget.serviceLogId, ServiceStatus.COMPLETED);
      } else if (transferTarget.isVirtual) {
        try {
          await careServiceApi.createServiceLog({
            caseId: transferTarget.caseId,
            petId: null,
            petName: transferTarget.petName,
            ownerName: 'Rescue Organization',
            serviceType: transferTarget.serviceType,
            intakeCondition: transferTarget.intakeCondition,
            servicesPerformed: 'Completed grooming & care',
            notes: transferNotes,
            status: ServiceStatus.COMPLETED,
            providerId: currentUser?.userId || 'USR-004',
            providerName: currentUser?.fullName || 'Dilshan Bandara',
            returnToRescue: true,
          });
        } catch (ignored) {}
      }

      // 2. Update Rescue Case status to InFoster or ReadyForAdoption
      await rescueApi.updateRescueCase(transferTarget.caseId, {
        status: transferTargetStatus,
      });

      // 3. Add timeline entry
      await rescueApi.addProgressLog(transferTarget.caseId, {
        title: `Care Completed: Transferred to Rescue Officer (${transferTargetStatus === RescueCaseStatus.READY_FOR_ADOPTION ? 'Ready for Adoption' : 'In Foster Care'})`,
        logType: 'Behavioral',
        notes: transferNotes,
        loggedBy: `${currentUser?.fullName || 'Dilshan Bandara'} (Pet Care Provider)`,
      });

      // 4. Dispatch in-app notification (mock mode)
      if (USE_MOCK_DATA) {
        mockStore.insertItem('notifications', {
          notificationId: `NTF-${Date.now()}`,
          userId: 'USR-006',
          type: 'Rescue',
          title: 'Rescue Companion Transferred from Care Provider',
          message: `${transferTarget.petName} care completed and transferred to Rescue Officer with status ${transferTargetStatus}.`,
          isRead: false,
          link: `/rescue/cases/${transferTarget.caseId}`,
          createdAt: new Date().toISOString(),
        });
      }

      showToast(
        'Transferred to Rescue Officer',
        `${transferTarget.petName} has been transferred to the Rescue Officer (${transferTargetStatus === RescueCaseStatus.READY_FOR_ADOPTION ? 'Ready for Adoption' : 'In Foster Care'}).`,
        'success'
      );

      setIsTransferModalOpen(false);
      setTransferTarget(null);
      loadData();
    } catch (err) {
      showToast('Transfer Failed', err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPetId) {
      showToast('Validation Error', 'Please select a patient companion or rescue animal.', 'error');
      return;
    }

    try {
      if (patientType === 'rescue') {
        const rescueObj =
          rescueCases.find((r) => r.caseId === selectedPetId) || (await rescueApi.getRescueCaseById(selectedPetId));

        await careServiceApi.createServiceLog({
          ...formData,
          caseId: selectedPetId,
          petId: null,
          petName: rescueObj ? rescueObj.temporaryName : 'Rescue Animal',
          ownerName: 'Rescue Organization',
          providerId: currentUser?.userId || 'USR-004',
          providerName: currentUser?.fullName || 'Dilshan Bandara',
          status: 'Completed',
        });

        if (formData.returnToRescue) {
          // Open the transfer modal directly for decision
          setIsAddModalOpen(false);
          openTransferModal({
            caseId: selectedPetId,
            petName: rescueObj ? rescueObj.temporaryName : 'Rescue Animal',
            serviceType: formData.serviceType,
            intakeCondition: formData.intakeCondition,
            status: ServiceStatus.COMPLETED,
          });
          return;
        } else {
          await rescueApi.addProgressLog(selectedPetId, {
            title: `Care Service Logged: ${formData.serviceType}`,
            logType: 'Behavioral',
            notes: formData.servicesPerformed + (formData.notes ? ` - ${formData.notes}` : ''),
            loggedBy: `${currentUser?.fullName || 'Dilshan Bandara'} (Pet Care Provider)`,
          });
          showToast('Log Saved', 'Care service log has been recorded successfully.', 'success');
        }
      } else {
        const petObj = pets.find((p) => p.petId === selectedPetId);
        await careServiceApi.createServiceLog({
          ...formData,
          petId: selectedPetId,
          petName: petObj ? petObj.name : 'Patient',
          ownerName: petObj ? petObj.ownerName : 'Client',
          providerId: currentUser?.userId || 'USR-004',
          providerName: currentUser?.fullName || 'Dilshan Bandara',
        });
        showToast('Log Saved', 'Care service log has been recorded successfully.', 'success');
      }

      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleTypeChange = (type) => {
    setPatientType(type);
    if (type === 'owned' && pets.length > 0) {
      setSelectedPetId(pets[0].petId);
      setFormData((prev) => ({ ...prev, returnToRescue: false }));
    } else if (type === 'rescue' && rescueCases.length > 0) {
      setSelectedPetId(rescueCases[0].caseId);
      setFormData((prev) => ({ ...prev, returnToRescue: true }));
    } else {
      setSelectedPetId('');
    }
  };

  const columns = [
    {
      header: 'Log ID',
      key: 'serviceLogId',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-primary">{row.serviceLogId}</span>
      ),
    },
    {
      header: 'Patient Companion',
      key: 'petName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-main">{row.petName}</span>
            {row.caseId && (
              <span className="badge badge-warning text-xs font-semibold" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                🐾 Rescue Companion
              </span>
            )}
          </div>
          <div className="text-xs text-muted">
            {row.caseId ? `Case #${row.caseId} • Rescue Organization` : `Owner: ${row.ownerName}`}
          </div>
        </div>
      ),
    },
    {
      header: 'Care Service Type',
      key: 'serviceType',
      render: (row) => <span className="font-semibold text-xs text-main">{row.serviceType}</span>,
    },
    {
      header: 'Service Date',
      key: 'serviceDate',
      sortable: true,
      render: (row) => <span className="text-xs">{row.serviceDate}</span>,
    },
    {
      header: 'Service Phase',
      key: 'status',
      render: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={row.status} />
          <select
            className="form-select"
            style={{
              width: 'auto',
              fontSize: '0.72rem',
              padding: '0.2rem 0.4rem',
              height: '26px',
            }}
            value={row.status}
            onChange={(e) => handleStatusChange(row, e.target.value)}
          >
            <option value={ServiceStatus.CHECKED_IN}>Checked-In</option>
            <option value={ServiceStatus.IN_PROGRESS}>In Progress</option>
            <option value={ServiceStatus.READY_FOR_PICKUP}>Ready Pickup</option>
            <option value={ServiceStatus.COMPLETED}>Completed</option>
          </select>
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedLog(row)}
          >
            <Eye size={13} /> Full Log
          </button>

          {row.caseId && (
            <button
              type="button"
              className={`btn btn-sm ${
                row.status === ServiceStatus.COMPLETED ? 'btn-warning' : 'btn-ghost'
              }`}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.6rem',
                border: '1px solid var(--warning)',
              }}
              onClick={() => openTransferModal(row)}
              title="Transfer companion back to Rescue Officer"
            >
              <UserCheck size={14} /> Transfer to Rescue Officer
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">CARE LOGBOOK</span>
          <h2>Daily Grooming & Boarding Logs</h2>
          <p className="text-sm text-muted">
            Document intake conditions, skin/coat treatments, behavioral traits, and transfer rehabilitated rescue pets to Rescue Officers.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> New Service Entry
        </button>
      </div>

      {/* Rescue Cases Awaiting Care Banner */}
      {rescueCases.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} color="#D97706" />
            <div>
              <h4 style={{ color: '#92400E', fontSize: '0.95rem', fontWeight: 700 }}>
                {rescueCases.length} Rescue {rescueCases.length === 1 ? 'Animal' : 'Animals'} in Provider Roster
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Cleared by Veterinarian. Daily care is active below. Once serviced & completed, transfer oversight to the Rescue Officer.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {rescueCases.map((rc) => (
              <button
                key={rc.caseId}
                type="button"
                className="btn btn-warning btn-sm"
                onClick={() => {
                  setPatientType('rescue');
                  setSelectedPetId(rc.caseId);
                  setFormData((prev) => ({ ...prev, returnToRescue: true }));
                  setIsAddModalOpen(true);
                }}
              >
                <Scissors size={14} /> Service {rc.temporaryName}
              </button>
            ))}
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Search logs by pet, owner, service, or rescue case..."
        emptyMessage="No service logs recorded."
      />

      {/* Add New Service Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Care Service Entry"
          size="md"
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="patientType"
                    checked={patientType === 'owned'}
                    onChange={() => handleTypeChange('owned')}
                  />
                  <span className="text-sm font-semibold">Registered Pet</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-warning">
                  <input
                    type="radio"
                    name="patientType"
                    checked={patientType === 'rescue'}
                    onChange={() => handleTypeChange('rescue')}
                  />
                  <span className="text-sm font-semibold">Rescue Animal</span>
                </label>
              </div>

              <label className="form-label">
                {patientType === 'owned' ? 'Select Patient Companion' : 'Select Rescue Animal'}{' '}
                <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                {patientType === 'owned'
                  ? pets.map((p) => (
                      <option key={p.petId} value={p.petId}>
                        {p.name} ({p.species} - {p.breed}) • Owner: {p.ownerName}
                      </option>
                    ))
                  : rescueCases.map((r) => (
                      <option key={r.caseId} value={r.caseId}>
                        {r.caseNumber} - {r.temporaryName} ({r.species} - {r.breed})
                      </option>
                    ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Service Rendered <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              >
                <option value="Deluxe Spa & Grooming Session">Deluxe Spa & Grooming Session</option>
                <option value="Hydrotherapy Conditioning Bath">Hydrotherapy Conditioning Bath</option>
                <option value="Full Breed Haircut & Style">Full Breed Haircut & Style</option>
                <option value="Nail Dremel Buff & Ear Flush">Nail Dremel Buff & Ear Flush</option>
                <option value="Daily Boarding & Exercise Log">Daily Boarding & Exercise Log</option>
                <option value="Rehabilitation & Foster Care Intake">Rehabilitation & Foster Care Intake</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Intake Coat & Skin Condition</label>
              <input
                type="text"
                className="form-control"
                value={formData.intakeCondition}
                onChange={(e) => setFormData({ ...formData, intakeCondition: e.target.value })}
                placeholder="e.g. Mild matting on ears, cooperative"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Services Performed & Products Used</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.servicesPerformed}
                onChange={(e) => setFormData({ ...formData, servicesPerformed: e.target.value })}
                placeholder="e.g. Oatmeal soothing shampoo, blueberry facial, sanitary cut"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Provider Observations & Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special behavioral notes, eating habits, or rehabilitation progress..."
              />
            </div>

            {patientType === 'rescue' && (
              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-warning text-xs font-bold">RESCUE WORKFLOW HANDOFF</span>
                </div>
                <p className="text-xs text-muted" style={{ lineHeight: '1.4' }}>
                  Completing this care session allows you to return oversight to the Rescue Officer with choice of placement (Foster or Adoption).
                </p>
                <label className="flex items-center gap-2 mt-2 cursor-pointer font-semibold text-xs" style={{ color: '#92400E' }}>
                  <input
                    type="checkbox"
                    id="returnToRescue"
                    checked={formData.returnToRescue}
                    onChange={(e) => setFormData({ ...formData, returnToRescue: e.target.checked })}
                  />
                  <span>Transfer Case to Rescue Officer upon completion</span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${patientType === 'rescue' && formData.returnToRescue ? 'btn-warning' : 'btn-primary'}`}
              >
                <Check size={16} />{' '}
                {patientType === 'rescue' && formData.returnToRescue
                  ? 'Complete & Transfer to Rescue Officer'
                  : 'Save Care Log'}
              </button>
            </div>
          </form>
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
              {transferTarget.intakeCondition && (
                <p className="text-xs text-muted mt-1">
                  Intake Notes: {transferTarget.intakeCondition}
                </p>
              )}
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
                      transferTargetStatus === RescueCaseStatus.IN_FOSTER
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border)',
                    backgroundColor:
                      transferTargetStatus === RescueCaseStatus.IN_FOSTER
                        ? 'rgba(14, 165, 233, 0.06)'
                        : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="transferStatus"
                    value={RescueCaseStatus.IN_FOSTER}
                    checked={transferTargetStatus === RescueCaseStatus.IN_FOSTER}
                    onChange={() => setTransferTargetStatus(RescueCaseStatus.IN_FOSTER)}
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
                      transferTargetStatus === RescueCaseStatus.READY_FOR_ADOPTION
                        ? '2px solid var(--accent)'
                        : '1px solid var(--border)',
                    backgroundColor:
                      transferTargetStatus === RescueCaseStatus.READY_FOR_ADOPTION
                        ? 'rgba(231, 111, 81, 0.06)'
                        : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="transferStatus"
                    value={RescueCaseStatus.READY_FOR_ADOPTION}
                    checked={transferTargetStatus === RescueCaseStatus.READY_FOR_ADOPTION}
                    onChange={() => setTransferTargetStatus(RescueCaseStatus.READY_FOR_ADOPTION)}
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

      {/* View Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Care Log: ${selectedLog.petName}`}
          subtitle={`Log ID: ${selectedLog.serviceLogId} • Provider: ${selectedLog.providerName || 'Dilshan Bandara'}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <span className="text-xs font-semibold text-muted">Service Type:</span>
              <p className="text-sm font-bold text-main">{selectedLog.serviceType}</p>
              <div
                className="flex items-center justify-between mt-2 pt-2 border-top text-xs text-muted"
                style={{ borderTop: '1px solid var(--border-light)' }}
              >
                <span>
                  Date: <strong>{selectedLog.serviceDate}</strong>
                </span>
                <StatusBadge status={selectedLog.status} />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-muted">Intake Condition:</span>
              <p className="text-sm text-main mt-1">{selectedLog.intakeCondition}</p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-muted">Services Performed:</span>
              <p className="text-sm text-main mt-1">{selectedLog.servicesPerformed}</p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-muted">Provider Recommendations:</span>
              <p className="text-sm text-main mt-1">{selectedLog.notes || 'No additional notes.'}</p>
            </div>

            {selectedLog.caseId && (
              <div className="mt-2 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="btn btn-warning btn-sm flex items-center gap-2"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setSelectedLog(null);
                    openTransferModal(selectedLog);
                  }}
                >
                  <UserCheck size={14} /> Transfer Companion to Rescue Officer
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
