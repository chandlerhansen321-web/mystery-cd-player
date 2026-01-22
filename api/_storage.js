// Simple in-memory storage that persists across function calls in the same instance
// NOTE: This will reset on Vercel redeploys. For production, use Vercel KV, MongoDB, or similar.

// Global storage object
global.cdsDatabase = global.cdsDatabase || {};

export function getCD(code) {
    return global.cdsDatabase[code.toUpperCase()];
}

export function saveCD(code, cdData) {
    global.cdsDatabase[code.toUpperCase()] = cdData;
}

export function getAllCodes() {
    return Object.keys(global.cdsDatabase);
}

export function getCDCount() {
    return Object.keys(global.cdsDatabase).length;
}
