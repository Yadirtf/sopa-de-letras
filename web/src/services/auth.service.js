/**
 * WordHive Auth Service
 * Orquesta las llamadas de autenticación de la aplicación web
 */

import { api } from './api.service.js';

class AuthService {
  async register({ name, age, email, pin, avatarUrl }) {
    return api.post('/auth/register', {
      name,
      age: Number(age),
      email: email.trim().toLowerCase(),
      pin,
      avatarUrl,
    });
  }

  async login({ email, pin }) {
    return api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      pin,
    });
  }

  async guestLogin({ name, avatarUrl } = {}) {
    return api.post('/auth/guest', {
      name,
      avatarUrl,
    });
  }

  async forgotPin(email) {
    return api.post('/auth/forgot-pin', {
      email: email.trim().toLowerCase(),
    });
  }

  async resetPin({ email, otpCode, newPin }) {
    return api.post('/auth/reset-pin', {
      email: email.trim().toLowerCase(),
      otpCode: otpCode.trim(),
      newPin,
    });
  }

  saveSession(sessionData) {
    if (sessionData?.accessToken) {
      localStorage.setItem('wh_token', sessionData.accessToken);
    }
    if (sessionData?.user) {
      localStorage.setItem('wh_user', JSON.stringify(sessionData.user));
    }
  }

  getStoredSession() {
    try {
      const userStr = localStorage.getItem('wh_user');
      const token = localStorage.getItem('wh_token');
      if (userStr && token) {
        return { user: JSON.parse(userStr), token };
      }
    } catch {
      // JSON inválido
    }
    return null;
  }

  clearSession() {
    localStorage.removeItem('wh_token');
    localStorage.removeItem('wh_user');
  }
}

export const authService = new AuthService();
