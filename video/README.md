# Video de CodeQuest

Video promocional de CodeQuest (≈ 28 segundos, 1920×1080, con voz, música y efectos de sonido) hecho con [Remotion](https://www.remotion.dev): cada escena es un componente de React.

## Cómo usarlo

```console
cd video
npm install
npm run dev      # abre Remotion Studio en el navegador para ver y editar el video
npm run render   # guarda el video en out/codequest.mp4
```

## Escenas

| Escena | Archivo | Qué muestra |
| --- | --- | --- |
| Intro | `src/scenes/Intro.tsx` | El robot saluda y aparece "CodeQuest" |
| Bloques | `src/scenes/Blocks.tsx` | Se arma un programa (Iniciar, Repetir, Avanzar, Saltar) y el robot lo ejecuta en el tablero |
| Roles | `src/scenes/Roles.tsx` | Estudiante, padre o cuidador y profesional |
| Celebración | `src/scenes/Celebrate.tsx` | ¡Reto completado! con tres estrellas |
| Cierre | `src/scenes/Outro.tsx` | Nombre y mensaje del proyecto |

- Colores, fuente y duración de cada escena: `src/theme.ts` (mismos colores y fuente Nunito que la app).
- Imágenes del robot: `public/robot/` (copiadas de `frames/`).
- Música y efectos de sonido: `public/audio/`. Los crea el script `scripts/generate-audio.py` con ondas simples, así que no tienen derechos de autor. Para cambiarlos, edita el script y corre `python3 scripts/generate-audio.py` (necesita `numpy`, y `ffmpeg` para convertirlos a mp3). El volumen de la música está en `src/CodeQuestPromo.tsx` y cada efecto se coloca con `<Sfx>` dentro de su escena.
- Voz del narrador: `public/voice/`, una frase por archivo, generadas con la voz neuronal Piper (`es_MX-claude-high`). Para cambiar lo que dice, edita `LINES` en `scripts/generate-voice.py` y sigue las instrucciones del inicio del script. Cada frase se coloca con `<Voice>` dentro de su escena; si una frase nueva es más larga, sube la duración de la escena en `src/theme.ts`.
- En Remotion Studio cada escena también aparece por separado en la carpeta "Escenas".

El movimiento es suave a propósito (sin destellos ni cambios bruscos), pensando en niñas, niños y adolescentes con TEA.
