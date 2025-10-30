import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { logEvent } from '../utils/analytics';
import { CampaignLineChart, SegmentedBarChart } from './CampaignCharts';
import { useNYCContestData, useNYCAggregateData } from '../hooks/useNYCData';
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

function NYCContestPage() {
  const { contestSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('fundraising');

  // Determine if this is an aggregate page
  const isAggregate = contestSlug === 'all-borough-presidents' || contestSlug === 'all-city-council';
  const aggregateType = contestSlug === 'all-borough-presidents' ? 'borough-presidents' : 
                        contestSlug === 'all-city-council' ? 'city-council' : null;
  
  console.log('[NYCContestPage] contestSlug:', contestSlug, 'isAggregate:', isAggregate, 'aggregateType:', aggregateType);

  // Load data from appropriate hook
  const contestHookResult = useNYCContestData(isAggregate ? null : contestSlug);
  const aggregateHookResult = useNYCAggregateData(isAggregate ? aggregateType : null);
  
  const data = isAggregate ? aggregateHookResult.data : contestHookResult.data;
  const loading = isAggregate ? aggregateHookResult.loading : contestHookResult.loading;
  const error = isAggregate ? aggregateHookResult.error : contestHookResult.error;

  // Page metadata
  const pageTitle = isAggregate 
    ? (aggregateType === 'borough-presidents' ? 'All Borough Presidents' : 'All City Council (Top 20)')
    : data?.officeSought;
  const pageIcon = isAggregate 
    ? (aggregateType === 'borough-presidents' ? '🏛️' : '🏙️')
    : null;

  // Derive candidate list from data
  const allCandidates = useMemo(() => {
    if (!data?.fundraisingTimeline) return [];
    const uniqueNames = [...new Set(data.fundraisingTimeline.map(row => row.candidate_name))];
    return uniqueNames.sort((a, b) => a.localeCompare(b));
  }, [data?.fundraisingTimeline]);

  // Derive office list for borough aggregate
  const allOffices = useMemo(() => {
    if (!isAggregate || aggregateType !== 'borough-presidents' || !data?.offices) return [];
    return data.offices.sort();
  }, [isAggregate, aggregateType, data?.offices]);

  // Candidate filtering state
  const [selectedCandidates, setSelectedCandidates] = useState(null);
  
  // Office filtering state (borough aggregate only)
  const [selectedOffices, setSelectedOffices] = useState(null);

  // Initialize selected candidates from URL
  useEffect(() => {
    if (allCandidates.length === 0) return;
    
    const excluded = searchParams.get('excluded');
    if (excluded !== null) {
      const excludedSet = new Set(excluded.split(',').map(decodeURIComponent).filter(Boolean));
      setSelectedCandidates(new Set(allCandidates.filter(name => !excludedSet.has(name))));
    } else {
      setSelectedCandidates(new Set(allCandidates));
    }
  }, [allCandidates, searchParams]);

  // Initialize selected offices from URL (borough aggregate only)
  useEffect(() => {
    if (allOffices.length === 0) return;
    
    const excludedOffices = searchParams.get('excludedOffices');
    if (excludedOffices !== null) {
      const excludedSet = new Set(excludedOffices.split(',').map(decodeURIComponent).filter(Boolean));
      setSelectedOffices(new Set(allOffices.filter(office => !excludedSet.has(office))));
    } else {
      setSelectedOffices(new Set(allOffices));
    }
  }, [allOffices, searchParams]);

  // Sync URL with selected candidates
  useEffect(() => {
    if (!selectedCandidates || allCandidates.length === 0) return;
    
    const excluded = allCandidates.filter(name => !selectedCandidates.has(name));
    const newParams = new URLSearchParams(searchParams);
    
    if (excluded.length > 0 && excluded.length < allCandidates.length) {
      newParams.set('excluded', excluded.map(encodeURIComponent).join(','));
    } else {
      newParams.delete('excluded');
    }
    
    setSearchParams(newParams, { replace: true });
  }, [selectedCandidates, allCandidates]);

  // Sync URL with selected offices
  useEffect(() => {
    if (!selectedOffices || allOffices.length === 0) return;
    
    const excluded = allOffices.filter(office => !selectedOffices.has(office));
    const newParams = new URLSearchParams(searchParams);
    
    if (excluded.length > 0 && excluded.length < allOffices.length) {
      newParams.set('excludedOffices', excluded.map(encodeURIComponent).join(','));
    } else {
      newParams.delete('excludedOffices');
    }
    
    setSearchParams(newParams, { replace: true });
  }, [selectedOffices, allOffices]);

  useEffect(() => {
    if (pageTitle) {
      document.title = `Civibus - NYC ${pageTitle}`;
      logEvent(isAggregate ? 'NYC Aggregate Page' : 'NYC Contest Page', 'View', pageTitle);
    }
  }, [pageTitle, isAggregate]);

  // Filter helpers
  const filterByOffices = (rows) => {
    if (!rows || !isAggregate || aggregateType !== 'borough-presidents' || !selectedOffices) return rows;
    return rows.filter(row => selectedOffices.has(row.office_sought));
  };

  const filterByCandidates = (rows) => {
    if (!rows || !selectedCandidates) return rows;
    return rows.filter(row => selectedCandidates.has(row.candidate_name));
  };

  const applyFilters = (rows) => {
    return filterByCandidates(filterByOffices(rows));
  };

  // Transform data with filters applied
  const fundraisingTimelineData = useMemo(() => 
    transformNYCFundraisingTimeline(applyFilters(data?.fundraisingTimeline)),
    [data?.fundraisingTimeline, selectedCandidates, selectedOffices]
  );

  const expenditureTimelineData = useMemo(() => 
    transformNYCExpenditureTimeline(applyFilters(data?.expenditureTimeline)),
    [data?.expenditureTimeline, selectedCandidates, selectedOffices]
  );

  const cashOnHandTimelineData = useMemo(() => 
    transformNYCCashOnHandTimeline(applyFilters(data?.cashOnHandTimeline)),
    [data?.cashOnHandTimeline, selectedCandidates, selectedOffices]
  );

  const cfbCandidLookup = useMemo(() => {
    if (!data?.fundraisingTimeline) return {};
    const lookup = {};
    data.fundraisingTimeline.forEach(row => {
      if (row.candidate_name && row.cfb_candid) {
        lookup[row.candidate_name] = row.cfb_candid;
      }
    });
    return lookup;
  }, [data?.fundraisingTimeline]);

  const donationsBySizeData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(applyFilters(data?.donationsBySize), 'size_bucket', NYC_SIZE_COLORS, NYC_SIZE_ORDER, 'donation_count', cfbCandidLookup),
      true
    ),
    [data?.donationsBySize, selectedCandidates, selectedOffices, cfbCandidLookup]
  );

  const donationsByLocationData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(applyFilters(data?.donationsByLocation), 'location_bucket', NYC_LOCATION_COLORS, NYC_LOCATION_ORDER, 'total_amount', cfbCandidLookup),
      false
    ),
    [data?.donationsByLocation, selectedCandidates, selectedOffices, cfbCandidLookup]
  );

  const donationsByBoroughData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(applyFilters(data?.donationsByBorough), 'borough', NYC_BOROUGH_COLORS, NYC_BOROUGH_ORDER, 'donation_count', cfbCandidLookup),
      true
    ),
    [data?.donationsByBorough, selectedCandidates, selectedOffices, cfbCandidLookup]
  );

  const donationsByRealEstateData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(applyFilters(data?.donationsByRealEstate), 'industry_type', NYC_REALESTATE_COLORS, NYC_REALESTATE_ORDER, 'total_amount', cfbCandidLookup),
      false
    ),
    [data?.donationsByRealEstate, selectedCandidates, selectedOffices, cfbCandidLookup]
  );

  const refundsData = useMemo(() => 
    transformNYCRefundsChart(applyFilters(data?.refunds), cfbCandidLookup),
    [data?.refunds, selectedCandidates, selectedOffices, cfbCandidLookup]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100 text-xl">Loading {isAggregate ? pageTitle : 'contest'} data...</div>
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
            {pageIcon && <span className="mr-2">{pageIcon}</span>}
            {pageTitle}
          </h1>
          <Link 
            to="/nyc" 
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
          >
            ← Back to NYC Campaign Finance 2025
          </Link>
        </div>

        {/* Aggregate info box */}
        {isAggregate && data.offices && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              {aggregateType === 'city-council' ? (
                <><strong>Showing top 20 fundraisers from:</strong> {data.offices.length} City Council districts</>
              ) : (
                <><strong>Showing combined data for:</strong> {data.offices.join(', ')}</>
              )}
            </p>
          </div>
        )}

        {/* Office-level filters (borough aggregate only) */}
        {isAggregate && aggregateType === 'borough-presidents' && allOffices.length > 0 && selectedOffices && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {allOffices.map(office => {
                const isSelected = selectedOffices.has(office);
                const shortName = office.replace(' Boro President', '');
                return (
                  <button
                    key={office}
                    onClick={() => {
                      const next = new Set(selectedOffices);
                      if (isSelected) {
                        next.delete(office);
                      } else {
                        next.add(office);
                      }
                      if (next.size > 0) {
                        setSelectedOffices(next);
                      }
                    }}
                    style={{
                      backgroundColor: isSelected ? NYC_BOROUGH_COLORS[shortName] : undefined,
                      color: isSelected ? 'white' : undefined
                    }}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      isSelected
                        ? ''
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 line-through opacity-50'
                    }`}
                  >
                    {shortName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Candidate Filters */}
        {allCandidates.length > 1 && selectedCandidates && (
          <div className="mb-6">
            <details className="border border-gray-300 dark:border-gray-600 rounded p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter Candidates ({selectedCandidates.size} of {allCandidates.length} shown)
              </summary>
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  {selectedCandidates.size < allCandidates.length && (
                    <button
                      onClick={() => setSelectedCandidates(new Set(allCandidates))}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Select All
                    </button>
                  )}
                  {selectedCandidates.size > 0 && (
                    <button
                      onClick={() => setSelectedCandidates(new Set())}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Deselect All
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allCandidates.map(name => {
                    const isSelected = selectedCandidates.has(name);
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          const next = new Set(selectedCandidates);
                          if (isSelected) {
                            next.delete(name);
                          } else {
                            next.add(name);
                          }
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
                  logEvent(isAggregate ? 'NYC Aggregate Tab' : 'NYC Tab', 'Click', `${pageTitle} - ${tab.label}`);
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
            <strong>Data notes:</strong> All charts show {isAggregate && aggregateType === 'city-council' ? 'the top 20 fundraising candidates across all City Council districts' : 'campaign finance data'} from January 2022 onward. 
            Public funding amounts are shown separately in the fundraising timeline where applicable.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NYCContestPage;