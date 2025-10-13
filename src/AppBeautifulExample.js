// https://claude.ai/chat/4d405205-afd6-46eb-90a7-17dad13df91c

import React, { useState } from 'react';
import './App.css';
import { CampaignLineChart, SegmentedBarChart, FilterControls } from './components/CampaignCharts';

// Sample data for line chart - Weekly fundraising over 10 weeks
const lineChartData = {
  lines: [
    {
      label: 'Jane Smith',
      dataKey: 'jane',
      color: '#3b82f6',
      position: 'MAYOR',
      points: [
        { date: '2024-01-01', value: 25000 },
        { date: '2024-01-08', value: 32000 },
        { date: '2024-01-15', value: 28000 },
        { date: '2024-01-22', value: 45000 },
        { date: '2024-01-29', value: 52000 },
        { date: '2024-02-05', value: 48000 },
        { date: '2024-02-12', value: 61000 },
        { date: '2024-02-19', value: 58000 },
        { date: '2024-02-26', value: 72000 },
        { date: '2024-03-04', value: 68000 }
      ]
    },
    {
      label: 'John Doe',
      dataKey: 'john',
      color: '#ef4444',
      position: 'MAYOR',
      points: [
        { date: '2024-01-01', value: 35000 },
        { date: '2024-01-08', value: 42000 },
        { date: '2024-01-15', value: 38000 },
        { date: '2024-01-22', value: 51000 },
        { date: '2024-01-29', value: 47000 },
        { date: '2024-02-05', value: 55000 },
        { date: '2024-02-12', value: 49000 },
        { date: '2024-02-19', value: 63000 },
        { date: '2024-02-26', value: 58000 },
        { date: '2024-03-04', value: 71000 }
      ]
    },
    {
      label: 'Alice Johnson',
      dataKey: 'alice',
      color: '#10b981',
      position: 'CITY COUNCIL',
      subregion_value: 'I',
      points: [
        { date: '2024-01-01', value: 15000 },
        { date: '2024-01-08', value: 18000 },
        { date: '2024-01-15', value: 22000 },
        { date: '2024-01-22', value: 19000 },
        { date: '2024-01-29', value: 25000 },
        { date: '2024-02-05', value: 28000 },
        { date: '2024-02-12', value: 31000 },
        { date: '2024-02-19', value: 27000 },
        { date: '2024-02-26', value: 35000 },
        { date: '2024-03-04', value: 38000 }
      ]
    },
    {
      label: 'Bob Wilson',
      dataKey: 'bob',
      color: '#a855f7',
      position: 'CITY COUNCIL',
      subregion_value: 'I',
      points: [
        { date: '2024-01-01', value: 12000 },
        { date: '2024-01-08', value: 15000 },
        { date: '2024-01-15', value: 13000 },
        { date: '2024-01-22', value: 17000 },
        { date: '2024-01-29', value: 19000 },
        { date: '2024-02-05', value: 22000 },
        { date: '2024-02-12', value: 20000 },
        { date: '2024-02-19', value: 24000 },
        { date: '2024-02-26', value: 26000 },
        { date: '2024-03-04', value: 29000 }
      ]
    },
    {
      label: 'Carol Martinez',
      dataKey: 'carol',
      color: '#f97316',
      position: 'CITY COUNCIL',
      subregion_value: 'II',
      points: [
        { date: '2024-01-01', value: 45000 },
        { date: '2024-01-08', value: 52000 },
        { date: '2024-01-15', value: 48000 },
        { date: '2024-01-22', value: 61000 },
        { date: '2024-01-29', value: 58000 },
        { date: '2024-02-05', value: 67000 },
        { date: '2024-02-12', value: 72000 },
        { date: '2024-02-19', value: 69000 },
        { date: '2024-02-26', value: 78000 },
        { date: '2024-03-04', value: 82000 }
      ]
    }
  ]
};

