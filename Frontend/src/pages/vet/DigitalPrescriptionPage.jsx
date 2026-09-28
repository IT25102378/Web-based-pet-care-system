import React, { useState, useEffect } from 'react';
import { petApi } from '../../api/petApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Pill,
  Plus,
  Trash2,
  Check,
  Printer,
  ShieldCheck,
  Edit2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export const DigitalPrescriptionPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [instructions, setInstructions] = useState('Administer with morning meal. Complete full course.');
  const [items, setItems] = useState([
    { medicationName: 'Apoquel 16mg (Oclacitinib)', dosage: '1 tablet (16mg)', frequency: 'Once Daily', durationDays: 14, quantityPrescribed: 14, refillsAllowed: 1 },
  ]);

  const [prescriptions, setPrescriptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Edit / Revoke Modals
  const [editingRx, setEditingRx] = useState(null);
  const [editInstructionsText, setEditInstructionsText] = useState('');
  const [rxToRevoke, setRxToRevoke] = useState(null);
  const [revokeReason, setRevokeReason] = useState('Clinical response achieved; therapy revised.');

  const loadData = async () => {
    try {
      const [allPets, rxList] = await Promise.all([
        petApi.getPets(),
        prescriptionApi.getPrescriptions(),
      ]);
      setPets(allPets);
      if (allPets.length > 0 && !selectedPetId) setSelectedPetId(allPets[0].petId);
      setPrescriptions(rxList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      { medicationName: '', dosage: '', frequency: 'Twice Daily', durationDays: 7, quantityPrescribed: 1, refillsAllowed: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const copy = [...items];
    copy[index][field] = value;
    setItems(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPetId || items.length === 0 || !items[0].medicationName) {
      showToast('Validation Error', 'Please select a pet and specify at least one medication.', 'error');
      return;
    }

    setSubmitting(true);
    const petObj = pets.find((p) => p.petId === selectedPetId);

    try {
      const payload = {
        consultationId: null,
        petId: selectedPetId,
        petName: petObj ? petObj.name : 'Patient',
        ownerName: petObj ? petObj.ownerName : 'Client',
        vetId: currentUser?.userId || 'USR-002',
        vetName: currentUser?.fullName || 'Dr. Michael Chen, DVM',
        vetLicense: currentUser?.licenseNumber || 'VET-NY-84920',
        instructions,
        digitalSignature: `${currentUser?.fullName || 'Dr. Michael Chen, DVM'} [Verified Electronic Signature]`,
      };

      const created = await prescriptionApi.createPrescription(payload, items);
      showToast('Prescription Generated', `Digital Rx #${created.prescriptionId} signed and archived.`, 'success');
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (rx) => {
    setEditingRx(rx);
    setEditInstructionsText(rx.instructions || '');
  };

  const handleSaveInstructions = async (e) => {
    e.preventDefault();
    if (!editInstructionsText.trim()) {
      showToast('Validation Error', 'Instructions cannot be empty.', 'error');
      return;
    }
    try {
      await prescriptionApi.updatePrescription(editingRx.prescriptionId, {
        instructions: editInstructionsText.trim(),
      });
      showToast('Prescription Updated', `Instructions revised for Rx ${editingRx.prescriptionId}.`, 'success');
      setEditingRx(null);
      loadData();
    } catch (err) {
      showToast('Update Failed', err.message || 'Could not update prescription.', 'error');
    }
  };

  const handleConfirmRevoke = async () => {
    if (!rxToRevoke) return;
    try {
      await prescriptionApi.revokePrescription(rxToRevoke.prescriptionId, revokeReason);
      showToast('Prescription Revoked', `Rx ${rxToRevoke.prescriptionId} has been cancelled/revoked.`, 'info');
      setRxToRevoke(null);
      loadData();
    } catch (err) {
      showToast('Revocation Failed', err.message || 'Could not revoke prescription.', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">CLINICAL PHARMACY</span>
          <h2>Digital Prescription (Rx) Generator</h2>
          <p className="text-sm text-muted">
            Build verified multi-item digital prescriptions with authorized doctor digital signatures and dosage schedules.
          </p>
        </div>
      </div>

      <div className="grid-2 mb-8">
        {/* Prescription Generation Form */}
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-primary">
            <Pill size={20} /> Prescribe Medications
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Patient Companion <span className="required">*</span></label>
              <select
                className="form-select"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                {pets.map((p) => (
                  <option key={p.petId} value={p.petId}>
                    {p.name} ({p.species} - {p.breed}) • Owner: {p.ownerName}
                  </option>
                ))}
              </select>
            </div>

            {/* Medication Line Items */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">Pharmaceutical Items & Dosages <span className="required">*</span></label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddItem}
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted uppercase">Medication #{idx + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-danger"
                          style={{ padding: '0.1rem 0.3rem' }}
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <div className="form-group mb-2">
                      <input
                        type="text"
                        className="form-control text-sm"
                        placeholder="Drug name (e.g. Amoxicillin Clavulanate 250mg)"
                        value={item.medicationName}
                        onChange={(e) => handleItemChange(idx, 'medicationName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid-2 mb-2">
                      <div>
                        <label className="text-xs text-muted">Dosage Specification:</label>
                        <input
                          type="text"
                          className="form-control text-xs"
                          placeholder="e.g. 1 tablet (250mg)"
                          value={item.dosage}
                          onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Frequency:</label>
                        <select
                          className="form-select text-xs"
                          value={item.frequency}
                          onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                        >
                          <option value="Once Daily">Once Daily (q24h)</option>
                          <option value="Twice Daily">Twice Daily (q12h)</option>
                          <option value="Three Times Daily">Three Times Daily (q8h)</option>
                          <option value="Every 48 Hours">Every 48 Hours (q48h)</option>
                          <option value="As Needed (PRN)">As Needed (PRN)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-3">
                      <div>
                        <label className="text-xs text-muted">Duration (Days):</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control text-xs"
                          placeholder="Days (e.g. 7)"
                          value={item.durationDays ?? 7}
                          onChange={(e) => handleItemChange(idx, 'durationDays', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Total Qty Dispensed:</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control text-xs"
                          placeholder="Qty (e.g. 14)"
                          value={item.quantityPrescribed ?? 1}
                          onChange={(e) => handleItemChange(idx, 'quantityPrescribed', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Refills Permitted:</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className="form-control text-xs"
                          placeholder="Refills (e.g. 1)"
                          value={item.refillsAllowed ?? 0}
                          onChange={(e) => handleItemChange(idx, 'refillsAllowed', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Special Administration Instructions</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {/* Doctor Signature Preview */}
            <div
              style={{
                backgroundColor: 'var(--primary-subtle)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.775rem',
                color: 'var(--primary-dark)',
              }}
            >
              <ShieldCheck size={16} className="inline mr-1" />
              Prescribing Doctor: <strong>{currentUser?.fullName || 'Dr. Michael Chen, DVM'}</strong> (Lic: {currentUser?.licenseNumber || 'VET-NY-84920'})
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              <Check size={16} /> Sign & Issue Digital Rx
            </button>
          </form>
        </div>

        {/* Issued Prescriptions Archive */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
            Recent Prescriptions Archive ({prescriptions.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {prescriptions.map((rx) => (
              <div key={rx.prescriptionId} className="card p-4" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-primary">{rx.prescriptionId}</span>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${rx.status === 'Revoked' ? 'badge-danger' : 'badge-success'} text-xs`}>
                      {rx.status === 'Revoked' ? 'Revoked' : 'Active Rx'}
                    </span>
                    {rx.status !== 'Revoked' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0.15rem 0.35rem' }}
                          title="Edit Administration Instructions"
                          onClick={() => handleOpenEdit(rx)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-danger"
                          style={{ padding: '0.15rem 0.35rem' }}
                          title="Revoke Prescription"
                          onClick={() => setRxToRevoke(rx)}
                        >
                          <XCircle size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-main">{rx.petName} (Owner: {rx.ownerName})</h4>
                <p className="text-xs text-muted mt-1">Issued by: {rx.vetName} • Date: {rx.issueDate}</p>

                <div style={{ margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {rx.items?.map((item, i) => (
                    <div key={i} className="text-xs text-main bg-subtle p-2 rounded">
                      <strong>{item.medicationName}</strong>: {item.dosage}, {item.frequency} for {item.durationDays} days (Qty: {item.quantityPrescribed})
                    </div>
                  ))}
                </div>

                {rx.instructions && (
                  <p className="text-xs text-muted mb-2 italic">
                    <strong>Instructions:</strong> {rx.instructions}
                  </p>
                )}

                {rx.status === 'Revoked' && (
                  <div className="text-xs text-danger mb-2 p-1.5 rounded" style={{ backgroundColor: '#FEF2F2' }}>
                    <strong>Revocation Reason:</strong> {rx.revocationReason || 'Cancelled by prescribing clinician.'}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-top text-xs text-muted" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <span>{rx.digitalSignature}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => window.print()}
                    title="Print prescription"
                  >
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Instructions Modal */}
      {editingRx && (
        <Modal
          isOpen={Boolean(editingRx)}
          onClose={() => setEditingRx(null)}
          title={`Edit Instructions – Rx ${editingRx.prescriptionId}`}
        >
          <form onSubmit={handleSaveInstructions}>
            <p className="text-xs text-muted mb-3">
              Update administration instructions for patient <strong>{editingRx.petName}</strong>:
            </p>
            <div className="form-group">
              <label className="form-label">Special Administration Instructions <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={4}
                value={editInstructionsText}
                onChange={(e) => setEditInstructionsText(e.target.value)}
                required
              />
            </div>
            <div className="modal-actions flex justify-end gap-3 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingRx(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Instructions
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Revoke Prescription Modal */}
      {rxToRevoke && (
        <Modal
          isOpen={Boolean(rxToRevoke)}
          onClose={() => setRxToRevoke(null)}
          title="Revoke / Cancel Prescription"
        >
          <div className="p-2">
            <div className="flex items-center gap-3 mb-4 text-danger">
              <AlertTriangle size={28} />
              <div>
                <h4 className="text-base font-bold text-main">Confirm Prescription Revocation</h4>
                <p className="text-xs text-muted">
                  Are you sure you want to revoke Rx <strong>{rxToRevoke.prescriptionId}</strong> for <strong>{rxToRevoke.petName}</strong>?
                </p>
              </div>
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Clinical Revocation Reason <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Patient allergic reaction or therapy completed early"
                required
              />
            </div>
            <div className="modal-actions flex justify-end gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setRxToRevoke(null)}>
                Keep Active
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmRevoke}>
                <XCircle size={16} /> Revoke Prescription
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
