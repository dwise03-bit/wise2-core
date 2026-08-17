import { projects } from '@/data/projects';
import { Container, SectionHeading } from '@/components/wise';

interface ProjectCardProps {
  project: typeof projects[0];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="group relative h-72 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105">
      {/* Outer Glow Container */}
      <div className="absolute inset-0 rounded-2xl bg-wise-accent-green/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-wise-accent-green/10 via-wise-bg-secondary/70 to-wise-bg-primary" />

      {/* Glass Layer */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/8 group-hover:bg-white/12 transition-all duration-500" />

      {/* Premium Border with Glow */}
      <div className="absolute inset-0 rounded-2xl border border-wise-accent-green/40 group-hover:border-wise-accent-green/60 transition-colors duration-500" />

      {/* Inner Light Reflection */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/8 to-transparent rounded-2xl pointer-events-none" />

      {/* Premium Shadow Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-wise-accent-green/0 via-wise-accent-green/5 to-wise-accent-green/0 rounded-2xl blur-2xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />

      {/* Hover Glow Effect (Enhanced) */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-wise-accent-green/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        {/* Icon & Category */}
        <div>
          <div className="text-5xl mb-4 transform group-hover:scale-120 transition-transform duration-300">
            {project.image}
          </div>
          <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-wise-accent-green/40 text-wise-accent-green border border-wise-accent-green/50 backdrop-blur-sm mb-3 group-hover:bg-wise-accent-green/60 transition-all">
            {project.category}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-bold font-display text-wise-text-primary mb-2 group-hover:text-wise-accent-green transition-colors duration-300">
            {project.title}
          </h3>
          <p className="text-sm text-wise-text-muted line-clamp-2 group-hover:text-wise-text-secondary transition-colors duration-300">
            {project.description}
          </p>
        </div>

        {/* Learn More Arrow */}
        <div className="flex items-center gap-2 text-wise-accent-green text-sm font-bold opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all duration-300">
          Explore <span>→</span>
        </div>
      </div>
    </div>
  );
};

export const ProjectGallery: React.FC = () => {
  return (
    <section className="py-20 bg-wise-bg-primary">
      <Container>
        {/* Section Header */}
        <SectionHeading
          title="OUR WORKS"
          subtitle="Transforming visions into reality through strategy, design, and technology"
          align="center"
          className="mb-16"
        />

        {/* Projects Grid - All Projects Featured */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Container>
    </section>
  );
};
