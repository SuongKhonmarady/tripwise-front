import React from 'react';
import { Luggage, BarChart3, Calendar, Users, CheckSquare, Smartphone, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    title: 'Dashboard',
    description: 'Overview & analytics',
    icon: BarChart3,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Scheduler',
    description: 'Plan day-by-day',
    icon: Calendar,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Expenses',
    description: 'Track & budget',
    icon: Map,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Collaborate',
    description: 'Share with friends',
    icon: Users,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    title: 'Packing',
    description: 'Smart checklists',
    icon: CheckSquare,
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    title: 'Offline',
    description: 'Works anywhere',
    icon: Smartphone,
    gradient: 'from-teal-500 to-blue-500'
  }
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Hero Section */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-6 shadow-xl mb-6 transform transition-transform hover:scale-105">
            <Luggage size={56} color="white" strokeWidth={1.5} className="w-14 h-14" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-tight mb-4">
            តោះដើរលេង
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8 leading-relaxed">
            Your all-in-one travel companion. Plan trips, manage expenses, collaborate with friends, and travel smarter.
          </p>
          
          {/* CTA Button */}
          {isAuthenticated ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-gray-700 font-medium">
                Welcome back, {user?.name || 'Traveler'}!
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Get Started
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="w-full mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Everything You Need
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Powerful tools for effortless travel planning
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl hover:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center gap-4 text-center transform hover:-translate-y-1 hover:scale-105"
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <IconComponent size={24} color="white" strokeWidth={1.8} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base group-hover:text-gray-900 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Secondary CTA for non-authenticated users */}
        {!isAuthenticated && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-4 transition-colors"
            >
              Sign in here
            </Link>
          </div>
        )}
      </div>
      
      <footer className="mt-16 text-sm text-gray-400 text-center w-full">
        &copy; {new Date().getFullYear()} TripWise. All rights reserved.
      </footer>
    </main>
  );
}
