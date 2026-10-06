import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PinPad } from './PinPad';
import { sound } from '../../services/sound.service';

export function ForgotPinForm({ onSwitchToLogin }) {
  const { forgotPin, resetPin } = useAuth();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Nuevo PIN
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      sound.playError();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPin(email);
      setInfoMessage(res.message || 'Código temporal enviado a tu correo.');
      setStep(2);
    } catch (err) {
      sound.playError();
      setError(err.message || 'No se pudo procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateOtp = (e) => {
    e?.preventDefault();
    if (otpCode.length !== 6) {
      setError('El código OTP debe ser de 6 dígitos');
      sound.playError();
      return;
    }
    setError(null);
    sound.playClick();
    setStep(3);
  };

  const handleSubmitReset = async (finalPin = newPin) => {
    if (finalPin.length !== 4) return;
    setLoading(true);
    setError(null);
    try {
      await resetPin({
        email,
        otpCode,
        newPin: finalPin,
      });
    } catch (err) {
      sound.playError();
      setError(err.message || 'Error al restablecer PIN');
      setNewPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-body">
      <div className="auth-step-progress">
        <div className={`step-pill ${step >= 1 ? 'step-pill--active' : ''}`} />
        <div className={`step-pill ${step >= 2 ? 'step-pill--active' : ''}`} />
        <div className={`step-pill ${step >= 3 ? 'step-pill--active' : ''}`} />
      </div>

      {infoMessage && (
        <div className="form-alert form-alert--success">
          <span>📬</span>
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="form-alert form-alert--error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleRequestOtp}>
          <p className="auth-header__subtitle" style={{ textAlign: 'center', marginBottom: 16 }}>
            Te enviaremos un código temporal de 6 dígitos a tu bandeja.
          </p>
          <div className="form-group">
            <label className="form-label" htmlFor="forgot-email">Correo Electrónico Registrado</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="forgot-email"
                type="email"
                required
                placeholder="tu-correo@wordhive.com"
                className="form-input"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                autoFocus
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn--primary btn--block btn--lg">
            {loading ? 'Enviando...' : 'Enviar Código de Recuperación'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleValidateOtp}>
          <p className="auth-header__subtitle" style={{ textAlign: 'center', marginBottom: 16 }}>
            Ingresa el código de 6 dígitos enviado a <strong>{email}</strong>
          </p>
          <div className="form-group">
            <label className="form-label" htmlFor="otp-code">Código OTP (6 dígitos)</label>
            <div className="input-wrapper">
              <span className="input-icon">🔢</span>
              <input
                id="otp-code"
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                className="form-input"
                style={{ letterSpacing: '6px', fontSize: '20px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                value={otpCode}
                onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setError(null); }}
                autoFocus
              />
            </div>
          </div>
          <button type="submit" className="btn btn--primary btn--block btn--lg">
            <span>Validar Código</span>
            <span>→</span>
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="pin-step-wrapper">
          <p className="auth-header__subtitle" style={{ textAlign: 'center', marginBottom: 12 }}>
            Configura tu nuevo PIN de 4 dígitos
          </p>
          <PinPad
            pin={newPin}
            onChange={setNewPin}
            onComplete={(val) => handleSubmitReset(val)}
            hasError={!!error}
            disabled={loading}
          />
        </div>
      )}

      <div className="auth-footer-links">
        <div>
          <button type="button" className="btn-link" onClick={onSwitchToLogin}>
            ← Volver a Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
