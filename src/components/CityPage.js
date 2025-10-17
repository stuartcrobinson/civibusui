// /Users/stuart/repos/civibusui/src/components/CityPage.js

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CampaignLineChart, SegmentedBarChart, FilterControls } from './CampaignCharts';
import CandidateSelector from './CandidateSelector';
import CandidateFinancialDetails from './CandidateFinancialDetails';
import { useCityData } from '../hooks/useCityData';
import {
  transformBarChart,
  transformLineChart,
  normalizeToPercentages,
  extractCandidateData,
  transformTotalDonationsChart,
  SIZE_COLORS,
  SIZE_ORDER,
  REALESTATE_COLORS,
  REALESTATE_ORDER
} from '../utils/transformChartData';

function CityPage() {
  const { geoName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const cityName = geoName.replace(/_/g, ' ').toUpperCase();
  
  const { data, loading, error } = useCityData(cityName);

  const [globalFilterActive, setGlobalFilterActive] = useState(false);
  const [globalActiveFilter, setGlobalActiveFilter] = useState('all');
  const [globalHoveredFilter, setGlobalHoveredFilter] = useState(null);

  const [chartFilters, setChartFilters] = useState({
    timeline: 'all',
    location: 'all',
    locationCount: 'all',
    size: 'all',
    realestate: 'all',
    realestateCount: 'all',
    totalDonations: 'all'
  });

  const [mutedCandidates, setMutedCandidates] = useState(() => {
    const mutedParam = searchParams.get('muted');
    if (mutedParam) {
      return new Set(mutedParam.split(',').map(name => decodeURIComponent(name)));
    }
    return new Set();
  });

  // Sync URL with mutedCandidates state
  useEffect(() => {
    if (mutedCandidates.size > 0) {
      const mutedArray = Array.from(mutedCandidates);
      setSearchParams({ muted: mutedArray.map(name => encodeURIComponent(name)).join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [mutedCandidates, setSearchParams]);

  const handleGlobalFilterClick = (filterId) => {
    setGlobalFilterActive(true);
    setGlobalActiveFilter(filterId);
    setChartFilters({
      timeline: filterId,
      location: filterId,
      locationCount: filterId,
      size: filterId,
      realestate: filterId,
      realestateCount: filterId,
      totalDonations: filterId
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

  const toggleCandidate = (candidateName) => {
    setMutedCandidates(prev => {
      const next = new Set(prev);
      if (next.has(candidateName)) {
        next.delete(candidateName);
      } else {
        next.add(candidateName);
      }
      return next;
    });
  };

  const filterBySelectedCandidates = (rows) => {
    if (!rows) return rows;
    return rows.filter(row => !mutedCandidates.has(row.candidate_name));
  };

  const allCandidates = useMemo(() => {
    if (!data || !data.location) return [];
    const candidateMap = new Map();
    data.location.forEach(row => {
      if (!candidateMap.has(row.candidate_name)) {
        candidateMap.set(row.candidate_name, {
          name: row.candidate_name,
          position: row.position,
          subregion_value: row.subregion_value
        });
      }
    });
    return Array.from(candidateMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100 text-xl">Loading data for {cityName}...</div>
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

  if (!data || !data.location || data.location.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100 text-xl">No data available for {cityName}</div>
      </div>
    );
  }

  // Transform data with candidate filtering
  const locationRaw = transformBarChart(filterBySelectedCandidates(data.location), 'location_bucket', null, null, cityName);
  const locationData = normalizeToPercentages(locationRaw, false);
  const locationCountRaw = transformBarChart(filterBySelectedCandidates(data.locationCount), 'location_bucket', null, null, cityName);
  const locationCountData = normalizeToPercentages(locationCountRaw, true);
  const sizeRaw = transformBarChart(filterBySelectedCandidates(data.size), 'size_bucket', SIZE_COLORS, SIZE_ORDER, cityName);
  const sizeData = normalizeToPercentages(sizeRaw, true);
  const realEstateRaw = transformBarChart(filterBySelectedCandidates(data.realestate), 're_bucket', REALESTATE_COLORS, REALESTATE_ORDER, cityName);
  const realEstateData = normalizeToPercentages(realEstateRaw, false);
  const realEstateCountRaw = transformBarChart(filterBySelectedCandidates(data.realestateCount), 're_bucket', REALESTATE_COLORS, REALESTATE_ORDER, cityName);
  const realEstateCountData = normalizeToPercentages(realEstateCountRaw, true);
  const timelineData = transformLineChart(filterBySelectedCandidates(data.timeline));
  const expenditureTimelineData = transformLineChart(filterBySelectedCandidates(data.expenditureTimeline));
  const cashOnHandTimelineData = transformLineChart(filterBySelectedCandidates(data.cashOnHandTimeline));
  const totalDonationsData = transformTotalDonationsChart(filterBySelectedCandidates(data.totalDonations));
  const candidateData = extractCandidateData(locationData);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        {/* Global Filter Controls */}
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-30 py-4 border-b-2 border-gray-300 dark:border-gray-600">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            2025 {cityName} Campaign Finance
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Last updated: {data.lastUpdated}
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

        <CandidateSelector
          candidates={allCandidates}
          mutedCandidates={mutedCandidates}
          onToggleCandidate={toggleCandidate}
        />

        <p className="text-gray-700 dark:text-gray-300">
          Campaign finance data for {cityName} municipal races. Use global filters above to compare 
          all charts simultaneously, or interact with individual chart filters for independent analysis.
        </p>

        {/* Timeline Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <CampaignLineChart
            data={timelineData}
            title="Cumulative Fundraising Over Time"
            yAxisLabel="Total Raised ($)"
            xAxisLabel="Week Starting"
            activeFilter={chartFilters.timeline}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('timeline', filterId)}
            showLocalFilters={true}
            showExport={true}
          />
        </div>

        {/* Expenditure Timeline Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <CampaignLineChart
            data={expenditureTimelineData}
            title="Cumulative Expenditures Over Time"
            yAxisLabel="Total Spent ($)"
            xAxisLabel="Week Starting"
            activeFilter={chartFilters.timeline}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('timeline', filterId)}
            showLocalFilters={true}
            showExport={true}
          />
        </div>

        {/* Cash on Hand Timeline Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <CampaignLineChart
            data={cashOnHandTimelineData}
            title="Cash on Hand Over Time"
            yAxisLabel="Available Funds ($)"
            xAxisLabel="Week Starting"
            activeFilter={chartFilters.timeline}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('timeline', filterId)}
            showLocalFilters={true}
            showExport={true}
          />
        </div>

        {/* Total Donations Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart
            data={totalDonationsData}
            title="Total Fundraising by Candidate"
            legendLabel="Fundraising"
            activeFilter={chartFilters.totalDonations}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('totalDonations', filterId)}
            showLocalFilters={true}
            showExport={true}
            hideEndLabels={false}
          />
        </div>

        {/* Location Bar Chart - By Dollar Amount */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart
            data={locationData}
            title="Fundraising by Donor Location (by Dollar Amount)"
            legendLabel="Donor Locations"
            activeFilter={chartFilters.location}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('location', filterId)}
            showLocalFilters={true}
            showExport={true}
            hideEndLabels={true}
          />
        </div>

        {/* Location Bar Chart - By Donation Count */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart
            data={locationCountData}
            title="Fundraising by Donor Location (by Number of Donations)"
            legendLabel="Donor Locations"
            activeFilter={chartFilters.locationCount}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('locationCount', filterId)}
            showLocalFilters={true}
            showExport={true}
            hideEndLabels={true}
          />
        </div>

        {/* Size Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart
            data={sizeData}
            title="Fundraising by Donation Size (by Number of Donations)"
            legendLabel="Contribution Sizes"
            activeFilter={chartFilters.size}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('size', filterId)}
            showLocalFilters={true}
            showExport={true}
            hideEndLabels={true}
          />
        </div>

        {/* Real Estate Bar Chart - By Dollar Amount */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart
            data={realEstateData}
            title="Real Estate as % of Total Fundraising (by Dollar Amount)"
            legendLabel="Source"
            activeFilter={chartFilters.realestate}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('realestate', filterId)}
            showLocalFilters={true}
            showExport={true}
            hideEndLabels={true}
          />
        </div>

        {/* Real Estate Bar Chart - By Donation Count */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart
            data={realEstateCountData}
            title="Real Estate as % of Total Donations (by Number of Donations)"
            legendLabel="Source"
            activeFilter={chartFilters.realestateCount}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('realestateCount', filterId)}
            showLocalFilters={true}
            showExport={true}
            hideEndLabels={true}
          />
        </div>

        {/* Candidate Financial Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Detailed Financial Information
          </h2>
          <CandidateFinancialDetails
            topDonors={data.topDonors || []}
            topExpenditures={data.topExpenditures || []}
            topSpendingByRecipient={data.topSpendingByRecipient || []}
            mutedCandidates={mutedCandidates}
            allCandidates={allCandidates}
          />
        </div>

        <div className="mt-8 space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Data notes:</strong> Amounts include starting cash on hand and all receipts 
              from January 1, 2025 onward.
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
                • <a href="https://cf.ncsbe.gov/CFDocLkup" 
                     className="text-blue-600 dark:text-blue-400 hover:underline" 
                     target="_blank" rel="noopener noreferrer">
                  NCSBE - Campaign Finance Document Lookup
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CityPage;