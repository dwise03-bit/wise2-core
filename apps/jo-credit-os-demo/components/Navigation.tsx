'use client';

import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const pages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'audit', label: 'Credit Audit' },
    { id: 'cases', label: 'Cases' },
    { id: 'action-plan', label: 'Action Plan' },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">JO CREDIT OS™</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onPageChange(page.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    currentPage === page.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                  AJ
                </div>
                <span className="text-sm font-medium text-gray-700">Alex Johnson</span>
              </div>
              <button className="text-gray-500 hover:text-gray-700 hidden md:block">
                <LogOut size={20} />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-gray-500"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileOpen && (
            <div className="md:hidden pb-4 space-y-1">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    onPageChange(page.id);
                    setMobileOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === page.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
