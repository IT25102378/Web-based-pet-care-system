import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { PawPrint, Heart, Phone, Mail, MapPin, Clock, Shield } from 'lucide-react';

export const PublicLayout = () => {
  const { isAuthenticated, role } = useAuth();
  const canAccessAdoptions = isAuthenticated && (role === 'PetOwner' || role === 'RescueOfficer');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#12304A', color: '#94A3B8', paddingTop: '4rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          <div className="grid-4 mb-8">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <PawPrint size={22} />
                </div>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Pet<span style={{ color: 'var(--primary-light)' }}>Nexus</span>
                </span>
              </div>
              <p style={{ fontSize: '0.975rem', lineHeight: '1.6', color: '#CBD5E1', marginBottom: '1.25rem' }}>
                Comprehensive veterinary medicine, advanced surgery, compassionate rescue operations, and dedicated pet care.
              </p>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--accent)' }}>
                <Phone size={18} />
                <span className="font-semibold text-base">24/7 Emergency: +94 11 255-PETS (+94 11 255 7387)</span>
              </div>
              {/* Social Media Placeholders */}
              <div className="flex items-center gap-3 mt-4">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Follow Us:</span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.85rem' }}>FB</span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.85rem' }}>IG</span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.85rem' }}>TW</span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', cursor: 'pointer', fontSize: '0.85rem' }}>LN</span>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 750, marginBottom: '1rem' }}>Clinic Services</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.95rem' }}>
                <li><Link to="/about-contact" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Veterinary Care & Surgery</Link></li>
                <li><Link to="/about-contact" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Grooming & Hydrotherapy Spa</Link></li>
                <li><Link to="/about-contact" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Training & Behavior Classes</Link></li>
                <li><Link to="/about-contact" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Boarding & Daycare Suites</Link></li>
                {canAccessAdoptions ? (
                  <li><Link to="/adoptable-pets" style={{ color: '#F4A261', textDecoration: 'none', fontWeight: 600 }}>Rescue & Adoption Program</Link></li>
                ) : (
                  <li><Link to="/about-contact" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Rescue & Rehoming Services</Link></li>
                )}
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 750, marginBottom: '1rem' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.95rem' }}>
                <li><Link to="/" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Home</Link></li>
                {canAccessAdoptions && (
                  <li><Link to="/adoptable-pets" style={{ color: '#F4A261', textDecoration: 'none', fontWeight: 600 }}>Browse Adoptable Pets</Link></li>
                )}
                <li><Link to="/login" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Client & Staff Portal Log In</Link></li>
                <li><Link to="/register" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Register New Account</Link></li>
                <li><Link to="/about-contact" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Clinic Hours & Location</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 750, marginBottom: '1rem' }}>Clinic Contact</h4>
              <div style={{ fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div className="flex items-center gap-2">
                  <Clock size={16} color="#F4A261" />
                  <span style={{ color: '#CBD5E1' }}>Mon – Fri: 08:00 AM – 08:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} color="#F4A261" />
                  <span style={{ color: '#CBD5E1' }}>Sat – Sun: 09:00 AM – 05:00 PM</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={16} color="#E76F51" />
                  <span style={{ color: '#CBD5E1' }}>No. 120, Galle Road, Colombo 03, Sri Lanka</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} color="#E76F51" />
                  <span style={{ color: '#CBD5E1' }}>care@petnexus.com</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <p style={{ color: '#64748B' }}>
              &copy; 2026 Pet Nexus Veterinary Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span style={{ color: '#64748B' }}>Spring Boot + SQL Server Connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
