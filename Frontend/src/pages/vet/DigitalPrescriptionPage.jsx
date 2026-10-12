import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { petApi } from '../../api/petApi';
import { careServiceApi } from '../../api/careServiceApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import { inventoryApi } from '../../api/inventoryApi';
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
  Package,
  Scissors,
} from 'lucide-react';

import { firstError, validateNumber } from '../../utils/validators';
export const DigitalPrescriptionPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Set when the vet chose "Pass to Pet Care Provider" on the consultation page
  const [handoff, setHandoff] = useState(location.state?.handoff || null);
  const [handingOver, setHandingOver] = useState(false);

  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(location.state?.handoff?.petId || '');
  const [instructions, setInstructions] = useState('Administer with morning meal. Complete full course.');
  const [items, setItems] = useState([
    { medicationName: 'Apoquel 16mg (Oclacitinib)', dosage: '1 tablet (16mg)', frequency: 'Once Daily', durationDays: 14, quantityPrescribed: 14, refillsAllowed: 1 },
  ]);

  const [prescriptions, setPrescriptions] = useState([]);
  const [inventoryMedications, setInventoryMedications] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Edit / Revoke Modals
  const [editingRx, setEditingRx] = useState(null);
  const [editInstructionsText, setEditInstructionsText] = useState('');
  const [rxToRevoke, setRxToRevoke] = useState(null);
  const [revokeReason, setRevokeReason] = useState('Clinical response achieved; therapy revised.');

  const loadData = async () => {
    try {
      const [allPets, rxList, invList] = await Promise.allSettled([
        petApi.getPets(),
        prescriptionApi.getPrescriptions(),
        inventoryApi.getInventory(),
      ]);
      if (allPets.status === 'fulfilled' && allPets.value) {
        setPets(allPets.value);
        if (allPets.value.length > 0 && !selectedPetId) setSelectedPetId(allPets.value[0].petId);
      }
      if (rxList.status === 'fulfilled' && rxList.value) {
        setPrescriptions(rxList.value);
      }
      if (invList.status === 'fulfilled' && invList.value) {
        setInventoryMedications(
          invList.value.filter((i) => i.category === 'Pharmaceuticals' || i.category === 'Vaccines')
        );
      }
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

  // Hands the pet over to the chosen Pet Care Provider by opening a care service log in their queue
  const passToProvider = async (prescription) => {
    if (!handoff) return;
    setHandingOver(true);
    try {
      const medications = prescription
        ? (prescription.items || items).map((i) => `${i.medicationName} - ${i.dosage || 'as directed'}, ${i.frequency}, ${i.durationDays} days`).join('; ')
        : '';
      const notes = [
        handoff.consultationId && `Consultation ${handoff.consultationId}`,
        handoff.diagnosis && `Diagnosis: ${handoff.diagnosis}`,
        prescription ? `Prescription ${prescription.prescriptionId}: ${medications}` : 'No prescription issued',
      ].filter(Boolean).join(' | ').slice(0, 1000);
      await careServiceApi.createServiceLog({
        petId: handoff.petId,
        petName: handoff.petName,
        serviceType: 'Post-Consultation Care',
        intakeCondition: (handoff.findings || 'Examined and cleared by the veterinarian').slice(0, 1000),
        servicesPerformed: (handoff.treatmentPlan || 'Follow the veterinary treatment plan').slice(0, 1000),
        notes,
        providerId: handoff.providerId,
        providerName: handoff.providerName,
        status: 'CheckedIn',
        returnToRescue: false,
      });
      showToast(
        'Transferred to Pet Care Provider',
        `${handoff.petName} has been passed to ${handoff.providerName} with the consultation${prescription ? ' and prescription' : ''} details.`,
        'success'
      );
      setHandoff(null);
      navigate('/vet/dashboard', { replace: true, state: {} });
    } catch (err) {
      showToast('Hand-Over Failed', err.message, 'error');
    } finally {
      setHandingOver(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemErrors = items.map((item, idx) => {
      const n = `Medication ${idx + 1}`;
      return firstError(
        !item.medicationName ? `${n}: please choose a medication` : null,
        validateNumber(item.durationDays, { label: `${n} duration`, required: true, min: 1, max: 365, integer: true, unit: 'days' }),
        validateNumber(item.quantityPrescribed, { label: `${n} quantity`, required: true, min: 1, max: 1000, integer: true }),
        validateNumber(item.refillsAllowed, { label: `${n} refills`, min: 0, max: 10, integer: true }),
      );
    });
    const prescriptionError = check(
      !selectedPetId ? 'Please select the patient for this prescription' : null,
      items.length === 0 ? 'Please add at least one medication' : null,
      ...itemErrors,
    );
    if (prescriptionError) {
      showToast('Please Check the Prescription', prescriptionError, 'error');
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
      showToast(
        'Prescription Generated & Inventory Requisitioned',
        `Digital Rx #${created.prescriptionId} signed. Prescribed medications were automatically deducted from clinic inventory.`,
        'success'
      );
      if (handoff && handoff.petId === selectedPetId) {
        await passToProvider(created);
        return;
      }
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
      showToast('Action Required', 'Instructions cannot be empty.', 'error');
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
            {handoff && (
              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.06)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Scissors size={15} color="#D97706" />
                  <strong className="text-sm" style={{ color: '#92400E' }}>
                    {handoff.petName} is going to {handoff.providerName}
                  </strong>
                </div>
                <p className="text-xs text-muted mb-3">
                  Sign the prescription below and the pet is passed to the Pet Care Provider with the consultation and
                  prescription details. If no medication is needed, pass the pet on without one.
                </p>
                <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={handingOver || submitting}
                    onClick={() => passToProvider(null)}
                  >
                    Pass Without a Prescription
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={handingOver || submitting}
                    onClick={() => setHandoff(null)}
                  >
                    Cancel Hand-Over
                  </button>
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Patient Companion <span className="required">*</span></label>
              <select
                className="form-select"
                value={selectedPetId}
                disabled={Boolean(handoff)}
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-muted">Medication / Drug Name</label>
                        {inventoryMedications.length > 0 && (
                          <select
                            className="form-select text-xs py-0 px-2"
                            style={{ width: 'auto', height: '24px', fontSize: '0.72rem' }}
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              handleItemChange(idx, 'medicationName', e.target.value);
                            }}
                          >
                            <option value="">-- Requisition from Clinic Stock --</option>
                            {inventoryMedications.map((m) => (
                              <option key={m.itemId} value={m.name} disabled={m.currentStock <= 0}>
                                {m.name} ({m.currentStock} {m.unit} in stock)
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <input
                        type="text"
                        list={`rx-inventory-list-${idx}`}
                        className="form-control text-sm"
                        placeholder="Drug name (e.g. Amoxicillin Clavulanate 250mg)"
                        value={item.medicationName}
                        onChange={(e) => handleItemChange(idx, 'medicationName', e.target.value)}
                        required
                      />
                      <datalist id={`rx-inventory-list-${idx}`}>
                        {inventoryMedications.map((m) => (
                          <option key={m.itemId} value={m.name}>
                            Stock: {m.currentStock} {m.unit} available
                          </option>
                        ))}
                      </datalist>

                      {/* Stock match badge */}
                      {(() => {
                        const medNameLower = (item.medicationName || '').trim().toLowerCase();
                        if (!medNameLower) return null;
                        const matched = inventoryMedications.find((m) => {
                          const mName = m.name.toLowerCase();
                          return mName.includes(medNameLower) || medNameLower.includes(mName.split(' ')[0]);
                        });
                        if (!matched) return null;
                        const isAvailable = matched.currentStock > 0;
                        return (
                          <div
                            className="mt-1 text-xs px-2 py-1 rounded flex items-center justify-between"
                            style={{
                              backgroundColor: isAvailable ? '#EFF6FF' : '#FEF2F2',
                              color: isAvailable ? '#1D4ED8' : '#B91C1C',
                              border: `1px solid ${isAvailable ? '#BFDBFE' : '#FECACA'}`,
                            }}
                          >
                            <span>
                              <strong>Clinic Stock:</strong> {matched.name} — {matched.currentStock} {matched.unit} available
                            </span>
                            <span className="font-semibold">
                              {isAvailable ? '✓ In stock' : '⚠ Out of stock'}
                            </span>
                          </div>
                        );
                      })()}
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
                marginBottom: '1rem',
                fontSize: '0.775rem',
                color: 'var(--primary-dark)',
              }}
            >
              <ShieldCheck size={16} className="inline mr-1" />
              Prescribing Doctor: <strong>{currentUser?.fullName || 'Dr. Michael Chen, DVM'}</strong> (Lic: {currentUser?.licenseNumber || 'VET-NY-84920'})
            </div>

            {/* Inventory Requisition Info */}
            <div
              className="p-3 mb-4 rounded text-xs flex items-center gap-2"
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
              }}
            >
              <Package size={16} className="shrink-0" />
              <div>
                <strong>Clinic Inventory Requisition:</strong> Prescribed medications will be requisitioned from clinic staff inventory and stock units deducted automatically upon signing.
              </div>
            </div>

            <button
              type="submit"
              className={`btn ${handoff ? 'btn-warning' : 'btn-primary'}`}
              style={{ width: '100%' }}
              disabled={submitting || handingOver}
            >
              <Check size={16} /> {handoff ? 'Sign Rx & Pass to Pet Care Provider' : 'Sign & Issue Digital Rx'}
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
                          className="btn btn-secondary btn-sm"
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
                    className="btn btn-secondary btn-sm"
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
