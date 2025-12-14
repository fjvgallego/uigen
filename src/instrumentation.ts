// Fix for Node.js 22+ experimental localStorage breaking libraries like `debug`
// The experimental localStorage exists but doesn't work without --localstorage-file
export async function register() {
  if (typeof globalThis.localStorage !== 'undefined') {
    const storage = new Map<string, string>();

    // Replace with a working implementation
    (globalThis as any).localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
      get length() { return storage.size; },
      key: (index: number) => [...storage.keys()][index] ?? null,
    };
  }
}
