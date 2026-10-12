import React from 'react';

// Read-only strip of record IDs shown at the top of a form, so every form shows
// the IDs stored with the record. Pass null for an ID the system assigns on save.
export const RecordIds = ({ ids = [] }) => (
  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
    {ids.map(([label, value]) => (
      <div key={label} style={{ flex: '1 1 160px', minWidth: 0 }}>
        <label className="form-label font-bold text-xs">{label}</label>
        <input
          type="text"
          className="form-control font-mono text-xs"
          value={value === null ? 'Assigned automatically on save' : value || 'Not set'}
          readOnly
          tabIndex={-1}
          style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', cursor: 'default' }}
        />
      </div>
    ))}
  </div>
);
