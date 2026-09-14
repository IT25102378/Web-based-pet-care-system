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

  const upcomingAppts = appointments.filter(
    (a) => a.status === 'Scheduled' || a.status === 'CheckedIn'
  );

  return (
    <div style={{ color: '#1F2937' }}>
      {/* Welcome Banner */}
      <div
        style={{
          backgroundColor: '#FFF8F3',
          border: '1px solid #FEE2E2',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(231, 111, 81, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="badge"
              style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem' }}
            >
              PET OWNER PORTAL
            </span>
            <span className="text-xs font-semibold" style={{ color: '#F4A261' }}>
              ● SQL Server Active
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>
            Welcome back, {currentUser?.fullName}!
          </h2>
          <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
            Manage your registered companions, book clinic appointments, track vaccination schedules, and view care packages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/owner/appointments"
            className="btn"
            style={{
              backgroundColor: '#E76F51',
              color: '#FFFFFF',
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(231, 111, 81, 0.25)',
            }}
          >
            <Calendar size={16} /> Book Appointment
          </Link>
          <Link
            to="/owner/pets"
            className="btn"
            style={{
              backgroundColor: '#12304A',
              color: '#FFFFFF',
              fontWeight: 600,
            }}
          >
            <PawPrint size={16} /> My Pets ({pets.length})
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
          iconBg="rgba(244, 162, 97, 0.15)"
          iconColor="#F4A261"
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
          iconBg="rgba(231, 111, 81, 0.15)"
          iconColor="#E76F51"
          trend="Rescue officer review"
        />
      </div>

      {/* Main Grid Row 1: Upcoming Appointments & Pets Spotlight */}
      <div className="grid-2 mb-8">
        {/* Upcoming Appointments */}
        <Card
          title="Upcoming Appointments"
          subtitle="Clinic check-ins & scheduled visits"
          icon={Calendar}
          actions={
            <Link to="/owner/appointments" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
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
                    backgroundColor: '#FFF8F3',
                    border: '1px solid #FEE2E2',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm" style={{ color: '#12304A' }}>{appt.serviceType}</span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted mb-2">
                    <span>Patient: <strong style={{ color: '#12304A' }}>{appt.petName}</strong></span>
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
              <Calendar size={36} color="#F4A261" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#12304A' }}>No Upcoming Visits</h4>
              <p className="text-xs text-muted mt-1 max-w-xs mx-auto mb-4">
                Keep your pet's wellness up to date by scheduling a consultation or vaccine booster.
              </p>
              <Link
                to="/owner/appointments"
                className="btn btn-sm"
                style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 700 }}
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
            <Link to="/owner/pets" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
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
                      <h4 className="text-sm font-bold" style={{ color: '#12304A' }}>{pet.name}</h4>
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
          subtitle="SOAP examination diagnoses & active Rx"
          icon={FileText}
          actions={
            <Link to="/owner/medical-history" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
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
                    borderLeft: '4px solid #E76F51',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs" style={{ color: '#12304A' }}>{c.assessmentDiagnosis}</span>
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
            <Link to="/owner/packages" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
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
                    backgroundColor: '#FFF8F3',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: '#12304A' }}>{pkg.packageName}</h4>
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
          <Link to="/owner/adopt" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
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
                    <h4 className="text-sm font-bold" style={{ color: '#12304A' }}>Adoption Request: {app.petName}</h4>
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
