import React from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/sound.service';

export function CtaBanner() {
  const { isAuthenticated, openAuth } = useAuth();

  return (
    <div className="cta-banner" role="region" aria-label="Llamado a la acción final">
      <h2 className="cta-banner__title">¿Listo para Dominar el Panal?</h2>
      <p className="cta-banner__desc">
        Configura tu cuenta en menos de 30 segundos con solo tu correo y un PIN numérico. Compite con jugadores de todo el mundo hoy mismo.
      </p>
      <div className="cta-banner__actions">
        {!isAuthenticated ? (
          <>
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => { sound.playClick(); openAuth('register'); }}
            >
              <span>Crear Cuenta Gratis</span>
              <span>✨</span>
            </button>
            <button
              type="button"
              className="btn btn--amber btn--lg"
              onClick={() => { sound.playClick(); openAuth('guest'); }}
            >
              <span>Jugar como Invitado</span>
              <span>⚡</span>
            </button>
          </>
        ) : (
          <a href="#explorar" className="btn btn--primary btn--lg">
            <span>Explorar Todas las Sopas</span>
            <span>→</span>
          </a>
        )}
      </div>
    </div>
  );
}
