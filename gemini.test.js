const { GeminiProvider } = require('./popup.js');

describe('GeminiProvider', () => {
    let provider;
    const mockConstants = {
        AI_TEMPERATURE: 0.7,
        AI_MAX_TOKENS: 500
    };

    beforeEach(() => {
        jest.clearAllMocks();
        provider = new GeminiProvider('AIza-test-key', mockConstants);
    });

    test('analyzeBookmarks should call correct API endpoint', async () => {
        const mockResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({
                            overallSummary: "Test Summary",
                            tags: ["tag1"],
                            categories: ["cat1"]
                        })
                    }]
                }
            }]
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const bookmarks = [
            { text: "Bookmark 1", username: "user1" },
            { text: "Bookmark 2", username: "user2" }
        ];

        const result = await provider.analyzeBookmarks(bookmarks);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('generativelanguage.googleapis.com'),
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: expect.stringContaining('"temperature":0.7')
            })
        );

        expect(result).toEqual(expect.objectContaining({
            overallSummary: "Test Summary",
            tags: ["tag1"],
            categories: ["cat1"],
            timestamp: expect.any(Number)
        }));
    });

    test('should handle API errors gracefully', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: { message: 'Invalid API Key' } })
        });

        await expect(provider.analyzeBookmarks([{ text: "test" }]))
            .rejects.toThrow('Invalid API Key');
    });
});
