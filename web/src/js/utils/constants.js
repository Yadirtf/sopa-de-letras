/**
 * WordHive Web — Constantes Globales
 */
export const AVATARS = [
  { id: 'bee_scout', name: 'Explorador', icon: '🐝' },
  { id: 'bee_queen', name: 'Reina', icon: '👑' },
  { id: 'honey_pot', name: 'Panal', icon: '🍯' },
  { id: 'lightning', name: 'Veloz', icon: '⚡' },
  { id: 'star', name: 'Estrella', icon: '⭐' },
  { id: 'flower', name: 'Polen', icon: '🌸' },
];

export const STORAGE_KEYS = {
  TOKEN: 'wordhive_token',
  USER: 'wordhive_user',
  SANDBOX_USERS: 'wordhive_sandbox_users',
};

export const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/v1'
    : '/api/v1');
