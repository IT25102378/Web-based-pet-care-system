import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { PawPrint, Phone, Mail, MapPin, Clock } from 'lucide-react';

export const PublicLayout = () => {
  const { isAuthenticated } = useAuth();
  const canAccessAdoptions = isAuthenticated;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="site-footer-grid">
            <div>
              <Link to="/" className="brand" aria-label="Pet Nexus home">
                <div className="brand-mark">
                  <PawPrint size={17} />
                </div>
                <div className="brand-name">Pet<span>Nexus</span></div>
              </Link>
              <p>
                Comprehensive veterinary medicine, advanced surgery, compassionate rescue operations, and dedicated pet care.
              </p>
              <a href="tel:+94112557387" className="site-footer-emergency">
                <Phone size={16} /> 24/7 emergency: +94 11 255 7387
              </a>
            </div>

            <div>
              <h4>Clinic services</h4>
              <ul>
                <li><Link to="/about-contact">Veterinary care and surgery</Link></li>
                <li><Link to="/about-contact">Grooming and hydrotherapy spa</Link></li>
                <li><Link to="/about-contact">Training and behavior classes</Link></li>
                <li><Link to="/about-contact">Boarding and daycare suites</Link></li>
                {canAccessAdoptions ? (
                  <li><Link to="/adoptable-pets">Rescue and adoption program</Link></li>
                ) : (
                  <li><Link to="/about-contact">Rescue and rehoming services</Link></li>
                )}
              </ul>
            </div>

            <div>
              <h4>Quick links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                {canAccessAdoptions && (
                  <li><Link to="/adoptable-pets">Browse adoptable pets</Link></li>
                )}
                <li><Link to="/login">Client and staff sign in</Link></li>
                <li><Link to="/register">Create an account</Link></li>
                <li><Link to="/about-contact">Clinic hours and location</Link></li>
              </ul>
            </div>

            <div>
              <h4>Contact</h4>
              <div className="site-footer-contact">
                <div><Clock size={16} /><span>Mon – Fri: 8:00 AM – 8:00 PM<br />Sat – Sun: 9:00 AM – 5:00 PM</span></div>
                <div><MapPin size={16} /><span>No. 120, Galle Road, Colombo 03, Sri Lanka</span></div>
                <div><Mail size={16} /><span>care@petnexus.com</span></div>
              </div>
            </div>
          </div>

          <div className="site-footer-bottom">
            <span>&copy; 2026 Pet Nexus Veterinary Management System. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
