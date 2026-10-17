"""Piezas para sintetizar los sonidos de las reacciones (solo numpy).

Todo trabaja con arreglos de muestras a 44,1 kHz entre -1 y 1.
"""
import numpy as np

RATE = 44100
rng = np.random.default_rng(7)


def secs(d):
    return np.arange(int(RATE * d)) / RATE


def noise(d):
    return rng.uniform(-1, 1, int(RATE * d))


def lowpass(x, cutoff):
    """Filtro de un polo; `cutoff` puede ser un número o un arreglo (Hz por muestra)."""
    a = 1 - np.exp(-2 * np.pi * np.broadcast_to(cutoff, x.shape) / RATE)
    y, acc = np.empty_like(x), 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def resonator(x, freq, bw):
    """Resonador de dos polos (formante o banda): `freq` puede variar en el tiempo."""
    f = np.broadcast_to(freq, x.shape)
    r = np.broadcast_to(np.exp(-np.pi * np.asarray(bw) / RATE), x.shape)
    c1, c2 = 2 * r * np.cos(2 * np.pi * f / RATE), -r * r
    y, y1, y2 = np.empty_like(x), 0.0, 0.0
    for i in range(len(x)):
        y0 = x[i] + c1[i] * y1 + c2[i] * y2
        y[i], y2, y1 = y0, y1, y0
    return y * (1 - r)


def tone(freq, d, harmonics=(1,), decay=0.0):
    """Suma de armónicos; `freq` puede ser un arreglo (deslizamientos)."""
    t = secs(d)
    f = np.broadcast_to(freq, t.shape)
    phase = 2 * np.pi * np.cumsum(f) / RATE
    out = sum(a * np.sin((k + 1) * phase) for k, a in enumerate(harmonics))
    return out * np.exp(-t * decay)


def env(d, attack=0.005, release=0.05):
    """Envolvente que sube en `attack` y baja a cero en `release` (sin chasquidos)."""
    t = secs(d)
    return np.minimum(t / attack, 1) * np.clip((d - t) / release, 0, 1)


def mix(total, *parts):
    """Coloca cada (inicio_s, muestras, ganancia) en una pista de `total` segundos."""
    out = np.zeros(int(RATE * total))
    for start, x, gain in parts:
        i = int(RATE * start)
        n = min(len(x), len(out) - i)
        out[i:i + n] += x[:n] * gain
    return out


def room(x, size=1.0):
    """Reverberación corta de sala con ecos que se apagan."""
    wet = x.copy()
    for delay, gain in [(0.043, 0.3), (0.071, 0.22), (0.113, 0.16), (0.161, 0.1), (0.23, 0.06)]:
        n = int(RATE * delay * size)
        wet[n:] += x[:-n] * gain
    return wet


def finish(x, peak=0.85):
    x = x - np.mean(x)
    return x / (np.abs(x).max() + 1e-9) * peak


# --- Efectos ---------------------------------------------------------------

def explosion(d=1.8, big=1.0):
    """Estallido: golpe grave, ruido que se oscurece y chisporroteo."""
    t = secs(d)
    body = lowpass(noise(d), 4000 * np.exp(-t * 3.5) + 120) * np.exp(-t * (2.2 / big))
    thump = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 9)) / RATE) * np.exp(-t * 4) * 1.4
    crackle = (rng.random(len(t)) > 0.9985) * rng.uniform(-1, 1, len(t)) * np.exp(-t * 3)
    crackle = lowpass(crackle, 3000) * 6
    return (body * 2.2 + thump + crackle) * np.minimum(t / 0.004, 1)


def whoosh(d, f0=300, f1=2400, q=6.0):
    """Ruido que barre de `f0` a `f1` Hz con forma de campana (algo que pasa volando)."""
    t = secs(d)
    sweep = f0 * (f1 / f0) ** (t / d)
    bell = np.sin(np.pi * t / d) ** 2
    return resonator(noise(d), sweep, sweep / q) * bell


def voice(pitch, d, formants, breath=0.15):
    """Sílaba sintética: pulsos de la glotis pasados por los formantes de una vocal."""
    t = secs(d)
    f = np.broadcast_to(pitch, t.shape)
    phase = np.cumsum(f) / RATE
    pulses = 2 * (phase % 1) - 1
    src = pulses + noise(d) * breath
    out = sum(resonator(src, fq, bw) * g for fq, bw, g in formants)
    return out * env(d, 0.012, d * 0.4)


A = [(800, 90, 1.0), (1200, 110, 0.6), (2600, 160, 0.25)]  # "a"
E = [(500, 80, 1.0), (1800, 110, 0.55), (2600, 150, 0.25)]  # "e"
U = [(350, 70, 1.0), (800, 90, 0.45), (2300, 150, 0.15)]  # "u"
