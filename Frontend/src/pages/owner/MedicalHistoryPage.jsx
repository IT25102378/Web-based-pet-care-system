import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consultationApi } from '../../api/consultationApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import { petApi } from '../../api/petApi';
import { Card } from '../../components/common/Card';
import {
  FileText,
  Pill,
  Stethoscope,
  Calendar,
  Activity,
  Heart,
  User,
  Clock,
} from 'lucide-react';

export const MedicalHistoryPage = () => {
  const { currentUser } = useAuth();
  const [pets, setPets] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!currentUser) return;
      try {
        const [userPets, allConsults, allRxs] = await Promise.all([
          petApi.getPets(currentUser.userId),
          consultationApi.getConsultations(),
          prescriptionApi.getPrescriptions(),
        ]);
        const ownedPetIds = new Set(userPets.map((p) => p.petId));
        const myConsults = allConsults.filter((c) => ownedPetIds.has(c.petId));
        const myRxs = allRxs.filter((r) => ownedPetIds.has(r.petId));
        setPets(userPets);
        setConsultations(myConsults);
        setPrescriptions(myRxs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [currentUser]);

  const filteredConsultations = consultations.filter((c) => {
    if (selectedPetId === 'ALL') return true;
    return c.petId === selectedPetId;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge mb-1" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
            CLINICAL RECORDS
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>Medical History & Prescriptions</h2>
          <p className="text-sm text-muted">
            Read-only chronological transcript of veterinary diagnoses, vital signs, and digital prescriptions.
          </p>
        </div>

        {/* Pet Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted">Filter by Pet:</label>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
          >
            <option value="ALL">All Companions</option>
            {pets.map((p) => (
              <option key={p.petId} value={p.petId}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {filteredConsultations.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <FileText size={40} style={{ margin: '0 auto 1rem', color: '#9CA3AF' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#12304A', marginBottom: '0.5rem' }}>
              No Medical Records Found
            </h3>
            <p className="text-sm text-muted">
              There are no veterinary consultations or prescriptions recorded for your selected companion(s).
            </p>
          </div>
        ) : (
          filteredConsultations.map((consult) => {
            const rxForConsult = prescriptions.find((r) => r.consultationId === consult.consultationId);

            return (
              <div key={consult.consultationId} className="card" style={{ overflow: 'hidden' }}>
              <div
                className="card-header"
                style={{
                  backgroundColor: 'var(--primary-subtle)',
                  borderBottom: '1px solid rgba(42, 140, 130, 0.2)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>
                      Clinical Exam for {consult.petName}
                    </h3>
                    <p className="text-xs text-muted">
                      Attending: <strong>{consult.vetName}</strong> • Consultation ID: {consult.consultationId}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-muted font-semibold">
                  {new Date(consult.consultationDate).toLocaleDateString()}
                </div>
              </div>

              <div className="card-body">
                {/* Vitals Ribbon */}
                <div
                  className="grid-4 mb-4"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div>
                    <span className="text-xs text-muted">Body Temperature:</span>
                    <p className="text-sm font-bold text-main">{consult.temperatureC} °C</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Heart Rate:</span>
                    <p className="text-sm font-bold text-main">{consult.heartRateBpm} BPM</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Respiratory Rate:</span>
                    <p className="text-sm font-bold text-main">{consult.respiratoryRateBpm} RPM</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Recorded Weight:</span>
                    <p className="text-sm font-bold text-main">{consult.weightKg} kg</p>
                  </div>
                </div>

                {/* SOAP Findings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted tracking-wider">
                      Assessment & Diagnosis:
                    </h4>
                    <p className="text-sm font-bold text-primary mt-1">
                      {consult.assessmentDiagnosis}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted tracking-wider">
                      Objective Findings:
                    </h4>
                    <p className="text-sm text-main mt-1">{consult.objectiveFindings}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted tracking-wider">
                      Treatment Plan:
                    </h4>
                    <p className="text-sm text-main mt-1">{consult.treatmentPlan}</p>
                  </div>
                </div>

                {/* Digital Prescription Attachment if exists */}
                {rxForConsult && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: '#FFFFFF',
                      padding: '1.25rem',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3 border-bottom pb-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <Pill size={16} />
                        <span>Digital Prescription (Rx #{rxForConsult.prescriptionId})</span>
                      </div>
                      <span className="badge badge-success text-xs">Verified Doctor Signoff</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {rxForConsult.items?.map((item) => (
                        <div
                          key={item.itemId}
                          style={{
                            padding: '0.65rem 0.85rem',
                            backgroundColor: 'var(--bg-subtle)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div>
                            <p className="text-sm font-bold text-main">{item.medicationName}</p>
                            <p className="text-xs text-muted">
                              Dosage: {item.dosage} • Frequency: {item.frequency}
                            </p>
                          </div>
                          <div className="text-xs font-semibold text-primary">
                            Duration: {item.durationDays} Days (Qty: {item.quantityPrescribed})
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-muted">
                      <span>Doctor Instructions: <strong>{rxForConsult.instructions}</strong></span>
                      <span className="font-mono text-primary">{rxForConsult.digitalSignature}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
