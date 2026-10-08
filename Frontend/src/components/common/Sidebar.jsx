import React, { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRoleLabels } from '../../types';
import {
  PawPrint,
  Calendar,
  FileText,
  Heart,
  Package,
  MessageSquare,
  Clock,
  UserPlus,
  History,
  Activity,
  PlusCircle,
  FolderOpen,
  Home,
  FileCheck,
  CheckCircle2,
  Stethoscope,
  Search,
  Pill,
  Syringe,
  Scissors,
  Layers,
  Star,
  BarChart3,
  Truck,
  ShieldCheck,
  Users,
  LayoutDashboard,
  User,
  AlertTriangle,
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  const hoverTimer = useRef(null);

  const handleMouseEnter = (path) => {
    hoverTimer.current = setTimeout(() => {
      navigate(path);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
  };

  // Each role's navigation is grouped into sections: { title, items[] }
  const getNavSections = () => {
    switch (role) {
      case 'PetOwner':
        return [
          { title: 'Overview', items: [
            { label: 'Dashboard', path: '/owner/overview', icon: LayoutDashboard },
          ]},
          { title: 'Pet Care', items: [
            { label: 'My Pets', path: '/owner/pets', icon: PawPrint },
            { label: 'Appointments', path: '/owner/appointments', icon: Calendar },
            { label: 'Medical History', path: '/owner/medical-history', icon: FileText },
            { label: 'Wellness Packages', path: '/owner/packages', icon: Package },
          ]},
          { title: 'Community', items: [
            { label: 'Adoptable Pets', path: '/owner/adopt', icon: Heart },
            { label: 'Report a Rescue', path: '/owner/report-rescue', icon: AlertTriangle },
            { label: 'Feedback', path: '/owner/feedback', icon: MessageSquare },
          ]},
          { title: 'Account', items: [
            { label: 'My Profile', path: '/owner/profile', icon: User },
          ]},
        ];

      case 'ClinicStaff':
        return [
          { title: 'Front Desk', items: [
            { label: 'Appointment Queue', path: '/staff/queue', icon: Clock },
            { label: 'Walk-in Registration', path: '/staff/walk-in', icon: UserPlus },
            { label: 'Vet Availability', path: '/staff/availability', icon: Calendar },
            { label: 'Appointment History', path: '/staff/history', icon: History },
          ]},
          { title: 'Operations', items: [
            { label: 'Inventory', path: '/staff/inventory', icon: Package },
          ]},
          { title: 'Account', items: [
            { label: 'My Profile', path: '/staff/profile', icon: User },
          ]},
        ];

      case 'RescueOfficer':
        return [
          { title: 'Overview', items: [
            { label: 'Dashboard', path: '/rescue/dashboard', icon: Activity },
          ]},
          { title: 'Rescue', items: [
            { label: 'Register Case', path: '/rescue/register-case', icon: PlusCircle },
            { label: 'Rescue Cases', path: '/rescue/cases', icon: FolderOpen },
          ]},
          { title: 'Adoption', items: [
            { label: 'Adoption Listings', path: '/rescue/listings', icon: PawPrint },
            { label: 'Adoptable Pets', path: '/rescue/adoptable-pets', icon: Heart },
            { label: 'Applications', path: '/rescue/applications', icon: FileCheck },
            { label: 'Adoption History', path: '/rescue/history', icon: History },
          ]},
          { title: 'Account', items: [
            { label: 'My Profile', path: '/rescue/profile', icon: User },
          ]},
        ];

      case 'Veterinarian':
        return [
          { title: 'Clinical', items: [
            { label: "Today's Schedule", path: '/vet/schedule', icon: Calendar },
            { label: 'Patient Records', path: '/vet/patients', icon: Search },
            { label: 'New Consultation', path: '/vet/consultation', icon: Stethoscope },
            { label: 'Prescriptions', path: '/vet/prescriptions', icon: Pill },
            { label: 'Vaccinations', path: '/vet/vaccinations', icon: Syringe },
          ]},
          { title: 'Account', items: [
            { label: 'My Profile', path: '/vet/profile', icon: User },
          ]},
        ];

      case 'PetCareProvider':
        return [
          { title: 'Overview', items: [
            { label: 'Dashboard', path: '/provider/dashboard', icon: LayoutDashboard },
          ]},
          { title: 'Services', items: [
            { label: 'Service Logs', path: '/provider/logs', icon: FileText },
            { label: 'Service Status', path: '/provider/status', icon: Scissors },
            { label: 'Assigned Packages', path: '/provider/packages', icon: Layers },
            { label: 'Feedback', path: '/provider/feedback', icon: Star },
          ]},
          { title: 'Account', items: [
            { label: 'My Profile', path: '/provider/profile', icon: User },
          ]},
        ];

      case 'ClinicManager':
        return [
          { title: 'Overview', items: [
            { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
            { label: 'Performance Reports', path: '/manager/reports', icon: BarChart3 },
          ]},
          { title: 'Operations', items: [
            { label: 'Inventory', path: '/manager/inventory', icon: Package },
            { label: 'Suppliers', path: '/manager/suppliers', icon: Truck },
            { label: 'Packages & Promotions', path: '/manager/packages', icon: Layers },
            { label: 'Feedback & Complaints', path: '/manager/feedback', icon: MessageSquare },
          ]},
          { title: 'Account', items: [
            { label: 'My Profile', path: '/manager/profile', icon: User },
          ]},
        ];

      case 'Admin':
        return [
          { title: 'Overview', items: [
            { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          ]},
          { title: 'User Management', items: [
            { label: 'Account Approvals', path: '/admin/approvals', icon: ShieldCheck },
            { label: 'User Accounts', path: '/admin/users', icon: Users },
            { label: 'Approval History', path: '/admin/approval-history', icon: History },
          ]},
        ];

      default:
        return [];
    }
  };

  const sections = getNavSections();

  return (
    <aside className="dashboard-sidebar-container sidebar" aria-label="Workspace navigation">
      {/* Workspace identifier */}
      <div className="sidebar-workspace">
        <div className="sidebar-workspace-icon">
          <Home size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="sidebar-workspace-label">Workspace</div>
          <div className="sidebar-workspace-name truncate">{UserRoleLabels[role] || role}</div>
        </div>
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
                  onMouseEnter={() => handleMouseEnter(item.path)}
                  onMouseLeave={handleMouseLeave}
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

      {/* Footer */}
      <div className="sidebar-footer">
        <div><span className="status-dot" />All systems operational</div>
        <div>Pet Nexus v1.0.0</div>
      </div>
    </aside>
  );
};

