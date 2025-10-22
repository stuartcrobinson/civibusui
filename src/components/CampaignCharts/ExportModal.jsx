import React, { useState } from 'react';

export default function ExportModal({ isOpen, onClose, embedCode, chartTitle }) {
  const [copied, setCopied] = useState(false);
  const [hideLink, setHideLink] = useState(true);

  // Close modal on Escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getFinalCode = () => {
    if (hideLink) {
      return embedCode.replace(/<!-- CIVIBUS_LINK_START -->[\s\S]*?<!-- CIVIBUS_LINK_END -->/, '');
    }
    return embedCode;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFinalCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getFinalCode()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Export Chart
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Copy the embed code or download as HTML file
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How to use:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Copy the embed code and paste into WordPress Custom HTML block</li>
              <li>Or download as HTML file and open directly in any browser</li>
              <li>No server or dependencies required - works offline!</li>
              <li>Includes full interactivity and attribution</li>
            </ul>
          </div>

          {/* Checkbox for hiding link */}
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hideLink}
              onChange={(e) => setHideLink(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Remove civibus attribution link</span>
          </label>

          {/* Embed Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Embed Code
            </label>
            <div className="relative">
              <textarea
                readOnly
                value={getFinalCode()}
                className="w-full h-32 p-3 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200"
                onClick={(e) => e.target.select()}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {copied ? '✓ Copied!' : 'Copy Embed Code'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Download HTML File
            </button>
          </div>

          {/* Preview Note */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            The chart will look exactly like it does above, with full interactivity
          </div>
        </div>
      </div>
    </div>
  );
}