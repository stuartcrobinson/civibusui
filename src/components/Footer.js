import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Contact
            </Link>
            <Link to="/methodology" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Methodology
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Civibus</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;