import React from 'react';
import { Link } from 'react-router-dom';
import packageJson from '../../package.json';

function Header() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-2xl font-serif text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" style={{ fontFamily: "'Times New Roman', serif", fontWeight: 'bold' }}>
            Civibus
          </Link>
          {isLocalhost && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              v{packageJson.version}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;