// /Users/stuart/repos/civibusui/src/utils/transformChartData.js

// Special candidate links for those without proper State Board IDs
const SPECIAL_CANDIDATE_LINKS = {
  'Chelsea Cook': 'https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/Cook_Chelsea/',
  'Anjanee Bell': 'https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/Bell_Anjanee/',
  'Shanetta Burris': 'https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/Burris_Shanetta/'
};

// Durham candidate images - hardcoded for now
const DURHAM_CANDIDATE_IMAGES = {
  'Matt Kopac': '/img/kopac.jpeg',
  'Leonardo (Leo) Williams': '/img/leowilliams.jpeg',
  'Diana Medoff': '/img/diana.png',
  'DeDreana Freeman': '/img/dedreana.png',
  'Mark-Anthony Middleton': '/img/MAM.jpeg',
  'Elijah King': '/img/elijah.jpeg',
  'Andrea Cazales': '/img/andrea.jpeg',
  'Anjanee Bell': '/img/anjanee.jpeg',
  'Terry McCann': '/img/terry-mccann.jpeg',
  'Chelsea Cook': '/img/chelseacook.jpeg',
  'Shanetta Burris': '/img/shanetta.jpeg'
};

// Predefined color schemes
const LOCATION_COLORS = {
  'Unmarked b/c ≤ $50': '#d5e8f5ff',
  'In ': '#c2d8eaff',
  'In NC (not': '#417096ff',
  'Out of State': '#002138ff',
  'Unknown': '#ef4444'
};

const SIZE_COLORS = {
  '≤$50': '#ead008ff',
  '$51-250': '#22c55e',
  '$251-1000': '#3b82f6',
  '>$1000': '#ef8044ff'
};

const SIZE_ORDER = ['≤$50', '$51-250', '$251-1000', '>$1000'];

const REALESTATE_COLORS = {
  'Real Estate': '#a94e4eff',
  'Other Industries': '#d4a7a7ff'
};

const REALESTATE_ORDER = ['Real Estate', 'Other Industries'];

const SELF_FUNDED_COLORS = {
  'Self-Funded': '#93c5fd',
  'Other Donations': '#3b82f6'
};

const SELF_FUNDED_ORDER = ['Self-Funded', 'Other Donations'];

const CANDIDATE_COLORS = [
  '#f97316', '#10b981', '#ef4444', '#3b82f6', '#a855f7',
  '#06b6d4', '#eab308', '#ec4899', '#8b5cf6'
];

// Assign consistent colors to candidates
let candidateColorMap = {};

function getCandidateColor(candidateName) {
  if (!candidateColorMap[candidateName]) {
    const assignedColors = Object.keys(candidateColorMap).length;
    candidateColorMap[candidateName] = CANDIDATE_COLORS[assignedColors % CANDIDATE_COLORS.length];
  }
  return candidateColorMap[candidateName];
}

