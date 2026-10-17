"""Sonidos de las 14 reacciones, sincronizados con su animación en la app
(reaction_choreo.dart): cada archivo dura lo mismo que la escena, 3,6 s.

Uso: python3 audio/reactions.py ../../assets/battle/sounds/reactions
"""
import sys
from pathlib import Path

import numpy as np

from synth import (A, E, U, RATE, env, explosion, finish, lowpass, mix, noise, resonator, room, secs, tone,
                   voice, whoosh)
from sounds import to_mp3, write_wav

T = 3.6


def sizzle(d):
    t = secs(d)
    pops = (np.random.default_rng(3).random(len(t)) > 0.996) * 1.0
    return resonator(noise(d), 5200, 2500) * 3 * (0.6 + 0.4 * np.sin(t * 40)) + lowpass(pops, 6000) * 4


def bell(f, d=1.2):
    return tone(f, d, (1, 0.5, 0.25, 0.12), decay=4) * env(d, 0.002, 0.2)


def brass_note(f, d):
    return tone(f * (1 - 0.03 * np.exp(-secs(d) * 50)), d, (1, 0.7, 0.5, 0.35, 0.2, 0.1)) * env(d, 0.02, 0.08)


def siren_wail(d):
    t = secs(d)
    return tone(700 + 350 * np.sin(2 * np.pi * t / 1.5 - np.pi / 2), d, (1, 0.4, 0.2)) * env(d, 0.15, 0.4)


def ricochet():
    t = secs(0.45)
    return tone(3200 - 2200 * t / 0.45, 0.45, (1, 0.3)) * np.exp(-t * 9) + resonator(noise(0.45), 2500, 400) * np.exp(-t * 30) * 6


def claps(d):
    out = np.zeros(int(RATE * d))
    rng = np.random.default_rng(11)
    for _ in range(int(d * 28)):
        i = rng.integers(0, len(out) - 3000)
        out[i:i + 3000] += resonator(noise(0.07), rng.uniform(900, 1600), 600)[:3000] * np.exp(-np.arange(3000) / 300) * 1.2
    return out * np.minimum(secs(d) / 0.3, 1) * np.clip((d - secs(d)) / 0.8, 0, 1)


def syllables(pitches, formants, gap, d=0.13, start=0.0):
    return [(start + i * gap, voice(p, d, formants), 1) for i, p in enumerate(pitches)]


def slide(f0, f1, d):
    t = secs(d)
    return tone(f0 * (f1 / f0) ** (t / d) * (1 + 0.01 * np.sin(t * 40)), d, (1, 0.15)) * env(d, 0.02, 0.06)


SOUNDS = {
    "boom": lambda: mix(T, (0, whoosh(1.0, 250, 900), 0.6), (0.1, sizzle(1.5), 0.12), (1.0, explosion(0.25, 0.3), 0.3),
                        (1.6, explosion(2.0, 1.4), 1.0)),
    "incoming": lambda: mix(T, (0, whoosh(1.4, 150, 3000, 3), 0.9), (0, lowpass(noise(1.4), 900) * env(1.4, 0.3, 0.1), 1.2),
                            (1.3, explosion(1.8, 1.0), 0.9)),
    "bullseye": lambda: mix(T, (0, whoosh(0.5, 400, 2000), 0.5), *[(0.6 + i * 0.22, tone(900 + i * 300, 0.08) * env(0.08), 0.35) for i in range(3)],
                            (1.4, lowpass(noise(0.08), 900) * np.exp(-secs(0.08) * 50), 1.4), (1.4, bell(1568), 0.6), (1.42, bell(2093), 0.4)),
    "blocked": lambda: mix(T, (0, lowpass(noise(0.3), 400) * np.exp(-secs(0.3) * 14), 1.5), (0.02, bell(310, 0.6), 0.4),
                           *[(s, ricochet(), 0.7) for s in (1.0, 1.6, 2.2)], *[(s, bell(1800, 0.3), 0.35) for s in (1.0, 1.6, 2.2)]),
    "alert": lambda: mix(T, (0.15, siren_wail(3.2), 0.8)),
    "winning": lambda: mix(T, (0, whoosh(0.8, 200, 4000, 4), 0.4),
                           *[(0.8 + i * 0.16, brass_note(f, 0.15 if i < 3 else 0.9), 0.6) for i, f in enumerate([523, 659, 784, 1047])],
                           (1.0, claps(2.4), 0.6)),
    "well_played": lambda: mix(T, *[(0.6 + i * 0.12, bell(f), 0.5) for i, f in enumerate([784, 988, 1175, 1568])], (1.1, claps(2.3), 0.9)),
    "surrender": lambda: mix(T, (0, whoosh(3.2, 200, 600, 2), 0.5), (0.5, slide(1400, 300, 1.6), 0.8)),
    "sly": lambda: mix(T, *syllables([330, 340, 320, 300], E, 0.19, start=0.2), *syllables([340, 320, 290], E, 0.19, start=1.3), (1.6, slide(600, 900, 0.25), 0.15)),
    "angry": lambda: mix(T, (0.1, voice(85 + 8 * np.sin(secs(1.4) * 60), 1.4, U, 0.6) * (1 + 0.5 * np.sin(secs(1.4) * 70)), 1),
                         (1.5, resonator(noise(1.5), 3800, 900) * env(1.5, 0.1, 0.5) * 4, 0.45), (1.5, slide(1800, 2100, 1.4), 0.12)),
    "sad": lambda: mix(T, *[(0.1 + i * 0.5, brass_note(f, 0.42 if i < 3 else 1.6) * (1 + 0.3 * np.sin(secs(0.42 if i < 3 else 1.6) * 38)), 0.6)
                            for i, f in enumerate([196, 185, 175, 165])]),
    "laugh": lambda: mix(T, *syllables([260, 250, 240, 230, 220, 205, 190], A, 0.21, 0.16, 0.15), *[(1.7 + i * 0.22, voice(230 - i * 12, 0.15, A), 0.8) for i in range(5)]),
    "shocked": lambda: mix(T, (0, slide(400, 1800, 0.35), 0.5), (0.05, voice(np.linspace(300, 420, int(RATE * 0.5)), 0.5, U, 0.5), 0.9),
                           (0.6, tone(220 * (1 + 0.25 * np.sin(secs(0.9) * 70) * np.exp(-secs(0.9) * 4)), 0.9, (1, 0.3), decay=4), 0.5)),
    "cool": lambda: mix(T, *[(0.1 + i * 0.07, bell(f, 0.6), 0.25) for i, f in enumerate([2093, 2637, 3136, 4186])],
                        *[(s, resonator(noise(0.05), 2200, 900) * np.exp(-secs(0.05) * 80) * 1.5, 0.8) for s in (0.9, 1.5, 2.1)],
                        (0.9, tone(55, 1.6, (1, 0.5), decay=2.5) * env(1.6, 0.003, 0.3), 0.6)),
}


def main(out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    for name, build in SOUNDS.items():
        tmp = out / f"_{name}.wav"
        write_wav(tmp, finish(room(build(), 0.8)))
        to_mp3(tmp, out / f"{name}.mp3")
        tmp.unlink()
        print(name)


if __name__ == "__main__":
    main(sys.argv[1])
