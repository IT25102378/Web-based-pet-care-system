import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const PackagesBrowsePage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [packages, setPackages] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [bookingPackage, setBookingPackage] = useState(null);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      showToast('Pet Required', 'Please select a companion for this package.', 'error');
      return;
    }

    setSubmitting(true);
    const petObj = pets.find((p) => p.petId === selectedPetId);

    try {
      await careServiceApi.bookPackage({
        packageId: bookingPackage.packageId,
        packageName: bookingPackage.name,
        ownerId: currentUser.userId,
        ownerName: currentUser.fullName,
        petId: selectedPetId,
        petName: petObj ? petObj.name : 'Patient',
        purchasedPrice: bookingPackage.price,
        totalSessions: bookingPackage.name.includes('Grooming') ? 3 : 1,
      });

      showToast('Package Enrolled', `Enrolled in ${bookingPackage.name}!`, 'success');
      setBookingPackage(null);
      loadData();
    } catch (err) {
      showToast('Enrollment Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">CLINIC PACKAGES</span>
          <h2>Preventative Wellness & Grooming Packages</h2>
          <p className="text-sm text-muted">
            All-inclusive veterinary health plans, routine vaccinations, dental prophylaxis, and spa grooming memberships.
          </p>
        </div>
      </div>

      {/* Active Enrolled Packages */}
      {myBookings.length > 0 && (
        <div className="card p-6 mb-8" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
            <Layers size={16} className="text-primary" /> Your Active Package Memberships
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myBookings.map((b) => (
              <div
                key={b.bookingId}
                style={{
                  backgroundColor: 'var(--primary-subtle)',
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
                    <span className="badge badge-success text-xs">Active</span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Companion: <strong>{b.petName}</strong> • Enrolled: {b.purchaseDate} • Valid Until: {b.expiryDate}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div style={{ textAlign: 'right' }}>
                    <span className="text-xs text-muted">Sessions Balance:</span>
                    <p className="text-sm font-bold text-primary">
                      {b.completedSessions} used / {b.remainingSessions} left
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid-2">
        {packages.map((pkg) => (
          <div
            key={pkg.packageId}
            className="card card-hoverable"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {pkg.badge && (
                <span className="badge badge-primary mb-3">{pkg.badge}</span>
              )}
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{pkg.name}</h3>
              <p className="text-sm text-muted mb-4">{pkg.tagline}</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                {pkg.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-main">
                    <CheckCircle size={16} color="var(--status-success)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setBookingPackage(pkg)}
            >
              <CreditCard size={16} /> Enroll & Book Package
            </button>
          </div>
        ))}
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
              <button type="button" className="btn btn-primary" onClick={handleConfirmPurchase} disabled={submitting}>
                <Check size={16} /> Confirm & Activate Package
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Select Patient for Package <span className="required">*</span></label>
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
              <p className="text-xs text-muted font-semibold uppercase mb-1">Package Inclusions:</p>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
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
