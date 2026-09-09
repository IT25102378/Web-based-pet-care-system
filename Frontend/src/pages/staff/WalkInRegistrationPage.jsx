import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentApi } from '../../api/appointmentApi';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { UserPlus, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const WalkInRegistrationPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerName: '',
    ownerPhone: '',
    petName: '',
    species: 'Dog',
    breed: '',
    serviceType: 'Emergency / Triage',
    vetName: 'Dr. Michael Chen, DVM',
    reason: '',
    symptoms: '',
    severity: 'Moderate',
  });

  const [createdToken, setCreatedToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.petName || !formData.reason) {
      showToast('Validation Error', 'Client name, pet name, and visit reason are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await appointmentApi.registerWalkIn({
        ...formData,
        petId: null,
        ownerId: null,
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: `Walk-in severity marked: ${formData.severity}`,
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

          <p className="text-sm text-muted max-w-md mx-auto mb-6">
            <strong>{createdToken.petName}</strong> has been placed in the waiting lobby queue for{' '}
            <strong>{createdToken.vetName}</strong>.
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
                  vetName: 'Dr. Michael Chen, DVM',
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
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Companion / Pet Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  placeholder="e.g. Max"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Species & Breed</label>
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

            <div className="form-group">
              <label className="form-label">Observed Symptoms</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Pain upon palpation, swelling, lethargy..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-lg"
              style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 800, width: '100%', marginTop: '1rem' }}
              disabled={submitting}
            >
              Issue Walk-in Token & Add to Queue
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
