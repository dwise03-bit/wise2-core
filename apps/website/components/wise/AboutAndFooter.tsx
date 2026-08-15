'use client';

import Link from 'next/link';
import styles from './AboutAndFooter.module.css';

export const AboutAndFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* About Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutHeader}>
            <h2 className={styles.aboutTitle}>ABOUT WISE²</h2>
            <p className={styles.aboutHighlight}>OUR MISSION</p>
          </div>

          <div className={styles.aboutContent}>
            <div className={styles.aboutMission}>
              <p className={styles.missionText}>
                WISE² is building the operating system for modern businesses that are serious about winning. We combine
                cutting-edge AI, intelligent automation, and unified business infrastructure to create one command
                center for everything you need to run your empire.
              </p>

              <p className={styles.missionText}>
                Founded by Daniel WISE and Darrin WISE, WISE² powers businesses that build culture, drive innovation,
                and dominate their markets. From automation to intelligence to integration, every module is designed
                with one goal: help you scale infinitely while staying in control.
              </p>
            </div>

            <div className={styles.poweredBySection}>
              <h3 className={styles.poweredByTitle}>POWERED BY LEADERS</h3>
              <div className={styles.businessPillars}>
                <div className={styles.pillar} style={{ borderColor: '#A63CFF' }}>
                  <div className={styles.pillarColor} style={{ backgroundColor: '#A63CFF' }} />
                  <h4>PIFF CITY</h4>
                  <p>BUILDS THE CULTURE</p>
                </div>
                <div className={styles.pillar} style={{ borderColor: '#0094FF' }}>
                  <div className={styles.pillarColor} style={{ backgroundColor: '#0094FF' }} />
                  <h4>WISE²</h4>
                  <p>BUILDS THE SYSTEM</p>
                </div>
                <div className={styles.pillar} style={{ borderColor: '#F2B632' }}>
                  <div className={styles.pillarColor} style={{ backgroundColor: '#F2B632' }} />
                  <h4>WISE SHINE</h4>
                  <p>BUILDS THE SHINE</p>
                </div>
              </div>
              <div className={styles.legacyStatement}>
                <p className={styles.legacyText}>TOGETHER WE BUILD LEGACY</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            {/* Brand Section */}
            <div className={styles.footerBrand}>
              <h3 className={styles.footerBrandName}>WISE²</h3>
              <p className={styles.footerBrandTagline}>Business Operating System</p>
              <p className={styles.footerBrandDescription}>
                AI-native platform for businesses that dominate their markets.
              </p>
            </div>

            {/* Quick Links */}
            <div className={styles.footerSection}>
              <h4 className={styles.footerSectionTitle}>EXPLORE</h4>
              <nav className={styles.footerLinks}>
                <Link href="/">Home</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/studio">Creative Studio</Link>
                <Link href="/dashboard">Dashboard</Link>
              </nav>
            </div>

            {/* Business Links */}
            <div className={styles.footerSection}>
              <h4 className={styles.footerSectionTitle}>BUSINESSES</h4>
              <nav className={styles.footerLinks}>
                <Link href="/">PIFF CITY</Link>
                <Link href="/">WISE SHINE</Link>
                <Link href="/">WISE²</Link>
              </nav>
            </div>

            {/* Social Links */}
            <div className={styles.footerSection}>
              <h4 className={styles.footerSectionTitle}>CONNECT</h4>
              <nav className={styles.footerLinks}>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Twitter / X
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Discord
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
                <a href="mailto:hello@wise2.com">Email</a>
              </nav>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className={styles.footerBottom}>
            <div className={styles.footerCopyright}>
              <p>
                © {currentYear} WISE². All rights reserved. | Built with AI, designed to win.
              </p>
            </div>
            <div className={styles.footerLegal}>
              <Link href="/">Privacy Policy</Link>
              <span className={styles.footerDivider}>•</span>
              <Link href="/">Terms of Service</Link>
              <span className={styles.footerDivider}>•</span>
              <Link href="/">Status</Link>
            </div>
          </div>
        </div>

        {/* Footer Accent Line */}
        <div className={styles.footerAccent} />
      </footer>
    </>
  );
};
