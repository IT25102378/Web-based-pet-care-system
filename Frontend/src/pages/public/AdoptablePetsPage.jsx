import React, { useState, useEffect } from 'react';
import { rescueApi } from '../../api/rescueApi';
import { AdoptionWizardModal } from '../adoption/AdoptionWizardModal';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Filter, ShieldCheck, Info, Check, User, MapPin } from 'lucide-react';

export const AdoptablePetsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPetForAdoption, setSelectedPetForAdoption] = useState(null);
  const [viewDetailPet, setViewDetailPet] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      const allCases = await rescueApi.getRescueCases();
      // Filter for published AND ReadyForAdoption pets
      const adoptable = allCases.filter(
        (c) => c.isPublishedForAdoption && c.status === 'ReadyForAdoption'
      );
      setPets(adoptable);
    };
    fetchPets();
  }, []);

  const filteredPets = pets.filter((pet) => {
    const matchesSpecies = speciesFilter === 'All' || pet.species.toLowerCase() === speciesFilter.toLowerCase();
    const matchesSearch =
      pet.temporaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecies && matchesSearch;
  });

  const handleApplyClick = (pet) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=adopt');
    } else {
      setSelectedPetForAdoption(pet);
    }
  };

  return (
    <div style={{ padding: '3rem 0', backgroundColor: 'var(--bg-app)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ maxWidth: '720px', marginBottom: '2.5rem' }}>
          <span className="badge badge-primary mb-2">RESCUE & REHOMING</span>
          <h1>Adoptable Pets Gallery</h1>
          <p className="mt-2 text-lg">
            Every rescue companion at Pet Nexus has received full veterinary care, vaccinations, microchip registration, and behavioral assessment.
          </p>
        </div>

        {/* Filter Controls */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {['All', 'Dog', 'Cat'].map((species) => (
              <button
                key={species}
                type="button"
                className={`btn btn-sm ${speciesFilter === species ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSpeciesFilter(species)}
              >
                {species === 'All' ? 'All Animals' : species === 'Dog' ? '🐶 Dogs' : '🐱 Cats'}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, breed, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid-3">
          {filteredPets.length > 0 ? (
            filteredPets.map((pet) => (
              <div key={pet.caseId} className="card card-hoverable" style={{ overflow: 'hidden' }}>
                <div style={{ height: '240px', position: 'relative' }}>
                  <img
                    src={pet.coverPhotoUrl}
                    alt={pet.temporaryName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                    }}
                  >
                    <StatusBadge status={pet.status} />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {pet.gender} • {pet.estimatedAge}
                  </div>
                </div>

                <div className="card-body">
                  <div className="flex items-center justify-between mb-1">
                    <h3 style={{ fontSize: '1.35rem' }}>{pet.temporaryName}</h3>
                  </div>
                  <p className="text-xs text-primary font-semibold mb-2">{pet.breed}</p>
                  <p className="text-sm text-muted mb-4" style={{ lineHeight: '1.5', minHeight: '54px' }}>
                    {pet.description}
                  </p>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <strong>Medical Status:</strong> {pet.medicalSummary}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleApplyClick(pet)}
                    >
                      <Heart size={16} /> Apply to Adopt
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setViewDetailPet(pet)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem' }}>
              <p className="text-muted text-lg">No adoptable animals found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pet Detail Modal */}
      {viewDetailPet && (
        <Modal
          isOpen={!!viewDetailPet}
          onClose={() => setViewDetailPet(null)}
          title={`${viewDetailPet.temporaryName} - Rescue Profile`}
          subtitle={`Case Number: ${viewDetailPet.caseNumber}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between" style={{ width: '100%' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewDetailPet(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  const p = viewDetailPet;
                  setViewDetailPet(null);
                  handleApplyClick(p);
                }}
              >
                <Heart size={16} /> Proceed to Application
              </button>
            </div>
          }
        >
          <div className="grid-2">
            <div>
              <img
                src={viewDetailPet.coverPhotoUrl}
                alt={viewDetailPet.temporaryName}
                style={{
                  width: '100%',
                  height: '280px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-lg)',
                }}
              />
              <div className="flex items-center justify-between mt-3 text-xs text-muted">
                <span>Microchip ID: <strong>{viewDetailPet.microchipId}</strong></span>
                <span>Intake Date: <strong>{viewDetailPet.intakeDate}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <span className="badge badge-primary">{viewDetailPet.species}</span>
                <h3 className="mt-1">{viewDetailPet.temporaryName}</h3>
                <p className="text-xs text-muted font-medium">{viewDetailPet.breed} • {viewDetailPet.gender} • {viewDetailPet.estimatedAge}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-muted tracking-wider mb-1">Rescue Story</h4>
                <p className="text-sm text-main" style={{ lineHeight: '1.6' }}>{viewDetailPet.description}</p>
              </div>

              <div style={{ backgroundColor: 'var(--primary-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <h4 className="text-xs font-bold uppercase text-primary tracking-wider mb-1">Veterinary Medical Clearance</h4>
                <p className="text-xs text-main">{viewDetailPet.medicalSummary}</p>
              </div>

              {viewDetailPet.fosterParentName && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <User size={14} color="var(--primary)" />
                  <span>Currently fostered by: <strong>{viewDetailPet.fosterParentName}</strong></span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Adoption Multi-Step Modal */}
      {selectedPetForAdoption && (
        <AdoptionWizardModal
          isOpen={!!selectedPetForAdoption}
          onClose={() => setSelectedPetForAdoption(null)}
          pet={selectedPetForAdoption}
        />
      )}
    </div>
  );
};