// Sample data for bar chart - Fundraising by industry
const barChartData = [
  {
    label: 'Jane Smith',
    position: 'MAYOR',
    leftLabel: 'D',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=jane',
    segments: [
      { label: 'Real Estate', value: 850000, color: '#ef4444' },
      { label: 'Tech', value: 620000, color: '#f59e0b' },
      { label: 'Finance', value: 530000, color: '#eab308' },
      { label: 'Healthcare', value: 300000, color: '#84cc16' },
      { label: 'Legal', value: 200000, color: '#3b82f6' }
    ]
  },
  {
    label: 'John Doe',
    position: 'MAYOR',
    leftLabel: 'R',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=john',
    segments: [
      { label: 'Real Estate', value: 480000, color: '#ef4444' },
      { label: 'Tech', value: 420000, color: '#f59e0b' },
      { label: 'Finance', value: 380000, color: '#eab308' },
      { label: 'Healthcare', value: 220000, color: '#84cc16' },
      { label: 'Legal', value: 100000, color: '#3b82f6' }
    ]
  },
  {
    label: 'Carol Martinez',
    position: 'CITY COUNCIL',
    subregion_value: 'II',
    leftLabel: 'D',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=carol',
    segments: [
      { label: 'Real Estate', value: 720000, color: '#ef4444' },
      { label: 'Tech', value: 580000, color: '#f59e0b' },
      { label: 'Finance', value: 390000, color: '#eab308' },
      { label: 'Healthcare', value: 150000, color: '#84cc16' },
      { label: 'Legal', value: 60000, color: '#3b82f6' }
    ]
  },
  {
    label: 'Alice Johnson',
    position: 'CITY COUNCIL',
    subregion_value: 'I',
    leftLabel: 'D',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=alice',
    segments: [
      { label: 'Real Estate', value: 180000, color: '#ef4444' },
      { label: 'Tech', value: 320000, color: '#f59e0b' },
      { label: 'Finance', value: 210000, color: '#eab308' },
      { label: 'Healthcare', value: 120000, color: '#84cc16' },
      { label: 'Legal', value: 60000, color: '#3b82f6' }
    ]
  },
  {
    label: 'Bob Wilson',
    position: 'CITY COUNCIL',
    subregion_value: 'I',
    leftLabel: 'D',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bob',
    segments: [
      { label: 'Real Estate', value: 210000, color: '#ef4444' },
      { label: 'Tech', value: 140000, color: '#f59e0b' },
      { label: 'Finance', value: 120000, color: '#eab308' },
      { label: 'Healthcare', value: 80000, color: '#84cc16' },
      { label: 'Legal', value: 30000, color: '#3b82f6' }
    ]
  }
];

// Candidate data for global filters
const candidateData = [
  { position: 'MAYOR' },
  { position: 'MAYOR' },
  { position: 'CITY COUNCIL', subregion_value: 'I' },
  { position: 'CITY COUNCIL', subregion_value: 'I' },
  { position: 'CITY COUNCIL', subregion_value: 'II' }
];

function App() {
  const [globalFilterActive, setGlobalFilterActive] = useState(false);
  const [globalActiveFilter, setGlobalActiveFilter] = useState('all');
  const [globalHoveredFilter, setGlobalHoveredFilter] = useState(null);
  
  const [chartFilters, setChartFilters] = useState({
    lineChart: 'all',
    barChart: 'all'
  });

  const handleGlobalFilterClick = (filterId) => {
    setGlobalFilterActive(true);
    setGlobalActiveFilter(filterId);
    setChartFilters({
      lineChart: filterId,
      barChart: filterId
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Campaign Finance Dashboard
        </h1>
        
        {/* Global Filter Controls */}
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-30 py-4 border-b-2 border-gray-300 dark:border-gray-600">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
            FILTER ALL CHARTS
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
          Use the global filters above to compare all charts simultaneously, or interact with 
          individual chart filters below for independent analysis.
        </p>
        
        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <CampaignLineChart 
            data={lineChartData}
            title="Weekly Fundraising by Candidate"
            yAxisLabel="Amount Raised"
            xAxisLabel="Date"
            activeFilter={chartFilters.lineChart}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('lineChart', filterId)}
            showLocalFilters={true}
          />
        </div>
        
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <SegmentedBarChart 
            data={barChartData}
            title="Fundraising by Industry"
            legendLabel="Donor Industries"
            activeFilter={chartFilters.barChart}
            hoveredFilter={globalHoveredFilter}
            onActiveFilterChange={(filterId) => handleChartFilterChange('barChart', filterId)}
            showLocalFilters={true}
          />
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Interactive Features:</strong> Hover over filter labels to highlight candidates across both charts. 
            Click to filter. Hover over chart elements for detailed tooltips.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;