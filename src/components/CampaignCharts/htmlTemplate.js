// Generates the complete standalone HTML file
export function generateStandaloneHTML({ chartTemplate, data, title, chartType, props, sourceUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: system-ui, -apple-system, sans-serif; 
      background: #f9fafb; 
    }
    .chart-container { 
      background: white; 
      padding: 24px; 
      border-radius: 8px; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
      position: relative;
    }
    .attribution { 
      position: absolute;
      bottom: 8px;
      right: 12px;
      font-size: 12px;
      color: #6b7280;
    }
    .attribution a {
      color: #6b7280;
      text-decoration: none;
    }
    .attribution a:hover {
      color: #6b7280;
    }
    
    /* Recharts tooltip wrapper override */
    .recharts-tooltip-wrapper {
      z-index: 1000 !important;
    }
    
    /* Explicit tooltip styles (fallback if Tailwind doesn't load in time) */
    .tooltip-container {
      background-color: #111827;
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      max-width: 20rem;
    }
    .tooltip-container-single {
      background-color: #111827;
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .tooltip-date {
      font-size: 0.75rem;
      color: #d1d5db;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    .tooltip-date-single {
      font-size: 0.75rem;
      color: #d1d5db;
    }
    .tooltip-value {
      font-size: 0.75rem;
      font-weight: 600;
    }
    .tooltip-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }
    .tooltip-item:last-child {
      margin-bottom: 0;
    }
    .tooltip-label-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .tooltip-color-box {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 0.125rem;
      flex-shrink: 0;
    }
    .tooltip-label {
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="chart-container">
    <div id="root"></div>
    <!-- CIVIBUS_LINK_START -->
    <div class="attribution"><a href="${sourceUrl || 'https://civibus.org'}" target="_blank" rel="noopener">civibus.org</a></div>
    <!-- CIVIBUS_LINK_END -->
  </div>
  
  <!-- Load React first -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <!-- Load PropTypes (required by Recharts) -->
  <script crossorigin src="https://unpkg.com/prop-types@15/prop-types.min.js"></script>
  
  <!-- Load react-is (required by Recharts) -->
  <script crossorigin src="https://unpkg.com/react-is@18/umd/react-is.production.min.js"></script>
  
  <!-- Load Recharts from cdnjs (more reliable) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.12.7/Recharts.min.js"></script>
  
  <script>
    // Wait for everything to load, then check dependencies
    window.addEventListener('load', function() {
      // Verify all dependencies loaded
      if (typeof React === 'undefined') {
        document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error: React failed to load</div>';
        return;
      }
      if (typeof ReactDOM === 'undefined') {
        document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error: ReactDOM failed to load</div>';
        return;
      }
      if (typeof Recharts === 'undefined') {
        document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error: Recharts failed to load</div>';
        return;
      }
      
      const { useState } = React;
      const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;
      
      ${chartTemplate}
      
      const data = ${JSON.stringify(data)};
      const chartProps = ${JSON.stringify(props)};
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(${chartType === 'line' ? 'CampaignLineChart' : 'SegmentedBarChart'}, {
        data: data,
        ...chartProps
      }));
    });
  </script>
</body>
</html>`;
}