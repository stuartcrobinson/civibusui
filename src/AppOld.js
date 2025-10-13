import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Reusable Filter Controls Component (same as bar graph)
function FilterControls({ 
  data, 
  activeFilter, 
  hoveredFilter, 
  onFilterClick, 
  onFilterHover,
  isInactive = false 
}) {
  const filterStructure = { positions: {} };
  data.forEach(item => {
    const pos = item.position || 'Other';
    if (!filterStructure.positions[pos]) {
      filterStructure.positions[pos] = { subregions: new Set() };
    }
    if (item.subregion_value) {
      filterStructure.positions[pos].subregions.add(item.subregion_value);
    }
  });

  const filterOptions = [{ id: 'all', label: 'All', type: 'all' }];
  Object.entries(filterStructure.positions).forEach(([position, posData]) => {
    filterOptions.push({ id: position, label: position, type: 'position' });
    if (posData.subregions.size > 0) {
      Array.from(posData.subregions).sort().forEach(subregion => {
        filterOptions.push({ 
          id: `${position}:${subregion}`, 
          label: subregion, 
          type: 'subregion',
          parentPosition: position
        });
      });
    }
  });

  return (
    <div className="flex flex-wrap gap-2 items-baseline">
      {filterOptions.map((filter, idx) => {
        const isActive = activeFilter === filter.id;
        const isHovered = hoveredFilter === filter.id;
        const shouldShowSeparator = filter.type === 'subregion' && 
          idx > 0 && 
          filterOptions[idx - 1].type === 'position';
        
        return (
          <React.Fragment key={filter.id}>
            {shouldShowSeparator && (
              <span className="text-gray-400 dark:text-gray-600 mx-1">(</span>
            )}
            <button
              onClick={() => onFilterClick(filter.id)}
              onMouseEnter={() => onFilterHover && onFilterHover(filter.id)}
              onMouseLeave={() => onFilterHover && onFilterHover(null)}
              className={`
                px-2 py-1 rounded transition-all duration-200 cursor-pointer
                ${isActive 
                  ? 'font-bold text-gray-900 dark:text-gray-100' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
                ${!isActive && !isHovered ? 'opacity-70' : 'opacity-100'}
                ${isInactive ? 'opacity-40' : ''}
              `}
            >
              {filter.label}
            </button>
            {filter.type === 'subregion' && 
             idx < filterOptions.length - 1 &&
             filterOptions[idx + 1].parentPosition === filter.parentPosition && (
              <span className="text-gray-400 dark:text-gray-600">,</span>
            )}
            {filter.type === 'subregion' && 
             idx < filterOptions.length - 1 &&
             filterOptions[idx + 1].parentPosition !== filter.parentPosition && (
              <span className="text-gray-400 dark:text-gray-600 mx-1">)</span>
            )}
            {filter.type === 'subregion' && 
             idx === filterOptions.length - 1 && (
              <span className="text-gray-400 dark:text-gray-600 mx-1">)</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CampaignLineChart({ 
  data, 
  title, 
  yAxisLabel, 
  xAxisLabel,
  activeFilter: controlledActiveFilter,
  hoveredFilter: controlledHoveredFilter,
  onActiveFilterChange,
  onHoveredFilterChange,
  showLocalFilters = true
}) {
  const [internalActiveFilter, setInternalActiveFilter] = useState('all');
  const [internalHoveredFilter, setInternalHoveredFilter] = useState(null);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [hoveredDot, setHoveredDot] = useState(null);

  // Use controlled props if provided, otherwise use internal state
  const isControlled = controlledActiveFilter !== undefined;
  const activeFilter = isControlled ? controlledActiveFilter : internalActiveFilter;
  
  const [localHoveredFilter, setLocalHoveredFilter] = useState(null);
  const hoveredFilter = localHoveredFilter || (isControlled ? controlledHoveredFilter : internalHoveredFilter);
  
  const handleFilterClick = (filterId) => {
    if (isControlled && onActiveFilterChange) {
      onActiveFilterChange(filterId);
    } else {
      setInternalActiveFilter(filterId);
    }
  };
  
  const handleFilterHover = (filterId) => {
    setLocalHoveredFilter(filterId);
  };

  // Check if a line matches the filter
  const matchesFilter = (line, filterId) => {
    if (filterId === 'all') return true;
    
    const positionMatch = line.position === filterId;
    if (positionMatch) return true;
    
    if (filterId.includes(':')) {
      const [position, subregion] = filterId.split(':');
      return line.position === position && line.subregion_value === subregion;
    }
    
    return false;
  };

  // Filter lines based on active filter
  const getFilteredLines = () => {
    if (activeFilter === 'all') return data.lines;
    return data.lines.filter(line => matchesFilter(line, activeFilter));
  };

  const filteredLines = getFilteredLines();

  // Transform data for Recharts format (only include filtered lines)
  const chartData = filteredLines[0].points.map((point, index) => {
    const dataPoint = { date: point.date };
    filteredLines.forEach(line => {
      dataPoint[line.dataKey] = line.points[index].value;
    });
    return dataPoint;
  });

  // Custom tooltip - show single value if dot is hovered, all values otherwise
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      
      // If hovering a specific dot, show only that line's value
      if (hoveredDot) {
        const dotData = payload.find(p => p.dataKey === hoveredDot);
        if (!dotData) return null;
        
        return (
          <div className="bg-gray-900 text-white px-3 py-2 rounded shadow-lg">
            <p className="text-xs font-semibold">
              {dotData.value.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </p>
            <p className="text-xs text-gray-300">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        );
      }
      
      // Otherwise show all values
      return (
        <div className="bg-gray-900 text-white px-4 py-3 rounded shadow-lg max-w-xs">
          <p className="text-xs text-gray-300 mb-2 font-medium">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => {
              const line = data.lines.find(l => l.dataKey === entry.dataKey);
              return (
                <div key={index} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs">{line?.label}</span>
                  </div>
                  <span className="text-xs font-semibold">
                    {entry.value.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis
  const formatYAxis = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  // Format X-axis
  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    if (day <= 7) {
      return date.toLocaleString('en-US', { month: 'short' });
    }
    return '';
  };

  return (
    <div className="w-full">
      {title && <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">{title}</h2>}
      
      {/* Custom Legend */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          {filteredLines.map((line, idx) => {
            const isHighlighted = hoveredLine === line.dataKey;
            const isHighlightedByFilter = hoveredFilter && matchesFilter(line, hoveredFilter);
            const shouldDim = (hoveredLine && !isHighlighted) || (hoveredFilter && !isHighlightedByFilter);
            const shouldBeBold = isHighlighted || isHighlightedByFilter;
            
            return (
              <div 
                key={idx}
                className={`flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  shouldDim ? 'opacity-50' : 'opacity-100'
                }`}
                onMouseEnter={() => setHoveredLine(line.dataKey)}
                onMouseLeave={() => setHoveredLine(null)}
              >
                <div 
                  className="w-4 h-4 flex-shrink-0"
                  style={{ backgroundColor: line.color }}
                />
                <span className="text-sm text-gray-900 dark:text-gray-100 relative inline-block">
                  <span className="font-bold invisible" aria-hidden="true">{line.label}</span>
                  <span className={`absolute inset-0 ${shouldBeBold ? 'font-bold' : ''}`}>
                    {line.label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={xAxisLabel ? {
              value: xAxisLabel,
              position: 'insideBottom',
              offset: -10,
              style: {
                fontSize: 11,
                fill: '#6b7280',
                fontWeight: 600,
                textTransform: 'uppercase'
              }
            } : undefined}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { 
                fontSize: 11, 
                fill: '#6b7280',
                fontWeight: 600,
                textTransform: 'uppercase',
                textAnchor: 'middle'
              }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {filteredLines.map((line) => (
            <Line
              key={line.dataKey}
              type="linear"
              dataKey={line.dataKey}
              name={line.label}
              stroke={line.color}
              strokeWidth={
                hoveredLine === line.dataKey || 
                hoveredDot === line.dataKey || 
                (hoveredFilter && matchesFilter(line, hoveredFilter)) ? 3 : 2
              }
              strokeOpacity={
                (hoveredLine && hoveredLine !== line.dataKey && hoveredDot !== line.dataKey) ||
                (hoveredFilter && !matchesFilter(line, hoveredFilter)) ? 0.3 : 1
              }
              dot={false}
              activeDot={{ 
                r: 5,
                onMouseEnter: () => {
                  setHoveredDot(line.dataKey);
                  setHoveredLine(line.dataKey);
                },
                onMouseLeave: () => {
                  setHoveredDot(null);
                  setHoveredLine(null);
                }
              }}
              onMouseEnter={() => setHoveredLine(line.dataKey)}
              onMouseLeave={() => setHoveredLine(null)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Filter labels */}
      {showLocalFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">          <FilterControls 
            data={data.lines}
            activeFilter={activeFilter}
            hoveredFilter={hoveredFilter}
            onFilterClick={handleFilterClick}
            onFilterHover={handleFilterHover}
          />
        </div>
      )}
    </div>
  );
}

// Generate data once outside component so it doesn't regenerate on every render
const generateWeeklyData = (startDate, weeks, baseValue, variance) => {
  const points = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < weeks; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i * 7);
    const randomVariance = (Math.random() - 0.5) * variance;
    const trend = i * 1000;
    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, baseValue + trend + randomVariance)
    });
  }
  return points;
};

// Shared candidate data structure for filters
const candidateData = [
  { position: 'MAYOR' },
  { position: 'MAYOR' },
  { position: 'CITY COUNCIL', subregion_value: 'I' },
  { position: 'CITY COUNCIL', subregion_value: 'I' },
  { position: 'CITY COUNCIL', subregion_value: 'II' },
  { position: 'CITY COUNCIL', subregion_value: 'III' },
  { position: 'CITY COUNCIL', subregion_value: 'III' }
];

const campaignData = {
  lines: [
    {
      label: 'Jane Smith',
      dataKey: 'jane',
      color: '#3b82f6',
      position: 'MAYOR',
      points: generateWeeklyData('2024-01-01', 40, 25000, 15000)
    },
    {
      label: 'John Doe',
      dataKey: 'john',
      color: '#ef4444',
      position: 'MAYOR',
      points: generateWeeklyData('2024-01-01', 40, 35000, 20000)
    },
    {
      label: 'Alice Johnson',
      dataKey: 'alice',
      color: '#10b981',
      position: 'CITY COUNCIL',
      subregion_value: 'I',
      points: generateWeeklyData('2024-01-01', 40, 15000, 10000)
    },
    {
      label: 'Bob Wilson',
      dataKey: 'bob',
      color: '#a855f7',
      position: 'CITY COUNCIL',
      subregion_value: 'I',
      points: generateWeeklyData('2024-01-01', 40, 12000, 8000)
    },
    {
      label: 'Carol Martinez',
      dataKey: 'carol',
      color: '#f97316',
      position: 'CITY COUNCIL',
      subregion_value: 'II',
      points: generateWeeklyData('2024-01-01', 40, 45000, 25000)
    },
    {
      label: 'David Lee',
      dataKey: 'david',
      color: '#ec4899',
      position: 'CITY COUNCIL',
      subregion_value: 'III',
      points: generateWeeklyData('2024-01-01', 40, 20000, 12000)
    },
    {
      label: 'Emma Chen',
      dataKey: 'emma',
      color: '#06b6d4',
      position: 'CITY COUNCIL',
      subregion_value: 'III',
      points: generateWeeklyData('2024-01-01', 40, 18000, 10000)
    }
  ]
};

const simpleData = {
  lines: [
    {
      label: 'Jane Smith',
      dataKey: 'jane_total',
      color: '#4f46e5',
      position: 'MAYOR',
      points: generateWeeklyData('2024-01-01', 40, 80000, 30000)
    },
    {
      label: 'John Doe',
      dataKey: 'john_total',
      color: '#ef4444',
      position: 'MAYOR',
      points: generateWeeklyData('2024-01-01', 40, 60000, 25000)
    },
    {
      label: 'Alice Johnson',
      dataKey: 'alice_total',
      color: '#10b981',
      position: 'CITY COUNCIL',
      subregion_value: 'I',
      points: generateWeeklyData('2024-01-01', 40, 40000, 15000)
    },
    {
      label: 'Bob Wilson',
      dataKey: 'bob_total',
      color: '#a855f7',
      position: 'CITY COUNCIL',
      subregion_value: 'I',
      points: generateWeeklyData('2024-01-01', 40, 35000, 12000)
    },
    {
      label: 'Carol Martinez',
      dataKey: 'carol_total',
      color: '#f97316',
      position: 'CITY COUNCIL',
      subregion_value: 'II',
      points: generateWeeklyData('2024-01-01', 40, 70000, 20000)
    },
    {
      label: 'David Lee',
      dataKey: 'david_total',
      color: '#ec4899',
      position: 'CITY COUNCIL',
      subregion_value: 'III',
      points: generateWeeklyData('2024-01-01', 40, 50000, 18000)
    },
    {
      label: 'Emma Chen',
      dataKey: 'emma_total',
      color: '#06b6d4',
      position: 'CITY COUNCIL',
      subregion_value: 'III',
      points: generateWeeklyData('2024-01-01', 40, 45000, 15000)
    }
  ]
};

// Example usage
export default function App() {
  const [globalFilterActive, setGlobalFilterActive] = useState(false);
  const [globalActiveFilter, setGlobalActiveFilter] = useState('all');
  const [globalHoveredFilter, setGlobalHoveredFilter] = useState(null);
  
  const [chartFilters, setChartFilters] = useState({
    donations: 'all',
    overview: 'all'
  });

  const handleGlobalFilterClick = (filterId) => {
    setGlobalFilterActive(true);
    setGlobalActiveFilter(filterId);
    setChartFilters({
      donations: filterId,
      overview: filterId
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
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Campaign Finance Analytics</h1>
      
      {/* Global Filter Controls */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 z-30 py-4 border-b-2 border-gray-300 dark:border-gray-600">
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
        Use the global filters above to compare all charts simultaneously, or interact with individual chart filters below for independent analysis.
      </p>
      
      <CampaignLineChart 
        data={campaignData}
        title="Weekly Fundraising by Candidate"
        yAxisLabel="Amount Raised"
        xAxisLabel="Date"
        activeFilter={chartFilters.donations}
        hoveredFilter={globalHoveredFilter}
        onActiveFilterChange={(filterId) => handleChartFilterChange('donations', filterId)}
        showLocalFilters={true}
      />
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
        <CampaignLineChart 
          data={simpleData}
          title="Total War Chest Over Time"
          yAxisLabel="Total Amount"
          xAxisLabel="Timeline"
          activeFilter={chartFilters.overview}
          hoveredFilter={globalHoveredFilter}
          onActiveFilterChange={(filterId) => handleChartFilterChange('overview', filterId)}
          showLocalFilters={true}
        />
      </div>
    </div>
  );
}