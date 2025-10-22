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

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return React.createElement('div', { className: 'w-full' },
    title && React.createElement('h2', { className: 'text-xl font-bold mb-6 text-gray-900' }, title),
    React.createElement('div', { className: 'mb-6 pb-4 border-b border-gray-200' },
      React.createElement('div', { className: 'flex flex-wrap gap-4' },
        filteredLines.map((line, idx) => {
          const isHighlighted = hoveredLine === line.dataKey;
          const shouldDim = hoveredLine && !isHighlighted;
          const linkUrl = line.linkUrl;
          
          const imageElement = line.imageUrl 
            ? React.createElement('img', {
                src: line.imageUrl,
                alt: line.label,
                className: 'w-6 h-6 rounded-full object-cover flex-shrink-0 transition-all duration-200' + (isHighlighted ? ' ring-2 ring-offset-1 ring-gray-400' : ''),
                style: { opacity: shouldDim ? 0.5 : 1 }
              })
            : React.createElement('div', {
                className: 'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 transition-all duration-200' + (isHighlighted ? ' ring-2 ring-offset-1 ring-gray-400' : ''),
                style: { backgroundColor: line.color, opacity: shouldDim ? 0.5 : 1 }
              }, getInitials(line.label));
          
          const labelElement = React.createElement('span', {
            className: 'text-sm transition-all duration-200' + (isHighlighted ? ' font-bold' : ''),
            style: { opacity: shouldDim ? 0.5 : 1 }
          }, line.label);
          
          const contentElements = [imageElement, labelElement];
          
          return React.createElement('div', {
            key: idx,
            className: 'flex items-center gap-2 transition-all duration-200 ' + (linkUrl ? 'cursor-pointer' : ''),
            onMouseEnter: () => setHoveredLine(line.dataKey),
            onMouseLeave: () => setHoveredLine(null)
          },
            linkUrl 
              ? React.createElement('a', {
                  href: linkUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'flex items-center gap-2 hover:underline'
                }, ...contentElements)
              : contentElements
          );
        })
      )
    ),
    React.createElement(ResponsiveContainer, { width: '100%', height: 400 },
      React.createElement(LineChart, { data: chartData, margin: { top: 5, right: 20, left: 20, bottom: 20 } },
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
            name: line.label,
            stroke: line.color,
            strokeWidth: hoveredLine === line.dataKey || hoveredDot === line.dataKey ? 3 : 2,
            strokeOpacity: (hoveredLine && hoveredLine !== line.dataKey && hoveredDot !== line.dataKey) ? 0.3 : 1,
            dot: false,
            activeDot: {
              r: 5,
              onMouseEnter: () => {
                setHoveredDot(line.dataKey);
                setHoveredLine(line.dataKey);
              },
              onMouseLeave: () => {
                setHoveredDot(null);
                setHoveredLine(null);
              }
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
function SegmentedBarChart({ data, title, legendLabel, hideEndLabels }) {
  const [hoveredLabel, setHoveredLabel] = React.useState(null);
  const [hoveredSegment, setHoveredSegment] = React.useState(null);
  const [hoveredLabelSource, setHoveredLabelSource] = React.useState(null);

  const formatDollars = (value) => {
    if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
    return '$' + value;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLastName = (fullName) => {
    const parts = fullName.trim().split(/\\s+/);
    return parts[parts.length - 1].toLowerCase();
  };

  // Separate candidates with and without data
  const candidatesWithData = data.filter(item => !item.hasNoData);
  const candidatesWithoutData = data.filter(item => item.hasNoData);

  // Group candidates by contest (position + subregion)
  const groupedData = [];
  const seenContests = new Set();
  
  candidatesWithData.forEach(item => {
    const contestKey = item.subregion_value 
      ? item.position + ' ' + item.subregion_value
      : item.position;
    
    if (!seenContests.has(contestKey)) {
      seenContests.add(contestKey);
      groupedData.push([contestKey, []]);
    }
    
    const group = groupedData.find(([key]) => key === contestKey);
    group[1].push(item);
  });

  // Calculate max total for bar width scaling
  const maxTotal = Math.max(...candidatesWithData.map(item => 
    item.segments.reduce((sum, seg) => sum + seg.value, 0)
  ), 1);

  // Extract unique labels and colors for legend
  const uniqueLabels = Array.from(new Set(
    candidatesWithData.flatMap(item => item.segments.map(seg => seg.label))
  ));

  const labelColors = {};
  candidatesWithData.forEach(item => {
    item.segments.forEach(seg => {
      if (!labelColors[seg.label]) {
        labelColors[seg.label] = seg.color;
      }
    });
  });

  return React.createElement('div', { className: 'w-full' },
    title && React.createElement('h2', { className: 'text-xl font-bold text-gray-900 mb-6' }, title),
    uniqueLabels.length > 1 && React.createElement('div', { className: 'mb-6 pb-4 border-b border-gray-200' },
      legendLabel && React.createElement('div', { className: 'text-xs font-semibold text-gray-600 mb-3 uppercase' }, legendLabel),
      React.createElement('div', { className: 'flex flex-wrap gap-4' },
        uniqueLabels.map((label, idx) =>
          React.createElement('div', {
            key: idx,
            className: 'flex items-center gap-2 transition-all duration-200 cursor-pointer' + 
              (hoveredLabel === label && hoveredLabelSource === 'legend' ? ' opacity-100' : 
               hoveredLabel && hoveredLabel !== label ? ' opacity-40' : ' opacity-70 hover:opacity-100'),
            onMouseEnter: () => {
              setHoveredLabel(label);
              setHoveredLabelSource('legend');
            },
            onMouseLeave: () => {
              setHoveredLabel(null);
              setHoveredLabelSource(null);
            }
          },
            React.createElement('div', {
              className: 'w-4 h-4',
              style: { backgroundColor: labelColors[label] }
            }),
            React.createElement('span', { className: 'text-sm' }, label)
          )
        )
      )
    ),
    React.createElement('div', { className: 'space-y-8' },
      groupedData.map(([contestName, items]) => {
        const contestCandidatesWithoutData = candidatesWithoutData.filter(item => {
          const contestKey = item.subregion_value 
            ? item.position + ' ' + item.subregion_value
            : item.position;
          return contestKey === contestName;
        });

        return React.createElement('div', { key: contestName },
          React.createElement('div', { className: 'flex items-center gap-4 mb-3' },
            React.createElement('span', { 
              className: 'inline-block text-xs font-bold text-gray-800 uppercase tracking-wide px-3 py-1.5 bg-gray-200 rounded' 
            }, contestName),
            React.createElement('div', { className: 'flex-1 h-px bg-gray-300' })
          ),
          React.createElement('div', { className: 'space-y-4' },
            [...items, ...contestCandidatesWithoutData].sort((a, b) => {
              const aLastName = getLastName(a.label);
              const bLastName = getLastName(b.label);
              return aLastName.localeCompare(bLastName);
            }).map((item, idx) => {
              const itemTotal = item.segments.reduce((sum, s) => sum + s.value, 0);
              const displayLabel = item.displayLabel || item.label;
              const uniqueRowId = contestName.replace(/\\s+/g, '-') + '-' + item.label.replace(/\\s+/g, '-');
              const linkUrl = item.linkUrl;

              if (item.hasNoData) {
                return React.createElement('div', {
                  key: idx,
                  className: 'flex items-center gap-4'
                },
                  item.imageUrl && React.createElement('img', {
                    src: item.imageUrl,
                    alt: item.label,
                    className: 'w-10 h-10 object-cover rounded flex-shrink-0'
                  }),
                  React.createElement('div', { className: 'flex items-center flex-shrink-0', style: { width: '160px' } },
                    linkUrl 
                      ? React.createElement('a', {
                          href: linkUrl,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                          className: 'text-sm font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:underline'
                        }, displayLabel)
                      : React.createElement('div', {
                          className: 'text-sm font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis'
                        }, displayLabel)
                  ),
                  React.createElement('div', { className: 'flex-1 min-w-0 relative flex items-center' },
                    React.createElement('div', { className: 'flex h-10 w-full items-center' },
                      React.createElement('div', { className: 'text-xs italic text-gray-400' }, 'No financial data submitted')
                    )
                  )
                );
              }

              const imageElement = item.imageUrl
                ? React.createElement('img', {
                    src: item.imageUrl,
                    alt: displayLabel,
                    className: 'w-6 h-6 rounded-full object-cover flex-shrink-0'
                  })
                : React.createElement('div', {
                    className: 'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0',
                    style: { backgroundColor: item.segments[0]?.color || '#9ca3af' }
                  }, getInitials(item.label));

              const labelTextElement = React.createElement('div', {
                className: 'text-sm font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis'
              }, displayLabel);

              let labelContent;
              if (linkUrl) {
                labelContent = React.createElement('a', {
                  href: linkUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'flex items-center gap-2 hover:underline min-w-0'
                }, imageElement, labelTextElement);
              } else {
                labelContent = React.createElement('div', { className: 'flex items-center gap-2 min-w-0' }, 
                  imageElement, labelTextElement
                );
              }

              return React.createElement('div', {
                key: idx,
                className: 'flex items-center gap-3'
              },
                React.createElement('div', { className: 'w-40 flex-shrink-0 min-w-0' }, labelContent),
                React.createElement('div', { className: 'text-xs text-gray-500 w-3 flex-shrink-0 text-right' }, item.leftLabel || ''),
                React.createElement('div', { className: 'flex-1 min-w-0 relative flex items-center' },
                  React.createElement('div', { className: 'flex h-10 w-full' },
                    item.segments.map((seg, sIdx) => {
                      const segmentId = uniqueRowId + '-' + sIdx;
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
                        isHighlighted && hoveredLabelSource === 'segment' && seg.tooltipText && React.createElement('div', {
                          className: 'absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded shadow-lg z-20 whitespace-nowrap'
                        },
                          React.createElement('p', { className: 'text-xs font-semibold' }, seg.label),
                          React.createElement('p', { className: 'text-xs text-gray-300' }, seg.tooltipText)
                        )
                      );
                    })
                  ),
                  !hideEndLabels && React.createElement('div', {
                    className: 'absolute text-sm font-semibold text-gray-900 whitespace-nowrap ml-2',
                    style: { left: ((itemTotal / maxTotal) * 100) + '%' }
                  }, item.formattedTotal || formatDollars(itemTotal))
                ),
                React.createElement('div', { className: 'w-20 flex-shrink-0' })
              );
            })
          )
        );
      })
    )
  );
}`;