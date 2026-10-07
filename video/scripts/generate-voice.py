"""Genera la voz del narrador con Piper (voz neuronal en español, sin internet).

Requisitos (una sola vez):

    pip install sherpa-onnx numpy
    curl -L -o voz.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-es_MX-claude-high.tar.bz2
    tar xjf voz.tar.bz2

Uso:

    python3 scripts/generate-voice.py ruta/a/vits-piper-es_MX-claude-high

Escribe un .mp3 por frase en public/voice/. Para cambiar lo que dice el robot,
edita LINES y vuelve a correr el script.
"""

import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
import sherpa_onnx

OUT = Path(__file__).resolve().parent.parent / "public" / "voice"

# Nombre del archivo -> lo que dice el narrador.
LINES = {
    "intro": "¡Hola! Bienvenido a CodeQuest. Aprende a programar, jugando.",
    "blocks": "Arma tu programa con bloques de colores.",
    "run": "¡Ahora, mira cómo funciona!",
    "goal": "¡Llegué a la estrella!",
    "roles": "Un espacio para estudiantes, familias, y profesionales.",
    "celebrate": "¡Reto completado! ¡Lo lograste!",
    "outro": "CodeQuest. Pensamiento lógico inclusivo.",
}

# Un poco más lento que lo normal: más claro y tranquilo.
LENGTH_SCALE = 1.1


def main(model_dir: Path) -> None:
    name = next(model_dir.glob("*.onnx")).name
    config = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=str(model_dir / name),
                tokens=str(model_dir / "tokens.txt"),
                data_dir=str(model_dir / "espeak-ng-data"),
                length_scale=LENGTH_SCALE,
            ),
        ),
    )
    tts = sherpa_onnx.OfflineTts(config)
    OUT.mkdir(parents=True, exist_ok=True)

    for key, text in LINES.items():
        audio = tts.generate(text, sid=0, speed=1.0)
        samples = np.array(audio.samples)
        samples = samples / max(1e-9, np.abs(samples).max()) * 0.9
        wav = OUT / f"{key}.wav"
        with wave.open(str(wav), "wb") as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(audio.sample_rate)
            f.writeframes((samples * 32767).astype(np.int16).tobytes())
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-b:a", "128k", str(wav.with_suffix(".mp3"))],
            check=True,
        )
        wav.unlink()
        print(f"{key}: {len(samples) / audio.sample_rate:.2f} s")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(Path(sys.argv[1]))
