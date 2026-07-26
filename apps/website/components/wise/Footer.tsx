'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label="Site footer">
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

          {/* Explore Column */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>EXPLORE</h4>
            <nav className={styles.footerLinks} aria-label="Explore navigation">
              <Link href="/">Home</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/studio">Creative Studio</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </div>

          {/* Businesses Column */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>BUSINESSES</h4>
            <nav className={styles.footerLinks} aria-label="Businesses navigation">
              <Link href="/piff-city">PIFF CITY</Link>
              <Link href="/wise-shine">WISE SHINE</Link>
              <Link href="/">WISE²</Link>
            </nav>
          </div>

          {/* Newsletter Column */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>STAY CONNECTED</h4>
            <p className={styles.footerNewsletterText}>
              Get updates, exclusive content and platform announcements.
            </p>
            <div className={styles.footerEmailRow}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.footerEmailInput}
                aria-label="Email address"
              />
              <button className={styles.footerEmailBtn} type="button">
                JOIN
              </button>
            </div>
          </div>
        </div>

        {/* Legacy Tagline */}
        <div className={styles.legacyRow}>
          <p className={styles.legacyLine}>
            <span style={{ color: '#0094FF' }}>WISE²</span> BUILDS THE SYSTEM.{' '}
            <span style={{ color: '#B020FF' }}>PIFF CITY</span> BUILDS THE CULTURE.{' '}
            <span style={{ color: '#FFB800' }}>WISE SHINE</span> BUILDS THE SHINE.
          </p>
          <p className={styles.legacyTagline}>TOGETHER WE BUILD LEGACY.</p>
        </div>

        {/* Footer Bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.footerCopyright}>
            <p>© {currentYear} WISE² Business OS. All Rights Reserved.</p>
          </div>

          {/* Social Icons */}
          <div className={styles.socialRow} aria-label="Social media links">
            <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="X / Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="none" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerLegal}>
              <Link href="/privacy">Privacy Policy</Link>
              <span className={styles.footerDivider} aria-hidden="true">•</span>
              <Link href="/terms">Terms of Service</Link>
            </div>
            <div className={styles.footerBadge}>POWERED BY WISE² BUSINESS OS</div>
          </div>
        </div>
      </div>

      <div className={styles.footerAccent} aria-hidden="true" />
    </footer>
  );
};
