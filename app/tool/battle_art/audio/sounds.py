"""Sonidos de La Batalla Más Temida.

- turn.mp3: toque de corneta propio (sintetizado aquí) que avisa "te toca".
- tick.mp3, reaction_in.mp3, reaction_out.mp3: de "Interface Sounds" de Kenney (CC0).

Uso: python3 sounds.py <carpeta kenney_interface_sounds> <salida>
"""
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

RATE = 44100


def brass(freq, dur, vibrato=0.0):
    """Nota de corneta: armónicos que se abren al atacar y un poco de vibrato al sostener."""
    t = np.arange(int(RATE * dur)) / RATE
    bend = freq * (1 - 0.03 * np.exp(-t * 60))  # la nota "entra" un pelín baja, como al soplar
    phase = 2 * np.pi * np.cumsum(bend * (1 + vibrato * 0.006 * np.sin(2 * np.pi * 5.5 * t))) / RATE
    bright = 1 - np.exp(-t * 35)
    tone = sum((0.62 ** k) * (bright ** (k * 0.5)) * np.sin((k + 1) * phase) for k in range(8))
    env = np.minimum(t / 0.015, 1) * np.exp(-np.maximum(t - dur * 0.7, 0) * 18)
    env *= np.clip((dur - t) / 0.02, 0, 1)  # termina en cero: sin chasquidos entre notas
    return tone * env


def bugle():
    notes = [(392.0, 0.12, 0), (523.25, 0.12, 0), (659.25, 0.12, 0), (783.99, 0.55, 1)]
    out = np.concatenate([np.concatenate([brass(f, d, v), np.zeros(int(RATE * 0.012))]) for f, d, v in notes])
    out = np.concatenate([out, np.zeros(int(RATE * 0.45))])
    wet = out.copy()
    for delay, gain in [(0.043, 0.32), (0.071, 0.24), (0.113, 0.17), (0.161, 0.11)]:  # sala pequeña
        n = int(RATE * delay)
        wet[n:] += out[:-n] * gain
    return wet / np.abs(wet).max() * 0.8


def write_wav(path, samples):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes((samples * 32767).astype(np.int16).tobytes())


def to_mp3(src, dst, volume=1.0):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ac", "1", "-ar", "44100",
         "-filter:a", f"volume={volume}", "-codec:a", "libmp3lame", "-q:a", "5", str(dst)],
        check=True,
    )


def main(kenney, out):
    kenney, out = Path(kenney), Path(out)
    out.mkdir(parents=True, exist_ok=True)
    tmp = out / "_turn.wav"
    write_wav(tmp, bugle())
    to_mp3(tmp, out / "turn.mp3")
    tmp.unlink()
    to_mp3(kenney / "tick_002.wav", out / "tick.mp3", 0.8)
    to_mp3(kenney / "maximize_006.wav", out / "reaction_in.mp3")
    to_mp3(kenney / "select_003.wav", out / "reaction_out.mp3", 0.7)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
