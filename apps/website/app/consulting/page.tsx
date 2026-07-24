'use client';

import React, { useEffect, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  icon?: string;
  tags?: string[];
  consultants?: Array<{
    consultant: {
      id: string;
      name: string;
      expertise: string[];
      hourlyRate: number;
      isActive: boolean;
    };
  }>;
}

export default function ConsultingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
    fetchTags();
  }, [selectedTag]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const url = selectedTag
        ? `/api/consulting/services?tags=${selectedTag}`
        : '/api/consulting/services';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/consulting/services/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 border-b border-[#1A1A1A]">
        <Container>
          <div className="space-y-6 text-center">
            <Badge variant="success">Professional Services</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              Expert <span className="text-[#2CD588]">Consulting</span> Services
            </h1>
            <p className="text-[#A0A0A0] text-lg max-w-2xl mx-auto">
              Get expert guidance from our team of experienced consultants. From strategy to implementation, we help you succeed.
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/prospects/new">Start Your Project</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Filter Section */}
      {tags.length > 0 && (
        <section className="py-8 bg-[#0A0A0A] border-b border-[#1A1A1A]">
          <Container>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Button
                variant={selectedTag === null ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All Services
              </Button>
              {tags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Services Grid */}
      <section className="py-16 sm:py-24">
        <Container>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex animate-spin">
                <svg className="w-8 h-8 text-[#2CD588]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <p className="mt-4 text-[#A0A0A0]">Loading services...</p>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} variant="action" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">{service.name}</h3>
                    <p className="text-[#A0A0A0] text-sm mt-2">{service.description}</p>
                  </div>

                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <Badge key={tag} variant="info" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-[#1A1A1A] pt-4 space-y-4">
                    <div>
                      <p className="text-sm text-[#A0A0A0] mb-1">Hourly Rate</p>
                      <p className="text-2xl font-bold text-[#2CD588]">
                        ${service.hourlyRate}
                        <span className="text-sm text-[#A0A0A0]">/hr</span>
                      </p>
                    </div>

                    {service.consultants && service.consultants.length > 0 && (
                      <div>
                        <p className="text-sm text-[#A0A0A0] mb-2">Available Consultants</p>
                        <div className="space-y-2">
                          {service.consultants.map(({ consultant }) => (
                            <div key={consultant.id} className="bg-[#0A0A0A] p-2 rounded text-sm">
                              <p className="font-medium">{consultant.name}</p>
                              <p className="text-xs text-[#A0A0A0]">{consultant.expertise.join(', ')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button variant="primary" size="md" className="w-full" asChild>
                      <Link href={`/consulting/${service.id}`}>Book Now</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#A0A0A0] text-lg">No services available at the moment.</p>
              <Button variant="secondary" size="md" className="mt-4" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <Container>
          <Card variant="elevated" className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Expert Help?</h2>
            <p className="text-[#A0A0A0] max-w-2xl mx-auto">
              Book a consultation with one of our experts today. We're here to help you achieve your goals.
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/prospects/new">Book a Consultation</Link>
            </Button>
          </Card>
        </Container>
      </section>
    </div>
  );
}
