import React from 'react';
import { Luggage } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Trip Dashboard',
    description: 'Get an overview of your upcoming trips, quick stats, and recent activity in one place.'
  },
  {
    title: 'Trip Scheduler',
    description: 'Plan your itinerary day-by-day with a beautiful calendar view and easy editing.'
  },
  {
    title: 'Expense Tracker',
    description: 'Track expenses by category, manage budgets, and visualize spending with charts.'
  },
  {
    title: 'Collaborative Mode',
    description: 'Invite friends or family, assign expenses, and split costs for group trips.'
  },
  {
    title: 'Packing List',
    description: 'Create checklists and travel notes to stay organized and never forget essentials.'
  },
  {
    title: 'PWA Support',
    description: 'Enjoy offline functionality and install TripWise as an app for on-the-go access.'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 rounded-full p-4 shadow-lg mb-4">
            <Luggage size={48} color="white" strokeWidth={1.5} className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 tracking-tight mb-2 drop-shadow-sm">TripWise</h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mb-2">Your all-in-one travel planner: organize trips, manage expenses, collaborate, and travel smarter.</p>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/90 border border-blue-100 rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col gap-2 h-full"
            >
              <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                {feature.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="inline-block mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 12l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Get Started / Login
        </Link>
      </div>
      <footer className="mt-12 text-xs text-gray-400 text-center w-full">
        &copy; {new Date().getFullYear()} TripWise. All rights reserved.
      </footer>
    </main>
  );
}
