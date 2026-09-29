'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function ServicesPage() {
  const services = [
    {
      title: 'Creative Studio',
      description: 'Professional audio and video production powered by AI',
      features: ['Sound Lab', 'Live Studio', 'Jingle Lab', 'Voice Lab', 'Content Factory'],
      icon: '🎬',
      color: 'from-blue-500/20',
    },
    {
      title: 'Consulting Services',
      description: 'Expert consulting for strategy, audits, and implementation',
      features: ['Business Audits', 'Strategy Sessions', 'Implementation Support', 'Analytics'],
      icon: '📊',
      color: 'from-green-500/20',
    },
    {
      title: 'Automation Engine',
      description: 'AI-powered workflows to streamline your business',
      features: ['Workflow Builder', 'Task Automation', 'AI Agents', 'Integration Hub'],
      icon: '⚙️',
      color: 'from-purple-500/20',
    },
    {
      title: 'Intelligence Platform',
      description: 'Advanced analytics and insights powered by AI',
      features: ['Real-time Analytics', 'Predictive Insights', 'Custom Reports', 'Data Export'],
      icon: '🧠',
      color: 'from-cyan-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 border-b border-[#1A1A1A]">
        <Container>
          <div className="text-center space-y-6">
            <Badge variant="success">Our Services</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              Everything You Need to <span className="text-[#2CD588]">Succeed</span>
            </h1>
            <p className="text-[#A0A0A0] text-lg max-w-2xl mx-auto">
              Comprehensive suite of tools and services designed to help you create, automate, and scale your business.
            </p>
          </div>
        </Container>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, idx) => (
              <Card key={idx} variant="elevated" className="space-y-6">
                <div className="space-y-4">
                  <div className="text-5xl">{service.icon}</div>
                  <h2 className="text-2xl font-bold">{service.title}</h2>
                  <p className="text-[#A0A0A0]">{service.description}</p>
                </div>

                <div className="border-t border-[#1A1A1A] pt-6">
                  <p className="text-sm font-bold text-[#2CD588] mb-3">Key Features</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-3 text-[#A0A0A0] text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2CD588]"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="primary" className="w-full" asChild>
                  <Link href="/consulting">Learn More</Link>
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 bg-[#0A0A0A] border-y border-[#1A1A1A]">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Flexible Pricing Plans</h2>
            <p className="text-[#A0A0A0] max-w-2xl mx-auto">
              Choose the plan that works best for you. All plans include core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: '$99', period: '/month', features: ['5 Projects', '50GB Storage', 'Basic Analytics', 'Email Support'] },
              { name: 'Professional', price: '$299', period: '/month', features: ['Unlimited Projects', '500GB Storage', 'Advanced Analytics', 'Priority Support', 'Custom Workflows'], popular: true },
              { name: 'Enterprise', price: 'Custom', period: 'Contact Sales', features: ['Unlimited Everything', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee'] },
            ].map((plan, idx) => (
              <Card key={idx} variant={plan.popular ? 'elevated' : 'default'} className={`space-y-6 ${plan.popular ? 'border-[#2CD588]' : ''}`}>
                {plan.popular && (
                  <Badge variant="success" className="w-fit">Most Popular</Badge>
                )}
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-3 space-y-1">
                    <div className="text-4xl font-bold">{plan.price}</div>
                    <p className="text-sm text-[#A0A0A0]">{plan.period}</p>
                  </div>
                </div>

                <div className="border-t border-[#1A1A1A] pt-6 space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center gap-3 text-sm">
                      <span className="text-[#2CD588]">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={plan.popular ? 'primary' : 'secondary'} 
                  className="w-full"
                  asChild
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <Container>
          <Card variant="elevated" className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-[#A0A0A0] max-w-2xl mx-auto">
              Join hundreds of creators and businesses using WISE² to create amazing content and scale their operations.
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/auth/signup">Start Your Free Trial</Link>
            </Button>
          </Card>
        </Container>
      </section>
    </div>
  );
}
