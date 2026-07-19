import {
  Navigation,
  Footer,
  Hero,
  ServiceCard,
  WorldCard,
  Container,
  SectionHeading,
  Button,
  ProjectGallery,
} from '@/components/wise';
import { services, worlds } from '@/data/wise2-content';

export default function Home() {
  return (
    <>
      <Navigation />

      <main className="bg-wise-bg-primary">
        {/* Hero Section */}
        <Hero />

        {/* Projects Gallery */}
        <ProjectGallery />

        {/* Featured Worlds Section */}
        <section className="py-20 bg-wise-bg-secondary">
          <Container>
            <SectionHeading
              title="OUR WORLDS"
              subtitle="Each represents a unique dimension of creative excellence and strategic impact"
              align="center"
              className="mb-16"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {worlds.slice(0, 4).map((world) => (
                <WorldCard
                  key={world.slug}
                  title={world.name}
                  description={world.description}
                  icon="🌍"
                />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button href="/worlds" variant="secondary" size="lg">
                Explore All Worlds
              </Button>
            </div>
          </Container>
        </section>

        {/* Services Snippet */}
        <section className="py-20 bg-wise-bg-primary">
          <Container>
            <SectionHeading
              title="WHAT WE DO"
              subtitle="From strategy to execution, we handle every dimension of your vision"
              align="center"
              className="mb-16"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.slice(0, 4).map((service, idx) => (
                <ServiceCard
                  key={idx}
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button href="/services" variant="secondary" size="lg">
                View All Services
              </Button>
            </div>
          </Container>
        </section>

        {/* Process Preview */}
        <section className="py-20 bg-wise-bg-secondary">
          <Container>
            <SectionHeading
              title="OUR PROCESS"
              subtitle="Strategic, intentional, results-driven"
              align="center"
              className="mb-16"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-8 rounded-lg border border-wise-accent-green-border bg-wise-bg-card">
                <div className="text-4xl font-bold text-wise-accent-green font-display mb-3">01</div>
                <h3 className="text-xl font-bold font-display text-wise-text-primary mb-2">
                  Discover
                </h3>
                <p className="text-wise-text-muted">
                  We listen, research, and understand your vision deeply.
                </p>
              </div>
              <div className="p-8 rounded-lg border border-wise-accent-green-border bg-wise-bg-card">
                <div className="text-4xl font-bold text-wise-accent-green font-display mb-3">02</div>
                <h3 className="text-xl font-bold font-display text-wise-text-primary mb-2">
                  Strategize
                </h3>
                <p className="text-wise-text-muted">
                  We build the blueprint before creating anything.
                </p>
              </div>
              <div className="p-8 rounded-lg border border-wise-accent-green-border bg-wise-bg-card">
                <div className="text-4xl font-bold text-wise-accent-green font-display mb-3">03</div>
                <h3 className="text-xl font-bold font-display text-wise-text-primary mb-2">
                  Execute
                </h3>
                <p className="text-wise-text-muted">
                  We launch with confidence and momentum.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-wise-bg-primary">
          <Container>
            <div className="rounded-lg border border-wise-accent-green-border bg-gradient-to-br from-wise-bg-secondary to-wise-bg-primary p-12 text-center">
              <h2 className="text-5xl font-bold font-display text-wise-text-primary mb-4">
                Ready to Build Your Legacy?
              </h2>
              <p className="text-lg text-wise-text-muted mb-8 max-w-2xl mx-auto">
                Let's transform your vision into reality. Start your project brief and join the WISE² ecosystem.
              </p>
              <Button href="/intake" variant="primary" size="lg">
                Start Your Project
              </Button>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}
