import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { UserRole, UserRoleLabels, UserStatus } from '../../types';
import { Clock, ShieldCheck, ShieldAlert, CheckCircle2, Loader2, ArrowRight, RefreshCw, UserCheck } from 'lucide-react';

export const PendingApprovalPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { approvalLogin } = useAuth();
  const { showToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const tokenFromUrl = searchParams.get('token');
  const [token] = useState(() => tokenFromUrl || localStorage.getItem('petnexus_approval_token') || '');

  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState(null);
  const [status, setStatus] = useState('PendingApproval');
  const [rejectionReason, setRejectionReason] = useState(null);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const pollingRef = useRef(null);
  const isMountedRef = useRef(true);

  const getDashboardRoute = (role) => {
    switch (role) {
      case UserRole.PET_OWNER: return '/owner/overview';
      case UserRole.VETERINARIAN: return '/vet/schedule';
      case UserRole.CLINIC_STAFF: return '/staff/queue';
      case UserRole.RESCUE_OFFICER: return '/rescue/dashboard';
      case UserRole.PET_CARE_PROVIDER: return '/provider/dashboard';
      case UserRole.CLINIC_MANAGER: return '/manager/dashboard';
      case UserRole.ADMIN: return '/admin/dashboard';
      default: return '/';
    }
  };

  const handleApprovedAutoLogin = async (approvalToken, approvedRole) => {
    if (isProcessingLogin) return;
    setIsProcessingLogin(true);
    clearInterval(pollingRef.current);

    try {
      showToast('Approval Detected', 'Your account was approved by the Administrator! Authenticating...', 'success');
      const user = await approvalLogin(approvalToken);
      showToast('Welcome to Pet Nexus', `Signed in as ${user.fullName}`, 'success');
      navigate(getDashboardRoute(user.role || approvedRole));
    } catch (err) {
      setIsProcessingLogin(false);
      showToast('Authentication Error', err.message || 'Failed to complete auto-login. Please log in manually.', 'error');
    }
  };

  const checkStatus = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.getApprovalStatus(token);
      if (!isMountedRef.current) return;

      setApplicant(data);
      setStatus(data.status);
      setPollCount((prev) => prev + 1);
      setLoading(false);

      if (data.approved || data.status === UserStatus.ACTIVE || data.status === 'Active') {
        await handleApprovedAutoLogin(token, data.role);
      } else if (data.status === UserStatus.REJECTED || data.status === 'Rejected') {
        clearInterval(pollingRef.current);
        setRejectionReason(data.rejectionReason || 'Application documentation was not accepted.');
      } else if (data.status === UserStatus.SUSPENDED || data.status === 'Suspended') {
        clearInterval(pollingRef.current);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setLoading(false);
      // If token expired/invalid, stop polling
      if (err.status === 400 || err.status === 404) {
        clearInterval(pollingRef.current);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    checkStatus();

    // Poll every 3 seconds for approval status
    pollingRef.current = setInterval(() => {
      checkStatus();
    }, 3000);

    return () => {
      isMountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        <div className="card p-8" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--amber-subtle)',
              color: 'var(--status-warning)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <Clock size={32} />
          </div>
          <h2>No Active Approval Session</h2>
          <p className="text-muted text-sm mt-2 mb-6">
            We could not find an active pending-approval registration session on this browser. If you already have an approved account, please log in directly.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <div className="card p-8" style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
        {/* Approved State */}
        {status === 'Active' || isProcessingLogin ? (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-success-bg)',
                color: 'var(--status-success)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h2>Account Approved!</h2>
            <p className="text-muted text-sm mt-2 mb-4">
              Your application has been verified and approved by the clinic administrator.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: 'var(--status-success-bg)',
                color: 'var(--status-success)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <Loader2 className="animate-spin" size={20} />
              <span>Issuing secure credentials and redirecting to your dashboard...</span>
            </div>
          </div>
        ) : status === 'Rejected' ? (
          /* Rejected State */
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-danger-bg)',
                color: 'var(--status-danger)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <ShieldAlert size={36} />
            </div>
            <h2>Application Not Approved</h2>
            <p className="text-muted text-sm mt-2 mb-4">
              The clinic administration reviewed your application and was unable to approve it.
            </p>
            {rejectionReason && (
              <div
                style={{
                  backgroundColor: 'var(--status-danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                }}
              >
                <p className="text-xs font-bold" style={{ color: 'var(--status-danger)' }}>
                  Reason Provided:
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--status-danger)' }}>
                  {rejectionReason}
                </p>
              </div>
            )}
            <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Submit a New Application
            </Link>
          </div>
        ) : (
          /* Waiting for Approval State */
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--amber-subtle)',
                color: 'var(--status-warning)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                position: 'relative',
              }}
            >
              <Clock size={32} />
            </div>

            <h2>Waiting for Administrator Approval</h2>
            <p className="text-muted text-sm mt-2">
              Your email address has been verified. Your application is now queued for administrator review.
            </p>

            {/* Applicant Summary Card */}
            {applicant && (
              <div
                style={{
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  margin: '1.5rem 0',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <span className="text-muted block text-xs">Applicant Name</span>
                    <strong className="text-main">{applicant.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-muted block text-xs">Registered Role</span>
                    <span className="badge badge-info" style={{ marginTop: '2px' }}>
                      {UserRoleLabels[applicant.role] || applicant.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block text-xs">Account ID</span>
                    <span className="font-mono text-xs">{applicant.userId}</span>
                  </div>
                  <div>
                    <span className="text-muted block text-xs">Current Status</span>
                    <span className="badge badge-warning" style={{ marginTop: '2px' }}>
                      ⏳ Pending Approval
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Polling Indicator Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--primary-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.8rem',
                color: 'var(--primary)',
              }}
            >
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span>Monitoring approval status in real-time...</span>
              </div>
              <span className="text-xs text-muted">Checks: {pollCount}</span>
            </div>

            <p className="text-xs text-muted mb-6" style={{ lineHeight: '1.5' }}>
              <strong>Tip:</strong> Keep this browser window open. As soon as the Clinic Administrator approves your account from the administration portal, this screen will instantly log you in and take you straight to your workspace.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-color">
              <button
                type="button"
                onClick={checkStatus}
                className="btn btn-ghost btn-sm text-xs flex items-center gap-1"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Check Now
              </button>
              <Link to="/login" className="text-xs text-primary font-semibold">
                Return to Login Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
