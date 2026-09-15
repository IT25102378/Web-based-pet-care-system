import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/userApi';
import { petApi } from '../../api/petApi';
import { appointmentApi } from '../../api/appointmentApi';
import { careServiceApi } from '../../api/careServiceApi';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FileUploadField } from '../../components/common/FileUploadField';
import { validatePassword, validatePasswordConfirmation } from '../../utils/validation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  KeyRound,
  Camera,
  Save,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  PawPrint,
  Calendar,
  Package,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { DEFAULT_AVATAR_URL } from '../../utils/constants';

export const OwnerProfilePage = () => {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    avatarUrl: '',
  });

  // Avatar Upload State (for FileUploadField integration)
  const [avatarFile, setAvatarFile] = useState(null);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Loading States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Account Stats
  const [stats, setStats] = useState({
    petsCount: 0,
    upcomingApptsCount: 0,
    activePackagesCount: 0,
  });

  // Initialize profile data from currentUser
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        emergencyContact: currentUser.emergencyContact || 'Thilini Perera (Spouse) - +94 77 234 9988',
        avatarUrl: currentUser.avatarUrl || DEFAULT_AVATAR_URL,
      });

      if (currentUser.avatarUrl) {
        setAvatarFile({
          url: currentUser.avatarUrl,
          fileName: 'Current Profile Photo',
          fileSize: 'Verified',
        });
      }
    }
  }, [currentUser]);

  // Load account activity stats
  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser) return;
      try {
        const [pets, appts, pkgs] = await Promise.all([
          petApi.getPets(currentUser.userId),
          appointmentApi.getAppointments({ ownerId: currentUser.userId }),
          careServiceApi.getPackageBookings({ ownerId: currentUser.userId }),
        ]);

        const upcoming = appts.filter(
          (a) => a.status === 'Scheduled' || a.status === 'CheckedIn'
        ).length;

        setStats({
          petsCount: pets.length,
          upcomingApptsCount: upcoming,
          activePackagesCount: pkgs.length,
        });
      } catch (err) {
        console.error('Failed to load user account stats', err);
      }
    };
    loadStats();
  }, [currentUser]);

  // Handle avatar upload via FileUploadField
  const handleAvatarChange = (fileData) => {
    setAvatarFile(fileData);
    if (fileData?.url) {
      setProfileForm((prev) => ({ ...prev, avatarUrl: fileData.url }));
    } else {
      setProfileForm((prev) => ({
        ...prev,
        avatarUrl: DEFAULT_AVATAR_URL,
      }));
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      showToast('Validation Error', 'Full name is required.', 'error');
      return;
    }
    const emailError = validateEmail(profileForm.email);
    if (emailError) {
      showToast('Validation Error', emailError, 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      await userApi.updateUserProfile(currentUser.userId, {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        emergencyContact: profileForm.emergencyContact.trim(),
        avatarUrl: profileForm.avatarUrl,
      });

      refreshUser();
      showToast('Profile Updated', 'Your profile details have been saved successfully.', 'success');
    } catch (err) {
      showToast('Update Failed', err.message || 'Unable to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      showToast('Validation Error', 'Please enter your current password.', 'error');
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showToast('Validation Error', passwordError, 'error');
      return;
    }
    const confirmationError = validatePasswordConfirmation(newPassword, confirmPassword);
    if (confirmationError) {
      showToast('Validation Error', confirmationError, 'error');
      return;
    }

    setIsSavingPassword(true);
    try {
      await userApi.changePassword(currentUser.userId, {
        currentPassword,
        newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showToast('Password Changed', 'Your account password has been updated securely.', 'success');
    } catch (err) {
      showToast('Security Error', err.message || 'Failed to update password.', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div style={{ color: '#1F2937' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">ACCOUNT SETTINGS</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Pet Owner Profile Management
          </h2>
          <p className="text-sm text-muted">
            Manage your personal credentials, contact details, emergency instructions, and account security.
          </p>
        </div>
      </div>

      {/* Profile Overview Hero Card */}
      <div
        className="card mb-8"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, var(--bg-subtle) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            <div style={{ position: 'relative' }}>
              <img
                src={profileForm.avatarUrl || DEFAULT_AVATAR_URL}
                alt={profileForm.fullName || 'Pet Owner'}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 4px 14px rgba(42, 140, 130, 0.15)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  backgroundColor: 'var(--status-success)',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '3px solid #FFFFFF',
                }}
                title="Account Active"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {profileForm.fullName || 'Pet Owner'}
                </h2>
                <StatusBadge status={currentUser?.status || 'Active'} />
                <span className="badge badge-primary">Pet Owner</span>
              </div>
              <p className="text-sm text-muted flex items-center gap-2">
                <Mail size={14} className="text-primary" /> {profileForm.email}
              </p>
              <p className="text-xs text-muted mt-1 flex items-center gap-1">
                <Clock size={13} /> Member since {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'January 2026'}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-4 flex-wrap">
            <div
              style={{
                backgroundColor: 'var(--primary-subtle)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(42, 140, 130, 0.2)',
                textAlign: 'center',
                minWidth: '105px',
              }}
            >
              <div className="flex items-center justify-center gap-1 text-primary font-bold text-lg">
                <PawPrint size={18} /> {stats.petsCount}
              </div>
              <span className="text-xs text-muted font-semibold">Registered Pets</span>
            </div>

            <div
              style={{
                backgroundColor: '#FFF8F3',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(231, 111, 81, 0.2)',
                textAlign: 'center',
                minWidth: '105px',
              }}
            >
              <div className="flex items-center justify-center gap-1 font-bold text-lg" style={{ color: '#E76F51' }}>
                <Calendar size={18} /> {stats.upcomingApptsCount}
              </div>
              <span className="text-xs text-muted font-semibold">Upcoming Visits</span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-muted)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                textAlign: 'center',
                minWidth: '105px',
              }}
            >
              <div className="flex items-center justify-center gap-1 text-main font-bold text-lg">
                <Package size={18} /> {stats.activePackagesCount}
              </div>
              <span className="text-xs text-muted font-semibold">Wellness Plans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content Grid */}
      <div className="grid-2 gap-6" style={{ alignItems: 'start' }}>
        {/* Left Column: Personal Information & Avatar Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            title="Personal Details & Contact"
            subtitle="Update your name, contact phone, residential address, and emergency contact details."
            icon={User}
          >
            <form onSubmit={handleSaveProfile}>
              <div className="form-group mb-4">
                <label className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    placeholder="e.g. Kavindu Perera"
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <User
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>

              <div className="form-row mb-4">
                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-control"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="e.g. owner@petnexus.com"
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="form-control"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="e.g. +94 77 123 4567"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Phone
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Residential Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="e.g. 45/3 Galle Road, Colombo 06"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <MapPin
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>

              <div className="form-group mb-5">
                <label className="form-label">
                  Emergency Contact Information <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.emergencyContact}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                    placeholder="e.g. Thilini Perera (Spouse) - +94 77 234 9988"
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <ShieldAlert
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#E76F51',
                    }}
                  />
                </div>
                <span className="text-xs text-muted mt-1 block">
                  Primary alternative contact used by veterinary triage staff in critical health emergencies.
                </span>
              </div>

              {/* Profile Photo Upload via FileUploadField */}
              <div className="border-top pt-4 mb-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                <label className="form-label mb-2 flex items-center gap-2 font-bold">
                  <Camera size={16} className="text-primary" /> Profile Photo
                </label>
                <FileUploadField
                  label=""
                  hint="Upload JPG or PNG portrait (Max 10MB)"
                  accept="image/*"
                  value={avatarFile}
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingProfile}
                  style={{ minWidth: '160px' }}
                >
                  {isSavingProfile ? (
                    'Saving Changes...'
                  ) : (
                    <>
                      <Save size={16} /> Save Profile Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Security & Password Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            title="Account Security & Password"
            subtitle="Change your account password. Ensure your password is strong and distinct."
            icon={KeyRound}
          >
            <form onSubmit={handleChangePassword}>
              <div className="form-group mb-4">
                <label className="form-label">
                  Current Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    className="form-control"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter existing password"
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '4px',
                    }}
                    onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                    aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">
                  New Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    className="form-control"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '4px',
                    }}
                    onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                    aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">
                  Confirm New Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    className="form-control"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '4px',
                    }}
                    onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                    aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
                  >
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-light)',
                }}
              >
                <span className="text-xs font-bold text-main block mb-1">Password Requirements:</span>
                <ul className="text-xs text-muted" style={{ paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                  <li>Minimum 6 alphanumeric characters</li>
                  <li>Do not reuse previous default passwords</li>
                  <li>Both new password entries must match exactly</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingPassword}
                  style={{ minWidth: '160px' }}
                >
                  {isSavingPassword ? (
                    'Updating Password...'
                  ) : (
                    <>
                      <Lock size={16} /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>

          {/* Account Verification & Privacy Card */}
          <div
            className="card p-5"
            style={{
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid rgba(42, 140, 130, 0.25)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  Verified Pet Nexus Account
                </h4>
                <p className="text-xs text-muted mt-1" style={{ lineHeight: '1.5' }}>
                  Your account is protected under Pet Nexus clinical privacy guidelines. Emergency contacts and microchip IDs are accessible to verified veterinarians during active consultations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
