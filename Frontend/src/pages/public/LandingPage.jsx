import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { rescueApi } from '../../api/rescueApi';
import { packageApi } from '../../api/packageApi';
import { AdoptionWizardModal } from '../adoption/AdoptionWizardModal';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Calendar,
  Shield,
  Stethoscope,
  Package as PackageIcon,
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Sparkles,
  PhoneCall,
  Clock,
  Scissors,
  Home as HomeIcon,
  BookOpen,
  Activity,
  FileText,
  MessageCircle,
  MapPin,
  Mail,
  Share2,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredPets, setFeaturedPets] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPetForAdoption, setSelectedPetForAdoption] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pets, pkgs] = await Promise.all([
          rescueApi.getRescueCases({ publishedOnly: true }),
          packageApi.getPackages(),
        ]);
        setFeaturedPets(pets.slice(0, 3));
        setPackages(pkgs);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const handleAdoptClick = (pet) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=adopt');
    } else {
      setSelectedPetForAdoption(pet);
    }
  };

  const services = [
    {
      icon: Stethoscope,
      title: 'Veterinary Care',
      desc: 'Comprehensive health exams, advanced surgery, diagnostic imaging, and emergency trauma response.',
      color: '#E76F51',
    },
    {
      icon: Scissors,
      title: 'Grooming & Spa',
      desc: 'Hydrotherapy baths, de-shedding treatments, breed styling, nail dremel buffing, and ear care.',
      color: '#F4A261',
    },
    {
      icon: Activity,
      title: 'Training & Behavior',
      desc: 'Puppy socialization classes, obedience training, and positive behavior modification programs.',
      color: '#2A8C82',
    },
    {
      icon: HomeIcon,
      title: 'Boarding & Daycare',
      desc: 'Spacious climate-controlled suites, daily playgroups, webcams, and 24/7 attentive supervision.',
      color: '#8B5CF6',
    },
    {
      icon: PackageIcon,
      title: 'Pet Wellness Plans',
      desc: 'Bundled annual health care packages covering vaccines, blood panels, and dental scaling.',
      color: '#E76F51',
    },
    {
      icon: Heart,
      title: 'Rescue & Adoption',
      desc: 'Compassionate animal shelter intakes, rehabilitation, foster matching, and verified adoptions.',
      color: '#E76F51',
    },
  ];

  const articles = [
    {
      id: 1,
      title: 'Essential Summer Safety & Hydration Tips for Dogs & Cats',
      category: 'Pet Wellness',
      date: 'August 18, 2026',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&auto=format&fit=crop&q=80',
      summary: 'Recognize signs of heat exhaustion and learn key hydration strategies during warm months.',
    },
    {
      id: 2,
      title: 'Why Annual Dental Prophylaxis Extends Your Pet’s Lifespan',
      category: 'Veterinary Advice',
      date: 'August 10, 2026',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=80',
      summary: 'Prevent periodontal bacteria from impacting your companion’s kidney and heart health.',
    },
    {
      id: 3,
      title: 'Understanding Puppy & Kitten Immunization Timelines',
      category: 'Preventative Care',
      date: 'August 02, 2026',
      image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&auto=format&fit=crop&q=80',
      summary: 'A step-by-step breakdown of essential core vaccines from 8 weeks to 1 year of age.',
    },
  ];

  const testimonials = [
    {
      quote: 'Dr. Chen and the surgical team saved Barnaby after an acute allergy reaction. The compassionate care and digital prescription portal made recovery effortless.',
      author: 'Sarah Jenkins',
      role: 'Pet Parent of Barnaby (Golden Retriever)',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote: 'We adopted Luna through Pet Nexus. The multi-step adoption wizard was clear, and knowing she was fully vaccinated and microchipped gave us total peace of mind.',
      author: 'Elena Rostova',
      role: 'Adopter & Foster Volunteer',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote: 'Marcus in grooming is incredible! Our cat Cleo is usually terrified of grooming, but she came out calm, fluffy, and happy. Best pet care facility in town.',
      author: 'Mark Miller',
      role: 'Pet Parent of Cleo',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#1F2937' }}>
      {/* Hero Section */}
      <section
        style={{
          backgroundColor: '#FFF8F3',
          padding: '4.5rem 0 5.5rem',
          borderBottom: '1px solid #FEE2E2',
        }}
      >
        <div className="container">
          <div className="grid-2 items-center" style={{ gap: '3.5rem' }}>
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#FFFFFF',
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  border: '1px solid #FDBA74',
                  boxShadow: '0 2px 6px rgba(231, 111, 81, 0.08)',
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles size={16} color="#E76F51" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E76F51', letterSpacing: '0.02em' }}>
                  PREMIER VETERINARY & ANIMAL RESCUE
                </span>
              </div>

              <h1
                style={{
                  fontSize: '3.2rem',
                  fontWeight: 900,
                  color: '#12304A',
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Complete Care for Every Pet
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: '#4B5563',
                  lineHeight: 1.65,
                  marginBottom: '2.25rem',
                }}
              >
                From routine wellness checkups and advanced surgical procedures to pampering grooming spa sessions and compassionate animal rescue adoptions — Pet Nexus provides total healthcare for your beloved companions.
              </p>

              <div className="flex items-center gap-3 flex-wrap mb-6">
                <Link
                  to={isAuthenticated ? '/owner/appointments' : '/login'}
                  className="btn btn-lg"
                  style={{
                    backgroundColor: '#E76F51',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.8rem',
                    boxShadow: '0 4px 14px rgba(231, 111, 81, 0.3)',
                  }}
                >
                  <Calendar size={20} /> Book an Appointment
                </Link>

                <a
                  href="#services"
                  className="btn btn-outline btn-lg"
                  style={{
                    borderColor: '#12304A',
                    color: '#12304A',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.6rem',
                  }}
                >
                  Explore Our Services
                </a>

                <Link
                  to="/adoptable-pets"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: '#F4A261',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem 1.6rem',
                  }}
                >
                  <Heart size={20} /> Find a Pet to Adopt
                </Link>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-muted">
                <span className="flex items-center gap-1" style={{ color: '#10B981' }}>
                  <CheckCircle size={16} /> 24/7 Emergency Triage
                </span>
                <span className="flex items-center gap-1" style={{ color: '#E76F51' }}>
                  <CheckCircle size={16} /> Certified Veterinary Surgeons
                </span>
                <span className="flex items-center gap-1" style={{ color: '#12304A' }}>
                  <CheckCircle size={16} /> Verified Adoption Protection
                </span>
              </div>
            </div>

            {/* Right Hero Image */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(18, 48, 74, 0.12)',
                  border: '6px solid #FFFFFF',
                  position: 'relative',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80"
                  alt="Veterinarian examining a healthy dog"
                  style={{ width: '100%', height: '480px', objectFit: 'cover', display: 'block' }}
                />
              </div>

              {/* Floating Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '-20px',
                  backgroundColor: '#FFFFFF',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#FFF8F3',
                    color: '#E76F51',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#12304A' }}>
                    Top Rated Clinic
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    ★★★★★ 4.9 Rating (140+ Reviews)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: '5.5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span
              className="badge"
              style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontSize: '0.8rem', padding: '0.35rem 0.85rem', marginBottom: '0.5rem' }}
            >
              OUR COMPREHENSIVE SERVICES
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#12304A' }}>
              Full-Spectrum Pet Healthcare & Care Services
            </h2>
            <p style={{ color: '#6B7280', fontSize: '1rem', marginTop: '0.5rem' }}>
              Designed to support your pet companions through every phase of life.
            </p>
          </div>

          <div className="grid-3">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div
                  key={idx}
                  className="card card-hoverable"
                  style={{
                    padding: '2rem',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: '#FFF8F3',
                      color: svc.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={28} />
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#12304A', marginBottom: '0.6rem' }}>
                    {svc.title}
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {svc.desc}
                  </p>

                  <Link
                    to={svc.title.includes('Rescue') ? '/adoptable-pets' : '/about-contact'}
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#E76F51',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none',
                    }}
                  >
                    Learn More <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Alternating Feature Showcase Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFF8F3', borderTop: '1px solid #FEE2E2', borderBottom: '1px solid #FEE2E2' }}>
        <div className="container">
          {/* Feature 1 */}
          <div className="grid-2 items-center mb-16" style={{ gap: '3.5rem' }}>
            <div>
              <span className="badge mb-2" style={{ backgroundColor: '#12304A', color: '#FFFFFF' }}>
                ADVANCED MEDICINE
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#12304A', marginBottom: '1rem' }}>
                State-of-the-Art Clinical & Surgical Excellence
              </h2>
              <p style={{ color: '#4B5563', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Our hospital features sterile surgical suites, digital radiography, ultrasound imaging, blood chemistry labs, and intensive recovery units supervised by board-certified veterinarians.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                <li className="flex items-center gap-2 text-sm font-semibold text-main">
                  <CheckCircle size={18} color="#E76F51" /> Diagnostic Imaging & Ultrasound Consultations
                </li>
                <li className="flex items-center gap-2 text-sm font-semibold text-main">
                  <CheckCircle size={18} color="#E76F51" /> Standardized SOAP Electronic Medical Records
                </li>
                <li className="flex items-center gap-2 text-sm font-semibold text-main">
                  <CheckCircle size={18} color="#E76F51" /> Digital Rx Prescription Signoff & Pharmacy
                </li>
              </ul>
              <Link to="/about-contact" className="btn" style={{ backgroundColor: '#12304A', color: '#FFFFFF', fontWeight: 600 }}>
                Learn About Our Facility
              </Link>
            </div>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <img
                src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=700&auto=format&fit=crop&q=80"
                alt="Veterinary surgery diagnostic suite"
                style={{ width: '100%', height: '360px', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid-2 items-center" style={{ gap: '3.5rem' }}>
            <div style={{ order: window.innerWidth > 768 ? 1 : 2 }}>
              <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                <img
                  src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=700&auto=format&fit=crop&q=80"
                  alt="Rescued dog ready for adoption"
                  style={{ width: '100%', height: '360px', objectFit: 'cover' }}
                />
              </div>
            </div>
            <div style={{ order: window.innerWidth > 768 ? 2 : 1 }}>
              <span className="badge mb-2" style={{ backgroundColor: '#E76F51', color: '#FFFFFF' }}>
                RESCUE & WELFARE
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#12304A', marginBottom: '1rem' }}>
                Rehabilitating Rescue Pets for Forever Homes
              </h2>
              <p style={{ color: '#4B5563', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Every rescue case undergoes immediate veterinary intake, medical treatment, foster placement, and behavioral socialization. Our adoption screening includes document verification and 30-day post-placement welfare audits.
              </p>
              <div className="flex items-center gap-3">
                <Link to="/adoptable-pets" className="btn" style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 700 }}>
                  Browse Adoptable Animals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section (Dark Navy Background) */}
      <section style={{ backgroundColor: '#12304A', color: '#FFFFFF', padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
            <span style={{ color: '#F4A261', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              IMPACT & MILESTONES
            </span>
            <h2 style={{ color: '#FFFFFF', fontSize: '2.3rem', fontWeight: 800, marginTop: '0.4rem' }}>
              Trusted by Thousands of Pet Parents
            </h2>
          </div>

          <div className="grid-4 text-center">
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#E76F51', fontFamily: 'monospace' }}>1,400+</div>
              <div style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 600, marginTop: '0.5rem' }}>Patients Treated Annually</div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#F4A261', fontFamily: 'monospace' }}>320+</div>
              <div style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 600, marginTop: '0.5rem' }}>Rescue Pets Rehomed</div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#2A8C82', fontFamily: 'monospace' }}>99.4%</div>
              <div style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 600, marginTop: '0.5rem' }}>Verified Client Retention</div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#E76F51', fontFamily: 'monospace' }}>24/7</div>
              <div style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 600, marginTop: '0.5rem' }}>Emergency Medical Line</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pet Care Packages Section */}
      <section style={{ padding: '5.5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="badge" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontSize: '0.8rem' }}>
              WELLNESS PLANS & PRICING
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#12304A', marginTop: '0.4rem' }}>
              All-Inclusive Pet Care Packages
            </h2>
            <p style={{ color: '#6B7280', fontSize: '1rem', marginTop: '0.5rem' }}>
              Save up to 27% on annual vaccinations, doctor visits, and spa grooming memberships.
            </p>
          </div>

          <div className="grid-2">
            {packages.map((pkg) => (
              <div
                key={pkg.packageId}
                className="card card-hoverable"
                style={{
                  padding: '2rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
                      {pkg.badge || 'Wellness Plan'}
                    </span>
                    <span className="badge badge-warning text-xs">Save {pkg.discountPercent}%</span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#12304A', marginBottom: '0.35rem' }}>
                    {pkg.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.25rem' }}>
                    {pkg.tagline}
                  </p>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#E76F51' }}>
                      Rs. {pkg.price.toLocaleString()}
                    </span>
                    {pkg.originalValue > pkg.price && (
                      <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '1.1rem' }}>
                        Rs. {pkg.originalValue.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem' }}>
                    {pkg.features?.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-main">
                        <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={isAuthenticated ? '/owner/packages' : '/login'}
                  className="btn"
                  style={{
                    backgroundColor: '#E76F51',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    textAlign: 'center',
                    width: '100%',
                    padding: '0.85rem 1rem',
                  }}
                >
                  Enroll in Wellness Package
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Adoptable Pets Showcase Section */}
      <section style={{ padding: '5.5rem 0', backgroundColor: '#FFF8F3', borderTop: '1px solid #FEE2E2' }}>
        <div className="container">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="badge mb-1" style={{ backgroundColor: '#E76F51', color: '#FFFFFF' }}>
                RESCUE GALLERY
              </span>
              <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#12304A' }}>
                Meet Our Adoptable Rescue Companions
              </h2>
              <p style={{ color: '#64748B' }}>Fully health-screened, vaccinated, microchipped, and ready for loving families.</p>
            </div>
            <Link to="/adoptable-pets" className="btn btn-outline" style={{ borderColor: '#12304A', color: '#12304A', fontWeight: 600 }}>
              View All Adoptable Pets <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-3">
            {featuredPets.map((pet) => (
              <div
                key={pet.caseId}
                className="card card-hoverable"
                style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid #E2E8F0' }}
              >
                <div style={{ height: '230px', position: 'relative' }}>
                  <img
                    src={pet.coverPhotoUrl}
                    alt={pet.temporaryName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(18, 48, 74, 0.85)',
                      color: '#FFFFFF',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {pet.species} • {pet.estimatedAge}
                  </div>
                </div>

                <div className="card-body" style={{ padding: '1.5rem' }}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#12304A' }}>
                      {pet.temporaryName}
                    </h3>
                    <span className="badge badge-success text-xs">Ready for Home</span>
                  </div>
                  <p className="text-xs text-muted mb-3 font-semibold">Breed: {pet.breed}</p>
                  <p className="text-sm text-muted mb-4" style={{ lineHeight: '1.5', minHeight: '60px' }}>
                    {pet.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn"
                      style={{
                        backgroundColor: '#E76F51',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        flex: 1,
                        fontSize: '0.875rem',
                      }}
                      onClick={() => handleAdoptClick(pet)}
                    >
                      <Heart size={16} /> Apply to Adopt
                    </button>
                    <Link to="/adoptable-pets" className="btn btn-secondary btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '5.5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="badge" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontSize: '0.8rem' }}>
              CLIENT REVIEWS
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#12304A', marginTop: '0.4rem' }}>
              What Pet Parents Say About Us
            </h2>
          </div>

          <div className="grid-3">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="card p-6"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFF8F3',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} size={16} fill="#F4A261" color="#F4A261" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-top" style={{ borderTop: '1px solid #FDBA74' }}>
                  <img
                    src={t.avatar}
                    alt={t.author}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#12304A' }}>{t.author}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Pet-Care Information / News Section */}
      <section style={{ padding: '5.5rem 0', backgroundColor: '#FFF8F3', borderTop: '1px solid #FEE2E2' }}>
        <div className="container">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <span className="badge mb-1" style={{ backgroundColor: '#12304A', color: '#FFFFFF' }}>
                PET HEALTH ADVICE
              </span>
              <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#12304A' }}>
                Latest Veterinary News & Wellness Guides
              </h2>
            </div>
          </div>

          <div className="grid-3">
            {articles.map((art) => (
              <div
                key={art.id}
                className="card card-hoverable"
                style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}
              >
                <img
                  src={art.image}
                  alt={art.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <div style={{ padding: '1.5rem' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontSize: '0.75rem' }}>
                      {art.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{art.date}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#12304A', marginBottom: '0.6rem', lineHeight: 1.35 }}>
                    {art.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5 }}>
                    {art.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 24/7 Emergency Callout Banner */}
      <section style={{ backgroundColor: '#12304A', color: '#FFFFFF', padding: '4rem 0' }}>
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div style={{ maxWidth: '600px' }}>
              <span style={{ color: '#F4A261', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                24/7 EMERGENCY TRIAGE HOTLINE
              </span>
              <h2 style={{ color: '#FFFFFF', fontSize: '2.2rem', fontWeight: 800, marginTop: '0.4rem' }}>
                Require Urgent Veterinary Care?
              </h2>
              <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>
                Our veterinary trauma unit is staffed 24 hours a day, 365 days a year for acute illness and trauma response.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="tel:+18005557387"
                className="btn btn-lg"
                style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 800, padding: '0.9rem 1.8rem' }}
              >
                <PhoneCall size={22} /> Call (800) 555-PETS
              </a>
              <Link to="/about-contact" className="btn btn-outline btn-lg" style={{ borderColor: '#FFFFFF', color: '#FFFFFF', fontWeight: 600 }}>
                Hours & Location
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Adoption Wizard Modal */}
      {selectedPetForAdoption && (
        <AdoptionWizardModal
          isOpen={!!selectedPetForAdoption}
          onClose={() => setSelectedPetForAdoption(null)}
          pet={selectedPetForAdoption}
        />
      )}
    </div>
  );
};
