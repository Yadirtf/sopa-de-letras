import React from 'react';

const FEATURES = [
  {
    icon: '🏆',
    title: 'Multijugador en Vivo',
    desc: 'Compite contra múltiples jugadores en una misma sopa. El podio se actualiza en tiempo real cada vez que alguien traza una palabra.',
  },
  {
    icon: '👥',
    title: 'Salas & Códigos QR',
    desc: 'Crea una sala personalizada, comparte el enlace o proyecta un QR para que tus amigos se unan al lobby en un par de segundos.',
  },
  {
    icon: '🧠',
    title: 'Algoritmo Backtracking',
    desc: 'Nuestro motor inteligente genera matrices sin solapamientos inválidos y garantiza una experiencia de juego justa y desafiante.',
  },
  {
    icon: '⚡',
    title: 'Acceso Instantáneo con PIN',
    desc: 'Olvídate de contraseñas de 16 caracteres. Tu PIN de 4 dígitos te da acceso instantáneo y seguro a todas tus salas y progresos.',
  },
];

export function FeaturesSection() {
  return (
    <section className="section" id="como-jugar" aria-labelledby="features-title">
      <div className="section-header">
        <span className="section-tag">Experiencia de Nueva Generación</span>
        <h2 className="section-title" id="features-title">¿Por qué WordHive?</h2>
        <p className="section-subtitle">
          Diseñado para convertir la tradicional sopa de letras en un esport social adictivo y de alta velocidad.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f) => (
          <article className="feature-card" key={f.title}>
            <div className="feature-card__icon" aria-hidden="true">{f.icon}</div>
            <h3 className="feature-card__title">{f.title}</h3>
            <p className="feature-card__desc">{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
