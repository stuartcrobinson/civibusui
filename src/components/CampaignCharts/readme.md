https://claude.ai/chat/fa637aeb-096f-4534-ba47-c67f4dc19522


## Step-by-Step Instructions for Updating Export Functionality

Whenever you make changes to your chart components and want those changes to appear in exported charts, follow these steps:

### Step 1: Update the Chart Template (if you changed chart behavior)
**File: `src/components/CampaignCharts/chartTemplates.js`**

- If you modified `CampaignLineChart.jsx` → update `LINE_CHART_TEMPLATE`
- If you modified `SegmentedBarChart.jsx` → update `BAR_CHART_TEMPLATE`

**Important:** The template code must use `React.createElement()` syntax, NOT JSX. Example:
```javascript
// ❌ Wrong (JSX):
<div className="example">text</div>

// ✅ Correct (for template):
React.createElement('div', { className: 'example' }, 'text')
```

### Step 2: Update the HTML Template (if you changed styling/structure)
**File: `src/components/CampaignCharts/htmlTemplate.js`**

This is what you just updated! Any changes to:
- CSS styles (in the `<style>` tag)
- HTML structure (the body content)
- Script loading (the `<script>` tags)
- Attribution styling/positioning

All go in this file.

### Step 3: Test the Export
1. Run your app locally
2. Click the "Export" button on a chart
3. Click "Download HTML File"
4. Open the downloaded `.html` file in a browser
5. Verify the chart looks correct and works

### Step 4: Common Scenarios

**Scenario A: Changed chart colors or styling**
- Update `chartTemplates.js` to match your JSX component changes
- Copy the relevant sections from your component file
- Convert JSX to `React.createElement()` syntax

**Scenario B: Changed layout or positioning**
- Update `htmlTemplate.js` 
- Modify the CSS in the `<style>` section
- No need to touch `chartTemplates.js`

**Scenario C: Changed how data is processed**
- Update `chartTemplates.js` 
- Copy the data processing functions from your component
- Make sure they work with the standalone data format

**Scenario D: Added new library dependency**
- Update `htmlTemplate.js`
- Add the CDN `<script>` tag in the correct loading order
- React → ReactDOM → PropTypes → react-is → Recharts → (your new library)

### Quick Reference: Which File to Edit

| What Changed | File to Update |
|--------------|----------------|
| Chart appearance/behavior | `chartTemplates.js` |
| Attribution text/link | `htmlTemplate.js` |
| Colors, fonts, sizing | `htmlTemplate.js` (CSS) |
| New script/library | `htmlTemplate.js` (script tags) |
| Data processing logic | `chartTemplates.js` |
| Container layout | `htmlTemplate.js` (body HTML) |

### Pro Tip: 
Keep a test export file handy and re-export after every change to verify it still works!