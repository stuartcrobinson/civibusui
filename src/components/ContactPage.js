import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { updateMetaTags } from '../utils/metaTags';

function ContactPage() {
  useEffect(() => {
    updateMetaTags({
      title: 'Civibus - Contact',
      description: 'Contact',
      url: window.location.href
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Contact Us
        </h1>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <p className="text-lg mb-6">
              We welcome questions, feedback, and collaboration opportunities. Whether you're
              a journalist covering local elections, a voter seeking information, or an
              organization interested in our work, we'd love to hear from you.
            </p>

            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                General Inquiries
              </h2>
              <p className="mb-4">
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:info@civibus.org"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-lg"
                >
                  info@civibus.org
                </a>
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  For Journalists
                </h2>
                <p className="mb-3">
                  We prioritize supporting journalists covering North Carolina elections. We can:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Provide custom data analysis for specific races or candidates</li>
                  <li>Manually tabulate PDF filings when needed for your reporting</li>
                  <li>Explain our methodology and data sources</li>
                  <li>Share raw data files and documentation</li>
                  <li>Collaborate on data-driven investigative projects</li>
                </ul>
                <p>
                  Please mention your publication and the story you're working on when reaching out.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Report an Error
                </h2>
                <p>
                  If you notice inaccurate information on our site, please let us know. Include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                  <li>The specific page or data point in question</li>
                  <li>What you believe is incorrect</li>
                  <li>Any supporting documentation</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Support Our Work
                </h2>
                <p>
                  The best way to support Civibus is to share our analysis and data with your
                  community. If you use our work in reporting or research, we'd love to hear
                  about it.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ContactPage;