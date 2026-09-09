import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rescueApi } from '../../api/rescueApi';
import { useToast } from '../../context/ToastContext';
import { FileUploadField } from '../../components/common/FileUploadField';
import { RescueCaseStatus } from '../../types';
import { PlusCircle, Check, ArrowRight, ShieldAlert } from 'lucide-react';

export const RegisterRescuePage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    temporaryName: '',
    species: 'Dog',
    breed: '',
    estimatedAge: '1 year',
    gender: 'Female',
    rescueLocation: '',
    intakeDate: new Date().toISOString().split('T')[0],
    conditionSeverity: 'Moderate',
    status: RescueCaseStatus.INTAKE,
    microchipId: `98514109${Math.floor(1000000 + Math.random() * 9000000)}`,
    intakeOfficer: 'David Thorne (Rescue Officer)',
    description: '',
    medicalSummary: 'Pending initial veterinary physical & blood parasite panel.',
  });

  const [coverPhoto, setCoverPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.temporaryName || !formData.rescueLocation || !formData.breed) {
      showToast('Validation Error', 'Pet name, breed, and rescue location are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await rescueApi.createRescueCase({
        ...formData,
        coverPhotoUrl: coverPhoto?.url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80',
      });

      showToast('Rescue Case Logged', `Case #${created.caseNumber} created for ${created.temporaryName}`, 'success');
      navigate(`/rescue/cases/${created.caseId}`);
    } catch (err) {
      showToast('Registration Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-warning mb-1">INTAKE PROTOCOL</span>
          <h2>Register New Animal Rescue Case</h2>
          <p className="text-sm text-muted">
            Document field location, triage severity, temporary identifiers, and initial intake evidence.
          </p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Temporary Given Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={formData.temporaryName}
                onChange={(e) => setFormData({ ...formData, temporaryName: e.target.value })}
                placeholder="e.g. Luna / Zeus"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Species <span className="required">*</span></label>
              <select
                className="form-select"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              >
                <option value="Dog">Dog (Canine)</option>
                <option value="Cat">Cat (Feline)</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Wildlife / Exotic">Wildlife / Exotic</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Estimated Breed / Appearance <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="e.g. Australian Shepherd Mix"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender & Estimated Age</label>
              <div className="flex items-center gap-2">
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Unknown">Unknown</option>
                </select>
                <input
                  type="text"
                  className="form-control"
                  value={formData.estimatedAge}
                  onChange={(e) => setFormData({ ...formData, estimatedAge: e.target.value })}
                  placeholder="e.g. 1.5 years"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Rescue Location / Found At <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={formData.rescueLocation}
                onChange={(e) => setFormData({ ...formData, rescueLocation: e.target.value })}
                placeholder="e.g. Found near North Pine Ridge Highway 9"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Condition Severity Assessment</label>
              <select
                className="form-select"
                value={formData.conditionSeverity}
                onChange={(e) => setFormData({ ...formData, conditionSeverity: e.target.value })}
              >
                <option value="Low (Stable / Stray)">Low (Stable / Stray)</option>
                <option value="Moderate (Underweight / Dehydrated)">Moderate (Underweight / Dehydrated)</option>
                <option value="High (Critical Injury / Trauma)">High (Critical Injury / Trauma)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rescue Narrative & Circumstances</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe temperament upon approach, behavioral reactions, and surrounding circumstances..."
            />
          </div>

          <div className="mb-6">
            <FileUploadField
              label="Intake Photographic Evidence"
              hint="Upload clear photo of animal at intake. PNG, JPG up to 10MB"
              value={coverPhoto}
              onChange={setCoverPhoto}
            />
          </div>

          <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%' }} disabled={submitting}>
            <Check size={18} /> Complete Intake Registration & Open Case
          </button>
        </form>
      </div>
    </div>
  );
};
