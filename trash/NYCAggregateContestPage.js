import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logEvent } from '../utils/analytics';
import { CampaignLineChart, SegmentedBarChart } from './CampaignCharts';
import { useNYCAggregateData } from '../hooks/useNYCData';
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

function NYCAggregateContestPage({ type }) {
  const [activeTab, setActiveTab] = useState('fundraising');
  const { data, loading, error } = useNYCAggregateData(type);

  const pageTitle = type === 'borough-presidents' ? 'All Borough Presidents' : 'All City Council (Top 20)';
  const pageIcon = type === 'borough-presidents' ? '🏛️' : '🏙️';

  useEffect(() => {
    document.title = `Civibus - NYC ${pageTitle}`;
    logEvent('NYC Aggregate Page', 'View', pageTitle);
  }, [pageTitle]);

  const fundraisingTimelineData = useMemo(() => 
    transformNYCFundraisingTimeline(data?.fundraisingTimeline),
    [data?.fundraisingTimeline]
  );

  const expenditureTimelineData = useMemo(() => 
    transformNYCExpenditureTimeline(data?.expenditureTimeline),
    [data?.expenditureTimeline]
  );

  const cashOnHandTimelineData = useMemo(() => 
    transformNYCCashOnHandTimeline(data?.cashOnHandTimeline),
    [data?.cashOnHandTimeline]
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
      transformNYCBarChart(data?.donationsBySize, 'size_bucket', NYC_SIZE_COLORS, NYC_SIZE_ORDER, 'donation_count', cfbCandidLookup),
      true
    ),
    [data?.donationsBySize, cfbCandidLookup]
  );

  const donationsByLocationData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(data?.donationsByLocation, 'location_bucket', NYC_LOCATION_COLORS, NYC_LOCATION_ORDER, 'total_amount', cfbCandidLookup),
      false
    ),
    [data?.donationsByLocation, cfbCandidLookup]
  );

  const donationsByBoroughData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(data?.donationsByBorough, 'borough', NYC_BOROUGH_COLORS, NYC_BOROUGH_ORDER, 'donation_count', cfbCandidLookup),
      true
    ),
    [data?.donationsByBorough, cfbCandidLookup]
  );

  const donationsByRealEstateData = useMemo(() => 
    transformAbsoluteBarChart(
      transformNYCBarChart(data?.donationsByRealEstate, 'industry_type', NYC_REALESTATE_COLORS, NYC_REALESTATE_ORDER, 'total_amount', cfbCandidLookup),
      false
    ),
    [data?.donationsByRealEstate, cfbCandidLookup]
  );

  const refundsData = useMemo(() => 
    transformNYCRefundsChart(data?.refunds, cfbCandidLookup),
    [data?.refunds, cfbCandidLookup]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-gray-100 text-xl">Loading {pageTitle} data...</div>
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
            {pageIcon} {pageTitle}
          </h1>
          <Link 
            to="/nyc" 
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
          >
            ← Back to NYC Campaign Finance 2025
          </Link>
        </div>

        {data.offices && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              {type === 'city-council' ? (
                <><strong>Showing top 20 fundraisers from:</strong> {data.offices.length} City Council districts</>
              ) : (
                <><strong>Showing combined data for:</strong> {data.offices.join(', ')}</>
              )}
            </p>
          </div>
        )}

        <div className="mb-8 border-b border-gray-300 dark:border-gray-600">
          <div className="flex flex-wrap gap-2 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  logEvent('NYC Aggregate Tab', 'Click', `${pageTitle} - ${tab.label}`);
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
            <strong>Data notes:</strong> All charts show {type === 'city-council' ? 'the top 20 fundraising candidates across all City Council districts' : 'combined campaign finance data across all Borough President races'} from January 2022 onward. 
            Public funding amounts are shown separately in the fundraising timeline where applicable.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NYCAggregateContestPage;