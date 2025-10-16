// Standalone chart component code for embedding
export const LINE_CHART_TEMPLATE = `
function CampaignLineChart({ data, title, yAxisLabel, xAxisLabel, activeFilter }) {
  const [hoveredLine, setHoveredLine] = React.useState(null);
  const [hoveredDot, setHoveredDot] = React.useState(null);

  const matchesFilter = (line, filterId) => {
    if (filterId === 'all') return true;
    if (line.position === filterId) return true;
    if (filterId.includes(':')) {
      const [position, subregion] = filterId.split(':');
      return line.position === position && line.subregion_value === subregion;
    }
    return false;
  };

  const filteredLines = activeFilter === 'all' 
    ? data.lines 
    : data.lines.filter(line => matchesFilter(line, activeFilter));

  const chartData = filteredLines[0].points.map((point, index) => {
    const dataPoint = { date: point.date };
    filteredLines.forEach(line => {
      dataPoint[line.dataKey] = line.points[index].value;
    });
    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const date = new Date(label);
    
    if (hoveredDot) {
      const dotData = payload.find(p => p.dataKey === hoveredDot);
      if (!dotData) return null;
      return React.createElement('div', { className: 'bg-gray-900 text-white px-3 py-2 rounded shadow-lg' },
        React.createElement('p', { className: 'text-xs font-semibold' },
          dotData.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
        ),
        React.createElement('p', { className: 'text-xs text-gray-300' },
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        )
      );
    }
    
    return React.createElement('div', { className: 'bg-gray-900 text-white px-4 py-3 rounded shadow-lg max-w-xs' },
      React.createElement('p', { className: 'text-xs text-gray-300 mb-2 font-medium' },
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      ),
      React.createElement('div', { className: 'space-y-1' },
        payload.map((entry, index) => {
          const line = data.lines.find(l => l.dataKey === entry.dataKey);
          return React.createElement('div', { key: index, className: 'flex items-center justify-between gap-3' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('div', { className: 'w-3 h-3 rounded-sm', style: { backgroundColor: entry.color } }),
              React.createElement('span', { className: 'text-xs' }, line?.label)
            ),
            React.createElement('span', { className: 'text-xs font-semibold' },
              entry.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
            )
          );
        })
      )
    );
  };

  const formatYAxis = (value) => {
    if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
    return '$' + value;
  };

  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    if (date.getDate() <= 7) return date.toLocaleString('en-US', { month: 'short' });
    return '';
  };

  return React.createElement('div', { className: 'w-full' },
    title && React.createElement('h2', { className: 'text-xl font-bold mb-6 text-gray-900' }, title),
    React.createElement('div', { className: 'mb-6 pb-4 border-b border-gray-200' },
      React.createElement('div', { className: 'flex flex-wrap gap-4' },
        filteredLines.map((line, idx) => {
          const isHighlighted = hoveredLine === line.dataKey;
          const shouldDim = hoveredLine && !isHighlighted;
          const linkUrl = line.linkUrl;
          return React.createElement('div', {
            key: idx,
            className: 'flex items-center gap-2 transition-all duration-200 ' + (linkUrl ? 'cursor-pointer' : '') + ' ' + (shouldDim ? 'opacity-50' : 'opacity-100'),
            onMouseEnter: () => setHoveredLine(line.dataKey),
            onMouseLeave: () => setHoveredLine(null)
          },
            React.createElement('div', { className: 'w-4 h-4 flex-shrink-0', style: { backgroundColor: line.color } }),
            linkUrl ? 
              React.createElement('a', {
                href: linkUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'text-sm text-gray-900 relative inline-block hover:underline'
              },
                React.createElement('span', { className: 'font-bold invisible', 'aria-hidden': 'true' }, line.label),
                React.createElement('span', { className: 'absolute inset-0 ' + (isHighlighted ? 'font-bold' : '') }, line.label)
              ) :
              React.createElement('span', { 
                className: 'text-sm text-gray-900 relative inline-block'
              }, 
                React.createElement('span', { className: 'font-bold invisible', 'aria-hidden': 'true' }, line.label),
                React.createElement('span', { className: 'absolute inset-0 ' + (isHighlighted ? 'font-bold' : '') }, line.label)
              )
          );
        })
      )
    ),
    React.createElement(ResponsiveContainer, { width: '100%', height: 400 },
      React.createElement(LineChart, { data: chartData, margin: { top: 20, right: 20, bottom: 20, left: 20 } },
        React.createElement(CartesianGrid, { strokeDasharray: '3 3', stroke: '#e5e7eb' }),
        React.createElement(XAxis, {
          dataKey: 'date',
          tickFormatter: formatXAxis,
          tick: { fontSize: 12, fill: '#6b7280' },
          stroke: '#9ca3af',
          label: xAxisLabel ? { 
            value: xAxisLabel, 
            position: 'insideBottom', 
            offset: -10, 
            style: { fontSize: 11, fill: '#6b7280', fontWeight: 600, textTransform: 'uppercase' } 
          } : undefined
        }),
        React.createElement(YAxis, {
          tickFormatter: formatYAxis,
          tick: { fontSize: 12, fill: '#6b7280' },
          stroke: '#9ca3af',
          label: { 
            value: yAxisLabel, 
            angle: -90, 
            position: 'insideLeft', 
            style: { fontSize: 11, fill: '#6b7280', fontWeight: 600, textTransform: 'uppercase', textAnchor: 'middle' } 
          }
        }),
        React.createElement(Tooltip, { content: React.createElement(CustomTooltip) }),
        filteredLines.map((line) =>
          React.createElement(Line, {
            key: line.dataKey,
            type: 'linear',
            dataKey: line.dataKey,
            stroke: line.color,
            strokeWidth: (hoveredLine === line.dataKey || hoveredDot === line.dataKey) ? 3 : 2,
            strokeOpacity: (hoveredLine && hoveredLine !== line.dataKey && hoveredDot !== line.dataKey) ? 0.3 : 1,
            dot: false,
            activeDot: {
              r: 5,
              onMouseEnter: () => { setHoveredDot(line.dataKey); setHoveredLine(line.dataKey); },
              onMouseLeave: () => { setHoveredDot(null); setHoveredLine(null); }
            },
            onMouseEnter: () => setHoveredLine(line.dataKey),
            onMouseLeave: () => setHoveredLine(null),
            isAnimationActive: false
          })
        )
      )
    )
  );
}`;

