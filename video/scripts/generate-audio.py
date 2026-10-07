"""Genera la música y los efectos de sonido del video (sin derechos de autor).

Todo se sintetiza con ondas simples, así que se puede volver a generar o ajustar
cuando se quiera:

    python3 scripts/generate-audio.py

Escribe archivos .wav en public/audio/ y, si hay ffmpeg, los convierte a .mp3.
Los sonidos son suaves y sin agudos fuertes, pensando en niños con TEA.
"""

import shutil
import subprocess
import wave
from pathlib import Path

import numpy as np

RATE = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "audio"


def note(name: str) -> float:
    """Frecuencia de una nota como 'C4', 'A#3'."""
    names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    pitch, octave = name[:-1], int(name[-1])
    semitones = names.index(pitch) + (octave - 4) * 12 - 9
    return 440.0 * 2 ** (semitones / 12)


def t(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * RATE)) / RATE


def bell(freq: float, length: float, decay: float = 4.0) -> np.ndarray:
    """Tono tipo marimba / campanita: rápido ataque y caída suave."""
    x = t(length)
    env = np.exp(-decay * x) * np.minimum(1, x / 0.005)
    tone = np.sin(2 * np.pi * freq * x) + 0.3 * np.sin(2 * np.pi * 2 * freq * x) * np.exp(-8 * x)
    return tone * env


def pad(freqs: list[float], length: float) -> np.ndarray:
    """Acorde largo y suave para el fondo."""
    x = t(length)
    env = np.minimum(1, x / 0.6) * np.minimum(1, (length - x) / 0.6)
    tone = sum(
        np.sin(2 * np.pi * f * x) + 0.15 * np.sin(2 * np.pi * 2 * f * x) for f in freqs
    )
    return tone * env / len(freqs)


def mix_into(track: np.ndarray, sound: np.ndarray, at: float, gain: float = 1.0) -> None:
    start = int(at * RATE)
    end = min(len(track), start + len(sound))
    if end <= start:
        return
    track[start:end] += sound[: end - start] * gain


def save(name: str, samples: np.ndarray, peak: float = 0.8) -> None:
    samples = samples / max(1e-9, np.abs(samples).max()) * peak
    data = (samples * 32767).astype(np.int16)
    path = OUT / f"{name}.wav"
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(RATE)
        f.writeframes(data.tobytes())
    if shutil.which("ffmpeg"):
        mp3 = path.with_suffix(".mp3")
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-b:a", "128k", str(mp3)],
            check=True,
        )
        path.unlink()


def music(length: float = 26.0) -> np.ndarray:
    """Música de fondo tranquila: C - G - Am - F con arpegios de campanita."""
    bpm = 96
    beat = 60 / bpm
    bar = beat * 4
    chords = [
        ["C3", "E3", "G3"],
        ["G2", "B2", "D3"],
        ["A2", "C3", "E3"],
        ["F2", "A2", "C3"],
    ]
    arps = [
        ["C5", "E5", "G5", "E5", "C5", "E5", "G5", "C6"],
        ["B4", "D5", "G5", "D5", "B4", "D5", "G5", "B5"],
        ["A4", "C5", "E5", "C5", "A4", "C5", "E5", "A5"],
        ["A4", "C5", "F5", "C5", "A4", "C5", "F5", "A5"],
    ]
    track = np.zeros(int(length * RATE))
    bars = int(np.ceil(length / bar))
    for b in range(bars):
        start = b * bar
        chord = chords[b % 4]
        mix_into(track, pad([note(n) for n in chord], bar + 0.3), start, 0.55)
        mix_into(track, bell(note(chord[0]) / 2, bar, decay=1.2), start, 0.35)
        for i, n in enumerate(arps[b % 4]):
            mix_into(track, bell(note(n), 1.2, decay=3.5), start + i * beat / 2, 0.22)
    fade = int(2.0 * RATE)
    track[-fade:] *= np.linspace(1, 0, fade)
    track[: int(0.3 * RATE)] *= np.linspace(0, 1, int(0.3 * RATE))
    return track


def pop() -> np.ndarray:
    """Un bloque aparece: 'blip' corto que sube."""
    x = t(0.12)
    freq = 520 + 380 * (x / x[-1])
    return np.sin(2 * np.pi * np.cumsum(freq) / RATE) * np.exp(-30 * x)


def step() -> np.ndarray:
    """El robot avanza una casilla: toque suave de madera."""
    return bell(note("G4"), 0.25, decay=14) + 0.5 * bell(note("D5"), 0.25, decay=18)


def jump() -> np.ndarray:
    """El robot salta: tono que sube y baja."""
    x = t(0.55)
    freq = 330 + 420 * np.sin(np.pi * x / x[-1])
    env = np.minimum(1, x / 0.02) * np.exp(-2.5 * x)
    return np.sin(2 * np.pi * np.cumsum(freq) / RATE) * env


def chime() -> np.ndarray:
    """Llega a la estrella / se llena una estrella."""
    track = np.zeros(int(1.4 * RATE))
    for i, n in enumerate(["C6", "E6", "G6", "C7"]):
        mix_into(track, bell(note(n), 1.0, decay=4), i * 0.07, 1 - i * 0.15)
    return track


def success() -> np.ndarray:
    """¡Reto completado!: pequeña fanfarria alegre."""
    track = np.zeros(int(2.2 * RATE))
    melody = [("G4", 0.0), ("C5", 0.15), ("E5", 0.3), ("G5", 0.45), ("E5", 0.65), ("G5", 0.8)]
    for n, at in melody:
        mix_into(track, bell(note(n), 1.2, decay=3), at)
    mix_into(track, pad([note("C4"), note("E4"), note("G4")], 1.4), 0.8, 0.8)
    return track


def whoosh() -> np.ndarray:
    """Cambio de escena: soplido muy suave."""
    rng = np.random.default_rng(7)
    x = t(0.6)
    noise = rng.standard_normal(len(x))
    # Suavizar el ruido para quitar agudos.
    noise = np.convolve(noise, np.ones(60) / 60, mode="same")
    return noise * np.sin(np.pi * x / x[-1]) ** 2


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    save("music", music(), peak=0.7)
    save("pop", pop())
    save("step", step())
    save("jump", jump())
    save("chime", chime())
    save("success", success())
    save("whoosh", whoosh(), peak=0.5)
    print("Audio generado en", OUT)
