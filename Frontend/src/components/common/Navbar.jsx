import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { UserRoleLabels, UserStatus } from '../../types';
import {
  Heart,
  PawPrint,
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  Shield,
  Stethoscope,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, role, userStatus, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hoverTimer = useRef(null);

  const handleMouseEnter = (path) => {
    hoverTimer.current = setTimeout(() => {
      navigate(path);
    }, 300); // 300ms delay to prevent accidental navigation
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    switch (role) {
      case 'PetOwner': return '/owner/overview';
      case 'Veterinarian': return '/vet/schedule';
      case 'ClinicStaff': return '/staff/queue';
      case 'RescueOfficer': return '/rescue/dashboard';
      case 'PetCareProvider': return '/provider/dashboard';
      case 'ClinicManager': return '/manager/dashboard';
      case 'Admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const isCurrentActive = (path) => location.pathname === path;
  const linkClass = (path) => `topnav-link${isCurrentActive(path) ? ' active' : ''}`;
  const showAdoptable = isAuthenticated && (role === 'PetOwner' || role === 'RescueOfficer');

  return (
    <nav className="topbar" aria-label="Primary">
      <div className="topbar-inner">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="brand" aria-label="Pet Nexus home">
            <div className="brand-mark">
              <PawPrint size={18} />
            </div>
            <div>
              <div className="brand-name">Pet<span>Nexus</span></div>
              <span className="brand-tagline">Veterinary &amp; Pet Care Platform</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="navbar-desktop-links" onMouseLeave={handleMouseLeave}>
            <Link to="/" onMouseEnter={() => handleMouseEnter('/')} className={linkClass('/')}>Home</Link>
            {/* Adoptable Pets is strictly visible ONLY for Pet Owner and Rescue Officer */}
            {showAdoptable && (
              <Link to="/adoptable-pets" onMouseEnter={() => handleMouseEnter('/adoptable-pets')} className={linkClass('/adoptable-pets')}>Adoptable Pets</Link>
            )}
            <Link to="/about-contact" onMouseEnter={() => handleMouseEnter('/about-contact')} className={linkClass('/about-contact')}>About &amp; Contact</Link>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardRoute()}
                className="btn btn-secondary btn-sm navbar-desktop-links"
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>

              <NotificationBell />

              <div className="topbar-divider navbar-desktop-links" />

              <div className="user-chip">
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName || 'User')}&backgroundColor=0f766e&textColor=ffffff`}
                  alt={currentUser.fullName}
                />
                <div className="user-chip-text" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="user-chip-name">{currentUser.fullName}</span>
                  <span className="user-chip-role">{UserRoleLabels[role] || role}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                style={{ padding: '0.35rem' }}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create account
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="navbar-mobile-toggle btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className={linkClass('/')}>
            Home
          </Link>
          {/* Adoptable Pets is strictly visible ONLY for Pet Owner and Rescue Officer */}
          {showAdoptable && (
            <Link to="/adoptable-pets" onClick={() => setMobileMenuOpen(false)} className={linkClass('/adoptable-pets')}>
              Adoptable Pets
            </Link>
          )}
          <Link to="/about-contact" onClick={() => setMobileMenuOpen(false)} className={linkClass('/about-contact')}>
            About &amp; Contact
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardRoute()}
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              <LayoutDashboard size={16} /> Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
