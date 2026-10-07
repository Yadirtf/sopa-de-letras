import React from 'react';
import { PLAY_URL } from '../config/links';

const PLATFORMS = [
  {
    icon: '💻',
    title: 'En el navegador',
    desc: 'Chrome, Edge, Firefox o Safari, en el ordenador o en el móvil. Sin instalar nada: abre la web y juega.',
  },
  {
    icon: '📲',
    title: 'Como una app',
    desc: 'Desde el navegador puedes instalar WordHive en tu pantalla de inicio o escritorio con un toque.',
  },
  {
    icon: '🤖',
    title: 'App de Android',
    desc: 'La misma cuenta, las mismas salas: juega en el móvil contra quien está en el ordenador.',
  },
];

export function PlatformsSection() {
  return (
    <section className="section" id="donde-jugar" aria-labelledby="platforms-title">
      <div className="section-header">
        <span className="section-tag">Una sola cuenta</span>
        <h2 className="section-title" id="platforms-title">Juega donde quieras</h2>
        <p className="section-subtitle">Tu progreso, tus amigos y tus sopas te siguen a cualquier pantalla.</p>
      </div>

      <div className="features-grid">
        {PLATFORMS.map((p) => (
          <article className="feature-card" key={p.title}>
            <div className="feature-card__icon" aria-hidden="true">{p.icon}</div>
            <h3 className="feature-card__title">{p.title}</h3>
            <p className="feature-card__desc">{p.desc}</p>
          </article>
        ))}
      </div>

      <div className="catalog-more">
        <a href={PLAY_URL} className="btn btn--primary btn--lg">Abrir WordHive en el navegador</a>
      </div>
    </section>
  );
}
