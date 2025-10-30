import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
// 
// const SHOW_NYC = false; // Toggle this to show/hide NYC button
const SHOW_NYC = true; // Toggle this to show/hide NYC button

function StateSelectionPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Civibus
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-12 text-center">
            Municipal Campaign Finance Data
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/nc"
              className="block p-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                North Carolina
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                2025 Municipal Elections
              </p>
            </Link>
            
            {SHOW_NYC && (
              <Link
                to="/nyc"
                className="block p-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  New York City
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  2025 Municipal Elections
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default StateSelectionPage;