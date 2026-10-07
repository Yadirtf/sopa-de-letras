/**
 * WordHive API Service
 * Lecturas publicas del backend para la landing (catalogo). Todo lo que
 * necesita cuenta vive en la version web del juego (/jugar/).
 */
const API_BASE_URL = import.meta.env?.VITE_API_URL || '/api/v1';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${this.baseUrl}${endpoint}?${query}` : `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || `Error del servidor (${res.status})`);
      return json;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const api = new ApiService();
