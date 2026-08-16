'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import CreditAudit from '@/components/CreditAudit';
import Cases from '@/components/Cases';
import ActionPlan from '@/components/ActionPlan';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'audit' && <CreditAudit />}
        {currentPage === 'cases' && <Cases />}
        {currentPage === 'action-plan' && <ActionPlan />}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">JO CREDIT OS™</h3>
              <p className="text-sm text-gray-600">We Don't Dispute Everything. We Audit Everything.™</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600">Email Support</a></li>
                <li><a href="#" className="hover:text-blue-600">Phone: 1-800-JO-CREDIT</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-sm text-gray-600">
              © 2026 JO CREDIT OS™. All rights reserved. This is a demo application.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
