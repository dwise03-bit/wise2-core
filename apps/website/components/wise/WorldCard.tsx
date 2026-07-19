interface WorldCardProps {
  title: string;
  description: string;
  image?: string;
  icon?: string;
}

export const WorldCard: React.FC<WorldCardProps> = ({
  title,
  description,
  image,
  icon = '🌍',
}) => {
  return (
    <div className="group relative h-80 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-wise-accent-green/10 via-wise-bg-secondary to-wise-bg-primary flex items-center justify-center">
        <div className="text-6xl opacity-10 group-hover:opacity-20 transition-opacity duration-300">{icon}</div>
      </div>

      {/* Glassmorphism Border */}
      <div className="absolute inset-0 rounded-3xl border border-wise-accent-green-border backdrop-blur-xl bg-white/5 group-hover:bg-white/10 transition-all duration-300" />

      {/* Hover Glow */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-wise-accent-green/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-wise-bg-primary via-wise-bg-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content - overlaid on bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <h3 className="text-2xl font-bold font-display text-wise-accent-green mb-2 transform group-hover:translate-y-0 -translate-y-1 group-hover:scale-105 transition-all duration-300">
          {title}
        </h3>
        <p className="text-wise-text-muted line-clamp-2 group-hover:text-wise-text-primary transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  );
};
