import React, { useState } from 'react';
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

  return (
    <nav
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px var(--primary-glow)',
            }}
          >
            <PawPrint size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Pet<span style={{ color: 'var(--primary)' }}>Nexus</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: '-2px',
              }}
            >
              Web-Based Pet Care System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-desktop-links">
          <Link
            to="/"
            style={{
              fontSize: '1.025rem',
              fontWeight: isCurrentActive('/') ? 750 : 600,
              color: isCurrentActive('/') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            Home
          </Link>
          {/* Adoptable Pets is strictly visible ONLY for Pet Owner and Rescue Officer */}
          {isAuthenticated && (role === 'PetOwner' || role === 'RescueOfficer') && (
            <Link
              to="/adoptable-pets"
              style={{
                fontSize: '1.025rem',
                fontWeight: isCurrentActive('/adoptable-pets') ? 750 : 600,
                color: isCurrentActive('/adoptable-pets') ? 'var(--primary)' : 'var(--text-main)',
              }}
            >
              Adoptable Pets
            </Link>
          )}
          <Link
            to="/about-contact"
            style={{
              fontSize: '1.025rem',
              fontWeight: isCurrentActive('/about-contact') ? 750 : 600,
              color: isCurrentActive('/about-contact') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            About & Contact
          </Link>

          {isAuthenticated && (
            <Link
              to={getDashboardRoute()}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.95rem' }}
            >
              <LayoutDashboard size={17} /> My Dashboard
            </Link>
          )}
        </div>

        {/* User Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificationBell />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName || 'User')}`}
                  alt={currentUser.fullName}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #FFFFFF',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontSize: '0.925rem', fontWeight: '750', color: 'var(--text-main)' }}>
                    {currentUser.fullName}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>
                    {UserRoleLabels[role] || role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm" style={{ fontSize: '0.95rem' }}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ fontSize: '0.95rem' }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="navbar-mobile-toggle btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: isCurrentActive('/') ? 750 : 600, color: 'var(--text-main)', padding: '0.6rem 0', fontSize: '1.05rem' }}
          >
            Home
          </Link>
          {/* Adoptable Pets is strictly visible ONLY for Pet Owner and Rescue Officer */}
          {isAuthenticated && (role === 'PetOwner' || role === 'RescueOfficer') && (
            <Link
              to="/adoptable-pets"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontWeight: isCurrentActive('/adoptable-pets') ? 750 : 600, color: 'var(--primary)', padding: '0.6rem 0', fontSize: '1.05rem' }}
            >
              Adoptable Pets
            </Link>
          )}
          <Link
            to="/about-contact"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: isCurrentActive('/about-contact') ? 750 : 600, color: 'var(--text-main)', padding: '0.6rem 0', fontSize: '1.05rem' }}
          >
            About & Contact
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardRoute()}
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary"
              style={{ marginTop: '0.75rem', justifyContent: 'center', fontSize: '1rem' }}
            >
              <LayoutDashboard size={18} /> My Workspace
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
