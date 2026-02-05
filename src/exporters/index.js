/**
 * Exporters Index
 * Entry point for all export functionality
 */

const { generateMarkdown, downloadMarkdown, copyToClipboard, calculateBasicStats } = require('./markdown.js');
const { generateCSV, downloadCSV, escapeCSV, formatMedia } = require('./csv.js');
const { generateJSON, downloadJSON } = require('./json.js');
const { generateHTML, downloadHTML, escapeHtml } = require('./html.js');

module.exports = {
    // Markdown
    generateMarkdown,
    downloadMarkdown,
    copyToClipboard,
    calculateBasicStats,

    // CSV
    generateCSV,
    downloadCSV,
    escapeCSV,
    formatMedia,

    // JSON
    generateJSON,
    downloadJSON,

    // HTML
    generateHTML,
    downloadHTML,
    escapeHtml
};
