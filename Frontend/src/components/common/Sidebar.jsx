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
  AlertTriangle,
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
          { label: 'Report Animal Rescue', path: '/owner/report-rescue', icon: AlertTriangle },
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
          { label: 'Manage Inventory', path: '/staff/inventory', icon: Package },
          { label: 'My Profile', path: '/staff/profile', icon: User },
        ];

      case 'RescueOfficer':
        return [
          { label: 'Rescue Dashboard', path: '/rescue/dashboard', icon: Activity },
          { label: 'Register Rescue Case', path: '/rescue/register-case', icon: PlusCircle },
          { label: 'Rescue Cases List', path: '/rescue/cases', icon: FolderOpen },
          { label: 'Foster Management', path: '/rescue/foster', icon: Home },
          { label: 'Adoption Listings', path: '/rescue/listings', icon: PawPrint },
          { label: 'Adoptable Pets Gallery', path: '/rescue/adoptable-pets', icon: Heart },
          { label: 'Review Applications', path: '/rescue/applications', icon: FileCheck },
          { label: 'Adoption History', path: '/rescue/history', icon: History },
          { label: 'My Profile', path: '/rescue/profile', icon: User },
        ];

      case 'Veterinarian':
        return [
          { label: 'Today’s Schedule', path: '/vet/schedule', icon: Calendar },
          { label: 'Patient Search & Records', path: '/vet/patients', icon: Search },
          { label: 'Add Consultation', path: '/vet/consultation', icon: Stethoscope },
          { label: 'Digital Prescriptions', path: '/vet/prescriptions', icon: Pill },
          { label: 'Vaccination Update', path: '/vet/vaccinations', icon: Syringe },
          { label: 'My Profile', path: '/vet/profile', icon: User },
        ];

      case 'PetCareProvider':
        return [
          { label: 'Provider Hub', path: '/provider/dashboard', icon: LayoutDashboard },
          { label: 'Daily Service Logs', path: '/provider/logs', icon: FileText },
          { label: 'Update Service Status', path: '/provider/status', icon: Scissors },
          { label: 'Assigned Packages', path: '/provider/packages', icon: Layers },
          { label: 'Service Feedback', path: '/provider/feedback', icon: Star },
          { label: 'My Profile', path: '/provider/profile', icon: User },
        ];

      case 'ClinicManager':
        return [
          { label: 'Manager Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
          { label: 'Inventory Oversight & Alerts', path: '/manager/inventory', icon: Package },
          { label: 'Supplier Directory', path: '/manager/suppliers', icon: Truck },
          { label: 'Packages & Promos', path: '/manager/packages', icon: Layers },
          { label: 'Feedback & Complaints', path: '/manager/feedback', icon: MessageSquare },
          { label: 'Performance Analytics', path: '/manager/reports', icon: BarChart3 },
          { label: 'My Profile', path: '/manager/profile', icon: User },
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
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid rgba(0, 0, 0, 0.07)',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 0.85rem',
      }}
    >
      {/* Role Header */}
      <div
        style={{
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, var(--primary-subtle) 0%, rgba(255, 255, 255, 0.9) 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(14, 131, 118, 0.14)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', fontWeight: 700 }}>
          WORKSPACE
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', letterSpacing: '-0.015em' }}>
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
                padding: '0.65rem 1rem',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                borderRadius: '980px',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-main)',
                boxShadow: isActive ? '0 4px 12px var(--primary-glow)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
          padding: '0.95rem 1rem',
          borderTop: '1px solid var(--border-light)',
          marginTop: 'auto',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>Connected: <span className="font-semibold" style={{ color: 'var(--status-success)' }}>● SQL Server</span></div>
        <div style={{ marginTop: '2px' }}>Pet Nexus v1.0.0</div>
      </div>
    </aside>
  );
};
