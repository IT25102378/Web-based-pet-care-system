import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { petApi } from '../../api/petApi';
import { consultationApi } from '../../api/consultationApi';
import { rescueApi } from '../../api/rescueApi';
import { RescueCaseStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Check, Activity, Pill, ArrowRight } from 'lucide-react';

export const AddConsultationPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [patientType, setPatientType] = useState('owned');
  const [pets, setPets] = useState([]);
  const [rescueCases, setRescueCases] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [formData, setFormData] = useState({
    temperatureC: 38.5,
    heartRateBpm: 90,
    respiratoryRateBpm: 24,
    weightKg: 12.0,
    subjectiveNotes: '',
    objectiveFindings: '',
    assessmentDiagnosis: '',
    treatmentPlan: '',
    followUpDate: '',
    rescueMedicalSummary: '',
    passToProvider: false,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [petList, rescueList] = await Promise.all([
        petApi.getPets(),
        rescueApi.getRescueCases()
      ]);
      const awaitingRescues = rescueList.filter(r => r.status === RescueCaseStatus.IN_TREATMENT);
      setPets(petList);
      setRescueCases(awaitingRescues);

      // If opened via Dashboard "Start Assessment" button, auto-select the rescue case
      const inboundCaseId = location.state?.rescueCaseId;
      if (inboundCaseId) {
        const matchedCase = awaitingRescues.find(r => r.caseId === inboundCaseId);
        if (matchedCase) {
          setPatientType('rescue');
          setSelectedPetId(matchedCase.caseId);
          setFormData(prev => ({ ...prev, rescueMedicalSummary: matchedCase.medicalSummary || '', passToProvider: false }));
        } else if (petList.length > 0) {
          setSelectedPetId(petList[0].petId);
        }
      } else if (petList.length > 0) {
        setSelectedPetId(petList[0].petId);
      }
    };
    fetchData();
  }, []);

  const handleTypeChange = (type) => {
    setPatientType(type);
    if (type === 'owned' && pets.length > 0) {
      setSelectedPetId(pets[0].petId);
      setFormData(prev => ({ ...prev, rescueMedicalSummary: '', passToProvider: false }));
    } else if (type === 'rescue' && rescueCases.length > 0) {
      const firstRescue = rescueCases[0];
      setSelectedPetId(firstRescue.caseId);
      setFormData(prev => ({ ...prev, rescueMedicalSummary: firstRescue.medicalSummary || '', passToProvider: false }));
    } else {
      setSelectedPetId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPetId || !formData.assessmentDiagnosis || !formData.treatmentPlan) {
      showToast('Validation Error', 'Diagnosis and treatment plan are required.', 'error');
      return;
    }

    setSubmitting(true);
    let created;

    try {
      if (patientType === 'rescue') {
        const rescueObj = rescueCases.find((r) => r.caseId === selectedPetId);
        created = await consultationApi.createConsultation({
          ...formData,
          caseId: selectedPetId,
          petId: null,
          petName: rescueObj ? rescueObj.temporaryName : 'Rescue Patient',
          vetId: currentUser?.userId || 'USR-002',
          vetName: currentUser?.fullName || 'Dr. Michael Chen, DVM',
        });

        if (formData.passToProvider || formData.rescueMedicalSummary !== rescueObj?.medicalSummary) {
          const updates = {};
          if (formData.passToProvider) updates.status = RescueCaseStatus.READY_FOR_FOSTER;
          if (formData.rescueMedicalSummary) updates.medicalSummary = formData.rescueMedicalSummary;
          await rescueApi.updateRescueCase(selectedPetId, updates);
        }

        await rescueApi.addProgressLog(selectedPetId, {
          title: formData.passToProvider 
            ? `Veterinary assessment completed. Case passed to Pet Care Provider.` 
            : `Veterinary Consultation: ${formData.assessmentDiagnosis}`,
          logType: 'Medical',
          notes: formData.treatmentPlan,
          loggedBy: currentUser?.fullName || 'Dr. Michael Chen, DVM',
        });
      } else {
        const petObj = pets.find((p) => p.petId === selectedPetId);
        created = await consultationApi.createConsultation({
          ...formData,
          petId: selectedPetId,
          petName: petObj ? petObj.name : 'Patient',
          vetId: currentUser?.userId || 'USR-002',
          vetName: currentUser?.fullName || 'Dr. Michael Chen, DVM',
        });
      }

      showToast('Consultation Recorded', `Clinical SOAP report saved (Ref: ${created.consultationId})`, 'success');
      // Rescue consultations return to schedule; owned-pet consultations proceed to prescriptions
      navigate(patientType === 'rescue' ? '/vet/schedule' : '/vet/prescriptions');
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">SOAP CLINICAL ENTRY</span>
          <h2>New Veterinary Consultation</h2>
          <p className="text-sm text-muted">
            Record comprehensive examination vitals, subjective client observations, clinical assessment, and treatment orders.
          </p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit}>
          {/* Patient Selector */}
          <div className="form-group mb-6">
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
                <span className="text-sm font-semibold">Rescue Patient</span>
              </label>
            </div>

            <label className="form-label">
              {patientType === 'owned' ? 'Patient Companion' : 'Rescue Case'} <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={selectedPetId}
              onChange={(e) => {
                setSelectedPetId(e.target.value);
                if (patientType === 'rescue') {
                  const r = rescueCases.find(x => x.caseId === e.target.value);
                  setFormData(prev => ({ ...prev, rescueMedicalSummary: r?.medicalSummary || '', passToProvider: false }));
                }
              }}
              required
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

          {patientType === 'rescue' && (
            <div
              style={{
                backgroundColor: 'var(--warning-subtle)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-warning mb-3">
                Update Rescue Health Status
              </h4>
              <div className="form-group mb-4">
                <label className="form-label text-xs">Updated Medical Summary</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.rescueMedicalSummary || ''}
                  onChange={(e) => setFormData({ ...formData, rescueMedicalSummary: e.target.value })}
                  placeholder="Update the animal's overall medical profile for the rescue officer..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  id="passToProvider"
                  checked={formData.passToProvider}
                  onChange={(e) => setFormData({ ...formData, passToProvider: e.target.checked })}
                />
                <label htmlFor="passToProvider" className="text-sm font-semibold cursor-pointer">
                  Complete Veterinary Assessment & Pass to Pet Care Provider
                </label>
              </div>
            </div>
          )}

          {/* Vitals Ribbon Inputs */}
          <div
            style={{
              backgroundColor: 'var(--primary-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(42, 140, 130, 0.2)',
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
              <Activity size={16} /> Patient Vital Signs
            </h4>

            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">Body Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.temperatureC}
                  onChange={(e) => setFormData({ ...formData, temperatureC: Number(e.target.value) })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">Heart Rate (BPM)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.heartRateBpm}
                  onChange={(e) => setFormData({ ...formData, heartRateBpm: Number(e.target.value) })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">Respiratory Rate (RPM)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.respiratoryRateBpm}
                  onChange={(e) => setFormData({ ...formData, respiratoryRateBpm: Number(e.target.value) })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* SOAP Fields */}
          <div className="form-group">
            <label className="form-label">
              <strong>S - Subjective:</strong> Client history & symptoms described
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.subjectiveNotes}
              onChange={(e) => setFormData({ ...formData, subjectiveNotes: e.target.value })}
              placeholder="e.g. Owner noticed scratching and redness on hind paws for 3 days..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <strong>O - Objective:</strong> Doctor physical exam findings & diagnostic imaging
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.objectiveFindings}
              onChange={(e) => setFormData({ ...formData, objectiveFindings: e.target.value })}
              placeholder="e.g. Erythema on paws, no secondary yeast infection on cytology..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <strong>A - Assessment & Diagnosis:</strong> <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.assessmentDiagnosis}
              onChange={(e) => setFormData({ ...formData, assessmentDiagnosis: e.target.value })}
              placeholder="e.g. Acute Allergic Pododermatitis"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <strong>P - Treatment Plan & Medication Orders:</strong> <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.treatmentPlan}
              onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
              placeholder="e.g. Prescribed Apoquel 16mg daily for 14 days, Chlorhexidine wash..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Recommended Follow-up Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            <Check size={18} /> Save Consultation & Proceed to Prescription
          </button>
        </form>
      </div>
    </div>
  );
};
