import React from 'react';
import Header from './Header';
import Footer from './Footer';

function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Methodology
        </h1>
        
      </div>
      <Footer />
    </div>
  );
}

export default MethodologyPage;