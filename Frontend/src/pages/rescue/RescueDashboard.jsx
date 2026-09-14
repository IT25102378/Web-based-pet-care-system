import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rescueApi } from '../../api/rescueApi';
import { adoptionApi } from '../../api/adoptionApi';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import {
  Activity,
  PlusCircle,
  FolderOpen,
  Home,
  FileCheck,
  Heart,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AdoptionApplicationStatus } from '../../types';

export const RescueDashboard = () => {
  const [cases, setCases] = useState([]);
  const [applications, setApplications] = useState([]);
  const [fosters, setFosters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [caseList, appList, fosterList] = await Promise.all([
          rescueApi.getRescueCases(),
          adoptionApi.getAdoptionApplications(),
          rescueApi.getFosterRecords(),
        ]);
        setCases(caseList);
        setApplications(appList);
        setFosters(fosterList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const inTreatmentCount = cases.filter((c) => c.status === 'InTreatment').length;
  const inFosterCount = cases.filter((c) => c.status === 'InFoster').length;
  const readyAdoptionCount = cases.filter((c) => c.status === 'ReadyForAdoption').length;
  const pendingReviewApps = applications.filter(
    (a) => a.status === AdoptionApplicationStatus.SUBMITTED
      || a.status === AdoptionApplicationStatus.UNDER_REVIEW
  ).length;

  return (
    <div>
      {/* Welcome Banner */}
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
          <span className="badge badge-warning mb-1">ANIMAL WELFARE & RESCUE</span>
          <h2>Rescue Operations Center</h2>
          <p className="text-sm text-muted mt-1">
            Track rescue field intakes, medical rehabilitation timelines, foster placements, and adoption screening reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/rescue/register-case" className="btn btn-accent">
            <PlusCircle size={16} /> Register New Intake
          </Link>
          <Link to="/rescue/applications" className="btn btn-primary">
            <FileCheck size={16} /> Review Applications ({pendingReviewApps})
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4 mb-8">
        <StatCard
          label="Total Active Cases"
          value={cases.length}
          icon={FolderOpen}
          trend="In system"
          trendDirection="up"
        />
        <StatCard
          label="In Medical Rehab"
          value={inTreatmentCount}
          icon={Activity}
          iconBg="rgba(14, 165, 233, 0.15)"
          iconColor="#0EA5E9"
          trend="Under Dr. Chen"
        />
        <StatCard
          label="In Foster Care"
          value={inFosterCount}
          icon={Home}
          iconBg="rgba(139, 92, 246, 0.15)"
          iconColor="#8B5CF6"
          trend={`${fosters.length} active fosters`}
        />
        <StatCard
          label="Ready For Adoption"
          value={readyAdoptionCount}
          icon={Heart}
          iconBg="rgba(231, 111, 81, 0.15)"
          iconColor="var(--accent)"
          trend="Published to gallery"
        />
      </div>

      {/* Recent Cases & Application Reviews */}
      <div className="grid-2">
        {/* Active Rescue Cases */}
        <Card
          title="Active Rescue Cases"
          subtitle="Recent intakes and status"
          icon={FolderOpen}
          actions={
            <Link to="/rescue/cases" className="text-xs text-primary font-semibold flex items-center gap-1">
              View All Cases <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cases.slice(0, 4).map((c) => (
              <div
                key={c.caseId}
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
                    src={c.coverPhotoUrl}
                    alt={c.temporaryName}
                    style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-main">{c.temporaryName}</h4>
                    <p className="text-xs text-muted">{c.caseNumber} • {c.species} ({c.breed})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <Link to={`/rescue/cases/${c.caseId}`} className="btn btn-secondary btn-sm">
                    Timeline
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Adoption Applications Queue */}
        <Card
          title="Pending Adoption Applications"
          subtitle="Screening & document review"
          icon={FileCheck}
          actions={
            <Link to="/rescue/applications" className="text-xs text-primary font-semibold flex items-center gap-1">
              Review All ({applications.length}) <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((app) => (
              <div
                key={app.applicationId}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-main">
                    {app.applicantName} → {app.petName}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-xs text-muted">
                  Housing: {app.housingType} • Experience: {app.petExperienceYears} yrs
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-top" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <span className="text-xs text-primary font-semibold">Ref: {app.applicationId}</span>
                  <Link to="/rescue/applications" className="btn btn-accent btn-sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                    Inspect Documents & Signoff
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
