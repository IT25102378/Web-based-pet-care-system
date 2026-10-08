import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { petApi } from '../../api/petApi';
import { appointmentApi } from '../../api/appointmentApi';
import { adoptionApi } from '../../api/adoptionApi';
import { careServiceApi } from '../../api/careServiceApi';
import { consultationApi } from '../../api/consultationApi';
import { prescriptionApi } from '../../api/prescriptionApi';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import {
  PawPrint,
  Calendar,
  Heart,
  Package,
  Plus,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Syringe,
  FileText,
  Pill,
  Sparkles,
  Stethoscope,
  Layers,
} from 'lucide-react';

export const OwnerDashboard = () => {
  const { currentUser } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [packages, setPackages] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      try {
        const [petsRes, apptsRes, appsRes, pkgsRes, vacsRes, consultsRes, rxRes] = await Promise.allSettled([
          petApi.getPets(currentUser.userId),
          appointmentApi.getAppointments({ ownerId: currentUser.userId }),
          adoptionApi.getAdoptionApplications({ applicantId: currentUser.userId }),
          careServiceApi.getPackageBookings({ ownerId: currentUser.userId }),
          petApi.getVaccinations(),
          consultationApi.getConsultations(),
          prescriptionApi.getPrescriptions(),
        ]);

        const userPets = petsRes.status === 'fulfilled' && Array.isArray(petsRes.value) ? petsRes.value : [];
        const userAppts = apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value) ? apptsRes.value : [];
        const userApps = appsRes.status === 'fulfilled' && Array.isArray(appsRes.value) ? appsRes.value : [];
        const userPkgs = pkgsRes.status === 'fulfilled' && Array.isArray(pkgsRes.value) ? pkgsRes.value : [];
        const userVacs = vacsRes.status === 'fulfilled' && Array.isArray(vacsRes.value) ? vacsRes.value : [];
        const userConsults = consultsRes.status === 'fulfilled' && Array.isArray(consultsRes.value) ? consultsRes.value : [];
        const userRx = rxRes.status === 'fulfilled' && Array.isArray(rxRes.value) ? rxRes.value : [];

        const ownedPetIds = new Set(userPets.map((p) => p.petId));
        setPets(userPets);
        setAppointments(userAppts);
        setApplications(userApps);
        setPackages(userPkgs);
        setVaccinations(userVacs.filter((v) => ownedPetIds.has(v.petId)));
        setConsultations(userConsults.filter((c) => ownedPetIds.has(c.petId)));
        setPrescriptions(userRx.filter((r) => ownedPetIds.has(r.petId)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  const [activePetIndex, setActivePetIndex] = useState(0);

  const upcomingAppts = appointments.filter(
    (a) => a.status === 'Scheduled' || a.status === 'CheckedIn'
  );

  const currentPet = pets[activePetIndex] || pets[0];

  return (
    <div style={{ color: 'var(--text-main)' }}>
      {/* Apple Liquid Glass Welcome Banner */}
      <div className="apple-liquid-glass p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="apple-eyebrow">
              <Sparkles size={13} /> COMPANION CARE PORTAL
            </span>
            <span className="liquid-glass-pill" style={{ color: 'var(--primary)' }}>
              ● Verified Patient Record
            </span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Welcome back, {currentUser?.fullName}!
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Monitor companion wellness, book clinical visits, verify vaccinations, and manage care packages in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/owner/appointments"
            className="apple-pill-btn apple-pill-btn-primary"
          >
            <Calendar size={15} /> Book Appointment
          </Link>
          <Link
            to="/owner/pets"
            className="apple-pill-btn apple-pill-btn-secondary"
          >
            <PawPrint size={15} /> My Pets ({pets.length})
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4 mb-8">
        <StatCard
          label="Registered Pets"
          value={pets.length}
          icon={PawPrint}
          trend="Vaccinated companions"
          trendDirection="up"
        />
        <StatCard
          label="Upcoming Visits"
          value={upcomingAppts.length}
          icon={Calendar}
          iconBg="var(--status-warning-bg)"
          iconColor="var(--status-warning)"
          trend={upcomingAppts.length > 0 ? 'Next visit scheduled' : 'No pending visits'}
        />
        <StatCard
          label="Active Packages"
          value={packages.length}
          icon={Package}
          iconBg="rgba(42, 140, 130, 0.15)"
          iconColor="var(--primary)"
          trend="Care sessions active"
        />
        <StatCard
          label="Adoption Requests"
          value={applications.length}
          icon={Heart}
          iconBg="var(--primary-subtle)"
          iconColor="var(--primary)"
          trend="Rescue officer review"
        />
      </div>

      {/* Signature Apple Element: Companion Vitality Rings & Telemetry Widget */}
      {pets.length > 0 && (
        <div className="apple-liquid-glass p-6 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <span className="apple-eyebrow">
                <Sparkles size={13} /> APPLE HEALTH FOR PETS
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Companion Vitality & Health Rings
              </h3>
              <p className="text-xs text-muted">
                Live preventive health compliance and wellness perks for {currentPet?.name || 'your companions'}.
              </p>
            </div>

            {/* Pet Switcher Carousel Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {pets.map((p, idx) => (
                <button
                  key={p.petId || idx}
                  type="button"
                  className={`pet-selector-pill ${activePetIndex === idx ? 'active' : ''}`}
                  onClick={() => setActivePetIndex(idx)}
                >
                  <PawPrint size={13} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="vitality-rings-wrapper flex items-center justify-between flex-wrap gap-6">
            {/* SVG Concentric Activity Rings */}
            <div className="flex items-center gap-4">
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {/* Outer Ring: Vaccinations (Teal #0F766E) */}
                  <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(15, 118, 110, 0.15)" strokeWidth="9" />
                  <circle
                    cx="60" cy="60" r="48" fill="none" stroke="#0F766E" strokeWidth="9"
                    strokeDasharray="301.59"
                    strokeDashoffset={vaccinations.some((v) => v.petId === currentPet?.petId) ? '30' : '90'}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  {/* Middle Ring: Annual Checkups (Warm Terracotta #EA580C) */}
                  <circle cx="60" cy="60" r="36" fill="none" stroke="rgba(234, 88, 12, 0.15)" strokeWidth="9" />
                  <circle
                    cx="60" cy="60" r="36" fill="none" stroke="#EA580C" strokeWidth="9"
                    strokeDasharray="226.19"
                    strokeDashoffset={upcomingAppts.length > 0 ? '45' : '110'}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  {/* Inner Ring: Wellness Perks (Amber #D97706) */}
                  <circle cx="60" cy="60" r="24" fill="none" stroke="rgba(217, 119, 6, 0.15)" strokeWidth="9" />
                  <circle
                    cx="60" cy="60" r="24" fill="none" stroke="#D97706" strokeWidth="9"
                    strokeDasharray="150.79"
                    strokeDashoffset={packages.length > 0 ? '20' : '75'}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}
                >
                  <Heart size={18} fill="#0F766E" color="#0F766E" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0F766E' }} />
                  <span className="text-xs font-semibold text-main">Immunization Up-to-date (94%)</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EA580C' }} />
                  <span className="text-xs font-semibold text-main">Clinical Checkups (85%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                  <span className="text-xs font-semibold text-main">Wellness Package Perks (90%)</span>
                </div>
              </div>
            </div>

            {/* Pet Snapshot Card */}
            {currentPet && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1.25rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(0, 0, 0, 0.07)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <img
                  src={currentPet.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80'}
                  alt={currentPet.name}
                  style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />
                <div>
                  <div className="font-bold text-sm text-main">{currentPet.name} ({currentPet.breed})</div>
                  <div className="text-xs text-muted">
                    Age: {currentPet.ageYears || 0} yrs {currentPet.ageMonths ? `${currentPet.ageMonths} mo` : ''} • {currentPet.weightKg || 0} kg
                  </div>
                  <div className="text-xs font-mono font-bold mt-1" style={{ color: 'var(--primary)' }}>
                    Chip: {currentPet.microchipId || 'Registered on PetNexus'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid Row 1: Upcoming Appointments & Pets Spotlight */}
      <div className="grid-2 mb-8">
        {/* Upcoming Appointments */}
        <Card
          title="Upcoming Appointments"
          subtitle="Clinic check-ins & scheduled visits"
          icon={Calendar}
          actions={
            <Link to="/owner/appointments" className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              Schedule Visit <ArrowRight size={14} />
            </Link>
          }
        >
          {upcomingAppts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingAppts.map((appt) => (
                <div
                  key={appt.appointmentId}
                  style={{
                    padding: '1.15rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--primary-subtle)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{appt.serviceType}</span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted mb-2">
                    <span>Patient: <strong style={{ color: 'var(--text-main)' }}>{appt.petName}</strong></span>
                    <span>Queue Token: <strong className="font-mono text-primary" style={{ fontSize: '0.9rem' }}>{appt.tokenNumber}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted pt-2 border-top" style={{ borderTop: '1px solid #FDBA74' }}>
                    <span>Date: <strong>{appt.appointmentDate} at {appt.timeSlot}</strong></span>
                    <span>Doctor: <strong>{appt.vetName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <Calendar size={36} color="var(--status-warning)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>No Upcoming Visits</h4>
              <p className="text-xs text-muted mt-1 max-w-xs mx-auto mb-4">
                Keep your pet's wellness up to date by scheduling a consultation or vaccine booster.
              </p>
              <Link
                to="/owner/appointments"
                className="btn btn-sm"
                style={{ backgroundcolor: 'var(--primary)', color: '#FFFFFF', fontWeight: 700 }}
              >
                Book Appointment Now
              </Link>
            </div>
          )}
        </Card>

        {/* Registered Pets & Vaccination Quick View */}
        <Card
          title="My Companions & Vaccination Status"
          subtitle="Profiles, microchips & immunizations"
          icon={PawPrint}
          actions={
            <Link to="/owner/pets" className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              Manage Pets ({pets.length}) <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pets.map((pet) => {
              const petVac = vaccinations.find((v) => v.petId === pet.petId);
              return (
                <div
                  key={pet.petId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{pet.name}</h4>
                      <p className="text-xs text-muted">{pet.breed} • {pet.ageYears} yrs ({pet.weightKg} kg)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge badge-success text-xs flex items-center gap-1">
                      <Syringe size={12} /> {petVac ? petVac.status : 'Vaccinated'}
                    </span>
                    <Link to="/owner/pets" className="btn btn-secondary btn-sm">
                      Record
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Main Grid Row 2: Recent Medical Notes & Active Packages */}
      <div className="grid-2 mb-8">
        {/* Recent Medical Information & Prescriptions */}
        <Card
          title="Recent Clinical Notes & Prescriptions"
          subtitle="Clinical examination diagnoses & active Rx"
          icon={FileText}
          actions={
            <Link to="/owner/medical-history" className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              Full Health History <ArrowRight size={14} />
            </Link>
          }
        >
          {consultations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {consultations.slice(0, 2).map((c) => (
                <div
                  key={c.consultationId}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--primary)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs" style={{ color: 'var(--text-main)' }}>{c.assessmentDiagnosis}</span>
                    <span className="text-xs text-muted">{new Date(c.consultationDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted" style={{ lineHeight: '1.4' }}>
                    <strong>Plan:</strong> {c.treatmentPlan}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted mt-2 pt-2 border-top" style={{ borderTop: '1px solid var(--border-light)' }}>
                    <span>Patient: <strong>{c.petName}</strong></span>
                    <span>Vet: <strong>{c.vetName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted text-center py-4">No recent consultation notes on file.</p>
          )}
        </Card>

        {/* Active Care Packages & Member Benefits */}
        <Card
          title="Active Package Memberships"
          subtitle="Prepaid care plans & sessions balance"
          icon={Layers}
          actions={
            <Link to="/owner/packages" className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              Browse Packages <ArrowRight size={14} />
            </Link>
          }
        >
          {packages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {packages.map((pkg) => (
                <div
                  key={pkg.bookingId}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--primary-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{pkg.packageName}</h4>
                    <p className="text-xs text-muted mt-1">Companion: <strong>{pkg.petName}</strong></p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-primary text-xs">
                      {pkg.completedSessions} / {pkg.totalSessions} Sessions Used
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <p className="text-xs text-muted mb-3">You don't have any active package enrollments.</p>
              <Link to="/owner/packages" className="btn btn-outline btn-sm">
                Explore Care Packages
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Adoption Applications Tracker */}
      <Card
        title="My Adoption Applications"
        subtitle="Tracking shelter application status"
        icon={Heart}
        actions={
          <Link to="/owner/adopt" className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
            Adoptable Pets Gallery <ArrowRight size={14} />
          </Link>
        }
      >
        {applications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {applications.map((app) => (
              <div
                key={app.applicationId}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Adoption Request: {app.petName}</h4>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-muted">
                    Ref: <strong>{app.applicationId}</strong> • Submitted on {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="badge badge-secondary text-xs flex items-center gap-1">
                    <CheckCircle2 size={12} color="#10B981" /> Agreement Signed
                  </span>
                  <Link to="/owner/adopt" className="btn btn-secondary btn-sm">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-4">
            You haven't submitted any adoption applications yet. Check out our rescue companions!
          </p>
        )}
      </Card>
    </div>
  );
};
