/**
 * Markdown Exporter
 * Generates Markdown export for bookmarks
 */

/**
 * Calculate basic statistics for bookmarks
 * @param {Array} bookmarks - Array of bookmark objects
 * @returns {Object} Statistics object
 */
function calculateBasicStats(bookmarks) {
    let totalLikes = 0;
    let totalRetweets = 0;
    const authorCounts = {};
    let minDate = null;
    let maxDate = null;

    bookmarks.forEach(b => {
        totalLikes += parseInt(b.likes || 0);
        totalRetweets += parseInt(b.retweets || 0);

        if (b.username) {
            authorCounts[b.username] = (authorCounts[b.username] || 0) + 1;
        }

        if (b.dateTime) {
            const date = new Date(b.dateTime);
            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;
        }
    });

    const avgLikes = bookmarks.length > 0 ? totalLikes / bookmarks.length : 0;

    let topAuthor = { username: null, count: 0 };
    Object.entries(authorCounts).forEach(([username, count]) => {
        if (count > topAuthor.count) {
            topAuthor = { username, count };
        }
    });

    let dateRange = 'N/A';
    if (minDate && maxDate) {
        const minStr = minDate.toLocaleDateString();
        const maxStr = maxDate.toLocaleDateString();
        dateRange = minStr === maxStr ? minStr : `${minStr} - ${maxStr}`;
    }

    return {
        totalLikes,
        totalRetweets,
        avgLikes,
        topAuthor,
        dateRange
    };
}

/**
 * Generate Markdown content from bookmarks
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {Object} options - Export options
 * @param {Object} options.aiAnalysis - AI analysis results
 * @param {Function} options.getCustomTags - Function to get custom tags for a URL
 * @returns {string} Markdown content
 */
function generateMarkdown(bookmarks, options = {}) {
    if (!bookmarks || bookmarks.length === 0) return '';

    const { aiAnalysis = null, getCustomTags = () => [] } = options;
    const mdParts = [];

    // Header
    mdParts.push(`# X Bookmarks Export\n\n`);
    mdParts.push(`**Exported:** ${new Date().toLocaleString()}\n`);
    mdParts.push(`**Total Bookmarks:** ${bookmarks.length}\n\n`);
    mdParts.push(`---\n\n`);

    // Process bookmarks with simplified format
    bookmarks.forEach((bookmark, index) => {
        mdParts.push(`## Bookmark ${index + 1}\n\n`);

        // Tweet text
        if (bookmark.text) {
            mdParts.push(`**Text:** ${bookmark.text}\n\n`);
        }

        // Tweet owner
        const ownerName = bookmark.displayName || 'Unknown';
        const ownerHandle = bookmark.username ? `@${bookmark.username}` : '@unknown';
        mdParts.push(`**Owner:** ${ownerName} (${ownerHandle})\n\n`);

        // Category tags (max 5)
        const tags = [];

        // First, check for custom tags for this specific bookmark
        const customTags = getCustomTags(bookmark.url);
        if (customTags && customTags.length > 0) {
            tags.push(...customTags.slice(0, 5));
        }

        // If no custom tags or less than 5, add from AI analysis
        if (tags.length < 5 && aiAnalysis && aiAnalysis.tags) {
            const remainingSlots = 5 - tags.length;
            const aiTags = aiAnalysis.tags.slice(0, remainingSlots);
            tags.push(...aiTags);
        }

        if (tags.length > 0) {
            mdParts.push(`**Tags:** ${tags.join(', ')}\n\n`);
        }

        // Link
        mdParts.push(`**Link:** ${bookmark.url}\n\n`);

        // Media Links (High Quality)
        if (bookmark.media && bookmark.media.length > 0) {
            mdParts.push(`**Media:**\n`);
            bookmark.media.forEach(m => {
                mdParts.push(`- [${m.type === 'video' ? 'Video (MP4)' : 'Image (Original)'}](${m.url})\n`);
            });
            mdParts.push(`\n`);
        }

        mdParts.push(`---\n\n`);
    });

    return mdParts.join('');
}

/**
 * Download bookmarks as Markdown file
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {Object} options - Export options
 * @returns {void}
 */
function downloadMarkdown(bookmarks, options = {}) {
    const md = generateMarkdown(bookmarks, options);
    if (!md) return;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x-bookmarks-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Copy Markdown to clipboard
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {Object} options - Export options
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
async function copyToClipboard(bookmarks, options = {}) {
    if (!bookmarks || bookmarks.length === 0) {
        return { success: false, count: 0, error: 'No bookmarks to copy' };
    }

    const md = generateMarkdown(bookmarks, options);
    if (!md || md.trim() === '') {
        return { success: false, count: 0, error: 'No content to copy' };
    }

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(md);
            return { success: true, count: bookmarks.length };
        } else {
            // Fallback method
            const textarea = document.createElement('textarea');
            textarea.value = md;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                if (successful) {
                    return { success: true, count: bookmarks.length };
                } else {
                    return { success: false, count: 0, error: 'Clipboard copy failed' };
                }
            } catch (err) {
                document.body.removeChild(textarea);
                return { success: false, count: 0, error: err.message };
            }
        }
    } catch (err) {
        return { success: false, count: 0, error: err.message };
    }
}

module.exports = {
    generateMarkdown,
    downloadMarkdown,
    copyToClipboard,
    calculateBasicStats
};
