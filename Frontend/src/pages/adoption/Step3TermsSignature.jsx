import React from 'react';
import { SignaturePad } from '../../components/common/SignaturePad';
import { FileCheck, AlertCircle } from 'lucide-react';

export const Step3TermsSignature = ({
  formData,
  updateFormData,
  signature,
  setSignature,
  termsAccepted,
  setTermsAccepted,
  errors,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ backgroundColor: 'var(--primary-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <div className="flex items-center gap-2 text-primary">
          <FileCheck size={18} />
          <span className="font-semibold text-sm">Pet Nexus Adoption Agreement & Covenant</span>
        </div>
        <p className="text-xs text-muted mt-1">
          Please read our adoption covenants carefully prior to executing your digital signature.
        </p>
      </div>

      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          backgroundColor: '#FFFFFF',
          maxHeight: '160px',
          overflowY: 'auto',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
        }}
      >
        <p className="font-semibold text-main mb-2">Terms and Conditions of Pet Adoption:</p>
        <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li>
            <strong>Lifelong Humane Care:</strong> The adopter agrees to provide humane care, adequate food, clean water, shelter, annual veterinary care, and affection.
          </li>
          <li>
            <strong>Spay/Neuter & Microchip:</strong> The adopted pet is microchipped and spayed/neutered. Microchip registry will be updated upon final approval.
          </li>
          <li>
            <strong>No Transfer or Abandonment:</strong> The adopter will not sell, give away, or abandon the pet. If the adopter can no longer keep the pet, Pet Nexus retains right of first return.
          </li>
          <li>
            <strong>Home & Welfare Verification:</strong> Pet Nexus reserves the right to conduct a virtual or in-person home safety check.
          </li>
        </ol>
      </div>

      <SignaturePad
        signerName={formData.applicantName || ''}
        value={signature}
        onChange={setSignature}
        required
      />
      {errors?.signature && <span className="form-error">{errors.signature}</span>}

      <div style={{ marginTop: '0.5rem' }}>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            I have read, understood, and agree to the Pet Nexus Adoption Covenants & Terms. <span className="required">*</span>
          </span>
        </label>
        {errors?.terms && <span className="form-error block mt-1">{errors.terms}</span>}
      </div>
    </div>
  );
};
