import React, { useEffect, useCallback } from 'react';
import { sound } from '../../services/sound.service';

export function PinPad({ pin, onChange, onComplete, hasError = false, disabled = false }) {
  const handleDigit = useCallback(
    (digit) => {
      if (disabled || pin.length >= 4) return;
      sound.playPinTick(pin.length);
      const nextPin = pin + digit;
      onChange(nextPin);
      if (nextPin.length === 4 && onComplete) {
        onComplete(nextPin);
      }
    },
    [pin, disabled, onChange, onComplete]
  );

  const handleBackspace = useCallback(() => {
    if (disabled || pin.length === 0) return;
    sound.playClick();
    onChange(pin.slice(0, -1));
  }, [pin, disabled, onChange]);

  // Soporte directo para teclado físico
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleBackspace, disabled]);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="pinpad-container">
      {/* 4 Puntos bioluminiscentes color ámbar */}
      <div className={`pin-dots ${hasError ? 'pin-dots--error' : ''}`}>
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`pin-dot ${idx < pin.length ? 'pin-dot--filled' : ''}`}
            aria-label={`Dígito ${idx + 1}`}
          />
        ))}
      </div>

      <div className="pinpad-hint">
        {pin.length === 0 ? 'Haz clic en los números o usa tu teclado' : `${pin.length} de 4 dígitos`}
      </div>

      {/* Cuadrícula de botones numéricos */}
      <div className="pinpad-grid" role="group" aria-label="Teclado numérico PIN">
        {keys.map((num) => (
          <button
            key={num}
            type="button"
            className="pinpad-btn"
            disabled={disabled}
            onClick={() => handleDigit(num)}
          >
            {num}
          </button>
        ))}

        {/* Fila final: espacio vacío, cero, borrar */}
        <div className="pinpad-spacer" />
        <button
          type="button"
          className="pinpad-btn"
          disabled={disabled}
          onClick={() => handleDigit('0')}
        >
          0
        </button>
        <button
          type="button"
          className="pinpad-btn pinpad-btn--action"
          disabled={disabled || pin.length === 0}
          onClick={handleBackspace}
          aria-label="Borrar dígito"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
