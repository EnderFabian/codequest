import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { Robot } from "../components/Robot";
import { Sfx } from "../components/Sfx";
import { Star } from "../components/Star";
import { colors, fontFamily } from "../theme";

// Escena 4: el robot celebra y se ganan las tres estrellas del reto.
// Movimiento suave a propósito (sin destellos), pensado para niños con TEA.

// Estrellitas decorativas alrededor del robot: [ángulo, distancia, tamaño].
const SPARKLES: [number, number, number][] = [
  [-150, 430, 60],
  [-110, 470, 44],
  [-60, 450, 54],
  [-20, 420, 40],
  [200, 420, 46],
  [160, 460, 38],
];

export const Celebrate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const robotIn = spring({ frame, fps, config: { damping: 12 } });
  const textIn = spring({ frame: frame - 10, fps, config: { damping: 18 } });

  return (
    <Background>
      <Sfx name="success" at={0} volume={0.55} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="chime" at={36 + i * 12} volume={0.35} />
      ))}
      <AbsoluteFill
        style={{ fontFamily, alignItems: "center", justifyContent: "center" }}
      >
        {SPARKLES.map(([angle, dist, size], i) => {
          const s = spring({
            frame: frame - 8 - i * 4,
            fps,
            config: { damping: 14 },
          });
          const rad = (angle * Math.PI) / 180;
          return (
            <Star
              key={i}
              size={size}
              color={i % 2 ? colors.accent : "#ffe680"}
              style={{
                position: "absolute",
                left: 960 + Math.cos(rad) * dist * s - size / 2,
                top: 420 + Math.sin(rad) * dist * 0.6 * s - size / 2,
                opacity: s,
                transform: `rotate(${frame * 1.5 + i * 30}deg)`,
              }}
            />
          );
        })}

        <div
          style={{
            transform: `scale(${robotIn}) translateY(-80px)`,
          }}
        >
          <Robot pose="celebrate" size={560} />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 90,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            opacity: textIn,
            transform: `translateY(${(1 - textIn) * 40}px)`,
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 800, color: colors.ink }}>
            ¡Reto completado!
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            {[0, 1, 2].map((i) => {
              const fill = interpolate(
                frame,
                [30 + i * 12, 42 + i * 12],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              );
              return (
                <Star
                  key={i}
                  size={96}
                  color={fill > 0.5 ? colors.accent : colors.border}
                  style={{
                    transform: `scale(${1 + Math.sin(fill * Math.PI) * 0.3})`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
