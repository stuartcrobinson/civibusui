import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function NYCPlaceholderPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            New York City
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Campaign finance data for NYC municipal elections coming soon.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to State Selection
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NYCPlaceholderPage;