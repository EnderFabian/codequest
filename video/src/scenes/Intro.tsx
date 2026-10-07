import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { Robot } from "../components/Robot";
import { colors, fontFamily } from "../theme";

// Escena 1: el robot saluda y aparece el nombre del juego.
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const robotIn = spring({ frame, fps, config: { damping: 18 } });
  const bubbleIn = spring({ frame: frame - 25, fps, config: { damping: 14 } });
  const titleIn = spring({ frame: frame - 35, fps, config: { damping: 20 } });
  const subtitleOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Background>
      <AbsoluteFill
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          fontFamily,
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `translateY(${(1 - robotIn) * 500}px) rotate(${(1 - robotIn) * -12}deg)`,
          }}
        >
          <Robot pose="wave" size={620} />
          <div
            style={{
              position: "absolute",
              top: 40,
              right: -20,
              background: colors.surface,
              border: `4px solid ${colors.primary}`,
              borderRadius: 36,
              padding: "18px 36px",
              fontSize: 56,
              fontWeight: 800,
              color: colors.primary,
              transform: `scale(${bubbleIn})`,
              transformOrigin: "bottom left",
              boxShadow: "0 12px 32px rgba(77, 150, 255, 0.18)",
            }}
          >
            ¡Hola!
          </div>
        </div>

        <div style={{ width: 860 }}>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: colors.secondary,
              opacity: titleIn,
            }}
          >
            Bienvenido a
          </div>
          <div
            style={{
              fontSize: 190,
              fontWeight: 800,
              lineHeight: 1,
              color: colors.ink,
              opacity: titleIn,
              transform: `translateX(${(1 - titleIn) * 80}px)`,
            }}
          >
            Code<span style={{ color: colors.primary }}>Quest</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 54,
              fontWeight: 700,
              color: colors.inkMuted,
              opacity: subtitleOpacity,
            }}
          >
            Aprende a programar jugando
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
