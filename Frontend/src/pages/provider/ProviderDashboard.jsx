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
} from 'lucide-react';

export const ProviderDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [rescueCases, setRescueCases] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setRescueCases((rescueRes.value || []).filter(r => r.status === RescueCaseStatus.READY_FOR_FOSTER));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProviderData();
  }, []);

  const inProgressCount = (logs || []).filter((l) => l.status === 'InProgress' || l.status === 'CheckedIn').length;
  const readyPickupCount = (logs || []).filter((l) => l.status === 'ReadyForPickup').length;

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
          <span className="badge badge-primary mb-1">PET CARE SERVICES</span>
          <h2>Grooming, Boarding & Training Hub</h2>
          <p className="text-sm text-muted mt-1">
            Manage daily grooming assignments, update service progression, track prepaid package sessions, and review client feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/provider/logs" className="btn btn-primary">
            <Plus size={16} /> New Service Log
          </Link>
          <Link to="/provider/status" className="btn btn-secondary">
            <Scissors size={16} /> Update Service Status
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
          trend="In progress"
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
          value="5.0"
          icon={Star}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#F59E0B"
          trend="100% positive"
          trendDirection="up"
        />
      </div>

      {/* Rescue Cases Awaiting Care — shown when cases are READY_FOR_FOSTER */}
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
                Rescue Cases Awaiting Care ({rescueCases.length})
              </h3>
            </div>
            <Link to="/provider/logs" className="text-xs text-primary font-semibold flex items-center gap-1">
              Go to Service Logs <ArrowRight size={12} />
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
                      <span className="badge badge-warning text-xs">Vet Cleared</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {rc.caseNumber} • {rc.species} • {rc.breed}
                    </p>
                    <p className="text-xs text-muted">{rc.medicalSummary}</p>
                  </div>
                </div>
                <Link
                  to="/provider/logs"
                  state={{ rescueCaseId: rc.caseId, autoOpen: true }}
                  className="btn btn-warning btn-sm"
                >
                  <Scissors size={14} /> Service & Return to Rescue
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
                  {log.caseId && log.status === 'Completed' ? (
                    <Link to="/provider/logs" className="btn btn-warning btn-sm">
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
