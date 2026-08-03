'use client';

import styles from './About.module.css';

export const About: React.FC = () => {
  return (
    <>
      {/* About Section */}
      <section className={styles.aboutSection} aria-labelledby="about-title">
        <div className={styles.aboutContainer}>
          <div className={styles.aboutHeader}>
            <h2 className={styles.aboutTitle} id="about-title">
              ABOUT WISE²
            </h2>
            <p className={styles.aboutHighlight}>OUR MISSION</p>
          </div>

          <div className={styles.aboutContent}>
            <div className={styles.aboutMission}>
              <p className={styles.missionText}>
                WISE² is building the operating system for modern businesses that are serious about
                winning. We combine cutting-edge AI, intelligent automation, and unified business
                infrastructure to create one command center for everything you need to run your empire.
              </p>

              <p className={styles.missionText}>
                Founded by Daniel WISE and Darrin WISE, WISE² powers businesses that build culture,
                drive innovation, and dominate their markets. From automation to intelligence to
                integration, every module is designed with one goal: help you scale infinitely while
                staying in control.
              </p>
            </div>

            <div className={styles.poweredBySection}>
              <h3 className={styles.poweredByTitle}>POWERED BY LEADERS</h3>
              <div className={styles.businessPillars}>
                <div className={styles.pillar} style={{ borderColor: '#B020FF' }}>
                  <div className={styles.pillarColor} style={{ backgroundColor: '#B020FF' }} />
                  <h4>PIFF CITY</h4>
                  <p>BUILDS THE CULTURE</p>
                </div>
                <div className={styles.pillar} style={{ borderColor: '#0066FF' }}>
                  <div className={styles.pillarColor} style={{ backgroundColor: '#0066FF' }} />
                  <h4>WISE²</h4>
                  <p>BUILDS THE SYSTEM</p>
                </div>
                <div className={styles.pillar} style={{ borderColor: '#FFB800' }}>
                  <div className={styles.pillarColor} style={{ backgroundColor: '#FFB800' }} />
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
    </>
  );
};
