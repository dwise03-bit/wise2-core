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
    <div className="group relative h-80 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105">
      {/* Outer Glow Container */}
      <div className="absolute inset-0 rounded-3xl bg-wise-accent-green/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-wise-accent-green/12 via-wise-bg-secondary/70 to-wise-bg-primary flex items-center justify-center">
        <div className="text-6xl opacity-15 group-hover:opacity-30 transition-opacity duration-300">{icon}</div>
      </div>

      {/* Glass Layer */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/8 group-hover:bg-white/12 transition-all duration-500" />

      {/* Premium Border with Glow */}
      <div className="absolute inset-0 rounded-3xl border border-wise-accent-green/40 group-hover:border-wise-accent-green/60 transition-colors duration-500" />

      {/* Inner Light Reflection */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/8 to-transparent rounded-3xl pointer-events-none" />

      {/* Premium Shadow Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-wise-accent-green/0 via-wise-accent-green/5 to-wise-accent-green/0 rounded-3xl blur-2xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />

      {/* Hover Glow Effect (Enhanced) */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-wise-accent-green/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Content Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-wise-bg-primary via-wise-bg-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content - overlaid on bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <h3 className="text-2xl font-bold font-display text-wise-accent-green mb-2 transform group-hover:translate-y-0 -translate-y-1 group-hover:scale-110 transition-all duration-300">
          {title}
        </h3>
        <p className="text-wise-text-muted line-clamp-2 group-hover:text-wise-text-secondary transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  );
};
