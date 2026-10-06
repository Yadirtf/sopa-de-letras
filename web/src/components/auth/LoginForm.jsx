import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PinPad } from './PinPad';
import { sound } from '../../services/sound.service';

export function LoginForm({ onSwitchToRegister, onSwitchToForgot, onSwitchToGuest }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isPinStep, setIsPinStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleContinueToPin = (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      sound.playError();
      return;
    }
    setError(null);
    sound.playClick();
    setIsPinStep(true);
  };

  const handleSubmitLogin = async (finalPin = pin) => {
    if (finalPin.length !== 4) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, finalPin);
    } catch (err) {
      sound.playError();
      setError(err.message || 'Error al iniciar sesión');
      setPin(''); // Resetear PIN para reintento
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-body">
      {/* Indicador de pasos */}
      <div className="auth-step-progress">
        <div className={`step-pill ${!isPinStep ? 'step-pill--active' : ''}`} />
        <div className={`step-pill ${isPinStep ? 'step-pill--active' : ''}`} />
      </div>

      {error && (
        <div className="form-alert form-alert--error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!isPinStep ? (
        <form onSubmit={handleContinueToPin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Correo Electrónico</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="login-email"
                type="email"
                required
                placeholder="ejemplo@wordhive.com"
                className="form-input"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                autoFocus
              />
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block btn--lg">
            <span>Continuar al PIN</span>
            <span>→</span>
          </button>
        </form>
      ) : (
        <div className="pin-step-wrapper">
          <p className="auth-header__subtitle" style={{ textAlign: 'center', marginBottom: 12 }}>
            Ingresa tu PIN de 4 dígitos para <strong>{email}</strong>
          </p>

          <PinPad
            pin={pin}
            onChange={setPin}
            onComplete={(val) => handleSubmitLogin(val)}
            hasError={!!error}
            disabled={loading}
          />

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => { setIsPinStep(false); setPin(''); setError(null); sound.playClick(); }}
            >
              ← Cambiar correo
            </button>
          </div>
        </div>
      )}

      {/* Acceso Invitado y enlaces */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          type="button"
          className="btn btn--amber btn--block"
          onClick={onSwitchToGuest}
        >
          ⚡ Jugar como Invitado (Sin Registro)
        </button>
      </div>

      <div className="auth-footer-links">
        <div>
          ¿No tienes cuenta?{' '}
          <button type="button" className="btn-link" onClick={onSwitchToRegister}>
            Regístrate aquí
          </button>
        </div>
        <div>
          <button type="button" className="btn-link" onClick={onSwitchToForgot}>
            ¿Olvidaste tu PIN?
          </button>
        </div>
      </div>
    </div>
  );
}
