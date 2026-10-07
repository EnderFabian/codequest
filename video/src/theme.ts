import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Mismos colores que la app (src/index.css del proyecto principal).
export const colors = {
  primary: "#4d96ff",
  primarySoft: "#e8f1ff",
  secondary: "#6bcb77",
  secondarySoft: "#e8f8ea",
  accent: "#ffd93d",
  accentSoft: "#fff8d6",
  alert: "#ff9f5a",
  alertSoft: "#fff0e6",
  bg: "#fafbff",
  ink: "#2e2e3a",
  inkMuted: "#5c5c6e",
  surface: "#ffffff",
  border: "#e2e8f2",
};

// La misma fuente de la app (Nunito), guardada en public/fonts para que el
// video se pueda renderizar sin conexión a internet.
export const fontFamily = "Nunito";
loadFont({
  family: fontFamily,
  url: staticFile("fonts/nunito.woff2"),
  weight: "200 1000",
});

export const FPS = 30;

// Duración de cada escena (en frames) y de la transición entre escenas.
export const SCENES = {
  intro: 160,
  blocks: 300,
  roles: 180,
  celebrate: 120,
  outro: 150,
};
export const TRANSITION = 20;

export const TOTAL_DURATION =
  Object.values(SCENES).reduce((a, b) => a + b, 0) -
  TRANSITION * (Object.keys(SCENES).length - 1);
