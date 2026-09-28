import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRoleLabels } from '../../types';
import { getNavSections } from './navConfig';
import { PawPrint, X } from 'lucide-react';

export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { role } = useAuth();
  const sections = getNavSections(role);

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar${isOpen ? ' open' : ''}`} aria-label="Workspace navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <Link to="/" className="brand" aria-label="Pet Nexus home">
            <div className="brand-mark">
              <PawPrint size={17} />
            </div>
            <div className="brand-name">Pet<span>Nexus</span></div>
          </Link>
          <button type="button" className="btn-icon sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="sidebar-workspace">
            <span className="sidebar-workspace-label">Workspace</span>
            <span className="sidebar-workspace-name truncate">{UserRoleLabels[role] || role}</span>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {sections.map((section) => (
              <React.Fragment key={section.title}>
                <div className="sidebar-section-title">{section.title}</div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                    >
                      <Icon size={17} strokeWidth={1.9} />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div><span className="status-dot" />All systems operational</div>
          <div>Pet Nexus v1.0.0</div>
        </div>
      </aside>
    </>
  );
};
