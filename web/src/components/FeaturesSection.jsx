import React from 'react';

const FEATURES = [
  {
    icon: '🏁',
    title: 'Carreras en tiempo real',
    desc: 'Hasta varios jugadores en la misma sala. Cada uno tiene su propia sopa y ve cómo avanzan los demás: gana quien la complete primero.',
  },
  {
    icon: '🧩',
    title: 'Solo o en compañía',
    desc: 'Juega en solitario a tu ritmo o crea una sala e invita a tu familia y amigos con un código, un enlace o un QR.',
  },
  {
    icon: '✏️',
    title: 'Crea tus propias sopas',
    desc: 'Elige un tema, escribe o pega tus palabras y WordHive arma el tablero. Ideal para clases, cumpleaños o repasar vocabulario.',
  },
  {
    icon: '👋',
    title: 'Amigos e invitaciones',
    desc: 'Agrega amigos, mira quién está conectado y recibe un aviso cuando alguien te invite a una partida.',
  },
  {
    icon: '🔢',
    title: 'Entra con un PIN',
    desc: 'Nada de contraseñas largas: tu correo y 4 números. ¿Prisa? Entra como invitado y guarda tu cuenta después.',
  },
  {
    icon: '🐝',
    title: 'Para todas las edades',
    desc: 'Letras grandes, colores claros y una guía que te muestra la palabra mientras la trazas. Fácil para peques y abuelos.',
  },
];

export function FeaturesSection() {
  return (
    <section className="section" id="funciones" aria-labelledby="features-title">
      <div className="section-header">
        <span className="section-tag">Todo lo de la app, también en la web</span>
        <h2 className="section-title" id="features-title">¿Por qué WordHive?</h2>
        <p className="section-subtitle">
          La sopa de letras de siempre, pensada para compartirla.
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
