/**
 * Chrome Storage Utilities
 * Helpers for interacting with chrome.storage.local
 */

/**
 * Get values from chrome.storage.local
 * @param {string|string[]} keys - Key(s) to retrieve
 * @returns {Promise<Object>} Storage values
 */
async function getStorage(keys) {
    return chrome.storage.local.get(keys);
}

/**
 * Set values in chrome.storage.local
 * @param {Object} data - Key-value pairs to store
 * @returns {Promise<void>}
 */
async function setStorage(data) {
    return chrome.storage.local.set(data);
}

/**
 * Remove values from chrome.storage.local
 * @param {string|string[]} keys - Key(s) to remove
 * @returns {Promise<void>}
 */
async function removeStorage(keys) {
    return chrome.storage.local.remove(keys);
}

/**
 * Load all settings from storage
 * @returns {Promise<Object>} Settings object
 */
async function loadSettings() {
    const keys = [
        'settings', 'apiKey', 'llmProvider', 'bookmarkMetadata',
        'collections', 'savedSearches', 'viewMode', 'reminders',
        'readingQueue', 'engagementHistory', 'systemPrompt'
    ];
    return getStorage(keys);
}

/**
 * Save bookmark extraction to storage
 * @param {Array} bookmarks - Array of bookmarks
 * @param {Object} performanceMetrics - Performance data
 * @returns {Promise<void>}
 */
async function saveExtraction(bookmarks, performanceMetrics = {}) {
    return setStorage({
        lastExtraction: {
            timestamp: Date.now(),
            bookmarks: bookmarks
        },
        performanceMetrics
    });
}

/**
 * Load last extraction from storage
 * @returns {Promise<{bookmarks: Array, timestamp: number, aiAnalysis: Object}>}
 */
async function loadExtraction() {
    const result = await getStorage(['lastExtraction', 'aiAnalysis', 'performanceMetrics', 'manualBookmarks']);

    let allBookmarks = [];
    let timestamp = null;

    if (result.lastExtraction) {
        allBookmarks = result.lastExtraction.bookmarks || [];
        timestamp = result.lastExtraction.timestamp;
    }

    // Add manual bookmarks
    if (result.manualBookmarks && result.manualBookmarks.length > 0) {
        allBookmarks = [...allBookmarks, ...result.manualBookmarks];
    }

    // Remove duplicates based on URL (keep most recent)
    const uniqueBookmarks = [];
    const seenUrls = new Set();

    allBookmarks.sort((a, b) => {
        const dateA = new Date(a.savedAt || a.dateTime || 0);
        const dateB = new Date(b.savedAt || b.dateTime || 0);
        return dateB - dateA;
    });

    for (const bookmark of allBookmarks) {
        if (bookmark.url && !seenUrls.has(bookmark.url)) {
            uniqueBookmarks.push(bookmark);
            seenUrls.add(bookmark.url);
        }
    }

    return {
        bookmarks: uniqueBookmarks,
        timestamp,
        aiAnalysis: result.aiAnalysis || null,
        performanceMetrics: result.performanceMetrics || {}
    };
}

module.exports = {
    getStorage,
    setStorage,
    removeStorage,
    loadSettings,
    saveExtraction,
    loadExtraction
};
