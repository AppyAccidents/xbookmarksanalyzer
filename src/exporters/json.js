/**
 * JSON Exporter
 * Generates JSON export for bookmarks
 */

const { calculateBasicStats } = require('./markdown.js');

/**
 * Generate JSON export data
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {Object} options - Export options
 * @param {Object} options.aiAnalysis - AI analysis results
 * @param {string} options.llmProvider - LLM provider used
 * @returns {Object} Export data object
 */
function generateJSON(bookmarks, options = {}) {
    if (!bookmarks || bookmarks.length === 0) return null;

    const { aiAnalysis = null, llmProvider = 'none' } = options;

    return {
        metadata: {
            exportDate: new Date().toISOString(),
            totalBookmarks: bookmarks.length,
            version: '0.12.3',
            llmProvider: llmProvider
        },
        analysis: aiAnalysis || null,
        statistics: calculateBasicStats(bookmarks),
        bookmarks: bookmarks
    };
}

/**
 * Download bookmarks as JSON file
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {Object} options - Export options
 * @returns {void}
 */
function downloadJSON(bookmarks, options = {}) {
    const exportData = generateJSON(bookmarks, options);
    if (!exportData) return;

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x-bookmarks-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

module.exports = {
    generateJSON,
    downloadJSON
};
