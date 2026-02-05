const { LLMProvider } = require('./base.js');

/**
 * LLM-Free Provider - Basic analysis without external API calls
 * Uses keyword extraction and category detection locally
 */
class LLMFreeProvider extends LLMProvider {
    constructor(constants) {
        super(constants);
    }

    async analyzeBookmarks(bookmarks) {
        // Perform basic text analysis without external LLM
        if (!bookmarks || bookmarks.length === 0) {
            throw new Error('No bookmark content to analyze');
        }

        // Extract common words for tags
        const wordFrequency = {};
        const authorFrequency = {};
        const allText = [];

        bookmarks.forEach(b => {
            if (b.text) {
                allText.push(b.text.toLowerCase());
                // Extract words (simple tokenization)
                const words = b.text.toLowerCase()
                    .replace(/[^\w\s#@]/g, ' ')
                    .split(/\s+/)
                    .filter(w => w.length > 3 && !this.isStopWord(w));

                words.forEach(word => {
                    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
                });
            }

            if (b.username) {
                authorFrequency[b.username] = (authorFrequency[b.username] || 0) + 1;
            }
        });

        // Get top tags (most frequent words)
        const tags = Object.entries(wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);

        // Detect categories based on keywords
        const categories = this.detectCategories(allText.join(' '));

        // Generate basic summary
        const topAuthor = Object.entries(authorFrequency)
            .sort((a, b) => b[1] - a[1])[0];

        const summary = `This collection contains ${bookmarks.length} bookmarks. ` +
            `Most frequently bookmarked author: @${topAuthor ? topAuthor[0] : 'N/A'}. ` +
            `Common topics include: ${tags.slice(0, 3).join(', ')}.`;

        return {
            overallSummary: summary,
            tags: tags,
            categories: categories,
            timestamp: Date.now()
        };
    }

    /**
     * Check if word is a common stop word
     * @param {string} word - Word to check
     * @returns {boolean}
     */
    isStopWord(word) {
        const stopWords = [
            'that', 'this', 'with', 'from', 'have', 'will', 'your', 'they',
            'been', 'more', 'when', 'there', 'their', 'would', 'about',
            'which', 'these', 'https', 'http', 'just', 'like', 'what', 'some',
            'than', 'then', 'into', 'only', 'also', 'could', 'should'
        ];
        return stopWords.includes(word);
    }

    /**
     * Detect categories based on keyword matching
     * @param {string} text - Combined text from all bookmarks
     * @returns {Array<string>} Detected categories
     */
    detectCategories(text) {
        const categories = [];
        const lowerText = text.toLowerCase();

        const categoryKeywords = {
            'Technology': ['tech', 'software', 'code', 'programming', 'developer', 'ai', 'data', 'cloud', 'api', 'javascript', 'python'],
            'Business': ['business', 'startup', 'entrepreneur', 'market', 'company', 'revenue', 'growth', 'investor', 'funding'],
            'News & Politics': ['news', 'political', 'government', 'election', 'policy', 'breaking', 'vote', 'democracy'],
            'Science': ['science', 'research', 'study', 'paper', 'scientific', 'discovery', 'experiment'],
            'Entertainment': ['movie', 'music', 'game', 'entertainment', 'show', 'video', 'film', 'concert'],
            'Sports': ['sport', 'team', 'player', 'game', 'match', 'football', 'basketball', 'soccer'],
            'Education': ['learn', 'education', 'course', 'tutorial', 'teaching', 'university', 'class'],
            'Health': ['health', 'medical', 'wellness', 'fitness', 'mental', 'exercise', 'diet'],
            'Finance': ['crypto', 'bitcoin', 'stock', 'finance', 'invest', 'trading', 'money'],
            'Design': ['design', 'ux', 'ui', 'figma', 'creative', 'art', 'visual']
        };

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
            if (matches >= 2) {
                categories.push(category);
            }
        }

        if (categories.length === 0) {
            categories.push('General');
        }

        return categories.slice(0, 5);
    }
}

module.exports = { LLMFreeProvider };
