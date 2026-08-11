'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/wise';

export default function IntakePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    website: '',
    industry: '',
    businessDescription: '',
    currentProblem: '',
    desiredBuild: '',
    currentTools: [] as string[],
    desiredResult: '',
    timeline: '',
    budgetRange: '',
    teamSize: '',
    revenueRange: '',
    crm: '',
    websitePlatform: '',
    socialPlatforms: [] as string[],
    existingAutomations: [] as string[],
    aiTools: [] as string[],
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayInput = (field: string, value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field as any] || []), value],
      }));
    }
  };

  const handleArrayRemove = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as any] || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get UTM parameters from URL
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || localStorage.getItem('utm_source');
      const utmMedium = params.get('utm_medium') || localStorage.getItem('utm_medium');
      const utmCampaign = params.get('utm_campaign') || localStorage.getItem('utm_campaign');

      // Store UTM for checkout
      if (utmSource) localStorage.setItem('utm_source', utmSource);
      if (utmMedium) localStorage.setItem('utm_medium', utmMedium);
      if (utmCampaign) localStorage.setItem('utm_campaign', utmCampaign);

      const response = await fetch('/api/v1/consulting/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to submit intake form');
      }

      const result = await response.json();
      setLeadData(result.data);
      setShowRecommendation(true);

      // Auto-redirect to checkout after 3 seconds
      setTimeout(() => {
        proceedToCheckout(result.data.leadId, result.data.recommendedService);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const proceedToCheckout = async (leadId: string, serviceId: string) => {
    try {
      const response = await fetch('/api/v1/consulting/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, serviceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const result = await response.json();
      window.location.href = result.data.checkoutUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to proceed to payment');
      setLoading(false);
    }
  };

  if (showRecommendation && leadData) {
    return (
      <main className="min-h-screen bg-[#050505] text-white py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Orbitron' }}>
              Intake Complete!
            </h1>
          </div>

          <div
            className="p-8 rounded-2xl mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(0, 148, 255, 0.05))',
              border: '1px solid rgba(57, 255, 20, 0.35)',
            }}
          >
            <p className="text-lg mb-2">Based on your responses, we recommend:</p>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#39FF14' }}>
              {leadData.recommendedService}
            </h2>
            <p style={{ color: '#A0A0A0' }}>
              This service best matches your goals and budget. You'll be taken to checkout in a moment...
            </p>
          </div>

          <button
            onClick={() => proceedToCheckout(leadData.leadId, leadData.recommendedService)}
            className="px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200"
            style={{
              background: '#39FF14',
              color: '#050505',
              boxShadow: '0 0 25px rgba(57, 255, 20, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 35px rgba(57, 255, 20, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Proceed to Payment →
          </button>

          <p style={{ color: '#666', marginTop: '16px', fontSize: '14px' }}>
            Or close this window to return to the site.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#050505] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Orbitron' }}>
              AI Business Intake
            </h1>
            <p style={{ color: '#8D98A5' }}>
              Tell us about your business. We'll qualify your needs and recommend the perfect WISE² consulting service.
            </p>
          </div>

          {error && (
            <div
              className="p-4 rounded-xl mb-8"
              style={{
                background: 'rgba(255, 0, 64, 0.1)',
                border: '1px solid rgba(255, 0, 64, 0.3)',
                color: '#FF0040',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Info */}
            <div
              className="p-8 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
                border: '1px solid rgba(57, 255, 20, 0.2)',
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: '#39FF14' }}>
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg md:col-span-2"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                />
              </div>
            </div>

            {/* Company Info */}
            <div
              className="p-8 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
                border: '1px solid rgba(57, 255, 20, 0.2)',
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: '#39FF14' }}>
                Business Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name *"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                />
                <input
                  type="url"
                  name="website"
                  placeholder="Website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                />
                <input
                  type="text"
                  name="industry"
                  placeholder="Industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                />
                <select
                  name="revenueRange"
                  value={formData.revenueRange}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                >
                  <option value="">Revenue Range</option>
                  <option value="<$100k">Under $100k</option>
                  <option value="$100k-$500k">$100k-$500k</option>
                  <option value="$500k-1M">$500k-1M</option>
                  <option value="$1M-5M">$1M-5M</option>
                  <option value="5-figure">5-figure</option>
                  <option value="6-figure">6-figure</option>
                  <option value="7-figure">7-figure+</option>
                </select>
                <input
                  type="text"
                  name="businessDescription"
                  placeholder="What does your business do?"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg md:col-span-2"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                />
              </div>
            </div>

            {/* Problems & Goals */}
            <div
              className="p-8 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
                border: '1px solid rgba(57, 255, 20, 0.2)',
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: '#39FF14' }}>
                Problems & Goals
              </h2>
              <div className="space-y-4">
                <textarea
                  name="currentProblem"
                  placeholder="What's your biggest operational problem right now? *"
                  value={formData.currentProblem}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white', fontFamily: 'inherit' }}
                />
                <textarea
                  name="desiredBuild"
                  placeholder="What would you like us to build or automate? *"
                  value={formData.desiredBuild}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white', fontFamily: 'inherit' }}
                />
                <textarea
                  name="desiredResult"
                  placeholder="What would success look like?"
                  value={formData.desiredResult}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Budget & Timeline */}
            <div
              className="p-8 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
                border: '1px solid rgba(57, 255, 20, 0.2)',
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: '#39FF14' }}>
                Budget & Timeline
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                >
                  <option value="">Budget Range</option>
                  <option value="<$500">Under $500</option>
                  <option value="$500-$1000">$500-$1,000</option>
                  <option value="$1000-5000">$1,000-$5,000</option>
                  <option value="$5000+">$5,000+</option>
                </select>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                >
                  <option value="">Timeline</option>
                  <option value="ASAP">ASAP</option>
                  <option value="This week">This week</option>
                  <option value="This month">This month</option>
                  <option value="Next quarter">Next quarter</option>
                </select>
              </div>
            </div>

            {/* Current Tools */}
            <div
              className="p-8 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
                border: '1px solid rgba(57, 255, 20, 0.2)',
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: '#39FF14' }}>
                Current Tools & Systems
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#8D98A5' }}>
                    Current Tools (separate with Enter)
                  </label>
                  <input
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleArrayInput('currentTools', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    placeholder="e.g., Slack, Zapier, Stripe"
                    className="w-full p-3 rounded-lg"
                    style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.currentTools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        style={{ background: 'rgba(57, 255, 20, 0.2)' }}
                      >
                        {tool}
                        <button
                          type="button"
                          onClick={() => handleArrayRemove('currentTools', idx)}
                          className="text-lg leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <select
                  name="websitePlatform"
                  value={formData.websitePlatform}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                >
                  <option value="">Website Platform</option>
                  <option value="WordPress">WordPress</option>
                  <option value="Shopify">Shopify</option>
                  <option value="Webflow">Webflow</option>
                  <option value="Wix">Wix</option>
                  <option value="Custom">Custom</option>
                  <option value="No website">No website yet</option>
                </select>

                <select
                  name="crm"
                  value={formData.crm}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg"
                  style={{ background: '#0F0F0F', border: '1px solid rgba(57, 255, 20, 0.2)', color: 'white' }}
                >
                  <option value="">CRM (if any)</option>
                  <option value="HubSpot">HubSpot</option>
                  <option value="Salesforce">Salesforce</option>
                  <option value="Pipedrive">Pipedrive</option>
                  <option value="Monday">Monday.com</option>
                  <option value="Airtable">Airtable</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-5 rounded-xl font-bold text-lg transition-all duration-200"
                style={{
                  background: '#39FF14',
                  color: '#050505',
                  boxShadow: '0 0 25px rgba(57, 255, 20, 0.3)',
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.boxShadow = '0 0 35px rgba(57, 255, 20, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? 'Submitting...' : 'Get My Recommendation →'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
