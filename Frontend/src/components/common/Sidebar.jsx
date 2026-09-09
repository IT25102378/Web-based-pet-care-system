import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser, role } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'PetOwner':
        return [
          { label: 'Overview Hub', path: '/owner/overview', icon: LayoutDashboard },
          { label: 'My Pets', path: '/owner/pets', icon: PawPrint },
          { label: 'Appointments', path: '/owner/appointments', icon: Calendar },
          { label: 'Medical History', path: '/owner/medical-history', icon: FileText },
          { label: 'Adoptable Pets', path: '/owner/adopt', icon: Heart },
          { label: 'Wellness Packages', path: '/owner/packages', icon: Package },
          { label: 'Submit Feedback', path: '/owner/feedback', icon: MessageSquare },
          { label: 'My Profile', path: '/owner/profile', icon: User },
        ];

      case 'ClinicStaff':
        return [
          { label: 'Appointment Queue', path: '/staff/queue', icon: Clock },
          { label: 'Vet Availability', path: '/staff/availability', icon: Calendar },
          { label: 'Walk-in Registration', path: '/staff/walk-in', icon: UserPlus },
          { label: 'Appointment History', path: '/staff/history', icon: History },
          { label: 'View Inventory', path: '/staff/inventory', icon: Package },
        ];

      case 'RescueOfficer':
        return [
          { label: 'Rescue Dashboard', path: '/rescue/dashboard', icon: Activity },
          { label: 'Register Rescue Case', path: '/rescue/register-case', icon: PlusCircle },
          { label: 'Rescue Cases List', path: '/rescue/cases', icon: FolderOpen },
          { label: 'Foster Management', path: '/rescue/foster', icon: Home },
          { label: 'Adoption Listings', path: '/rescue/listings', icon: PawPrint },
          { label: 'Review Applications', path: '/rescue/applications', icon: FileCheck },
          { label: 'Adoption History', path: '/rescue/history', icon: History },
        ];

      case 'Veterinarian':
        return [
          { label: 'Today’s Schedule', path: '/vet/schedule', icon: Calendar },
          { label: 'Patient Search & Records', path: '/vet/patients', icon: Search },
          { label: 'Add Consultation', path: '/vet/consultation', icon: Stethoscope },
          { label: 'Digital Prescriptions', path: '/vet/prescriptions', icon: Pill },
          { label: 'Vaccination Update', path: '/vet/vaccinations', icon: Syringe },
        ];

      case 'PetCareProvider':
        return [
          { label: 'Provider Hub', path: '/provider/dashboard', icon: LayoutDashboard },
          { label: 'Daily Service Logs', path: '/provider/logs', icon: FileText },
          { label: 'Update Service Status', path: '/provider/status', icon: Scissors },
          { label: 'Assigned Packages', path: '/provider/packages', icon: Layers },
          { label: 'Service Feedback', path: '/provider/feedback', icon: Star },
        ];

      case 'ClinicManager':
        return [
          { label: 'Manager Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
          { label: 'Inventory & Stock Alerts', path: '/manager/inventory', icon: Package },
          { label: 'Supplier Directory', path: '/manager/suppliers', icon: Truck },
          { label: 'Packages & Promos', path: '/manager/packages', icon: Layers },
          { label: 'Feedback & Complaints', path: '/manager/feedback', icon: MessageSquare },
          { label: 'Performance Analytics', path: '/manager/reports', icon: BarChart3 },
        ];

      case 'Admin':
        return [
          { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Account Approvals', path: '/admin/approvals', icon: ShieldCheck },
          { label: 'User Accounts', path: '/admin/users', icon: Users },
          { label: 'Approval History', path: '/admin/approval-history', icon: History },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className="dashboard-sidebar-container"
      style={{
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border)',
        minHeight: 'calc(100vh - 105px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 0.75rem',
      }}
    >
      {/* Role Header */}
      <div
        style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          backgroundColor: 'var(--primary-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(42, 140, 130, 0.15)',
        }}
      >
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-dark)', fontWeight: 700 }}>
          ROLE WORKSPACE
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '2px' }}>
          {UserRoleLabels[role] || role}
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
              }
              style={({ isActive }) => ({
                justifyContent: 'flex-start',
                padding: '0.65rem 0.95rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-main)',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderTop: '1px solid var(--border-light)',
          marginTop: 'auto',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>Connected: <span className="font-semibold" style={{ color: 'var(--status-success)' }}>● SQL Server</span></div>
        <div style={{ marginTop: '2px' }}>Pet Nexus v1.0.0</div>
      </div>
    </aside>
  );
};
