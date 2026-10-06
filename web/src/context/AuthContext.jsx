import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { sound } from '../services/sound.service';
import confetti from 'canvas-confetti';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register' | 'forgot' | 'guest'
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Cargar sesión persistida al iniciar
  useEffect(() => {
    const session = authService.getStoredSession();
    if (session) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const openAuth = (tab = 'login') => {
    sound.playClick();
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    sound.playClick();
    setAuthModalOpen(false);
  };

  const handleAuthSuccess = (result, message) => {
    authService.saveSession(result);
    setUser(result.user);
    setToken(result.accessToken);
    setAuthModalOpen(false);
    sound.playSuccess();
    showToast(message, 'success');

    // Confetti bioluminiscente de celebración
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#7C3AED', '#06B6D4', '#F59E0B', '#10B981'],
      });
    } catch {
      // Ignorar si falla canvas
    }
  };

  const login = async (email, pin) => {
    const res = await authService.login({ email, pin });
    handleAuthSuccess(res, `¡Bienvenido de nuevo, ${res.user.name}!`);
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    handleAuthSuccess(res, `¡Cuenta creada con éxito! Bienvenido, ${res.user.name}.`);
    return res;
  };

  const guestLogin = async (data) => {
    const res = await authService.guestLogin(data);
    handleAuthSuccess(res, `Iniciaste como invitado: ${res.user.name}`);
    return res;
  };

  const forgotPin = async (email) => {
    const res = await authService.forgotPin(email);
    sound.playClick();
    showToast(res.message || 'Código enviado a tu correo', 'success');
    return res;
  };

  const resetPin = async (payload) => {
    const res = await authService.resetPin(payload);
    sound.playSuccess();
    showToast('PIN restablecido con éxito. Ahora inicia sesión.', 'success');
    setAuthModalTab('login');
    return res;
  };

  const logout = () => {
    sound.playClick();
    authService.clearSession();
    setUser(null);
    setToken(null);
    setProfileModalOpen(false);
    showToast('Sesión cerrada correctamente', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isGuest: !!user?.isGuest,
        loading,
        authModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuth,
        closeAuth,
        profileModalOpen,
        openProfile: () => setProfileModalOpen(true),
        closeProfile: () => setProfileModalOpen(false),
        login,
        register,
        guestLogin,
        forgotPin,
        resetPin,
        logout,
        toasts,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  return context;
}
