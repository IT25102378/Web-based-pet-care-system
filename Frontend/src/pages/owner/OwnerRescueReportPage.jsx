import React, { useState, useEffect } from 'react';
import { rescueApi } from '../../api/rescueApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import {
  AlertTriangle,
  Send,
  MapPin,
  Camera,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  Phone,
  User,
  HeartHandshake,
} from 'lucide-react';

export const OwnerRescueReportPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    species: 'Dog',
    breed: '',
    temporaryName: '',
    gender: 'Unknown',
    estimatedAge: '',
    rescueLocation: '',
    conditionSeverity: 'Moderate',
    description: '',
    medicalSummary: '',
    coverPhotoUrl: '',
    reportedByUserPhone: currentUser?.phoneNumber || '',
  });

  const loadMyReports = async () => {
    try {
      if (currentUser?.userId) {
        const cases = await rescueApi.getRescueCases({ reportedByUserId: currentUser.userId });
        setMyReports(cases || []);
      }
    } catch (err) {
      console.error('Failed to load user rescue reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyReports();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rescueLocation.trim()) {
      showToast('Validation Error', 'Please specify the location where the animal was sighted.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        temporaryName: formData.temporaryName.trim() || `Reported ${formData.species} (${formData.rescueLocation})`,
        reportedByUserId: currentUser?.userId,
        reportedByUserName: currentUser?.fullName || currentUser?.name || 'Pet Owner',
        reportedByUserPhone: formData.reportedByUserPhone.trim() || currentUser?.phoneNumber || '',
        coverPhotoUrl: formData.coverPhotoUrl.trim() || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop',
      };

      await rescueApi.reportAnimalForRescue(payload);
      showToast(
        'Rescue Report Submitted!',
        'Your report has been received and dispatched to our on-duty Rescue Officers.',
        'success'
      );

      // Reset form
      setFormData({
        species: 'Dog',
        breed: '',
        temporaryName: '',
        gender: 'Unknown',
        estimatedAge: '',
        rescueLocation: '',
        conditionSeverity: 'Moderate',
        description: '',
        medicalSummary: '',
        coverPhotoUrl: '',
        reportedByUserPhone: currentUser?.phoneNumber || '',
      });

      loadMyReports();
    } catch (err) {
      showToast('Submission Failed', err.message || 'Unable to submit rescue report.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
          <span className="badge badge-danger mb-1 flex items-center gap-1" style={{ display: 'inline-flex' }}>
            <AlertTriangle size={14} /> COMMUNITY RESCUE DISPATCH
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Report an Animal Needing Rescue
          </h2>
          <p className="text-base text-muted mt-1" style={{ maxWidth: '750px' }}>
            Spotted a stray, injured, or abandoned animal in distress? File a rapid rescue alert here.
            Our dedicated <strong>Rescue Officers</strong> will review the case, accept it into the clinical intake queue,
            and keep you notified of their care journey.
          </p>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
        {/* Report Form */}
        <Card
          title="Animal Sighting & Rescue Form"
          subtitle="Provide as much accurate detail as possible to help officers locate and rescue the animal"
          icon={AlertTriangle}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Animal Species <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <select
                  name="species"
                  className="form-select"
                  value={formData.species}
                  onChange={handleChange}
                  required
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other / Wildlife</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Urgency / Condition Severity <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <select
                  name="conditionSeverity"
                  className="form-select"
                  value={formData.conditionSeverity}
                  onChange={handleChange}
                  required
                >
                  <option value="Critical">Critical (Immediate danger / severe injury)</option>
                  <option value="High">High (Noticeable wounds / malnutrition)</option>
                  <option value="Moderate">Moderate (Stray / roaming / needs care)</option>
                  <option value="Low">Low (Healthy stray / safe for now)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Rescue Location / Exact Sighting Spot <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  name="rescueLocation"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g., Near Viharamahadevi Park Entrance, Colombo 07"
                  value={formData.rescueLocation}
                  onChange={handleChange}
                  required
                />
              </div>
              <span className="text-xs text-muted mt-1 block">
                Include nearby landmarks, cross streets, or building names to guide rescue officers.
              </span>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Temporary Nickname (Optional)
                </label>
                <input
                  type="text"
                  name="temporaryName"
                  className="form-input"
                  placeholder="e.g., Brownie, Park Puppy"
                  value={formData.temporaryName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Estimated Breed / Appearance
                </label>
                <input
                  type="text"
                  name="breed"
                  className="form-input"
                  placeholder="e.g., Golden Mix, Tabby, Stray Hound"
                  value={formData.breed}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Gender (if observed)
                </label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                  <option value="Unknown">Unknown</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Your Contact Phone (for Officer Follow-up)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="tel"
                    name="reportedByUserPhone"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    placeholder="e.g., +94 77 123 4567"
                    value={formData.reportedByUserPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Situation & Behavior Notes
              </label>
              <textarea
                name="description"
                className="form-textarea"
                rows={3}
                placeholder="Describe how the animal is acting (fearful, friendly, limping, trapped, mother with pups, etc.)"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Visible Injuries or Medical Concerns
              </label>
              <input
                type="text"
                name="medicalSummary"
                className="form-input"
                placeholder="e.g., Bleeding paw, extreme dehydration, skin lesions"
                value={formData.medicalSummary}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                Photo URL (Field Evidence / Sighting)
              </label>
              <div style={{ position: 'relative' }}>
                <Camera
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="url"
                  name="coverPhotoUrl"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="https://images.unsplash.com/... (or image web link)"
                  value={formData.coverPhotoUrl}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-lg w-full flex items-center justify-center gap-2 mt-2"
              disabled={submitting}
              style={{ fontWeight: 700 }}
            >
              <Send size={18} /> {submitting ? 'Submitting Rescue Alert...' : 'Submit Animal Rescue Report'}
            </button>
          </form>
        </Card>

        {/* Status Tracker of User's Submitted Reports */}
        <div>
          <Card
            title="My Rescue Reports & Intake Status"
            subtitle="Track whether rescue officers have received and admitted your reported animals"
            icon={Clock}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <p className="text-muted">Loading your rescue reports...</p>
              </div>
            ) : myReports.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border)',
                }}
              >
                <HeartHandshake size={44} style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  No Rescue Reports Filed Yet
                </h4>
                <p className="text-sm text-muted" style={{ maxWidth: '380px', margin: '0 auto' }}>
                  Whenever you spot an animal in distress, use the form on the left. Once submitted, its status and officer admission updates will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myReports.map((report) => {
                  const isAccepted = report.status !== 'Reported';

                  return (
                    <div
                      key={report.caseId}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: isAccepted ? '1.5px solid rgba(42, 140, 130, 0.4)' : '1.5px solid rgba(224, 86, 36, 0.35)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={report.coverPhotoUrl}
                            alt={report.temporaryName}
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: 'var(--radius-md)',
                              objectFit: 'cover',
                            }}
                          />
                          <div>
                            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                              {report.temporaryName}
                            </h4>
                            <div className="text-xs text-muted">
                              Case #: <strong>{report.caseNumber}</strong> • {report.species} ({report.breed})
                            </div>
                          </div>
                        </div>

                        <StatusBadge status={report.status} />
                      </div>

                      <div
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.65rem 0.85rem',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div className="flex items-center gap-1.5 text-muted mb-1">
                          <MapPin size={14} style={{ color: 'var(--accent)' }} />
                          <strong style={{ color: 'var(--text-main)' }}>Location:</strong> {report.rescueLocation}
                        </div>
                        {report.medicalSummary && (
                          <div className="text-xs text-muted">
                            <strong>Observed Condition:</strong> {report.medicalSummary}
                          </div>
                        )}
                      </div>

                      {/* Official Officer Admission Alert */}
                      {isAccepted ? (
                        <div
                          style={{
                            backgroundColor: 'rgba(42, 140, 130, 0.08)',
                            border: '1px solid rgba(42, 140, 130, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          <CheckCircle size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                              Accepted & Added to Rescued Animals List!
                            </div>
                            <div className="text-xs text-muted">
                              Assigned Officer: <strong>{report.intakeOfficer || 'Rescue Team'}</strong> • Current Stage:{' '}
                              <strong>{report.status}</strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: 'rgba(231, 111, 81, 0.08)',
                            border: '1px solid rgba(231, 111, 81, 0.25)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          <Clock size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--accent)' }}>
                              Pending Rescue Officer Review
                            </div>
                            <div className="text-xs text-muted">
                              Our rescue officers have received this alert and are preparing triage & field collection.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
