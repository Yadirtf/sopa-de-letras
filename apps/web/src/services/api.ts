const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = API_BASE_URL ? `${API_BASE_URL}/api${cleanEndpoint}` : `/api${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Error ${response.status}: ${response.statusText || 'Error en la petición'}`);
  }

  return data;
};

export const api = {
  get: (endpoint: string) => fetchApi(endpoint, { method: 'GET' }),
  post: (endpoint: string, body?: any) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint: string, body?: any) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint: string, body?: any) => fetchApi(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint: string) => fetchApi(endpoint, { method: 'DELETE' }),
};
