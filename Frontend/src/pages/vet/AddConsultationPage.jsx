import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { petApi } from '../../api/petApi';
import { consultationApi } from '../../api/consultationApi';
import { rescueApi } from '../../api/rescueApi';
import { careServiceApi } from '../../api/careServiceApi';
import { userApi } from '../../api/userApi';
import { RescueCaseStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Check, Activity, Pill, ArrowRight, UserCheck, Heart, Scissors } from 'lucide-react';

import { validateNumber, validateText, validateNotPastDate, todayISO } from '../../utils/validators';
import { useFieldErrors } from '../../utils/useFieldErrors';
export const AddConsultationPage = () => {
  const { currentUser } = useAuth();
  const { check, errorFor } = useFieldErrors();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [patientType, setPatientType] = useState('owned');
  const [pets, setPets] = useState([]);
  const [rescueCases, setRescueCases] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  // Pet Care Providers
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');

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
    passToProvider: true,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const queryParams = new URLSearchParams(location.search);
      const inboundApptId = queryParams.get('apptId');
      if (inboundApptId) {
        setAppointmentId(inboundApptId);
      }

      const [petList, rescueList] = await Promise.all([
        petApi.getPets(),
        rescueApi.getRescueCases()
      ]);
      const awaitingRescues = (rescueList || []).filter(
        r => r.status === RescueCaseStatus.IN_TREATMENT || r.status === RescueCaseStatus.INTAKE
      );
      setPets(petList || []);
      setRescueCases(awaitingRescues);

      // Load Pet Care Providers
      try {
        const providerList = await userApi.getUsers({ role: 'PetCareProvider' });
        const activeProviders = (providerList || []).filter(u => u.status === 'Active');
        if (activeProviders.length > 0) {
          setProviders(activeProviders);
          setSelectedProviderId(activeProviders[0].userId);
        } else {
          const fallbacks = [
            { userId: 'USR-016', fullName: 'Eshani (Pet Care Provider)' },
            { userId: 'USR-004', fullName: 'Nimali Fernando (Grooming Specialist)' },
          ];
          setProviders(fallbacks);
          setSelectedProviderId(fallbacks[0].userId);
        }
      } catch (e) {
        const fallbacks = [
          { userId: 'USR-016', fullName: 'Eshani (Pet Care Provider)' },
          { userId: 'USR-004', fullName: 'Nimali Fernando (Grooming Specialist)' },
        ];
        setProviders(fallbacks);
        setSelectedProviderId(fallbacks[0].userId);
      }

      // If opened via Dashboard "Start Assessment" button, auto-select the rescue case
      const inboundCaseId = location.state?.rescueCaseId;
      if (inboundCaseId) {
        const matchedCase = awaitingRescues.find(r => r.caseId === inboundCaseId) || (rescueList || []).find(r => r.caseId === inboundCaseId);
        if (matchedCase) {
          setPatientType('rescue');
          setSelectedPetId(matchedCase.caseId);
          setFormData(prev => ({ ...prev, rescueMedicalSummary: matchedCase.medicalSummary || '', passToProvider: true }));
        } else if (petList && petList.length > 0) {
          setSelectedPetId(petList[0].petId);
        }
      } else if (petList && petList.length > 0) {
        setSelectedPetId(petList[0].petId);
      }
    };
    fetchData();
  }, []);

  const handleTypeChange = (type) => {
    setPatientType(type);
    if (type === 'owned' && pets.length > 0) {
      setSelectedPetId(pets[0].petId);
      setFormData(prev => ({ ...prev, rescueMedicalSummary: '', passToProvider: true }));
    } else if (type === 'rescue' && rescueCases.length > 0) {
      const firstRescue = rescueCases[0];
      setSelectedPetId(firstRescue.caseId);
      setFormData(prev => ({ ...prev, rescueMedicalSummary: firstRescue.medicalSummary || '', passToProvider: true }));
    } else {
      setSelectedPetId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const consultationError = check(
      !selectedPetId ? 'Please select the patient for this consultation' : null,
      ['formData.temperatureC', formData.temperatureC, validateNumber(formData.temperatureC, { label: 'Temperature', min: 30, max: 45, unit: 'degrees Celsius' })],
      ['formData.heartRateBpm', formData.heartRateBpm, validateNumber(formData.heartRateBpm, { label: 'Heart rate', min: 20, max: 400, integer: true, unit: 'bpm' })],
      ['formData.respiratoryRateBpm', formData.respiratoryRateBpm, validateNumber(formData.respiratoryRateBpm, { label: 'Respiratory rate', min: 5, max: 200, integer: true, unit: 'breaths per minute' })],
      ['formData.weightKg', formData.weightKg, validateNumber(formData.weightKg, { label: 'Weight', greaterThanZero: true, max: 500, unit: 'kg' })],
      ['formData.assessmentDiagnosis', formData.assessmentDiagnosis, validateText(formData.assessmentDiagnosis, { label: 'Assessment and diagnosis', required: true, min: 5, max: 2000 })],
      ['formData.treatmentPlan', formData.treatmentPlan, validateText(formData.treatmentPlan, { label: 'Treatment plan', required: true, min: 5, max: 2000 })],
      ['formData.followUpDate', formData.followUpDate, validateNotPastDate(formData.followUpDate, { label: 'Follow-up date' })],
    );
    if (consultationError) {
      showToast('Please Check the Consultation Record', consultationError, 'error');
      return;
    }

    setSubmitting(true);
    let created;

    try {
      if (patientType === 'rescue') {
        const rescueObj = rescueCases.find((r) => r.caseId === selectedPetId) || (await rescueApi.getRescueCaseById(selectedPetId));
        created = await consultationApi.createConsultation({
          ...formData,
          caseId: selectedPetId,
          petId: null,
          petName: rescueObj ? rescueObj.temporaryName : 'Rescue Patient',
          vetId: currentUser?.userId || 'USR-002',
          vetName: currentUser?.fullName || 'Dr. Michael Chen, DVM',
        });

        const chosenProvider = providers.find((p) => p.userId === selectedProviderId) || {
          userId: selectedProviderId || 'USR-016',
          fullName: 'Pet Care Provider',
        };

        // Always update rescue case status: if passToProvider is true -> ReadyForFoster with assigned provider, otherwise InTreatment
        const updates = {
          status: formData.passToProvider ? RescueCaseStatus.READY_FOR_FOSTER : RescueCaseStatus.IN_TREATMENT,
        };
        if (formData.passToProvider) {
          updates.assignedProviderId = chosenProvider.userId;
          updates.assignedProviderName = chosenProvider.fullName;
        }
        if (formData.rescueMedicalSummary) {
          updates.medicalSummary = formData.rescueMedicalSummary;
        }
        await rescueApi.updateRescueCase(selectedPetId, updates);

        await rescueApi.addProgressLog(selectedPetId, {
          title: formData.passToProvider 
            ? `Veterinary assessment completed. Case transferred to Pet Care Provider: ${chosenProvider.fullName}.` 
            : `Veterinary Consultation: ${formData.assessmentDiagnosis}`,
          logType: 'Medical',
          notes: formData.treatmentPlan,
          loggedBy: currentUser?.fullName || 'Dr. Michael Chen, DVM',
        });

        if (formData.passToProvider) {
          try {
            // Create a care service log assigned to selected Pet Care Provider
            await careServiceApi.createServiceLog({
              caseId: selectedPetId,
              petName: rescueObj ? rescueObj.temporaryName : 'Rescue Patient',
              serviceType: 'Rehabilitation & Foster Care Intake',
              intakeCondition: formData.objectiveFindings || 'Veterinary Assessment Cleared',
              servicesPerformed: formData.treatmentPlan || 'Foster intake grooming and health evaluation',
              notes: [
                formData.rescueMedicalSummary && `Medical Summary: ${formData.rescueMedicalSummary}`,
                formData.assessmentDiagnosis && `Diagnosis: ${formData.assessmentDiagnosis}`,
              ].filter(Boolean).join(' | ') || '',
              ownerName: 'Rescue Organization',
              vetId: currentUser?.userId,
              vetName: currentUser?.fullName,
              providerId: chosenProvider.userId,
              providerName: chosenProvider.fullName,
              status: 'CheckedIn',
              returnToRescue: true,
              serviceDate: new Date().toISOString().split('T')[0],
            });
          } catch (logErr) {
            console.warn('Care service log creation notice:', logErr?.message);
          }
        }
      } else {
        const petObj = pets.find((p) => p.petId === selectedPetId);
        created = await consultationApi.createConsultation({
          ...formData,
          appointmentId: appointmentId || undefined,
          petId: selectedPetId,
          petName: petObj ? petObj.name : 'Patient',
          vetId: currentUser?.userId || 'USR-002',
          vetName: currentUser?.fullName || 'Dr. Michael Chen, DVM',
        });

        // Registered pet going on to a Pet Care Provider: the hand-over is completed on the
        // prescription page, once the vet has issued (or skipped) the prescription.
        if (formData.passToProvider) {
          const chosenProvider = providers.find((p) => p.userId === selectedProviderId) || {
            userId: selectedProviderId || 'USR-016',
            fullName: 'Pet Care Provider',
          };
          showToast(
            'Consultation Recorded',
            `Medical report saved (Ref: ${created?.consultationId || 'N/A'}). Issue the prescription to pass ${petObj ? petObj.name : 'the pet'} to ${chosenProvider.fullName}.`,
            'success'
          );
          navigate('/vet/prescriptions', {
            state: {
              handoff: {
                petId: selectedPetId,
                petName: petObj ? petObj.name : 'Patient',
                providerId: chosenProvider.userId,
                providerName: chosenProvider.fullName,
                consultationId: created?.consultationId || '',
                diagnosis: formData.assessmentDiagnosis,
                treatmentPlan: formData.treatmentPlan,
                findings: formData.objectiveFindings,
              },
            },
          });
          return;
        }
      }

      if (patientType === 'rescue' && formData.passToProvider) {
        const chosenProvider = providers.find((p) => p.userId === selectedProviderId);
        showToast(
          '✅ Transferred to Pet Care Provider',
          `Medical report saved. ${rescueCases.find(r => r.caseId === selectedPetId)?.temporaryName || selectedPetId} has been transferred to ${chosenProvider?.fullName || 'Pet Care Provider'}. Issue a prescription if needed.`,
          'success'
        );
        // Route vet to prescriptions page for the rescue case (optional step)
        navigate('/vet/prescriptions', { state: { rescueCaseId: selectedPetId } });
      } else {
        showToast(
          'Consultation Recorded',
          `Clinical medical report saved (Ref: ${created?.consultationId || 'N/A'}).`,
          'success'
        );
        navigate(patientType === 'rescue' ? '/vet/dashboard' : '/vet/prescriptions');
      }
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
          <span className="badge badge-primary mb-1">CLINICAL ASSESSMENT</span>
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
                backgroundColor: 'rgba(245, 158, 11, 0.06)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              {/* Pipeline visualization */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--primary)', color: '#fff', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>
                  <Stethoscope size={13} /> Veterinarian
                </div>
                <ArrowRight size={16} color="#D97706" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: formData.passToProvider ? '#D97706' : 'var(--border)', color: formData.passToProvider ? '#fff' : 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.25s' }}>
                  <Scissors size={13} /> Pet Care Provider
                </div>
                <ArrowRight size={16} color="#D97706" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, border: '1px solid var(--border)' }}>
                  <Heart size={13} /> Rescue Officer
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label text-xs">Updated Medical Summary for Rescue Records</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.rescueMedicalSummary || ''}
                  onChange={(e) => setFormData({ ...formData, rescueMedicalSummary: e.target.value })}
                  placeholder="Update the animal's overall medical profile for the rescue officer and care provider..."
                />
              </div>

              {/* Required Transfer Decision — Radio instead of hidden checkbox */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-warning mb-2">Next Step After Assessment *</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      border: formData.passToProvider ? '2px solid #D97706' : '1px solid var(--border)',
                      backgroundColor: formData.passToProvider ? 'rgba(217, 119, 6, 0.06)' : '#fff',
                    }}
                  >
                    <input
                      type="radio"
                      name="passToProvider"
                      checked={formData.passToProvider === true}
                      onChange={() => setFormData({ ...formData, passToProvider: true })}
                      style={{ marginTop: '2px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2">
                        <Scissors size={14} color="#D97706" />
                        <strong className="text-sm" style={{ color: '#92400E' }}>Pass to Pet Care Provider</strong>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Animal is medically cleared. Grooming, rehabilitation & behavioral care will be arranged by the Pet Care Provider before returning to Rescue Officer.
                      </p>

                      {formData.passToProvider && (
                        <div
                          className="mt-3 pt-3"
                          style={{ borderTop: '1px dashed rgba(217, 119, 6, 0.3)' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="form-label text-xs font-bold" style={{ color: '#92400E', marginBottom: '0.35rem' }}>
                            Choose Pet Care Provider <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select text-sm"
                            value={selectedProviderId}
                            onChange={(e) => setSelectedProviderId(e.target.value)}
                            required={formData.passToProvider}
                            style={{ backgroundColor: '#fff' }}
                          >
                            {providers.map((p) => (
                              <option key={p.userId} value={p.userId}>
                                {p.fullName || p.name} {p.businessName ? `(${p.businessName})` : ''}
                              </option>
                            ))}
                          </select>
                          <span className="text-xs text-muted mt-1 block">
                            Assigned provider will manage foster bathing, rehabilitation, and care intake.
                          </span>
                        </div>
                      )}
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      border: formData.passToProvider === false ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: formData.passToProvider === false ? 'var(--primary-subtle)' : '#fff',
                    }}
                  >
                    <input
                      type="radio"
                      name="passToProvider"
                      checked={formData.passToProvider === false}
                      onChange={() => setFormData({ ...formData, passToProvider: false })}
                      style={{ marginTop: '2px' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} color="var(--primary)" />
                        <strong className="text-sm text-main">Keep Under Veterinary Observation</strong>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Animal requires further veterinary monitoring. Case remains In Treatment — do not pass to Provider yet.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {patientType === 'owned' && (
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.06)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--primary)', color: '#fff', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>
                  <Stethoscope size={13} /> Consultation
                </div>
                <ArrowRight size={16} color="#D97706" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--primary)', color: '#fff', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700 }}>
                  <Pill size={13} /> Prescription
                </div>
                <ArrowRight size={16} color="#D97706" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: formData.passToProvider ? '#D97706' : 'var(--border)', color: formData.passToProvider ? '#fff' : 'var(--text-muted)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.25s' }}>
                  <Scissors size={13} /> Pet Care Provider
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-warning mb-2">Next Step After Consultation *</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: formData.passToProvider ? '2px solid #D97706' : '1px solid var(--border)',
                    backgroundColor: formData.passToProvider ? 'rgba(217, 119, 6, 0.06)' : '#fff',
                  }}
                >
                  <input
                    type="radio"
                    name="ownedPassToProvider"
                    checked={formData.passToProvider === true}
                    onChange={() => setFormData({ ...formData, passToProvider: true })}
                    style={{ marginTop: '2px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                      <Scissors size={14} color="#D97706" />
                      <strong className="text-sm" style={{ color: '#92400E' }}>Pass to Pet Care Provider</strong>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      After the consultation and prescription, the pet goes to the Pet Care Provider for grooming and follow-up care.
                    </p>

                    {formData.passToProvider && (
                      <div className="mt-3 pt-3" style={{ borderTop: '1px dashed rgba(217, 119, 6, 0.3)' }}>
                        <label className="form-label text-xs font-bold" style={{ color: '#92400E', marginBottom: '0.35rem' }}>
                          Choose Pet Care Provider <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select text-sm"
                          value={selectedProviderId}
                          onChange={(e) => setSelectedProviderId(e.target.value)}
                          required={formData.passToProvider}
                          style={{ backgroundColor: '#fff' }}
                        >
                          {providers.map((p) => (
                            <option key={p.userId} value={p.userId}>
                              {p.fullName || p.name} {p.businessName ? `(${p.businessName})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: formData.passToProvider === false ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: formData.passToProvider === false ? 'var(--primary-subtle)' : '#fff',
                  }}
                >
                  <input
                    type="radio"
                    name="ownedPassToProvider"
                    checked={formData.passToProvider === false}
                    onChange={() => setFormData({ ...formData, passToProvider: false })}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} color="var(--primary)" />
                      <strong className="text-sm text-main">Return to Owner</strong>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      No further care is needed. The pet goes home after the consultation and prescription.
                    </p>
                  </div>
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
                {errorFor('formData.temperatureC', formData.temperatureC)}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">Heart Rate (BPM)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.heartRateBpm}
                  onChange={(e) => setFormData({ ...formData, heartRateBpm: Number(e.target.value) })}
                />
                {errorFor('formData.heartRateBpm', formData.heartRateBpm)}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label text-xs">Respiratory Rate (RPM)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.respiratoryRateBpm}
                  onChange={(e) => setFormData({ ...formData, respiratoryRateBpm: Number(e.target.value) })}
                />
                {errorFor('formData.respiratoryRateBpm', formData.respiratoryRateBpm)}
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
                {errorFor('formData.weightKg', formData.weightKg)}
              </div>
            </div>
          </div>

          {/* Clinical Assessment Fields */}
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
            {errorFor('formData.assessmentDiagnosis', formData.assessmentDiagnosis)}
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
            {errorFor('formData.treatmentPlan', formData.treatmentPlan)}
          </div>

          <div className="form-group">
            <label className="form-label">Recommended Follow-up Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.followUpDate}
              min={todayISO()}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
            {errorFor('formData.followUpDate', formData.followUpDate)}
          </div>

          <button
            type="submit"
            className={`btn btn-lg ${formData.passToProvider ? 'btn-warning' : 'btn-primary'}`}
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting}
          >
            <Check size={18} />
            {submitting
              ? 'Recording...'
              : patientType === 'rescue' && formData.passToProvider
              ? 'Save Consultation & Transfer to Pet Care Provider'
              : formData.passToProvider
              ? 'Save Consultation & Prescribe Before Hand-Over'
              : 'Save Consultation & Proceed to Prescription'}
          </button>
        </form>
      </div>
    </div>
  );
};