// Formatting helpers
function formatDollars(val) {
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCount(val) {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return Math.round(val).toString();
}

function formatDollarsShort(val) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val}`;
}

function getLocationColor(locationBucket) {
  if (locationBucket === 'Unmarked b/c ≤ $50') return LOCATION_COLORS['Unmarked b/c ≤ $50'];
  if (locationBucket === 'Unknown') return LOCATION_COLORS['Unknown'];
  if (locationBucket === 'Out of State') return LOCATION_COLORS['Out of State'];
  if (locationBucket.startsWith('In NC (not')) return LOCATION_COLORS['In NC (not'];
  if (locationBucket.startsWith('In ')) return LOCATION_COLORS['In '];
  return '#9ca3af';
}

function getLocationOrder(locationData) {
  const buckets = [...new Set(locationData.map(d => d.location_bucket))];
  const order = [];
  
  // Start with "Unmarked b/c ≤ $50"
  if (buckets.includes('Unmarked b/c ≤ $50')) order.push('Unmarked b/c ≤ $50');
  
  // Then "In X" (the city itself)
  const inCityBucket = buckets.find(b => b.startsWith('In ') && !b.startsWith('In NC'));
  if (inCityBucket) order.push(inCityBucket);
  
  // Then "In NC (not X)"
  const ncBucket = buckets.find(b => b.startsWith('In NC (not'));
  if (ncBucket) order.push(ncBucket);
  
  // Then Out of State
  if (buckets.some(b => b === 'Out of State')) order.push('Out of State');
  
  // Finally Unknown (concerning missing addresses)
  if (buckets.includes('Unknown')) order.push('Unknown');
  
  return order;
}

// Position hierarchy for sorting contests
const POSITION_HIERARCHY = {
  'Mayor': 1,
  'City Council': 2,
  'Council': 2
};

function getPositionSortValue(position) {
  return POSITION_HIERARCHY[position] || 999;
}

function getLastName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1];
}

function compareContests(a, b) {
  const aPos = getPositionSortValue(a.position);
  const bPos = getPositionSortValue(b.position);
  
  if (aPos !== bPos) {
    return aPos - bPos;
  }
  
  if (a.subregion_value && b.subregion_value) {
    const aNum = parseInt(a.subregion_value.match(/\d+/)?.[0]);
    const bNum = parseInt(b.subregion_value.match(/\d+/)?.[0]);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    
    return a.subregion_value.localeCompare(b.subregion_value);
  }
  
  if (a.subregion_value) return 1;
  if (b.subregion_value) return -1;
  
  return 0;
}

export function transformBarChart(rows, categoryKey, colorMap, categoryOrder = null, geoName = null, useCustomOrder = false) {
  if (!rows || rows.length === 0) return [];

  // Sort rows by contest hierarchy first, then by last name
  const sortedRows = [...rows].sort((a, b) => {
    const contestComparison = compareContests(a, b);
    if (contestComparison !== 0) {
      return contestComparison;
    }
    const aLastName = getLastName(a.candidate_name);
    const bLastName = getLastName(b.candidate_name);
    return aLastName.localeCompare(bLastName);
  });

  // Separate candidates with and without data
  const candidatesWithData = new Set();
  const candidatesWithoutData = new Map();
  
  sortedRows.forEach(row => {
    const total = parseFloat(row.total);
    if (total > 0) {
      candidatesWithData.add(row.candidate_name);
    } else if (total === 0) {
      if (!candidatesWithoutData.has(row.candidate_name)) {
        candidatesWithoutData.set(row.candidate_name, row);
      }
    }
  });

  // Filter to only rows with actual data
  const rowsWithData = sortedRows.filter(row => candidatesWithData.has(row.candidate_name));

  // Establish consistent candidate order and colors
  const uniqueCandidates = [...new Set(rowsWithData.map(r => r.candidate_name))];
  uniqueCandidates.forEach(candidate => getCandidateColor(candidate));

  // Group by candidate
  const grouped = rowsWithData.reduce((acc, row) => {
    const key = row.candidate_name;
    if (!acc[key]) {
      acc[key] = {
        label: row.candidate_name,
        imageUrl: DURHAM_CANDIDATE_IMAGES[row.candidate_name] || null,
        position: row.position,
        subregion_value: row.subregion_value,
        linkUrl: SPECIAL_CANDIDATE_LINKS[row.candidate_name] || 
                 (row.sboe_id && row.org_group_id ? `https://cf.ncsbe.gov/CFOrgLkup/DocumentGeneralResult/?SID=${row.sboe_id}&OGID=${row.org_group_id}` : null),
        segments: {}
      };
    }
    
    const category = row[categoryKey];
    if (!acc[key].segments[category]) {
      acc[key].segments[category] = 0;
    }
    acc[key].segments[category] += parseFloat(row.total);
    
    return acc;
  }, {});

  // Determine segment order
  let segmentOrder;
  if (categoryKey === 'location_bucket') {
    // Always use geographic order for location buckets
    segmentOrder = getLocationOrder(rows);
  } else if (categoryOrder) {
    segmentOrder = categoryOrder;
  } else {
    // Calculate global totals
    const categoryTotals = {};
    rows.forEach(row => {
      const cat = row[categoryKey];
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(row.total);
    });
    
    segmentOrder = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .map(([cat]) => cat);
  }

  // Convert to array format (no tooltipText yet - will be added by normalizeToPercentages or transformAbsoluteBarChart)
  const result = Object.values(grouped).map(candidate => {
    const segmentArray = Object.entries(candidate.segments)
      .map(([label, value]) => {
        let color;
        if (categoryKey === 'location_bucket') {
          color = getLocationColor(label);
        } else {
          color = colorMap[label] || '#9ca3af';
        }
        
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
      segments: segmentArray
    };
  });

  // Add candidates without data
  candidatesWithoutData.forEach((row, candidateName) => {
    if (!candidatesWithData.has(candidateName)) {
      result.push({
        label: candidateName,
        imageUrl: DURHAM_CANDIDATE_IMAGES[candidateName] || null,
        position: row.position,
        subregion_value: row.subregion_value,
        linkUrl: SPECIAL_CANDIDATE_LINKS[candidateName] || 
                 (row.sboe_id && row.org_group_id ? `https://cf.ncsbe.gov/CFOrgLkup/DocumentGeneralResult/?SID=${row.sboe_id}&OGID=${row.org_group_id}` : null),
        segments: [],
        hasNoData: true
      });
    }
  });

  // Return in the order we built it (already sorted from sortedRows)
  return result;
}

