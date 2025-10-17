import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <Link to="/" className="text-2xl font-serif text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" style={{ fontFamily: "'Times New Roman', serif", fontWeight: 'bold' }}>
          Civibus
        </Link>
      </div>
    </header>
  );
}

export default Header;