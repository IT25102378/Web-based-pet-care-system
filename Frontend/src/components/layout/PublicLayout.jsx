import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { RoleSwitcherBar } from '../common/RoleSwitcherBar';
import { Heart, Phone, Mail, MapPin, Clock, Shield } from 'lucide-react';

export const PublicLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RoleSwitcherBar />
      <Navbar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#12304A', color: '#94A3B8', paddingTop: '4rem', paddingBottom: '2rem' }}>
        <div className="container">
          <div className="grid-4 mb-8">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#E76F51',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Heart size={20} fill="#FFFFFF" />
                </div>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Pet<span style={{ color: '#F4A261' }}>Nexus</span>
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#94A3B8', marginBottom: '1.25rem' }}>
                Comprehensive veterinary medicine, advanced surgery, compassionate rescue operations, and dedicated pet care.
              </p>
              <div className="flex items-center gap-2 mb-3" style={{ color: '#E76F51' }}>
                <Phone size={16} />
                <span className="font-semibold text-sm">24/7 Emergency: +1 (800) 555-PETS</span>
              </div>
              {/* Social Media Placeholders */}
              <div className="flex items-center gap-3 mt-4">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Follow Us:</span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', cursor: 'pointer' }}>FB</span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', cursor: 'pointer' }}>IG</span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', cursor: 'pointer' }}>TW</span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', cursor: 'pointer' }}>LN</span>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Clinic Services</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.875rem' }}>
                <li><Link to="/about-contact" style={{ color: '#94A3B8', textDecoration: 'none' }}>Veterinary Care & Surgery</Link></li>
                <li><Link to="/about-contact" style={{ color: '#94A3B8', textDecoration: 'none' }}>Grooming & Hydrotherapy Spa</Link></li>
                <li><Link to="/about-contact" style={{ color: '#94A3B8', textDecoration: 'none' }}>Training & Behavior Classes</Link></li>
                <li><Link to="/about-contact" style={{ color: '#94A3B8', textDecoration: 'none' }}>Boarding & Daycare Suites</Link></li>
                <li><Link to="/adoptable-pets" style={{ color: '#94A3B8', textDecoration: 'none' }}>Rescue & Adoption Program</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.875rem' }}>
                <li><Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link></li>
                <li><Link to="/adoptable-pets" style={{ color: '#94A3B8', textDecoration: 'none' }}>Browse Adoptable Pets</Link></li>
                <li><Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none' }}>Client & Staff Portal Log In</Link></li>
                <li><Link to="/register" style={{ color: '#94A3B8', textDecoration: 'none' }}>Register New Account</Link></li>
                <li><Link to="/about-contact" style={{ color: '#94A3B8', textDecoration: 'none' }}>Clinic Hours & Location</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Clinic Contact</h4>
              <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div className="flex items-center gap-2">
                  <Clock size={14} color="#F4A261" />
                  <span>Mon – Fri: 08:00 AM – 08:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} color="#F4A261" />
                  <span>Sat – Sun: 09:00 AM – 05:00 PM</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={14} color="#E76F51" />
                  <span>120 Clinical Way, Suite 400, Springfield</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} color="#E76F51" />
                  <span>care@petnexus.com</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
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
