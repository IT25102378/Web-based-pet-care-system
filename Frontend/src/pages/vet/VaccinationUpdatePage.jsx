import React, { useState, useEffect } from 'react';
import { petApi } from '../../api/petApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Syringe,
  Plus,
  Check,
  Calendar,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const VaccinationUpdatePage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [pets, setPets] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [vaccineName, setVaccineName] = useState('Rabies 3-Year Booster');
  const [batchNumber, setBatchNumber] = useState(`RB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [administeredDate, setAdministeredDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState(
    new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);

  // Edit / Void Modals
  const [editingVac, setEditingVac] = useState(null);
  const [editFormData, setEditFormData] = useState({
    vaccineName: '',
    batchNumber: '',
    administeredDate: '',
    nextDueDate: '',
  });
  const [vacToVoid, setVacToVoid] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [allPets, vacs] = await Promise.all([
        petApi.getPets(),
        petApi.getVaccinations(),
      ]);
      setPets(allPets);
      if (allPets.length > 0 && !selectedPetId) setSelectedPetId(allPets[0].petId);
      setVaccinations(vacs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPetId || !vaccineName.trim() || !batchNumber.trim()) {
      showToast('Action Required', 'All vaccine fields are required.', 'error');
      return;
    }

    if (new Date(nextDueDate) <= new Date(administeredDate)) {
      showToast('Action Required', 'Next due date must be after administered date.', 'error');
      return;
    }

    setSubmitting(true);
    const petObj = pets.find((p) => p.petId === selectedPetId);

    try {
      await petApi.addVaccination({
        petId: selectedPetId,
        petName: petObj ? petObj.name : 'Patient',
        vaccineName: vaccineName.trim(),
        batchNumber: batchNumber.trim(),
        administeredDate,
        nextDueDate,
        administeredBy: currentUser?.fullName || 'Dr. Michael Chen, DVM',
      });

      showToast('Vaccination Recorded', `Booster saved for ${petObj?.name}. Next due: ${nextDueDate}`, 'success');
      setBatchNumber(`RB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (row) => {
    setEditingVac(row);
    setEditFormData({
      vaccineName: row.vaccineName || '',
      batchNumber: row.batchNumber || '',
      administeredDate: row.administeredDate || '',
      nextDueDate: row.nextDueDate || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.vaccineName.trim() || !editFormData.batchNumber.trim()) {
      showToast('Action Required', 'Vaccine name and batch number are required.', 'error');
      return;
    }

    if (new Date(editFormData.nextDueDate) <= new Date(editFormData.administeredDate)) {
      showToast('Action Required', 'Next due date must be after administered date.', 'error');
      return;
    }

    try {
      await petApi.updateVaccination(editingVac.vaccineId, {
        vaccineName: editFormData.vaccineName.trim(),
        batchNumber: editFormData.batchNumber.trim(),
        administeredDate: editFormData.administeredDate,
        nextDueDate: editFormData.nextDueDate,
      });

      showToast('Record Updated', `Immunization log ${editingVac.vaccineId} updated.`, 'success');
      setEditingVac(null);
      loadData();
    } catch (err) {
      showToast('Update Failed', err.message || 'Could not update record.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!vacToVoid) return;
    setIsDeleting(true);
    try {
      await petApi.deleteVaccination(vacToVoid.vaccineId);
      showToast('Record Voided', `Vaccination ${vacToVoid.vaccineId} removed from registry.`, 'info');
      setVacToVoid(null);
      loadData();
    } catch (err) {
      showToast('Delete Failed', err.message || 'Could not void record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Vaccine ID',
      key: 'vaccineId',
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.vaccineId}</span>,
    },
    {
      header: 'Patient Companion',
      key: 'petName',
      sortable: true,
      render: (row) => <span className="font-bold text-sm text-main">{row.petName}</span>,
    },
    {
      header: 'Vaccine Formula',
      key: 'vaccineName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-main">{row.vaccineName}</div>
          <div className="text-xs text-muted font-mono">Batch: {row.batchNumber}</div>
        </div>
      ),
    },
    {
      header: 'Administered Date',
      key: 'administeredDate',
      render: (row) => <span className="text-xs">{row.administeredDate}</span>,
    },
    {
      header: 'Next Due Date',
      key: 'nextDueDate',
      sortable: true,
      render: (row) => <span className="font-bold text-xs text-primary">{row.nextDueDate}</span>,
    },
    {
      header: 'Administered By',
      key: 'administeredBy',
      render: (row) => <span className="text-xs text-muted">{row.administeredBy}</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="Edit Vaccination Record"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-danger"
            title="Void / Delete Record"
            onClick={() => setVacToVoid(row)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">IMMUNIZATION RECORD</span>
          <h2>Vaccination Administration & Booster Tracker</h2>
          <p className="text-sm text-muted">
            Record newly administered core vaccines, batch serials, and automatic next-due schedule dates.
          </p>
        </div>
      </div>

      <div className="grid-2 mb-8">
        {/* Record New Vaccine Form */}
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-primary">
            <Syringe size={20} /> Record Administered Vaccine
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

            <div className="form-group">
              <label className="form-label">Vaccine Formulation <span className="required">*</span></label>
              <select
                className="form-select"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
              >
                <option value="Rabies 3-Year Booster">Rabies 3-Year Booster (Defensor 3)</option>
                <option value="DHPP Core 5-Way Canine Vaccine">DHPP Core 5-Way Canine Vaccine (Distemper, Parvo)</option>
                <option value="FVRCP Core Feline 3-Way Vaccine">FVRCP Core Feline 3-Way Vaccine (Panleukopenia)</option>
                <option value="Bordetella Bronchiseptica Oral">Bordetella Oral (Kennel Cough Prevention)</option>
                <option value="Leptospirosis 4-Strain Vaccine">Leptospirosis 4-Strain Vaccine (UltraFil)</option>
                <option value="Feline Leukemia (FeLV) Recombinant">Feline Leukemia (FeLV) Recombinant</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Manufacturer Batch / Lot Number <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. RB-2026-8492"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date Administered <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={administeredDate}
                  onChange={(e) => setAdministeredDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Due Booster Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              <Check size={16} /> Save Immunization Certificate
            </button>
          </form>
        </div>

        {/* Schedule Summary Information */}
        <div className="card p-6" style={{ backgroundColor: 'var(--bg-main)' }}>
          <h3 className="mb-3 flex items-center gap-2 text-primary">
            <Calendar size={18} /> Routine Vaccination Guidelines
          </h3>
          <p className="text-xs text-muted mb-4" style={{ lineHeight: '1.6' }}>
            PetNexus tracks preventative immunizations based on AVMA/AAHA Core Animal Guidelines.
            Booster reminder notifications are automatically queued to pet owners 14 days before their next scheduled due date.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="p-3 border rounded bg-card">
              <div className="font-bold text-xs text-main">Canine Core Schedule (Dogs)</div>
              <div className="text-xs text-muted mt-1">Rabies (Every 1–3 years) • DHPP Core (Every 3 years) • Leptospirosis (Annual)</div>
            </div>

            <div className="p-3 border rounded bg-card">
              <div className="font-bold text-xs text-main">Feline Core Schedule (Cats)</div>
              <div className="text-xs text-muted mt-1">FVRCP (Every 3 years) • Rabies (Annual/3-Year) • FeLV for outdoor access</div>
            </div>

            <div className="p-3 border rounded bg-card">
              <div className="font-bold text-xs text-main">Rescue Animal Intake Protocol</div>
              <div className="text-xs text-muted mt-1">All street animal intakes undergo mandatory quarantine check and Rabies + DHPP/FVRCP baseline shots prior to foster or adoption listing.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Immunization Registry Table */}
      <div className="card p-6">
        <h3 className="mb-4">Historical Immunization Roster ({vaccinations.length})</h3>
        <DataTable
          columns={columns}
          data={vaccinations}
          keyField="vaccineId"
          searchPlaceholder="Search vaccine ID, patient name, formula, or batch..."
        />
      </div>

      {/* Edit Vaccination Modal */}
      {editingVac && (
        <Modal
          isOpen={Boolean(editingVac)}
          onClose={() => setEditingVac(null)}
          title={`Edit Vaccination Record – ${editingVac.vaccineId}`}
        >
          <form onSubmit={handleSaveEdit}>
            <p className="text-xs text-muted mb-3">
              Patient: <strong>{editingVac.petName}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Vaccine Formula <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={editFormData.vaccineName}
                onChange={(e) => setEditFormData({ ...editFormData, vaccineName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Manufacturer Batch Number <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={editFormData.batchNumber}
                onChange={(e) => setEditFormData({ ...editFormData, batchNumber: e.target.value })}
                required
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date Administered <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={editFormData.administeredDate}
                  onChange={(e) => setEditFormData({ ...editFormData, administeredDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Next Due Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={editFormData.nextDueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, nextDueDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-actions flex justify-end gap-3 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingVac(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Void/Delete Modal */}
      {vacToVoid && (
        <Modal
          isOpen={Boolean(vacToVoid)}
          onClose={() => setVacToVoid(null)}
          title="Void / Delete Vaccination Record"
        >
          <div className="p-2">
            <div className="flex items-center gap-3 mb-4 text-warning">
              <AlertTriangle size={28} />
              <div>
                <h4 className="text-base font-bold text-main">Confirm Record Removal</h4>
                <p className="text-xs text-muted">
                  Are you sure you want to void record <strong>{vacToVoid.vaccineId}</strong> ({vacToVoid.vaccineName}) for <strong>{vacToVoid.petName}</strong>?
                </p>
              </div>
            </div>
            <div className="modal-actions flex justify-end gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setVacToVoid(null)} disabled={isDeleting}>
                Keep Record
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                <Trash2 size={16} /> {isDeleting ? 'Voiding...' : 'Void Record'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
