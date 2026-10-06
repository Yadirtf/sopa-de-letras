import React from 'react';
import { sound } from '../../services/sound.service';

export const AVATARS = [
  { id: 'bee_scout', name: 'Explorador', icon: '🐝' },
  { id: 'bee_queen', name: 'Reina', icon: '👑' },
  { id: 'honey_pot', name: 'Panal', icon: '🍯' },
  { id: 'lightning', name: 'Veloz', icon: '⚡' },
  { id: 'star', name: 'Estrella', icon: '⭐' },
  { id: 'flower', name: 'Polen', icon: '🌸' },
];

export function AvatarSelector({ selectedAvatar, onSelect }) {
  const handleSelect = (id) => {
    sound.playClick();
    onSelect(id);
  };

  return (
    <div className="avatar-selector-wrap">
      <label className="form-label">Elige tu Avatar</label>
      <div className="avatar-selector" role="radiogroup" aria-label="Selecciona tu avatar">
        {AVATARS.map((av) => {
          const isSelected = selectedAvatar === av.id;
          return (
            <button
              type="button"
              key={av.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(av.id)}
              className={`avatar-option ${isSelected ? 'avatar-option--selected' : ''}`}
            >
              <span className="avatar-option__icon">{av.icon}</span>
              <span className="avatar-option__name">{av.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
