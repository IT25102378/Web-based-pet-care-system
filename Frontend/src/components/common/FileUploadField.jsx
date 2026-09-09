import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { fileApi } from '../../api/fileApi';

export const FileUploadField = ({
  label = 'Upload Document',
  hint = 'PNG, JPG, PDF up to 10MB',
  accept = 'image/*,.pdf',
  required = false,
  value = null, // { url, fileName, fileSize }
  onChange,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds the 10MB limit.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const result = await fileApi.uploadFile(file);
      onChange(result);
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isImage = value?.url?.startsWith('data:image') ||
    (value?.fileName && /\.(jpg|jpeg|png|webp|gif)$/i.test(value.fileName)) ||
    (typeof value === 'string' && /\.(jpg|jpeg|png|webp|gif)$/i.test(value));

  const previewUrl = typeof value === 'string' ? value : value?.url;
  const fileName = typeof value === 'string' ? value.split('/').pop() : value?.fileName;
  const fileSize = value?.fileSize;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      {!value ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            backgroundColor: isDragging ? 'var(--primary-subtle)' : 'var(--bg-surface)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'var(--transition)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm font-medium">Uploading & verifying file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-main">
                  Click to upload <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>or drag and drop</span>
                </p>
                <p className="text-xs text-muted mt-1">{hint}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
            {isImage && previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '52px',
                  height: '52px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={24} />
              </div>
            )}

            <div style={{ minWidth: 0 }}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-main" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {fileName || 'Uploaded Document'}
                </p>
                <CheckCircle size={14} color="var(--status-success)" />
              </div>
              <p className="text-xs text-muted">{fileSize || 'Uploaded and verified'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                onClick={(e) => e.stopPropagation()}
              >
                Preview
              </a>
            )}
            {!disabled && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleRemove}
                style={{ color: 'var(--status-danger)' }}
                aria-label="Remove uploaded file"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="form-error mt-1">{error}</p>}
    </div>
  );
};
