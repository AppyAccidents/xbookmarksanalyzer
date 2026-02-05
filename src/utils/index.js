/**
 * Utilities Index
 * Exports all utility functions
 */

const { debounce, throttle } = require('./debounce.js');
const {
    getStorage,
    setStorage,
    removeStorage,
    loadSettings,
    saveExtraction,
    loadExtraction
} = require('./storage.js');

module.exports = {
    debounce,
    throttle,
    getStorage,
    setStorage,
    removeStorage,
    loadSettings,
    saveExtraction,
    loadExtraction
};
