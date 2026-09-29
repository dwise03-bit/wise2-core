import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { PageHero } from '@/components/PageHero';
import { SectionHeading } from '@/components/SectionHeading';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          title="About CC"
          subtitle="Nurse. Entrepreneur. Creator. Purpose Driven."
        />

        <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-14">
            <div className="rounded-3xl border-4 border-cc-gold bg-gradient-to-br from-cc-purple via-cc-lavender to-cc-lilac aspect-[4/5] max-w-sm mx-auto w-full flex flex-col items-center justify-center text-white p-8 shadow-xl">
              <span className="text-7xl font-lora font-bold mb-3">CC</span>
              <p className="font-script text-3xl text-cc-gold text-center">Craft & Create</p>
            </div>
            <div>
              <h2 className="text-3xl font-lora font-bold text-cc-dark mb-4">
                Nurse. Entrepreneur. Creator.
              </h2>
              <p className="text-cc-dark/90 mb-4 leading-relaxed">
                CC is a nurse, entrepreneur, and creative at heart. She specializes in custom products
                for every occasion, business, and community event.
              </p>
              <p className="text-cc-dark/90 mb-4 leading-relaxed">
                Every detail is designed with love, care, and purpose — because every moment deserves
                to be special. From intimate gatherings to grand celebrations, CC brings your vision to
                life with quality, creativity, and reliability.
              </p>
              <p className="font-script text-2xl text-cc-gold">
                You Dream It. I&apos;ll Create It!
              </p>
            </div>
          </div>

          <div className="bg-cc-lilac rounded-2xl p-8 mb-12">
            <SectionHeading title="Our Values" align="left" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-cc-purple mb-2">Quality</h4>
                <p className="text-cc-dark/80 text-sm">High-quality printing with vibrant colors and sharp details.</p>
              </div>
              <div>
                <h4 className="font-bold text-cc-purple mb-2">Creativity</h4>
                <p className="text-cc-dark/80 text-sm">Custom designs tailored to your vision and occasion.</p>
              </div>
              <div>
                <h4 className="font-bold text-cc-purple mb-2">Community</h4>
                <p className="text-cc-dark/80 text-sm">Local, community-minded, and built on trust.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-lora font-bold text-cc-dark mb-4">Ready to Create Something Special?</h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop"><Button>Start Shopping</Button></Link>
              <Link href="/contact"><Button variant="outline">Contact CC</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
