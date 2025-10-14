import React, { useState } from 'react';
import './App.css';
import { CampaignLineChart, SegmentedBarChart, FilterControls } from './components/CampaignCharts';
import durhamData from './data/durham.json';

const pageConfig = {
  year: '2025',
  location: 'Durham',
  title: '2025 Durham Campaign Finance'
};

// Sort bar chart data by total value descending
function sortByTotal(data) {
  return [...data].sort((a, b) => {
    const aTotal = a.segments.reduce((sum, seg) => sum + seg.value, 0);
    const bTotal = b.segments.reduce((sum, seg) => sum + seg.value, 0);
    return bTotal - aTotal;
  });
}

// Extract unique candidate metadata for global filters
function extractCandidateData(data) {
  return data.map(c => ({
    position: c.position,
    subregion_value: c.subregion_value
  }));
}

function App() {
  const [globalFilterActive, setGlobalFilterActive] = useState(false);
  const [globalActiveFilter, setGlobalActiveFilter] = useState('all');
  const [globalHoveredFilter, setGlobalHoveredFilter] = useState(null);

  const [chartFilters, setChartFilters] = useState({
    timeline: 'all',
    industry: 'all',
    location: 'all',
    size: 'all'
  });

  // Prepare data
  const timelineData = durhamData.timeline;
  const industryData = sortByTotal(durhamData.industry);
  const locationData = sortByTotal(durhamData.location);
  const sizeData = sortByTotal(durhamData.size);
  const candidateData = extractCandidateData(durhamData.industry);

  const handleGlobalFilterClick = (filterId) => {
    setGlobalFilterActive(true);
    setGlobalActiveFilter(filterId);
    setChartFilters({
      timeline: filterId,
      industry: filterId,
      location: filterId,
      size: filterId
    });
  };

  const handleGlobalFilterHover = (filterId) => {
    setGlobalHoveredFilter(filterId);
  };

  const handleChartFilterChange = (chartId, filterId) => {
    setGlobalFilterActive(false);
    setChartFilters(prev => ({
      ...prev,
      [chartId]: filterId
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        {/* Global Filter Controls */}
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-30 py-4 border-b-2 border-gray-300 dark:border-gray-600">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {pageConfig.title}
          </div>
          <FilterControls
            data={candidateData}
            activeFilter={globalFilterActive ? globalActiveFilter : 'all'}
            hoveredFilter={globalHoveredFilter}
            onFilterClick={handleGlobalFilterClick}
            onFilterHover={handleGlobalFilterHover}
            isInactive={!globalFilterActive}
          />
        </div>

        <p className="text-gray-700 dark:text-gray-300">
          Campaign finance data for Durham municipal races. Use global filters above to compare 
          all charts simultaneously, or interact with individual chart filters for independent analysis.
        </p>

        {/* Timeline Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <CampaignLineChart
            data={timelineData}
            title="Cumulative Fundraising Over Time"
            yAxisLabel="Total Cash on Hand ($)"
            xAxisLabel="Week Starting"
            activeFilter={chartFilters.timeline}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('timeline', filterId)}
            showLocalFilters={true}
            showExport={true}
          />
        </div>

        {/* Industry Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart
            data={industryData}
            title="Fundraising by Donor Industry"
            legendLabel="Donor Industries"
            activeFilter={chartFilters.industry}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('industry', filterId)}
            showLocalFilters={true}
            showExport={true}
          />
        </div>

        {/* Location Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart
            data={locationData}
            title="Fundraising by Donor Location"
            legendLabel="Donor Locations"
            activeFilter={chartFilters.location}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('location', filterId)}
            showLocalFilters={true}
            showExport={true}
          />
        </div>

        {/* Size Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart
            data={sizeData}
            title="Fundraising by Donation Size"
            legendLabel="Contribution Sizes"
            activeFilter={chartFilters.size}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('size', filterId)}
            showLocalFilters={true}
            showExport={true}
          />
        </div>

        <div className="mt-8 space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Data notes:</strong> Amounts include starting cash on hand and all receipts 
              from June 1, 2025 onward. Industry categorization covers ~68.5% of donations; 
              unmatched contributions appear in Other/Unknown.
            </p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
            <p className="text-sm text-red-900 dark:text-red-100">
              <strong>Warning:</strong> Anjanee Bell is weeks behind on submitting multiple 
              required campaign finance reports. Her fundraising data displayed here is incomplete 
              and unreliable.
            </p>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
              <strong>Data sources:</strong>
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>
                • <a href="https://www.ncsbe.gov/results-data/candidate-lists" 
                     className="text-blue-600 dark:text-blue-400 hover:underline" 
                     target="_blank" rel="noopener noreferrer">
                  NC State Board of Elections - Candidate Lists
                </a>
              </li>
              <li>
                • <a href="https://www.ncsbe.gov/campaign-finance/reporting-schedules/municipal-election-reporting-schedule" 
                     className="text-blue-600 dark:text-blue-400 hover:underline" 
                     target="_blank" rel="noopener noreferrer">
                  NCSBE - Municipal Election Reporting Schedule
                </a>
              </li>
              <li>
                • <a href="https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/" 
                     className="text-blue-600 dark:text-blue-400 hover:underline" 
                     target="_blank" rel="noopener noreferrer">
                  Durham County BOE - Campaign Finance Files
                </a>
              </li>
              <li>
                • <a href="https://cf.ncsbe.gov/CFDocLkup" 
                     className="text-blue-600 dark:text-blue-400 hover:underline" 
                     target="_blank" rel="noopener noreferrer">
                  NCSBE - Campaign Finance Document Lookup
                </a>
              </li>
              <li>
                • <a href="https://cf.ncsbe.gov/CFOrgLkup" 
                     className="text-blue-600 dark:text-blue-400 hover:underline" 
                     target="_blank" rel="noopener noreferrer">
                  NCSBE - Campaign Finance Organization Lookup
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;