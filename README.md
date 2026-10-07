# CodeQuest

Plataforma inclusiva de programación por bloques para fortalecer el pensamiento lógico en niñas, niños y adolescentes con TEA. Los estudiantes arman programas con bloques (Blockly) y un robot los ejecuta en un tablero 3D.

## Cómo correrlo

```console
npm install
npm run dev            # app en http://localhost:5173
npm run build          # versión para publicar (carpeta dist/)
npm run lint           # revisión de código
npm run check:levels   # comprueba que todos los retos se puedan resolver
```

Cuentas demo (contraseña `codequest`): `luna@codequest.demo` (estudiante), `ana@codequest.demo` (familia), `camilo@codequest.demo` (profesional).

## Mundos y retos

Siete mundos, cada uno un poco más difícil. Están en `src/data/levels/`:

| Mundo | Nombre | Qué se aprende |
| --- | --- | --- |
| 1 | Primeros Pasos | Secuencias: avanzar y saltar |
| 2 | El Poder de Repetir | Bucles |
| 3 | Toma de Decisiones | Condicionales con sensores |
| 4 | Desafío Final | Lógica combinada, variables, mapas aleatorios |
| 5 | Cazador de Estrellas | Juntar estrellas con un solo bucle y el bloque O |
| 6 | Pozos y Murallas | Obstáculos dobles: elegir cuánto saltar |
| 7 | Misión Espacial | Mapas que cambian, contar con variables, pocos bloques |

Cada reto trae una `solucionEjemplo`. `npm run check:levels` la ejecuta en el motor real del juego (`src/game/gridEngine.ts`) y avisa si el robot no llega a la meta. Los retos con mapa aleatorio se prueban con 300 mapas distintos. Córrelo siempre que agregues o cambies un reto.

## Partes principales

- `src/components/game/Board3D.tsx`: tablero 3D (three.js + react-three-fiber). El robot camina, salta en arco, cae al agua si hay un hueco, choca con las paredes y celebra en la bandera. Si el equipo no tiene WebGL, se muestra un tablero 2D.
- `src/components/robot/RobotAvatar.tsx`: la mascota animada (flota, se inclina en 3D hacia el puntero, cambia de pose y habla con un globo).
- `src/components/three/SkyScene.tsx`: fondo 3D de bloques, estrellas y planetas flotando.
- `src/assets/robot/`: poses del robot en WebP (generadas desde `frames/`).
- `video/`: video promocional hecho con Remotion (ver `video/README.md`).

## Modo Calma

El botón **Modo Calma** (y la opción del sistema "reducir movimiento") detiene las animaciones: el robot y los objetos 3D se quedan quietos y los movimientos del tablero son más lentos.
