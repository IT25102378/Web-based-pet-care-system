import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ShieldCheck,
  Award,
  Heart,
  Stethoscope,
  CheckCircle,
} from 'lucide-react';

export const AboutContactPage = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Clinical Inquiry',
    message: '',
  });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }
    setIsSent(true);
    showToast('Message Sent', 'Thank you! Our clinic desk will respond within 24 hours.', 'success');
  };

  return (
    <div style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-app)' }}>
      <div className="container">
        {/* Intro */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-primary mb-2">ABOUT PET NEXUS</span>
          <h1>Compassionate Medicine. Modern Technology.</h1>
          <p className="text-lg mt-2">
            Founded with a vision to integrate hospital-grade veterinary medicine with seamless rescue operations, foster tracking, and empathetic pet owner partnerships.
          </p>
        </div>

        {/* Values / Pillars */}
        <div className="grid-3 mb-8">
          <Card title="Clinical Excellence" icon={Stethoscope}>
            <p className="text-sm">
              State-of-the-art diagnostic imaging, ultrasonic surgical equipment, sterile surgical suites, and evidence-based pharmacotherapy.
            </p>
          </Card>
          <Card title="Zero-Euthanasia Rescue" icon={Heart}>
            <p className="text-sm">
              Dedicated shelter-to-recovery program offering medical rehabilitation, foster coordination, and verified digital adoption covenants.
            </p>
          </Card>
          <Card title="Transparent Care" icon={ShieldCheck}>
            <p className="text-sm">
              Digital health records, itemized prescription tracking, direct doctor consultations, and clear preventative wellness plans.
            </p>
          </Card>
        </div>

        {/* Contact Info & Interactive Form */}
        <div className="grid-2 mt-8">
          {/* Clinic Location & Hours Card */}
          <div className="card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span className="badge badge-warning mb-2">VISIT OR CALL US</span>
              <h3>Clinic Location & Hours</h3>
              <p className="text-sm mt-1">Conveniently located with dedicated emergency patient parking and triage bays.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 className="text-sm font-bold">Physical Address</h4>
                  <p className="text-sm text-muted">120 Clinical Way, Suite 400, Springfield, NY 10001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 className="text-sm font-bold">Telephone Contacts</h4>
                  <p className="text-sm text-muted">Front Desk: +1 (555) 234-PETS (7387)</p>
                  <p className="text-sm text-danger font-semibold">24/7 Acute Trauma Line: +1 (800) 555-9111</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={20} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 className="text-sm font-bold">Direct Email</h4>
                  <p className="text-sm text-muted">care@petnexusclinic.com | rescue@petnexusclinic.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={20} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 className="text-sm font-bold">Operating Schedule</h4>
                  <p className="text-sm text-muted">Monday – Friday: 8:00 AM – 8:00 PM</p>
                  <p className="text-sm text-muted">Saturday: 9:00 AM – 6:00 PM</p>
                  <p className="text-sm text-muted">Sunday: 10:00 AM – 4:00 PM (Emergency 24/7)</p>
                </div>
              </div>
            </div>

            {/* Map Simulation */}
            <div
              style={{
                height: '140px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-subtle)',
                border: '1px solid rgba(42, 140, 130, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <MapPin size={28} color="var(--primary)" />
              <span className="text-xs font-semibold text-primary">Pet Nexus Medical Campus Map</span>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="card p-6">
            <div>
              <span className="badge badge-primary mb-2">GET IN TOUCH</span>
              <h3>Send a Message or Inquiry</h3>
              <p className="text-sm mt-1">Have a question regarding our medical packages, pet adoption, or specialty surgery?</p>
            </div>

            {isSent ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle size={48} color="var(--status-success)" style={{ margin: '0 auto 1rem' }} />
                <h4>Inquiry Received!</h4>
                <p className="text-sm text-muted mt-2">
                  Thank you, <strong>{formData.name}</strong>. A clinic patient coordinator will contact you at <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm mt-4"
                  onClick={() => {
                    setIsSent(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'General Clinical Inquiry', message: '' });
                  }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone (Optional)</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Inquiry Subject</label>
                    <select
                      className="form-select"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="General Clinical Inquiry">General Clinical Inquiry</option>
                      <option value="Adoption Screening Question">Adoption Screening Question</option>
                      <option value="Foster Parent Program">Foster Parent Program</option>
                      <option value="Specialist Surgery Referral">Specialist Surgery Referral</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message Details <span className="required">*</span></label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please specify your pet's age, species, and your inquiry details..."
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
