import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { packageApi } from '../../api/packageApi';
import { petApi } from '../../api/petApi';
import { careServiceApi } from '../../api/careServiceApi';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  CheckCircle,
  Sparkles,
  CreditCard,
  Check,
  Calendar,
  Layers,
  Scissors,
  Stethoscope,
  Heart,
  Filter,
  ArrowRight,
  User,
  ShieldCheck,
  AlertCircle,
  Activity,
} from 'lucide-react';

export const PackagesBrowsePage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [bookingPackage, setBookingPackage] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('ALL'); // 'ALL', 'CARE_ONLY', 'MEDICAL_ONLY', 'BUNDLES'

  const loadData = async () => {
    try {
      const [pkgs, bookings, userPets] = await Promise.all([
        packageApi.getPackages(),
        careServiceApi.getPackageBookings({ ownerId: currentUser?.userId }),
        petApi.getPets(currentUser?.userId),
      ]);
      setPackages(pkgs);
      setMyBookings(bookings);
      setPets(userPets);
      if (userPets.length > 0 && !selectedPetId) {
        setSelectedPetId(userPets[0].petId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleConfirmPurchase = async () => {
    if (!selectedPetId) {
      showToast('Pet Required', 'Please select a companion for this service or package.', 'error');
      return;
    }

    setSubmitting(true);
    const petObj = pets.find((p) => p.petId === selectedPetId);

    try {
      const totalSessions =
        bookingPackage.category === 'CARE_ONLY'
          ? (bookingPackage.name.includes('Express') ? 1 : 3)
          : (bookingPackage.name.includes('Grooming') ? 3 : 1);

      await careServiceApi.bookPackage({
        packageId: bookingPackage.packageId,
        packageName: bookingPackage.name,
        category: bookingPackage.category || 'BUNDLES',
        ownerId: currentUser.userId,
        ownerName: currentUser.fullName,
        petId: selectedPetId,
        petName: petObj ? petObj.name : 'Patient',
        purchasedPrice: bookingPackage.price,
        totalSessions: totalSessions,
      });

      showToast(
        'Enrollment Confirmed',
        bookingPackage.category === 'CARE_ONLY'
          ? `Enrolled in Pet Care Provider Service: ${bookingPackage.name}!`
          : `Enrolled in ${bookingPackage.name}!`,
        'success'
      );
      setBookingPackage(null);
      loadData();
    } catch (err) {
      showToast('Enrollment Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine category for filtering
  const getPackageCategory = (pkg) => {
    if (pkg.category) return pkg.category;
    const nameLower = (pkg.name || '').toLowerCase();
    if (nameLower.includes('groom') || nameLower.includes('spa') || nameLower.includes('blowout')) {
      return 'CARE_ONLY';
    }
    if (nameLower.includes('diagnostic') || nameLower.includes('dental') || nameLower.includes('consultation')) {
      return 'MEDICAL_ONLY';
    }
    return 'BUNDLES';
  };

  const filteredPackages = packages.filter((pkg) => {
    if (serviceCategoryFilter === 'ALL') return true;
    const cat = getPackageCategory(pkg);
    return cat === serviceCategoryFilter;
  });

  const careOnlyCount = packages.filter((p) => getPackageCategory(p) === 'CARE_ONLY').length;
  const medicalOnlyCount = packages.filter((p) => getPackageCategory(p) === 'MEDICAL_ONLY').length;
  const bundleCount = packages.filter((p) => getPackageCategory(p) === 'BUNDLES').length;

  return (
    <div>
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">CLINIC PACKAGES & DIRECT SERVICES</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Customized Pet Care & Medical Offerings
          </h2>
          <p className="text-sm text-muted" style={{ maxWidth: '850px', marginTop: '0.25rem' }}>
            Choose comprehensive wellness packages, select <strong>pure Pet Care Provider services</strong> (grooming, spa, and bathing for healthy pets that don’t need medical care), or select <strong>focused Medical / Veterinary consultations</strong> exclusively.
          </p>
        </div>
      </div>

      {/* Selective Preference Highlight Banner */}
      <div
        className="card mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(231,111,81,0.08) 0%, rgba(42,157,143,0.08) 100%)',
          border: '1px solid rgba(231,111,81,0.25)',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-start gap-3">
            <Heart size={24} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0, color: 'var(--text-main)' }}>
                Tailor Care to Your Pet's Current Health
              </h4>
              <p className="text-sm text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Is your companion healthy? Skip clinic visits and book dedicated Pet Care Provider grooming. Need medical attention? Access specialized doctor exams directly without salon packages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setServiceCategoryFilter('CARE_ONLY')}
              style={{
                borderColor: serviceCategoryFilter === 'CARE_ONLY' ? 'var(--primary)' : 'var(--border)',
                fontWeight: 600,
              }}
            >
              <Scissors size={14} /> My Pet is Healthy (Care Only)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setServiceCategoryFilter('MEDICAL_ONLY')}
              style={{
                borderColor: serviceCategoryFilter === 'MEDICAL_ONLY' ? 'var(--primary)' : 'var(--border)',
                fontWeight: 600,
              }}
            >
              <Stethoscope size={14} /> Medical Only
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          borderBottom: '2px solid var(--border)',
          paddingBottom: '0.85rem',
        }}
      >
        <button
          type="button"
          onClick={() => setServiceCategoryFilter('ALL')}
          style={{
            padding: '0.6rem 1.15rem',
            borderRadius: '999px',
            fontSize: '0.92rem',
            fontWeight: serviceCategoryFilter === 'ALL' ? 700 : 500,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: serviceCategoryFilter === 'ALL' ? 'var(--primary)' : 'var(--bg-subtle)',
            color: serviceCategoryFilter === 'ALL' ? '#ffffff' : 'var(--text-main)',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Layers size={16} /> All Offerings ({packages.length})
        </button>

        <button
          type="button"
          onClick={() => setServiceCategoryFilter('CARE_ONLY')}
          style={{
            padding: '0.6rem 1.15rem',
            borderRadius: '999px',
            fontSize: '0.92rem',
            fontWeight: serviceCategoryFilter === 'CARE_ONLY' ? 700 : 500,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: serviceCategoryFilter === 'CARE_ONLY' ? '#2A9D8F' : 'var(--bg-subtle)',
            color: serviceCategoryFilter === 'CARE_ONLY' ? '#ffffff' : 'var(--text-main)',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Scissors size={16} /> 🐾 Pet Care Provider Services Only ({careOnlyCount})
        </button>

        <button
          type="button"
          onClick={() => setServiceCategoryFilter('MEDICAL_ONLY')}
          style={{
            padding: '0.6rem 1.15rem',
            borderRadius: '999px',
            fontSize: '0.92rem',
            fontWeight: serviceCategoryFilter === 'MEDICAL_ONLY' ? 700 : 500,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: serviceCategoryFilter === 'MEDICAL_ONLY' ? '#E76F51' : 'var(--bg-subtle)',
            color: serviceCategoryFilter === 'MEDICAL_ONLY' ? '#ffffff' : 'var(--text-main)',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Stethoscope size={16} /> 🩺 Medical & Veterinary Only ({medicalOnlyCount})
        </button>

        <button
          type="button"
          onClick={() => setServiceCategoryFilter('BUNDLES')}
          style={{
            padding: '0.6rem 1.15rem',
            borderRadius: '999px',
            fontSize: '0.92rem',
            fontWeight: serviceCategoryFilter === 'BUNDLES' ? 700 : 500,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: serviceCategoryFilter === 'BUNDLES' ? '#457B9D' : 'var(--bg-subtle)',
            color: serviceCategoryFilter === 'BUNDLES' ? '#ffffff' : 'var(--text-main)',
            transition: 'all 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Package size={16} /> 📦 Combined Annual Bundles ({bundleCount})
        </button>
      </div>

      {/* Active Enrolled Packages */}
      {myBookings.length > 0 && (
        <div className="card p-6 mb-8" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
            <Layers size={16} className="text-primary" /> Your Active Enrolled Services & Memberships
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myBookings.map((b) => {
              const isCare = b.category === 'CARE_ONLY' || b.packageName?.includes('Spa') || b.packageName?.includes('Groom');
              const isMed = b.category === 'MEDICAL_ONLY' || b.packageName?.includes('Dental') || b.packageName?.includes('Diagnostic');

              return (
                <div
                  key={b.bookingId}
                  style={{
                    backgroundColor: isCare ? 'rgba(42, 157, 143, 0.08)' : isMed ? 'rgba(231, 111, 81, 0.08)' : 'var(--primary-subtle)',
                    border: `1px solid ${isCare ? '#2A9D8F33' : isMed ? '#E76F5133' : 'var(--border)'}`,
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-main">{b.packageName}</h4>
                      {isCare && <span className="badge" style={{ backgroundColor: '#2A9D8F', color: '#fff', fontSize: '0.72rem' }}>Care Provider Service</span>}
                      {isMed && <span className="badge" style={{ backgroundColor: '#E76F51', color: '#fff', fontSize: '0.72rem' }}>Medical Clinical</span>}
                      <span className="badge badge-success text-xs">Active</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Companion: <strong>{b.petName}</strong> • Enrolled: {b.purchaseDate} • Valid Until: {b.expiryDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div style={{ textAlign: 'right' }}>
                      <span className="text-xs text-muted">Sessions Balance:</span>
                      <p className="text-sm font-bold" style={{ color: isCare ? '#2A9D8F' : isMed ? '#E76F51' : 'var(--primary)' }}>
                        {b.completedSessions} used / {b.remainingSessions} left
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Packages & Standalone Offerings Grid */}
      <div className="grid-2">
        {filteredPackages.map((pkg) => {
          const category = getPackageCategory(pkg);
          const isCareOnly = category === 'CARE_ONLY';
          const isMedicalOnly = category === 'MEDICAL_ONLY';

          return (
            <div
              key={pkg.packageId}
              className="card card-hoverable"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                borderTop: isCareOnly ? '4px solid #2A9D8F' : isMedicalOnly ? '4px solid #E76F51' : '4px solid var(--primary)',
              }}
            >
              <div>
                {/* Domain Pill */}
                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  {isCareOnly ? (
                    <span className="badge" style={{ backgroundColor: '#E8F5F3', color: '#2A9D8F', fontWeight: 700 }}>
                      <Scissors size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      PET CARE SERVICE ONLY
                    </span>
                  ) : isMedicalOnly ? (
                    <span className="badge" style={{ backgroundColor: '#FFF0ED', color: '#E76F51', fontWeight: 700 }}>
                      <Stethoscope size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      MEDICAL & CLINICAL ONLY
                    </span>
                  ) : (
                    <span className="badge badge-primary">
                      <Package size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      ANNUAL WELLNESS BUNDLE
                    </span>
                  )}

                  {pkg.badge && (
                    <span className="badge badge-secondary text-xs">{pkg.badge}</span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>{pkg.name}</h3>
                <p className="text-sm text-muted mb-4">{pkg.tagline}</p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: isCareOnly ? '#2A9D8F' : isMedicalOnly ? '#E76F51' : 'var(--primary-dark)' }}>
                    Rs. {pkg.price.toLocaleString()}
                  </span>
                  {pkg.originalValue > pkg.price && (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '1.1rem' }}>
                        Rs. {pkg.originalValue.toLocaleString()}
                      </span>
                      <span className="badge badge-warning text-xs">Save {pkg.discountPercent}%</span>
                    </>
                  )}
                </div>

                {/* Scope Clarification Notice */}
                {isCareOnly && (
                  <div
                    style={{
                      backgroundColor: '#E8F5F3',
                      borderLeft: '3px solid #2A9D8F',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem',
                      color: '#264653',
                    }}
                  >
                    <strong>Healthy Companion Friendly:</strong> Direct appointment with Pet Care Provider Dilshan Bandara. No medical consultation or vet fee required.
                  </div>
                )}

                {isMedicalOnly && (
                  <div
                    style={{
                      backgroundColor: '#FFF0ED',
                      borderLeft: '3px solid #E76F51',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem',
                      color: '#9C3418',
                    }}
                  >
                    <strong>Direct Veterinary Focus:</strong> Pure clinical doctor exam, diagnostics, and prescriptions. Zero spa grooming steps.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                  {pkg.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-main">
                      <CheckCircle
                        size={16}
                        color={isCareOnly ? '#2A9D8F' : isMedicalOnly ? '#E76F51' : 'var(--status-success)'}
                        style={{ flexShrink: 0, marginTop: '3px' }}
                      />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{
                    width: '100%',
                    backgroundColor: isCareOnly ? '#2A9D8F' : isMedicalOnly ? '#E76F51' : 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                  onClick={() => setBookingPackage(pkg)}
                >
                  <CreditCard size={16} />
                  {isCareOnly
                    ? 'Enroll Pet Care Provider Service'
                    : isMedicalOnly
                    ? 'Book Medical Service'
                    : 'Enroll & Book Bundle'}
                </button>

                {isMedicalOnly && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                    onClick={() => {
                      const serviceQuery = pkg.name.includes('Dental')
                        ? 'Dental Consultation & Cleaning'
                        : 'Routine Wellness & Vaccination';
                      navigate(`/owner/appointments?service=${encodeURIComponent(serviceQuery)}`);
                    }}
                  >
                    <Stethoscope size={14} /> Schedule Doctor Appointment Immediately
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollment Modal */}
      {bookingPackage && (
        <Modal
          isOpen={!!bookingPackage}
          onClose={() => setBookingPackage(null)}
          title={`Enroll: ${bookingPackage.name}`}
          subtitle={`Total Investment: Rs. ${bookingPackage.price.toLocaleString()}`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2" style={{ width: '100%' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setBookingPackage(null)} disabled={submitting}>
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor:
                    getPackageCategory(bookingPackage) === 'CARE_ONLY'
                      ? '#2A9D8F'
                      : getPackageCategory(bookingPackage) === 'MEDICAL_ONLY'
                      ? '#E76F51'
                      : 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                }}
                onClick={handleConfirmPurchase}
                disabled={submitting}
              >
                <Check size={16} /> Confirm & Activate
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {getPackageCategory(bookingPackage) === 'CARE_ONLY' && (
              <div style={{ backgroundColor: '#E8F5F3', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #2A9D8F44' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#264653' }}>
                  🐾 <strong>Healthy Pet Care Selection:</strong> This service provides dedicated grooming & spa care from your Care Provider without veterinary clinical interventions.
                </p>
              </div>
            )}

            {getPackageCategory(bookingPackage) === 'MEDICAL_ONLY' && (
              <div style={{ backgroundColor: '#FFF0ED', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #E76F5144' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9C3418' }}>
                  🩺 <strong>Medical & Veterinary Selection:</strong> This service focuses exclusively on clinical examinations, diagnostics, and doctor treatments without spa salon services.
                </p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Companion for Service <span className="required">*</span></label>
              <select
                className="form-select"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                {pets.map((p) => (
                  <option key={p.petId} value={p.petId}>
                    {p.name} ({p.species} - {p.breed})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p className="text-xs text-muted font-semibold uppercase mb-1">Service & Inclusions:</p>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {bookingPackage.features?.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default PackagesBrowsePage;

