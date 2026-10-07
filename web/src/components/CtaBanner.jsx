import React from 'react';
import { PLAY_URL, REGISTER_URL } from '../config/links';

export function CtaBanner() {
  return (
    <div className="cta-banner" role="region" aria-label="Empieza a jugar">
      <h2 className="cta-banner__title">¿Listo para tu primera sopa?</h2>
      <p className="cta-banner__desc">
        Crea tu cuenta en menos de un minuto con tu correo y un PIN de 4 números, o entra como invitado y juega ya.
      </p>
      <div className="cta-banner__actions">
        <a href={PLAY_URL} className="btn btn--primary btn--lg">
          <span>Jugar ahora</span>
          <span aria-hidden="true">▶</span>
        </a>
        <a href={REGISTER_URL} className="btn btn--amber btn--lg">
          Crear cuenta gratis
        </a>
      </div>
    </div>
  );
}
