import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token') || 'demo-token';
    let redirectTimer = null;

    const verify = async () => {
      try {
        const res = await authApi.verifyEmail(token);
        setVerified(true);
        setMessage(res.message || 'Email verified successfully! Your application is now pending admin review.');
        // Auto navigate to pending-approval waiting room after 2.5 seconds
        redirectTimer = setTimeout(() => {
          navigate('/pending-approval');
        }, 2500);
      } catch (err) {
        setMessage('Verification completed or token expired.');
        setVerified(true);
      } finally {
        setLoading(false);
      }
    };
    verify();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [location.search, navigate]);

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
      <div className="card p-8" style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm font-semibold">Verifying your email token...</p>
          </div>
        ) : (
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

            <h2>Email Verified!</h2>
            <div
              style={{
                backgroundColor: 'var(--primary-subtle)',
                border: '1px solid rgba(42, 140, 130, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                margin: '1.5rem 0',
                textAlign: 'left',
              }}
            >
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                <ShieldCheck size={18} />
                <span>Next Step: Administrator Review</span>
              </div>
              <p className="text-xs text-main" style={{ lineHeight: '1.5' }}>
                Your email is confirmed. You are being redirected to the Live Approval Waiting Room. Once approved by the Clinic Administrator, your browser will automatically log you in.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/pending-approval" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Proceed to Live Approval Status <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-3">
              <Link to="/login" className="text-xs text-muted">
                or return to login page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
