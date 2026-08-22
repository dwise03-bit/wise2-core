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
        {/* Hero Section */}
        <section className="bg-cc-white py-16 md:py-32 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-lora font-bold text-cc-dark mb-4 leading-tight">
              Crafted for the Moment.<br />Created for the Memory.
            </h1>
            <p className="text-lg md:text-xl text-cc-dark mb-8 max-w-2xl mx-auto">
              Custom products for every occasion, every person, every purpose.
            </p>
            <Link href="/shop">
              <Button variant="primary" className="text-lg">
                ORDER YOURS TODAY
              </Button>
            </Link>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-16 md:py-24 px-4" style={{ backgroundColor: '#F3E8FF' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'High-Quality Printing', desc: 'Vibrant colors, sharp details' },
                { title: 'Fast Turnaround', desc: 'Quick delivery, no waiting' },
                { title: 'Made with Love', desc: 'Personal touch, handcrafted care' },
              ].map((vp, i) => (
                <div key={i} className="bg-white border border-cc-lavender rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-lora font-bold mb-2" style={{ color: '#6D2DBD' }}>
                    {vp.title}
                  </h3>
                  <p style={{ color: '#29233D' }}>{vp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 md:py-24 px-4 bg-cc-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-lora font-bold text-cc-dark mb-12 text-center">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <div key={i} className="card">
                  <div className="text-6xl text-center mb-4">{product.image}</div>
                  <h3 className="text-lg font-lora font-bold text-cc-dark mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-cc-lavender mb-4">{product.category}</p>
                  <p className="text-cc-gold font-bold text-lg mb-4">{product.price}</p>
                  <Button variant="primary" className="w-full text-sm">
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/shop">
                <Button variant="secondary">View All Products</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* By Occasion */}
        <section className="py-16 md:py-24 px-4 bg-cc-lilac">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-lora font-bold text-cc-dark mb-12 text-center">
              Browse by Occasion
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {occasions.map((occ, i) => (
                <Link key={i} href={`/shop?occasion=${occ.name.toLowerCase()}`}>
                  <div className="bg-white border border-cc-lavender rounded-lg p-6 text-center hover:bg-cc-white hover:shadow-lg transition-all cursor-pointer">
                    <div className="text-5xl mb-2">{occ.icon}</div>
                    <p className="font-poppins font-semibold text-cc-dark text-sm">
                      {occ.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Order Process */}
        <section className="py-16 md:py-24 px-4 bg-cc-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-lora font-bold text-cc-dark mb-12 text-center">
              Our Simple Order Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { step: '1', title: 'YOU DREAM IT', desc: 'Tell us your idea & details' },
                { step: '2', title: 'WE DESIGN IT', desc: 'We create your proof' },
                { step: '3', title: 'YOU APPROVE IT', desc: 'Review & approve' },
                { step: '4', title: 'WE CREATE IT', desc: 'Bring the vision to life' },
                { step: '5', title: 'YOU ENJOY IT', desc: 'Made with love, just for you' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div style={{ backgroundColor: '#6D2DBD' }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">{item.step}</span>
                  </div>
                  <h3 className="font-poppins font-bold text-cc-dark mb-2">{item.title}</h3>
                  <p className="text-sm text-cc-dark">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Specialize In */}
        <section className="py-16 md:py-24 px-4 bg-cc-lilac">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-lora font-bold text-cc-dark mb-12 text-center">
              What We Specialize In
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
              {[
                { icon: '🎨', label: 'Custom Designs' },
                { icon: '✨', label: 'High Quality Printing' },
                { icon: '⚡', label: 'Fast Turnaround' },
                { icon: '📍', label: 'Local Pickup' },
                { icon: '🚚', label: 'Delivery Options' },
                { icon: '📦', label: 'Bulk Orders' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl mb-3">{item.icon}</div>
                  <p className="font-poppins font-semibold text-cc-dark text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About CC */}
        <section className="py-16 md:py-24 px-4 bg-cc-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-6xl text-center">👩‍⚕️</div>
              <div>
                <h2 className="text-3xl font-lora font-bold text-cc-dark mb-2">
                  Meet CC
                </h2>
                <h3 className="text-2xl font-lora font-bold mb-4" style={{ color: '#6D2DBD' }}>
                  Nurse. Entrepreneur. Creator. Purpose Driven.
                </h3>
                <p className="text-lg text-cc-dark mb-6">
                  CC is a nurse, entrepreneur and creative at heart. She specializes in custom products for every occasion, business and community event. Every detail is designed with love, care and purpose, because every moment deserves to be special.
                </p>
                <p className="text-sm italic mb-6" style={{ color: '#6D2DBD' }}>
                  "I believe every detail matters. I love creating personalized products that help people celebrate life's most important moments."
                </p>
                <Link href="/about">
                  <Button variant="secondary">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 md:py-24 px-4 bg-cc-lilac">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-lora font-bold text-cc-dark mb-12 text-center">
              Loved by Our Customers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: '"CC made my party perfect!"', author: 'Sarah M.' },
                { quote: '"Fast, professional, and beautiful!"', author: 'James K.' },
                { quote: '"The attention to detail is amazing!"', author: 'Emma R.' },
              ].map((review, i) => (
                <div key={i} className="card">
                  <p className="text-lg italic text-cc-dark mb-4">{review.quote}</p>
                  <p className="font-poppins font-bold text-cc-purple">{review.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 px-4 bg-cc-dark text-white text-center">
          <h2 className="text-4xl font-lora font-bold mb-4">
            Your Dream. Our Creation.
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Ready to bring your vision to life? Let's create something special together.
          </p>
          <Link href="/order">
            <Button variant="primary" className="text-lg">
              START YOUR ORDER
            </Button>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
