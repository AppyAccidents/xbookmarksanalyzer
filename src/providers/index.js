/**
 * LLM Providers Module
 * Exports all provider classes and a factory function for creating instances
 */

const { LLMProvider } = require('./base.js');
const { OpenAIProvider } = require('./openai.js');
const { AnthropicProvider } = require('./anthropic.js');
const { GeminiProvider } = require('./gemini.js');
const { LLMFreeProvider } = require('./llm-free.js');

/**
 * Create an LLM provider instance based on provider type
 * @param {string} providerType - 'openai', 'anthropic', 'gemini', or 'none'
 * @param {string} apiKey - API key for the provider (not needed for 'none')
 * @param {Object} constants - Configuration constants
 * @returns {LLMProvider} Provider instance
 */
function createProvider(providerType, apiKey, constants) {
    switch (providerType) {
        case 'openai':
            return new OpenAIProvider(apiKey, constants);
        case 'anthropic':
            return new AnthropicProvider(apiKey, constants);
        case 'gemini':
            return new GeminiProvider(apiKey, constants);
        case 'none':
        default:
            return new LLMFreeProvider(constants);
    }
}

/**
 * Validate API key format for a given provider
 * @param {string} apiKey - API key to validate
 * @param {string} provider - Provider type
 * @param {number} minLength - Minimum key length (default 20)
 * @returns {{valid: boolean, error: string|null}}
 */
function validateApiKey(apiKey, provider, minLength = 20) {
    if (!apiKey || typeof apiKey !== 'string') {
        return { valid: false, error: 'API key is required' };
    }

    const trimmedKey = apiKey.trim();

    if (trimmedKey.length === 0) {
        return { valid: false, error: 'API key cannot be empty' };
    }

    // Provider-specific validation
    if (provider === 'openai') {
        if (!trimmedKey.startsWith('sk-')) {
            return { valid: false, error: 'Invalid API key format. OpenAI keys start with "sk-"' };
        }
    } else if (provider === 'anthropic') {
        if (!trimmedKey.startsWith('sk-ant-')) {
            return { valid: false, error: 'Invalid API key format. Anthropic keys start with "sk-ant-"' };
        }
    } else if (provider === 'gemini') {
        if (!trimmedKey.startsWith('AIza')) {
            return { valid: false, error: 'Invalid API key format. Gemini keys usually start with "AIza"' };
        }
    }

    if (trimmedKey.length < minLength) {
        return { valid: false, error: 'API key is too short. Please check your key.' };
    }

    return { valid: true, error: null };
}

module.exports = {
    LLMProvider,
    OpenAIProvider,
    AnthropicProvider,
    GeminiProvider,
    LLMFreeProvider,
    createProvider,
    validateApiKey
};
