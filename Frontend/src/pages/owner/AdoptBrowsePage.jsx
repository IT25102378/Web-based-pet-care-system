import React, { useState, useEffect } from 'react';
import { rescueApi } from '../../api/rescueApi';
import { adoptionApi } from '../../api/adoptionApi';
import { useAuth } from '../../context/AuthContext';
import { AdoptionWizardModal } from '../adoption/AdoptionWizardModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import { Heart, Search, CheckCircle2, Clock, FileText } from 'lucide-react';

export const AdoptBrowsePage = () => {
  const { currentUser } = useAuth();
  const [pets, setPets] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const [allCases, apps] = await Promise.all([
        rescueApi.getRescueCases({ publishedOnly: true }),
        adoptionApi.getAdoptionApplications({ applicantId: currentUser?.userId }),
      ]);
      setPets(allCases);
      setMyApplications(apps);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const filtered = pets.filter((p) =>
    p.temporaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge mb-1" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
            RESCUE ADOPTIONS
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>Adopt a Rescue Companion</h2>
          <p className="text-sm text-muted">
            Submit a multi-step adoption application with digital contract signing and proof of residence verification.
          </p>
        </div>
      </div>

      {/* Existing Applications Status */}
      {myApplications.length > 0 && (
        <div className="card p-6 mb-8" style={{ borderLeft: '4px solid var(--accent)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
            Your Active Adoption Applications ({myApplications.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {myApplications.map((app) => (
              <div
                key={app.applicationId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-main">{app.petName}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Application ID: <strong>{app.applicationId}</strong> • Submitted: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="badge badge-secondary text-xs">
                    <CheckCircle2 size={12} /> Digital Agreement Signed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6" style={{ maxWidth: '380px' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search adoptable pets by name, breed..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Adoptable Pets Grid */}
      <div className="grid-3">
        {filtered.map((pet) => (
          <div key={pet.caseId} className="card card-hoverable" style={{ overflow: 'hidden' }}>
            <div style={{ height: '220px', position: 'relative' }}>
              <img
                src={pet.coverPhotoUrl}
                alt={pet.temporaryName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {pet.species} • {pet.estimatedAge}
              </div>
            </div>

            <div className="card-body">
              <div className="flex items-center justify-between mb-1">
                <h3 style={{ fontSize: '1.3rem' }}>{pet.temporaryName}</h3>
                <StatusBadge status={pet.status} />
              </div>
              <p className="text-xs text-primary font-semibold mb-2">{pet.breed}</p>
              <p className="text-sm text-muted mb-4" style={{ minHeight: '50px', lineHeight: '1.4' }}>
                {pet.description}
              </p>

              <button
                type="button"
                className="btn btn-accent btn-sm"
                style={{ width: '100%' }}
                onClick={() => setSelectedPet(pet)}
              >
                <Heart size={16} /> Apply to Adopt {pet.temporaryName}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Adoption Wizard Modal */}
      {selectedPet && (
        <AdoptionWizardModal
          isOpen={!!selectedPet}
          onClose={() => {
            setSelectedPet(null);
            loadData();
          }}
          pet={selectedPet}
        />
      )}
    </div>
  );
};
