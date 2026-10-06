import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPinForm } from './ForgotPinForm';
import { GuestLoginForm } from './GuestLoginForm';
import { sound } from '../../services/sound.service';

export function AuthModal() {
  const { authModalOpen, authModalTab, setAuthModalTab, closeAuth } = useAuth();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && authModalOpen) closeAuth();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [authModalOpen, closeAuth]);

  if (!authModalOpen) return null;

  const titles = {
    login: { icon: '🔤', title: 'Iniciar Sesión', subtitle: 'Ingresa tu correo y tu PIN de 4 dígitos' },
    register: { icon: '✨', title: 'Crear Cuenta', subtitle: 'Configura tu perfil y tu PIN de acceso' },
    forgot: { icon: '🔑', title: 'Recuperar PIN', subtitle: 'Restablece tu PIN mediante código OTP' },
    guest: { icon: '⚡', title: 'Modo Invitado', subtitle: 'Juega al instante sin registro' },
  };

  const currentMeta = titles[authModalTab] || titles.login;

  return (
    <div className="modal-backdrop" onClick={closeAuth} role="dialog" aria-modal="true">
      <div className="modal-container auth-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={closeAuth}
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <div className="auth-header">
          <div className="auth-header__icon">{currentMeta.icon}</div>
          <h2 className="auth-header__title">{currentMeta.title}</h2>
          <p className="auth-header__subtitle">{currentMeta.subtitle}</p>
        </div>

        {/* Barra de pestañas */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={authModalTab === 'login'}
            className={`auth-tab ${authModalTab === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => { sound.playClick(); setAuthModalTab('login'); }}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authModalTab === 'register'}
            className={`auth-tab ${authModalTab === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => { sound.playClick(); setAuthModalTab('register'); }}
          >
            Registro
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authModalTab === 'guest'}
            className={`auth-tab ${authModalTab === 'guest' ? 'auth-tab--active' : ''}`}
            onClick={() => { sound.playClick(); setAuthModalTab('guest'); }}
          >
            Invitado
          </button>
        </div>

        {authModalTab === 'login' && (
          <LoginForm
            onSwitchToRegister={() => { sound.playClick(); setAuthModalTab('register'); }}
            onSwitchToForgot={() => { sound.playClick(); setAuthModalTab('forgot'); }}
            onSwitchToGuest={() => { sound.playClick(); setAuthModalTab('guest'); }}
          />
        )}

        {authModalTab === 'register' && (
          <RegisterForm onSwitchToLogin={() => { sound.playClick(); setAuthModalTab('login'); }} />
        )}

        {authModalTab === 'forgot' && (
          <ForgotPinForm onSwitchToLogin={() => { sound.playClick(); setAuthModalTab('login'); }} />
        )}

        {authModalTab === 'guest' && (
          <GuestLoginForm onSwitchToLogin={() => { sound.playClick(); setAuthModalTab('login'); }} />
        )}
      </div>
    </div>
  );
}
