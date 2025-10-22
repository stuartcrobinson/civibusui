import { useState } from 'react';
import { LINE_CHART_TEMPLATE, BAR_CHART_TEMPLATE } from './chartTemplates';
import { generateStandaloneHTML } from './htmlTemplate';

async function imageToThumbnailBase64(imageUrl, maxDimension = 80, quality = 0.7) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });
  
  const scale = Math.min(maxDimension / img.width, maxDimension / img.height);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', quality);
}

async function encodeImagesToBase64(data) {
  if (!data) return data;
  
  // Handle line chart with lines array
  if (data.lines) {
    const processedLines = await Promise.all(data.lines.map(async (line) => {
      if (!line.imageUrl) return line;
      try {
        const fullUrl = new URL(line.imageUrl, window.location.origin).href;
        const base64 = await imageToThumbnailBase64(fullUrl, 80, 0.7);
        return { ...line, imageUrl: base64 };
      } catch (e) {
        console.warn(`Failed to encode ${line.imageUrl}:`, e);
        return { ...line, imageUrl: null };
      }
    }));
    return { ...data, lines: processedLines };
  }
  
  // Handle bar chart with sections
  if (data.sections) {
    const processedSections = await Promise.all(data.sections.map(async (section) => {
      const processedItems = await Promise.all(section.items.map(async (item) => {
        if (!item.imageUrl) return item;
        try {
          const fullUrl = new URL(item.imageUrl, window.location.origin).href;
          const base64 = await imageToThumbnailBase64(fullUrl, 80, 0.7);
          return { ...item, imageUrl: base64 };
        } catch (e) {
          console.warn(`Failed to encode ${item.imageUrl}:`, e);
          return { ...item, imageUrl: null };
        }
      }));
      return { ...section, items: processedItems };
    }));
    return { ...data, sections: processedSections };
  }
  
  // Handle bar chart with flat array
  if (Array.isArray(data)) {
    const processed = await Promise.all(data.map(async (item) => {
      if (!item.imageUrl) return item;
      try {
        const fullUrl = new URL(item.imageUrl, window.location.origin).href;
        const base64 = await imageToThumbnailBase64(fullUrl, 80, 0.7);
        return { ...item, imageUrl: base64 };
      } catch (e) {
        console.warn(`Failed to encode ${item.imageUrl}:`, e);
        return { ...item, imageUrl: null };
      }
    }));
    return processed;
  }
  
  return data;
}

export function useChartExport(chartType, data, title, currentFilter) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateEmbedCode = async () => {
    setIsProcessing(true);
    const chartTemplate = chartType === 'line' ? LINE_CHART_TEMPLATE : BAR_CHART_TEMPLATE;
    
    // Encode images to base64 thumbnails
    const processedData = await encodeImagesToBase64(data);
    
    // Capture the current page URL
    const sourceUrl = window.location.href;
    
    setIsProcessing(false);
    
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
      props.hideEndLabels = false;
    }
    
    return generateStandaloneHTML({
      chartTemplate,
      data: processedData,
      title,
      chartType,
      props,
      sourceUrl
    });
  };

  const [embedCode, setEmbedCode] = useState('');
  
  const openModal = async () => {
    const code = await generateEmbedCode();
    setEmbedCode(code);
    setIsModalOpen(true);
  };
  
  return {
    isModalOpen,
    isProcessing,
    openModal,
    closeModal: () => setIsModalOpen(false),
    embedCode
  };
}