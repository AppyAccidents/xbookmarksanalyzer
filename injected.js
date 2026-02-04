// X Bookmarks Interceptor
// Injected into the main world to proxy network requests and capture Bookmark data

(function () {
    console.log('[X Interceptor] Initializing network interceptor...');

    // Helper to dispatch data to content script
    const dispatchData = (url, responseBody) => {
        try {
            if (!url.includes('Bookmarks')) return; // Minimal filtering

            const data = JSON.parse(responseBody);
            window.dispatchEvent(new CustomEvent('x-bookmarks-response', {
                detail: {
                    url,
                    data,
                    timestamp: Date.now()
                }
            }));
        } catch (e) {
            // Ignore parse errors or non-JSON responses
        }
    };

    // 1. Intercept XMLHttpRequest
    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;

    XHR.open = function (method, url) {
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            if (this._url && (this._url.includes('Bookmarks') || this._url.includes('bookmarks'))) {
                dispatchData(this._url, this.responseText);
            }
        });
        return send.apply(this, arguments);
    };

    // 2. Intercept Fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const response = await originalFetch.apply(this, args);

        // Clone response to read body without consuming it
        const clone = response.clone();
        const url = clone.url;

        if (url && (url.includes('Bookmarks') || url.includes('bookmarks'))) {
            clone.text().then(body => {
                dispatchData(url, body);
            }).catch(() => { });
        }

        return response;
    };

    console.log('[X Interceptor] Interceptor active.');
})();
