import React, { useState, useEffect } from 'react';
import { rescueApi } from '../../api/rescueApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { RescueCaseStatus } from '../../types';
import { Heart, Globe, EyeOff, Eye, Check } from 'lucide-react';
import { PublishListingModal } from '../../components/common/PublishListingModal';

export const AdoptionListingsPage = () => {
  const { showToast } = useToast();
  const [cases, setCases] = useState([]);
  const [selectedCaseForPublish, setSelectedCaseForPublish] = useState(null);

  const loadCases = async () => {
    const list = await rescueApi.getRescueCases();
    setCases(list);
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleToggleListing = async (c) => {
    const updatedStatus = !c.isPublishedForAdoption;
    
    if (updatedStatus && c.status !== RescueCaseStatus.READY_FOR_ADOPTION && c.status !== RescueCaseStatus.IN_FOSTER) {
      showToast('Publication Error', 'Only rescue cases in foster care or marked ready can be published to the public gallery.', 'error');
      return;
    }

    try {
      await rescueApi.updateRescueCase(c.caseId, { 
        status: RescueCaseStatus.READY_FOR_ADOPTION,
        isPublishedForAdoption: updatedStatus 
      });
      showToast(
        updatedStatus ? 'Published' : 'Unpublished',
        `${c.temporaryName}'s listing visibility updated on public website.`,
        'info'
      );
      loadCases();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-warning mb-1">PUBLIC VISIBILITY</span>
          <h2>Adoption Listings Manager</h2>
          <p className="text-sm text-muted">
            Control which rescue companions appear on the public adoptable pets gallery for prospective adopters. Pets received from care providers or fosters can be published directly with custom profiles.
          </p>
        </div>
      </div>

      <div className="grid-3">
        {cases.map((c) => {
          const isEligibleToList = c.status === RescueCaseStatus.READY_FOR_ADOPTION || c.status === RescueCaseStatus.IN_FOSTER;

          return (
            <div key={c.caseId} className="card p-4">
              <div style={{ height: '160px', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                <img
                  src={c.coverPhotoUrl}
                  alt={c.temporaryName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                  <StatusBadge status={c.status} />
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontSize: '1.15rem' }}>{c.temporaryName}</h3>
                <span
                  className={`badge ${c.isPublishedForAdoption ? 'badge-success' : 'badge-secondary'}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {c.isPublishedForAdoption ? 'Live on Website' : 'Hidden'}
                </span>
              </div>

              <p className="text-xs text-muted mb-4" style={{ minHeight: '36px', lineHeight: '1.4' }}>
                {c.description}
              </p>

              {c.isPublishedForAdoption ? (
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => handleToggleListing(c)}
                >
                  <EyeOff size={14} /> Unpublish from Public
                </button>
              ) : isEligibleToList ? (
                <button
                  type="button"
                  className="btn btn-sm btn-accent"
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600 }}
                  onClick={() => setSelectedCaseForPublish(c)}
                >
                  <Heart size={14} fill="#FFFFFF" /> List for Adoption
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  style={{ width: '100%', cursor: 'not-allowed', opacity: 0.5 }}
                  disabled
                  title="Animal must complete medical assessment and foster stage before public listing."
                >
                  Publish to Public Gallery
                </button>
              )}
            </div>
          );
        })}
      </div>

      <PublishListingModal
        isOpen={!!selectedCaseForPublish}
        onClose={() => setSelectedCaseForPublish(null)}
        rescueCase={selectedCaseForPublish}
        onSuccess={loadCases}
      />
    </div>
  );
};
