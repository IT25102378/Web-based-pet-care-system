import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AdoptablePetsPage } from './pages/public/AdoptablePetsPage';
import { AboutContactPage } from './pages/public/AboutContactPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage';
import { AdminApprovalQueue } from './pages/auth/AdminApprovalQueue';

// Pet Owner Role Pages
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { MyPetsPage } from './pages/owner/MyPetsPage';
import { BookAppointmentPage } from './pages/owner/BookAppointmentPage';
import { MedicalHistoryPage } from './pages/owner/MedicalHistoryPage';
import { AdoptBrowsePage } from './pages/owner/AdoptBrowsePage';
import { PackagesBrowsePage } from './pages/owner/PackagesBrowsePage';
import { FeedbackSubmitPage } from './pages/owner/FeedbackSubmitPage';
import { OwnerProfilePage } from './pages/owner/OwnerProfilePage';

// Clinic Staff Role Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AppointmentQueuePage } from './pages/staff/AppointmentQueuePage';
import { VetAvailabilityPage } from './pages/staff/VetAvailabilityPage';
import { WalkInRegistrationPage } from './pages/staff/WalkInRegistrationPage';
import { AppointmentHistoryPage } from './pages/staff/AppointmentHistoryPage';
import { StaffInventoryPage } from './pages/staff/StaffInventoryPage';

// Rescue Officer Role Pages
import { RescueDashboard } from './pages/rescue/RescueDashboard';
import { RegisterRescuePage } from './pages/rescue/RegisterRescuePage';
import { RescueCaseListPage } from './pages/rescue/RescueCaseListPage';
import { RescueCaseDetailPage } from './pages/rescue/RescueCaseDetailPage';
import { FosterManagementPage } from './pages/rescue/FosterManagementPage';
import { AdoptionListingsPage } from './pages/rescue/AdoptionListingsPage';
import { AdoptionReviewPage } from './pages/rescue/AdoptionReviewPage';
import { AdoptionHistoryPage } from './pages/rescue/AdoptionHistoryPage';

// Veterinarian Role Pages
import { VetDashboard } from './pages/vet/VetDashboard';
import { PatientSearchPage } from './pages/vet/PatientSearchPage';
import { AddConsultationPage } from './pages/vet/AddConsultationPage';
import { DigitalPrescriptionPage } from './pages/vet/DigitalPrescriptionPage';
import { VaccinationUpdatePage } from './pages/vet/VaccinationUpdatePage';

// Pet Care Provider Role Pages
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ServiceLogsPage } from './pages/provider/ServiceLogsPage';
import { ServiceStatusPage } from './pages/provider/ServiceStatusPage';
import { AssignedPackagesPage } from './pages/provider/AssignedPackagesPage';
import { ServiceFeedbackPage } from './pages/provider/ServiceFeedbackPage';

// Clinic Manager Role Pages
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { InventoryPage } from './pages/manager/InventoryPage';
import { SupplierPage } from './pages/manager/SupplierPage';
import { PackageManagementPage } from './pages/manager/PackageManagementPage';
import { FeedbackReviewPage } from './pages/manager/FeedbackReviewPage';
import { PerformanceReportsPage } from './pages/manager/PerformanceReportsPage';

// System Administrator Role Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserAccountsPage } from './pages/admin/UserAccountsPage';
import { ApprovalHistoryPage } from './pages/admin/ApprovalHistoryPage';

export function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/adoptable-pets" element={<AdoptablePetsPage />} />
        <Route path="/about-contact" element={<AboutContactPage />} />

        {/* Auth Flows */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Role 1: Pet Owner Dashboard */}
      <Route path="/owner" element={<DashboardLayout allowedRoles={['PetOwner']} />}>
        <Route index element={<Navigate to="/owner/overview" replace />} />
        <Route path="overview" element={<OwnerDashboard />} />
        <Route path="pets" element={<MyPetsPage />} />
        <Route path="appointments" element={<BookAppointmentPage />} />
        <Route path="medical-history" element={<MedicalHistoryPage />} />
        <Route path="adopt" element={<AdoptBrowsePage />} />
        <Route path="packages" element={<PackagesBrowsePage />} />
        <Route path="feedback" element={<FeedbackSubmitPage />} />
        <Route path="profile" element={<OwnerProfilePage />} />
      </Route>

      {/* Role 2: Clinic Staff Dashboard */}
      <Route path="/staff" element={<DashboardLayout allowedRoles={['ClinicStaff']} />}>
        <Route index element={<Navigate to="/staff/queue" replace />} />
        <Route path="queue" element={<AppointmentQueuePage />} />
        <Route path="availability" element={<VetAvailabilityPage />} />
        <Route path="walk-in" element={<WalkInRegistrationPage />} />
        <Route path="history" element={<AppointmentHistoryPage />} />
        <Route path="inventory" element={<StaffInventoryPage />} />
      </Route>

      {/* Role 3: Rescue Officer Dashboard */}
      <Route path="/rescue" element={<DashboardLayout allowedRoles={['RescueOfficer']} />}>
        <Route index element={<Navigate to="/rescue/dashboard" replace />} />
        <Route path="dashboard" element={<RescueDashboard />} />
        <Route path="register-case" element={<RegisterRescuePage />} />
        <Route path="cases" element={<RescueCaseListPage />} />
        <Route path="cases/:id" element={<RescueCaseDetailPage />} />
        <Route path="foster" element={<FosterManagementPage />} />
        <Route path="listings" element={<AdoptionListingsPage />} />
        <Route path="applications" element={<AdoptionReviewPage />} />
        <Route path="history" element={<AdoptionHistoryPage />} />
      </Route>

      {/* Role 4: Veterinarian Dashboard */}
      <Route path="/vet" element={<DashboardLayout allowedRoles={['Veterinarian']} />}>
        <Route index element={<Navigate to="/vet/schedule" replace />} />
        <Route path="dashboard" element={<Navigate to="/vet/schedule" replace />} />
        <Route path="schedule" element={<VetDashboard />} />
        <Route path="patients" element={<PatientSearchPage />} />
        <Route path="consultation" element={<AddConsultationPage />} />
        <Route path="prescriptions" element={<DigitalPrescriptionPage />} />
        <Route path="vaccinations" element={<VaccinationUpdatePage />} />
      </Route>

      {/* Role 5: Pet Care Provider Dashboard */}
      <Route path="/provider" element={<DashboardLayout allowedRoles={['PetCareProvider']} />}>
        <Route index element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="logs" element={<ServiceLogsPage />} />
        <Route path="status" element={<ServiceStatusPage />} />
        <Route path="packages" element={<AssignedPackagesPage />} />
        <Route path="feedback" element={<ServiceFeedbackPage />} />
      </Route>

      {/* Role 6: Clinic Manager Dashboard */}
      <Route path="/manager" element={<DashboardLayout allowedRoles={['ClinicManager']} />}>
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="suppliers" element={<SupplierPage />} />
        <Route path="packages" element={<PackageManagementPage />} />
        <Route path="feedback" element={<FeedbackReviewPage />} />
        <Route path="reports" element={<PerformanceReportsPage />} />
      </Route>

      {/* Role 7: System Administrator Workspace */}
      <Route path="/admin" element={<DashboardLayout allowedRoles={['Admin']} />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="approvals" element={<AdminApprovalQueue />} />
        <Route path="users" element={<UserAccountsPage />} />
        <Route path="approval-history" element={<ApprovalHistoryPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
