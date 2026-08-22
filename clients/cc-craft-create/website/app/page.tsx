'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col flex-1">
        {/* HERO SECTION - Watercolor Background with CC Photo */}
        <section style={{
          background: `
            linear-gradient(135deg, rgba(243, 232, 255, 0.8) 0%, rgba(179, 133, 211, 0.4) 50%, rgba(255, 255, 255, 1) 100%),
            radial-gradient(circle at 20% 30%, rgba(109, 45, 189, 0.1) 0%, transparent 50%)
          `,
          backgroundAttachment: 'fixed',
          minHeight: '600px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          gap: '3rem',
          padding: '4rem 2rem'
        }} className="relative overflow-hidden">
          {/* Watercolor decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-100px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            zIndex: 0
          }}></div>

          {/* Left: CC Photo */}
          <div style={{ zIndex: 10, textAlign: 'center' }}>
            <div style={{
              width: '320px',
              height: '400px',
              background: 'linear-gradient(135deg, #6D2DBD, #B785D3)',
              borderRadius: '20px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '120px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 20px 60px rgba(109, 45, 189, 0.3)'
            }}>
              👩‍⚕️
            </div>
            <p style={{
              marginTop: '1.5rem',
              fontSize: '1.1rem',
              color: '#6D2DBD',
              fontStyle: 'italic',
              fontWeight: '500'
            }}>CC - Founder & Creator</p>
          </div>

          {/* Right: Tagline & CTA */}
          <div style={{ zIndex: 10, paddingRight: '2rem' }}>
            <p style={{
              fontSize: '0.9rem',
              color: '#6D2DBD',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1rem'
            }}>Welcome to</p>

            <h1 style={{
              fontSize: '3.5rem',
              fontFamily: 'Lora, serif',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '1rem',
              color: '#29233D'
            }}>
              Crafted for the Moment.<br />
              <span style={{ color: '#6D2DBD' }}>Created for the Memory.</span>
            </h1>

            <p style={{
              fontSize: '1.2rem',
              color: '#555',
              marginBottom: '2rem',
              lineHeight: '1.6',
              maxWidth: '500px'
            }}>
              Custom products for every occasion, business and community event. Every detail is designed with love, care and purpose.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/shop">
                <Button variant="primary">SHOP NOW</Button>
              </Link>
              <Link href="/about">
                <Button variant="secondary">Learn More</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* OCCASIONS GRID - Main Product Showcase */}
        <section style={{
          background: '#f8f6f9',
          padding: '4rem 2rem'
        }}>
          <div className="max-w-7xl mx-auto">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{
                color: '#6D2DBD',
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1rem'
              }}>We Create For Every Occasion & Purpose</p>
              <h2 style={{
                fontSize: '2.8rem',
                fontFamily: 'Lora, serif',
                fontWeight: '700',
                color: '#29233D',
                marginBottom: '0.5rem'
              }}>Custom Products For Every Celebration</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {[
                { title: 'BIRTHDAYS', icon: '🎂', color: '#6D2DBD' },
                { title: 'BABY SHOWERS', icon: '👶', color: '#6D8DBD' },
                { title: 'GRADUATIONS', icon: '🎓', color: '#D4AF37' },
                { title: 'MEMORIALS', icon: '🕯️', color: '#9D7DBD' },
                { title: 'HOLIDAYS', icon: '🎄', color: '#B8342A' },
                { title: 'CHURCH EVENTS', icon: '⛪', color: '#5A4A8A' },
                { title: 'BUSINESS BRANDING', icon: '💼', color: '#29233D' },
                { title: 'NURSE APPRECIATION', icon: '💉', color: '#E8B4B8' },
                { title: 'CUSTOM ORDERS', icon: '✨', color: '#6D2DBD' },
              ].map((occasion, i) => (
                <Link key={i} href={`/shop?occasion=${occasion.title.toLowerCase().replace(/ /g, '-')}`}>
                  <div style={{
                    background: `linear-gradient(135deg, ${occasion.color}20, ${occasion.color}10)`,
                    border: `2px solid ${occasion.color}40`,
                    borderRadius: '15px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = `0 15px 40px ${occasion.color}30`;
                    e.currentTarget.style.borderColor = occasion.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = `${occasion.color}40`;
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{occasion.icon}</div>
                    <h3 style={{
                      color: occasion.color,
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      fontFamily: 'Lora, serif',
                      letterSpacing: '0.05em'
                    }}>{occasion.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* OUR COLLECTIONS */}
        <section style={{ padding: '4rem 2rem', background: 'white' }}>
          <div className="max-w-7xl mx-auto">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2.8rem',
                fontFamily: 'Lora, serif',
                fontWeight: '700',
                color: '#29233D',
                marginBottom: '1rem'
              }}>Our Collections</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem'
            }}>
              {[
                { title: 'Party Packs', desc: 'Flowers, chip bags, water bottles' },
                { title: 'Keepsakes', desc: 'Personalized lasting treasures' },
                { title: 'Gift Items', desc: 'Curated gift boxes & sets' },
                { title: 'Business & Community', desc: 'Branding, events & nonprofits' },
              ].map((collection, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(135deg, #F3E8FF, #ffffff)',
                  border: '1px solid #B785D3',
                  borderRadius: '15px',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(109, 45, 189, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontFamily: 'Lora, serif',
                    fontWeight: '700',
                    color: '#6D2DBD',
                    marginBottom: '0.5rem'
                  }}>{collection.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.95rem' }}>{collection.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE CC */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(243, 232, 255, 0.6), rgba(255, 255, 255, 1))',
          padding: '4rem 2rem'
        }}>
          <div className="max-w-6xl mx-auto">
            <h2 style={{
              fontSize: '2.8rem',
              fontFamily: 'Lora, serif',
              fontWeight: '700',
              color: '#29233D',
              marginBottom: '3rem',
              textAlign: 'center'
            }}>Why Choose CC?</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem'
            }}>
              {[
                { icon: '✓', title: 'Personalized Just For You', desc: 'Custom designs tailored to your vision' },
                { icon: '✓', title: 'High Quality & Attention to Detail', desc: 'Professional printing & craftsmanship' },
                { icon: '✓', title: 'Made With Love', desc: 'Every product created with purpose' },
                { icon: '✓', title: 'Perfect For Any Occasion', desc: 'Birthdays, events, business & more' },
                { icon: '✓', title: 'Support Local & Community Driven', desc: 'Locally owned, community focused' },
              ].map((reason, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#6D2DBD',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    margin: '0 auto 1rem'
                  }}>
                    {reason.icon}
                  </div>
                  <h3 style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: '700',
                    color: '#29233D',
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem'
                  }}>
                    {reason.title}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>{reason.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ORDER PROCESS */}
        <section style={{ padding: '4rem 2rem', background: '#29233D', color: 'white' }}>
          <div className="max-w-6xl mx-auto">
            <h2 style={{
              fontSize: '2.8rem',
              fontFamily: 'Lora, serif',
              fontWeight: '700',
              marginBottom: '3rem',
              textAlign: 'center'
            }}>Our Simple Order Process</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '2rem'
            }}>
              {[
                { num: '1', title: 'YOU INQUIRE', desc: 'Tell us your vision' },
                { num: '2', title: 'WE DESIGN', desc: 'Create your proof' },
                { num: '3', title: 'YOU APPROVE', desc: 'Review & perfect' },
                { num: '4', title: 'WE CREATE', desc: 'Bring to life' },
                { num: '5', title: 'YOU RECEIVE', desc: 'Local pickup or delivery' },
                { num: '6', title: 'YOU LOVE IT', desc: 'Make your moment special' },
              ].map((step, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#D4AF37',
                    color: '#29233D',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    margin: '0 auto 1rem'
                  }}>
                    {step.num}
                  </div>
                  <h3 style={{
                    fontFamily: 'Lora, serif',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    fontSize: '1rem'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '0.9rem' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FOOTER */}
        <section style={{
          background: 'linear-gradient(135deg, #6D2DBD, #29233D)',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontFamily: 'Lora, serif',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>Ready to Create Something Special?</h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Let's bring your vision to life. Order today and create memories that last forever.
          </p>
          <Link href="/shop">
            <Button variant="primary">ORDER TODAY</Button>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
