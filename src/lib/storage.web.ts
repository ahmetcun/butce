import type { StateStorage } from 'zustand/middleware';

/** Web'de SQLite (wasm) yerine tarayıcının localStorage'ı kullanılır. */
export const storage: StateStorage = {
  getItem: (key) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key)),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
};
