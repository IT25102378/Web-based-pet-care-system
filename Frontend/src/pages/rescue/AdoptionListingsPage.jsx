import React, { useState, useEffect } from 'react';
import { rescueApi } from '../../api/rescueApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { RescueCaseStatus } from '../../types';
import { Heart, Globe, EyeOff, Eye, Check } from 'lucide-react';

export const AdoptionListingsPage = () => {
  const { showToast } = useToast();
  const [cases, setCases] = useState([]);

  const loadCases = async () => {
    const list = await rescueApi.getRescueCases();
    setCases(list);
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleToggleListing = async (c) => {
    const updatedStatus = !c.isPublishedForAdoption;
    
    if (updatedStatus && c.status !== RescueCaseStatus.READY_FOR_ADOPTION) {
      showToast('Publication Error', 'Only rescue cases marked Ready for Adoption can be published to the public gallery.', 'error');
      return;
    }

    try {
      await rescueApi.updateRescueCase(c.caseId, { isPublishedForAdoption: updatedStatus });
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
            Control which rescue companions appear on the public adoptable pets gallery for prospective adopters.
          </p>
        </div>
      </div>

      <div className="grid-3">
        {cases.map((c) => (
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

            {c.status !== RescueCaseStatus.READY_FOR_ADOPTION ? (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                style={{ width: '100%', cursor: 'not-allowed', opacity: 0.5 }}
                disabled
                title="Only Ready for Adoption cases can be published."
              >
                {c.isPublishedForAdoption ? 'Hide From Public' : 'Publish to Public Gallery'}
              </button>
            ) : (
              <button
                type="button"
                className={`btn btn-sm ${c.isPublishedForAdoption ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%' }}
                onClick={() => handleToggleListing(c)}
              >
                {c.isPublishedForAdoption ? (
                  <>
                    <EyeOff size={14} /> Unpublish from Public
                  </>
                ) : (
                  <>
                    <Globe size={14} /> Publish to Public Gallery
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
