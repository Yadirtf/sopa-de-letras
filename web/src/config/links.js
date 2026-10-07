/**
 * Enlaces de la landing hacia la version web del juego (Flutter), que se
 * publica en /jugar/ del mismo sitio. En local se puede apuntar a otro sitio
 * con VITE_PLAY_URL (por ejemplo http://localhost:8080/).
 */
const PLAY_BASE = (import.meta.env?.VITE_PLAY_URL || '/jugar/').replace(/\/?$/, '/');

/** Ruta dentro del juego: playLink('login') -> /jugar/login */
export const playLink = (path = '') => `${PLAY_BASE}${path.replace(/^\//, '')}`;

export const PLAY_URL = playLink();
export const LOGIN_URL = playLink('login');
export const REGISTER_URL = playLink('register');