export function transformLineChart(rows) {
  if (!rows || rows.length === 0) return { lines: [] };

  // Group by candidate
  const grouped = rows.reduce((acc, row) => {
    const key = row.candidate_name;
    if (!acc[key]) {
      acc[key] = {
        label: row.candidate_name,
        dataKey: row.candidate_name.toLowerCase().replace(/\s+/g, '_'),
        position: row.position,
        subregion_value: row.subregion_value,
        linkUrl: SPECIAL_CANDIDATE_LINKS[row.candidate_name] || 
                 (row.sboe_id && row.org_group_id ? `https://cf.ncsbe.gov/CFOrgLkup/DocumentGeneralResult/?SID=${row.sboe_id}&OGID=${row.org_group_id}` : null),
        points: []
      };
    }
    
    const value = parseFloat(row.cumulative_total);
    
    acc[key].points.push({
      date: row.week_start,
      value: value
    });
    
    return acc;
  }, {});

  // Sort by last name
  const lines = Object.values(grouped)
    .sort((a, b) => {
      const aLastName = getLastName(a.label);
      const bLastName = getLastName(b.label);
      return aLastName.localeCompare(bLastName);
    });
  
  // Assign colors based on candidate name for consistency
  lines.forEach((line) => {
    line.color = getCandidateColor(line.label);
  });

  return { lines };
}

export function transformTotalDonationsChart(rows) {
  if (!rows || rows.length === 0) return [];

  // Group by candidate
  const grouped = rows.reduce((acc, row) => {
    const key = row.candidate_name;
    if (!acc[key]) {
      acc[key] = {
        label: row.candidate_name,
        imageUrl: DURHAM_CANDIDATE_IMAGES[row.candidate_name] || null,
        position: row.position,
        subregion_value: row.subregion_value,
        linkUrl: SPECIAL_CANDIDATE_LINKS[row.candidate_name] || 
                 (row.sboe_id && row.org_group_id ? `https://cf.ncsbe.gov/CFOrgLkup/DocumentGeneralResult/?SID=${row.sboe_id}&OGID=${row.org_group_id}` : null),
        total: 0
      };
    }
    
    acc[key].total += parseFloat(row.total || 0);
    
    return acc;
  }, {});

  // Convert to array and create single segment per candidate
  const result = Object.values(grouped).map((candidate, i) => {
    if (candidate.total === 0) {
      return {
        ...candidate,
        segments: [],
        hasNoData: true
      };
    }
    
    return {
      ...candidate,
      segments: [{
        label: 'Total Donations',
        value: candidate.total,
        color: getCandidateColor(candidate.label)
      }]
    };
  });

  // Sort by contest hierarchy only - candidate sorting will happen in the component
  return result.sort((a, b) => compareContests(a, b));
}

