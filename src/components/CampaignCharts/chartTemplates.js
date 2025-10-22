// Standalone chart component code for embedding
// Uses only React.createElement syntax for exportable HTML

export const LINE_CHART_TEMPLATE = `
  // === Shared: FilterControls (standalone) ===
  function StandaloneFilterControls({ data, activeFilter, hoveredFilter, onFilterClick, onFilterHover }) {
    const POSITION_ORDER = ['mayor', 'city council'];
    const structure = { positions: {} };
    (data.lines || []).forEach(l => {
      const pos = l.position || 'Other';
      if (!structure.positions[pos]) structure.positions[pos] = { subs: new Set() };
      if (l.subregion_value) structure.positions[pos].subs.add(l.subregion_value);
    });
    const sortedPositions = Object.keys(structure.positions).sort((a,b) => {
      const ai = POSITION_ORDER.indexOf(a.toLowerCase());
      const bi = POSITION_ORDER.indexOf(b.toLowerCase());
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    const opts = [{ id:'all', label:'All', type:'all' }];
    sortedPositions.forEach(p => {
      const pos = structure.positions[p];
      opts.push({ id:p, label:p, type:'position' });
      Array.from(pos.subs).sort().forEach(s => {
        opts.push({ id:\`\${p}:\${s}\`, label:s, type:'subregion', parentPosition:p });
      });
    });

    return React.createElement(
      'div',
      { className:'flex flex-wrap gap-2 items-baseline' },
      opts.map((f, idx) => {
        const isActive = activeFilter === f.id;
        const isHovered = hoveredFilter === f.id;
        const pieces = [];

        const showOpen = f.type === 'subregion' && idx > 0 && opts[idx-1].type === 'position';
        if (showOpen) pieces.push(React.createElement('span', { key:\`o-\${f.id}\`, className:'text-gray-400 dark:text-gray-600 mx-1' }, '('));

        pieces.push(
          React.createElement(
            'button',
            {
              key:f.id,
              onClick: () => onFilterClick && onFilterClick(f.id),
              onMouseEnter: () => onFilterHover && onFilterHover(f.id),
              onMouseLeave: () => onFilterHover && onFilterHover(null),
              className: \`px-2 py-1 rounded transition-all duration-200 cursor-pointer \${isActive ? 'font-bold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} \${!isActive && !isHovered ? 'opacity-70' : 'opacity-100'}\`
            },
            f.label
          )
        );

        const next = opts[idx+1];
        const sameParentNext = next && next.parentPosition === f.parentPosition;
        if (f.type === 'subregion' && next && sameParentNext) {
          pieces.push(React.createElement('span', { key:\`c-\${f.id}\`, className:'text-gray-400 dark:text-gray-600' }, ','));
        }
        if (f.type === 'subregion' && next && !sameParentNext) {
          pieces.push(React.createElement('span', { key:\`cl-\${f.id}\`, className:'text-gray-400 dark:text-gray-600 mx-1' }, ')'));
        }
        if (f.type === 'subregion' && !next) {
          pieces.push(React.createElement('span', { key:\`clx-\${f.id}\`, className:'text-gray-400 dark:text-gray-600 mx-1' }, ')'));
        }

        return React.createElement(React.Fragment, { key:\`frag-\${f.id}\` }, pieces);
      })
    );
  }

  // === Line helpers ===
  function matchesLineFilter(line, filterId) {
    if (filterId === 'all') return true;
    if (line.position === filterId) return true;
    if (filterId && filterId.indexOf(':') !== -1) {
      const parts = filterId.split(':');
      return line.position === parts[0] && String(line.subregion_value) === String(parts[1]);
    }
    return false;
  }
  function formatYAxis(value) {
    if (value >= 1000000) return '$' + (value/1000000).toFixed(1) + 'M';
    if (value >= 1000) return '$' + (value/1000).toFixed(0) + 'K';
    return '$' + value;
  }
  function formatXAxis(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    if (day <= 7) return d.toLocaleString('en-US', { month:'short' });
    return '';
  }

  // === Line chart component (standalone) ===
  function CampaignLineChart({ data, title, yAxisLabel, xAxisLabel, activeFilter }) {
    const { useState } = React;
    const [hoveredLine, setHoveredLine] = useState(null);
    const [hoveredDot, setHoveredDot] = useState(null);
    const [localHoveredFilter, setLocalHoveredFilter] = useState(null);

    const filteredLines = (activeFilter === 'all' ? (data.lines || []) : (data.lines || []).filter(l => matchesLineFilter(l, activeFilter)));
    const safeLines = filteredLines.length ? filteredLines : (data.lines || []);

    // Build recharts data
    const chartData = (safeLines[0] && safeLines[0].points ? safeLines[0].points : []).map((p, idx) => {
      const row = { date: p.date };
      safeLines.forEach(l => {
        const val = (l.points && l.points[idx]) ? l.points[idx].value : null;
        row[l.dataKey] = val;
      });
      return row;
    });

    // Tooltip
    function CustomTooltip({ active, payload, label }) {
      if (!(active && payload && payload.length)) return null;
      const date = new Date(label);
      if (hoveredDot) {
        const dotData = payload.find(p => p.dataKey === hoveredDot);
        if (!dotData) return null;
        return React.createElement(
          'div',
          { className:'bg-gray-900 text-white px-3 py-2 rounded shadow-lg' },
          React.createElement('p', { className:'text-xs font-semibold' },
            Number(dotData.value).toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits:0, maximumFractionDigits:0 })
          ),
          React.createElement('p', { className:'text-xs text-gray-300' },
            date.toLocaleDateString('en-US', { month:'short', day:'numeric' })
          )
        );
      }
      return React.createElement(
        'div',
        { className:'bg-gray-900 text-white px-4 py-3 rounded shadow-lg max-w-xs' },
        React.createElement('p', { className:'text-xs text-gray-300 mb-2 font-medium' },
          date.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
        ),
        React.createElement(
          'div',
          { className:'space-y-1' },
          payload.map((entry, i) => {
            const line = (data.lines || []).find(l => l.dataKey === entry.dataKey);
            return React.createElement(
              'div',
              { key:i, className:'flex items-center justify-between gap-3' },
              React.createElement(
                'div',
                { className:'flex items-center gap-2' },
                React.createElement('div', { className:'w-3 h-3 rounded-sm', style:{ backgroundColor: entry.color } }),
                React.createElement('span', { className:'text-xs' }, line && line.label ? line.label : entry.dataKey)
              ),
              React.createElement(
                'span',
                { className:'text-xs font-semibold' },
                Number(entry.value).toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits:0, maximumFractionDigits:0 })
              )
            );
          })
        )
      );
    }

    // Legend
    const legendRow = React.createElement(
      'div',
      { className:'mb-6 pb-4 border-b border-gray-200 dark:border-gray-700' },
      React.createElement(
        'div',
        { className:'flex flex-wrap gap-4' },
        safeLines.map((line, idx) => {
          const isHighlighted = hoveredLine === line.dataKey;
          const isHighlightedByFilter = localHoveredFilter && matchesLineFilter(line, localHoveredFilter);
          const shouldDim = (hoveredLine && !isHighlighted) || (localHoveredFilter && !isHighlightedByFilter);
          const bold = isHighlighted || isHighlightedByFilter;

          const labelSpan = React.createElement(
            'span',
            { className:\`text-sm text-gray-900 dark:text-gray-100 relative inline-block \` },
            React.createElement('span', { className:'font-bold invisible', 'aria-hidden':'true' }, line.label),
            React.createElement('span', { className:\`absolute inset-0 \${bold ? 'font-bold' : ''}\` }, line.label)
          );

          const label = line.linkUrl
            ? React.createElement('a', { href: line.linkUrl, target:'_blank', rel:'noopener noreferrer', className:'text-sm text-gray-900 dark:text-gray-100 relative inline-block hover:underline' }, labelSpan)
            : labelSpan;

          return React.createElement(
            'div',
            {
              key: idx,
              className:\`flex items-center gap-2 transition-all duration-200 \${line.linkUrl ? 'cursor-pointer' : ''} \${shouldDim ? 'opacity-50' : 'opacity-100'}\`,
              onMouseEnter: () => setHoveredLine(line.dataKey),
              onMouseLeave: () => setHoveredLine(null)
            },
            React.createElement('div', { className:'w-4 h-4 flex-shrink-0', style:{ backgroundColor: line.color } }),
            label
          );
        })
      )
    );

    // Chart
    return React.createElement(
      'div',
      { className:'w-full' },
      React.createElement(
        'div',
        { className:'flex justify-between items-start mb-6' },
        title ? React.createElement('h2', { className:'text-xl font-bold text-gray-900 dark:text-gray-100' }, title) : null
      ),
      legendRow,
      React.createElement(
        ResponsiveContainer,
        { width:'100%', height:400 },
        React.createElement(
          LineChart,
          { data: chartData, margin:{ top:20, right:20, bottom:20, left:20 } },
          React.createElement(CartesianGrid, { strokeDasharray:'3 3', stroke:'#e5e7eb' }),
          React.createElement(XAxis, {
            dataKey:'date',
            tickFormatter: formatXAxis,
            tick:{ fontSize:12, fill:'#6b7280' },
            stroke:'#9ca3af',
            label: xAxisLabel ? { value:xAxisLabel, position:'insideBottom', offset:-10, style:{ fontSize:11, fill:'#6b7280', fontWeight:600, textTransform:'uppercase' } } : undefined
          }),
          React.createElement(YAxis, {
            tickFormatter: formatYAxis,
            tick:{ fontSize:12, fill:'#6b7280' },
            stroke:'#9ca3af',
            label:{ value:yAxisLabel, angle:-90, position:'insideLeft', style:{ fontSize:11, fill:'#6b7280', fontWeight:600, textTransform:'uppercase', textAnchor:'middle' } }
          }),
          React.createElement(Tooltip, { content: React.createElement(CustomTooltip, null) }),
          safeLines.map(line =>
            React.createElement(Line, {
              key: line.dataKey,
              type:'linear',
              dataKey: line.dataKey,
              name: line.label,
              stroke: line.color,
              strokeWidth: (hoveredLine === line.dataKey || hoveredDot === line.dataKey || (localHoveredFilter && matchesLineFilter(line, localHoveredFilter))) ? 3 : 2,
              strokeOpacity: ((hoveredLine && hoveredLine !== line.dataKey && hoveredDot !== line.dataKey) || (localHoveredFilter && !matchesLineFilter(line, localHoveredFilter))) ? 0.3 : 1,
              dot:false,
              activeDot:{
                r:5,
                onMouseEnter: () => { setHoveredDot(line.dataKey); setHoveredLine(line.dataKey); },
                onMouseLeave: () => { setHoveredDot(null); setHoveredLine(null); }
              },
              onMouseEnter: () => setHoveredLine(line.dataKey),
              onMouseLeave: () => setHoveredLine(null),
              isAnimationActive:false,
              style:{ transition:'stroke-width 1000ms cubic-bezier(0.4,0,0.2,1), stroke-opacity 1000ms cubic-bezier(0.4,0,0.2,1)' }
            })
          )
        )
      ),
      React.createElement(
        'div',
        { className:'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700' },
        React.createElement(StandaloneFilterControls, {
          data,
          activeFilter: activeFilter || 'all',
          hoveredFilter: null,
          onFilterClick: () => {}, // read-only in exported HTML
          onFilterHover: setLocalHoveredFilter
        })
      )
    );
  }
`;
export const BAR_CHART_TEMPLATE = `
  // === Bar chart helpers ===
  function StandaloneBarFilterControls({ data, activeFilter, hoveredFilter, onFilterClick, onFilterHover }) {
    const POSITION_ORDER = ['mayor', 'city council'];
    const structure = { positions: {} };
    const items = Array.isArray(data) ? data : [];
    
    items.forEach(item => {
      const pos = item.position || 'Other';
      if (!structure.positions[pos]) structure.positions[pos] = { subs: new Set() };
      if (item.subregion_value) structure.positions[pos].subs.add(item.subregion_value);
    });
    
    const sortedPositions = Object.keys(structure.positions).sort((a,b) => {
      const ai = POSITION_ORDER.indexOf(a.toLowerCase());
      const bi = POSITION_ORDER.indexOf(b.toLowerCase());
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    
    const opts = [{ id:'all', label:'All', type:'all' }];
    sortedPositions.forEach(p => {
      const pos = structure.positions[p];
      opts.push({ id:p, label:p, type:'position' });
      Array.from(pos.subs).sort().forEach(s => {
        opts.push({ id:\`\${p}:\${s}\`, label:s, type:'subregion', parentPosition:p });
      });
    });

    return React.createElement(
      'div',
      { className:'flex flex-wrap gap-2 items-baseline' },
      opts.map((f, idx) => {
        const isActive = activeFilter === f.id;
        const isHovered = hoveredFilter === f.id;
        const pieces = [];
        const showOpen = f.type === 'subregion' && idx > 0 && opts[idx-1].type === 'position';
        if (showOpen) pieces.push(React.createElement('span', { key:\`o-\${f.id}\`, className:'text-gray-400 dark:text-gray-600 mx-1' }, '('));
        pieces.push(
          React.createElement('button', {
            key:f.id,
            onClick: () => onFilterClick && onFilterClick(f.id),
            onMouseEnter: () => onFilterHover && onFilterHover(f.id),
            onMouseLeave: () => onFilterHover && onFilterHover(null),
            className:\`px-2 py-1 rounded transition-all duration-200 cursor-pointer \${isActive ? 'font-bold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} \${!isActive && !isHovered ? 'opacity-70' : 'opacity-100'}\`
          }, f.label)
        );
        const next = opts[idx+1];
        const sameParentNext = next && next.parentPosition === f.parentPosition;
        if (f.type === 'subregion' && next && sameParentNext) pieces.push(React.createElement('span', { key:\`c-\${f.id}\`, className:'text-gray-400 dark:text-gray-600' }, ','));
        if (f.type === 'subregion' && next && !sameParentNext) pieces.push(React.createElement('span', { key:\`cl-\${f.id}\`, className:'text-gray-400 dark:text-gray-600 mx-1' }, ')'));
        if (f.type === 'subregion' && !next) pieces.push(React.createElement('span', { key:\`clx-\${f.id}\`, className:'text-gray-400 dark:text-gray-600 mx-1' }, ')'));
        return React.createElement(React.Fragment, { key:\`frag-\${f.id}\` }, pieces);
      })
    );
  }

  function matchesBarFilter(item, filterId) {
    if (filterId === 'all') return true;
    if (item.position === filterId) return true;
    if (filterId && filterId.indexOf(':') !== -1) {
      const parts = filterId.split(':');
      return item.position === parts[0] && String(item.subregion_value) === String(parts[1]);
    }
    return false;
  }
  
  function formatDollars(val) {
    if (val >= 1000000) return '$' + (val/1000000).toFixed(1) + 'M';
    if (val >= 1000) return '$' + (val/1000).toFixed(0) + 'K';
    return '$' + val;
  }

  function SegmentedBarChart({ data, title, legendLabel, legendOrder, legendColorMap, segmentOrder, activeFilter, hideEndLabels }) {
    const { useState, useEffect } = React;
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [hoveredLabel, setHoveredLabel] = useState(null);
    const [hoveredLabelSource, setHoveredLabelSource] = useState(null);
    const [isNarrow, setIsNarrow] = useState(false);
    const [localHoveredFilter, setLocalHoveredFilter] = useState(null);

    useEffect(() => {
      const check = () => setIsNarrow(window.innerWidth < 768);
      check();
      window.addEventListener('resize', check);
      return () => window.removeEventListener('resize', check);
    }, []);

    const getDisplayLabel = (label) => {
      if (!isNarrow) return label;
      const parts = String(label || '').split(' ');
      return parts[parts.length - 1];
    };

    const filtered = (activeFilter === 'all' ? data : data.filter(d => matchesBarFilter(d, activeFilter)));

    // Build legend items from data
    const allSegs = {};
    data.forEach(item => (item.segments || []).forEach(seg => {
      const label = seg.label;
      if (!allSegs[label]) allSegs[label] = seg.color;
    }));
    
    let legendItems = Object.entries(allSegs).map(([label, color]) => ({ 
      label, 
      color: legendColorMap && legendColorMap[label] ? legendColorMap[label] : color 
    }));
    
    // Apply legend order if provided
    legendItems = legendItems.sort((a,b) => {
      if (Array.isArray(legendOrder) && legendOrder.length) {
        const ai = legendOrder.indexOf(a.label);
        const bi = legendOrder.indexOf(b.label);
        const ap = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
        const bp = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
        if (ap !== bp) return ap - bp;
      }
      return a.label.localeCompare(b.label);
    });
    
    const shouldShowLegend = legendItems.length > 1;

    const withData = filtered.filter(it => (it.segments || []).reduce((s,seg)=>s+seg.value,0) > 0);
    const withoutData = filtered.filter(it => (it.segments || []).reduce((s,seg)=>s+seg.value,0) === 0);

    const groups = [];
    const seen = new Set();
    withData.forEach(it => {
      const key = it.subregion_value ? \`\${it.position} \${it.subregion_value}\` : it.position;
      if (!seen.has(key)) { seen.add(key); groups.push([key, []]); }
      groups.find(g => g[0] === key)[1].push(it);
    });

    const maxTotal = Math.max(...withData.map(it => (it.segments || []).reduce((s,seg)=>s+seg.value,0)), 1);
    const nameWidth = Math.max(...withData.map(it => getDisplayLabel(it.label).length).map(n => n*8 + 8).concat([80]));

    const legendBlock = shouldShowLegend
      ? React.createElement(
          'div',
          { className:'mb-6 pb-4 border-b border-gray-200 dark:border-gray-700' },
          legendLabel ? React.createElement('div', { className:'text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase' }, legendLabel) : null,
          React.createElement(
            'div',
            { className:'flex flex-wrap gap-4' },
            legendItems.map((item, idx) => {
              const isHighlighted = hoveredLabel === item.label;
              return React.createElement(
                'div',
                {
                  key:idx,
                  className:\`flex items-center gap-2 transition-all duration-200 cursor-pointer \${hoveredLabel && !isHighlighted ? 'opacity-50' : 'opacity-100'}\`,
                  onMouseEnter: () => { setHoveredLabel(item.label); setHoveredLabelSource('legend'); },
                  onMouseLeave: () => { setHoveredLabel(null); setHoveredLabelSource(null); }
                },
                React.createElement('div', { className:'w-4 h-4 flex-shrink-0', style:{ backgroundColor:item.color } }),
                React.createElement(
                  'span',
                  { className:'text-sm text-gray-900 dark:text-gray-100 relative inline-block' },
                  React.createElement('span', { className:'font-bold invisible','aria-hidden':'true' }, item.label),
                  React.createElement('span', { className:\`absolute inset-0 \${isHighlighted ? 'font-bold' : ''}\` }, item.label)
                )
              );
            })
          )
        )
      : null;

    return React.createElement(
      'div',
      { className:'w-full' },
      React.createElement(
        'div',
        { className:'flex justify-between items-start mb-6' },
        title ? React.createElement('h2', { className:'text-xl font-bold text-gray-900 dark:text-gray-100' }, title) : null
      ),
      legendBlock,
      React.createElement(
        'div',
        { className:'space-y-8' },
        groups.map(([contestName, items]) => {
          const contestNoData = withoutData.filter(it => {
            const key = it.subregion_value ? \`\${it.position} \${it.subregion_value}\` : it.position;
            return key === contestName;
          });
          return React.createElement(
            'div',
            { key:contestName },
            React.createElement(
              'div',
              { className:'mb-3' },
              React.createElement('h3', { className:'text-sm font-semibold text-gray-700 dark:text-gray-300' }, contestName)
            ),
            React.createElement(
              'div',
              { className:'space-y-3' },
              items.map((item, idx) => {
                const total = (item.segments || []).reduce((s,seg)=>s+seg.value,0);
                const percent = (total / maxTotal) * 100;
                const isCand = hoveredSegment && hoveredSegment.candidateLabel === item.label;
                const isHovLab = hoveredLabel && (item.segments || []).some(s => s.label === hoveredLabel);
                const shouldDim = (hoveredSegment && !isCand) || (hoveredLabel && !isHovLab) || (localHoveredFilter && !matchesBarFilter(item, localHoveredFilter));
                
                return React.createElement(
                  'div',
                  { key:idx, className:\`flex items-center gap-2 transition-all duration-200 \${shouldDim ? 'opacity-50' : 'opacity-100'}\` },
                  item.imageUrl ? React.createElement('img', { 
                    src:item.imageUrl, 
                    className:'w-8 h-8 rounded-full object-cover flex-shrink-0',
                    alt:item.label
                  }) : React.createElement('div', { className:'w-8 h-8 flex-shrink-0' }),
                  React.createElement(
                    'div',
                    { className:'flex-1' },
                    React.createElement(
                      'div',
                      { className:'flex items-baseline justify-between gap-2 mb-1' },
                      item.linkUrl
                        ? React.createElement('a', { 
                            href:item.linkUrl, 
                            target:'_blank', 
                            rel:'noopener noreferrer', 
                            className:'text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline' 
                          }, getDisplayLabel(item.label))
                        : React.createElement('span', { className:'text-sm font-medium text-gray-900 dark:text-gray-100' }, getDisplayLabel(item.label)),
                      !hideEndLabels ? React.createElement('span', { className:'text-sm text-gray-600 dark:text-gray-400' }, formatDollars(total)) : null
                    ),
                    React.createElement(
                      'div',
                      { className:'relative h-6 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden' },
                      React.createElement(
                        'div',
                        { className:'absolute inset-0 flex', style:{ width:\`\${percent}%\` } },
                        (item.segments || []).map((seg, segIdx) => {
                          const segPercent = total > 0 ? (seg.value / total) * 100 : 0;
                          const isSegHov = hoveredSegment && hoveredSegment.candidateLabel === item.label && hoveredSegment.segmentLabel === seg.label;
                          return React.createElement('div', {
                            key:segIdx,
                            className:\`relative transition-opacity duration-200 \${isSegHov ? 'z-10' : ''}\`,
                            style:{ 
                              width:\`\${segPercent}%\`, 
                              backgroundColor: seg.color,
                              opacity: hoveredLabel && hoveredLabel !== seg.label ? 0.3 : 1
                            },
                            onMouseEnter: () => {
                              setHoveredSegment({ candidateLabel:item.label, segmentLabel:seg.label });
                              setHoveredLabel(seg.label);
                              setHoveredLabelSource('bar');
                            },
                            onMouseLeave: () => {
                              setHoveredSegment(null);
                              if (hoveredLabelSource === 'bar') {
                                setHoveredLabel(null);
                                setHoveredLabelSource(null);
                              }
                            },
                            title: seg.tooltipText || \`\${seg.label}: \${formatDollars(seg.value)}\`
                          });
                        })
                      )
                    )
                  )
                );
              }),
              contestNoData.length > 0 ? React.createElement(
                'div',
                { className:'text-xs text-gray-500 dark:text-gray-400 italic mt-2' },
                'No data: ' + contestNoData.map(c => getDisplayLabel(c.label)).join(', ')
              ) : null
            )
          );
        })
      ),
      React.createElement(
        'div',
        { className:'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700' },
        React.createElement(StandaloneBarFilterControls, {
          data,
          activeFilter: activeFilter || 'all',
          hoveredFilter: null,
          onFilterClick: () => {},
          onFilterHover: setLocalHoveredFilter
        })
      )
    );
  }
`;