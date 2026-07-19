interface ServiceCardProps {
  title: string;
  description: string;
  icon?: string;
  features?: string[];
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon = '⚙️',
  features = [],
}) => {
  return (
    <div className="group relative p-8 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105">
      {/* Outer Glow Container */}
      <div className="absolute inset-0 rounded-2xl bg-wise-accent-green/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-wise-accent-green/8 via-wise-bg-secondary/70 to-wise-bg-primary" />

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
      <div className="relative z-10">
        <div className="text-5xl mb-4 transform group-hover:scale-120 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold font-display text-wise-text-primary mb-3 group-hover:text-wise-accent-green transition-colors duration-300">
          {title}
        </h3>
        <p className="text-wise-text-secondary mb-4 group-hover:text-wise-text-primary transition-colors duration-300">
          {description}
        </p>
        {features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-wise-text-muted group-hover:text-wise-text-secondary transition-colors duration-300">
                <span className="text-wise-accent-green font-bold">✦</span>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
