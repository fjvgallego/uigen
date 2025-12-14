// Polyfill for Node.js 22+ experimental localStorage that breaks libraries
if (typeof globalThis.localStorage !== 'undefined') {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    get length() { return storage.size; },
    key: (index) => [...storage.keys()][index] ?? null,
  };
}
