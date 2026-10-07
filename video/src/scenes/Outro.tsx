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
import { colors, fontFamily } from "../theme";

// Escena 5: cierre con el nombre y el mensaje del proyecto.
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const robotIn = spring({ frame, fps, config: { damping: 18 } });
  const titleIn = spring({ frame: frame - 12, fps, config: { damping: 20 } });
  const lineIn = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Background>
      <Sfx name="chime" at={12} volume={0.4} />
      <AbsoluteFill
        style={{
          fontFamily,
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: robotIn,
            transform: `scale(${0.7 + robotIn * 0.3})`,
          }}
        >
          <Robot pose="happy" size={380} />
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 170,
            fontWeight: 800,
            lineHeight: 1,
            color: colors.ink,
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40}px)`,
          }}
        >
          Code<span style={{ color: colors.primary }}>Quest</span>
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 56,
            fontWeight: 800,
            color: colors.secondary,
            opacity: lineIn,
          }}
        >
          Pensamiento lógico inclusivo
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 40,
            fontWeight: 600,
            color: colors.inkMuted,
            opacity: lineIn,
          }}
        >
          Programación por bloques para niñas, niños y adolescentes con TEA
        </div>
      </AbsoluteFill>
    </Background>
  );
};
