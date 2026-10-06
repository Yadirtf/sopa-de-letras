import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MiniWordPuzzle } from './MiniWordPuzzle';
import { sound } from '../services/sound.service';

export function Hero() {
  const { isAuthenticated, openAuth } = useAuth();

  const handlePlayFree = () => {
    sound.playClick();
    if (!isAuthenticated) {
      openAuth('register');
    } else {
      const el = document.getElementById('explorar');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGuestPlay = () => {
    sound.playClick();
    openAuth('guest');
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <div className="hero__badge">
          <span className="hero__badge-beacon" aria-hidden="true" />
          <span>1,280+ jugadores en línea compitiendo ahora</span>
        </div>

        <h1 className="hero__title" id="hero-title">
          Encuentra las palabras.<br />
          <span className="hero__highlight">Vence a todos.</span>
        </h1>

        <p className="hero__subtitle">
          La primera plataforma social de sopa de letras en tiempo real. Compite contra tus amigos, sube en el ranking global y desbloquea miles de niveles generados algorítmicamente.
        </p>

        <div className="hero__actions">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={handlePlayFree}
          >
            <span>{isAuthenticated ? 'Ir al Catálogo' : 'Jugar Gratis'}</span>
            <span>⚡</span>
          </button>

          {!isAuthenticated && (
            <button
              type="button"
              className="btn btn--amber btn--lg"
              onClick={handleGuestPlay}
            >
              Jugar como Invitado
            </button>
          )}

          <a href="#como-jugar" className="btn btn--ghost btn--lg">
            Cómo funciona
          </a>
        </div>
      </div>

      <div className="hero__interactive">
        <MiniWordPuzzle />
      </div>
    </section>
  );
}
