import React, { useState, useEffect } from 'react';
import { rescueApi } from '../../api/rescueApi';
import { AdoptionWizardModal } from '../adoption/AdoptionWizardModal';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Filter, ShieldCheck, Info, Check, User, MapPin, X, RotateCcw } from 'lucide-react';

export const AdoptablePetsPage = () => {
  const { currentUser, role, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPetForAdoption, setSelectedPetForAdoption] = useState(null);
  const [viewDetailPet, setViewDetailPet] = useState(null);

  // Helper to determine the user's home dashboard route
  const getOwnDashboardRoute = (userRole) => {
    switch (userRole) {
      case 'PetOwner':        return '/owner/overview';
      case 'ClinicStaff':     return '/staff/queue';
      case 'RescueOfficer':   return '/rescue/dashboard';
      case 'Veterinarian':    return '/vet/schedule';
      case 'PetCareProvider': return '/provider/dashboard';
      case 'ClinicManager':   return '/manager/dashboard';
      case 'Admin':           return '/admin/dashboard';
      default:                return '/login';
    }
  };

  // Strictly enforce that the adoptable pets page is ONLY accessible to PetOwner and RescueOfficer
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login?redirect=adoptable-pets', { replace: true });
      } else if (role !== 'PetOwner' && role !== 'RescueOfficer') {
        navigate(getOwnDashboardRoute(role), { replace: true });
      }
    }
  }, [isAuthenticated, role, isLoading, navigate]);

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

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-subtle)', fontSize: '1.1rem' }}>Loading adoptable pets gallery…</p>
      </div>
    );
  }

  if (!isAuthenticated || (role !== 'PetOwner' && role !== 'RescueOfficer')) {
    return null;
  }

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
        <div style={{ maxWidth: '800px', marginBottom: '2.5rem' }}>
          <span className="badge badge-primary mb-2" style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}>
            RESCUE & REHOMING
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Adoptable Pets Gallery
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.6 }}>
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
              <button
                type="button"
                className={`btn btn-sm ${speciesFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSpeciesFilter('All')}
              >
                All Animals
              </button>
            {(speciesFilter !== 'All' || searchTerm) && (
              <button
                type="button"
                className="apple-pill-btn-clear"
                onClick={() => {
                  setSpeciesFilter('All');
                  setSearchTerm('');
                }}
                title="Reset all filters"
              >
                <RotateCcw size={12} /> Clear Filters
              </button>
            )}
          </div>

          <div style={{ position: 'relative', minWidth: '260px', display: 'flex', alignItems: 'center' }}>
            <Search size={16} className="search-icon" style={{ position: 'absolute', left: '12px', color: 'var(--text-subtle)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, breed, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', paddingRight: searchTerm ? '2.25rem' : undefined }}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search query"
                style={{ position: 'absolute', right: '10px' }}
              >
                <X size={13} />
              </button>
            )}
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
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 650,
                    }}
                  >
                    {pet.gender} • {pet.estimatedAge}
                  </div>
                </div>

                <div className="card-body">
                  <div className="flex items-center justify-between mb-1">
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 750 }}>{pet.temporaryName}</h3>
                  </div>
                  <p className="text-sm text-primary font-semibold mb-2">{pet.breed}</p>
                  <p className="text-base text-muted mb-4" style={{ lineHeight: '1.55', minHeight: '58px' }}>
                    {pet.description}
                  </p>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '0.75rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <strong>Medical Status:</strong> {pet.medicalSummary}
                  </div>

                  <div className="flex items-center gap-2">
                    {role === 'RescueOfficer' ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, fontSize: '0.95rem' }}
                        onClick={() => navigate(`/rescue/cases/${pet.caseId}`)}
                      >
                        <ShieldCheck size={17} /> Manage Case
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-accent btn-sm"
                        style={{ flex: 1, fontSize: '0.95rem' }}
                        onClick={() => handleApplyClick(pet)}
                      >
                        <Heart size={17} /> Apply to Adopt
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.95rem' }}
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
              <p className="text-muted text-xl font-semibold mb-3">No adoptable animals found matching your search.</p>
              {(speciesFilter !== 'All' || searchTerm) && (
                <button
                  type="button"
                  className="apple-pill-btn-clear"
                  onClick={() => {
                    setSpeciesFilter('All');
                    setSearchTerm('');
                  }}
                  style={{ display: 'inline-flex' }}
                >
                  <RotateCcw size={14} /> Clear All Filters & View All Pets
                </button>
              )}
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
              {role === 'RescueOfficer' ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const cid = viewDetailPet.caseId;
                    setViewDetailPet(null);
                    navigate(`/rescue/cases/${cid}`);
                  }}
                >
                  <ShieldCheck size={18} /> Open Rescue Case
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => {
                    const p = viewDetailPet;
                    setViewDetailPet(null);
                    handleApplyClick(p);
                  }}
                >
                  <Heart size={18} /> Proceed to Application
                </button>
              )}
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
                  height: '290px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-lg)',
                }}
              />
              <div className="flex items-center justify-between mt-3 text-sm text-muted">
                <span>Microchip ID: <strong style={{ color: 'var(--text-main)' }}>{viewDetailPet.microchipId}</strong></span>
                <span>Intake Date: <strong style={{ color: 'var(--text-main)' }}>{viewDetailPet.intakeDate}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span className="badge badge-primary">{viewDetailPet.species}</span>
                <h3 className="mt-1" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{viewDetailPet.temporaryName}</h3>
                <p className="text-sm text-muted font-semibold">{viewDetailPet.breed} • {viewDetailPet.gender} • {viewDetailPet.estimatedAge}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase text-muted tracking-wider mb-1">Rescue Story</h4>
                <p className="text-base text-main" style={{ lineHeight: '1.6' }}>{viewDetailPet.description}</p>
              </div>

              <div style={{ backgroundColor: 'var(--primary-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 className="text-sm font-bold uppercase text-primary tracking-wider mb-1">Veterinary Medical Clearance</h4>
                <p className="text-sm text-main" style={{ lineHeight: '1.5' }}>{viewDetailPet.medicalSummary}</p>
              </div>

              {viewDetailPet.fosterParentName && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <User size={16} color="var(--primary)" />
                  <span>Currently fostered by: <strong style={{ color: 'var(--text-main)' }}>{viewDetailPet.fosterParentName}</strong></span>
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
