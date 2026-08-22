'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function Home() {
  const occasions = [
    { name: 'Birthdays', icon: '🎂' },
    { name: 'Baby Showers', icon: '👶' },
    { name: 'Graduations', icon: '🎓' },
    { name: 'Memorials', icon: '🕯️' },
    { name: 'Holidays', icon: '🎄' },
    { name: 'Events', icon: '🎉' },
  ];

  const products = [
    {
      name: 'Personalized Drink Labels',
      price: '$24.99',
      image: '🥤',
      category: 'Labels',
    },
    {
      name: 'Chip Bags & Candy Wrappers',
      price: '$19.99',
      image: '🍿',
      category: 'Wrappers',
    },
    {
      name: 'Water Bottle Labels',
      price: '$16.99',
      image: '💧',
      category: 'Labels',
    },
    {
      name: 'Custom Party Package',
      price: '$89.99',
      image: '🎁',
      category: 'Packages',
    },
  ];

  return (
    <>
      <Header />
      <main className="flex flex-col flex-1">
        {/* HERO - Premium */}
        <section style={{ background: 'linear-gradient(to bottom, #F3E8FF, #FFFFFF)' }} className="py-20 md:py-40 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p style={{ color: '#6D2DBD' }} className="font-semibold tracking-widest uppercase text-sm mb-6">
              Personalized Perfection
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-cc-dark mb-6 leading-tight" style={{ fontFamily: 'Lora' }}>
              Crafted for the Moment.<br />
              <span style={{ color: '#6D2DBD' }}>Created for the Memory.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Every detail matters. Transform your special moments into lasting memories with custom products designed with love and precision.
            </p>
            <Link href="/shop">
              <Button variant="primary" className="text-lg px-8 py-3">
                EXPLORE PRODUCTS
              </Button>
            </Link>
          </div>
        </section>

        {/* VALUE PROPS */}
        <section className="py-20 md:py-28 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-cc-dark mb-16" style={{ fontFamily: 'Lora' }}>
              Why Choose CC Craft & Create
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {[
                { title: 'Premium Quality', desc: 'Vibrant colors, sharp details, professional printing', icon: '✨' },
                { title: 'Fast Turnaround', desc: 'Quick delivery without compromising quality', icon: '⚡' },
                { title: 'Made with Love', desc: 'Personal touch and handcrafted care in every product', icon: '💜' },
              ].map((vp, i) => (
                <div key={i} style={{
                  padding: '2rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '1rem',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6D2DBD';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{vp.icon}</div>
                  <h3 style={{ color: '#6D2DBD', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'Lora' }}>
                    {vp.title}
                  </h3>
                  <p style={{ color: '#666' }}>{vp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section style={{ background: 'linear-gradient(to bottom, #f9fafb, #ffffff)' }} className="py-20 md:py-28 px-4">
          <div className="max-w-6xl mx-auto">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ color: '#6D2DBD' }} className="font-semibold tracking-widest uppercase text-sm mb-4">
                Customer Favorites
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-cc-dark" style={{ fontFamily: 'Lora' }}>
                Featured Collections
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {products.map((product, i) => (
                <div key={i} style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#B785D3';
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{product.image}</div>
                  <h3 style={{ fontFamily: 'Lora', fontWeight: 'bold', fontSize: '1.1rem', color: '#29233D', marginBottom: '0.5rem', flexGrow: 1 }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#6D2DBD', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    {product.category}
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#D4AF37', marginBottom: '1rem' }}>
                    {product.price}
                  </p>
                  <Button variant="primary" className="w-full text-sm">
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/shop">
                <Button variant="secondary">View All Products</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* BY OCCASION */}
        <section className="py-20 md:py-28 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ color: '#6D2DBD' }} className="font-semibold tracking-widest uppercase text-sm mb-4">
                Every Moment Matters
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-cc-dark" style={{ fontFamily: 'Lora' }}>
                Shop by Occasion
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem'
            }}>
              {occasions.map((occ, i) => (
                <Link key={i} href={`/shop?occasion=${occ.name.toLowerCase()}`}>
                  <div style={{
                    background: 'linear-gradient(to bottom right, #F3E8FF, #ffffff)',
                    border: '1px solid #B785D3',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6D2DBD';
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#B785D3';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{occ.icon}</div>
                    <p style={{ fontFamily: 'Lora', fontWeight: 'bold', color: '#29233D', fontSize: '0.9rem' }}>
                      {occ.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ORDER PROCESS */}
        <section style={{ background: 'linear-gradient(to bottom right, #F3E8FF, #ffffff)' }} className="py-20 md:py-28 px-4">
          <div className="max-w-6xl mx-auto">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ color: '#6D2DBD' }} className="font-semibold tracking-widest uppercase text-sm mb-4">
                Simple & Seamless
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-cc-dark" style={{ fontFamily: 'Lora' }}>
                How We Bring Your Vision to Life
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1.5rem'
            }}>
              {[
                { step: '1', title: 'YOU DREAM IT', desc: 'Share your vision with us' },
                { step: '2', title: 'WE DESIGN IT', desc: 'Create your custom proof' },
                { step: '3', title: 'YOU APPROVE IT', desc: 'Review & perfect it' },
                { step: '4', title: 'WE CREATE IT', desc: 'Bring it to life' },
                { step: '5', title: 'YOU ENJOY IT', desc: 'Made with love, just for you' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    backgroundColor: '#6D2DBD',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(109, 45, 189, 0.2)'
                  }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontFamily: 'Lora', fontWeight: 'bold', color: '#29233D', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SPECIALTIES */}
        <section className="py-20 md:py-28 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ color: '#6D2DBD' }} className="font-semibold tracking-widest uppercase text-sm mb-4">
                Our Expertise
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-cc-dark" style={{ fontFamily: 'Lora' }}>
                What We Do Best
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1.5rem'
            }}>
              {[
                { icon: '🎨', label: 'Custom Designs' },
                { icon: '✨', label: 'Quality Printing' },
                { icon: '⚡', label: 'Fast Turnaround' },
                { icon: '📍', label: 'Local Pickup' },
                { icon: '🚚', label: 'Easy Delivery' },
                { icon: '📦', label: 'Bulk Orders' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(to bottom right, #F3E8FF, #ffffff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6D2DBD';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                  <p style={{ fontFamily: 'Lora', fontWeight: 'bold', color: '#29233D', fontSize: '0.9rem' }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MEET CC */}
        <section style={{ background: 'linear-gradient(to bottom right, #ffffff, #F3E8FF)' }} className="py-20 md:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '5rem' }}>👩‍⚕️</div>
              </div>
              <div>
                <p style={{ color: '#6D2DBD', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                  Meet the Founder
                </p>
                <h2 style={{ fontFamily: 'Lora', fontSize: '2.5rem', fontWeight: 'bold', color: '#29233D', marginBottom: '1rem' }}>
                  CC
                </h2>
                <h3 style={{ color: '#6D2DBD', fontSize: '1.25rem', fontFamily: 'Lora', fontWeight: '600', marginBottom: '1.5rem' }}>
                  Nurse. Entrepreneur. Creator. Purpose Driven.
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                  CC is a nurse, entrepreneur and creative at heart who specializes in custom products for every occasion, business and community event.
                </p>
                <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                  Every detail is designed with love, care and purpose—because every moment deserves to be special and memorable.
                </p>
                <div style={{
                  borderLeft: '4px solid #6D2DBD',
                  paddingLeft: '1.5rem',
                  marginBottom: '1.5rem',
                  fontStyle: 'italic',
                  color: '#29233D'
                }}>
                  "I believe every detail matters. I love creating personalized products that help people celebrate life's most important moments."
                </div>
                <Link href="/about">
                  <Button variant="secondary">Learn More About CC</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-white to-cc-lilac">
          <div className="max-w-6xl mx-auto">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ color: '#6D2DBD' }} className="font-semibold tracking-widest uppercase text-sm mb-4">
                Customer Love
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-cc-dark" style={{ fontFamily: 'Lora' }}>
                Loved by Our Customers
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              {[
                { quote: 'CC made my party absolutely perfect! The attention to detail was incredible.', author: 'Sarah M.' },
                { quote: 'Fast, professional, and beautiful! Exactly what I needed on short notice.', author: 'James K.' },
                { quote: 'The attention to detail is amazing. Every product feels handcrafted with love.', author: 'Emma R.' },
              ].map((review, i) => (
                <div key={i} style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '1rem',
                  padding: '2rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    {'⭐'.repeat(5)}
                  </div>
                  <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#555', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                    "{review.quote}"
                  </p>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <p style={{ fontFamily: 'Lora', fontWeight: 'bold', color: '#29233D' }}>{review.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: 'linear-gradient(to bottom right, #6D2DBD, #29233D)' }} className="py-20 md:py-28 px-4 text-white text-center relative overflow-hidden">
          <div style={{ position: 'absolute', top: 0, left: 0, width: '300px', height: '300px', backgroundColor: '#D4AF37', opacity: 0.05, borderRadius: '50%', zIndex: 0 }}></div>
          <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <h2 style={{ fontSize: '3.5rem', fontFamily: 'Lora', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: '1.2' }}>
              Your Dream.<br />Our Creation.
            </h2>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.95, lineHeight: '1.8' }}>
              Ready to bring your vision to life? Let's create something special together that you and your loved ones will treasure forever.
            </p>
            <Link href="/shop">
              <Button variant="primary" className="text-lg px-8 py-3">
                EXPLORE & CREATE
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
