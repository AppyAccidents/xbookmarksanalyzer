/**
 * HTML Exporter
 * Generates styled HTML export for bookmarks
 */

const { calculateBasicStats } = require('./markdown.js');

/**
 * Generate HTML content from bookmarks
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {Object} options - Export options
 * @param {Object} options.aiAnalysis - AI analysis results
 * @returns {string} HTML content
 */
function generateHTML(bookmarks, options = {}) {
    if (!bookmarks || bookmarks.length === 0) return '';

    const { aiAnalysis = null } = options;
    const stats = calculateBasicStats(bookmarks);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>X Bookmarks Export</title>
  <style>
    :root {
      --primary: #1DA1F2;
      --bg: #15202B;
      --card-bg: #192734;
      --text: #FFFFFF;
      --text-secondary: #8899A6;
      --border: #38444D;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    header {
      text-align: center;
      padding: 40px 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 30px;
    }
    header h1 { font-size: 28px; margin-bottom: 10px; }
    header p { color: var(--text-secondary); }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: var(--card-bg);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }
    .stat-value { font-size: 24px; font-weight: bold; color: var(--primary); }
    .stat-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; }
    .bookmark {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      border: 1px solid var(--border);
    }
    .bookmark-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 12px;
    }
    .author-info strong { display: block; }
    .author-info span { color: var(--text-secondary); font-size: 14px; }
    .bookmark-text { margin-bottom: 12px; white-space: pre-wrap; }
    .bookmark-meta {
      display: flex;
      gap: 20px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    .bookmark-link {
      display: inline-block;
      margin-top: 12px;
      color: var(--primary);
      text-decoration: none;
    }
    .bookmark-link:hover { text-decoration: underline; }
    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
      margin-top: 12px;
    }
    .media-item {
      border-radius: 8px;
      overflow: hidden;
      background: var(--border);
      aspect-ratio: 16/9;
    }
    .media-item a {
      display: block;
      height: 100%;
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    footer {
      text-align: center;
      padding: 30px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    @media print {
      body { background: white; color: black; }
      .bookmark { border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📚 X Bookmarks Export</h1>
      <p>Exported on ${new Date().toLocaleString()}</p>
    </header>
    
    <section class="stats">
      <div class="stat-card">
        <div class="stat-value">${bookmarks.length}</div>
        <div class="stat-label">Bookmarks</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalLikes.toLocaleString()}</div>
        <div class="stat-label">Total Likes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalRetweets.toLocaleString()}</div>
        <div class="stat-label">Total Retweets</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.topAuthor.username ? '@' + stats.topAuthor.username : 'N/A'}</div>
        <div class="stat-label">Top Author</div>
      </div>
    </section>

    ${aiAnalysis ? `
    <section class="analysis" style="background: var(--card-bg); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
      <h2 style="margin-bottom: 15px;">🤖 AI Analysis</h2>
      <p style="margin-bottom: 15px;">${aiAnalysis.overallSummary || ''}</p>
      ${aiAnalysis.tags ? `<p><strong>Tags:</strong> ${aiAnalysis.tags.join(', ')}</p>` : ''}
      ${aiAnalysis.categories ? `<p><strong>Categories:</strong> ${aiAnalysis.categories.join(', ')}</p>` : ''}
    </section>
    ` : ''}

    <section class="bookmarks">
      ${bookmarks.map(b => `
        <article class="bookmark">
          <div class="bookmark-header">
            <div class="avatar">${(b.displayName || b.username || 'U')[0].toUpperCase()}</div>
            <div class="author-info">
              <strong>${b.displayName || 'Unknown'}</strong>
              <span>@${b.username || 'unknown'}</span>
            </div>
          </div>
          <div class="bookmark-text">${escapeHtml(b.text || '')}</div>
          <div class="bookmark-meta">
            <span>❤️ ${b.likes || 0}</span>
            <span>🔄 ${b.retweets || 0}</span>
            <span>💬 ${b.replies || 0}</span>
            <span>👁 ${b.views || 0}</span>
          </div>
          ${b.media && b.media.length > 0 ? `
            <div class="media-grid">
              ${b.media.map(m => `
                <div class="media-item">
                  <a href="${m.url}" target="_blank">${m.type === 'video' ? '🎬 Video' : '🖼 Image'}</a>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <a class="bookmark-link" href="${b.url}" target="_blank">View on X →</a>
        </article>
      `).join('')}
    </section>

    <footer>
      <p>Generated by X Bookmarks Analyzer</p>
    </footer>
  </div>
</body>
</html>`;

    return html;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Download bookmarks as HTML file
 * @param {Array} bookmarks - Array of bookmark objects
 * @param {Object} options - Export options
 * @returns {void}
 */
function downloadHTML(bookmarks, options = {}) {
    const html = generateHTML(bookmarks, options);
    if (!html) return;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x-bookmarks-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

module.exports = {
    generateHTML,
    downloadHTML,
    escapeHtml
};
