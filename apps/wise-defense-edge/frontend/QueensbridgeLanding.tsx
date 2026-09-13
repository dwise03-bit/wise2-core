'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Shield,
  Radio,
  Zap,
  Volume2,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Users,
  Activity,
  Smartphone,
} from 'lucide-react';

interface CourseCard {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  icon: React.ReactNode;
}

interface StatPoint {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export default function QueensbridgeLanding() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Parallax effect on hero
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ============================================
  // COMPONENT: Header/Navigation
  // ============================================
  const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/30">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-cyan-400" />
          <span className="text-xl font-bold text-white">WISE DEFENSE</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-gray-300 hover:text-cyan-400 transition">
            About
          </a>
          <a href="#courses" className="text-gray-300 hover:text-cyan-400 transition">
            Courses
          </a>
          <a href="#knight-wing" className="text-gray-300 hover:text-cyan-400 transition">
            KNIGHT WING
          </a>
          <a href="#contact" className="text-gray-300 hover:text-cyan-400 transition">
            Contact
          </a>
        </div>
        <button className="px-6 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition">
          Book Training
        </button>
      </nav>
    </header>
  );

  // ============================================
  // SECTION: Queensbridge Hero
  // ============================================
  const QueensbridgeHero = () => (
    <div
      ref={heroRef}
      className="relative w-full h-screen bg-black overflow-hidden pt-20"
      style={{
        backgroundImage:
          'radial-gradient(circle at center, rgba(0, 217, 255, 0.1) 0%, rgba(0, 0, 0, 1) 100%)',
      }}
    >
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(0deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollPosition * 0.5}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* Hero content container */}
      <div className="relative h-full flex items-center justify-between max-w-7xl mx-auto px-6">
        {/* Left side: Text content */}
        <div className="flex-1 z-10 max-w-2xl">
          {/* Eyebrow */}
          <div className="mb-6 inline-block">
            <p className="text-cyan-400 text-sm font-mono tracking-widest uppercase">
              QUEENSBRIDGE. STILL STANDING.
            </p>
          </div>

          {/* Main headline */}
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            TRAIN. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              TEACH.
            </span>
            <br />
            PROTECT.
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-300 mb-8 max-w-xl leading-relaxed">
            Advanced safety intelligence and tactical awareness training for professionals who
            protect their communities.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 mb-12">
            <button className="px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition transform hover:scale-105">
              Book Training →
            </button>
            <button className="px-8 py-4 border-2 border-cyan-500 text-cyan-400 font-bold rounded-lg hover:bg-cyan-500/10 transition">
              Learn More
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Certified Instructors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Military Background</span>
            </div>
          </div>
        </div>

        {/* Right side: Hero image placeholder */}
        <div className="flex-1 relative h-full flex items-center justify-center">
          <div className="relative w-full h-full max-w-lg">
            {/* Image frame with cinematic border */}
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-lg overflow-hidden">
              {/* Daniel seated in silver vehicle - real photography */}
              <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black flex items-center justify-center border-l-4 border-cyan-500/50">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Daniel Asset</p>
                  <p className="text-gray-600 text-xs">(Real Photography - Positioned)</p>
                </div>
              </div>
            </div>

            {/* Cinematic vignette effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

            {/* Glow effect */}
            <div className="absolute -inset-4 bg-cyan-500/20 blur-3xl rounded-full opacity-50 pointer-events-none animate-pulse" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <p className="text-cyan-400 text-xs font-mono mb-2">SCROLL</p>
          <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-transparent mx-auto" />
        </div>
      </div>
    </div>
  );

  // ============================================
  // SECTION: Credibility Strip
  // ============================================
  const CredibilityStrip = () => {
    const stats: StatPoint[] = [
      {
        label: 'Years of Experience',
        value: '20+',
        icon: <Shield className="w-6 h-6" />,
      },
      {
        label: 'Trained Professionals',
        value: '5000+',
        icon: <Users className="w-6 h-6" />,
      },
      {
        label: 'Active Deployments',
        value: '50+',
        icon: <Activity className="w-6 h-6" />,
      },
      {
        label: 'Course Completion Rate',
        value: '98%',
        icon: <CheckCircle className="w-6 h-6" />,
      },
    ];

    return (
      <div className="bg-black border-y border-cyan-500/20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-cyan-400 mb-3 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // SECTION: About
  // ============================================
  const AboutSection = () => (
    <section id="about" className="bg-black py-20 border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-12 text-center">
          About WISE DEFENSE
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              WISE DEFENSE delivers professional safety intelligence and tactical awareness training
              to law enforcement, security, and community leaders.
            </p>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              Our methodology combines evidence-based threat assessment, real-world scenario training,
              and cutting-edge technology integration.
            </p>
            <ul className="space-y-3">
              {[
                'Certified instructors with military background',
                'Real-world scenario-based training',
                'Community-focused approach',
                'Continuous education and updates',
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-8 border border-cyan-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              To empower communities through evidence-based safety training and intelligent threat
              awareness.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-cyan-400">
                <strong>Founded:</strong> Queensbridge Community Safety Initiative
              </p>
              <p className="text-sm text-cyan-400">
                <strong>Service Area:</strong> National and International Training
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ============================================
  // SECTION: Courses
  // ============================================
  const CoursesSection = () => {
    const courses: CourseCard[] = [
      {
        id: 'tactical-awareness',
        title: 'Tactical Awareness 101',
        description: 'Fundamentals of situational awareness and threat detection.',
        level: 'Beginner',
        duration: '2 days',
        icon: <AlertTriangle className="w-6 h-6" />,
      },
      {
        id: 'emergency-response',
        title: 'Emergency Response Training',
        description: 'Coordinated response protocols for critical incidents.',
        level: 'Intermediate',
        duration: '3 days',
        icon: <Radio className="w-6 h-6" />,
      },
      {
        id: 'advanced-tactics',
        title: 'Advanced Tactical Operations',
        description: 'High-level strategy and deployment scenarios.',
        level: 'Advanced',
        duration: '5 days',
        icon: <Zap className="w-6 h-6" />,
      },
    ];

    return (
      <section id="courses" className="bg-black py-20 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-12 text-center">
            Training Courses
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-lg p-8 hover:border-cyan-500 transition"
              >
                <div className="text-cyan-400 mb-4">{course.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 mb-4">{course.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                  <span>Level: {course.level}</span>
                  <span>Duration: {course.duration}</span>
                </div>
                <button className="w-full py-2 border border-cyan-500 text-cyan-400 rounded font-semibold hover:bg-cyan-500/10 transition">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ============================================
  // SECTION: KNIGHT WING Product
  // ============================================
  const KnightWingSection = () => (
    <section id="knight-wing" className="bg-black py-20 border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">KNIGHT WING</h2>
            <p className="text-cyan-400 text-lg font-mono mb-8">Edge Intelligence System</p>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              KNIGHT WING is our distributed edge intelligence platform, delivering real-time
              situational awareness without dependency on centralized infrastructure.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'Crime radar monitoring and analysis',
                'Receive-only SDR status integration',
                'Mesh network connectivity',
                'Weather alert integration',
                'Offline operation capability',
                'Local-first data processing',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <button className="px-8 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition">
              Request Demo
            </button>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-8 border border-cyan-500/20 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <Smartphone className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">KNIGHT WING Device Interface</p>
              <p className="text-gray-600 text-xs mt-2">(Visual Mockup)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ============================================
  // SECTION: Final CTA + Mission Callout
  // ============================================
  const MissionSection = () => (
    <section className="bg-gradient-to-b from-black to-gray-950 py-20 border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Join Our Mission
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
          Be part of a community dedicated to safety, preparedness, and protection. Whether you're
          an individual, organization, or institution, we have training solutions for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition transform hover:scale-105">
            Enroll Now →
          </button>
          <button className="px-8 py-4 border-2 border-cyan-500 text-cyan-400 font-bold rounded-lg hover:bg-cyan-500/10 transition">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );

  // ============================================
  // SECTION: Footer
  // ============================================
  const Footer = () => (
    <footer id="contact" className="bg-black border-t border-cyan-500/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span className="font-bold text-white">WISE DEFENSE</span>
            </div>
            <p className="text-gray-400 text-sm">Safety. Intelligence. Community.</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Training</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Courses
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Certifications
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Schedules
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-cyan-400 transition">
                  Community
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="mailto:info@wisedefensellc.com" className="hover:text-cyan-400 transition">
                  info@wisedefensellc.com
                </a>
              </li>
              <li>
                <a href="tel:+1-555-0100" className="hover:text-cyan-400 transition">
                  +1 (555) 0100
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
          <p>&copy; 2026 WISE DEFENSE. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-cyan-400 transition">
              Privacy
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              Terms
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="bg-black text-white">
      <Header />
      <QueensbridgeHero />
      <CredibilityStrip />
      <AboutSection />
      <CoursesSection />
      <KnightWingSection />
      <MissionSection />
      <Footer />
    </div>
  );
}
