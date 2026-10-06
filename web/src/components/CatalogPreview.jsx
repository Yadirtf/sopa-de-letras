import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/sound.service';

const CATALOG_ITEMS = [
  { id: 1, title: 'Bioluminiscencia Marina', category: 'Naturaleza', size: '12x12', words: 8, diff: 'Fácil', plays: '3.4k' },
  { id: 2, title: 'Lenguajes de Programación', category: 'Tecnología', size: '14x14', words: 12, diff: 'Medio', plays: '7.8k' },
  { id: 3, title: 'Planetas & Galaxias', category: 'Ciencia', size: '15x15', words: 14, diff: 'Medio', plays: '5.1k' },
  { id: 4, title: 'Películas de Ciencia Ficción', category: 'Cine', size: '16x16', words: 15, diff: 'Difícil', plays: '4.2k' },
  { id: 5, title: 'Ecosistema de Redis & WebSockets', category: 'Tecnología', size: '14x14', words: 10, diff: 'Difícil', plays: '2.9k' },
  { id: 6, title: 'Animales de la Selva Amazónica', category: 'Naturaleza', size: '12x12', words: 9, diff: 'Fácil', plays: '6.0k' },
];

const CATEGORIES = ['Todos', 'Tecnología', 'Ciencia', 'Naturaleza', 'Cine'];

export function CatalogPreview() {
  const { isAuthenticated, openAuth, showToast } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filtered = activeCategory === 'Todos'
    ? CATALOG_ITEMS
    : CATALOG_ITEMS.filter((item) => item.category === activeCategory);

  const handlePlayCard = (item) => {
    sound.playClick();
    if (!isAuthenticated) {
      openAuth('register');
    } else {
      showToast(`¡Cargando la sopa "${item.title}"! Preparando la sala...`, 'success');
    }
  };

  return (
    <section className="section catalog-section" id="explorar" aria-labelledby="catalog-title">
      <div className="section-header">
        <span className="section-tag">Explora sin Compromiso</span>
        <h2 className="section-title" id="catalog-title">Catálogo de Sopas</h2>
        <p className="section-subtitle">
          Miles de sopas creadas por la comunidad y generadas en tiempo real.
        </p>

        {/* Filtros de Categoría */}
        <div className="category-filters" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`category-chip ${activeCategory === cat ? 'category-chip--active' : ''}`}
              onClick={() => { sound.playClick(); setActiveCategory(cat); }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-grid">
        {filtered.map((item) => (
          <div className="catalog-card" key={item.id}>
            <div className="catalog-card__header">
              <span className={`diff-badge diff-badge--${item.diff.toLowerCase()}`}>{item.diff}</span>
              <span className="catalog-card__plays">👁️ {item.plays} partidas</span>
            </div>
            <h3 className="catalog-card__title">{item.title}</h3>
            <div className="catalog-card__meta">
              <span>📐 {item.size}</span>
              <span>🔤 {item.words} palabras</span>
              <span>🏷️ {item.category}</span>
            </div>
            <button
              type="button"
              className="btn btn--outline btn--block btn--sm"
              onClick={() => handlePlayCard(item)}
            >
              <span>{isAuthenticated ? 'Jugar Sopa' : 'Desbloquear y Jugar'}</span>
              <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
