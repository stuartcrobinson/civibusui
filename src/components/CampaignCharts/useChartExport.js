import { useState } from 'react';
import { LINE_CHART_TEMPLATE, BAR_CHART_TEMPLATE } from './chartTemplates';
import { generateStandaloneHTML } from './htmlTemplate';

export function useChartExport(chartType, data, title, currentFilter) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const generateEmbedCode = () => {
    const chartTemplate = chartType === 'line' ? LINE_CHART_TEMPLATE : BAR_CHART_TEMPLATE;
    
    // Capture the current page URL
    const sourceUrl = window.location.href;
    
    const props = {
      title: title,
      activeFilter: currentFilter
    };
    
    // Add chart-specific props
    if (chartType === 'line') {
      props.yAxisLabel = 'Amount Raised';
      props.xAxisLabel = 'Date';
    } else {
      props.legendLabel = 'Donor Industries';
    }
    
    return generateStandaloneHTML({
      chartTemplate,
      data,
      title,
      chartType,
      props,
      sourceUrl
    });
  };

  return {
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    embedCode: generateEmbedCode()
  };
}