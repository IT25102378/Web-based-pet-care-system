import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SplashIntro from './SplashIntro';

describe('SplashIntro Component', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the splash screen if not played in session', () => {
    render(<SplashIntro />);
    expect(screen.getByText('Pet')).toBeInTheDocument();
    expect(screen.getByText('Nexus')).toBeInTheDocument();
    expect(screen.getByText('Veterinary & Pet Care Platform')).toBeInTheDocument();
  });

  it('should call onComplete and disappear after timeouts', () => {
    const onCompleteMock = vi.fn();
    render(<SplashIntro onComplete={onCompleteMock} />);

    // Fast-forward 2800ms to trigger the 'done' phase
    act(() => {
      vi.advanceTimersByTime(2800);
    });

    // onComplete should be called
    expect(onCompleteMock).toHaveBeenCalledTimes(1);

    // The splash screen should no longer be in the document
    expect(screen.queryByText('Veterinary & Pet Care Platform')).not.toBeInTheDocument();

    // Session storage should be set
    expect(sessionStorage.getItem('pn_splash_done')).toBe('1');
  });

  it('should not render if already played in session', () => {
    sessionStorage.setItem('pn_splash_done', '1');
    const onCompleteMock = vi.fn();
    
    render(<SplashIntro onComplete={onCompleteMock} />);

    // The splash screen should not be in the document
    expect(screen.queryByText('Veterinary & Pet Care Platform')).not.toBeInTheDocument();

    // onComplete should be called immediately
    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });
});
