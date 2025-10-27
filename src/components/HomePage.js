import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCities } from '../hooks/useCityData';
import Header from './Header';
import Footer from './Footer';
import { logEvent } from '../utils/analytics';

function HomePage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getHeatmapColor = (amount, minAmount, maxAmount) => {
    if (maxAmount === minAmount) {
      return 'rgb(144, 202, 249)';
    }
    
    const ratio = (amount - minAmount) / (maxAmount - minAmount);
    
    const lightColor = '#eaf1f8ff';
    const darkColor = '#0054b5ff';
    
    const light = {
      r: parseInt(lightColor.slice(1, 3), 16),
      g: parseInt(lightColor.slice(3, 5), 16),
      b: parseInt(lightColor.slice(5, 7), 16)
    };
    
    const dark = {
      r: parseInt(darkColor.slice(1, 3), 16),
      g: parseInt(darkColor.slice(3, 5), 16),
      b: parseInt(darkColor.slice(5, 7), 16)
    };
    
    const r = Math.round(light.r + ratio * (dark.r - light.r));
    const g = Math.round(light.g + ratio * (dark.g - light.g));
    const b = Math.round(light.b + ratio * (dark.b - light.b));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const formatDollars = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const handleCityClick = (cityName) => {
    // Track city clicks
    logEvent('City Selection', 'Click', cityName);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    // Track search usage
    if (term.length > 2) {
      logEvent('Search', 'City Filter', term);
    }
  };

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

  const citiesWithData = cities.filter(city => city.has_data);
  const filteredCities = citiesWithData.filter(city => 
    city.geo_name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );
  const amounts = filteredCities.map(c => c.total_raised_2025 || 0);
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

  console.log('Search term:', `"${searchTerm}"`);
  console.log('Cities with data:', citiesWithData.length);
  console.log('Filtered cities:', filteredCities.length);
  console.log('Filtered city names:', filteredCities.map(c => c.geo_name));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          2025 North Carolina Municipal Campaign Finance
        </h1>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Select a city to view campaign finance data for municipal races.
        </p>

        <input
          type="text"
          placeholder="Filter cities..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 mb-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCities.map((city) => {
            const urlPath = city.geo_name.replace(/\s+/g, '_');
            const amount = city.total_raised_2025 || 0;
            const bgColor = getHeatmapColor(amount, minAmount, maxAmount);
            const textColor = amount > (minAmount + maxAmount) / 2 ? 'white' : 'black';
            
            return (
              <Link
                key={`${city.geo_name}-${city.geo_type}`}
                to={`/nc/${urlPath}`}
                onClick={() => handleCityClick(city.geo_name)}
                className="block p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                style={{ backgroundColor: bgColor }}
              >
                <h2 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
                  {city.geo_name}
                </h2>
                <p className="text-sm mb-1" style={{ color: textColor, opacity: 0.9 }}>
                  {city.geo_type} • {city.num_contests} {city.num_contests === 1 ? 'contest' : 'contests'} • {city.num_candidates_with_data} {city.num_candidates_with_data === 1 ? 'candidate' : 'candidates'}
                </p>
                <p className="text-lg font-bold" style={{ color: textColor }}>
                  {formatDollars(amount)} raised
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