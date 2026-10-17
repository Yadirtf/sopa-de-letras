import React from 'react';

/** Recursos gratuitos que usa WordHive, con su autor y su licencia. */
const CREDITS = [
  {
    what: 'Fuego, humo y polvo de las explosiones',
    who: 'Smoke Particles, de Kenney',
    license: 'CC0 (dominio público)',
    url: 'https://kenney.nl/assets/smoke-particles',
  },
  {
    what: 'Modelado y render de figuras, terrenos y armas en 3D',
    who: 'three.js',
    license: 'MIT',
    url: 'https://threejs.org',
  },
  {
    what: 'Avatares en 3D',
    who: 'Fluent Emoji, de Microsoft',
    license: 'MIT',
    url: 'https://github.com/microsoft/fluentui-emoji',
  },
  {
    what: 'Avatares ilustrados',
    who: 'DiceBear y los estilos de Lisa Wischofsky, Pablo Stanley, Ashley Seo, Davis Uche y Zoish',
    license: 'MIT, CC BY 4.0 y CC0',
    url: 'https://www.dicebear.com',
  },
  {
    what: 'Tipografías',
    who: 'Outfit, Inter y JetBrains Mono (Google Fonts)',
    license: 'SIL Open Font License',
    url: 'https://fonts.google.com',
  },
];

export function CreditsSection() {
  return (
    <section className="section credits" id="creditos" aria-labelledby="credits-title">
      <div className="section-header">
        <p className="section-tag">Gracias</p>
        <h2 className="section-title" id="credits-title">Créditos</h2>
        <p>WordHive usa estos recursos gratuitos. Las figuras y los terrenos de la batalla son modelos 3D propios.</p>
      </div>
      <ul className="credits__list">
        {CREDITS.map((c) => (
          <li key={c.what} className="credits__item">
            <span className="credits__what">{c.what}</span>
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="credits__who">{c.who}</a>
            <span className="credits__license">{c.license}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
