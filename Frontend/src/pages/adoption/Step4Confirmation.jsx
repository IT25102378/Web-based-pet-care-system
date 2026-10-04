import React from 'react';
import { CheckCircle2, Clock, Calendar, HeartHandshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Step4Confirmation = ({ application, pet, onClose }) => {
  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--status-success-bg)',
          color: 'var(--status-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.15)',
        }}
      >
        <CheckCircle2 size={42} />
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
        Application Successfully Submitted!
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '460px', margin: '0.5rem auto 1.5rem' }}>
        Thank you for applying to adopt <strong className="text-primary">{pet?.temporaryName || application?.petName}</strong>. Our Rescue Team is reviewing your submission.
      </p>

      {/* Reference Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          maxWidth: '480px',
          margin: '0 auto 2rem',
          textAlign: 'left',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted">APPLICATION REFERENCE NUMBER</span>
          <span className="badge badge-primary font-bold">{application?.applicationId || 'ADP-APP-2026-03'}</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1 border-top" style={{ borderTop: '1px solid var(--border-light)' }}>
          <span className="text-muted">Target Pet:</span>
          <span className="font-semibold text-main">{pet?.temporaryName || application?.petName} ({pet?.species || 'Canine'})</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1">
          <span className="text-muted">Applicant:</span>
          <span className="font-semibold text-main">{application?.applicantName}</span>
        </div>
        <div className="flex items-center justify-between text-sm py-1">
          <span className="text-muted">Submitted On:</span>
          <span className="font-semibold text-main">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Next Steps Timeline */}
      <div style={{ maxWidth: '480px', margin: '0 auto 2rem', textAlign: 'left' }}>
        <h4 className="text-sm font-bold text-main mb-3">What happens next:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="flex items-start gap-3">
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              1
            </div>
            <div>
              <p className="text-xs font-bold text-main">Document & Housing Verification</p>
              <p className="text-xs text-muted">Rescue Officer reviews proof documents within 24-48 hours.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              2
            </div>
            <div>
              <p className="text-xs font-bold text-main">Meet & Greet Coordination</p>
              <p className="text-xs text-muted">You’ll receive a message to schedule an in-person or foster visit.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              3
            </div>
            <div>
              <p className="text-xs font-bold text-main">Adoption Finalization & Handover</p>
              <p className="text-xs text-muted">Vaccination and microchip records transfer upon approval.</p>
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="btn btn-primary" onClick={onClose}>
        Done & Return to Portal
      </button>
    </div>
  );
};
