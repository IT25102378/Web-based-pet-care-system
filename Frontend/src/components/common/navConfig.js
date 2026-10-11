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
  FileCheck,
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
  Home,
} from 'lucide-react';

// Each role's navigation is grouped into sections: { title, items[] }
export const getNavSections = (role) => {
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
        { title: 'Rescue & Foster', items: [
          { label: 'Register Case', path: '/rescue/register-case', icon: PlusCircle },
          { label: 'Rescue Cases', path: '/rescue/cases', icon: FolderOpen },
          { label: 'Foster Care', path: '/rescue/fosters', icon: Home },
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

// Longest-prefix match so detail routes (e.g. /rescue/cases/RC-001) resolve to their parent item
export const findNavItem = (role, pathname) => {
  let match = null;
  getNavSections(role).forEach((section) => {
    section.items.forEach((item) => {
      const isMatch = pathname === item.path || pathname.startsWith(`${item.path}/`);
      if (isMatch && (!match || item.path.length > match.path.length)) {
        match = { ...item, section: section.title };
      }
    });
  });
  return match;
};
