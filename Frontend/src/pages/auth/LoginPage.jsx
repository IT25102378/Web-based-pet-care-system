import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole, UserStatus } from '../../types';
import { authApi } from '../../api/authApi';
import { Heart, Lock, Mail, Clock, ShieldAlert, Sparkles, Check, PawPrint, Database } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Admin', role: 'Admin', email: 'admin@petnexus.com', fullName: 'PetNexus System Administrator', defaultPassword: 'password123' },
  { label: 'Ifaza (Owner)', role: 'PetOwner', email: 'ifaza@petnexus.com', fullName: 'Ifaza Dilshad', pets: ['Luna (Persian)', 'Simba (Spaniel)'], defaultPassword: 'password123' },
  { label: 'Oshada (Vet)', role: 'Veterinarian', email: 'oshada@petnexus.com', fullName: 'Dr. Oshada', defaultPassword: 'password123' },
  { label: 'Lakdin (Staff)', role: 'ClinicStaff', email: 'lakdin@petnexus.com', fullName: 'Lakdin', defaultPassword: 'password123' },
  { label: 'Eshani (Provider)', role: 'PetCareProvider', email: 'eshani@petnexus.com', fullName: 'Eshani', defaultPassword: 'password123' },
  { label: 'Ediriweera (Manager)', role: 'ClinicManager', email: 'ediriweera@petnexus.com', fullName: 'Ediriweera D.L', defaultPassword: 'password123' },
  { label: 'Avinash (Rescue)', role: 'RescueOfficer', email: 'avijeeva6@gmail.com', fullName: 'Avinash', defaultPassword: 'password123' },
  { label: 'Kavindu (Owner)', role: 'PetOwner', email: 'owner@petnexus.com', fullName: 'Kavindu Perera', pets: ['Barnaby (Golden Retriever)', 'Cleo (British Shorthair)', 'Milo (Holland Lop)'], defaultPassword: 'password123' },
  { label: 'Dr. Sachini (Vet)', role: 'Veterinarian', email: 'vet@petnexus.com', fullName: 'Dr. Sachini Wijesinghe, BVSc', defaultPassword: 'password123' },
  { label: 'Dilshan (Provider)', role: 'PetCareProvider', email: 'provider@petnexus.com', fullName: 'Dilshan Bandara', defaultPassword: 'password123' },
  { label: 'Nethmi (Staff)', role: 'ClinicStaff', email: 'staff@petnexus.com', fullName: 'Nethmi Fernando', defaultPassword: 'password123' },
  { label: 'Himashi (Manager)', role: 'ClinicManager', email: 'manager@petnexus.com', fullName: 'Himashi Gunawardena', defaultPassword: 'password123' },
  { label: 'Shehan (Rescue)', role: 'RescueOfficer', email: 'rescue@petnexus.com', fullName: 'Shehan Rajapaksha', defaultPassword: 'password123' },
];

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusError, setStatusError] = useState(null); // { type, message, reason }

  // Dynamic Live Database Autofill Suggestions
  const [suggestions, setSuggestions] = useState(DEMO_ACCOUNTS);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeAccountInfo, setActiveAccountInfo] = useState(null);
  const dropdownRef = useRef(null);

  const redirectParam = new URLSearchParams(location.search).get('redirect');

  const getDashboardRoute = (role) => {
    switch (role) {
      case UserRole.PET_OWNER: return '/owner/overview';
      case UserRole.VETERINARIAN: return '/vet/schedule';
      case UserRole.CLINIC_STAFF: return '/staff/queue';
      case UserRole.RESCUE_OFFICER: return '/rescue/dashboard';
      case UserRole.PET_CARE_PROVIDER: return '/provider/dashboard';
      case UserRole.CLINIC_MANAGER: return '/manager/dashboard';
      case UserRole.ADMIN: return '/admin/dashboard';
      default: return '/';
    }
  };

  // Fetch suggestions as user types email or on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const q = email.trim().toLowerCase();
        let results = [];
        try {
          results = await authApi.suggestAccounts(email.trim());
        } catch (ignored) {}

        const merged = [...(results || [])];
        DEMO_ACCOUNTS.forEach((demo) => {
          if (!merged.some((m) => m.email.toLowerCase() === demo.email.toLowerCase())) {
            merged.push(demo);
          }
        });

        const filtered = q
          ? merged.filter(
              (item) =>
                item.email.toLowerCase().includes(q) ||
                (item.fullName && item.fullName.toLowerCase().includes(q)) ||
                (item.role && item.role.toLowerCase().includes(q)) ||
                (item.label && item.label.toLowerCase().includes(q))
            )
          : merged;

        if (isMounted) {
          setSuggestions(filtered);
          // If exact match found, auto-link account info
          const exact = merged.find((r) => r.email.toLowerCase() === q);
          if (exact) {
            setActiveAccountInfo(exact);
            if (!password) {
              setPassword(exact.defaultPassword || 'password123');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching account suggestions:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, email ? 60 : 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [email]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item) => {
    setEmail(item.email);
    setPassword(item.defaultPassword || 'password123');
    setActiveAccountInfo(item);
    setShowDropdown(false);
    setStatusError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      showToast('Welcome Back', `Logged in as ${user.fullName}`, 'success');
      navigate(getDashboardRoute(user.role));
    } catch (err) {
      const code = err.code || authApi.detectStatusCode(err.message);

      if (code === 'PENDING_APPROVAL') {
        setStatusError({
          type: 'pending_approval',
          title: 'Account Awaiting Admin Approval',
          message:
            'Your registration has been submitted and is currently being verified by the clinic administration team. You will receive an email confirmation once reviewed.',
        });
      } else if (code === 'REJECTED') {
        setStatusError({
          type: 'rejected',
          title: 'Application Rejected',
          message: 'Your application to join Pet Nexus was not approved.',
          reason: err.rejectionReason || undefined,
        });
      } else if (code === 'PENDING_EMAIL') {
        setStatusError({
          type: 'pending_email',
          title: 'Email Verification Required',
          message: 'Please verify your email address to proceed with your application.',
        });
      } else if (code === 'SUSPENDED') {
        setStatusError({
          type: 'rejected',
          title: 'Account Suspended',
          message: err.message || 'Your account has been suspended. Please contact the clinic administrator.',
        });
      } else {
        showToast('Login Failed', err.message || 'An unexpected error occurred.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
              marginBottom: '1rem',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}
          >
            <Heart size={26} fill="#FFFFFF" />
          </div>
          <h2>Sign in to Pet Nexus</h2>
          <p className="text-sm mt-1">Access your pet health records or staff clinical dashboard</p>
        </div>

        {/* Status Error Alert Box */}
        {statusError && (
          <div
            style={{
              backgroundColor: statusError.type === 'rejected' ? 'var(--status-danger-bg)' : 'var(--status-warning-bg)',
              border: `1px solid ${statusError.type === 'rejected' ? 'var(--status-danger)' : 'var(--status-warning)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {statusError.type === 'rejected' ? (
                <ShieldAlert size={22} color="var(--status-danger)" />
              ) : (
                <Clock size={22} color="var(--status-warning)" />
              )}
            </div>
            <div>
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: statusError.type === 'rejected' ? 'var(--status-danger-text)' : 'var(--status-warning-text)',
                  marginBottom: '0.25rem',
                }}
              >
                {statusError.title}
              </h4>
              <p
                style={{
                  fontSize: '0.825rem',
                  color: statusError.type === 'rejected' ? 'var(--status-danger-text)' : 'var(--status-warning-text)',
                  lineHeight: '1.4',
                }}
              >
                {statusError.message}
              </p>
              {statusError.reason && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.775rem',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <strong>Reason given:</strong> {statusError.reason}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="card p-6" style={{ position: 'relative' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="form-label mb-0">Email Address</label>
                <span className="text-xs text-muted" style={{ fontSize: '0.72rem' }}>Type to filter accounts</span>
              </div>

              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-subtle)',
                  }}
                />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    setShowDropdown(true);
                  }}
                  placeholder="name@example.com (type to choose account)"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    marginTop: '4px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                  }}
                >
                  <div
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'var(--text-subtle)',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-muted)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>AVAILABLE ACCOUNTS</span>
                    <span>{suggestions.length} found</span>
                  </div>
                  {suggestions.map((item) => (
                    <div
                      key={item.userId || item.email}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(item);
                      }}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {item.fullName}
                        </span>
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor:
                              item.role === 'Veterinarian'
                                ? 'var(--primary-subtle)'
                                : item.role === 'PetOwner'
                                ? 'var(--primary-subtle)'
                                : 'var(--primary-subtle)',
                            color:
                              item.role === 'Veterinarian'
                                ? 'var(--primary)'
                                : item.role === 'PetOwner'
                                ? 'var(--primary)'
                                : 'var(--primary)',
                          }}
                        >
                          {item.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.15rem' }}>
                        {item.email}
                      </div>

                      {/* Associated Pets in Database */}
                      {item.pets && item.pets.length > 0 && (
                        <div
                          style={{
                            marginTop: '0.35rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.75rem',
                            color: 'var(--primary)',
                            fontWeight: 600,
                          }}
                        >
                          <PawPrint size={12} />
                          <span>Pets: {item.pets.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detected Account / Companion Badge */}
            {activeAccountInfo && (
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#166534', fontWeight: 700 }}>
                    <Check size={14} color="#16A34A" /> {activeAccountInfo.fullName}
                  </div>
                  {activeAccountInfo.pets && activeAccountInfo.pets.length > 0 ? (
                    <div style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '0.15rem' }}>
                      Companion: <strong>{activeAccountInfo.pets.join(', ')}</strong>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                      {activeAccountInfo.role}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-subtle)',
                  }}
                />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.25rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          Don’t have an account yet?{' '}
          <Link to="/register" className="font-semibold text-primary">
            Register for Pet Nexus
          </Link>
        </p>
      </div>
    </div>
  );
};

