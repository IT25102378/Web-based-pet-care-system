import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FileUploadField } from '../../components/common/FileUploadField';
import { validatePassword, validatePasswordConfirmation } from '../../utils/validation';
import { UserRole } from '../../types';
import { Heart, ShieldCheck, Check, ArrowRight, Loader2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState(UserRole.PET_OWNER);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    staffId: '',
    serviceSpecialty: '',
    managerCode: '',
    badgeNumber: '',
  });

  const [verificationDoc, setVerificationDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full legal name is required';
    if (!formData.email.trim()) errs.email = 'Valid email is required';
    const passwordError = validatePassword(formData.password);
    if (passwordError) errs.password = passwordError;
    const confirmationError = validatePasswordConfirmation(formData.password, formData.confirmPassword);
    if (confirmationError) errs.confirmPassword = confirmationError;

    if (role === UserRole.VETERINARIAN && !formData.licenseNumber.trim()) {
      errs.licenseNumber = 'Veterinary Medical License number is required';
    }

    if (!verificationDoc) {
      errs.verificationDoc = 'Please upload a proof of identity / credential document';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Validation Error', 'Please correct the highlighted fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        role,
        verificationDocument: verificationDoc ? {
          name: verificationDoc.fileName,
          url: verificationDoc.url,
          size: verificationDoc.fileSize,
          type: role === UserRole.PET_OWNER ? 'Government Photo ID' : 'Professional Credential / License',
        } : null,
      };

      await register(payload);
      showToast('Registration Submitted', 'Your application is now awaiting administrator review.', 'success');
      navigate('/pending-approval');
    } catch (err) {
      showToast('Registration Failed', err.message || 'Could not register', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 1rem', backgroundColor: 'var(--bg-app)', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <Heart size={26} fill="#FFFFFF" />
          </div>
          <h2>Create Your Pet Nexus Account</h2>
          <p className="text-sm mt-1">Select your clinic role to begin your registration</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="card p-4 mb-6">
          <label className="form-label mb-2">Account Role</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            {[
              { id: UserRole.PET_OWNER, label: '🐾 Pet Owner' },
              { id: UserRole.VETERINARIAN, label: '🩺 Veterinarian' },
              { id: UserRole.CLINIC_STAFF, label: '📋 Clinic Staff' },
              { id: UserRole.PET_CARE_PROVIDER, label: '✂️ Care Provider' },
              { id: UserRole.RESCUE_OFFICER, label: '🦺 Rescue Officer' },
              { id: UserRole.CLINIC_MANAGER, label: '📊 Clinic Manager' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`btn btn-sm ${role === item.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '0.6rem 0.4rem', justifyContent: 'center' }}
                onClick={() => handleRoleChange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Legal Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Dr. Sarah Connor"
                />
                {errors.fullName && <span className="form-error">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Residential / Clinic Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="City, State, ZIP"
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {role === UserRole.VETERINARIAN && (
              <div className="form-row" style={{ backgroundColor: 'var(--primary-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Veterinary Medical License # <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="e.g. VET-NY-98421"
                  />
                  {errors.licenseNumber && <span className="form-error">{errors.licenseNumber}</span>}
                </div>
              </div>
            )}

            {role === UserRole.CLINIC_STAFF && (
              <div className="form-group">
                <label className="form-label">Staff Employee ID (If Assigned)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  placeholder="e.g. STF-109"
                />
              </div>
            )}

            {role === UserRole.PET_CARE_PROVIDER && (
              <div className="form-group">
                <label className="form-label">Care Specialty / Certification</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.serviceSpecialty}
                  onChange={(e) => setFormData({ ...formData, serviceSpecialty: e.target.value })}
                  placeholder="e.g. Master Groomer, Certified Canine Behaviorist"
                />
              </div>
            )}

            {role === UserRole.RESCUE_OFFICER && (
              <div className="form-group">
                <label className="form-label">Rescue Badge / Volunteer ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.badgeNumber}
                  onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                  placeholder="e.g. RSC-442"
                />
              </div>
            )}

            {role === UserRole.CLINIC_MANAGER && (
              <div className="form-group">
                <label className="form-label">Manager Authorization Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.managerCode}
                  onChange={(e) => setFormData({ ...formData, managerCode: e.target.value })}
                  placeholder="e.g. MGR-PASS-001"
                />
              </div>
            )}

            {/* Document Upload for Admin Verification */}
            <div style={{ margin: '1.25rem 0' }}>
              <FileUploadField
                label={
                  role === UserRole.PET_OWNER
                    ? 'Upload Proof of Identity (Photo ID / Passport)'
                    : 'Upload Proof of Identity / Professional Credentials'
                }
                hint="Required for account verification. PNG, JPG, PDF up to 10MB"
                required
                value={verificationDoc}
                onChange={setVerificationDoc}
              />
              {errors.verificationDoc && <span className="form-error">{errors.verificationDoc}</span>}
            </div>

            {/* Passwords */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password <span className="required">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-type password"
                />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Registering Account...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
