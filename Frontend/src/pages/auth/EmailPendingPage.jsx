import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

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
          <ShieldCheck size={32} />
        </div>

        <h2>Pending Administrator Verification</h2>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Your registration for <strong className="text-main">{email}</strong> has been transferred directly to the Clinic Administrator review queue.
        </p>

        <div
          style={{
            backgroundColor: 'var(--primary-subtle)',
            border: '1px solid rgba(42, 140, 130, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            margin: '2rem 0',
            textAlign: 'left',
          }}
        >
          <p className="text-xs font-semibold text-primary">
            ADMINISTRATOR APPROVAL REQUIRED:
          </p>
          <p className="text-xs mt-1 text-main">
            Email verification is not required. You can track your approval status in real-time or wait for administrator activation.
          </p>
          <Link
            to="/pending-approval"
            className="btn btn-primary btn-sm mt-3"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Go to Live Approval Waiting Room <ArrowRight size={14} />
          </Link>
        </div>

        <Link to="/login" className="btn btn-ghost btn-sm">
          Return to Login Page
        </Link>
      </div>
    </div>
  );
};
