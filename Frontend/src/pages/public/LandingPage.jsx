import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { rescueApi } from '../../api/rescueApi';
import { packageApi } from '../../api/packageApi';
import { AdoptionWizardModal } from '../adoption/AdoptionWizardModal';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Package as PackageIcon,
  Star,
  ArrowRight,
  Check,
  CheckCircle,
  Award,
  PhoneCall,
  Clock,
  Scissors,
  Home as HomeIcon,
  Activity,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();
  const canAccessAdoptions = isAuthenticated && (role === 'PetOwner' || role === 'RescueOfficer');
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
    },
    {
      icon: Scissors,
      title: 'Grooming & Spa',
      desc: 'Hydrotherapy baths, de-shedding treatments, breed styling, nail dremel buffing, and ear care.',
    },
    {
      icon: Activity,
      title: 'Training & Behavior',
      desc: 'Puppy socialization classes, obedience training, and positive behavior modification programs.',
    },
    {
      icon: HomeIcon,
      title: 'Boarding & Daycare',
      desc: 'Spacious climate-controlled suites, daily playgroups, webcams, and 24/7 attentive supervision.',
    },
    {
      icon: PackageIcon,
      title: 'Pet Wellness Plans',
      desc: 'Bundled annual health care packages covering vaccines, blood panels, and dental scaling.',
    },
    {
      icon: Heart,
      title: 'Rescue & Adoption',
      desc: 'Compassionate animal shelter intakes, rehabilitation, foster matching, and verified adoptions.',
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

  // The landing page highlights a few plans; the full catalogue lives in the owner portal
  const featuredPackages = packages.slice(0, 3);
  const rescueLink = canAccessAdoptions
    ? '/adoptable-pets'
    : (isAuthenticated ? '/about-contact' : '/login?redirect=adoptable-pets');

  return (
    <div>
      {/* Hero */}
      <section className="lp-hero">
        <div className="container lp-hero-grid">
          <div>
            <div className="lp-pill hero-entrance hero-entrance-delay-1">
              <ShieldCheck size={15} /> Veterinary care, grooming, rescue and adoption
            </div>

            <h1 className="lp-hero-title hero-entrance hero-entrance-delay-2">
              Complete care for <span>every pet</span>
            </h1>

            <p className="lp-hero-lead hero-entrance hero-entrance-delay-3">
              From routine wellness checkups and advanced surgery to grooming and rescue adoptions, Pet Nexus brings your companion's whole care journey into one place.
            </p>

            {/* CTA buttons differ for guests vs authenticated users */}
            <div className="lp-actions hero-entrance hero-entrance-delay-4">
              {isAuthenticated ? (
                <>
                  <Link to="/owner/appointments" className="btn btn-primary btn-lg">
                    <Calendar size={18} /> Book an appointment
                  </Link>
                  {canAccessAdoptions && (
                    <Link to="/adoptable-pets" className="btn btn-secondary btn-lg">
                      <Heart size={18} /> Adoptable pets
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Create free account <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Sign in
                  </Link>
                </>
              )}
              <a href="#services" className="btn btn-ghost btn-lg">
                Explore services
              </a>
            </div>

            <div className="lp-trust hero-entrance hero-entrance-delay-4">
              <span><CheckCircle size={16} /> 24/7 emergency care</span>
              <span><CheckCircle size={16} /> Certified surgeons</span>
              <span><CheckCircle size={16} /> Verified adoptions</span>
            </div>
          </div>

          <div className="lp-hero-media hero-entrance hero-entrance-delay-3">
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80"
              alt="Modern veterinary treatment room"
            />
            <div className="lp-hero-badge">
              <div className="lp-icon">
                <Award size={22} />
              </div>
              <div>
                <strong>Top rated clinic</strong>
                <span>4.9 average from 140+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="lp-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">Our services</span>
            <h2 className="lp-title">Full-spectrum pet healthcare and care services</h2>
            <p className="lp-lead">Designed to support your companions through every phase of life.</p>
          </div>

          <div className="grid-3">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div key={svc.title} className="lp-card lp-card-hover">
                  <div className="lp-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{svc.title}</h3>
                  <p>{svc.desc}</p>
                  <Link to={svc.title.includes('Rescue') ? '/adoptable-pets' : '/about-contact'} className="lp-link">
                    Learn more <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature showcase */}
      <section className="lp-section lp-section-alt">
        <div className="container">
          <div className="lp-feature">
            <div>
              <span className="lp-eyebrow">Advanced medicine</span>
              <h2 className="lp-title">State-of-the-art clinical and surgical excellence</h2>
              <p className="lp-lead">
                Our hospital features sterile surgical suites, digital radiography, ultrasound imaging, blood chemistry labs, and intensive recovery units supervised by board-certified veterinarians.
              </p>
              <ul className="lp-checklist">
                <li><Check size={17} /> Diagnostic imaging and ultrasound consultations</li>
                <li><Check size={17} /> Standardized electronic medical records</li>
                <li><Check size={17} /> Digital prescriptions and in-house pharmacy</li>
              </ul>
              <Link to="/about-contact" className="btn btn-primary">
                Learn about our facility
              </Link>
            </div>
            <div className="lp-feature-media">
              <img
                src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=700&auto=format&fit=crop&q=80"
                alt="Veterinary surgery diagnostic suite"
              />
            </div>
          </div>

          <div className="lp-feature">
            <div className="lp-feature-media">
              <img
                src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=700&auto=format&fit=crop&q=80"
                alt="Rescued dog ready for adoption"
              />
            </div>
            <div>
              <span className="lp-eyebrow">Rescue and welfare</span>
              <h2 className="lp-title">Rehabilitating rescue pets for forever homes</h2>
              <p className="lp-lead" style={{ marginBottom: '1.75rem' }}>
                Every rescue case undergoes immediate veterinary intake, medical treatment, foster placement, and behavioral socialization. Our adoption screening includes document verification and 30-day post-placement welfare audits.
              </p>
              <Link to={rescueLink} className="btn btn-primary">
                {canAccessAdoptions
                  ? 'Browse adoptable animals'
                  : (isAuthenticated ? 'Learn about our rescue program' : 'Client adoption portal')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="lp-stats">
        <div className="container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">Impact and milestones</span>
            <h2 className="lp-title">Trusted by thousands of pet parents</h2>
          </div>

          <div className="lp-stats-grid">
            <div className="lp-stat">
              <div className="lp-stat-value">1,400+</div>
              <div className="lp-stat-label">Patients treated annually</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-value">320+</div>
              <div className="lp-stat-label">Rescue pets rehomed</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-value">99.4%</div>
              <div className="lp-stat-label">Client retention</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-value">24/7</div>
              <div className="lp-stat-label">Emergency medical line</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pet care packages */}
      {featuredPackages.length > 0 && (
        <section className="lp-section">
          <div className="container">
            <div className="lp-section-head">
              <span className="lp-eyebrow">Wellness plans and pricing</span>
              <h2 className="lp-title">All-inclusive pet care packages</h2>
              <p className="lp-lead">
                Bundle annual vaccinations, doctor visits, and grooming into one plan and save.
              </p>
            </div>

            <div className="grid-3">
              {featuredPackages.map((pkg) => (
                <div key={pkg.packageId} className="lp-card lp-plan">
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge badge-primary">{pkg.badge || 'Wellness Plan'}</span>
                    {pkg.discountPercent > 0 && (
                      <span className="badge badge-warning">Save {pkg.discountPercent}%</span>
                    )}
                  </div>

                  <h3>{pkg.name}</h3>
                  <p>{pkg.tagline}</p>

                  <div className="lp-price">
                    <strong>${pkg.price.toLocaleString()}</strong>
                    {pkg.originalValue > pkg.price && <s>${pkg.originalValue.toLocaleString()}</s>}
                  </div>

                  <div className="lp-plan-features">
                    {pkg.features?.map((feat, idx) => (
                      <div key={idx}>
                        <Check size={16} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <Link to={isAuthenticated ? '/owner/packages' : '/login'} className="btn btn-primary">
                    Enroll in this package
                  </Link>
                </div>
              ))}
            </div>

            {packages.length > featuredPackages.length && (
              <div className="text-center mt-8">
                <Link to={isAuthenticated ? '/owner/packages' : '/login'} className="btn btn-secondary">
                  View all {packages.length} packages <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Adoptable pets */}
      {featuredPets.length > 0 && (
        <section className="lp-section lp-section-alt">
          <div className="container">
            <div className="lp-head-row">
              <div>
                <span className="lp-eyebrow">Rescue gallery</span>
                <h2 className="lp-title">Meet our adoptable rescue companions</h2>
                <p className="lp-lead">Health-screened, vaccinated, microchipped, and ready for loving families.</p>
              </div>
              <Link to={rescueLink} className="btn btn-secondary">
                {canAccessAdoptions
                  ? 'View all adoptable pets'
                  : (isAuthenticated ? 'Rescue overview' : 'Adoption portal login')}
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid-3">
              {featuredPets.map((pet) => (
                <div key={pet.caseId} className="lp-card lp-card-hover lp-media-card">
                  <div className="lp-media-photo">
                    <img src={pet.coverPhotoUrl} alt={pet.temporaryName} />
                    <span className="lp-media-tag">{pet.species} · {pet.estimatedAge}</span>
                  </div>

                  <div className="lp-media-body">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3>{pet.temporaryName}</h3>
                      <span className="badge badge-success">Ready for home</span>
                    </div>
                    <p className="text-sm text-subtle mb-2">{pet.breed}</p>
                    <p>{pet.description}</p>

                    <div className="lp-actions">
                      {canAccessAdoptions && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => handleAdoptClick(pet)}
                        >
                          <Heart size={16} /> Apply to adopt
                        </button>
                      )}
                      <Link
                        to={rescueLink}
                        className="btn btn-secondary"
                        style={{ flex: canAccessAdoptions ? 'initial' : 1 }}
                      >
                        {canAccessAdoptions ? 'Details' : 'View rescue story'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="lp-section">
        <div className="container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">Client reviews</span>
            <h2 className="lp-title">What pet parents say about us</h2>
          </div>

          <div className="grid-3">
            {testimonials.map((t) => (
              <figure key={t.author} className="lp-card lp-testimonial">
                <div className="flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }, (_, i) => (
                    <Star key={i} size={15} fill="var(--status-warning)" color="var(--status-warning)" />
                  ))}
                </div>
                <blockquote className="lp-quote">“{t.quote}”</blockquote>
                <figcaption className="lp-author">
                  <img src={t.avatar} alt="" />
                  <div>
                    <strong>{t.author}</strong>
                    <span>{t.role}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="lp-section lp-section-alt">
        <div className="container">
          <div className="lp-head-row">
            <div>
              <span className="lp-eyebrow">Pet health advice</span>
              <h2 className="lp-title">Latest veterinary news and wellness guides</h2>
            </div>
          </div>

          <div className="grid-3">
            {articles.map((art) => (
              <article key={art.id} className="lp-card lp-media-card">
                <div className="lp-media-photo" style={{ height: '190px' }}>
                  <img src={art.image} alt="" />
                </div>
                <div className="lp-media-body">
                  <div className="lp-meta">
                    <span className="badge badge-primary">{art.category}</span>
                    <span>{art.date}</span>
                  </div>
                  <h3>{art.title}</h3>
                  <p className="mt-2">{art.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency call-to-action */}
      <section className="lp-cta">
        <div className="container lp-cta-inner">
          <div>
            <span className="lp-eyebrow">24/7 emergency hotline</span>
            <h2 className="lp-title">Need urgent veterinary care?</h2>
            <p>
              Our trauma unit is staffed 24 hours a day, 365 days a year for acute illness and injury.
            </p>
          </div>

          <div className="lp-actions">
            <a href="tel:+94112557387" className="btn btn-lg btn-on-dark">
              <PhoneCall size={18} /> +94 11 255 7387
            </a>
            <Link to="/about-contact" className="btn btn-lg btn-on-dark-outline">
              <Clock size={18} /> Hours and location
            </Link>
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
