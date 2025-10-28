import React from 'react';
import CampaignLineChart from '../components/CampaignCharts/CampaignLineChart';

// Test data with public/private funding split
const testData = {
  lines: [
    {
      label: 'John Smith',
      dataKey: 'smith_private',
      candidateId: 'smith',
      type: 'private',
      color: '#3b82f6',
      position: 'Mayor',
      linkUrl: 'https://example.com/smith',
      points: [
        { date: '2025-01-01', value: 5000 },
        { date: '2025-01-08', value: 12000 },
        { date: '2025-01-15', value: 18000 },
        { date: '2025-01-22', value: 25000 },
        { date: '2025-01-29', value: 32000 },
        { date: '2025-02-05', value: 45000 },
        { date: '2025-02-12', value: 58000 }
      ]
    },
    {
      label: 'John Smith',
      dataKey: 'smith_public',
      candidateId: 'smith',
      type: 'public',
      color: '#3b82f6',
      position: 'Mayor',
      linkUrl: 'https://example.com/smith',
      points: [
        { date: '2025-01-01', value: 0 },
        { date: '2025-01-08', value: 0 },
        { date: '2025-01-15', value: 15000 },
        { date: '2025-01-22', value: 15000 },
        { date: '2025-01-29', value: 30000 },
        { date: '2025-02-05', value: 30000 },
        { date: '2025-02-12', value: 45000 }
      ]
    },
    {
      label: 'Jane Doe',
      dataKey: 'doe_private',
      candidateId: 'doe',
      type: 'private',
      color: '#ef4444',
      position: 'Mayor',
      linkUrl: 'https://example.com/doe',
      points: [
        { date: '2025-01-01', value: 8000 },
        { date: '2025-01-08', value: 15000 },
        { date: '2025-01-15', value: 22000 },
        { date: '2025-01-22', value: 35000 },
        { date: '2025-01-29', value: 48000 },
        { date: '2025-02-05', value: 62000 },
        { date: '2025-02-12', value: 75000 }
      ]
    },
    {
      label: 'Jane Doe',
      dataKey: 'doe_public',
      candidateId: 'doe',
      type: 'public',
      color: '#ef4444',
      position: 'Mayor',
      linkUrl: 'https://example.com/doe',
      points: [
        { date: '2025-01-01', value: 0 },
        { date: '2025-01-08', value: 0 },
        { date: '2025-01-15', value: 0 },
        { date: '2025-01-22', value: 0 },
        { date: '2025-01-29', value: 0 },
        { date: '2025-02-05', value: 0 },
        { date: '2025-02-12', value: 0 }
      ]
    },
    {
      label: 'Bob Wilson',
      dataKey: 'wilson_private',
      candidateId: 'wilson',
      type: 'private',
      color: '#10b981',
      position: 'Mayor',
      points: [
        { date: '2025-01-01', value: 3000 },
        { date: '2025-01-08', value: 7000 },
        { date: '2025-01-15', value: 11000 },
        { date: '2025-01-22', value: 16000 },
        { date: '2025-01-29', value: 22000 },
        { date: '2025-02-05', value: 28000 },
        { date: '2025-02-12', value: 35000 }
      ]
    },
    {
      label: 'Bob Wilson',
      dataKey: 'wilson_public',
      candidateId: 'wilson',
      type: 'public',
      color: '#10b981',
      position: 'Mayor',
      points: [
        { date: '2025-01-01', value: 0 },
        { date: '2025-01-08', value: 10000 },
        { date: '2025-01-15', value: 10000 },
        { date: '2025-01-22', value: 25000 },
        { date: '2025-01-29', value: 25000 },
        { date: '2025-02-05', value: 40000 },
        { date: '2025-02-12', value: 40000 }
      ]
    },
    {
      label: 'Sarah Chen',
      dataKey: 'chen_private',
      candidateId: 'chen',
      type: 'private',
      color: '#a855f7',
      position: 'Mayor',
      points: [
        { date: '2025-01-01', value: 12000 },
        { date: '2025-01-08', value: 18000 },
        { date: '2025-01-15', value: 26000 },
        { date: '2025-01-22', value: 34000 },
        { date: '2025-01-29', value: 43000 },
        { date: '2025-02-05', value: 51000 },
        { date: '2025-02-12', value: 60000 }
      ]
    }
  ]
};

function PublicFundingTest() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          Public Funding Line Chart Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Test Scenarios
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>• <strong>John Smith:</strong> Has both private and public funding lines</li>
            <li>• <strong>Jane Doe:</strong> Private funding only (public line exists but all zeros)</li>
            <li>• <strong>Bob Wilson:</strong> Has both private and public funding</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <CampaignLineChart
            data={testData}
            title="Cumulative Fundraising by Candidate"
            yAxisLabel="Total Raised"
            xAxisLabel="Date"
            showLocalFilters={true}
            showExport={false}
          />
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Expected Behavior
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            <li>✓ Public funding lines should be thicker (4px vs 2px) and semi-transparent (0.5 opacity)</li>
            <li>✓ Hovering over candidate name in legend highlights both their private and public lines</li>
            <li>✓ Hovering over either line highlights both lines for that candidate</li>
            <li>✓ Hovering on a data point shows both private and public values in tooltip</li>
            <li>✓ Public funding dots should be larger (7px vs 5px radius)</li>
            <li>✓ Legend shows "(Private)" and "(Public)" suffixes</li>
            <li>✓ Jane Doe's public line should not render (all values are 0)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PublicFundingTest;