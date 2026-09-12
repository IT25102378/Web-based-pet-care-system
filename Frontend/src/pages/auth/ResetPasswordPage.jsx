import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { validatePassword, validatePasswordConfirmation } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import { Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ResetPasswordPage = () => {
  const { showToast } = useToast();
  const navigate    = useNavigate();
  const location    = useLocation();

  // Read the reset token from the URL: /reset-password?token=...
  const resetToken  = new URLSearchParams(location.search).get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(password);
    if (passwordError) {
      showToast('Validation Error', passwordError, 'error');
      return;
    }
    const confirmationError = validatePasswordConfirmation(password, confirmPassword);
    if (confirmationError) {
      showToast('Validation Error', confirmationError, 'error');
      return;
    }

    setLoading(true);
    try {
      // The token arrives as a query parameter from the forgot-password screen.
      if (!resetToken) {
        showToast('Invalid Link', 'No reset token found in the URL. Please request a new password reset link.', 'error');
        return;
      }
      await authApi.resetPassword(resetToken, password);
      showToast('Password Changed', 'Your password was updated. You can now log in.', 'success');
      navigate('/login');
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
          <h2>Set New Password</h2>
          <p className="text-sm text-muted mt-1">Create a secure password for your Pet Nexus account</p>
        </div>

        {/* Warning if no reset token in URL */}
        {!resetToken && (
          <div style={{ backgroundColor: 'var(--status-warning-bg)', border: '1px solid var(--status-warning)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={16} color="var(--status-warning)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--status-warning-text)', lineHeight: 1.4 }}>
              No reset token found. Password-reset email delivery is not yet enabled.
              Please contact your administrator to reset your password manually.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={loading}>
            {loading ? 'Updating Password...' : 'Save & Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};
