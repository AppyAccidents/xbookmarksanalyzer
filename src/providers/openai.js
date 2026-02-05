const { LLMProvider } = require('./base.js');

/**
 * OpenAI Provider - Uses GPT-3.5-turbo for bookmark analysis
 */
class OpenAIProvider extends LLMProvider {
    constructor(apiKey, constants) {
        super(constants);
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-3.5-turbo';
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
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that analyzes social media content and provides structured summaries.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: this.constants.AI_TEMPERATURE,
                    max_tokens: this.constants.AI_MAX_TOKENS
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
                throw new Error('Invalid API response structure');
            }

            if (!data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('Missing content in API response');
            }

            const content = data.choices[0].message.content;
            const analysis = this.parseJSONResponse(content);
            return this.validateAnalysis(analysis);
        } catch (error) {
            console.error('OpenAI Analysis error:', error);
            throw error;
        }
    }
}

module.exports = { OpenAIProvider };
