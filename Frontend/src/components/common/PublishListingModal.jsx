import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';
import { rescueApi } from '../../api/rescueApi';
import { adoptionApi } from '../../api/adoptionApi';
import { RescueCaseStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Heart, Globe, CheckCircle2, ShieldCheck, Tag, Sparkles } from 'lucide-react';

export const PublishListingModal = ({ isOpen, onClose, rescueCase, onSuccess }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [description, setDescription] = useState('');
  const [adoptionFee, setAdoptionFee] = useState('120');
  const [isFeeWaived, setIsFeeWaived] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [traits, setTraits] = useState({
    goodWithKids: true,
    goodWithDogs: true,
    goodWithCats: false,
    houseTrained: true,
    vaccinatedMicrochipped: true,
  });

  useEffect(() => {
    if (rescueCase) {
      const defaultBio =
        rescueCase.description ||
        `${rescueCase.temporaryName} is a wonderful, healthy ${rescueCase.breed || rescueCase.species} companion who has completed veterinary health clearance and care rehabilitation. Gentle, socialized, and looking for a loving forever home!`;
      setDescription(defaultBio);
      setIsFeeWaived(false);
      setAdoptionFee('120');
    }
  }, [rescueCase]);

  if (!rescueCase) return null;

  const handleTraitToggle = (traitKey) => {
    setTraits((prev) => ({ ...prev, [traitKey]: !prev[traitKey] }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!description.trim()) {
      showToast('Validation Error', 'Please enter an adoption story/bio for the public listing.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update rescue case to ReadyForAdoption and isPublishedForAdoption = true
      await rescueApi.updateRescueCase(rescueCase.caseId, {
        status: RescueCaseStatus.READY_FOR_ADOPTION,
        isPublishedForAdoption: true,
        description: description.trim(),
      });

      // 2. Sync / create AdoptionListing record in backend
      try {
        await adoptionApi.createListing(rescueCase.caseId);
      } catch (listingErr) {
        // If listing already exists or created by backend trigger, try updating
        try {
          await adoptionApi.updateListing(rescueCase.caseId, true);
        } catch (ignored) {}
      }

      // 3. Add milestone progress log to timeline
      await rescueApi.addProgressLog(rescueCase.caseId, {
        title: 'Listed for Public Adoption: Published to Adoptable Pets Gallery',
        logType: 'Milestone',
        notes: `Companion published live to public adoptable gallery. Adoption fee: ${
          isFeeWaived ? 'Waived (Special Drive)' : `$${adoptionFee}`
        }. Open for adoption applications.`,
        loggedBy: `${currentUser?.fullName || 'Shehan Rajapaksha'} (Rescue Officer)`,
      });

      showToast(
        'Adoption Listing Published!',
        `${rescueCase.temporaryName} is now live in the public Adoptable Pets Gallery!`,
        'success'
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast('Publishing Failed', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Publish Adoption Listing: ${rescueCase.temporaryName}`}
      subtitle={`Case #${rescueCase.caseId} • ${rescueCase.species} (${rescueCase.breed || 'Mixed'})`}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        {/* Animal Summary Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            marginBottom: '1.25rem',
          }}
        >
          {rescueCase.coverPhotoUrl ? (
            <img
              src={rescueCase.coverPhotoUrl}
              alt={rescueCase.temporaryName}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(231, 111, 81, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Heart size={28} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-base text-main">{rescueCase.temporaryName}</h4>
              <StatusBadge status={rescueCase.status} />
              <span className="badge badge-accent text-xs">Cleared for Placement</span>
            </div>
            <p className="text-xs text-muted">
              Intake Date: {rescueCase.intakeDate} • Microchip: {rescueCase.microchipId || 'Registered'}
            </p>
            {rescueCase.medicalSummary && (
              <p className="text-xs text-muted mt-1 truncate" title={rescueCase.medicalSummary}>
                <strong>Health/Care:</strong> {rescueCase.medicalSummary}
              </p>
            )}
          </div>
        </div>

        {/* Adoption Story & Bio */}
        <div className="form-group">
          <label className="form-label font-bold text-sm">
            Public Adoption Bio & Story <span className="required">*</span>
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share the companion's personality, favorite activities, and ideal home environment..."
            required
          />
          <span className="text-xs text-muted">
            This bio will be displayed directly on the public Adoptable Pets gallery for prospective adopters.
          </span>
        </div>

        {/* Behavioral & Compatibility Highlights */}
        <div className="form-group">
          <label className="form-label font-bold text-sm">Compatibility & Health Badges</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
            <label className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded border bg-white">
              <input
                type="checkbox"
                checked={traits.vaccinatedMicrochipped}
                onChange={() => handleTraitToggle('vaccinatedMicrochipped')}
              />
              <span>Vaccinated & Microchipped</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded border bg-white">
              <input
                type="checkbox"
                checked={traits.goodWithKids}
                onChange={() => handleTraitToggle('goodWithKids')}
              />
              <span>Good with Children</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded border bg-white">
              <input
                type="checkbox"
                checked={traits.goodWithDogs}
                onChange={() => handleTraitToggle('goodWithDogs')}
              />
              <span>Good with Other Dogs</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs p-2 rounded border bg-white">
              <input
                type="checkbox"
                checked={traits.houseTrained}
                onChange={() => handleTraitToggle('houseTrained')}
              />
              <span>House Trained</span>
            </label>
          </div>
        </div>

        {/* Adoption Fee Configuration */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <label className="text-xs font-bold text-main block">Adoption Placement Fee</label>
            <span className="text-xs text-muted">Includes veterinary check, vaccine passport, & microchip</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-accent">
              <input
                type="checkbox"
                checked={isFeeWaived}
                onChange={(e) => setIsFeeWaived(e.target.checked)}
              />
              <span>Waive Fee</span>
            </label>
            {!isFeeWaived && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-main">$</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '80px', padding: '0.25rem 0.5rem', height: '30px', fontSize: '0.85rem' }}
                  value={adoptionFee}
                  onChange={(e) => setAdoptionFee(e.target.value)}
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Target Workflow Alert */}
        <div
          style={{
            backgroundColor: 'rgba(231, 111, 81, 0.08)',
            border: '1px solid rgba(231, 111, 81, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} color="var(--accent)" />
            <strong className="text-xs" style={{ color: 'var(--accent)' }}>
              Public Gallery Activation
            </strong>
          </div>
          <p className="text-xs text-muted" style={{ lineHeight: '1.4' }}>
            Publishing this listing transitions status to <strong>Ready for Adoption</strong> and publishes {rescueCase.temporaryName} to the public website. Prospective pet parents can immediately submit adoption applications.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-accent flex items-center gap-2" disabled={submitting}>
            <Heart size={16} fill="#FFFFFF" /> {submitting ? 'Publishing...' : 'Publish to Public Adoption Gallery'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
