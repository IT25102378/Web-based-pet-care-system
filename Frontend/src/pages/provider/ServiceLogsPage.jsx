import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { careServiceApi } from '../../api/careServiceApi';
import { petApi } from '../../api/petApi';
import { rescueApi } from '../../api/rescueApi';
import { RescueCaseStatus } from '../../types';
import { mockStore } from '../../data/mockStore';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, Plus, Scissors, Check, Eye, AlertTriangle, ArrowRight } from 'lucide-react';

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
        careServiceApi.getServiceLogs()
      ]);
      const awaitingCare = rescueList.filter(r => r.status === RescueCaseStatus.READY_FOR_FOSTER);
      setPets(petList);
      setRescueCases(awaitingCare);
      setLogs(logList);
      
      // Auto-select rescue case if passed via navigation state
      const inboundCaseId = location.state?.rescueCaseId;
      if (inboundCaseId) {
        const matched = awaitingCare.find(r => r.caseId === inboundCaseId) || rescueList.find(r => r.caseId === inboundCaseId);
        if (matched) {
          setPatientType('rescue');
          setSelectedPetId(matched.caseId);
          setFormData(prev => ({ ...prev, returnToRescue: true }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPetId) {
      showToast('Validation Error', 'Please select a patient companion or rescue animal.', 'error');
      return;
    }
    
    try {
      if (patientType === 'rescue') {
        const rescueObj = rescueCases.find((r) => r.caseId === selectedPetId) || (await rescueApi.getRescueCaseById(selectedPetId));
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
          // Transition state machine: ReadyForFoster -> InFoster
          await rescueApi.updateRescueCase(selectedPetId, { status: RescueCaseStatus.IN_FOSTER });
          
          await rescueApi.addProgressLog(selectedPetId, {
            title: 'Pet care/rehabilitation completed. Rescue case returned to Rescue Officer.',
            logType: 'Behavioral',
            notes: formData.servicesPerformed + (formData.notes ? ` - ${formData.notes}` : ''),
            loggedBy: currentUser?.fullName || 'Dilshan Bandara (Pet Care Provider)',
          });

          // Dispatch in-app notification to Rescue Officer
          mockStore.insertItem('notifications', {
            notificationId: `NTF-${Date.now()}`,
            userId: 'USR-006',
            type: 'Rescue',
            title: 'Rescue Animal Returned from Care Provider',
            message: `${rescueObj ? rescueObj.temporaryName : 'Rescue animal'} has completed care/grooming with ${currentUser?.fullName || 'Pet Care Provider'} and is returned to rescue oversight.`,
            isRead: false,
            link: `/rescue/cases/${selectedPetId}`,
            createdAt: new Date().toISOString(),
          });

          showToast('Case Returned to Rescue', `${rescueObj ? rescueObj.temporaryName : 'Rescue animal'} status changed to In Foster Care and returned to Rescue Officer.`, 'success');
        } else {
          await rescueApi.addProgressLog(selectedPetId, {
            title: `Care Service Logged: ${formData.serviceType}`,
            logType: 'Behavioral',
            notes: formData.servicesPerformed + (formData.notes ? ` - ${formData.notes}` : ''),
            loggedBy: currentUser?.fullName || 'Dilshan Bandara (Pet Care Provider)',
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
      setFormData(prev => ({ ...prev, returnToRescue: false }));
    } else if (type === 'rescue' && rescueCases.length > 0) {
      setSelectedPetId(rescueCases[0].caseId);
      setFormData(prev => ({ ...prev, returnToRescue: true }));
    } else {
      setSelectedPetId('');
    }
  };

  const columns = [
    {
      header: 'Log ID',
      key: 'serviceLogId',
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.serviceLogId}</span>,
    },
    {
      header: 'Patient Companion',
      key: 'petName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm text-main">{row.petName}</div>
          <div className="text-xs text-muted">Owner: {row.ownerName}</div>
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
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setSelectedLog(row)}
        >
          <Eye size={14} /> Full Log
        </button>
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
            Document intake conditions, skin/coat treatments, behavioral traits, and dietary adherence.
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
                {rescueCases.length} Rescue {rescueCases.length === 1 ? 'Animal' : 'Animals'} Awaiting Care & Handoff
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Cleared by Veterinarian for foster/grooming rehabilitation. Once serviced, return to the Rescue Officer.
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
        searchPlaceholder="Search logs by pet, owner, service..."
        emptyMessage="No service logs recorded."
      />

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
                {patientType === 'owned' ? 'Select Patient Companion' : 'Select Rescue Animal'} <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                {patientType === 'owned' ? (
                  pets.map((p) => (
                    <option key={p.petId} value={p.petId}>
                      {p.name} ({p.species} - {p.breed}) • Owner: {p.ownerName}
                    </option>
                  ))
                ) : (
                  rescueCases.map((r) => (
                    <option key={r.caseId} value={r.caseId}>
                      {r.caseNumber} - {r.temporaryName} ({r.species} - {r.breed})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Rendered <span className="required">*</span></label>
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
                  Completing this care session transitions the rescue animal to <strong>In Foster Care</strong> and returns oversight to the Rescue Officer for adoption clearance.
                </p>
                <label className="flex items-center gap-2 mt-2 cursor-pointer font-semibold text-xs" style={{ color: '#92400E' }}>
                  <input 
                    type="checkbox" 
                    id="returnToRescue"
                    checked={formData.returnToRescue}
                    onChange={(e) => setFormData({ ...formData, returnToRescue: e.target.checked })}
                  />
                  <span>Return Case to Rescue Officer upon saving care entry</span>
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
                <Check size={16} /> {patientType === 'rescue' && formData.returnToRescue ? 'Complete Care & Return to Rescue Officer' : 'Save Care Log'}
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
          subtitle={`Log ID: ${selectedLog.serviceLogId} • Provider: ${selectedLog.providerName}`}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <span className="text-xs font-semibold text-muted">Service Type:</span>
              <p className="text-sm font-bold text-main">{selectedLog.serviceType}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-top text-xs text-muted" style={{ borderTop: '1px solid var(--border-light)' }}>
                <span>Date: <strong>{selectedLog.serviceDate}</strong></span>
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
          </div>
        </Modal>
      )}
    </div>
  );
};
