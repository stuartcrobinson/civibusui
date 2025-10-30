// Transform utilities for NYC campaign finance data

export const NYC_SIZE_COLORS = {
  '$0-$10': '#91e0f1ff',      // blue
  '$11-$50': '#06aed4ff',     // cyan (darker, more saturated)
  '$51-$100': '#7ddc7aff',    // emerald (bluer green)
  '$101-$400': '#fbbf24',   // yellow
  '$401-$1000': '#ee8937ff',  // orange
  'Over $1000': '#dc2626'   // red
};

export const NYC_SIZE_ORDER = [
  '$0-$10',
  '$11-$50',
  '$51-$100',
  '$101-$400',
  '$401-$1000',
  'Over $1000'
];

export const NYC_LOCATION_COLORS = {
  'Within NYC': '#3b82f6',
  'NY State (outside NYC)': '#93c5fd',
  'Out of State': '#1e40af',
  'Unknown': '#ef4444'
};

export const NYC_LOCATION_ORDER = [
  'Within NYC',
  'NY State (outside NYC)',
  'Out of State',
  'Unknown'
];

export const NYC_BOROUGH_COLORS = {
  'Bronx': '#f59e0b',
  'Brooklyn': '#10b981',
  'Manhattan': '#8b5cf6',
  'Queens': '#ef4444',
  'Staten Island': '#06b6d4'
};

export const NYC_BOROUGH_ORDER = [
  'Bronx',
  'Brooklyn',
  'Manhattan',
  'Queens',
  'Staten Island'
];

export const NYC_REALESTATE_COLORS = {
  'Real Estate': '#a94e4e',
  'Other Industries': '#d4a7a7'
};

export const NYC_REALESTATE_ORDER = [
  'Real Estate',
  'Other Industries'
];

const CANDIDATE_COLORS = [
  '#f97316', '#10b981', '#ef4444', '#3b82f6', '#a855f7',
  '#06b6d4', '#eab308', '#ec4899', '#4ec361ff', '#8b5cf6',
  '#f59e0b', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16'
];

// Fixed colors for General Election candidates (by name)
const GENERAL_ELECTION_COLORS = {
  'Mamdani, Zohran K': '#f97316',
  'Cuomo, Andrew M': '#3b82f6',
  'Sliwa, Curtis A': '#ef4444',
  'Estrada, Irene': '#10b981',
  'Hernandez, Joseph': '#8b5cf6',
  'Adams, Eric L': '#eab308',
  'Walden, James': '#06b6d4',
  'Anglade, Jean h': '#ec4899'
};

let candidateColorMap = {};

function getCandidateColor(candidateName) {
  // Check if this is a general election candidate with fixed color
  if (GENERAL_ELECTION_COLORS[candidateName]) {
    return GENERAL_ELECTION_COLORS[candidateName];
  }
  if (!candidateColorMap[candidateName]) {
    const assignedColors = Object.keys(candidateColorMap).length;
    candidateColorMap[candidateName] = CANDIDATE_COLORS[assignedColors % CANDIDATE_COLORS.length];
  }
  return candidateColorMap[candidateName];
}

function formatDollars(val) {
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCount(val) {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return Math.round(val).toString();
}

function getLastName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1];
}

