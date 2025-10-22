import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCities } from '../hooks/useCityData';
import Header from './Header';
import Footer from './Footer';

function HomePage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCities() {
      try {
        const data = await fetchCities();
        setCities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadCities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100 text-xl">Loading cities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          2025 North Carolina Municipal Campaign Finance
        </h1>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          note - only Durham has been fact-checked
        </h1>
        
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          Select a city to view campaign finance data for municipal races.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.filter(city => city.has_data).map((city) => {
            const urlPath = city.geo_name.replace(/\s+/g, '_');
            
            return (
              <Link
                key={city.geo_name}
                to={`/geo_name/${urlPath}`}
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {city.geo_name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {city.geo_type} • {city.num_contests} {city.num_contests === 1 ? 'contest' : 'contests'}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;