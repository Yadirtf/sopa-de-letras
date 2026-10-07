import React from 'react';

const STEPS = [
  {
    num: '1',
    title: 'Elige una sopa',
    body: 'Busca por tema y dificultad entre las sopas de la comunidad, o crea la tuya con tus propias palabras.',
  },
  {
    num: '2',
    title: 'Invita a quien quieras',
    body: 'Crea una sala y comparte el código, el enlace o el QR. Tus amigos entran desde el navegador o el móvil.',
  },
  {
    num: '3',
    title: 'Encuentra las palabras',
    body: 'Arrastra el dedo o el ratón sobre las letras. Cuando todos estén listos empieza la cuenta 3, 2, 1… ¡a jugar!',
  },
];

export function HowItWorks() {
  return (
    <section className="section" id="como-jugar" aria-labelledby="steps-title">
      <div className="section-header">
        <span className="section-tag">Sencillo desde la primera partida</span>
        <h2 className="section-title" id="steps-title">Cómo se juega</h2>
        <p className="section-subtitle">
          De abrir la web a tu primera victoria en tres pasos.
        </p>
      </div>

      <div className="steps-grid">
        {STEPS.map((step) => (
          <div className="step-card" key={step.num}>
            <span className="step-card__number" aria-hidden="true">{step.num}</span>
            <h3 className="step-card__title">{step.title}</h3>
            <p className="step-card__body">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
