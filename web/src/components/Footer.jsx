import React from 'react';
import { BrandLogo } from './BrandLogo';
import { LOGIN_URL, PLAY_URL } from '../config/links';

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        <div className="footer__brand">
          <BrandLogo size={28} />
          <p className="footer__tagline">Sopas de letras para jugar con amigos y familia.</p>
        </div>

        <nav className="footer__links" aria-label="Enlaces de pie de página">
          <a href="#como-jugar" className="footer__link">Cómo jugar</a>
          <a href="#funciones" className="footer__link">Funciones</a>
          <a href={LOGIN_URL} className="footer__link">Entrar</a>
          <a href={PLAY_URL} className="footer__link">Jugar</a>
        </nav>

        <p className="footer__copy">© {new Date().getFullYear()} WordHive</p>
      </div>
    </footer>
  );
}
