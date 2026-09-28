import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi } from '../../api/appointmentApi';
import { consultationApi } from '../../api/consultationApi';
import { rescueApi } from '../../api/rescueApi';
import { RescueCaseStatus } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import {
  Stethoscope,
  Calendar,
  Search,
  Pill,
  Syringe,
  Clock,
  ArrowRight,
  AlertTriangle,
  Scissors,
  Heart,
  UserCheck,
} from 'lucide-react';

export const VetDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [rescueCases, setRescueCases] = useState([]);
  const [passedToProviderCases, setPassedToProviderCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVetData = async () => {
      try {
        const [apptsRes, consultsRes, rescueRes] = await Promise.allSettled([
          appointmentApi.getAppointments(),
          consultationApi.getConsultations(),
          rescueApi.getRescueCases(),
        ]);
        if (apptsRes.status === 'fulfilled' && apptsRes.value) setAppointments(apptsRes.value);
        if (consultsRes.status === 'fulfilled' && consultsRes.value) setConsultations(consultsRes.value);
        if (rescueRes.status === 'fulfilled' && rescueRes.value) {
          // Cases awaiting vet assessment
          const awaitingVet = (rescueRes.value || []).filter(
            r => r.status === RescueCaseStatus.IN_TREATMENT || r.status === RescueCaseStatus.INTAKE
          );
          // Cases already passed to care provider
          const passedToProvider = (rescueRes.value || []).filter(
            r => r.status === RescueCaseStatus.READY_FOR_FOSTER
          );
          setRescueCases(awaitingVet);
          setPassedToProviderCases(passedToProvider);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadVetData();
  }, []);

  const waitingPatients = (appointments || []).filter(
    (a) => a.status === 'CheckedIn' || a.status === 'InRoom'
  );

  return (
    <div style={{ color: 'var(--text-main)' }}>
      {/* Apple Clinical Telemetry Header */}
      <div className="apple-liquid-glass p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="apple-eyebrow">
              <Stethoscope size={13} /> CLINICAL DIAGNOSTICS
            </span>
            <span className="liquid-glass-pill" style={{ color: 'var(--primary)' }}>
              <span className="telemetry-pulse-dot" />
              TELEMETRY ONLINE • CLINICAL STATION 02
            </span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Veterinarian Consultation Hub
          </h2>
          <p className="text-sm text-muted mt-1">
            Conduct SOAP consultations, track live patient vitals, authorize verified electronic prescriptions, and review diagnostic imaging.
          </p>
        </div>

        {/* Rapid Clinical Dock Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to="/vet/consultation" className="apple-pill-btn apple-pill-btn-primary">
            <Stethoscope size={15} /> New SOAP Record
          </Link>
          <Link to="/vet/prescriptions" className="apple-pill-btn apple-pill-btn-secondary">
            <Pill size={15} /> Digital Rx Generator
          </Link>
          <Link to="/vet/vaccinations" className="apple-pill-btn apple-pill-btn-secondary">
            <Syringe size={15} /> Vaccinations
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4 mb-8">
        <StatCard
          label="Patients Waiting"
          value={waitingPatients.length}
          icon={Clock}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#F59E0B"
          trend="In clinic lobby"
        />
        <StatCard
          label="Consults Today"
          value={consultations.length}
          icon={Stethoscope}
          trend="Recorded"
          trendDirection="up"
        />
        <StatCard
          label="Total Scheduled"
          value={appointments.length}
          icon={Calendar}
          iconBg="rgba(14, 165, 233, 0.15)"
          iconColor="#0EA5E9"
          trend="Full day load"
        />
        <StatCard
          label="Prescriptions Issued"
          value={consultations.filter(c => c.prescriptionCount > 0 || c.status === 'Completed').length || consultations.length}
          icon={Pill}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8B5CF6"
          trend="100% verified"
        />
      </div>

      {/* Rescue Transfer Pipeline Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(42,140,130,0.06) 0%, rgba(245,158,11,0.06) 50%, rgba(239,68,68,0.04) 100%)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '0 0 auto' }}>
          <span className="text-xs font-bold uppercase tracking-wider text-muted">Rescue Care Pipeline</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Step 1: Vet */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: rescueCases.length > 0 ? 'var(--primary)' : 'var(--bg-subtle)',
              color: rescueCases.length > 0 ? '#fff' : 'var(--text-muted)',
              padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem', fontWeight: 700,
              border: '1px solid var(--border)',
            }}
          >
            <Stethoscope size={14} />
            Vet Assessment
            {rescueCases.length > 0 && (
              <span style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '999px', padding: '0 6px', fontSize: '0.75rem', fontWeight: 800 }}>
                {rescueCases.length}
              </span>
            )}
          </div>

          <ArrowRight size={16} color="var(--text-muted)" />

          {/* Step 2: Care Provider */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: passedToProviderCases.length > 0 ? '#D97706' : 'var(--bg-subtle)',
              color: passedToProviderCases.length > 0 ? '#fff' : 'var(--text-muted)',
              padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem', fontWeight: 700,
              border: '1px solid var(--border)',
            }}
          >
            <Scissors size={14} />
            Pet Care Provider
            {passedToProviderCases.length > 0 && (
              <span style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '999px', padding: '0 6px', fontSize: '0.75rem', fontWeight: 800 }}>
                {passedToProviderCases.length}
              </span>
            )}
          </div>

          <ArrowRight size={16} color="var(--text-muted)" />

          {/* Step 3: Rescue Officer */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem', fontWeight: 700,
              border: '1px solid var(--border)',
            }}
          >
            <Heart size={14} />
            Rescue Officer
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '260px', lineHeight: '1.4' }}>
          Once a vet assessment is complete and cleared, the animal moves to Pet Care Provider for grooming & rehab before being returned to the Rescue Officer.
        </div>
      </div>

      {/* Rescue Cases Awaiting Assessment — shown when cases are IN_TREATMENT */}
      {rescueCases.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.07)',
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} color="#F59E0B" />
              <h3 className="font-bold" style={{ color: '#92400E' }}>
                Rescue Cases Awaiting Veterinary Assessment ({rescueCases.length})
              </h3>
            </div>
            <Link to="/vet/patients" className="text-xs text-primary font-semibold flex items-center gap-1">
              View All Patients <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rescueCases.map(rc => (
              <div
                key={rc.caseId}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rc.coverPhotoUrl}
                    alt={rc.temporaryName}
                    style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-main">{rc.temporaryName}</span>
                      <span className="badge badge-warning text-xs">Rescue Case</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {rc.caseNumber} • {rc.species} • {rc.breed} • Intake: {rc.intakeDate}
                    </p>
                    <p className="text-xs text-muted">
                      Found at: {rc.rescueLocation}
                    </p>
                  </div>
                </div>
                <Link
                  to="/vet/consultation"
                  state={{ rescueCaseId: rc.caseId }}
                  className="btn btn-primary btn-sm"
                >
                  <Stethoscope size={14} /> Start Assessment
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Waiting Patients Grid */}
      <div className="grid-2">
        <Card
          title="Today's Consultation Schedule"
          subtitle="Waiting and active patients"
          icon={Calendar}
          actions={
            <Link to="/vet/schedule" className="text-xs text-primary font-semibold flex items-center gap-1">
              View Schedule <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {appointments.map((a) => (
              <div
                key={a.appointmentId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: a.status === 'InRoom' ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-main">{a.petName}</span>
                    <span className="badge badge-secondary font-mono text-xs">{a.tokenNumber}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {a.timeSlot} • {a.serviceType} • Owner: {a.ownerName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/vet/consultation?petName=${encodeURIComponent(a.petName)}&apptId=${a.appointmentId}`}
                    className="btn btn-primary btn-sm"
                  >
                    <Stethoscope size={14} /> Start Exam
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Tools Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Clinical Fast Actions" icon={Stethoscope}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/vet/patients" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <Search size={16} /> Patient Medical Record Search & History
              </Link>
              <Link to="/vet/consultation" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <Stethoscope size={16} /> Add Comprehensive SOAP Clinical Notes
              </Link>
              <Link to="/vet/prescriptions" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <Pill size={16} /> Generate & Sign Digital Prescription (Rx)
              </Link>
              <Link to="/vet/vaccinations" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <Syringe size={16} /> Administer Vaccine & Set Next Booster
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
