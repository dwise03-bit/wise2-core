'use client';

import { Navigation, Footer } from '@/components/wise';
import { useState } from 'react';

export default function Home() {
  const [selectedProject, setSelectedProject] = useState('Brand Creation');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', idea: '', goal: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const projects = [
    { id: 1, name: 'Brand Creation', desc: 'Logo, identity, visual language' },
    { id: 2, name: 'Website Build', desc: 'Marketing, ecommerce, informational site' },
    { id: 3, name: 'App or Platform', desc: 'Web, mobile, or SaaS application' },
    { id: 4, name: 'Product Development', desc: 'Physical or digital product' },
    { id: 5, name: 'Marketing Campaign', desc: 'Strategy, creative, and execution' },
    { id: 6, name: 'Music and Entertainment', desc: 'Album, music video, or media project' },
    { id: 7, name: 'AI and Automation', desc: 'Custom AI tools or workflow automation' },
    { id: 8, name: 'Business System', desc: 'Internal tools, workflows, or infrastructure' },
    { id: 9, name: 'Full A-to-Z Build', desc: 'Complete project from concept to launch' },
    { id: 10, name: 'Something New', desc: 'The idea does not fit inside a box' },
  ];

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.idea) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType: selectedProject,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setStep(3);
    } catch (error) {
      setSubmitError('Failed to submit. Please try again or contact support.');
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />

      <main className="bg-black min-h-screen pt-20">
        {/* WISE² Command Center Intake Form */}
        <div className="max-w-6xl mx-auto px-4 py-20">
          {/* Header with Process Steps */}
          <div className="mb-20">
            <div className="flex justify-between items-center mb-12 gap-4">
              {['IDEA', 'STRATEGY', 'BUILD', 'LAUNCH', 'MULTIPLY'].map((label, idx) => (
                <div key={label} className="flex flex-col items-center flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    idx === 0
                      ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                      : 'border-gray-700 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className={`text-xs mt-2 font-mono tracking-widest ${
                    idx === 0 ? 'text-lime-400' : 'text-gray-600'
                  }`}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-2 text-lime-400" style={{ fontFamily: '"Beyond The Mountains", sans-serif' }}>
            Capture Your Vision
          </h1>
          <p className="text-gray-400 mb-16 font-mono text-sm tracking-wider">Step {step} of 5</p>

          {/* Form Section */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani' }}>
                    What do you need?
                  </h2>
                  <p className="text-gray-400 mb-12 font-mono text-sm">Select your project type to get started.</p>

                  <fieldset className="mb-8">
                    <legend className="sr-only">Project Type Selection</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => setSelectedProject(project.name)}
                          className={`p-6 rounded-lg border-2 transition-all duration-300 text-left group focus:outline-2 focus:outline-lime-400 focus:outline-offset-2 ${
                            selectedProject === project.name
                              ? 'border-lime-400 bg-lime-400/10 ring-2 ring-lime-400/30 shadow-lg shadow-lime-400/20'
                              : 'border-gray-800 hover:border-lime-400/50 hover:bg-gray-900/50 hover:shadow-md hover:shadow-lime-400/10'
                          }`}
                          aria-pressed={selectedProject === project.name}
                          aria-label={`Select ${project.name}: ${project.desc}`}
                        >
                          <div className={`font-bold mb-1 text-sm transition-colors duration-300 ${
                            selectedProject === project.name ? 'text-lime-400' : 'text-white group-hover:text-lime-400/80'
                          }`}>
                            {project.name}
                          </div>
                          <div className={`text-xs transition-colors duration-300 ${
                            selectedProject === project.name ? 'text-lime-400/70' : 'text-gray-500 group-hover:text-gray-400'
                          }`}>
                            {project.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-8 py-3 rounded bg-lime-400 text-black font-bold transition-all duration-300 hover:bg-lime-300 hover:scale-110 hover:shadow-lg hover:shadow-lime-400/50 active:scale-95 focus:outline-2 focus:outline-lime-400 focus:outline-offset-2"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Rajdhani' }}>
                    Tell us about yourself
                  </h2>

                  {submitError && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded text-red-300 text-sm">
                      {submitError}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="fullname" className="block text-white font-bold mb-2 text-sm">
                        Full Name <span className="text-red-400" aria-label="required">*</span>
                      </label>
                      <input
                        id="fullname"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 focus:outline-none transition-all duration-300 hover:border-gray-700"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-white font-bold mb-2 text-sm">
                        Email <span className="text-red-400" aria-label="required">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 focus:outline-none transition-all duration-300 hover:border-gray-700"
                      />
                    </div>

                    <div>
                      <label htmlFor="idea" className="block text-white font-bold mb-2 text-sm">
                        Describe Your Idea <span className="text-red-400" aria-label="required">*</span>
                      </label>
                      <textarea
                        id="idea"
                        required
                        value={formData.idea}
                        onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                        placeholder="Tell us about your project in detail..."
                        rows={6}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 focus:outline-none transition resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="goal" className="block text-white font-bold mb-2 text-sm">
                        Main Goal <span className="text-gray-500 text-xs">(Optional)</span>
                      </label>
                      <textarea
                        id="goal"
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        placeholder="What's the primary goal of this project?"
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:border-lime-400 focus:ring-2 focus:ring-lime-400/30 focus:outline-none transition resize-none"
                      />
                    </div>
                  </div>

                  <div className="mt-12 flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      disabled={submitting}
                      className="px-8 py-3 rounded border border-gray-800 text-white hover:border-lime-400/50 hover:bg-gray-900/50 hover:shadow-md hover:shadow-lime-400/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-lime-400 focus:outline-offset-2"
                      aria-label="Go back to previous step"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-8 py-3 rounded bg-lime-400 text-black font-bold hover:bg-lime-300 hover:scale-105 hover:shadow-lg hover:shadow-lime-400/50 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-2 focus:outline-lime-400 focus:outline-offset-2"
                      aria-label={submitting ? 'Submitting form' : 'Submit form'}
                    >
                      {submitting ? (
                        <>
                          <span className="inline-block animate-spin">⏳</span>
                          Submitting...
                        </>
                      ) : (
                        <>Submit →</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-20">
                  <div className="text-7xl mb-6 text-lime-400 animate-bounce">✓</div>
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani' }}>
                    Submission Complete
                  </h2>
                  <p className="text-gray-400 mb-2 font-mono text-sm">
                    Thank you for submitting your project details!
                  </p>
                  <p className="text-gray-500 mb-8 font-mono text-xs">
                    We've received your intake form. Our team will review and reach out within 24 hours.
                  </p>
                  <div className="bg-gray-900/30 border border-lime-400/30 rounded-lg p-6 mb-8 max-w-md mx-auto">
                    <div className="text-left space-y-3">
                      <div>
                        <p className="text-gray-500 text-xs tracking-wider font-mono mb-1">PROJECT TYPE</p>
                        <p className="text-lime-400 font-bold">{selectedProject}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs tracking-wider font-mono mb-1">CONTACT EMAIL</p>
                        <p className="text-white">{formData.email}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStep(1);
                      setFormData({ name: '', email: '', idea: '', goal: '' });
                      setSubmitError(null);
                    }}
                    className="px-8 py-3 rounded bg-lime-400 text-black font-bold hover:bg-lime-300 transition focus:outline-2 focus:outline-lime-400 focus:outline-offset-2"
                  >
                    Start New Project
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-8" style={{ backdropFilter: 'blur(10px)' }}>
              <h3 className="text-white font-bold mb-4 text-sm tracking-wider font-mono">CURRENT SELECTION</h3>
              <div className="text-lime-400 font-bold mb-6 text-lg">{selectedProject}</div>

              <div className="space-y-4 text-sm text-gray-400">
                <div>
                  <div className="text-gray-500 mb-1 font-mono text-xs tracking-wider">PROJECT TYPE</div>
                  <div className="text-white">{selectedProject}</div>
                </div>
                <div className="pt-4 border-t border-gray-800">
                  <div className="text-gray-500 mb-1 font-mono text-xs tracking-wider">TIMELINE</div>
                  <div className="text-white">To be determined</div>
                </div>
                <div className="pt-4 border-t border-gray-800">
                  <div className="text-gray-500 mb-1 font-mono text-xs tracking-wider">BUDGET</div>
                  <div className="text-white">To be determined</div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-800">
                <p className="text-gray-500 text-xs font-mono tracking-wider">
                  Organized Chaos
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