export function transformNYCFundraisingTimeline(rows) {
  if (!rows || rows.length === 0) return { lines: [] };
  console.log('Transform input:', rows.length, 'rows');

  // Group by candidate, create paired private/public lines
  const grouped = rows.reduce((acc, row) => {
    const key = row.candidate_name;
    if (!acc[key]) {
      acc[key] = {
        candidate_id: row.candidate_id,
        candidate_name: row.candidate_name,
        cfb_candid: row.cfb_candid,
        privatePoints: [],
        publicPoints: []
      };
    }
    
    acc[key].privatePoints.push({
      date: row.week_start,
      value: parseFloat(row.cumulative_private || 0)
    });
    
    acc[key].publicPoints.push({
      date: row.week_start,
      value: parseFloat(row.cumulative_public || 0)
    });
    
    return acc;
  }, {});

  const lines = [];
  console.log('Grouped candidates:', Object.keys(grouped).length);
  
  // Fixed colors for General Election candidates
  const GENERAL_ELECTION_COLORS = {
    'Mamdani, Zohran K': '#f97316',
    'Cuomo, Andrew M': '#3b82f6',
    'Sliwa, Curtis A': '#ef4444',
    'Estrada, Irene': '#10b981',
    'Hernandez, Joseph': '#8b5cf6',
    'Adams, Eric L': '#eab308',
    'Walden, James': '#06b6d4',
    'Anglade, Jean h': '#ec4899'
  };

  Object.values(grouped)
    .sort((a, b) => getLastName(a.candidate_name).localeCompare(getLastName(b.candidate_name)))
    .forEach(candidate => {
      const color = GENERAL_ELECTION_COLORS[candidate.candidate_name] || getCandidateColor(candidate.candidate_name);
      const candidateId = `nyc_${candidate.candidate_id}`;
      
      const linkUrl = candidate.cfb_candid 
        ? `https://www.nyccfb.info/FTMSearch/Candidates/Contributions?ec=2025&rt=can&cand=${candidate.cfb_candid}`
        : null;

      // Private funding line
      lines.push({
        label: candidate.candidate_name,
        dataKey: `${candidate.candidate_name.toLowerCase().replace(/\s+/g, '_')}_private`,
        candidateId: candidateId,
        linkUrl: linkUrl,
        type: 'private',
        color: color,
        points: candidate.privatePoints
      });
      
      // Public funding line (if any public funding exists)
      const hasPublicFunding = candidate.publicPoints.some(p => p.value > 0);
      if (hasPublicFunding) {
        lines.push({
          label: candidate.candidate_name,
          dataKey: `${candidate.candidate_name.toLowerCase().replace(/\s+/g, '_')}_public`,
          candidateId: candidateId,
          linkUrl: linkUrl,
          type: 'public',
          color: color,
          points: candidate.publicPoints
        });
      }
    });

  console.log('Output lines:', lines.length);
  return { lines };
}

export function transformNYCExpenditureTimeline(rows) {
  if (!rows || rows.length === 0) return { lines: [] };

  const grouped = rows.reduce((acc, row) => {
    const key = row.candidate_name;
    if (!acc[key]) {
      acc[key] = {
        label: row.candidate_name,
        dataKey: row.candidate_name.toLowerCase().replace(/\s+/g, '_'),
        cfbCandid: row.cfb_candid,
        points: []
      };
    }
    
    acc[key].points.push({
      date: row.week_start,
      value: parseFloat(row.cumulative_expenditure || 0)
    });
    
    return acc;
  }, {});

  const lines = Object.values(grouped)
    .sort((a, b) => getLastName(a.label).localeCompare(getLastName(b.label)));
  
  lines.forEach(line => {
    line.color = getCandidateColor(line.label);
    line.linkUrl = line.cfbCandid 
      ? `https://www.nyccfb.info/FTMSearch/Candidates/Contributions?ec=2025&rt=can&cand=${line.cfbCandid}`
      : null;
  });

  return { lines };
}

export function transformNYCCashOnHandTimeline(rows) {
  if (!rows || rows.length === 0) return { lines: [] };

  const grouped = rows.reduce((acc, row) => {
    const key = row.candidate_name;
    if (!acc[key]) {
      acc[key] = {
        label: row.candidate_name,
        dataKey: row.candidate_name.toLowerCase().replace(/\s+/g, '_'),
        points: []
      };
    }
    
    acc[key].points.push({
      date: row.week_start,
      value: parseFloat(row.cash_on_hand || 0)
    });
    
    return acc;
  }, {});

  const lines = Object.values(grouped)
    .sort((a, b) => getLastName(a.label).localeCompare(getLastName(b.label)));
  
  lines.forEach(line => {
    line.color = getCandidateColor(line.label);
  });

  return { lines };
}

