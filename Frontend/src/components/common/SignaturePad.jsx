import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Type, Check } from 'lucide-react';

export const SignaturePad = ({
  value = null, // base64 DataURL or typed string
  onChange,
  signerName = '',
  required = false,
}) => {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('draw'); // 'draw' | 'type'
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedSignature, setTypedSignature] = useState(signerName);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#185751'; // Pet Nexus Deep Teal
    }
  }, [mode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const ctx = canvas.getContext('2d');
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      onChange(null);
    }
  };

  const handleTypeChange = (e) => {
    const text = e.target.value;
    setTypedSignature(text);

    if (!text.trim()) {
      onChange(null);
      return;
    }

    // Generate clean SVG signature data URL
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="70"><text x="20" y="45" font-family="'Brush Script MT', 'Dancing Script', cursive, sans-serif" font-size="32" fill="%232A8C82">${text}</text></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    onChange(dataUrl);
  };

  return (
    <div className="signature-pad-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div className="flex items-center justify-between">
        <label className="form-label" style={{ marginBottom: 0 }}>
          Digital Signature {required && <span className="required">*</span>}
        </label>

        <div className="flex items-center gap-1" style={{ backgroundColor: 'var(--bg-muted)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'draw' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            onClick={() => {
              setMode('draw');
              clearCanvas();
            }}
          >
            <PenTool size={12} /> Draw
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'type' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            onClick={() => {
              setMode('type');
              if (typedSignature) {
                handleTypeChange({ target: { value: typedSignature } });
              }
            }}
          >
            <Type size={12} /> Type
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={480}
            height={130}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              width: '100%',
              height: '130px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'crosshair',
              touchAction: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              display: 'flex',
              gap: '6px',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={clearCanvas}
              disabled={!hasDrawn}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>
          {!hasDrawn && (
            <p
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'var(--text-subtle)',
                fontSize: '0.875rem',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              Sign with mouse or touch here
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Type your full legal name to sign"
            value={typedSignature}
            onChange={handleTypeChange}
          />
          {typedSignature && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1.25rem',
                fontFamily: "'Brush Script MT', 'Dancing Script', cursive, sans-serif",
                fontSize: '1.75rem',
                color: 'var(--primary-dark)',
                textAlign: 'center',
                letterSpacing: '0.05em',
              }}
            >
              {typedSignature}
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-muted">
        By signing, you certify under penalty of perjury that the information provided is true and legally binding.
      </p>
    </div>
  );
};
