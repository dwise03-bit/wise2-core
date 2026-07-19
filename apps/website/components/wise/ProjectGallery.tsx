import { projects } from '@/data/projects';
import { Container, SectionHeading } from '@/components/wise';

interface ProjectCardProps {
  project: typeof projects[0];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="group relative h-72 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-wise-accent-green/5 via-wise-bg-secondary to-wise-bg-primary" />

      {/* Glassmorphism Border */}
      <div className="absolute inset-0 rounded-2xl border border-wise-accent-green-border backdrop-blur-xl bg-white/5 group-hover:bg-white/10 transition-all duration-300" />

      {/* Hover Glow */}
      <div className="absolute -top-1 -right-1 w-40 h-40 bg-wise-accent-green/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        {/* Icon & Category */}
        <div>
          <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {project.image}
          </div>
          <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-wise-accent-green/30 text-wise-accent-green mb-3">
            {project.category}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-bold font-display text-wise-text-primary mb-2 group-hover:text-wise-accent-green transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-wise-text-muted line-clamp-2 group-hover:text-wise-text-primary transition-colors">
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
