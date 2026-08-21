import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-cc-lilac py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-lora font-bold text-cc-dark mb-4">About CC Craft & Create</h1>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
            <div className="text-6xl text-center">👩‍⚕️</div>
            <div>
              <h2 className="text-3xl font-lora font-bold text-cc-dark mb-4">
                Nurse. Entrepreneur. Creator.
              </h2>
              <p className="text-lg text-cc-dark mb-4">
                CC is a nurse by day, and a creative visionary by heart. With over a decade of experience bringing ideas to life through custom design and printing, CC has mastered the art of creating memorable moments.
              </p>
              <p className="text-lg text-cc-dark mb-4">
                Every product is crafted with meticulous attention to detail, because CC believes that every moment deserves to be special. From intimate gatherings to grand celebrations, CC's work transforms ordinary events into unforgettable memories.
              </p>
              <p className="text-lg text-cc-dark">
                Whether it's personalized party labels, custom memorial keepsakes, or complete event packages, CC brings your vision to life with quality, care, and creativity.
              </p>
            </div>
          </div>

          <div className="bg-cc-lilac rounded-lg p-8 mb-12">
            <h3 className="text-2xl font-lora font-bold text-cc-dark mb-6">Our Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-cc-purple mb-2">Quality</h4>
                <p className="text-cc-dark">Every detail is designed with precision and care to ensure the highest quality.</p>
              </div>
              <div>
                <h4 className="font-bold text-cc-purple mb-2">Creativity</h4>
                <p className="text-cc-dark">Innovation and artistic vision guide every project, making each creation unique.</p>
              </div>
              <div>
                <h4 className="font-bold text-cc-purple mb-2">Connection</h4>
                <p className="text-cc-dark">We create products that bring people together and create lasting memories.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-lora font-bold text-cc-dark mb-6">Ready to Create Something Special?</h3>
            <Link href="/shop">
              <Button variant="primary" className="text-lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
