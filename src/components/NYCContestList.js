import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchNYCContests } from '../hooks/useNYCData';
import Header from './Header';
import Footer from './Footer';
import { logEvent } from '../utils/analytics';

function NYCContestList() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'Civibus - NYC 2025';
  }, []);

  useEffect(() => {
    async function loadContests() {
      try {
        const data = await fetchNYCContests();
        
        // Sort contests by hierarchy
        const sorted = data.sort((a, b) => {
          const hierarchy = {
            'Mayor': 1,
            'Comptroller': 2,
            'Public Advocate': 3,
            'Manhattan Boro President': 4,
            'Bronx Boro President': 5,
            'Brooklyn Boro President': 6,
            'Queens Boro President': 7,
            'Staten Island Boro President': 8
          };
          
          const aRank = hierarchy[a.office_sought] || 999;
          const bRank = hierarchy[b.office_sought] || 999;
          
          if (aRank !== bRank) return aRank - bRank;
          
          // City Council districts sorted numerically
          if (a.office_sought.startsWith('City Council District') && 
              b.office_sought.startsWith('City Council District')) {
            const aNum = parseInt(a.office_sought.match(/\d+/)?.[0] || '999');
            const bNum = parseInt(b.office_sought.match(/\d+/)?.[0] || '999');
            return aNum - bNum;
          }
          
          return a.office_sought.localeCompare(b.office_sought);
        });
        
        setContests(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadContests();
  }, []);

  const formatDollars = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const handleContestClick = (officeSought) => {
    logEvent('NYC Contest Selection', 'Click', officeSought);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      logEvent('Search', 'NYC Contest Filter', term);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100 text-xl">Loading NYC contests...</div>
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

  const filteredContests = contests.filter(contest =>
    contest.office_sought.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const amounts = filteredContests.map(c => c.total_raised || 0);
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          2025 NYC Campaign Finance
        </h1>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Select a race to view campaign finance data for NYC municipal elections.
        </p>

        <input
          type="text"
          placeholder="Filter races..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 mb-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContests.map((contest) => {
            const slug = contest.office_sought.toLowerCase().replace(/\s+/g, '-');
            const amount = contest.total_raised || 0;
            const bgColor = getHeatmapColor(amount, minAmount, maxAmount);
            const textColor = amount > (minAmount + maxAmount) / 2 ? 'white' : 'black';
            
            return (
              <Link
                key={contest.office_sought}
                to={`/nyc/${slug}`}
                onClick={() => handleContestClick(contest.office_sought)}
                className="block p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                style={{ backgroundColor: bgColor }}
              >
                <h2 className="text-xl font-semibold mb-2" style={{ color: textColor }}>
                  {contest.office_sought}
                </h2>
                <p className="text-sm mb-1" style={{ color: textColor, opacity: 0.9 }}>
                  {contest.num_candidates} {contest.num_candidates === 1 ? 'candidate' : 'candidates'}
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

export default NYCContestList;