export function transformTotalDonationsWithSelfChart(rows) {
  if (!rows || rows.length === 0) return [];

  // Helper to create lighter version of hex color
  const lightenColor = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Lighten by mixing with white (increase by 40%)
    const newR = Math.min(255, Math.round(r + (255 - r) * 0.4));
    const newG = Math.min(255, Math.round(g + (255 - g) * 0.4));
    const newB = Math.min(255, Math.round(b + (255 - b) * 0.4));
    
    // Convert back to hex
    return '#' + [newR, newG, newB].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  // Group by candidate
  const grouped = rows.reduce((acc, row) => {
    const key = row.candidate_name;
    if (!acc[key]) {
      acc[key] = {
        label: row.candidate_name,
        imageUrl: DURHAM_CANDIDATE_IMAGES[row.candidate_name] || null,
        position: row.position,
        subregion_value: row.subregion_value,
        linkUrl: SPECIAL_CANDIDATE_LINKS[row.candidate_name] || 
                 (row.sboe_id && row.org_group_id ? `https://cf.ncsbe.gov/CFOrgLkup/DocumentGeneralResult/?SID=${row.sboe_id}&OGID=${row.org_group_id}` : null),
        selfTotal: 0,
        otherTotal: 0
      };
    }
    
    acc[key].selfTotal += parseFloat(row.self_donation_total || 0);
    acc[key].otherTotal += parseFloat(row.other_donation_total || 0);
    
    return acc;
  }, {});

  // Convert to array and create two segments per candidate
  const result = Object.values(grouped).map((candidate, i) => {
    const total = candidate.selfTotal + candidate.otherTotal;
    
    if (total === 0) {
      return {
        ...candidate,
        segments: [],
        hasNoData: true
      };
    }
    
    const baseColor = getCandidateColor(candidate.label);
    const segments = [];
    
    // Add self-donation segment first (lighter shade of same color)
    if (candidate.selfTotal > 0) {
      segments.push({
        label: 'Self-Funded',
        value: candidate.selfTotal,
        color: lightenColor(baseColor)
      });
    }
    
    // Add other donations segment second (base color)
    if (candidate.otherTotal > 0) {
      segments.push({
        label: 'Other Donations',
        value: candidate.otherTotal,
        color: baseColor
      });
    }
    
    return {
      ...candidate,
      segments
    };
  });

  // Sort by contest hierarchy only - candidate sorting will happen in the component
  return result.sort((a, b) => compareContests(a, b));
}

export function normalizeToPercentages(barChartData, isCountBased = false) {
  const normalized = barChartData.map(candidate => {
    const total = candidate.segments.reduce((sum, seg) => sum + seg.value, 0);
    const realEstateSeg = candidate.segments.find(seg => seg.label === 'Real Estate');
    const realEstatePercent = realEstateSeg ? (realEstateSeg.value / total) * 100 : 0;
    
    return {
      ...candidate,
      realEstatePercent,
      segments: candidate.segments.map(seg => {
        const percent = (seg.value / total) * 100;
        const originalValue = seg.value;
        
        // Generate tooltip text
        let tooltipText;
        if (isCountBased) {
          const countDisplay = Math.round(originalValue);
          tooltipText = `${percent.toFixed(1)}% (${countDisplay} donation${countDisplay !== 1 ? 's' : ''})`;
        } else {
          tooltipText = `${percent.toFixed(1)}% (${formatDollars(originalValue)})`;
        }
        
        return {
          ...seg,
          value: percent,
          tooltipText
        };
      })
    };
  });
  
  return normalized;
}

export function extractCandidateData(data) {
  if (!data || data.length === 0) return [];
  
  return data.map(c => ({
    name: c.label,
    position: c.position,
    subregion_value: c.subregion_value
  }));
}

export function transformAbsoluteBarChart(barChartData, isCountBased = false) {
  // Takes bar chart data and prepares it for absolute value display
  // Adds tooltipText and formattedTotal to each segment
  
  return barChartData.map(candidate => {
    const total = candidate.segments.reduce((sum, seg) => sum + seg.value, 0);
    
    return {
      ...candidate,
      formattedTotal: isCountBased ? formatCount(total) : formatDollars(total),
      segments: candidate.segments.map(seg => {
        const percent = total > 0 ? (seg.value / total) * 100 : 0;
        
        // Generate tooltip text for absolute values with percentage
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

export { SIZE_COLORS, SIZE_ORDER, REALESTATE_COLORS, REALESTATE_ORDER };