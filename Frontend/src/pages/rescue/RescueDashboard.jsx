import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rescueApi } from '../../api/rescueApi';
import { adoptionApi } from '../../api/adoptionApi';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import { PublishListingModal } from '../../components/common/PublishListingModal';
import {
  Activity,
  PlusCircle,
  FolderOpen,
  Home,
  FileCheck,
  Heart,
  ArrowRight,
  ShieldAlert,
  Globe,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  MapPin,
  User,
} from 'lucide-react';

export const RescueDashboard = () => {
  const [cases, setCases] = useState([]);
  const [applications, setApplications] = useState([]);
  const [fosters, setFosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseForListing, setSelectedCaseForListing] = useState(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [caseRes, appRes, fosterRes] = await Promise.allSettled([
          rescueApi.getRescueCases(),
          adoptionApi.getAdoptionApplications(),
          rescueApi.getFosterRecords(),
        ]);
        if (caseRes.status === 'fulfilled' && caseRes.value) setCases(caseRes.value);
        if (appRes.status === 'fulfilled' && appRes.value) setApplications(appRes.value);
        if (fosterRes.status === 'fulfilled' && fosterRes.value) setFosters(fosterRes.value);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const reportedPendingCases = (cases || []).filter((c) => c.status === 'Reported');
  const inTreatmentCount = (cases || []).filter((c) => c.status === 'InTreatment').length;
  const inFosterCount = (cases || []).filter((c) => c.status === 'InFoster').length;
  const readyAdoptionCount = (cases || []).filter((c) => c.status === 'ReadyForAdoption').length;
  const pendingReviewApps = (applications || []).filter(
    (a) => a.status === 'Submitted' || a.status === 'UnderReview'
  ).length;
  const awaitingAdoptionListing = (cases || []).filter(
    (c) => (c.status === 'ReadyForAdoption' || c.status === 'InFoster') && !c.isPublishedForAdoption
  );

  return (
    <div>
      {/* Apple Liquid Glass Header Banner */}
      <div className="apple-liquid-glass p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="apple-eyebrow mb-1">WILDLIFE & RESCUE TELEMETRY</span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: '4px 0' }}>
            Rescue Operations & Dispatch
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)', maxWidth: '640px' }}>
            Emergency intake sweeps, medical rehabilitation pipeline, foster sanctuary capacity, and adoption reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/rescue/register-case" className="apple-pill-btn apple-pill-btn-primary" style={{ background: '#E76F51' }}>
            <PlusCircle size={16} /> Register Intake
          </Link>
          <Link to="/rescue/applications" className="apple-pill-btn apple-pill-btn-secondary">
            <FileCheck size={16} /> Applications ({pendingReviewApps})
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

      {/* Signature Apple Element: Rescue Incident Dispatch Radar & Foster Capacity Beacon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Real-time Field Dispatch Radar (2 cols) */}
        <div className="apple-radar-beacon apple-liquid-glass-dark lg:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2">
              <span className="sos-beacon-dot"></span>
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#F87171', fontWeight: 800 }}>
                ACTIVE RESCUE RADAR • REAL-TIME DISPATCH
              </span>
            </div>
            <div className="text-xs opacity-75 font-mono text-white">
              GPS Latency: 24ms • Grid Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Incoming Field Reports</div>
              <div className="text-4xl font-extrabold text-white tracking-tight">
                {reportedPendingCases.length}
              </div>
              <div className="text-xs mt-1" style={{ color: reportedPendingCases.length > 0 ? '#F87171' : '#10B981' }}>
                {reportedPendingCases.length > 0 ? 'Urgent triage required' : 'All field cases assigned ✓'}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Rehabilitation Stage</div>
              <div className="text-sm font-semibold text-white">
                {inTreatmentCount} in Vet Rehab • {inFosterCount} in Foster
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {readyAdoptionCount} companions awaiting adoption placement
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to="/rescue/cases"
                className="apple-pill-btn apple-pill-btn-primary w-full text-center justify-center text-xs py-2"
                style={{ background: '#E76F51', color: '#FFFFFF' }}
              >
                Launch Dispatch Sweep <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Foster Sanctuary Capacity Barometer */}
        <div className="apple-liquid-glass p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="apple-eyebrow">SANCTUARY CAPACITY</span>
              <span className="badge badge-primary text-xs" style={{ background: 'rgba(14, 131, 118, 0.1)', color: 'var(--primary)' }}>
                {fosters.length} HOMES ACTIVE
              </span>
            </div>

            <h3 className="text-lg font-bold text-main mb-1">Foster Parent Barometer</h3>
            <p className="text-xs text-muted mb-4">
              Current network occupancy across registered foster caregivers.
            </p>

            {/* Capacity meter */}
            <div className="mb-2">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-muted">Occupancy ({inFosterCount} of 15 slots)</span>
                <span className="text-primary font-bold">{Math.round((inFosterCount / 15) * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: '#F5F5F7', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round((inFosterCount / 15) * 100))}%`,
                    background: 'linear-gradient(90deg, #0E8376, #10B981)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Link
              to="/rescue/foster"
              className="text-xs font-semibold text-primary flex items-center justify-between"
            >
              <span>Manage Foster Parent Network</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Incoming Community Rescue Reports Queue (Pet Owner -> Rescue Officer Triage) */}
      {reportedPendingCases.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(231, 111, 81, 0.1)',
            border: '2px solid rgba(231, 111, 81, 0.45)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={22} color="var(--accent)" />
              <h3 className="font-bold" style={{ color: 'var(--accent)', fontSize: '1.25rem' }}>
                🚨 Incoming Pet Owner Rescue Reports ({reportedPendingCases.length})
              </h3>
            </div>
            <Link to="/rescue/cases" className="btn btn-accent btn-sm">
              Review & Admit All ({reportedPendingCases.length}) <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-sm text-muted mb-4">
            Pet owners have reported animals needing urgent rescue. Click <strong>"Accept & Add to Rescued List"</strong> to admit them into the clinical intake assessment roster and notify the pet owner.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {reportedPendingCases.map((rc) => (
              <div
                key={rc.caseId}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid rgba(231, 111, 81, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={rc.coverPhotoUrl}
                      alt={rc.temporaryName}
                      style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <h4 className="text-base font-bold text-main">{rc.temporaryName}</h4>
                      <p className="text-xs text-muted">{rc.species} • {rc.breed}</p>
                    </div>
                  </div>
                  <span className={`badge ${rc.conditionSeverity === 'Critical' || rc.conditionSeverity === 'High' ? 'badge-danger' : 'badge-warning'}`}>
                    {rc.conditionSeverity}
                  </span>
                </div>

                <div className="text-xs text-muted" style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <MapPin size={13} style={{ color: 'var(--accent)' }} /> <strong>Location:</strong> {rc.rescueLocation}
                  </div>
                  {rc.reportedByUserName && (
                    <div className="flex items-center gap-1">
                      <User size={13} style={{ color: 'var(--primary)' }} /> <strong>Reporter:</strong> {rc.reportedByUserName}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link to={`/rescue/cases/${rc.caseId}`} className="text-xs text-primary font-semibold">
                    View Sighting Details →
                  </Link>

                  <button
                    type="button"
                    className="btn btn-accent btn-sm flex items-center gap-1"
                    onClick={async () => {
                      try {
                        await rescueApi.acceptRescueReport(rc.caseId, 'Received by rescue officer via Dashboard quick admission.');
                        const [caseRes] = await Promise.allSettled([rescueApi.getRescueCases()]);
                        if (caseRes.status === 'fulfilled') setCases(caseRes.value);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    style={{ fontWeight: 700 }}
                  >
                    <CheckCircle size={14} /> Accept & Add to List
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready for Adoption Listing Queue — received from Pet Care Provider / In Foster */}
      {awaitingAdoptionListing.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(231, 111, 81, 0.08)',
            border: '1.5px solid rgba(231, 111, 81, 0.35)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={20} color="var(--accent)" />
              <h3 className="font-bold" style={{ color: 'var(--accent)' }}>
                Companions Ready for Public Adoption Listing ({awaitingAdoptionListing.length})
              </h3>
            </div>
            <Link to="/rescue/listings" className="text-xs text-primary font-semibold flex items-center gap-1">
              Manage All Listings <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-xs text-muted mb-4">
            These companions have received full veterinary clearance and pet care provider rehabilitation. Publish their adoption listings to activate public visibility in the Adoptable Pets Gallery.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {awaitingAdoptionListing.map((rc) => (
              <div
                key={rc.caseId}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(231, 111, 81, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                    <h4 className="text-sm font-bold text-main">{rc.temporaryName}</h4>
                    <p className="text-xs text-muted">{rc.species} • {rc.breed}</p>
                    <StatusBadge status={rc.status} />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-accent btn-sm flex items-center gap-1"
                  onClick={() => {
                    setSelectedCaseForListing(rc);
                    setIsListingModalOpen(true);
                  }}
                >
                  <Heart size={13} fill="#FFFFFF" /> List for Adoption
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  {(c.status === 'ReadyForAdoption' || c.status === 'InFoster') && !c.isPublishedForAdoption ? (
                    <button
                      type="button"
                      className="btn btn-accent btn-sm flex items-center gap-1"
                      onClick={() => {
                        setSelectedCaseForListing(c);
                        setIsListingModalOpen(true);
                      }}
                    >
                      <Heart size={12} fill="#FFFFFF" /> List for Adoption
                    </button>
                  ) : c.isPublishedForAdoption ? (
                    <span className="badge badge-success text-xs flex items-center gap-1">
                      <Globe size={11} /> Live Listing
                    </span>
                  ) : null}
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

      <PublishListingModal
        isOpen={isListingModalOpen}
        onClose={() => {
          setIsListingModalOpen(false);
          setSelectedCaseForListing(null);
        }}
        rescueCase={selectedCaseForListing}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
