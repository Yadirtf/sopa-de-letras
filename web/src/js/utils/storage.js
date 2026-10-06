/**
 * WordHive Web — Session & Storage Helper
 */
import { STORAGE_KEYS } from './constants.js';

export const storage = {
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setSession(user, tokens) {
    if (tokens?.accessToken) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, tokens.accessToken);
    }
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  },
};
