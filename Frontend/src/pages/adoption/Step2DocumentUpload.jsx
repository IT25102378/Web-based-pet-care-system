import React from 'react';
import { FileUploadField } from '../../components/common/FileUploadField';
import { ShieldCheck, Info } from 'lucide-react';

export const Step2DocumentUpload = ({ documents, updateDocuments, errors }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ backgroundColor: 'var(--amber-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 162, 97, 0.3)' }}>
        <div className="flex items-center gap-2" style={{ color: 'var(--status-warning-text)' }}>
          <ShieldCheck size={18} />
          <span className="font-semibold text-sm">Mandatory Verification Documents</span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--status-warning-text)', lineHeight: '1.4' }}>
          To verify adoption eligibility, please upload a clear copy of your government-issued photo ID and proof of residence (or landlord permission letter if renting).
        </p>
      </div>

      <div>
        <FileUploadField
          label="1. Government-Issued Photo ID (Driver's License / Passport)"
          hint="Clear photo or PDF (JPG, PNG, PDF up to 10MB)"
          required
          value={documents.idDoc}
          onChange={(doc) => updateDocuments({ idDoc: doc })}
        />
        {errors?.idDoc && <span className="form-error mt-1">{errors.idDoc}</span>}
      </div>

      <div className="mt-2">
        <FileUploadField
          label="2. Proof of Residence / Landlord Pet Permission"
          hint="Utility bill, lease agreement showing pets allowed, or mortgage statement"
          required
          value={documents.residenceDoc}
          onChange={(doc) => updateDocuments({ residenceDoc: doc })}
        />
        {errors?.residenceDoc && <span className="form-error mt-1">{errors.residenceDoc}</span>}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'var(--bg-muted)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.775rem',
          color: 'var(--text-muted)',
        }}
      >
        <Info size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span>
          All documents are encrypted and only accessible by Pet Nexus Rescue Officers during the screening review.
        </span>
      </div>
    </div>
  );
};
