import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { logEvent } from '../utils/analytics';
import { updateMetaTags } from '../utils/metaTags';

function UsagesPage() {
  useEffect(() => {
    updateMetaTags({
      title: 'Civibus - Usages',
      description: 'Usages',
      url: window.location.href
    });
    logEvent('Press Page', 'View', 'Press');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Usage & Impact
        </h1>
        
        <p className="text-gray-700 dark:text-gray-300 mb-8">
            As coverage grows, we'll document media coverage and research that references our work here.        </p>

        <div className="space-y-6">
          {/* IndyWeek Article */}
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-300 dark:border-gray-600 overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <img 
                src="https://indyweek.com/wp-content/uploads/2025/10/2025-10-23-durham-campaign-financing-feature-illo-npm.png"
                alt="Durham campaign finance article illustration"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    <a 
                      href="https://indyweek.com/news/durham/digging-through-durham-candidates-campaign-finance-reports/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Digging Through Durham Candidates' Campaign Finance Reports
                    </a>
                  </h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="font-medium">IndyWeek</span> • October 2025
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                In-depth analysis of Durham's 2025 mayoral and city council campaign finance reports, 
                examining fundraising patterns, donor geography, expenditure strategies, and compliance 
                issues across all major races.
              </p>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Data used:</span> Durham 2025 campaign finance visualizations 
                and analysis. Multiple charts from Civibus were referenced throughout the article to illustrate 
                fundraising breakdowns, donor composition, and spending patterns.
              </div>
            </div>
          </article>
        </div>

        {/* <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Media inquiries:</strong> Journalists and researchers interested in using Civibus 
            data can reach us via our <Link to="/contact" className="underline hover:text-blue-700 dark:hover:text-blue-300">contact page</Link>.
          </p>
        </div> */}
      </div>
      <Footer />
    </div>
  );
}

export default UsagesPage;