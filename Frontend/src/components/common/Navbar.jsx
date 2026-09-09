import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { UserRoleLabels, UserStatus } from '../../types';
import {
  Heart,
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
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
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
            <Heart size={22} fill="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Pet<span style={{ color: 'var(--primary)' }}>Nexus</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '-3px',
              }}
            >
              Veterinary & Rescue Clinic
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-desktop-links">
          <Link
            to="/"
            style={{
              fontSize: '0.925rem',
              fontWeight: isCurrentActive('/') ? 600 : 500,
              color: isCurrentActive('/') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            Home
          </Link>
          <Link
            to="/adoptable-pets"
            style={{
              fontSize: '0.925rem',
              fontWeight: isCurrentActive('/adoptable-pets') ? 600 : 500,
              color: isCurrentActive('/adoptable-pets') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            Adoptable Pets
          </Link>
          <Link
            to="/about-contact"
            style={{
              fontSize: '0.925rem',
              fontWeight: isCurrentActive('/about-contact') ? 600 : 500,
              color: isCurrentActive('/about-contact') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            About & Contact
          </Link>

          {isAuthenticated && (
            <Link
              to={getDashboardRoute()}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <LayoutDashboard size={16} /> My Dashboard
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
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.userId}`}
                  alt={currentUser.fullName}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #FFFFFF',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {currentUser.fullName}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>
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
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
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
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: isCurrentActive('/') ? 700 : 500, color: 'var(--text-main)', padding: '0.5rem 0' }}
          >
            Home
          </Link>
          <Link
            to="/adoptable-pets"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: isCurrentActive('/adoptable-pets') ? 700 : 500, color: 'var(--text-main)', padding: '0.5rem 0' }}
          >
            Adoptable Pets
          </Link>
          <Link
            to="/about-contact"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: isCurrentActive('/about-contact') ? 700 : 500, color: 'var(--text-main)', padding: '0.5rem 0' }}
          >
            About & Contact
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardRoute()}
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.5rem', justifyContent: 'center' }}
            >
              <LayoutDashboard size={16} /> My Workspace
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
