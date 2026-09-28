import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentApi } from '../../api/appointmentApi';
import { petApi } from '../../api/petApi';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { UserPlus, CheckCircle, Clock, AlertTriangle, ArrowRight, Stethoscope, Sparkles, PawPrint, Database } from 'lucide-react';

export const WalkInRegistrationPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const vets = [
    { vetId: 'USR-002', name: 'Dr. Sachini Wijesinghe, BVSc', title: 'Small Animal Surgery & Internal Medicine' },
    { vetId: 'USR-008', name: 'Dr. Michael Chen, DVM', title: 'Emergency Care & Critical Triage' },
    { vetId: 'USR-009', name: 'Dr. Amanda Ramirez, DVM', title: 'Feline Specialist & Dermatology' },
  ];

  const [formData, setFormData] = useState({
    petId: null,
    ownerId: null,
    ownerName: '',
    ownerPhone: '',
    petName: '',
    species: 'Dog',
    breed: '',
    serviceType: 'Emergency / Triage',
    vetName: 'Dr. Sachini Wijesinghe, BVSc',
    vetId: 'USR-002',
    reason: '',
    symptoms: '',
    severity: 'Moderate',
  });

  const [allPets, setAllPets] = useState([]);
  const [petSuggestions, setPetSuggestions] = useState([]);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const petDropdownRef = useRef(null);

  useEffect(() => {
    petApi.getPets().then((res) => setAllPets(res || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (petDropdownRef.current && !petDropdownRef.current.contains(e.target)) {
        setShowPetDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePetSearch = (query) => {
    setFormData((prev) => ({ ...prev, petName: query }));
    if (!query.trim()) {
      setPetSuggestions([]);
      setShowPetDropdown(false);
      return;
    }
    const q = query.toLowerCase().trim();
    const matched = allPets.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.ownerName && p.ownerName.toLowerCase().includes(q))
    );
    setPetSuggestions(matched);
    setShowPetDropdown(matched.length > 0);
  };

  const handleSelectPet = (pet) => {
    setFormData((prev) => ({
      ...prev,
      petId: pet.petId || null,
      ownerId: pet.ownerId || null,
      petName: pet.name,
      species: pet.species || 'Dog',
      breed: pet.breed || '',
      ownerName: pet.ownerName || prev.ownerName,
      ownerPhone: pet.emergencyContact ? pet.emergencyContact.split('-').pop().trim() : prev.ownerPhone,
    }));
    setShowPetDropdown(false);
    showToast('Patient Autofilled', `Loaded ${pet.name} (${pet.species}) owned by ${pet.ownerName || 'Client'}`, 'info');
  };

  const [createdToken, setCreatedToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.petName || !formData.reason || !formData.species) {
      showToast('Validation Error', 'Client name, pet name, species, and visit reason are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const created = await appointmentApi.registerWalkIn({
        ownerName: formData.ownerName.trim(),
        ownerPhone: formData.ownerPhone.trim(),
        petName: formData.petName.trim(),
        species: formData.species,
        breed: formData.breed ? formData.breed.trim() : '',
        serviceType: formData.serviceType,
        vetName: formData.vetName,
        vetId: formData.vetId,
        reason: formData.reason.trim(),
        symptoms: formData.symptoms ? formData.symptoms.trim() : '',
        severity: formData.severity,
        petId: formData.petId || null,
        ownerId: formData.ownerId || null,
        appointmentDate: now.toISOString().split('T')[0],
        timeSlot: timeStr,
        notes: `Walk-in patient [${formData.severity}]. Registered at front desk.`,
      });

      setCreatedToken(created);
      showToast('Walk-in Registered', `Token #${created.tokenNumber} issued to ${formData.petName}`, 'success');
    } catch (err) {
      showToast('Registration Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', color: '#1F2937' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge mb-1" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
            FRONT DESK TRIAGE
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>Walk-In Patient Registration</h2>
          <p className="text-sm text-muted">
            Issue instant tokens for walk-in emergencies, non-scheduled vaccinations, and acute consultations.
          </p>
        </div>
      </div>

      {createdToken ? (
        <div className="card p-8 text-center" style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-xl)', border: '2px solid #E76F51' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#FFF8F3',
              color: '#E76F51',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle size={40} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>Walk-in Token Issued!</h2>
          <div
            style={{
              fontSize: '3.8rem',
              fontWeight: 900,
              color: '#E76F51',
              fontFamily: 'monospace',
              margin: '0.75rem 0',
              letterSpacing: '0.05em',
            }}
          >
            {createdToken.tokenNumber}
          </div>

          <p className="text-sm text-muted max-w-md mx-auto mb-2">
            <strong>{createdToken.petName}</strong> ({createdToken.species}{createdToken.breed ? ` • ${createdToken.breed}` : ''}) has been checked into the lobby.
          </p>
          <p className="text-xs font-semibold text-primary mb-6">
            Assigned to: {createdToken.vetName}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setCreatedToken(null);
                setFormData({
                  ownerName: '',
                  ownerPhone: '',
                  petName: '',
                  species: 'Dog',
                  breed: '',
                  serviceType: 'Emergency / Triage',
                  vetName: 'Dr. Sachini Wijesinghe, BVSc',
                  vetId: 'USR-002',
                  reason: '',
                  symptoms: '',
                  severity: 'Moderate',
                });
              }}
            >
              <UserPlus size={16} /> Register Another Walk-in
            </button>
            <button
              type="button"
              className="btn"
              style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 700 }}
              onClick={() => navigate('/staff/queue')}
            >
              <Clock size={16} /> View in Live Queue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-6" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Owner / Client Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. John Miller"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  placeholder="e.g. +94 77 123 4567"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ position: 'relative' }} ref={petDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="form-label">Companion / Pet Name <span className="required">*</span></label>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Database size={12} color="var(--primary)" /> Database Match
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={formData.petName}
                  onChange={(e) => handlePetSearch(e.target.value)}
                  onFocus={() => {
                    if (formData.petName.trim() && petSuggestions.length > 0) setShowPetDropdown(true);
                  }}
                  placeholder="Start typing pet name (e.g. Barnaby, Cleo, Milo)..."
                  required
                  autoComplete="off"
                />

                {/* Pet Suggestions Dropdown */}
                {showPetDropdown && petSuggestions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                      marginTop: '4px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.4rem 0.7rem',
                        backgroundColor: 'var(--bg-subtle)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      Registered Patients in Database ({petSuggestions.length})
                    </div>
                    {petSuggestions.map((pet) => (
                      <div
                        key={pet.petId}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectPet(pet);
                        }}
                        style={{
                          padding: '0.6rem 0.8rem',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFF8F3')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <div className="flex items-center justify-between">
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            🐾 {pet.name}
                          </span>
                          <span className="badge badge-primary text-xs">
                            {pet.species} • {pet.breed || 'Mixed'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.15rem' }}>
                          Owner: <strong>{pet.ownerName || 'Client'}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Species <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  required
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Reptile">Reptile</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Breed</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="e.g. German Shepherd"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Attending Veterinarian <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={formData.vetName}
                  onChange={(e) => {
                    const selected = vets.find((v) => v.name === e.target.value);
                    setFormData({
                      ...formData,
                      vetName: e.target.value,
                      vetId: selected ? selected.vetId : formData.vetId,
                    });
                  }}
                  required
                >
                  {vets.map((v) => (
                    <option key={v.vetId} value={v.name}>
                      {v.name} ({v.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Visit Type</label>
                <select
                  className="form-select"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                >
                  <option value="Emergency / Triage">Emergency / Triage</option>
                  <option value="Walk-in Wellness & Vaccine">Walk-in Wellness & Vaccine</option>
                  <option value="Nail Trim & Sanitary Quick Care">Nail Trim & Sanitary Quick Care</option>
                  <option value="Prescription Refill Consultation">Prescription Refill Consultation</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Triage Severity</label>
                <select
                  className="form-select"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="Low (Routine / Stable)">Low (Routine / Stable)</option>
                  <option value="Moderate (Limping / Discomfort)">Moderate (Limping / Discomfort)</option>
                  <option value="High (Acute Trauma / Respiratory)">High (Acute Trauma / Respiratory)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Chief Complaint / Reason <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Limping on right paw after playing in garden"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Observed Symptoms / Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Pain upon palpation, swelling, lethargy, fever..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-lg"
              style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 800, width: '100%', marginTop: '1rem' }}
              disabled={submitting}
            >
              <Stethoscope size={18} /> Issue Walk-in Token & Check-In Patient
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
