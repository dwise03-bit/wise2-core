import {
  Navigation,
  Footer,
  Container,
  SectionHeading,
  IntakeForm,
} from '@/components/wise';
import { branding } from '@/data/wise2-content';

export default function IntakePage() {
  return (
    <>
      <Navigation />

      <main className="bg-wise-bg-primary">
        {/* Page Header */}
        <section className="pt-32 pb-16 bg-wise-bg-primary">
          <Container>
            <SectionHeading
              title="START YOUR PROJECT"
              subtitle="Tell us about your vision, and let's build something extraordinary together."
              align="center"
              className="mb-0"
            />
          </Container>
        </section>

        {/* Form Section */}
        <section className="py-20 bg-wise-bg-secondary">
          <Container size="md">
            <div className="max-w-2xl mx-auto">
              <IntakeForm />
            </div>
          </Container>
        </section>

        {/* Social Proof / Trust Section */}
        <section className="py-20 bg-wise-bg-primary">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-wise-accent-green font-display mb-2">8+</div>
                <p className="text-wise-text-muted">Creative Worlds</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-wise-accent-green font-display mb-2">50+</div>
                <p className="text-wise-text-muted">Successful Projects</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-wise-accent-green font-display mb-2">100%</div>
                <p className="text-wise-text-muted">Vision-Driven</p>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}
