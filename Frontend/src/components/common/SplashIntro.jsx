import React, { useState, useEffect } from 'react';
import { PawPrint } from 'lucide-react';

/**
 * Full-screen splash intro that plays once per browser session.
 * First visit → animation plays. Refreshes within the same tab → skipped.
 * Opening a new tab or closing and reopening the browser → plays again.
 */
export const SplashIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    let hasPlayed = false;
    try {
      hasPlayed = sessionStorage.getItem('pn_splash_done');
    } catch (_) {}
    if (hasPlayed) {
      setPhase('done');
      onComplete?.();
      return;
    }

    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(() => {
      setPhase('done');
      try {
        sessionStorage.setItem('pn_splash_done', '1');
      } catch (_) {}
      onComplete?.();
    }, 2800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`splash-overlay splash-${phase}`} aria-hidden="true">
      <div className="splash-content">
        <div className="splash-ring" />
        <div className="splash-logo-mark">
          <PawPrint size={36} strokeWidth={2.2} />
        </div>
        <div className="splash-brand">
          <span className="splash-brand-pet">Pet</span>
          <span className="splash-brand-nexus">Nexus</span>
        </div>
        <p className="splash-tagline">Veterinary & Pet Care Platform</p>
      </div>
    </div>
  );
};

export default SplashIntro;
