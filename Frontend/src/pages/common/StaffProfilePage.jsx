import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userApi } from '../../api/userApi';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FileUploadField } from '../../components/common/FileUploadField';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  KeyRound,
  Save,
  Briefcase,
  Clock
} from 'lucide-react';

export const StaffProfilePage = () => {
  const { currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    avatarUrl: '',
    licenseNumber: '',
    specialization: '',
    staffId: '',
    managerCode: '',
    badgeNumber: '',
    serviceSpecialty: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        emergencyContact: currentUser.emergencyContact || '',
        avatarUrl: currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName || 'User')}`,
        licenseNumber: currentUser.licenseNumber || '',
        specialization: currentUser.specialization || '',
        staffId: currentUser.staffId || '',
        managerCode: currentUser.managerCode || '',
        badgeNumber: currentUser.badgeNumber || '',
        serviceSpecialty: currentUser.serviceSpecialty || ''
      });

      if (currentUser.avatarUrl) {
        setAvatarFile({ url: currentUser.avatarUrl, fileName: 'Current Profile Photo', fileSize: 'Verified' });
      }
    }
  }, [currentUser]);

  const handleAvatarChange = (fileData) => {
    setAvatarFile(fileData);
    if (fileData?.url) {
      setProfileForm((prev) => ({ ...prev, avatarUrl: fileData.url }));
    } else {
      setProfileForm((prev) => ({
        ...prev,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.fullName || 'User')}`,
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profileForm.phone && !/^\d{10}$/.test(profileForm.phone.replace(/\D/g, ''))) {
      showToast('Action Required', 'Phone number must be exactly 10 digits.', 'error');
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
        licenseNumber: profileForm.licenseNumber.trim(),
        specialization: profileForm.specialization.trim(),
        staffId: profileForm.staffId.trim(),
        managerCode: profileForm.managerCode.trim(),
        badgeNumber: profileForm.badgeNumber.trim(),
        serviceSpecialty: profileForm.serviceSpecialty.trim(),
      });

      await refreshUser();
      showToast('Profile Updated', 'Your profile details have been saved successfully.', 'success');
    } catch (err) {
      showToast('Update Failed', err.message || 'Unable to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      showToast('Action Required', 'Please check your passwords and try again.', 'error');
      return;
    }

    setIsSavingPassword(true);
    try {
      await userApi.changePassword(currentUser.userId, { currentPassword, newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password Changed', 'Your account password has been updated securely.', 'success');
    } catch (err) {
      showToast('Security Error', err.message || 'Failed to update password.', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'Veterinarian': return 'Veterinarian';
      case 'ClinicStaff': return 'Clinic Staff';
      case 'RescueOfficer': return 'Rescue Officer';
      case 'PetCareProvider': return 'Pet Care Provider';
      case 'ClinicManager': return 'Clinic Manager';
      default: return role;
    }
  };

  return (
    <div style={{ color: '#1F2937' }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">ACCOUNT SETTINGS</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Professional Profile Management
          </h2>
          <p className="text-sm text-muted">
            Manage your personal credentials, contact details, professional records, and account security.
          </p>
        </div>
      </div>

      {/* Hero Card */}
      <div className="card mb-8" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, var(--bg-subtle) 100%)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            <div style={{ position: 'relative' }}>
              <img
                src={profileForm.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileForm.fullName || 'User')}`}
                alt={profileForm.fullName || 'Staff'}
                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #FFFFFF', boxShadow: '0 4px 14px rgba(42, 140, 130, 0.15)' }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{profileForm.fullName || 'Staff Member'}</h2>
                <StatusBadge status={currentUser?.status || 'Active'} />
                <span className="badge badge-primary">{getRoleDisplayName(currentUser?.role)}</span>
              </div>
              <p className="text-sm text-muted flex items-center gap-2">
                <Mail size={14} className="text-primary" /> {profileForm.email}
              </p>
              <p className="text-xs text-muted mt-1 flex items-center gap-1">
                <Clock size={13} /> Member since {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '2026'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 gap-6" style={{ alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Personal Details & Contact" subtitle="Update your name, contact phone, residential address, and emergency contact details." icon={User}>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group mb-4">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="form-control" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} required style={{ paddingLeft: '2.5rem' }} />
                  <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
              <div className="form-row mb-4">
                <div className="form-group">
                  <label className="form-label">Email Address <span className="required">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input type="email" className="form-control" value={profileForm.email} disabled style={{ paddingLeft: '2.5rem' }} />
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" className="form-control" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} style={{ paddingLeft: '2.5rem' }} />
                    <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Residential Address</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="form-control" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} style={{ paddingLeft: '2.5rem' }} />
                  <MapPin size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Emergency Contact (Name & Phone)</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" className="form-control" value={profileForm.emergencyContact} onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })} style={{ paddingLeft: '2.5rem' }} />
                  <ShieldAlert size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
              
              <hr className="my-5" />
              <div className="mb-4">
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }} className="flex items-center gap-2">
                  <Briefcase size={16} className="text-primary" /> Professional Records
                </h4>
                <p className="text-sm text-muted mb-4">These fields are tied to your operational role.</p>
                <div className="form-row">
                  {currentUser?.role === 'Veterinarian' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">License Number</label>
                        <input type="text" className="form-control" value={profileForm.licenseNumber} onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Specialization</label>
                        <input type="text" className="form-control" value={profileForm.specialization} onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })} />
                      </div>
                    </>
                  )}
                  {currentUser?.role === 'ClinicStaff' && (
                    <div className="form-group">
                      <label className="form-label">Staff ID</label>
                      <input type="text" className="form-control" value={profileForm.staffId} onChange={(e) => setProfileForm({ ...profileForm, staffId: e.target.value })} />
                    </div>
                  )}
                  {currentUser?.role === 'ClinicManager' && (
                    <div className="form-group">
                      <label className="form-label">Manager Code</label>
                      <input type="text" className="form-control" value={profileForm.managerCode} onChange={(e) => setProfileForm({ ...profileForm, managerCode: e.target.value })} />
                    </div>
                  )}
                  {currentUser?.role === 'RescueOfficer' && (
                    <div className="form-group">
                      <label className="form-label">Badge Number</label>
                      <input type="text" className="form-control" value={profileForm.badgeNumber} onChange={(e) => setProfileForm({ ...profileForm, badgeNumber: e.target.value })} />
                    </div>
                  )}
                  {currentUser?.role === 'PetCareProvider' && (
                    <div className="form-group">
                      <label className="form-label">Service Specialty</label>
                      <input type="text" className="form-control" value={profileForm.serviceSpecialty} onChange={(e) => setProfileForm({ ...profileForm, serviceSpecialty: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button type="submit" className="btn btn-primary" disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Profile Photo" subtitle="Update your profile picture." icon={User}>
            <div className="mb-4">
              <FileUploadField
                label="Upload New Photo"
                accept="image/png, image/jpeg"
                maxSizeMB={2}
                value={avatarFile}
                onChange={handleAvatarChange}
                helperText="Square images work best (Max 2MB)"
              />
            </div>
            {profileForm.avatarUrl && (
              <div className="flex justify-end">
                <button type="button" className="btn btn-outline" onClick={() => handleSaveProfile({ preventDefault: () => {} })}>
                  <Save size={16} /> Save Photo
                </button>
              </div>
            )}
          </Card>
          <Card title="Security & Authentication" subtitle="Manage your account password." icon={KeyRound}>
            <form onSubmit={handleChangePassword}>
              <div className="form-group mb-4">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength="6" />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required minLength="6" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={isSavingPassword}>
                  {isSavingPassword ? 'Updating...' : <><KeyRound size={16} /> Update Password</>}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
