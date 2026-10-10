import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Edit,
  Trash2,
} from 'lucide-react';

export const ServiceLogsPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const inboundHandledRef = useRef(false);

  const [logs, setLogs] = useState([]);
  const [pets, setPets] = useState([]);
  const [rescueCases, setRescueCases] = useState([]);
  const [awaitingCareRescueCases, setAwaitingCareRescueCases] = useState([]);
  const [patientType, setPatientType] = useState('owned');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [walkinPetName, setWalkinPetName] = useState('');
  const [walkinOwnerName, setWalkinOwnerName] = useState('');

  // Edit log modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [editFormData, setEditFormData] = useState({
    serviceType: '',
    serviceDate: '',
    status: ServiceStatus.CHECKED_IN,
    intakeCondition: '',
    servicesPerformed: '',
    notes: '',
  });

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetLog, setDeleteTargetLog] = useState(null);

  // Transfer to Rescue Officer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferTargetStatus, setTransferTargetStatus] = useState(RescueCaseStatus.READY_FOR_FOSTER);
  const [transferNotes, setTransferNotes] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const initialFormState = {
    serviceType: 'Deluxe Spa & Grooming Session',
    serviceDate: new Date().toISOString().split('T')[0],
    initialStatus: ServiceStatus.CHECKED_IN,
    intakeCondition: 'Coat in good condition. Calm demeanor.',
    servicesPerformed: 'Hydro-bath, ear clean, nail dremel trim, de-shedding.',
    notes: '',
    returnToRescue: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = (type = 'owned', defaultPetId = '') => {
    setPatientType(type);
    setSelectedPetId(defaultPetId);
    setWalkinPetName('');
    setWalkinOwnerName('');
    setFormData({
      serviceType: 'Deluxe Spa & Grooming Session',
      serviceDate: new Date().toISOString().split('T')[0],
      initialStatus: type === 'rescue' ? ServiceStatus.COMPLETED : ServiceStatus.CHECKED_IN,
      intakeCondition: '',
      servicesPerformed: '',
      notes: '',
      returnToRescue: type === 'rescue',
    });
  };

  useEffect(() => {
    inboundHandledRef.current = false;
    loadData();
  }, [location.key]);

  const loadData = async () => {
    // Only capture and consume inbound navigation state ONCE per route arrival
    const shouldHandleInbound = !inboundHandledRef.current && (
      Boolean(location.state?.rescueCaseId) ||
      Boolean(location.state?.transferCaseId) ||
      Boolean(location.state?.transferLogId)
    );

    const inboundRescueId = shouldHandleInbound ? location.state?.rescueCaseId : null;
    const inboundTransferCaseId = shouldHandleInbound ? location.state?.transferCaseId : null;
    const inboundTransferLogId = shouldHandleInbound ? location.state?.transferLogId : null;

    if (shouldHandleInbound) {
      inboundHandledRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      try {
        window.history.replaceState({}, document.title);
      } catch (ignored) {}
    }

    try {
      const [petList, rescueList, logList] = await Promise.all([
        petApi.getPets(),
        rescueApi.getRescueCases(),
        careServiceApi.getServiceLogs(),
      ]);

      const completedCaseIds = new Set(
        (logList || [])
          .filter((l) => l.caseId && (l.status === ServiceStatus.COMPLETED || l.transferredToRescue || l.handedOverToRescue || l.notes?.includes('Transferred to Rescue Officer')))
          .map((l) => l.caseId)
      );

      // Only rescue animals specifically cleared by Vet and awaiting care provider intake
      const awaitingCare = (rescueList || []).filter(
        (r) => r.status === RescueCaseStatus.READY_FOR_FOSTER && !completedCaseIds.has(r.caseId)
      );
      // All active rescue animals (for dropdown selection if provider services a fostered rescue pet)
      const allActiveRescue = (rescueList || []).filter(
        (r) => r.status !== RescueCaseStatus.CLOSED && r.status !== RescueCaseStatus.ADOPTED
      );

      setPets(petList || []);
      setRescueCases(allActiveRescue);
      setAwaitingCareRescueCases(awaitingCare);

      // Merge rescue cases awaiting care that don't have a service log yet directly into daily service logs
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

      const combinedLogs = [...(logList || []), ...virtualRescueLogs];
      setLogs(combinedLogs);

      // --- Handle inbound navigation states using the synchronously-captured values ---

      if (inboundTransferCaseId || inboundTransferLogId) {
        const targetLog = combinedLogs.find(
          (l) => (inboundTransferLogId && l.serviceLogId === inboundTransferLogId) || (l.caseId === inboundTransferCaseId)
        );
        if (targetLog) {
          openTransferModal(targetLog);
          return;
        }
      }

      if (inboundRescueId) {
        const matched = allActiveRescue.find((r) => r.caseId === inboundRescueId) || (rescueList || []).find((r) => r.caseId === inboundRescueId);
        if (matched) {
          // Check if this case already has a real service log (created by vet when they passed to provider)
          const existingLog = combinedLogs.find((l) => l.caseId === inboundRescueId && !l.isVirtual);

          if (existingLog) {
            // Log already exists — open Transfer modal so provider can complete & hand off
            openTransferModal(existingLog);
          } else {
            // No log yet — open Add modal pre-filled for this rescue case
            setPatientType('rescue');
            setSelectedPetId(matched.caseId);
            setFormData({
              serviceType: 'Rehabilitation & Grooming Care Session',
              serviceDate: new Date().toISOString().split('T')[0],
              initialStatus: ServiceStatus.COMPLETED,
              intakeCondition: matched.medicalSummary || 'Cleared by Vet',
              servicesPerformed: 'Hydro-bath, ear clean, nail trimming, hygiene clip.',
              notes: '',
              returnToRescue: true,
            });
            setIsAddModalOpen(true);
          }
          return;
        }
      }

      if ((petList || []).length > 0 && !selectedPetId) {
        setSelectedPetId(petList[0].petId);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
        openTransferModal({ ...row, serviceLogId: activeLogId, status: ServiceStatus.COMPLETED, isVirtual: false });
      }

      await loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  // Open Transfer to Rescue Officer modal
  const openTransferModal = (row) => {
    setTransferTarget(row);
    setTransferTargetStatus(RescueCaseStatus.READY_FOR_FOSTER);
    setTransferNotes(
      `Care & grooming rehabilitation completed by Pet Care Provider (${currentUser?.fullName || 'Dilshan Bandara'}). Companion groomed, calm, and ready for handoff.`
    );
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    inboundHandledRef.current = true;
    navigate(location.pathname, { replace: true, state: {} });
    try {
      window.history.replaceState({}, document.title);
    } catch (ignored) {}
    setIsTransferModalOpen(false);
    setTransferTarget(null);
  };

  // Confirm Transfer to Rescue Officer
  const handleConfirmTransfer = async (e) => {
    e?.preventDefault();
    if (!transferTarget?.caseId || isTransferring) return;

    setIsTransferring(true);
    inboundHandledRef.current = true;
    navigate(location.pathname, { replace: true, state: {} });
    try {
      window.history.replaceState({}, document.title);
    } catch (ignored) {}

    try {
      // 1. Ensure service log is marked Completed AND transferred
      if (!transferTarget.isVirtual && transferTarget.serviceLogId) {
        try {
          await careServiceApi.updateServiceLog(transferTarget.serviceLogId, {
            status: ServiceStatus.COMPLETED,
            transferredToRescue: true,
            handedOverToRescue: true,
            returnToRescue: false,
            notes: transferNotes,
          });
        } catch (ignored) {}
      } else if (transferTarget.isVirtual) {
        try {
          await careServiceApi.createServiceLog({
            caseId: transferTarget.caseId,
            petId: null,
            petName: transferTarget.petName,
            ownerName: 'Rescue Organization',
            serviceType: transferTarget.serviceType || 'Rehabilitation & Foster Care Intake',
            intakeCondition: transferTarget.intakeCondition || 'Cleared by Vet',
            servicesPerformed: transferTarget.servicesPerformed || 'Completed grooming & care',
            notes: transferNotes,
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

      // 2. Update Rescue Case status to ReadyForFoster or ReadyForAdoption
      await rescueApi.updateRescueCase(transferTarget.caseId, {
        status: transferTargetStatus,
      });

      const destinationLabel =
        transferTargetStatus === RescueCaseStatus.READY_FOR_ADOPTION
          ? 'Ready for Adoption'
          : 'Ready for Foster Care';

      // 3. Add timeline entry
      await rescueApi.addProgressLog(transferTarget.caseId, {
        title: `Care Completed: Transferred to Rescue Officer (${destinationLabel})`,
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
          message: `${transferTarget.petName} care completed and transferred to Rescue Officer with status ${destinationLabel}.`,
          isRead: false,
          link: `/rescue/cases/${transferTarget.caseId}`,
          createdAt: new Date().toISOString(),
        });
      }

      showToast(
        'Transferred to Rescue Officer',
        `${transferTarget.petName} has been transferred to the Rescue Officer (${destinationLabel}).`,
        'success'
      );

      setIsTransferModalOpen(false);
      setTransferTarget(null);
      await loadData();
    } catch (err) {
      showToast('Transfer Failed', err.message, 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (patientType !== 'walkin' && !selectedPetId) {
      showToast('Validation Error', 'Please select a patient companion or rescue animal.', 'error');
      return;
    }
    if (patientType === 'walkin' && !walkinPetName.trim()) {
      showToast('Validation Error', 'Please enter the patient companion name.', 'error');
      return;
    }
    if (!formData.serviceType.trim()) {
      showToast('Validation Error', 'Please specify the service rendered.', 'error');
      return;
    }
    if (!formData.intakeCondition.trim() || !formData.servicesPerformed.trim() || !formData.notes.trim()) {
      showToast('Validation Error', 'Please fill in all service details (Intake Condition, Services Performed, and Notes).', 'error');
      return;
    }

    try {
      if (patientType === 'rescue') {
        const rescueObj =
          rescueCases.find((r) => r.caseId === selectedPetId) || (await rescueApi.getRescueCaseById(selectedPetId));

        const effectiveStatus = formData.returnToRescue ? ServiceStatus.COMPLETED : formData.initialStatus;

        const createdLog = await careServiceApi.createServiceLog({
          serviceType: formData.serviceType.trim(),
          serviceDate: formData.serviceDate || new Date().toISOString().split('T')[0],
          intakeCondition: formData.intakeCondition.trim(),
          servicesPerformed: formData.servicesPerformed.trim(),
          notes: formData.notes.trim(),
          caseId: selectedPetId,
          petId: null,
          petName: rescueObj ? rescueObj.temporaryName : 'Rescue Animal',
          ownerName: 'Rescue Organization',
          providerId: currentUser?.userId || 'USR-004',
          providerName: currentUser?.fullName || 'Dilshan Bandara',
          status: effectiveStatus,
          returnToRescue: formData.returnToRescue,
        });

        // Close add modal
        setIsAddModalOpen(false);
        await loadData();

        if (formData.returnToRescue) {
          // Open the transfer modal directly for decision with the created log ID
          openTransferModal({
            serviceLogId: createdLog.serviceLogId,
            caseId: selectedPetId,
            petName: rescueObj ? rescueObj.temporaryName : 'Rescue Animal',
            serviceType: formData.serviceType,
            intakeCondition: formData.intakeCondition,
            status: ServiceStatus.COMPLETED,
            isVirtual: false,
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
      } else if (patientType === 'walkin') {
        await careServiceApi.createServiceLog({
          serviceType: formData.serviceType.trim(),
          serviceDate: formData.serviceDate || new Date().toISOString().split('T')[0],
          intakeCondition: formData.intakeCondition.trim(),
          servicesPerformed: formData.servicesPerformed.trim(),
          notes: formData.notes.trim(),
          status: formData.initialStatus || ServiceStatus.CHECKED_IN,
          petId: null,
          petName: walkinPetName.trim(),
          ownerName: walkinOwnerName.trim() || 'Walk-in Client',
          ownerId: null,
          providerId: currentUser?.userId || 'USR-004',
          providerName: currentUser?.fullName || 'Dilshan Bandara',
        });
        showToast('Log Saved', `Care service log recorded for ${walkinPetName.trim()}.`, 'success');
        setIsAddModalOpen(false);
        await loadData();
      } else {
        const petObj = pets.find((p) => p.petId === selectedPetId);
        await careServiceApi.createServiceLog({
          serviceType: formData.serviceType.trim(),
          serviceDate: formData.serviceDate || new Date().toISOString().split('T')[0],
          intakeCondition: formData.intakeCondition.trim(),
          servicesPerformed: formData.servicesPerformed.trim(),
          notes: formData.notes.trim(),
          status: formData.initialStatus || ServiceStatus.CHECKED_IN,
          petId: selectedPetId,
          petName: petObj ? petObj.name : 'Patient',
          ownerName: petObj ? petObj.ownerName : 'Client',
          ownerId: petObj ? petObj.ownerId : null,
          providerId: currentUser?.userId || 'USR-004',
          providerName: currentUser?.fullName || 'Dilshan Bandara',
        });
        showToast('Log Saved', 'Care service log has been recorded successfully.', 'success');
        setIsAddModalOpen(false);
        await loadData();
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleTypeChange = (type) => {
    setPatientType(type);
    if (type === 'owned' && pets.length > 0) {
      setSelectedPetId(pets[0].petId);
      setFormData((prev) => ({
        ...prev,
        returnToRescue: false,
        initialStatus: ServiceStatus.CHECKED_IN,
      }));
    } else if (type === 'rescue' && rescueCases.length > 0) {
      setSelectedPetId(rescueCases[0].caseId);
      setFormData((prev) => ({
        ...prev,
        returnToRescue: true,
        initialStatus: ServiceStatus.COMPLETED,
      }));
    } else {
      setSelectedPetId('');
    }
  };

  const openEditModal = (log) => {
    setEditingLog(log);
    setEditFormData({
      serviceType: log.serviceType || 'Deluxe Spa & Grooming Session',
      serviceDate: log.serviceDate || new Date().toISOString().split('T')[0],
      status: log.status || ServiceStatus.CHECKED_IN,
      intakeCondition: log.intakeCondition || '',
      servicesPerformed: log.servicesPerformed || '',
      notes: log.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingLog) return;
    if (!editFormData.serviceType.trim()) {
      showToast('Validation Error', 'Please specify the service type.', 'error');
      return;
    }

    try {
      if (!editingLog.isVirtual) {
        await careServiceApi.updateServiceLog(editingLog.serviceLogId, {
          serviceType: editFormData.serviceType.trim(),
          serviceDate: editFormData.serviceDate,
          status: editFormData.status,
          intakeCondition: editFormData.intakeCondition.trim(),
          servicesPerformed: editFormData.servicesPerformed.trim(),
          notes: editFormData.notes.trim(),
        });
      }
      showToast('Log Updated', `Service log ${editingLog.serviceLogId} updated successfully.`, 'success');
      setIsEditModalOpen(false);
      setEditingLog(null);
      await loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const openDeleteModal = (log) => {
    setDeleteTargetLog(log);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetLog) return;
    try {
      if (!deleteTargetLog.isVirtual) {
        await careServiceApi.deleteServiceLog(deleteTargetLog.serviceLogId);
      }
      showToast('Log Removed', `Service log ${deleteTargetLog.serviceLogId} removed successfully.`, 'success');
      setIsDeleteModalOpen(false);
      setDeleteTargetLog(null);
      await loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
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
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedLog(row)}
            title="View Details"
          >
            <Eye size={13} />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm text-primary"
            onClick={() => openEditModal(row)}
            title="Edit Log Details"
          >
            <Edit size={13} />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm text-danger"
            onClick={() => openDeleteModal(row)}
            title="Delete Log"
          >
            <Trash2 size={13} />
          </button>

          {row.caseId && (row.transferredToRescue || row.handedOverToRescue || row.notes?.includes('Transferred to Rescue Officer')) ? null : row.caseId && (
            <button
              type="button"
              className={`btn btn-sm ${
                row.status === ServiceStatus.COMPLETED ? 'btn-warning' : 'btn-ghost'
              }`}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.5rem',
                border: '1px solid var(--warning)',
              }}
              onClick={() => openTransferModal(row)}
              title="Transfer companion back to Rescue Officer"
            >
              <UserCheck size={13} /> Handoff
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

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            resetForm(patientType, patientType === 'owned' ? (pets[0]?.petId || '') : (rescueCases[0]?.caseId || ''));
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={16} /> New Service Entry
        </button>
      </div>

      {/* Rescue Cases Awaiting Care Banner */}
      {awaitingCareRescueCases.length > 0 && (
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
                {awaitingCareRescueCases.length} Rescue {awaitingCareRescueCases.length === 1 ? 'Animal' : 'Animals'} Awaiting Initial Care Intake
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Cleared by Veterinarian. Daily care is active below. Once serviced & completed, transfer oversight to the Rescue Officer.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {awaitingCareRescueCases.map((rc) => {
              // If vet already created a handoff log for this case, go straight to Transfer
              const existingLog = logs.find((l) => l.caseId === rc.caseId && !l.isVirtual);
              return (
                <button
                  key={rc.caseId}
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={() => {
                    if (existingLog) {
                      // Vet created a log — provider just needs to complete & transfer
                      openTransferModal(existingLog);
                    } else {
                      // No log yet — open Add Care modal
                      setPatientType('rescue');
                      setSelectedPetId(rc.caseId);
                      setFormData({
                        serviceType: 'Rehabilitation & Grooming Care Session',
                        serviceDate: new Date().toISOString().split('T')[0],
                        initialStatus: ServiceStatus.COMPLETED,
                        intakeCondition: rc.medicalSummary || 'Cleared by Vet',
                        servicesPerformed: 'Hydro-bath, ear clean, nail trimming, hygiene clip.',
                        notes: '',
                        returnToRescue: true,
                      });
                      setIsAddModalOpen(true);
                    }
                  }}
                >
                  <Scissors size={14} /> {existingLog ? `Transfer ${rc.temporaryName}` : `Service ${rc.temporaryName}`}
                </button>
              );
            })}
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
              <div className="flex items-center gap-4 mb-3 flex-wrap">
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
                <label className="flex items-center gap-2 cursor-pointer text-primary">
                  <input
                    type="radio"
                    name="patientType"
                    checked={patientType === 'walkin'}
                    onChange={() => handleTypeChange('walkin')}
                  />
                  <span className="text-sm font-semibold">Walk-in / Custom Patient</span>
                </label>
              </div>

              {patientType === 'walkin' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">
                      Patient / Pet Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={walkinPetName}
                      onChange={(e) => setWalkinPetName(e.target.value)}
                      placeholder="e.g. Bella"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Owner Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={walkinOwnerName}
                      onChange={(e) => setWalkinOwnerName(e.target.value)}
                      placeholder="e.g. Kasun Silva (Walk-in)"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <label className="form-label">
                    {patientType === 'owned' ? 'Select Patient Companion' : 'Select Rescue Animal'}{' '}
                    <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Choose a patient --</option>
                    {patientType === 'owned'
                      ? pets.map((p) => (
                          <option key={p.petId} value={p.petId}>
                            {p.name} ({p.species} - {p.breed}) • Owner: {p.ownerName}
                          </option>
                        ))
                      : rescueCases.map((r) => (
                          <option key={r.caseId} value={r.caseId}>
                            {r.caseNumber} - {r.temporaryName} ({r.species} - {r.breed}) [{r.status}]
                          </option>
                        ))}
                  </select>
                  {patientType === 'owned' && pets.length === 0 && (
                    <p className="text-xs text-warning mt-1">
                      No registered pets found. You can switch to <strong>Rescue Animal</strong> or <strong>Walk-in / Custom Patient</strong> above.
                    </p>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Service Rendered <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  required
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
                <label className="form-label">
                  Service Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.serviceDate}
                  onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Service Status</label>
              <select
                className="form-select"
                value={formData.initialStatus}
                onChange={(e) => setFormData({ ...formData, initialStatus: e.target.value })}
                disabled={patientType === 'rescue' && formData.returnToRescue}
              >
                <option value={ServiceStatus.CHECKED_IN}>Checked-In</option>
                <option value={ServiceStatus.IN_PROGRESS}>In Progress</option>
                <option value={ServiceStatus.READY_FOR_PICKUP}>Ready for Pickup</option>
                <option value={ServiceStatus.COMPLETED}>Completed</option>
              </select>
              {patientType === 'rescue' && formData.returnToRescue && (
                <span className="text-xs text-muted mt-1 block">
                  Automatically set to Completed when transferring to Rescue Officer.
                </span>
              )}
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
          onClose={handleCloseTransferModal}
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
                onClick={handleCloseTransferModal}
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

      {/* Edit Log Modal */}
      {isEditModalOpen && editingLog && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingLog(null);
          }}
          title={`Edit Care Service Log (${editingLog.serviceLogId})`}
          subtitle={`Patient: ${editingLog.petName} • Owner: ${editingLog.ownerName || 'N/A'}`}
          size="md"
        >
          <form onSubmit={handleEditSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Service Rendered <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.serviceType}
                  onChange={(e) => setEditFormData({ ...editFormData, serviceType: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Service Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={editFormData.serviceDate}
                  onChange={(e) => setEditFormData({ ...editFormData, serviceDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Service Status Milestone</label>
              <select
                className="form-select"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value={ServiceStatus.CHECKED_IN}>Checked-In</option>
                <option value={ServiceStatus.IN_PROGRESS}>In Progress</option>
                <option value={ServiceStatus.READY_FOR_PICKUP}>Ready for Pickup</option>
                <option value={ServiceStatus.COMPLETED}>Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Intake Condition</label>
              <input
                type="text"
                className="form-control"
                value={editFormData.intakeCondition}
                onChange={(e) => setEditFormData({ ...editFormData, intakeCondition: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Services Performed</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={editFormData.servicesPerformed}
                onChange={(e) => setEditFormData({ ...editFormData, servicesPerformed: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Provider Notes & Observations</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingLog(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex items-center gap-2">
                <Check size={16} /> Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteTargetLog && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteTargetLog(null);
          }}
          title="Confirm Log Deletion"
          size="sm"
        >
          <div className="p-2">
            <div className="flex items-center gap-3 mb-3 text-danger">
              <AlertTriangle size={24} />
              <strong className="text-base">Are you sure you want to delete this log?</strong>
            </div>
            <p className="text-xs text-muted mb-4">
              Service Log <strong>{deleteTargetLog.serviceLogId}</strong> for patient{' '}
              <strong>{deleteTargetLog.petName}</strong> will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTargetLog(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger flex items-center gap-1.5"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={15} /> Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