export const BAR_CHART_TEMPLATE = `
function SegmentedBarChart({ data, title, legendLabel, activeFilter, hideEndLabels }) {
  const [hoveredSegment, setHoveredSegment] = React.useState(null);
  const [hoveredLabel, setHoveredLabel] = React.useState(null);
  const [hoveredLabelSource, setHoveredLabelSource] = React.useState(null);

  const allSegmentTypes = {};
  data.forEach(item => {
    item.segments.forEach(seg => {
      if (!allSegmentTypes[seg.label]) allSegmentTypes[seg.label] = seg.color;
    });
  });
  
  const legendItems = Object.entries(allSegmentTypes).map(([label, color]) => ({ label, color }));

  const matchesFilter = (item, filterId) => {
    if (filterId === 'all') return true;
    if (item.position === filterId) return true;
    if (filterId.includes(':')) {
      const [position, subregion] = filterId.split(':');
      return item.position === position && item.subregion_value === subregion;
    }
    return false;
  };

  const filteredData = activeFilter === 'all' 
    ? data 
    : data.filter(item => matchesFilter(item, activeFilter));

  const maxTotal = Math.max(...filteredData.map(item => 
    item.segments.reduce((sum, seg) => sum + seg.value, 0)
  ));

  const formatDollars = (val) => {
    if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'K';
    return '$' + val;
  };

  const processedLabels = filteredData.map(item => item.label);
  const longestNameLength = Math.max(...processedLabels.map(label => label.length));
  const nameWidth = Math.max(longestNameLength * 8 + 8, 80);

  return React.createElement('div', { className: 'w-full' },
    title && React.createElement('h2', { className: 'text-xl font-bold mb-6 text-gray-900' }, title),
    React.createElement('div', { className: 'mb-6 pb-4 border-b border-gray-200' },
      legendLabel && React.createElement('div', { className: 'text-xs font-semibold text-gray-600 mb-3 uppercase' }, legendLabel),
      React.createElement('div', { className: 'flex flex-wrap gap-4' },
        legendItems.map((item, idx) => {
          const isHighlighted = hoveredLabel === item.label;
          return React.createElement('div', {
            key: idx,
            className: 'flex items-center gap-2 transition-all duration-200 cursor-pointer ' + (hoveredLabel && !isHighlighted ? 'opacity-50' : 'opacity-100'),
            onMouseEnter: () => { setHoveredLabel(item.label); setHoveredLabelSource('legend'); },
            onMouseLeave: () => { setHoveredLabel(null); setHoveredLabelSource(null); }
          },
            React.createElement('div', { className: 'w-4 h-4 flex-shrink-0', style: { backgroundColor: item.color } }),
            React.createElement('span', { 
              className: 'text-sm text-gray-900 relative inline-block'
            },
              React.createElement('span', { className: 'font-bold invisible', 'aria-hidden': 'true' }, item.label),
              React.createElement('span', { className: 'absolute inset-0 ' + (isHighlighted ? 'font-bold' : '') }, item.label)
            )
          );
        })
      )
    ),
    React.createElement('div', { className: 'space-y-4' },
      filteredData.map((item, idx) => {
        const itemTotal = item.segments.reduce((sum, s) => sum + s.value, 0);
        return React.createElement('div', { key: idx, className: 'flex items-center gap-4' },
          item.imageUrl && React.createElement('img', {
            src: item.imageUrl,
            alt: item.label,
            className: 'w-10 h-10 object-cover rounded flex-shrink-0'
          }),
          React.createElement('div', { className: 'flex items-center flex-shrink-0', style: { width: nameWidth + 'px' } },
            item.linkUrl ?
              React.createElement('a', {
                href: item.linkUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'text-sm font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:underline'
              }, item.label) :
              React.createElement('div', { 
                className: 'text-sm font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis' 
              }, item.label)
          ),
          React.createElement('div', { className: 'text-xs text-gray-500 w-3 flex-shrink-0 text-right' }, item.leftLabel || ''),
          React.createElement('div', { className: 'flex-1 min-w-0 relative flex items-center' },
            React.createElement('div', { className: 'flex h-10 w-full' },
              item.segments.map((seg, sIdx) => {
                const segmentId = idx + '-' + sIdx;
                const isSegmentHovered = hoveredSegment === segmentId;
                const isLabelHovered = hoveredLabel === seg.label && !hoveredSegment;
                const isHighlighted = isSegmentHovered || isLabelHovered;
                const segmentPercentOfTotal = (seg.value / itemTotal) * 100;
                const barWidthPercent = (itemTotal / maxTotal) * 100;
                const segmentWidth = (segmentPercentOfTotal / 100) * barWidthPercent;
                
                return React.createElement('div', {
                  key: sIdx,
                  className: 'transition-all duration-200 cursor-pointer relative',
                  style: {
                    width: segmentWidth + '%',
                    backgroundColor: seg.color,
                    filter: isHighlighted ? 'brightness(1.1)' : 'none',
                    transform: isHighlighted ? 'scaleY(1.05)' : 'scaleY(1)'
                  },
                  onMouseEnter: () => {
                    setHoveredSegment(segmentId);
                    setHoveredLabel(seg.label);
                    setHoveredLabelSource('segment');
                  },
                  onMouseLeave: () => {
                    setHoveredSegment(null);
                    setHoveredLabel(null);
                    setHoveredLabelSource(null);
                  }
                },
                  isHighlighted && hoveredLabelSource === 'segment' && React.createElement('div', {
                    className: 'absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded shadow-lg z-20 whitespace-nowrap'
                  },
                    React.createElement('p', { className: 'text-xs font-semibold' }, seg.label),
                    React.createElement('p', { className: 'text-xs text-gray-300' },
                      seg.originalValue !== undefined
                        ? seg.value.toFixed(1) + '% (' + formatDollars(seg.originalValue) + ')'
                        : formatDollars(seg.value)
                    )
                  )
                );
              })
            ),
            !hideEndLabels && React.createElement('div', {
              className: 'absolute text-sm font-semibold text-gray-900 whitespace-nowrap ml-2',
              style: { left: ((itemTotal / maxTotal) * 100) + '%' }
            }, formatDollars(itemTotal))
          ),
          React.createElement('div', { className: 'w-20 flex-shrink-0' })
        );
      })
    )
  );
}`;