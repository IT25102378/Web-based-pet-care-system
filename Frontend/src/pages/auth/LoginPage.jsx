import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole, UserStatus } from '../../types';
import { authApi } from '../../api/authApi';
import { Heart, Lock, Mail, Clock, ShieldAlert } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusError, setStatusError] = useState(null); // { type, message, reason }

  const redirectParam = new URLSearchParams(location.search).get('redirect');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      showToast('Welcome Back', `Logged in as ${user.fullName}`, 'success');
      navigate(getDashboardRoute(user.role));
    } catch (err) {
      // In real-backend mode, detect account status from the error message.
      // In mock mode, err.code is already set by authApi.
      const code = err.code || authApi.detectStatusCode(err.message);

      if (code === 'PENDING_APPROVAL') {
        setStatusError({
          type: 'pending_approval',
          title: 'Account Awaiting Admin Approval',
          message:
            'Your registration has been submitted and is currently being verified by the clinic administration team. You will receive an email confirmation once reviewed.',
        });
      } else if (code === 'REJECTED') {
        setStatusError({
          type: 'rejected',
          title: 'Application Rejected',
          message: 'Your application to join Pet Nexus was not approved.',
          reason: err.rejectionReason || undefined,
        });
      } else if (code === 'PENDING_EMAIL') {
        setStatusError({
          type: 'pending_email',
          title: 'Email Verification Required',
          message: 'Please verify your email address to proceed with your application.',
        });
      } else if (code === 'SUSPENDED') {
        setStatusError({
          type: 'rejected',
          title: 'Account Suspended',
          message: err.message || 'Your account has been suspended. Please contact the clinic administrator.',
        });
      } else {
        showToast('Login Failed', err.message || 'An unexpected error occurred.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };


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
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}
          >
            <Heart size={26} fill="#FFFFFF" />
          </div>
          <h2>Sign in to Pet Nexus</h2>
          <p className="text-sm mt-1">Access your pet health records or staff clinical dashboard</p>
        </div>

        {/* Status Error Alert Box */}
        {statusError && (
          <div
            style={{
              backgroundColor: statusError.type === 'rejected' ? 'var(--status-danger-bg)' : 'var(--status-warning-bg)',
              border: `1px solid ${statusError.type === 'rejected' ? 'var(--status-danger)' : 'var(--status-warning)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {statusError.type === 'rejected' ? (
                <ShieldAlert size={22} color="var(--status-danger)" />
              ) : (
                <Clock size={22} color="var(--status-warning)" />
              )}
            </div>
            <div>
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: statusError.type === 'rejected' ? 'var(--status-danger-text)' : 'var(--status-warning-text)',
                  marginBottom: '0.25rem',
                }}
              >
                {statusError.title}
              </h4>
              <p
                style={{
                  fontSize: '0.825rem',
                  color: statusError.type === 'rejected' ? 'var(--status-danger-text)' : 'var(--status-warning-text)',
                  lineHeight: '1.4',
                }}
              >
                {statusError.message}
              </p>
              {statusError.reason && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.775rem',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <strong>Reason given:</strong> {statusError.reason}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="card p-6">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@petnexus.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>


        </div>

        <p className="text-center text-sm text-muted mt-4">
          Don’t have an account yet?{' '}
          <Link to="/register" className="font-semibold text-primary">
            Register for Pet Nexus
          </Link>
        </p>
      </div>
    </div>
  );
};
