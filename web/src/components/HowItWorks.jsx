import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Elige tu Reto',
    body: 'Navega el catálogo por tema, dificultad o idioma. Si prefieres un reto único, genera una sopa personalizada en segundos con palabras a tu gusto.',
  },
  {
    num: '02',
    title: 'Invita a tu Escuadrón',
    body: 'Genera una sala con un solo clic. Comparte el código único de sala o proyecta un código QR directo para que cualquiera se sume desde su móvil o PC.',
  },
  {
    num: '03',
    title: 'Traza Rápido y Gana',
    body: 'Conforme encuentras palabras, la matriz se ilumina en vivo para todos. Mira cómo subes en la tabla de clasificación antes de que se agote el cronómetro.',
  },
];

export function HowItWorks() {
  return (
    <section className="section" id="multijugador" aria-labelledby="steps-title">
      <div className="section-header">
        <span className="section-tag">Dinámica Simple & Competitiva</span>
        <h2 className="section-title" id="steps-title">Cómo Funciona</h2>
        <p className="section-subtitle">
          De cero al podio en tres sencillos pasos.
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
