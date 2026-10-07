import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { LOGIN_URL, PLAY_URL } from '../config/links';

const SECTIONS = [
  { id: 'como-jugar', label: 'Cómo jugar' },
  { id: 'funciones', label: 'Funciones' },
  { id: 'sopas', label: 'Sopas' },
  { id: 'donde-jugar', label: 'Dónde jugar' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar__container">
        <a
          href="/"
          className="navbar__logo"
          aria-label="WordHive, ir al inicio"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <BrandLogo size={34} />
        </a>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`} aria-label="Navegación principal">
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" className="navbar__link btn-link" onClick={() => goTo(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="navbar__actions">
          <a href={LOGIN_URL} className="btn btn--ghost btn--sm navbar__login">
            Entrar
          </a>
          <a href={PLAY_URL} className="btn btn--primary btn--sm">
            Jugar ahora
          </a>
          <button
            type="button"
            className="navbar__toggle"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
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
