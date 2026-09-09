import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import { Lock, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Validation Error', 'Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword('demo-token', password);
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
