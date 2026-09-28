import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { UserRoleLabels } from '../../types';
import { getNavSections, findNavItem } from './navConfig';
import { Menu, ChevronRight, ChevronDown, User, Globe, LogOut } from 'lucide-react';

/**
 * Top bar for the authenticated workspace: current location on the left,
 * notifications and the account menu on the right.
 */
export const AppTopbar = ({ onMenuClick }) => {
  const { currentUser, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const current = findNavItem(role, location.pathname);
  const profileItem = getNavSections(role)
    .flatMap((section) => section.items)
    .find((item) => item.path.endsWith('/profile'));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fullName = currentUser?.fullName || 'User';
  const avatarUrl = currentUser?.avatarUrl
    || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=0f766e&textColor=ffffff`;

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button type="button" className="btn-icon app-topbar-menu" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <nav className="app-topbar-crumbs" aria-label="Current location">
          <span className="app-topbar-crumb-root">{UserRoleLabels[role] || role}</span>
          {current && (
            <>
              <ChevronRight size={14} />
              <strong className="truncate">{current.label}</strong>
            </>
          )}
        </nav>
      </div>

      <div className="app-topbar-right">
        <NotificationBell />

        <div className="topbar-divider" />

        <div className="user-menu" ref={menuRef}>
          <button
            type="button"
            className="user-menu-trigger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <img className="avatar" src={avatarUrl} alt="" />
            <span className="user-chip-text">
              <span className="user-chip-name">{fullName}</span>
              <span className="user-chip-role">{UserRoleLabels[role] || role}</span>
            </span>
            <ChevronDown size={15} className="user-menu-caret" />
          </button>

          {menuOpen && (
            <div className="user-menu-panel" role="menu">
              <div className="user-menu-header">
                <div className="user-chip-name truncate">{fullName}</div>
                <div className="user-chip-role truncate">{currentUser?.email}</div>
              </div>
              {profileItem && (
                <Link to={profileItem.path} className="user-menu-item" role="menuitem">
                  <User size={16} /> My profile
                </Link>
              )}
              <Link to="/" className="user-menu-item" role="menuitem">
                <Globe size={16} /> Public website
              </Link>
              <div className="user-menu-separator" />
              <button type="button" className="user-menu-item danger" role="menuitem" onClick={handleLogout}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
