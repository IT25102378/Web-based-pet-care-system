import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import { Mail, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email);
      setResetToken(result?.resetToken || null);
      setSubmitted(true);
      if (result?.resetToken) {
        showToast('Reset Link Ready', 'Continue to choose a new password.', 'success');
      } else {
        showToast('No Account Found', 'No account exists with this email address.', 'error');
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
      <div className="card p-8" style={{ maxWidth: '460px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2>Reset Password</h2>
          <p className="text-sm text-muted mt-1">Enter your account email to receive a password reset link</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--status-success)" style={{ margin: '0 auto 1rem' }} />
            <h4>{resetToken ? 'Reset Link Ready' : 'No Account Found'}</h4>
            <p className="text-sm text-muted mt-2">
              {resetToken
                ? <>A password reset link has been created for <strong>{email}</strong>. Continue to choose a new password.</>
                : <>No account exists with <strong>{email}</strong>. Check the address and try again.</>}
            </p>
            <div className="mt-6">
              {resetToken && (
                <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="btn btn-outline btn-sm mb-3">
                  Continue to Reset Password <ArrowRight size={14} />
                </Link>
              )}
              <div>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Account Email Address</label>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={loading}>
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-xs text-muted font-semibold flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
