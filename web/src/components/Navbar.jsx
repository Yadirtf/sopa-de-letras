import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AVATARS } from './auth/AvatarSelector';
import { sound } from '../services/sound.service';

export function Navbar() {
  const { user, isAuthenticated, openAuth, openProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userAvatar = AVATARS.find((a) => a.id === user?.avatarUrl) || {
    icon: user?.isGuest ? '⚡' : '🐝',
  };

  const handleNavClick = (id) => {
    sound.playClick();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar__container">
        <a href="/" className="navbar__logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="navbar__logo-badge">🔤</span>
          <span>WordHive</span>
        </a>

        <nav className={`navbar__nav ${mobileMenuOpen ? 'navbar__nav--open' : ''}`} aria-label="Navegación principal">
          <button type="button" className="navbar__link btn-link" onClick={() => handleNavClick('como-jugar')}>
            Cómo jugar
          </button>
          <button type="button" className="navbar__link btn-link" onClick={() => handleNavClick('explorar')}>
            Catálogo
          </button>
          <button type="button" className="navbar__link btn-link" onClick={() => handleNavClick('multijugador')}>
            Multijugador
          </button>
          <button type="button" className="navbar__link btn-link" onClick={() => handleNavClick('ranking')}>
            Podio
          </button>
        </nav>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <button
              type="button"
              className="user-pill"
              onClick={() => { sound.playClick(); openProfile(); }}
              aria-label="Ver perfil de usuario"
            >
              <span className="user-pill__avatar">{userAvatar.icon}</span>
              <span className="user-pill__name">{user.name}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => openAuth('login')}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => openAuth('register')}
              >
                Crear cuenta
              </button>
            </>
          )}

          <button
            type="button"
            className="navbar__toggle"
            aria-label="Alternar menú"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
