import React, { useState, useEffect } from 'react';
import { petApi } from '../../api/petApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Syringe, Plus, Check, Calendar } from 'lucide-react';

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
    if (!selectedPetId || !vaccineName || !batchNumber) {
      showToast('Validation Error', 'All vaccine fields are required.', 'error');
      return;
    }

    setSubmitting(true);
    const petObj = pets.find((p) => p.petId === selectedPetId);

    try {
      await petApi.addVaccination({
        petId: selectedPetId,
        petName: petObj ? petObj.name : 'Patient',
        vaccineName,
        batchNumber,
        administeredDate,
        nextDueDate,
        administeredBy: currentUser?.fullName || 'Dr. Michael Chen, DVM',
      });

      showToast('Vaccination Recorded', `Booster saved for ${petObj?.name}. Next due: ${nextDueDate}`, 'success');
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
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
                <option value="Rabies 3-Year Canine/Feline">Rabies 3-Year Canine/Feline</option>
                <option value="DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)">DHPP 5-in-1 Canine</option>
                <option value="Bordetella (Kennel Cough) Oral/SubQ">Bordetella (Kennel Cough)</option>
                <option value="FVRCP (Feline Viral Rhinotracheitis, Calici, Panleukopenia)">FVRCP Feline Core</option>
                <option value="Feline Leukemia (FeLV)">Feline Leukemia (FeLV)</option>
                <option value="Canine Lyme Disease Vaccine">Canine Lyme Disease Vaccine</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lot / Batch Number <span className="required">*</span></label>
              <input
                type="text"
                className="form-control font-mono"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Administered Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={administeredDate}
                  onChange={(e) => setAdministeredDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Due / Booster Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
              <Check size={16} /> Save Immunization Entry
            </button>
          </form>
        </div>

        {/* Info Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card p-6" style={{ backgroundColor: 'var(--primary-subtle)', border: '1px solid rgba(42, 140, 130, 0.2)' }}>
            <h4 className="text-sm font-bold text-primary mb-2">Immunization Protocol Guidelines:</h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Always check patient allergy records for previous vaccine reactions prior to injection.</li>
              <li>Rabies certificates require the batch number and doctor license number to be registered on state database.</li>
              <li>Booster reminders are dispatched automatically to the pet owner's notification bell 30 days before next due date.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Vaccine Records DataTable */}
      <DataTable
        columns={columns}
        data={vaccinations}
        searchPlaceholder="Search vaccinations by pet, vaccine name, batch..."
        emptyMessage="No vaccination records on file."
      />
    </div>
  );
};
