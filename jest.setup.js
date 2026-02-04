// Mock chrome global
global.chrome = {
    storage: {
        local: {
            get: jest.fn(),
            set: jest.fn(),
            remove: jest.fn()
        }
    },
    runtime: {
        onMessage: {
            addListener: jest.fn()
        },
        sendMessage: jest.fn(),
        lastError: null
    },
    tabs: {
        query: jest.fn(),
        sendMessage: jest.fn()
    },
    scripting: {
        executeScript: jest.fn()
    }
};

// Mock fetch
global.fetch = jest.fn();

// Mock performance
global.performance = {
    now: jest.fn(() => Date.now())
};
