import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { ForgotPinForm } from './auth/ForgotPinForm';
import { GuestLoginForm } from './auth/GuestLoginForm';
import { sound } from '../services/sound.service';

export function AuthShowcaseSection() {
  const { isAuthenticated, user, openProfile } = useAuth();
  const [tab, setTab] = useState('register'); // 'register' | 'login' | 'forgot' | 'guest'

  const titles = {
    register: { icon: '✨', title: 'Crea tu Cuenta Oficial', subtitle: 'Elige tu avatar y un PIN de 4 dígitos' },
    login: { icon: '🔤', title: 'Iniciar Sesión', subtitle: 'Accede rápidamente con tu correo y PIN' },
    forgot: { icon: '🔑', title: 'Recuperar PIN', subtitle: 'Recibe un código temporal OTP por correo' },
    guest: { icon: '⚡', title: 'Modo Invitado', subtitle: 'Juega en segundos sin correo' },
  };

  const meta = titles[tab] || titles.register;

  return (
    <section className="section auth-showcase" id="registro" aria-labelledby="auth-showcase-title">
      <div className="section-header">
        <span className="section-tag">Acceso Rápido & Seguro</span>
        <h2 className="section-title" id="auth-showcase-title">
          {isAuthenticated ? 'Tu Cuenta WordHive' : 'Únete al Panal Competitivo'}
        </h2>
        <p className="section-subtitle">
          {isAuthenticated
            ? 'Ya has iniciado sesión. Gestiona tu perfil o explora los desafíos multijugador.'
            : 'Sin contraseñas complicadas: un PIN de 4 dígitos bioluminiscente sincronizado con tu móvil.'}
        </p>
      </div>

      <div className="auth-showcase__grid">
        {/* Columna Izquierda: Mockup Visual de la App */}
        <div className="app-preview-card">
          <div className="app-preview-badge">📱 Idéntico a la App Móvil</div>
          <h3 className="app-preview-title">Bioluminiscencia & Rapidez</h3>
          <p className="app-preview-desc">
            Diseñado con nuestro sistema visual de alta retención: teclado numérico reactivo, vibración sonora táctil y selección de avatares emblemáticos.
          </p>
          <div className="app-preview-features">
            <div className="app-preview-item">
              <span className="app-preview-icon">🔒</span>
              <div>
                <strong>PIN de 4 Dígitos</strong>
                <p>Protección bcrypt de 12 rondas sin fricción de contraseñas.</p>
              </div>
            </div>
            <div className="app-preview-item">
              <span className="app-preview-icon">🐝</span>
              <div>
                <strong>6 Avatares Únicos</strong>
                <p>Personaliza tu presencia en salas multijugador y podios.</p>
              </div>
            </div>
            <div className="app-preview-item">
              <span className="app-preview-icon">⚡</span>
              <div>
                <strong>Modo Invitado Instantáneo</strong>
                <p>Pasa a jugar en 1 clic sin dejar rastro ni requerir email.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta Interactiva de Autenticación */}
        <div className="auth-card auth-showcase__card">
          {isAuthenticated ? (
            <div className="auth-authenticated-box">
              <div className="auth-header__icon">🎉</div>
              <h3 className="auth-header__title">¡Sesión Activa!</h3>
              <p className="auth-header__subtitle">
                Has iniciado sesión como <strong>{user?.name}</strong> ({user?.isGuest ? 'Invitado' : user?.email})
              </p>
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={openProfile}
                >
                  Ver Perfil Completo
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-header">
                <div className="auth-header__icon">{meta.icon}</div>
                <h3 className="auth-header__title">{meta.title}</h3>
                <p className="auth-header__subtitle">{meta.subtitle}</p>
              </div>

              <div className="auth-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  className={`auth-tab ${tab === 'register' ? 'auth-tab--active' : ''}`}
                  onClick={() => { sound.playClick(); setTab('register'); }}
                >
                  Registro
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`auth-tab ${tab === 'login' ? 'auth-tab--active' : ''}`}
                  onClick={() => { sound.playClick(); setTab('login'); }}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`auth-tab ${tab === 'forgot' ? 'auth-tab--active' : ''}`}
                  onClick={() => { sound.playClick(); setTab('forgot'); }}
                >
                  Recuperar
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`auth-tab ${tab === 'guest' ? 'auth-tab--active' : ''}`}
                  onClick={() => { sound.playClick(); setTab('guest'); }}
                >
                  Invitado
                </button>
              </div>

              {tab === 'register' && (
                <RegisterForm onSwitchToLogin={() => { sound.playClick(); setTab('login'); }} />
              )}
              {tab === 'login' && (
                <LoginForm
                  onSwitchToRegister={() => { sound.playClick(); setTab('register'); }}
                  onSwitchToForgot={() => { sound.playClick(); setTab('forgot'); }}
                  onSwitchToGuest={() => { sound.playClick(); setTab('guest'); }}
                />
              )}
              {tab === 'forgot' && (
                <ForgotPinForm onSwitchToLogin={() => { sound.playClick(); setTab('login'); }} />
              )}
              {tab === 'guest' && (
                <GuestLoginForm onSwitchToLogin={() => { sound.playClick(); setTab('login'); }} />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
