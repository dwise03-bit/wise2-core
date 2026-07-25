'use client';

import styles from './Features.module.css';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '🤖',
    title: 'AI AUTOMATION',
    description: 'Automate repetitive tasks with intelligent workflows and intelligent agents',
  },
  {
    icon: '📊',
    title: 'BUSINESS INTELLIGENCE',
    description: 'Real-time analytics, dashboards, and predictive insights for data-driven decisions',
  },
  {
    icon: '⚙️',
    title: 'SYSTEMS & WORKFLOWS',
    description: 'Seamless integration of all business systems with custom workflow automation',
  },
  {
    icon: '💼',
    title: 'CRM & PIPELINES',
    description: 'Manage relationships, track deals, and optimize your sales pipeline end-to-end',
  },
  {
    icon: '💳',
    title: 'PAYMENTS',
    description: 'Accept, process, and manage payments across all channels securely',
  },
  {
    icon: '📈',
    title: 'GROWTH OPERATIONS',
    description: 'Scale your business with automated growth strategies and optimization tools',
  },
];

export const Features: React.FC = () => {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>THE WISE² BUSINESS OS ADVANTAGE</h2>
          <p className={styles.featuresSubtitle}>Everything you need to run your empire, all in one platform</p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
