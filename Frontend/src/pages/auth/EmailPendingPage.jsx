import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export const EmailPendingPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || 'your email';

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
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <Mail size={32} />
        </div>

        <h2>Verify Your Email Address</h2>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          We sent a verification link to <strong className="text-main">{email}</strong>. Please check your inbox and click the link to confirm your email address.
        </p>

        <div
          style={{
            backgroundColor: 'var(--amber-subtle)',
            border: '1px solid rgba(244, 162, 97, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            margin: '2rem 0',
            textAlign: 'left',
          }}
        >
          <p className="text-xs font-semibold" style={{ color: 'var(--status-warning-text)' }}>
            DEMO SIMULATION TOOL:
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--status-warning-text)' }}>
            Since this is running in client test mode, click the button below to simulate opening the link from your email:
          </p>
          <Link
            to="/verify-email?token=demo-verification-token-9988"
            className="btn btn-warning btn-sm mt-3"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Simulate Clicking Email Verification Link <ArrowRight size={14} />
          </Link>
        </div>

        <Link to="/login" className="btn btn-ghost btn-sm">
          Return to Login Page
        </Link>
      </div>
    </div>
  );
};