export function transformNYCBarChart(rows, categoryKey, colorMap, categoryOrder = null, valueField = 'donation_count', cfbCandidLookup = {}) {
  if (!rows || rows.length === 0) return [];

  // Sort by last name
  const sortedRows = [...rows].sort((a, b) => 
    getLastName(a.candidate_name).localeCompare(getLastName(b.candidate_name))
  );

  // Determine segment order
  let segmentOrder;
  if (categoryOrder) {
    segmentOrder = categoryOrder;
  } else {
    const categoryTotals = {};
    rows.forEach(row => {
      const cat = row[categoryKey];
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(row[valueField] || 0);
    });
    
    segmentOrder = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .map(([cat]) => cat);
  }

  // Group by candidate
  const grouped = sortedRows.reduce((acc, row) => {
    const key = row.candidate_name;
    if (!acc[key]) {
      acc[key] = {
        label: row.candidate_name,
        cfbCandid: row.cfb_candid || cfbCandidLookup[row.candidate_name],
        segments: {}
      };
    }
    
    const category = row[categoryKey];
    if (!acc[key].segments[category]) {
      acc[key].segments[category] = 0;
    }
    acc[key].segments[category] += parseFloat(row[valueField] || 0);
    
    return acc;
  }, {});

  // Convert to array format
  const result = Object.values(grouped).map(candidate => {
    console.log('Bar chart candidate:', candidate.label, 'has linkUrl:', candidate.linkUrl, 'has cfbCandid:', candidate.cfbCandid);
    const segmentArray = Object.entries(candidate.segments)
      .map(([label, value]) => {
        const color = colorMap ? colorMap[label] : getCandidateColor(label);
        return { label, value, color };
      });
    
    // Sort by global segment order
    segmentArray.sort((a, b) => {
      const aIndex = segmentOrder.indexOf(a.label);
      const bIndex = segmentOrder.indexOf(b.label);
      return aIndex - bIndex;
    });
    
    return {
      ...candidate,
      linkUrl: candidate.cfbCandid 
        ? `https://www.nyccfb.info/FTMSearch/Candidates/Contributions?ec=2025&rt=can&cand=${candidate.cfbCandid}`
        : null,
      segments: segmentArray
    };
  });

  return result;
}

export function transformNYCRefundsChart(rows, cfbCandidLookup = {}) {
  if (!rows || rows.length === 0) return [];

  const sortedRows = [...rows].sort((a, b) => 
    parseFloat(b.total_refunded || 0) - parseFloat(a.total_refunded || 0)
  );

  return sortedRows.map(row => ({
    label: row.candidate_name,
    linkUrl: (row.cfb_candid || cfbCandidLookup[row.candidate_name])
      ? `https://www.nyccfb.info/FTMSearch/Candidates/Contributions?ec=2025&rt=can&cand=${row.cfb_candid || cfbCandidLookup[row.candidate_name]}`
      : null,
    segments: [{
      label: 'Refunded',
      value: Math.abs(parseFloat(row.total_refunded || 0)),
      color: '#ef4444'
    }]
  }));
}

export function transformAbsoluteBarChart(barChartData, isCountBased = false) {
  return barChartData.map(candidate => {
    const total = candidate.segments.reduce((sum, seg) => sum + seg.value, 0);
    
    return {
      ...candidate,
      cfbCandid: candidate.cfbCandid, // pass through from transformNYCBarChart
      formattedTotal: isCountBased ? formatCount(total) : formatDollars(total),
      segments: candidate.segments.map(seg => {
        const percent = total > 0 ? (seg.value / total) * 100 : 0;
        
        let tooltipText;
        if (isCountBased) {
          const countDisplay = Math.round(seg.value);
          tooltipText = `${countDisplay} donation${countDisplay !== 1 ? 's' : ''} (${percent.toFixed(1)}%)`;
        } else {
          tooltipText = `${formatDollars(seg.value)} (${percent.toFixed(1)}%)`;
        }
        
        return {
          label: seg.label,
          value: seg.value,
          color: seg.color,
          tooltipText
        };
      })
    };
  });
}