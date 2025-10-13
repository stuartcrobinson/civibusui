import React, { useState, useEffect } from 'react';
import FilterControls from './FilterControls';

export default function SegmentedBarChart({ 
  data, 
  title, 
  legendLabel,
  activeFilter: controlledActiveFilter,
  hoveredFilter: controlledHoveredFilter,
  onActiveFilterChange,
  onHoveredFilterChange,
  showLocalFilters = true
}) {
  const [internalActiveFilter, setInternalActiveFilter] = useState('all');
  const [internalHoveredFilter, setInternalHoveredFilter] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [hoveredLabel, setHoveredLabel] = useState(null);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);

  // Check screen width
  useEffect(() => {
    const checkWidth = () => {
      setIsNarrowScreen(window.innerWidth < 768);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

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

  // Get display label (truncate to last word on narrow screens)
  const getDisplayLabel = (label) => {
    if (!isNarrowScreen) return label;
    const words = label.split(' ');
    return words[words.length - 1];
  };

  // Get all unique segment types for the legend
  const allSegmentTypes = {};
  data.forEach(item => {
    item.segments.forEach(seg => {
      if (!allSegmentTypes[seg.label]) {
        allSegmentTypes[seg.label] = seg.color;
      }
    });
  });
  
  const legendItems = Object.entries(allSegmentTypes).map(([label, color]) => ({
    label,
    color
  }));

  // Filter data based on active filter
  const getFilteredData = () => {
    if (activeFilter === 'all') return data;
    
    const positionMatch = data.filter(item => item.position === activeFilter);
    if (positionMatch.length > 0) return positionMatch;
    
    if (activeFilter.includes(':')) {
      const [position, subregion] = activeFilter.split(':');
      return data.filter(item => item.position === position && item.subregion_value === subregion);
    }
    
    return data;
  };

  const filteredData = getFilteredData();

  // Calculate max value for scaling bars from filtered data
  const maxTotal = Math.max(...filteredData.map(item => 
    item.segments.reduce((sum, seg) => sum + seg.value, 0)
  ));

  // Check if item matches filter for highlighting
  const matchesFilter = (item, filterId) => {
    if (filterId === 'all') return true;
    
    const positionMatch = item.position === filterId;
    if (positionMatch) return true;
    
    if (filterId.includes(':')) {
      const [position, subregion] = filterId.split(':');
      return item.position === position && item.subregion_value === subregion;
    }
    
    return false;
  };

  // Format dollar amount
  const formatDollars = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  // Calculate the longest name width dynamically
  const processedLabels = filteredData.map(item => getDisplayLabel(item.label));
  const longestNameLength = Math.max(...processedLabels.map(label => label.length));
  const nameWidth = Math.max(longestNameLength * 8 + 8, 80);

  return (
    <div className="w-full">
      {title && <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">{title}</h2>}
      
      {/* Legend at top */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        {legendLabel && (
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase">
            {legendLabel}
          </div>
        )}
        <div className="flex flex-wrap gap-4">
          {legendItems.map((item, idx) => {
            const isHighlighted = hoveredLabel === item.label;
            
            return (
              <div 
                key={idx}
                className={`flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  hoveredLabel && !isHighlighted ? 'opacity-50' : 'opacity-100'
                }`}
                onMouseEnter={() => setHoveredLabel(item.label)}
                onMouseLeave={() => setHoveredLabel(null)}
              >
                <div 
                  className="w-4 h-4 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-4">
        {filteredData.map((item, idx) => {
          const isHighlightedByFilter = hoveredFilter && matchesFilter(item, hoveredFilter);
          const shouldDim = hoveredFilter && !isHighlightedByFilter;
          const itemTotal = item.segments.reduce((sum, s) => sum + s.value, 0);
          const displayLabel = getDisplayLabel(item.label);
          
          return (
            <div 
              key={idx} 
              className={`flex items-center gap-4 transition-opacity duration-200 ${
                shouldDim ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {/* Image */}
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.label}
                  className="w-10 h-10 object-cover rounded flex-shrink-0"
                />
              )}
              
              {/* Name label - DYNAMICALLY SIZED to align bars */}
              <div className="flex items-center flex-shrink-0" style={{ width: `${nameWidth}px` }}>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap overflow-hidden text-ellipsis">
                  {displayLabel}
                </div>
              </div>
              
              {/* Party label right before bar - tighter spacing */}
              <div className="text-xs text-gray-500 dark:text-gray-400 w-3 flex-shrink-0 text-right">
                {item.leftLabel || ''}
              </div>
              
              {/* Bar container */}
              <div className="flex-1 min-w-0 relative flex items-center">
                <div className="flex h-10 w-full">
                  {item.segments.map((seg, sIdx) => {
                    const segmentId = `${idx}-${sIdx}`;
                    const isSegmentHovered = hoveredSegment === segmentId;
                    const isLabelHovered = hoveredLabel === seg.label && !hoveredSegment;
                    const isHighlighted = isSegmentHovered || isLabelHovered;
                    
                    const segmentPercentOfTotal = (seg.value / itemTotal) * 100;
                    const barWidthPercent = (itemTotal / maxTotal) * 100;
                    const segmentWidth = (segmentPercentOfTotal / 100) * barWidthPercent;
                    
                    return (
                      <div
                        key={sIdx}
                        className="transition-all duration-200 cursor-pointer relative"
                        style={{ 
                          width: `${segmentWidth}%`,
                          backgroundColor: seg.color,
                          filter: isHighlighted ? 'brightness(1.1)' : 'none',
                          transform: isHighlighted ? 'scaleY(1.05)' : 'scaleY(1)'
                        }}
                        onMouseEnter={() => {
                          setHoveredSegment(segmentId);
                          setHoveredLabel(seg.label);
                        }}
                        onMouseLeave={() => {
                          setHoveredSegment(null);
                          setHoveredLabel(null);
                        }}
                      >
                        {isHighlighted && (
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded shadow-lg z-20 whitespace-nowrap">
                            <p className="text-xs font-semibold">{seg.label}</p>
                            <p className="text-xs text-gray-300">{formatDollars(seg.value)}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Total amount */}
                <div 
                  className="absolute text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap ml-2"
                  style={{ left: `${(itemTotal / maxTotal) * 100}%` }}
                >
                  {formatDollars(itemTotal)}
                </div>
              </div>
              
              {/* Right padding */}
              <div className="w-20 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Filter labels */}
      {showLocalFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <FilterControls 
            data={data}
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