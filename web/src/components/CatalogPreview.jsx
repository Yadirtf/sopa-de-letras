import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../services/sound.service';
import { api } from '../services/api.service';
import { FALLBACK_ITEMS, CATEGORIES } from './catalog.constants';

export function CatalogPreview() {
  const { isAuthenticated, openAuth, showToast } = useAuth();
  const [activeCategory, setActiveCategory] = useState('TODAS');
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const params = activeCategory === 'TODAS' ? {} : { category: activeCategory };
        const data = await api.get('/word-searches', params);
        if (isMounted && data.items && data.items.length > 0) {
          setItems(data.items);
        }
      } catch {
        if (isMounted) {
          setItems(
            activeCategory === 'TODAS'
              ? FALLBACK_ITEMS
              : FALLBACK_ITEMS.filter((i) => i.category === activeCategory)
          );
        }
      }
    };
    fetchCatalog();
    return () => { isMounted = false; };
  }, [activeCategory]);

  const handlePlayCard = (item) => {
    sound.playClick();
    if (!isAuthenticated) {
      openAuth('register');
    } else {
      setSelectedItem(item);
    }
  };

  return (
    <section className="section catalog-section" id="explorar" aria-labelledby="catalog-title">
      <div className="section-header">
        <span className="section-tag">Explora sin Límites</span>
        <h2 className="section-title" id="catalog-title">Catálogo de Sopas</h2>
        <p className="section-subtitle">
          Miles de sopas con scroll infinito, filtrado instantáneo y protección anti-spoilers.
        </p>

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
              {cat === 'TODAS' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-grid">
        {items.map((item) => (
          <div className="catalog-card" key={item.id} onClick={() => handlePlayCard(item)}>
            <div className="catalog-card__header">
              <span className={`diff-badge diff-badge--${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
              <span className="catalog-card__plays">👁️ {item.playCount} jugadas</span>
            </div>
            <h3 className="catalog-card__title">{item.title}</h3>
            <div className="catalog-card__meta">
              <span>📐 {item.gridSize}x{item.gridSize}</span>
              <span>🔤 {item.wordCount} palabras</span>
              <span>🏷️ {item.category}</span>
            </div>
            <button
              type="button"
              className="btn btn--outline btn--block btn--sm"
              onClick={(e) => { e.stopPropagation(); handlePlayCard(item); }}
            >
              <span>{isAuthenticated ? 'Ver Ficha & Jugar' : 'Desbloquear y Jugar'}</span>
              <span>→</span>
            </button>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedItem.title}</h3>
              <button type="button" className="modal-close" onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--c-cyan)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Categoría: {selectedItem.category} • Dificultad: {selectedItem.difficulty}
            </p>
            <div style={{
              position: 'relative',
              height: '130px',
              borderRadius: '12px',
              background: 'rgba(15, 22, 35, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '1px solid var(--c-glow-violet)',
              marginBottom: '1rem'
            }}>
              <div style={{ filter: 'blur(5px)', opacity: 0.4, letterSpacing: '8px', fontSize: '18px', userSelect: 'none' }}>
                WORDHIVEMATRIXSPOILERFREEZONE
              </div>
              <div style={{
                position: 'absolute',
                background: 'rgba(21, 29, 46, 0.9)',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid var(--c-cyan)',
                color: 'var(--c-cyan)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                🔒 Anti-Spoilers: Soluciones Ocultas
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--block"
              style={{ marginBottom: '8px' }}
              onClick={() => {
                showToast(`¡Iniciando partida en solitario: ${selectedItem.title}!`, 'success');
                setSelectedItem(null);
              }}
            >
              ▶️ Jugar en Solitario
            </button>
            <button
              type="button"
              className="btn btn--outline btn--block"
              onClick={() => {
                showToast(`¡Creando sala multijugador para: ${selectedItem.title}!`, 'info');
                setSelectedItem(null);
              }}
            >
              👥 Crear Sala Multijugador
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
