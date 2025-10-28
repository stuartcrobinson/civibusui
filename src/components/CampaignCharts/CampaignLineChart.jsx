
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FilterControls from './FilterControls';
import ExportModal from './ExportModal';
import { useChartExport } from './useChartExport';


function CampaignLineChart({ 
  data, 
  title, 
  yAxisLabel, 
  xAxisLabel,
  activeFilter: controlledActiveFilter,
  hoveredFilter: controlledHoveredFilter,
  onActiveFilterChange,
  onHoveredFilterChange,
  showLocalFilters = true,
  showExport = false
}) {
  const [internalActiveFilter, setInternalActiveFilter] = useState('all');
  const [internalHoveredFilter, setInternalHoveredFilter] = useState(null);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [hoveredDot, setHoveredDot] = useState(null);
  const [hoveredCandidateId, setHoveredCandidateId] = useState(null);

  // Use controlled props if provided, otherwise use internal state
  const isControlled = controlledActiveFilter !== undefined;
  const activeFilter = isControlled ? controlledActiveFilter : internalActiveFilter;
  
  const [localHoveredFilter, setLocalHoveredFilter] = useState(null);
  const hoveredFilter = localHoveredFilter || (isControlled ? controlledHoveredFilter : internalHoveredFilter);
  
  // Export functionality
  const { isModalOpen, isProcessing, openModal, closeModal, embedCode } = useChartExport('line', data, title, activeFilter);
  
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

  // Filter lines based on active filter and remove zero-only lines
  const getFilteredLines = () => {
    let lines = activeFilter === 'all' ? data.lines : data.lines.filter(line => matchesFilter(line, activeFilter));
    
    // Filter out lines where all points are zero or undefined
    return lines.filter(line => {
      if (!line.points || line.points.length === 0) return false;
      return line.points.some(point => point.value > 0);
    });
  };

  const filteredLines = getFilteredLines();

  // Public/Private funding line logic:
  // - Lines with `type: 'public'` render thicker (4px), semi-transparent (0.35 opacity), and are visually distinct
  // - Lines with `type: 'private'` render normal (2px, full opacity)
  // - Lines with matching `candidateId` are spiritually linked: hovering one highlights both
  // - Tooltip shows "(Private)" or "(Public)" suffix if `type` field exists, regardless of pairing
  // - Zero-only lines (all points.value === 0) are filtered out to prevent flat lines at y=0
  // - Lines without `type` or `candidateId` render as standalone (legacy behavior, backwards compatible)
  
  // Transform data for Recharts format (only include filtered lines)
  const chartData = filteredLines.length > 0 && filteredLines[0].points ? 
    filteredLines[0].points.map((point, index) => {
      const dataPoint = { date: point.date };
      filteredLines.forEach(line => {
        if (line.points && line.points[index] && typeof line.points[index].value !== 'undefined') {
          dataPoint[line.dataKey] = line.points[index].value;
        }
      });
      return dataPoint;
    }) : [];

  // Custom tooltip - show single value if dot is hovered, all values otherwise
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      
      // If hovering a specific dot, show candidate's grouped values
      if (hoveredDot) {
        const hoveredLine = data.lines.find(l => l.dataKey === hoveredDot);
        const candidateId = hoveredLine?.candidateId;
        
        if (candidateId) {
          // Show both private and public for this candidate
          const candidatePayload = payload.filter(p => {
            const line = data.lines.find(l => l.dataKey === p.dataKey);
            return line?.candidateId === candidateId;
          });
          
          if (candidatePayload.length === 0) return null;
          
          return (
            <div className="bg-gray-900 text-white px-3 py-2 rounded shadow-lg">
              <p className="text-xs text-gray-300 mb-1.5 font-medium">
                {hoveredLine ? data.lines.find(l => l.dataKey === hoveredLine)?.label : ''}
              </p>
              {candidatePayload.map((entry, idx) => {
                const line = data.lines.find(l => l.dataKey === entry.dataKey);
                const isHoveredType = line?.dataKey === hoveredDot;
                return (
                  <div key={idx} className={idx > 0 ? 'mt-1' : ''}>
                    <p className="text-xs">
                      <span className={isHoveredType ? 'font-semibold' : 'opacity-70'}>
                        {line?.type === 'public' ? 'Public: ' : 'Private: '}
                      </span>
                      <span className="font-semibold">
                        {entry.value.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </span>
                    </p>
                  </div>
                );
              })}
              <p className="text-xs text-gray-300 mt-1">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          );
        } else {
          // Fallback: single line without candidateId
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
              const typeLabel = line?.type ? ` (${line.type.charAt(0).toUpperCase() + line.type.slice(1)})` : '';
              return (
                <div key={index} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs">{line?.label}{typeLabel}</span>
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
      <div className="flex justify-between items-start mb-6">
        {title && <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>}
        {showExport && (
          <button
            onClick={openModal}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded border border-gray-300 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Export
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Custom Legend */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          {filteredLines.map((line, idx) => {
            const isHighlightedByLine = hoveredLine === line.dataKey;
            const isHighlightedByCandidate = hoveredCandidateId && line.candidateId === hoveredCandidateId;
            const isHighlightedByFilter = hoveredFilter && matchesFilter(line, hoveredFilter);
            const isHighlighted = isHighlightedByLine || isHighlightedByCandidate;
            const shouldDim = (hoveredLine && !isHighlighted) || (hoveredCandidateId && !isHighlightedByCandidate) || (hoveredFilter && !isHighlightedByFilter);
            const shouldBeBold = isHighlighted || isHighlightedByFilter;
            const linkUrl = line.linkUrl;
            const displayLabel = line.label + (line.type ? ` (${line.type.charAt(0).toUpperCase() + line.type.slice(1)})` : '');
            
            return (
              <div 
                key={idx}
                className={`flex items-center gap-2 transition-all duration-200 ${linkUrl ? 'cursor-pointer' : ''} ${
                  shouldDim ? 'opacity-50' : 'opacity-100'
                }`}
                onMouseEnter={() => {
                  setHoveredLine(line.dataKey);
                  if (line.candidateId) setHoveredCandidateId(line.candidateId);
                }}
                onMouseLeave={() => {
                  setHoveredLine(null);
                  setHoveredCandidateId(null);
                }}
              >
                <div 
                  className="w-4 h-4 flex-shrink-0"
                  style={{ backgroundColor: line.color }}
                />
                {linkUrl ? (
                  
                   <a href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-900 dark:text-gray-100 relative inline-block hover:underline"
                  >
                    <span className="font-bold invisible" aria-hidden="true">{displayLabel}</span>
                    <span className={`absolute inset-0 ${shouldBeBold ? 'font-bold' : ''}`}>
                      {displayLabel}
                    </span>
                  </a>
                ) : (
                  <span className="text-sm text-gray-900 dark:text-gray-100 relative inline-block">
                    <span className="font-bold invisible" aria-hidden="true">{displayLabel}</span>
                    <span className={`absolute inset-0 ${shouldBeBold ? 'font-bold' : ''}`}>
                      {displayLabel}
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={600}>
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
          
          {filteredLines.map((line) => {
            const baseWidth = line.type === 'public' ? 4 : 2;
            const highlightedWidth = line.type === 'public' ? 6 : 3;
            const baseOpacity = line.type === 'public' ? 0.35 : 1;
            const activeDotRadius = 5;
            
            const isLineHighlighted = hoveredLine === line.dataKey || hoveredDot === line.dataKey;
            const isCandidateHighlighted = hoveredCandidateId && line.candidateId === hoveredCandidateId;
            const isFilterHighlighted = hoveredFilter && matchesFilter(line, hoveredFilter);
            const isHighlighted = isLineHighlighted || isCandidateHighlighted || isFilterHighlighted;
            
            const shouldDim = (hoveredLine && hoveredLine !== line.dataKey && hoveredDot !== line.dataKey) ||
                             (hoveredCandidateId && line.candidateId !== hoveredCandidateId) ||
                             (hoveredFilter && !matchesFilter(line, hoveredFilter));
            
            const finalOpacity = shouldDim ? (line.type === 'public' ? 0.2 : 0.3) : (isHighlighted ? 1.0 : baseOpacity);
            
            return (
              <Line
                key={line.dataKey}
                type="linear"
                dataKey={line.dataKey}
                name={line.label}
                stroke={line.color}
                strokeWidth={isHighlighted ? highlightedWidth : baseWidth}
                strokeOpacity={finalOpacity}
                dot={false}
                activeDot={{ 
                  r: activeDotRadius,
                  onMouseEnter: () => {
                    setHoveredDot(line.dataKey);
                    setHoveredLine(line.dataKey);
                    if (line.candidateId) setHoveredCandidateId(line.candidateId);
                  },
                  onMouseLeave: () => {
                    setHoveredDot(null);
                    setHoveredLine(null);
                    setHoveredCandidateId(null);
                  }
                }}
                onMouseEnter={() => {
                  setHoveredLine(line.dataKey);
                  if (line.candidateId) setHoveredCandidateId(line.candidateId);
                }}
                onMouseLeave={() => {
                  setHoveredLine(null);
                  setHoveredCandidateId(null);
                }}
                isAnimationActive={false}
                style={{ transition: 'stroke-width 1000ms cubic-bezier(0.4, 0, 0.2, 1), stroke-opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Filter labels */}
      {showLocalFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <FilterControls 
            data={data.lines}
            activeFilter={activeFilter}
            hoveredFilter={hoveredFilter}
            onFilterClick={handleFilterClick}
            onFilterHover={handleFilterHover}
          />
        </div>
      )}
      
      {/* Export Modal */}
      {showExport && (
        <ExportModal
          isOpen={isModalOpen}
          onClose={closeModal}
          embedCode={embedCode}
          chartTitle={title}
        />
      )}
    </div>
  );
}

export default React.memo(CampaignLineChart);
