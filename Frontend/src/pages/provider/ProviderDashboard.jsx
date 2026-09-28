import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { careServiceApi } from '../../api/careServiceApi';
import { feedbackApi } from '../../api/feedbackApi';
import { rescueApi } from '../../api/rescueApi';
import { RescueCaseStatus } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import {
  Scissors,
  FileText,
  Layers,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  AlertTriangle,
  Stethoscope,
  Heart,
  Sparkles,
  Droplets,
  Home,
  Check,
} from 'lucide-react';

export const ProviderDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [rescueCases, setRescueCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuiteId, setSelectedSuiteId] = useState('suite-1');

  useEffect(() => {
    const loadProviderData = async () => {
      try {
        const [logsRes, pkgsRes, feedbackRes, rescueRes] = await Promise.allSettled([
          careServiceApi.getServiceLogs(),
          careServiceApi.getPackageBookings(),
          feedbackApi.getFeedbacks({ category: 'Grooming & Spa' }),
          rescueApi.getRescueCases(),
        ]);
        if (logsRes.status === 'fulfilled' && logsRes.value) setLogs(logsRes.value);
        if (pkgsRes.status === 'fulfilled' && pkgsRes.value) setPackages(pkgsRes.value);
        if (feedbackRes.status === 'fulfilled' && feedbackRes.value) setFeedbacks(feedbackRes.value);
        if (rescueRes.status === 'fulfilled' && rescueRes.value) {
          const completedLogs = (logsRes.status === 'fulfilled' && logsRes.value) ? logsRes.value : [];
          const completedCaseIds = new Set(
            completedLogs
              .filter(l => l.caseId && (l.status === 'Completed' || l.transferredToRescue || l.handedOverToRescue || l.notes?.includes('Transferred to Rescue Officer')))
              .map(l => l.caseId)
          );
          setRescueCases((rescueRes.value || []).filter(r => r.status === RescueCaseStatus.READY_FOR_FOSTER && !completedCaseIds.has(r.caseId)));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProviderData();
  }, []);

  const inProgressCount = (logs || []).filter((l) => l.status === 'InProgress' || l.status === 'CheckedIn').length + (rescueCases || []).length;
  const readyPickupCount = (logs || []).filter((l) => l.status === 'ReadyForPickup').length;
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / feedbacks.length).toFixed(1)
    : '5.0';

  const suites = [
    {
      id: 'suite-1',
      name: 'Spa Suite Alpha',
      type: 'Hydro-Aromatherapy Bay',
      petName: logs[0]?.petName || 'Bella',
      ownerName: logs[0]?.ownerName || 'Sarah Jenkins',
      service: logs[0]?.serviceType || 'Full Luxury Grooming & Coat De-shedding',
      status: 'Occupied',
      statusColor: '#0E8376',
      progressStep: 2,
      steps: [
        { label: 'Intake & Skin Barrier Health Check', status: 'completed' },
        { label: 'Organic Medicated Shampoo & Hydro-Massage', status: 'active' },
        { label: 'High-Velocity Warm Blowout & De-shedding', status: 'pending' },
        { label: 'Scissor Finish, Ear Polish & Pickup Dispatch', status: 'pending' },
      ],
    },
    {
      id: 'suite-2',
      name: 'Sanctuary Suite Beta',
      type: 'Precision Breed Styling Bay',
      petName: logs[1]?.petName || 'Milo',
      ownerName: logs[1]?.ownerName || 'David Chen',
      service: logs[1]?.serviceType || 'Teddy Bear Cut & Paw Care',
      status: 'Occupied',
      statusColor: '#0E8376',
      progressStep: 3,
      steps: [
        { label: 'Intake & Health Assessment', status: 'completed' },
        { label: 'Hydration Bath & Condition', status: 'completed' },
        { label: 'Hand-Scissor Teddy Bear Styling', status: 'active' },
        { label: 'Final Polish & Parent Alert', status: 'pending' },
      ],
    },
    {
      id: 'suite-3',
      name: 'Boarding Lodge 03',
      type: 'Quiet Luxury Recovery Suite',
      petName: rescueCases[0]?.temporaryName || 'Barnaby (Rescue)',
      ownerName: 'Foster Intake Hold',
      service: 'Post-Vet Boarding & Comfort Care',
      status: 'Reserved',
      statusColor: '#F59E0B',
      progressStep: 1,
      steps: [
        { label: 'Sanctuary Suite Sanitization', status: 'completed' },
        { label: 'Dietary Intake & Vitality Monitoring', status: 'active' },
        { label: 'Behavioral De-stress Enrichment', status: 'pending' },
        { label: 'Foster Parent Handover', status: 'pending' },
      ],
    },
    {
      id: 'suite-4',
      name: 'Express Bay Gamma',
      type: 'Rapid Wash & Polish',
      petName: null,
      ownerName: null,
      service: 'Available for walk-in appointment',
      status: 'Available',
      statusColor: '#10B981',
      progressStep: 0,
      steps: [],
    },
  ];

  const currentSuite = suites.find((s) => s.id === selectedSuiteId) || suites[0];

  return (
    <div>
      {/* Apple Liquid Glass Header Banner */}
      <div className="apple-liquid-glass p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="apple-eyebrow mb-1">CARE ATELIER & BOARDING SUITES</span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: '4px 0' }}>
            Pet Care Atelier & Boarding
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)', maxWidth: '640px' }}>
            Daily grooming assignments, hydrotherapy suite reservations, multi-step care progression, and client review feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/provider/logs" className="apple-pill-btn apple-pill-btn-primary">
            <Plus size={16} /> New Service Entry
          </Link>
          <Link to="/provider/status" className="apple-pill-btn apple-pill-btn-secondary">
            <Scissors size={16} /> Update Progress
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4 mb-8">
        <StatCard
          label="Active In-Salon / Care"
          value={inProgressCount}
          icon={Scissors}
          iconBg="rgba(14, 165, 233, 0.15)"
          iconColor="#0EA5E9"
          trend="In progress & intake queue"
        />
        <StatCard
          label="Ready For Pickup"
          value={readyPickupCount}
          icon={Clock}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#F59E0B"
          trend="Clients notified"
        />
        <StatCard
          label="Assigned Packages"
          value={packages.length}
          icon={Layers}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8B5CF6"
          trend="Enrolled clients"
        />
        <StatCard
          label="Provider Rating"
          value={avgRating}
          icon={Star}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#F59E0B"
          trend={`${feedbacks.length} client review${feedbacks.length === 1 ? '' : 's'}`}
          trendDirection="up"
        />
      </div>

      {/* Signature Apple Element: Spa & Boarding Suite Matrix + Care Step Checklist */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="apple-eyebrow">LIVE ATELIER TELEMETRY</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Suite Occupancy & Care Progression
            </h2>
          </div>
          <span className="text-xs text-muted">Click suite to monitor active steps</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Suite Occupancy Cards (2 cols) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {suites.map((suite) => {
              const isSelected = suite.id === selectedSuiteId;
              return (
                <div
                  key={suite.id}
                  className={`apple-suite-card cursor-pointer ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedSuiteId(suite.id)}
                  style={{
                    borderColor: isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.08)',
                    boxShadow: isSelected ? '0 8px 24px rgba(14, 131, 118, 0.12)' : 'var(--shadow-sm)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">
                      {suite.type}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: suite.status === 'Occupied' ? 'rgba(14, 131, 118, 0.12)' : suite.status === 'Reserved' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        color: suite.statusColor,
                        fontWeight: 600,
                        fontSize: '0.72rem',
                      }}
                    >
                      {suite.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-main mb-1">{suite.name}</h3>

                  {suite.petName ? (
                    <div>
                      <div className="text-sm font-semibold text-primary">{suite.petName}</div>
                      <div className="text-xs text-muted mt-0.5">{suite.service}</div>
                      <div className="text-xs text-muted mt-2 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        Client: {suite.ownerName}
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 text-xs text-muted italic">
                      Sanitized and ready for next walk-in appointment or boarding check-in.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Care Step Checklist for Current Suite */}
          <div className="apple-liquid-glass p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">Active Pipeline</span>
                  <h4 className="font-bold text-sm text-main">{currentSuite.name}</h4>
                </div>
                {currentSuite.petName && (
                  <span className="badge badge-primary text-xs" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                    {currentSuite.petName}
                  </span>
                )}
              </div>

              {currentSuite.steps.length > 0 ? (
                <div className="space-y-3">
                  {currentSuite.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`care-step-item ${step.status === 'completed' ? 'completed' : step.status === 'active' ? 'active' : ''}`}
                    >
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: '24px',
                          height: '24px',
                          background: step.status === 'completed' ? '#10B981' : step.status === 'active' ? 'var(--primary)' : 'rgba(0,0,0,0.08)',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {step.status === 'completed' ? <Check size={14} /> : idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: step.status === 'active' ? 700 : 500,
                            color: step.status === 'active' ? 'var(--primary)' : 'var(--text-main)',
                          }}
                        >
                          {step.label}
                        </div>
                        <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>
                          {step.status === 'completed' ? 'Step Finished ✓' : step.status === 'active' ? 'Currently Underway' : 'Queued'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-muted">
                  Bay is currently vacant. Select an occupied suite to view its live multi-step treatment checklist.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <Link to="/provider/status" className="apple-pill-btn apple-pill-btn-primary w-full text-center justify-center text-xs py-2">
                Advance Service Stage <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Rescue Cases Awaiting Care — Incoming from Veterinarian */}
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
          <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={18} color="#F59E0B" />
                <h3 className="font-bold" style={{ color: '#92400E' }}>
                  Incoming from Veterinarian — {rescueCases.length} Case{rescueCases.length !== 1 ? 's' : ''} Awaiting Care Intake
                </h3>
              </div>
              {/* Pipeline mini-badge */}
              <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Stethoscope size={11} /> Vet Assessment ✓
                </span>
                <ArrowRight size={12} />
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: '#D97706', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Scissors size={11} /> Pet Care Provider ← You are here
                </span>
                <ArrowRight size={12} />
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Heart size={11} /> Rescue Officer
                </span>
              </div>
            </div>
            <Link to="/provider/logs" className="text-xs text-primary font-semibold flex items-center gap-1">
              Go to Service Logs <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {rescueCases.map(rc => (
              <div
                key={rc.caseId}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div className="flex items-start gap-3" style={{ flex: 1, minWidth: 0 }}>
                  <img
                    src={rc.coverPhotoUrl}
                    alt={rc.temporaryName}
                    style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="flex items-center gap-2 mb-0.5" style={{ flexWrap: 'wrap' }}>
                      <span className="font-bold text-sm text-main">{rc.temporaryName}</span>
                      <span className="badge badge-success text-xs">Vet Cleared ✓</span>
                      {rc.conditionSeverity && (
                        <span
                          className="badge text-xs"
                          style={{
                            backgroundColor:
                              rc.conditionSeverity === 'Critical' ? 'rgba(239,68,68,0.12)' :
                              rc.conditionSeverity === 'High' ? 'rgba(245,158,11,0.12)' :
                              'rgba(14,165,233,0.1)',
                            color:
                              rc.conditionSeverity === 'Critical' ? '#DC2626' :
                              rc.conditionSeverity === 'High' ? '#D97706' :
                              '#0284C7',
                          }}
                        >
                          {rc.conditionSeverity} Severity
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {rc.caseNumber} • {rc.species} • {rc.breed} • Intake: {rc.intakeDate}
                    </p>
                    {rc.medicalSummary && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid #D97706',
                          fontSize: '0.75rem',
                          color: 'var(--text-main)',
                          lineHeight: 1.5,
                          maxWidth: '520px',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: '#92400E' }}>Vet Notes: </span>
                        {rc.medicalSummary}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  to="/provider/logs"
                  state={{ rescueCaseId: rc.caseId, autoOpen: true }}
                  className="btn btn-warning btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  <Scissors size={14} /> Begin Care & Grooming
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Logs & Assigned Packages Grid */}
      <div className="grid-2">
        <Card
          title="Today's Care Service Queue"
          subtitle="Grooming & spa assignments"
          icon={Scissors}
          actions={
            <Link to="/provider/logs" className="text-xs text-primary font-semibold flex items-center gap-1">
              View All Logs <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {logs.map((log) => (
              <div
                key={log.serviceLogId}
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
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-main">{log.petName}</span>
                    {log.caseId && (
                      <span className="badge badge-warning text-xs" style={{ fontSize: '0.65rem' }}>
                        🐾 Rescue
                      </span>
                    )}
                    <StatusBadge status={log.status} />
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {log.serviceType} • {log.caseId ? `Case #${log.caseId}` : `Owner: ${log.ownerName}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {log.caseId && (log.transferredToRescue || log.handedOverToRescue || log.notes?.includes('Transferred to Rescue Officer')) ? (
                    <span
                      className="badge badge-success text-xs flex items-center gap-1"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                    >
                      <Check size={12} /> Transferred to Rescue
                    </span>
                  ) : log.caseId && log.status === 'Completed' ? (
                    <Link
                      to="/provider/logs"
                      state={{ transferCaseId: log.caseId, transferLogId: log.serviceLogId }}
                      className="btn btn-warning btn-sm"
                    >
                      Transfer to Rescue
                    </Link>
                  ) : (
                    <Link to="/provider/status" className="btn btn-secondary btn-sm">
                      Update
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Client Reviews for Provider */}
        <Card
          title="Care Provider Reviews"
          subtitle="Ratings from pet parents"
          icon={Star}
          actions={
            <Link to="/provider/feedback" className="text-xs text-primary font-semibold flex items-center gap-1">
              All Reviews <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {feedbacks.map((f) => (
              <div key={f.feedbackId} style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-main">{f.userName}</span>
                  <div className="flex items-center gap-1 text-xs text-amber font-bold">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" /> {f.rating}/5
                  </div>
                </div>
                <p className="text-xs text-muted" style={{ lineHeight: '1.4' }}>{f.comments}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
