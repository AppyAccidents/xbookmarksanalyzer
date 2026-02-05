/**
 * CSV Exporter
 * Generates CSV export for bookmarks
 */

/**
 * Escape a value for CSV
 * @param {*} val - Value to escape
 * @returns {string} Escaped string
 */
function escapeCSV(val) {
    if (val === undefined || val === null) return '';
    const str = String(val).replace(/\n/g, ' ');
    if (/[",]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

/**
 * Format media links for CSV
 * @param {Array} media - Media array
 * @returns {string} Formatted media URLs
 */
function formatMedia(media) {
    if (!media || media.length === 0) return '';
    return media.map(m => m.url).join('; ');
}

/**
 * Generate CSV content from bookmarks
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {Object} options - Export options
 * @param {Object} options.aiAnalysis - AI analysis results
 * @returns {string} CSV content
 */
function generateCSV(bookmarks, options = {}) {
    if (!bookmarks || bookmarks.length === 0) return '';

    const { aiAnalysis = null } = options;
    const rows = [];

    // Header row
    if (aiAnalysis) {
        rows.push('Author,Username,Date,Text,Likes,Retweets,Replies,Views,Link,Media URLs,Tags,Categories');
        const tags = aiAnalysis.tags ? aiAnalysis.tags.join('; ') : '';
        const categories = aiAnalysis.categories ? aiAnalysis.categories.join('; ') : '';

        bookmarks.forEach(t => {
            rows.push([
                escapeCSV(t.displayName || ''),
                escapeCSV('@' + (t.username || '')),
                escapeCSV(t.dateTime || ''),
                escapeCSV(t.text || ''),
                escapeCSV(t.likes || ''),
                escapeCSV(t.retweets || ''),
                escapeCSV(t.replies || ''),
                escapeCSV(t.views || ''),
                escapeCSV(t.url),
                escapeCSV(formatMedia(t.media)),
                escapeCSV(tags),
                escapeCSV(categories)
            ].join(','));
        });
    } else {
        rows.push('Author,Username,Date,Text,Likes,Retweets,Replies,Views,Link,Media URLs');
        bookmarks.forEach(t => {
            rows.push([
                escapeCSV(t.displayName || ''),
                escapeCSV('@' + (t.username || '')),
                escapeCSV(t.dateTime || ''),
                escapeCSV(t.text || ''),
                escapeCSV(t.likes || ''),
                escapeCSV(t.retweets || ''),
                escapeCSV(t.replies || ''),
                escapeCSV(t.views || ''),
                escapeCSV(t.url),
                escapeCSV(formatMedia(t.media))
            ].join(','));
        });
    }

    return rows.join('\n');
}

/**
 * Download bookmarks as CSV file
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {Object} options - Export options
 * @returns {void}
 */
function downloadCSV(bookmarks, options = {}) {
    const csv = generateCSV(bookmarks, options);
    if (!csv) return;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x-bookmarks-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

module.exports = {
    generateCSV,
    downloadCSV,
    escapeCSV,
    formatMedia
};
