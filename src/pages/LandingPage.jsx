import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="Network Management System"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                }}
              />
              <span className="text-lg sm:text-xl font-semibold text-gray-900">
                Network Management
              </span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer sm:w-auto max-w-[160px] text-sm sm:text-base"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="/icon.png" 
              alt="Network Management System" 
              style={{ 
                width: '120px', 
                height: '120px',
                borderRadius: '16px',
                margin: '0 auto'
              }}
            />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Manage Your Fiber Network
            <span className="text-blue-600"> with Confidence</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive web application for managing fiber optic network infrastructure, 
            customer data, and real-time coverage analysis with interactive mapping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium cursor-pointer w-full sm:w-auto"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Network Management
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <img 
                  src="/icon.png" 
                  alt="Interactive Maps" 
                  style={{ 
                    width: '24px', 
                    height: '24px',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Interactive Maps</h4>
              <p className="text-gray-600">
                Real-time network visualization with ArcGIS integration, customer mapping, 
                and fiber optic route display.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-green-600 rounded-full"></div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Customer Management</h4>
              <p className="text-gray-600">
                Complete CRUD operations for customers with geographic placement, 
                package assignment, and analytics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-purple-600 rounded-sm"></div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Package Management</h4>
              <p className="text-gray-600">
                Dynamic package configuration with color-coded identification, 
                performance analytics, and revenue tracking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Coverage Analysis</h4>
              <p className="text-gray-600">
                Occupation capacity visualization with color-coded utilization indicators 
                and real-time monitoring.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-red-600 rounded-full"></div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">User Management</h4>
              <p className="text-gray-600">
                Role-based access control, authentication, authorization, 
                and secure session management.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-indigo-600 rounded-sm"></div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h4>
              <p className="text-gray-600">
                Customer distribution charts, package performance metrics, 
                revenue analytics, and coverage statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Network Management?
          </h3>
          <p className="text-base sm:text-lg text-blue-100 mb-8">
            Get started today and experience the power of modern network management.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium cursor-pointer w-full sm:w-auto"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <img 
              src="/icon.png" 
              alt="Network Management System" 
              style={{ 
                width: '32px', 
                height: '32px',
                borderRadius: '6px'
              }}
            />
            <span className="text-base font-semibold">Network Management</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">
              Comprehensive fiber optic network management solution
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2026 Network Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
