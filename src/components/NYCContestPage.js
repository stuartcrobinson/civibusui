import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { logEvent } from '../utils/analytics';
import { CampaignLineChart, SegmentedBarChart } from './CampaignCharts';
import { useNYCContestData } from '../hooks/useNYCData';
import Header from './Header';
import Footer from './Footer';
import {
  transformNYCFundraisingTimeline,
  transformNYCExpenditureTimeline,
  transformNYCCashOnHandTimeline,
  transformNYCBarChart,
  transformNYCRefundsChart,
  transformAbsoluteBarChart,
  NYC_SIZE_COLORS,
  NYC_SIZE_ORDER,
  NYC_LOCATION_COLORS,
  NYC_LOCATION_ORDER,
  NYC_BOROUGH_COLORS,
  NYC_BOROUGH_ORDER,
  NYC_REALESTATE_COLORS,
  NYC_REALESTATE_ORDER
} from '../utils/transformNYCChartData';

// Map candidate_id to categories (Primary/General election)
const MAYOR_CANDIDATE_CATEGORIES = {
  183: ['primary', 'general'], // Mamdani, Zohran K
  70: ['primary', 'general'],  // Cuomo, Andrew M
  160: ['primary'],            // Lander, Brad
  292: ['primary'],            // Stringer, Scott M
  27: ['primary'],             // Bartholomew, Dr. Selma K
  4: ['primary'],              // Adams, Adrienne E
  299: ['primary'],            // Tilson, Whitney R
  35: ['primary'],             // Blake, Michael A
  237: ['primary'],            // Prince, Paperboy L
  280: ['general'],            // Sliwa, Curtis A
  90: ['general'],             // Estrada, Irene
  134: ['general'],            // Hernandez, Joseph
  5: ['general'],              // Adams, Eric L
  309: ['general'],            // Walden, James
  12: ['general']              // Anglade, Jean h
};

