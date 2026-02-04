module.exports = {
    testEnvironment: 'jsdom',
    verbose: true,
    moduleFileExtensions: ['js', 'json'],
    transform: {}, // Disable transforms since we're using vanilla JS
    setupFiles: ['./jest.setup.js'], // Setup file for globals
};
