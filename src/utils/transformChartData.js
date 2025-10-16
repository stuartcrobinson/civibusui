// /Users/stuart/repos/civibusui/src/utils/transformChartData.js

// Special candidate links for those without proper State Board IDs
const SPECIAL_CANDIDATE_LINKS = {
  'Chelsea Cook': 'https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/Cook_Chelsea/',
  'Anjanee Bell': 'https://dcoftp.net/boe-ftp/Campaign%20Finance/Open%20Committees/Candidate%20Committees/Bell_Anjanee/'
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
  'Chelsea Cook': '/img/chelseacook.jpeg'
};

// Predefined color schemes
const LOCATION_COLORS = {
  'Out of State': '#2534bdff',
  'In NC (not': '#6671daff',  // Partial match for dynamic city names
  'In ': '#b2bafcff',  // Partial match for "In Durham", "In Raleigh", etc
  'Unknown': '#ef4444'
};

const SIZE_COLORS = {
  '≤$50': '#eab308',
  '$51-250': '#22c55e',
  '$251-1000': '#3b82f6',
  '>$1000': '#ef4444'
};

const SIZE_ORDER = ['>$1000', '$251-1000', '$51-250', '≤$50'];

const REALESTATE_COLORS = {
  'Real Estate': '#a94e4eff',
  'Other Industries': '#d4a7a7ff'
};

const REALESTATE_ORDER = ['Real Estate', 'Other Industries'];

const CANDIDATE_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f97316',
  '#06b6d4', '#eab308', '#ec4899', '#8b5cf6'
];

function getLocationColor(locationBucket) {
  if (locationBucket === 'Out of State') return LOCATION_COLORS['Out of State'];
  if (locationBucket === 'Unknown') return LOCATION_COLORS['Unknown'];
  if (locationBucket.startsWith('In NC (not')) return LOCATION_COLORS['In NC (not'];
  if (locationBucket.startsWith('In ')) return LOCATION_COLORS['In '];
  return '#9ca3af';
}

function getLocationOrder(locationData) {
  const buckets = [...new Set(locationData.map(d => d.location_bucket))];
  const order = [];
  
  // Always start with Out of State if present
  if (buckets.some(b => b === 'Out of State')) order.push('Out of State');
  
  // Then "In NC (not X)"
  const ncBucket = buckets.find(b => b.startsWith('In NC (not'));
  if (ncBucket) order.push(ncBucket);
  
  // Then "In X" (the city itself)
  const inCityBucket = buckets.find(b => b.startsWith('In ') && !b.startsWith('In NC'));
  if (inCityBucket) order.push(inCityBucket);
  
  // Finally Unknown
  if (buckets.includes('Unknown')) order.push('Unknown');
  
  return order;
}

export function transformBarChart(rows, categoryKey, colorMap, categoryOrder = null, geoName = null) {
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

  // Convert to array format
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

  // Sort by total value descending
  return result.sort((a, b) => {
    const aTotal = a.segments.reduce((sum, seg) => sum + seg.value, 0);
    const bTotal = b.segments.reduce((sum, seg) => sum + seg.value, 0);
    return bTotal - aTotal;
  });
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
    
    acc[key].points.push({
      date: row.week_start,
      value: parseFloat(row.cumulative_total)
    });
    
    return acc;
  }, {});

  // Assign colors
  const lines = Object.values(grouped);
  lines.forEach((line, i) => {
    line.color = CANDIDATE_COLORS[i % CANDIDATE_COLORS.length];
  });

  return { lines };
}

export function normalizeToPercentages(barChartData) {
  const normalized = barChartData.map(candidate => {
    const total = candidate.segments.reduce((sum, seg) => sum + seg.value, 0);
    const realEstateSeg = candidate.segments.find(seg => seg.label === 'Real Estate');
    const realEstatePercent = realEstateSeg ? (realEstateSeg.value / total) * 100 : 0;
    
    return {
      ...candidate,
      realEstatePercent,
      segments: candidate.segments.map(seg => ({
        ...seg,
        value: (seg.value / total) * 100,
        originalValue: seg.value
      }))
    };
  });
  
  return normalized.sort((a, b) => b.realEstatePercent - a.realEstatePercent);
}

export function extractCandidateData(data) {
  if (!data || data.length === 0) return [];
  
  return data.map(c => ({
    position: c.position,
    subregion_value: c.subregion_value
  }));
}

export { SIZE_COLORS, SIZE_ORDER, REALESTATE_COLORS, REALESTATE_ORDER };