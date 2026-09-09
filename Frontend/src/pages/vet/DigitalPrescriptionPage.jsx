import React, { useState, useEffect } from 'react';
import { petApi } from '../../api/petApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Pill, Plus, Trash2, Check, Printer, ShieldCheck } from 'lucide-react';

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">PHARMACY DISPENSING</span>
          <h2>Digital Prescription (Rx) Generator</h2>
          <p className="text-sm text-muted">
            Build multi-item clinical prescriptions with authorized doctor digital signatures and dosage schedules.
          </p>
        </div>
      </div>

      <div className="grid-2 mb-8">
        {/* Prescription Builder Form */}
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-primary">
            <Pill size={20} /> Authorize New Prescription
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

            {/* Dynamic Items */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label text-xs font-bold uppercase text-muted mb-0">
                  Prescribed Medications & Dosages:
                </label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                  <Plus size={12} /> Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-subtle)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-primary">Item #{idx + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-danger"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="form-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Medication name (e.g. Amoxicillin Clavulanate 250mg)"
                        value={item.medicationName}
                        onChange={(e) => handleItemChange(idx, 'medicationName', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <input
                        type="text"
                        className="form-control text-xs"
                        placeholder="Dosage (e.g. 1 tab)"
                        value={item.dosage}
                        onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control text-xs"
                        placeholder="Frequency (e.g. BID / Twice Daily)"
                        value={item.frequency}
                        onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                      />
                      <input
                        type="number"
                        className="form-control text-xs"
                        placeholder="Days (e.g. 10)"
                        value={item.durationDays}
                        onChange={(e) => handleItemChange(idx, 'durationDays', Number(e.target.value))}
                      />
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
                  <span className="badge badge-success text-xs">Active Rx</span>
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
    </div>
  );
};
