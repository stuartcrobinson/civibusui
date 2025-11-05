// /Users/stuart/repos/civibusui/src/components/CityPage.js

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { logEvent } from '../utils/analytics';
import { updateMetaTags } from '../utils/metaTags';
import { CampaignLineChart, SegmentedBarChart, FilterControls } from './CampaignCharts';
import CandidateSelector from './CandidateSelector';
import CandidateFinancialDetails from './CandidateFinancialDetails';
import { useCityData } from '../hooks/useCityData';
import Header from './Header';
import Footer from './Footer';
import {
  transformBarChart,
  transformLineChart,
  normalizeToPercentages,
  extractCandidateData,
  transformTotalDonationsChart,
  transformTotalDonationsWithSelfChart,
  transformAbsoluteBarChart,
  SIZE_COLORS,
  SIZE_ORDER,
  REALESTATE_COLORS,
  REALESTATE_ORDER
} from '../utils/transformChartData';

function CityPage() {
  const { geoName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const cityName = geoName.replace(/_/g, ' ').toUpperCase();
  
  const cityNameTitleCase = useMemo(() => {
    return cityName.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }, [cityName]);

  // Set page title and meta tags
  useEffect(() => {
    updateMetaTags({
      title: `Civibus - ${cityNameTitleCase}`,
      description: `Campaign Finance\n${cityNameTitleCase}`,
      url: window.location.href
    });
  }, [cityNameTitleCase]);

  // Track page view
  useEffect(() => {
    logEvent('City Page', 'View', cityNameTitleCase);
  }, [cityNameTitleCase]);
  
  const LOCATION_ORDER = useMemo(() => [
    'Unmarked b/c ≤ $50',
    `In ${cityNameTitleCase}`,
    `In NC (not ${cityNameTitleCase})`,
    'Out of State',
    'Unknown'
  ], [cityNameTitleCase]);
  
  const { data, loading, error } = useCityData(cityName);

  const [globalFilterActive, setGlobalFilterActive] = useState(false);
  const [globalActiveFilter, setGlobalActiveFilter] = useState('all');
  const [globalHoveredFilter, setGlobalHoveredFilter] = useState(null);

  const [chartFilters, setChartFilters] = useState({
    timeline: 'all',
    location: 'all',
    locationAbsolute: 'all',
    locationCount: 'all',
    locationCountAbsolute: 'all',
    size: 'all',
    sizeAbsolute: 'all',
    realestate: 'all',
    realestateCount: 'all',
    realestateAbsolute: 'all',
    totalDonations: 'all',
    totalDonationsWithSelf: 'all'
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
      locationAbsolute: filterId,
      locationCount: filterId,
      locationCountAbsolute: filterId,
      size: filterId,
      sizeAbsolute: filterId,
      realestate: filterId,
      realestateCount: filterId,
      realestateAbsolute: filterId,
      totalDonations: filterId,
      totalDonationsWithSelf: filterId
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
    console.log('=== FILTER DEBUG ===');
    console.log('Muted candidates:', Array.from(mutedCandidates));
    console.log('Sample row:', rows[0]);
    console.log('Row has candidate_name?', rows[0]?.candidate_name);
    console.log('Before filter:', rows.length);
    const filtered = rows.filter(row => !mutedCandidates.has(row.candidate_name));
    console.log('After filter:', filtered.length);
    console.log('===================');
    return filtered;
  };

  const allCandidates = useMemo(() => {
    if (!data || !data.allCandidates) return [];
    const candidateMap = new Map();
    data.allCandidates.forEach(row => {
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

  // Transform data with candidate filtering - wrapped in useMemo to trigger re-renders
  const locationRaw = useMemo(() => 
    transformBarChart(filterBySelectedCandidates(data?.location), 'location_bucket', null, null, cityName),
    [data?.location, mutedCandidates, cityName]
  );
  const locationData = useMemo(() => normalizeToPercentages(locationRaw, false), [locationRaw]);
  const locationAbsoluteData = useMemo(() => transformAbsoluteBarChart(locationRaw, false), [locationRaw]);
  
  const locationCountRaw = useMemo(() => 
    transformBarChart(filterBySelectedCandidates(data?.locationCount), 'location_bucket', null, null, cityName),
    [data?.locationCount, mutedCandidates, cityName]
  );
  const locationCountData = useMemo(() => normalizeToPercentages(locationCountRaw, true), [locationCountRaw]);
  const locationCountAbsoluteData = useMemo(() => transformAbsoluteBarChart(locationCountRaw, true), [locationCountRaw]);
  
  const sizeRaw = useMemo(() => 
    transformBarChart(filterBySelectedCandidates(data?.size), 'size_bucket', SIZE_COLORS, SIZE_ORDER, cityName),
    [data?.size, mutedCandidates, cityName]
  );
  const sizeData = useMemo(() => normalizeToPercentages(sizeRaw, true), [sizeRaw]);
  const sizeAbsoluteData = useMemo(() => transformAbsoluteBarChart(sizeRaw, true), [sizeRaw]);
  
  const realEstateRaw = useMemo(() => 
    transformBarChart(filterBySelectedCandidates(data?.realestate), 're_bucket', REALESTATE_COLORS, REALESTATE_ORDER, cityName),
    [data?.realestate, mutedCandidates, cityName]
  );
  const realEstateData = useMemo(() => normalizeToPercentages(realEstateRaw, false), [realEstateRaw]);
  const realEstateCountRaw = useMemo(() => 
    transformBarChart(filterBySelectedCandidates(data?.realestateCount), 're_bucket', REALESTATE_COLORS, REALESTATE_ORDER, cityName),
    [data?.realestateCount, mutedCandidates, cityName]
  );
  const realEstateCountData = useMemo(() => normalizeToPercentages(realEstateCountRaw, true), [realEstateCountRaw]);
  const realEstateAbsoluteData = useMemo(() => transformAbsoluteBarChart(realEstateRaw, false), [realEstateRaw]);
  
  const timelineData = useMemo(() => 
    transformLineChart(filterBySelectedCandidates(data?.timeline)),
    [data?.timeline, mutedCandidates]
  );
  const fundraisingTimelineData = useMemo(() => 
    transformLineChart(filterBySelectedCandidates(data?.fundraisingTimeline)),
    [data?.fundraisingTimeline, mutedCandidates]
  );
  const expenditureTimelineData = useMemo(() => 
    transformLineChart(filterBySelectedCandidates(data?.expenditureTimeline)),
    [data?.expenditureTimeline, mutedCandidates]
  );
  const cashOnHandTimelineData = useMemo(() => 
    transformLineChart(filterBySelectedCandidates(data?.cashOnHandTimeline)),
    [data?.cashOnHandTimeline, mutedCandidates]
  );
  
  const totalDonationsRaw = useMemo(() => 
    transformTotalDonationsChart(filterBySelectedCandidates(data?.totalDonations)),
    [data?.totalDonations, mutedCandidates]
  );
  const totalDonationsData = useMemo(() => transformAbsoluteBarChart(totalDonationsRaw, false), [totalDonationsRaw]);
  
  const totalDonationsWithSelfRaw = useMemo(() => 
    transformTotalDonationsWithSelfChart(filterBySelectedCandidates(data?.totalDonationsWithSelf)),
    [data?.totalDonationsWithSelf, mutedCandidates]
  );
  const totalDonationsWithSelfData = useMemo(() => transformAbsoluteBarChart(totalDonationsWithSelfRaw, false), [totalDonationsWithSelfRaw]);
  
  const candidateData = useMemo(() => extractCandidateData(locationData), [locationData]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Global Filter Controls */}
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-30 py-4 border-b-2 border-gray-300 dark:border-gray-600 -mx-8 px-8">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            2025 {cityName} Campaign Finance
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Last updated: 10/24/2025
            {/* Last updated: {data.lastUpdated} */}
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <CampaignLineChart
            data={fundraisingTimelineData}
            title="Cumulative Fundraising Over Time"
            yAxisLabel="Total Raised ($)"
            xAxisLabel="Week Starting (2025)"
            activeFilter={chartFilters.timeline}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('timeline', filterId)}
            showLocalFilters={false}
            showExport={false}
          />
        </div>

        {/* Expenditure Timeline Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <CampaignLineChart
            data={expenditureTimelineData}
            title="Cumulative Expenditures Over Time"
            yAxisLabel="Total Spent ($)"
            xAxisLabel="Week Starting (2025)"
            activeFilter={chartFilters.timeline}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('timeline', filterId)}
            showLocalFilters={false}
            showExport={false}
          />
        </div>

        {/* Cash on Hand Timeline Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <CampaignLineChart
            data={cashOnHandTimelineData}
            title="Cash on Hand Over Time"
            yAxisLabel="Available Funds ($)"
            xAxisLabel="Week Starting (2025)"
            activeFilter={chartFilters.timeline}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('timeline', filterId)}
            showLocalFilters={false}
            showExport={false}
          />
        </div>

        {/* Total Donations Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            key={`total-donations-${Array.from(mutedCandidates).sort().join(',')}`}
            data={totalDonationsData}
            title="Total Fundraising by Candidate"
            legendLabel="Fundraising"
            activeFilter={chartFilters.totalDonations}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('totalDonations', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={false}
            xAxisLabel="Amount Raised"

          />
        </div>

        {/* Total Donations Bar Chart - With Self-Funding */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            key={`total-donations-self-${Array.from(mutedCandidates).sort().join(',')}`}
            data={totalDonationsWithSelfData}
            title="Total Fundraising by Candidate (Self vs Other)"
            legendLabel="Funding Source"
            legendOrder={['Self-Funded','Other Donations']}
            legendColorMap={{ 'Other Donations': '#3b82f6', 'Self-Funded': '#93c5fd' }}
            segmentOrder={['Self-Funded','Other Donations']}
            activeFilter={chartFilters.totalDonationsWithSelf}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('totalDonationsWithSelf', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={false}
          />
        </div>
        {/* Location Bar Chart - By Dollar Amount */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            data={locationData}
            title="Fundraising by Donor Location (by Dollar Amount)"
            legendLabel="Donor Locations"
            legendOrder={LOCATION_ORDER}
            segmentOrder={LOCATION_ORDER}
            activeFilter={chartFilters.location}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('location', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={true}
          />
        </div>

        {/* Location Bar Chart - By Dollar Amount (Absolute) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            data={locationAbsoluteData}
            title="Fundraising by Donor Location (by Dollar Amount, Absolute)"
            legendLabel="Donor Locations"
            legendOrder={LOCATION_ORDER}
            segmentOrder={LOCATION_ORDER}
            activeFilter={chartFilters.locationAbsolute}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('locationAbsolute', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={false}
          />
        </div>

        {/* Location Bar Chart - By Donation Count */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            data={locationCountData}
            title="Fundraising by Donor Location (by Number of Donations)"
            legendLabel="Donor Locations"
            legendOrder={LOCATION_ORDER}
            segmentOrder={LOCATION_ORDER}
            activeFilter={chartFilters.locationCount}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('locationCount', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={true}
          />
        </div>

        {/* Location Bar Chart - By Donation Count (Absolute) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            data={locationCountAbsoluteData}
            title="Fundraising by Donor Location (by Number of Donations, Absolute)"
            legendLabel="Donor Locations"
            legendOrder={LOCATION_ORDER}
            segmentOrder={LOCATION_ORDER}
            activeFilter={chartFilters.locationCountAbsolute}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('locationCountAbsolute', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={false}
          />
        </div>

        {/* Size Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            data={sizeData}
            title="Fundraising by Donation Size (by Number of Donations)"
            legendLabel="Contribution Sizes"
            legendOrder={SIZE_ORDER}
            segmentOrder={SIZE_ORDER}
            activeFilter={chartFilters.size}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('size', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={true}
          />
        </div>

        {/* Size Bar Chart - Absolute Donation Count */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            data={sizeAbsoluteData}
            title="Number of Donations by Size"
            legendLabel="Contribution Sizes"
            legendOrder={SIZE_ORDER}
            segmentOrder={SIZE_ORDER}
            activeFilter={chartFilters.sizeAbsolute}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('sizeAbsolute', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={false}
            xAxisLabel="Number of Donations"
            rightLabelSuffix=" donations"
          />
        </div>

        {/* Real Estate Bar Chart - By Dollar Amount */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            data={realEstateData}
            title="Real Estate as % of Total Fundraising (by Dollar Amount)"
            legendLabel="Source"
            legendOrder={REALESTATE_ORDER}
            segmentOrder={REALESTATE_ORDER}
            activeFilter={chartFilters.realestate}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('realestate', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={true}
          />
        </div>

        {/* Real Estate Bar Chart - Absolute Dollar Amount */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            data={realEstateAbsoluteData}
            title="Real Estate Fundraising by Dollar Amount (Absolute Values)"
            legendLabel="Source"
            legendOrder={REALESTATE_ORDER}
            segmentOrder={REALESTATE_ORDER}
            activeFilter={chartFilters.realestateAbsolute}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('realestateAbsolute', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={false}
          />
        </div>

        {/* Real Estate Bar Chart - By Donation Count */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          <SegmentedBarChart
            data={realEstateCountData}
            title="Real Estate as % of Total Donations (by Number of Donations)"
            legendLabel="Source"
            legendOrder={REALESTATE_ORDER}
            segmentOrder={REALESTATE_ORDER}
            activeFilter={chartFilters.realestateCount}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('realestateCount', filterId)}
            showLocalFilters={false}
            showExport={false}
            hideEndLabels={true}
          />
        </div>

        {/* Candidate Financial Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
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
              <strong>Data notes:</strong> All charts show only new donations received from January 1, 2025 onward, 
              excluding starting cash on hand.
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
      <Footer />
    </div>
  );
}

export default CityPage;