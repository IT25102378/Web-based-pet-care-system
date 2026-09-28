import React, { useState, useEffect } from 'react';
import { petApi } from '../../api/petApi';
import { consultationApi } from '../../api/consultationApi';
import { rescueApi } from '../../api/rescueApi';
import { RescueCaseStatus } from '../../types';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { Search, PawPrint, FileText, Syringe, Eye, Stethoscope } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PatientSearchPage = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const [list, rescueList] = await Promise.all([
        petApi.getPets(),
        rescueApi.getRescueCases()
      ]);
      const mappedRescues = rescueList
        .filter(r => r.status === RescueCaseStatus.IN_TREATMENT)
        .map(r => ({
          isRescue: true,
          petId: null,
          caseId: r.caseId,
        name: r.temporaryName,
        species: r.species,
        breed: r.breed,
        microchipId: r.microchipId,
        ownerName: 'Rescue Organization',
        imageUrl: r.coverPhotoUrl,
        ageYears: r.estimatedAge,
        weightKg: 'Unknown',
        allergies: 'See Medical Summary',
        gender: r.gender || 'Unknown',
        dateOfBirth: 'Unknown',
        medicalNotes: r.medicalSummary,
        originalCase: r
      }));
      setPets([...list, ...mappedRescues]);
    };
    fetchPatients();
  }, []);

  const handleInspect = async (pet) => {
    setSelectedPet(pet);
    let consults = [];
    if (pet.isRescue) {
      consults = await rescueApi.getRescueCaseConsultations(pet.caseId);
    } else {
      consults = await consultationApi.getConsultations({ petId: pet.petId });
    }
    setConsultations(consults);
  };

  const columns = [
    {
      header: 'Patient Companion',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.imageUrl}
            alt={row.name}
            style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
          />
          <div>
            <div className="font-bold text-sm text-main">
              {row.name}
              {row.isRescue && <span className="badge badge-warning text-xs ml-2">Rescue Case</span>}
            </div>
            <div className="text-xs text-muted">{row.species} • {row.breed}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Microchip ID',
      key: 'microchipId',
      render: (row) => <span className="font-mono text-xs text-primary">{row.microchipId}</span>,
    },
    {
      header: 'Owner',
      key: 'ownerName',
      sortable: true,
      render: (row) => <span className="text-xs font-semibold">{row.ownerName}</span>,
    },
    {
      header: 'Age & Weight',
      key: 'ageYears',
      render: (row) => (
        <span className="text-xs">
          {row.ageYears && String(row.ageYears).includes('year') ? row.ageYears : `${row.ageYears} yrs`} ({row.weightKg} kg)
        </span>
      ),
    },
    {
      header: 'Allergies',
      key: 'allergies',
      render: (row) => (
        <span className={`text-xs ${row.allergies !== 'None' && row.allergies !== 'See Medical Summary' ? 'text-danger font-semibold' : 'text-muted'}`}>
          {row.allergies || 'None'}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleInspect(row)}
        >
          <Eye size={14} /> Full Record
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">PATIENT ROSTER</span>
          <h2>Patient & Rescue Assessment Search</h2>
          <p className="text-sm text-muted">
            Find registered patients or rescue cases awaiting veterinary assessment. View medical history, allergies, and prior clinical records.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={pets}
        searchPlaceholder="Search patients by name, microchip, owner..."
        emptyMessage="No patient companions found."
      />

      {/* Patient Record Modal */}
      {selectedPet && (
        <Modal
          isOpen={!!selectedPet}
          onClose={() => setSelectedPet(null)}
          title={`Medical Record: ${selectedPet.name} (${selectedPet.species})`}
          subtitle={`Microchip: ${selectedPet.microchipId} • ${selectedPet.isRescue ? `Rescue Case #${selectedPet.originalCase.caseNumber}` : `Owner: ${selectedPet.ownerName}`}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {selectedPet.isRescue && (
              <div style={{ backgroundColor: 'var(--warning-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <h4 className="text-xs font-bold uppercase text-warning mb-2">Rescue Case Context</h4>
                <div className="grid-2 text-sm text-main gap-2">
                  <div><strong>Intake Date:</strong> {selectedPet.originalCase.intakeDate}</div>
                  <div><strong>Location:</strong> {selectedPet.originalCase.rescueLocation}</div>
                  <div className="flex items-center gap-1"><strong>Status:</strong> <StatusBadge status={selectedPet.originalCase.status} /></div>
                  <div><strong>Severity:</strong> {selectedPet.originalCase.conditionSeverity}</div>
                </div>
              </div>
            )}

            <div className="grid-3" style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span className="text-xs text-muted">Breed & Gender:</span>
                <p className="text-sm font-bold text-main">{selectedPet.breed} ({selectedPet.gender})</p>
              </div>
              <div>
                <span className="text-xs text-muted">Date of Birth:</span>
                <p className="text-sm text-main">{selectedPet.dateOfBirth} ({selectedPet.ageYears} yrs)</p>
              </div>
              <div>
                <span className="text-xs text-muted">Weight:</span>
                <p className="text-sm font-bold text-primary">{selectedPet.weightKg} kg</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-danger">Recorded Allergies:</span>
              <p className="text-sm text-danger font-semibold mt-1">{selectedPet.allergies || 'None'}</p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-muted">Clinical Notes & History:</span>
              <p className="text-sm text-main mt-1">{selectedPet.medicalNotes || 'No specific notes.'}</p>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-2">Past Consultations on File ({consultations.length})</h4>
              {consultations.length > 0 ? (
                consultations.map((c) => (
                  <div
                    key={c.consultationId}
                    style={{
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.5rem',
                      borderLeft: '3px solid var(--primary)',
                    }}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-primary mb-1">
                      <span>{c.assessmentDiagnosis}</span>
                      <span>{new Date(c.consultationDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-muted">{c.treatmentPlan}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted">No historical consultations recorded.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