function NYCContestPage() {
  const { contestSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('fundraising');
  
  const isMayorRace = contestSlug === 'mayor';
  
  const { data, loading, error } = useNYCContestData(contestSlug);

  // Derive candidate lists from data (Mayor only)
  const mayorCandidates = useMemo(() => {
    if (!isMayorRace || !data?.fundraisingTimeline) return null;
    
    const candidateMap = new Map();
    data.fundraisingTimeline.forEach(row => {
      const id = row.candidate_id;
      if (!candidateMap.has(id)) {
        candidateMap.set(id, row.candidate_name);
      }
    });
    
    const all = Array.from(candidateMap.entries())
      .map(([id, name]) => ({ id: parseInt(id), name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    const primary = all.filter(c => MAYOR_CANDIDATE_CATEGORIES[c.id]?.includes('primary'));
    const general = all.filter(c => MAYOR_CANDIDATE_CATEGORIES[c.id]?.includes('general'));
    
    return {
      all: all.map(c => c.name),
      primary: primary.map(c => c.name),
      general: general.map(c => c.name)
    };
  }, [isMayorRace, data?.fundraisingTimeline]);

  // Candidate filtering (Mayor only)
  const [selectedCandidates, setSelectedCandidates] = useState(null);
  
  // Initialize selected candidates after data loads
  useEffect(() => {
    if (!isMayorRace || !mayorCandidates) return;
    
    const excluded = searchParams.get('excluded');
    if (excluded !== null) {
      const excludedSet = new Set(excluded.split(',').map(decodeURIComponent));
      setSelectedCandidates(new Set(mayorCandidates.all.filter(name => !excludedSet.has(name))));
    } else {
      // Default to general election candidates
      setSelectedCandidates(new Set(mayorCandidates.general.length > 0 ? mayorCandidates.general : mayorCandidates.all));
    }
  }, [isMayorRace, mayorCandidates]);

  // Sync URL with selected candidates
  useEffect(() => {
    if (!isMayorRace || !selectedCandidates || !mayorCandidates) return;
    
    const excluded = mayorCandidates.all.filter(name => !selectedCandidates.has(name));
    if (excluded.length > 0) {
      setSearchParams({ 
        excluded: excluded.map(encodeURIComponent).join(',') 
      }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedCandidates, isMayorRace, mayorCandidates, setSearchParams]);

  // Filter helper
  const filterByCandidates = (rows) => {
    if (!rows || !isMayorRace || !selectedCandidates) return rows;
    return rows.filter(row => selectedCandidates.has(row.candidate_name));
  };

  useEffect(() => {
    if (data?.officeSought) {
      document.title = `Civibus - NYC ${data.officeSought}`;
      logEvent('NYC Contest Page', 'View', data.officeSought);
    }
  }, [data?.officeSought]);

  const fundraisingTimelineData = useMemo(() => 
    transformNYCFundraisingTimeline(filterByCandidates(data?.fundraisingTimeline)),
    [data?.fundraisingTimeline, selectedCandidates]
  );

  const expenditureTimelineData = useMemo(() => 
    transformNYCExpenditureTimeline(filterByCandidates(data?.expenditureTimeline)),
    [data?.expenditureTimeline, selectedCandidates]
  );

  const cashOnHandTimelineData = useMemo(() => 
    transformNYCCashOnHandTimeline(filterByCandidates(data?.cashOnHandTimeline)),
    [data?.cashOnHandTimeline, selectedCandidates]
  );

  const donationsBySizeData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(filterByCandidates(data?.donationsBySize), 'size_bucket', NYC_SIZE_COLORS, NYC_SIZE_ORDER),
      true
    ),
    [data?.donationsBySize, selectedCandidates]
  );

  const donationsByLocationData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(filterByCandidates(data?.donationsByLocation), 'location_bucket', NYC_LOCATION_COLORS, NYC_LOCATION_ORDER, 'total_amount'),
      false
    ),
    [data?.donationsByLocation, selectedCandidates]
  );

  const donationsByBoroughData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(filterByCandidates(data?.donationsByBorough), 'borough', NYC_BOROUGH_COLORS, NYC_BOROUGH_ORDER),
      true
    ),
    [data?.donationsByBorough, selectedCandidates]
  );

  const donationsByRealEstateData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(filterByCandidates(data?.donationsByRealEstate), 'industry_type', NYC_REALESTATE_COLORS, NYC_REALESTATE_ORDER, 'total_amount'),
      false
    ),
    [data?.donationsByRealEstate, selectedCandidates]
  );

  const refundsData = useMemo(() => 
    transformNYCRefundsChart(filterByCandidates(data?.refunds)),
    [data?.refunds, selectedCandidates]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100 text-xl">Loading contest data...</div>
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100 text-xl">No data available</div>
      </div>
    );
  }

  const tabs = [
    { id: 'fundraising', label: 'Fundraising Timeline', icon: '📈' },
    { id: 'expenditures', label: 'Expenditures', icon: '💸' },
    { id: 'cashOnHand', label: 'Cash on Hand', icon: '💰' },
    { id: 'size', label: 'Donation Size', icon: '📊' },
    { id: 'location', label: 'Location (3-Tier)', icon: '🗺️' },
    { id: 'borough', label: 'NYC Boroughs', icon: '🏙️' },
    { id: 'realEstate', label: 'Real Estate', icon: '🏢' },
    { id: 'refunds', label: 'Refunds', icon: '↩️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {data.officeSought}
          </h1>
          <Link 
            to="/nyc" 
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
          >
            NYC Campaign Finance 2025
          </Link>
        </div>

        {/* Candidate Filters (Mayor only) */}
        {isMayorRace && mayorCandidates && selectedCandidates && (
          <div className="mb-6 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCandidates(new Set(mayorCandidates.all))}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  selectedCandidates.size === mayorCandidates.all.length
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setSelectedCandidates(new Set(mayorCandidates.primary))}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  selectedCandidates.size === mayorCandidates.primary.length &&
                  mayorCandidates.primary.every(n => selectedCandidates.has(n))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                PRIMARY
              </button>
              <button
                onClick={() => setSelectedCandidates(new Set(mayorCandidates.general))}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  selectedCandidates.size === mayorCandidates.general.length &&
                  mayorCandidates.general.every(n => selectedCandidates.has(n))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                GENERAL ELECTION
              </button>
            </div>

            <details className="border border-gray-300 dark:border-gray-600 rounded p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                Individual Candidate Selection
              </summary>
              <div className="mt-4 space-y-2">
                {selectedCandidates.size < mayorCandidates.all.length && (
                  <button
                    onClick={() => setSelectedCandidates(new Set(mayorCandidates.all))}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Select All
                  </button>
                )}
                <div className="flex flex-wrap gap-2">
                  {mayorCandidates.all.map(name => {
                    const isSelected = selectedCandidates.has(name);
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          const next = new Set(selectedCandidates);
                          if (isSelected) next.delete(name);
                          else next.add(name);
                          setSelectedCandidates(next);
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          isSelected
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 line-through opacity-50'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-300 dark:border-gray-600">
          <div className="flex flex-wrap gap-2 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  logEvent('NYC Tab', 'Click', `${data.officeSought} - ${tab.label}`);
                }}
                className={`
                  px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-300 dark:border-gray-600">
          {activeTab === 'fundraising' && (
            <CampaignLineChart
              data={fundraisingTimelineData}
              title="Cumulative Fundraising Over Time"
              yAxisLabel="Total Raised ($)"
              xAxisLabel="Week Starting"
              showLocalFilters={false}
              showExport={false}
              showDatePresets={true}
              showPublicPrivateToggles={true}
            />
          )}

          {activeTab === 'expenditures' && (
            <CampaignLineChart
              data={expenditureTimelineData}
              title="Cumulative Expenditures Over Time"
              yAxisLabel="Total Spent ($)"
              xAxisLabel="Week Starting"
              showLocalFilters={false}
              showExport={false}
              showDatePresets={true}
            />
          )}

          {activeTab === 'cashOnHand' && (
            <CampaignLineChart
              data={cashOnHandTimelineData}
              title="Cash on Hand Over Time"
              yAxisLabel="Available Funds ($)"
              xAxisLabel="Week Starting"
              showLocalFilters={false}
              showExport={false}
              showDatePresets={true}
            />
          )}

          {activeTab === 'size' && (
            <SegmentedBarChart
              data={donationsBySizeData}
              title="Donations by Size"
              legendLabel="Donation Size"
              legendOrder={NYC_SIZE_ORDER}
              segmentOrder={NYC_SIZE_ORDER}
              showLocalFilters={false}
              showExport={false}
              hideEndLabels={false}
              xAxisLabel="Number of Donations"
              rightLabelSuffix=" donations"
            />
          )}

          {activeTab === 'location' && (
            <SegmentedBarChart
              data={donationsByLocationData}
              title="Donations by Location (3-Tier)"
              legendLabel="Location"
              legendOrder={NYC_LOCATION_ORDER}
              segmentOrder={NYC_LOCATION_ORDER}
              showLocalFilters={false}
              showExport={false}
              hideEndLabels={false}
              xAxisLabel="Total Amount"
            />
          )}

          {activeTab === 'borough' && (
            <SegmentedBarChart
              data={donationsByBoroughData}
              title="NYC Donations by Borough"
              legendLabel="Borough"
              legendOrder={NYC_BOROUGH_ORDER}
              segmentOrder={NYC_BOROUGH_ORDER}
              showLocalFilters={false}
              showExport={false}
              hideEndLabels={false}
              xAxisLabel="Number of Donations"
              rightLabelSuffix=" donations"
            />
          )}

          {activeTab === 'realEstate' && (
            <SegmentedBarChart
              data={donationsByRealEstateData}
              title="Real Estate Industry Donations"
              legendLabel="Industry"
              legendOrder={NYC_REALESTATE_ORDER}
              segmentOrder={NYC_REALESTATE_ORDER}
              showLocalFilters={false}
              showExport={false}
              hideEndLabels={false}
              xAxisLabel="Total Amount"
            />
          )}

          {activeTab === 'refunds' && (
            <SegmentedBarChart
              data={refundsData}
              title="Refunded/Returned Contributions"
              showLocalFilters={false}
              showExport={false}
              hideEndLabels={false}
              xAxisLabel="Total Refunded"
            />
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Data notes:</strong> All charts show campaign finance data from January 2022 onward. 
            Public funding amounts are shown separately in the fundraising timeline where applicable.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NYCContestPage;