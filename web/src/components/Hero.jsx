import React from 'react';
import { MiniWordPuzzle } from './MiniWordPuzzle';
import { LOGIN_URL, PLAY_URL } from '../config/links';

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <div className="hero__badge">
          <span className="hero__badge-beacon" aria-hidden="true" />
          <span>Gratis · Sin descargas · Para toda la familia</span>
        </div>

        <h1 className="hero__title" id="hero-title">
          Encuentra las palabras.<br />
          <span className="hero__highlight">Juega con quien quieras.</span>
        </h1>

        <p className="hero__subtitle">
          Sopas de letras para jugar solo o con amigos en tiempo real, desde el navegador o el móvil.
          Crea tu sala, comparte el código y que gane quien complete su sopa primero.
        </p>

        <div className="hero__actions">
          <a href={PLAY_URL} className="btn btn--primary btn--lg">
            <span>Jugar ahora</span>
            <span aria-hidden="true">▶</span>
          </a>
          <a href={LOGIN_URL} className="btn btn--amber btn--lg">
            Probar como invitado
          </a>
        </div>
        <p className="hero__hint">¿Calentamos? Toca una a una las letras de una palabra en la sopa de al lado.</p>
      </div>

      <div className="hero__interactive">
        <MiniWordPuzzle />
      </div>
    </section>
  );
}
