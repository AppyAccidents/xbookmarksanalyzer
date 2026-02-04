const { PopupController, LLMFreeProvider, GeminiProvider } = require('./popup.js');

// Mock helpers
const mockStorage = (data = {}) => {
    chrome.storage.local.get.mockImplementation((keys) => {
        if (Array.isArray(keys)) {
            const result = {};
            keys.forEach(k => result[k] = data[k]);
            return Promise.resolve(result);
        }
        return Promise.resolve({ [keys]: data[keys] });
    });
    chrome.storage.local.set.mockResolvedValue();
};

describe('PopupController Implementation', () => {
    let controller;

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = `
      <div id="status-bar"></div>
      <button id="analyzeAiBtn">Analyze Bookmarks</button>
      <div id="ai-results"></div>
      <select id="providerSelect">
        <option value="none">None</option>
        <option value="gemini">Gemini</option>
      </select>
      <input id="apiKeyInput" value="" />
      <div id="settings-dialog"></div>
    `;

        mockStorage({
            settings: { darkMode: false },
            apiKey: 'test-key',
            llmProvider: 'gemini'
        });
    });

    test('should initialize with settings from storage', async () => {
        controller = new PopupController();

        // Wait for the async loadSettings to complete
        // We can't await the constructor, but we can await a promise if we exposed one.
        // Since we didn't, we wait a tick or spy on storage.
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(chrome.storage.local.get).toHaveBeenCalled();
        expect(controller.state.apiKey).toBe('test-key');
        expect(controller.state.llmProvider).toBe('gemini');
    });

    test('validateApiKey should correctly validate Gemini keys', () => {
        controller = new PopupController();

        const valid = controller.validateApiKey('AIzaSyD-valid-key-longer-than-20-chars', 'gemini');
        expect(valid.valid).toBe(true);

        const invalidPrefix = controller.validateApiKey('sk-invalid-key-longer-than-20-chars', 'gemini');
        expect(invalidPrefix.valid).toBe(false);
        expect(invalidPrefix.error).toContain('start with "AIza"');
    });

    test('createLLMProvider should return correct instance', () => {
        controller = new PopupController();

        controller.state.llmProvider = 'gemini';
        controller.state.apiKey = 'test';
        expect(controller.createLLMProvider()).toBeInstanceOf(GeminiProvider);

        controller.state.llmProvider = 'none';
        expect(controller.createLLMProvider()).toBeInstanceOf(LLMFreeProvider);
    });
});
