import { create } from 'zustand';

interface User {
  id: string;
  nickname: string;
  email?: string;
  isGuest: boolean;
  monogramSeal?: string;
  monogramInk?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null) => void;
  updateMonogram: (seal: string, ink: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
    set({ user, token });
  },
  updateMonogram: (seal: string, ink: string) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, monogramSeal: seal, monogramInk: ink };
      try {
        localStorage.setItem('auth_user', JSON.stringify(updated));
      } catch {}
      return { user: updated };
    });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null });
  },
  loadFromStorage: () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    let user = null;
    if (userStr) {
      try { user = JSON.parse(userStr); } catch (e) {}
    }
    if (token) {
      set({ token, user });
    }
  },
}));
