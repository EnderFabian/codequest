import { Img, staticFile, useCurrentFrame } from "remotion";

export type RobotPose = "wave" | "fly" | "happy" | "idle" | "celebrate";

// La mascota de CodeQuest, con un "flotar" suave y lento.
export const Robot: React.FC<{
  pose: RobotPose;
  size: number;
  float?: boolean;
  style?: React.CSSProperties;
}> = ({ pose, size, float = true, style }) => {
  const frame = useCurrentFrame();
  const bob = float ? Math.sin(frame / 14) * size * 0.02 : 0;

  return (
    <Img
      src={staticFile(`robot/robot_${pose}.png`)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        transform: `translateY(${bob}px)`,
        filter: "drop-shadow(0 24px 32px rgba(77, 150, 255, 0.25))",
        ...style,
      }}
    />
  );
};
