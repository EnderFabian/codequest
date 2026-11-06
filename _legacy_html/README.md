# CodeQuest

Plataforma inclusiva de programación visual para niños y niñas con TEA.

## Cómo ver la página

Doble clic en **`INICIAR-CODEQUEST.bat`** o en terminal: `npm start`  
Luego abre: **http://localhost:3000**

---

## Estructura del proyecto

```
CODEQUEST/
├── .vscode/              ← Configuración de Visual Studio Code
├── assets/               ← Recursos (estilos, scripts, imágenes)
│   ├── css/              ← Todos los estilos
│   ├── js/               ← Toda la lógica JavaScript
│   └── img/              ← Imágenes (cuando las agregues)
├── pages/                ← Páginas HTML de la app
│   ├── niveles.html
│   ├── perfil.html
│   ├── logros.html
│   └── panel-cuidadores.html
├── index.html            ← Página de inicio
├── INICIAR-CODEQUEST.bat
├── package.json
└── README.md
```

## Archivos en `assets/css`

| Archivo | Para qué sirve |
|---------|----------------|
| `variables.css` | Colores y variables globales |
| `main.css` | Estilos de toda la web |
| `niveles.css` | Pantalla del editor de bloques |
| `panel.css` | Panel de cuidadores |

## Archivos en `assets/js`

| Archivo | Para qué sirve |
|---------|----------------|
| `storage.js` | Guardar progreso |
| `audio.js` | Sonidos y voz |
| `accessibility.js` | Modo oscuro, ajustes TEA |
| `blocks.js` | Definición de bloques |
| `editor.js` | Editor arrastrar y soltar |
| `game-engine.js` | Mapa y personaje |
| `levels-data.js` | Datos de los niveles |
| `niveles-app.js` | Lógica de la página niveles |
| `firebase-config.js` | Firebase (opcional) |
