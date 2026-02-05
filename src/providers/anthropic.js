const { LLMProvider } = require('./base.js');

/**
 * Anthropic Provider - Uses Claude 3.5 Sonnet for bookmark analysis
 */
class AnthropicProvider extends LLMProvider {
    constructor(apiKey, constants) {
        super(constants);
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-5-sonnet-20241022';
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
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: this.constants.AI_MAX_TOKENS,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
                throw new Error('Invalid API response structure');
            }

            const content = data.content[0].text;
            const analysis = this.parseJSONResponse(content);
            return this.validateAnalysis(analysis);
        } catch (error) {
            console.error('Anthropic Analysis error:', error);
            throw error;
        }
    }
}

module.exports = { AnthropicProvider };
