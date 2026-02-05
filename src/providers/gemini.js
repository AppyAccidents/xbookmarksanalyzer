const { LLMProvider } = require('./base.js');

/**
 * Gemini Provider - Uses Gemini 1.5 Flash for bookmark analysis
 */
class GeminiProvider extends LLMProvider {
    constructor(apiKey, constants) {
        super(constants);
        this.apiKey = apiKey;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }

    async analyzeBookmarks(bookmarks) {
        const bookmarkTexts = this.prepareBookmarkTexts(bookmarks);

        if (!bookmarkTexts) {
            throw new Error('No bookmark content to analyze');
        }

        const prompt = `Analyze these Twitter/X bookmarks and provide:
1. An overall summary (2-3 sentences) of the main themes
2. A list of 5-10 relevant tags/keywords
3. 3-5 main categories these bookmarks fall into

Bookmarks:
${bookmarkTexts}

Respond in JSON format:
{
  "overallSummary": "...",
  "tags": ["tag1", "tag2", ...],
  "categories": ["category1", "category2", ...]
}`;

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: this.constants.AI_TEMPERATURE,
                        maxOutputTokens: this.constants.AI_MAX_TOKENS,
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('Invalid API response structure');
            }

            const content = data.candidates[0].content.parts[0].text;
            const analysis = this.parseJSONResponse(content);
            return this.validateAnalysis(analysis);
        } catch (error) {
            console.error('Gemini Analysis error:', error);
            throw error;
        }
    }
}

module.exports = { GeminiProvider };
