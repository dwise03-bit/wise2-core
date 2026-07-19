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
    <div className="group relative p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-wise-accent-green/5 via-wise-bg-secondary to-wise-bg-primary" />

      {/* Glassmorphism Border & Backdrop */}
      <div className="absolute inset-0 rounded-2xl border border-wise-accent-green-border backdrop-blur-xl bg-white/5 group-hover:bg-white/10 group-hover:border-wise-accent-green transition-all duration-300" />

      {/* Hover Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-wise-accent-green/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10">
        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold font-display text-wise-text-primary mb-3 group-hover:text-wise-accent-green transition-colors duration-300">
          {title}
        </h3>
        <p className="text-wise-text-muted mb-4 group-hover:text-wise-text-primary transition-colors duration-300">
          {description}
        </p>
        {features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-wise-text-muted">
                <span className="text-wise-accent-green font-bold">→</span>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
