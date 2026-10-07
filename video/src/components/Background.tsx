import { AbsoluteFill } from "remotion";
import { colors } from "../theme";

// El mismo fondo suave de la app: degradados azul y verde sobre blanco.
export const Background: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 50% at 10% -10%, rgba(77, 150, 255, 0.18), transparent),
          radial-gradient(ellipse 60% 40% at 90% 0%, rgba(107, 203, 119, 0.14), transparent),
          ${colors.bg}`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
