/**
 * WordHive API Service
 * Capa de transporte HTTP con soporte de fallback mock si el backend local no está disponible.
 */
import { handleMockAuth } from './mock-auth.fallback';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api/v1';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isBackendAvailable = false;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const healthUrl = this.baseUrl.includes('://')
        ? this.baseUrl.replace(/\/api\/v1\/?$/, '/health')
        : '/health';
      const res = await fetch(healthUrl, { signal: controller.signal });
      clearTimeout(timeout);
      this.isBackendAvailable = res.ok;
      return res.ok;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  async get(endpoint, params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const url = query ? `${this.baseUrl}${endpoint}?${query}` : `${this.baseUrl}${endpoint}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || `Error del servidor (${res.status})`);
      }
      this.isBackendAvailable = true;
      return json;
    } catch (err) {
      this.isBackendAvailable = false;
      throw err;
    }
  }

  async post(endpoint, data) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || `Error del servidor (${res.status})`);
      }
      this.isBackendAvailable = true;
      return json;
    } catch (err) {
      if (
        err.name === 'AbortError' ||
        err.name === 'TypeError' ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError')
      ) {
        this.isBackendAvailable = false;
        return handleMockAuth(endpoint, data);
      }
      throw err;
    }
  }
}

export const api = new ApiService();
