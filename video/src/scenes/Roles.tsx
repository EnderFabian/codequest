import { HeartHandshake, LineChart, Puzzle } from "lucide-react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { Sfx } from "../components/Sfx";
import { colors, fontFamily } from "../theme";

// Escena 3: los tres tipos de usuario (mismos textos que la página de inicio).
const roles = [
  {
    icon: Puzzle,
    title: "Estudiante",
    text: "Mapa de retos, bloques visuales y estrellas.",
    color: colors.primary,
    soft: colors.primarySoft,
  },
  {
    icon: HeartHandshake,
    title: "Padre o cuidador",
    text: "Sigue el avance y el tiempo de uso.",
    color: colors.secondary,
    soft: colors.secondarySoft,
  },
  {
    icon: LineChart,
    title: "Profesional",
    text: "Monitorea intentos, tiempos y reportes.",
    color: "#e6a800",
    soft: colors.accentSoft,
  },
];

export const Roles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Background>
      {roles.map((role, i) => (
        <Sfx key={role.title} name="pop" at={20 + i * 15} volume={0.45} />
      ))}
      <AbsoluteFill
        style={{
          fontFamily,
          alignItems: "center",
          justifyContent: "center",
          gap: 80,
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: colors.ink,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 20}px)`,
          }}
        >
          Un espacio para todos
        </div>

        <div style={{ display: "flex", gap: 50 }}>
          {roles.map((role, i) => {
            const cardIn = spring({
              frame: frame - 20 - i * 15,
              fps,
              config: { damping: 16 },
            });
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                style={{
                  width: 500,
                  background: colors.surface,
                  borderRadius: 40,
                  padding: 50,
                  border: `3px solid ${colors.border}`,
                  boxShadow: "0 12px 32px rgba(46, 46, 58, 0.08)",
                  opacity: cardIn,
                  transform: `translateY(${(1 - cardIn) * 100}px)`,
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 32,
                    background: role.soft,
                    color: role.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={68} strokeWidth={2.2} />
                </div>
                <div
                  style={{
                    marginTop: 34,
                    fontSize: 46,
                    whiteSpace: "nowrap",
                    fontWeight: 800,
                    color: colors.ink,
                  }}
                >
                  {role.title}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 38,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    color: colors.inkMuted,
                  }}
                >
                  {role.text}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Background>
  );
};
