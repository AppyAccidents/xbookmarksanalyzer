/**
 * LLM Provider Base Class
 * All LLM providers (OpenAI, Anthropic, Gemini, LLM-Free) extend this class.
 */
class LLMProvider {
    constructor(constants) {
        this.constants = constants || {
            AI_ANALYSIS_LIMIT: 50,
            AI_MAX_TOKENS: 500,
            AI_TEMPERATURE: 0.7,
            MAX_TAGS: 20,
            MAX_CATEGORIES: 10
        };
    }

    /**
     * Prepare bookmark texts for analysis
     * @param {Array} bookmarks - Array of bookmark objects
     * @returns {string} Formatted text for LLM analysis
     */
    prepareBookmarkTexts(bookmarks) {
        return bookmarks
            .filter(b => b.text && b.text.trim())
            .slice(0, this.constants.AI_ANALYSIS_LIMIT)
            .map(b => `@${b.username}: ${b.text}`)
            .join('\n\n');
    }

    /**
     * Parse JSON response from LLM with multiple fallback strategies
     * @param {string} content - Raw response content
     * @returns {Object} Parsed analysis object
     */
    parseJSONResponse(content) {
        let analysis = null;

        // Strategy 1: Try parsing entire content as JSON
        try {
            analysis = JSON.parse(content);
            return analysis;
        } catch (e) {
            // Strategy 2: Extract JSON from markdown code blocks
            const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
                try {
                    analysis = JSON.parse(codeBlockMatch[1]);
                    return analysis;
                } catch (e2) {
                    // Continue to next strategy
                }
            }

            // Strategy 3: Find first JSON object in content
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    analysis = JSON.parse(jsonMatch[0]);
                    return analysis;
                } catch (e3) {
                    throw new Error('Failed to parse response as JSON');
                }
            } else {
                throw new Error('No JSON found in response');
            }
        }
    }

    /**
     * Validate and sanitize analysis response
     * @param {Object} analysis - Raw analysis object
     * @returns {Object} Validated analysis object
     */
    validateAnalysis(analysis) {
        if (!analysis || typeof analysis !== 'object') {
            throw new Error('Analysis is not a valid object');
        }

        const validatedAnalysis = {
            overallSummary: typeof analysis.overallSummary === 'string' ? analysis.overallSummary : '',
            tags: Array.isArray(analysis.tags) ? analysis.tags.filter(t => typeof t === 'string').slice(0, this.constants.MAX_TAGS) : [],
            categories: Array.isArray(analysis.categories) ? analysis.categories.filter(c => typeof c === 'string').slice(0, this.constants.MAX_CATEGORIES) : [],
            timestamp: Date.now()
        };

        if (!validatedAnalysis.overallSummary && validatedAnalysis.tags.length === 0 && validatedAnalysis.categories.length === 0) {
            throw new Error('Response contained no useful analysis data');
        }

        return validatedAnalysis;
    }

    /**
     * Analyze bookmarks - must be implemented by subclass
     * @param {Array} bookmarks - Array of bookmark objects
     * @returns {Promise<Object>} Analysis result
     */
    async analyzeBookmarks(bookmarks) {
        throw new Error('analyzeBookmarks must be implemented by subclass');
    }
}

module.exports = { LLMProvider };
