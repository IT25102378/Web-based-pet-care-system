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
} from 'lucide-react';

export const VetDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [rescueCases, setRescueCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVetData = async () => {
      try {
        const [appts, consults, rescueList] = await Promise.all([
          appointmentApi.getAppointments(),
          consultationApi.getConsultations(),
          rescueApi.getRescueCases(),
        ]);
        setAppointments(appts);
        setConsultations(consults);
        setRescueCases(rescueList.filter(r => r.status === RescueCaseStatus.IN_TREATMENT));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadVetData();
  }, []);

  const waitingPatients = appointments.filter(
    (a) => a.status === 'CheckedIn' || a.status === 'InRoom'
  );

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span className="badge badge-primary mb-1">CLINICAL WORKSPACE</span>
          <h2>Veterinarian Consultation Hub</h2>
          <p className="text-sm text-muted mt-1">
            Conduct SOAP consultations, record vital signs, generate digital prescriptions, and review diagnostic imaging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/vet/consultation" className="btn btn-primary">
            <Stethoscope size={16} /> New SOAP Consultation
          </Link>
          <Link to="/vet/prescriptions" className="btn btn-secondary">
            <Pill size={16} /> Digital Rx Generator
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
          value="12"
          icon={Pill}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8B5CF6"
          trend="100% verified"
        />
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
