import React from 'react';

export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        <div className="footer__brand">
          <span style={{ fontSize: '16px' }}>🔤 WordHive</span>
          <p style={{ fontSize: '13px', marginTop: 4, color: 'var(--wh-text-secondary)' }}>
            Juega solo, vence a todos. La sopa de letras reinventada.
          </p>
        </div>

        <nav className="footer__links" aria-label="Enlaces de pie de página">
          <a href="#como-jugar" className="footer__link">Reglas</a>
          <a href="#explorar" className="footer__link">Sopas</a>
          <a href="#registro" className="footer__link">Acceso</a>
          <span style={{ color: 'var(--wh-text-muted)' }}>|</span>
          <span style={{ color: 'var(--wh-text-secondary)' }}>v1.0.0 Bioluminiscencia</span>
        </nav>
      </div>
    </footer>
  );
}
