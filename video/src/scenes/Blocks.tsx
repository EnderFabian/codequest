import {
  AbsoluteFill,
  Easing,
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

// Escena 2: se arma un programa con los bloques reales del juego
// (Iniciar, Repetir, Avanzar, Saltar) y el robot lo ejecuta en el tablero.

const CELL = 170;
const CELLS = 6;
const OBSTACLE = 3;
const GOAL = 5;

const BLOCK_APPEAR = 15; // primer bloque
const BLOCK_GAP = 12; // frames entre un bloque y el siguiente
const RUN_START = 110; // el robot empieza a moverse
const STEP = 32; // frames por instrucción

// Casilla del robot al terminar cada instrucción.
const POSITIONS = [0, 1, 2, 4, 5];
// Qué bloque se está ejecutando en cada paso (índices de BLOCKS más abajo).
const ACTIVE_BLOCK = [2, 2, 3, 4];
const RUN_END = RUN_START + STEP * (POSITIONS.length - 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.cubic);

type BlockProps = {
  index: number;
  label: string;
  color: string;
  active: boolean;
  children?: React.ReactNode;
};

const Block: React.FC<BlockProps> = ({
  index,
  label,
  color,
  active,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({
    frame: frame - BLOCK_APPEAR - index * BLOCK_GAP,
    fps,
    config: { damping: 16 },
  });

  return (
    <div
      style={{
        opacity: appear,
        transform: `translateX(${(1 - appear) * -120}px) scale(${active ? 1.04 : 1})`,
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          background: color,
          color: "white",
          fontSize: 44,
          fontWeight: 800,
          padding: "18px 30px",
          borderRadius: children ? "22px 22px 0 0" : 22,
          width: "fit-content",
          minWidth: 300,
          boxShadow: active
            ? `0 0 0 8px ${colors.accent}, 0 12px 28px rgba(0,0,0,0.15)`
            : "0 8px 20px rgba(0,0,0,0.10)",
        }}
      >
        {label}
      </div>
      {children ? (
        <>
          <div
            style={{
              borderLeft: `36px solid ${color}`,
              padding: "12px 0 12px 16px",
            }}
          >
            {children}
          </div>
          <div
            style={{
              background: color,
              height: 30,
              width: 220,
              borderRadius: "0 0 22px 22px",
            }}
          />
        </>
      ) : null}
    </div>
  );
};

export const Blocks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ¿En qué paso del programa vamos y cuánto avanzó dentro de ese paso?
  const progress = interpolate(
    frame,
    [RUN_START, RUN_END],
    [0, POSITIONS.length - 1],
    clamp,
  );
  const step = Math.min(Math.floor(progress), POSITIONS.length - 2);
  const t = ease(progress - step);
  const running = frame >= RUN_START && frame < RUN_END;
  const finished = frame >= RUN_END;

  const from = POSITIONS[step];
  const to = POSITIONS[step + 1];
  const x = from + (to - from) * t;
  const isJump = to - from > 1;
  const y = isJump && running ? -Math.sin(Math.PI * t) * 150 : 0;

  const activeBlock = running ? ACTIVE_BLOCK[step] : -1;
  const startActive = frame >= RUN_START - 15 && frame < RUN_START;

  const boardIn = spring({ frame: frame - 30, fps, config: { damping: 20 } });
  const goalPop = spring({
    frame: frame - RUN_END,
    fps,
    config: { damping: 9 },
  });

  const caption =
    frame < RUN_START - 15
      ? "Arma tu programa con bloques"
      : "¡Y mira cómo funciona!";
  const captionKey = frame < RUN_START - 15 ? 0 : RUN_START - 15;
  const captionIn = interpolate(frame - captionKey, [0, 15], [0, 1], clamp);

  const pose = finished ? "celebrate" : isJump && running ? "fly" : "idle";

  return (
    <Background>
      {[0, 1, 2, 3, 4].map((i) => (
        <Sfx
          key={`pop-${i}`}
          name="pop"
          at={BLOCK_APPEAR + i * BLOCK_GAP}
          volume={0.45}
        />
      ))}
      {POSITIONS.slice(1).map((to, k) => (
        <Sfx
          key={`move-${k}`}
          name={to - POSITIONS[k] > 1 ? "jump" : "step"}
          at={RUN_START + k * STEP}
        />
      ))}
      <Sfx name="chime" at={RUN_END} />
      <AbsoluteFill style={{ fontFamily, padding: "70px 80px" }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            color: colors.ink,
            textAlign: "center",
            opacity: captionIn,
            transform: `translateY(${(1 - captionIn) * 20}px)`,
          }}
        >
          {caption}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Programa */}
          <div
            style={{
              background: colors.surface,
              border: `3px solid ${colors.border}`,
              borderRadius: 36,
              padding: 40,
              width: 600,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              boxShadow: "0 8px 28px rgba(46, 46, 58, 0.08)",
            }}
          >
            <Block
              index={0}
              label="▶ Iniciar"
              color={colors.secondary}
              active={startActive}
            />
            <Block
              index={1}
              label="Repetir 2 veces"
              color={colors.alert}
              active={running && step < 2}
            >
              <Block
                index={2}
                label="Avanzar 1"
                color={colors.primary}
                active={activeBlock === 2}
              />
            </Block>
            <Block
              index={3}
              label="Saltar 1"
              color="#9b72e8"
              active={activeBlock === 3}
            />
            <Block
              index={4}
              label="Avanzar 1"
              color={colors.primary}
              active={activeBlock === 4}
            />
          </div>

          {/* Tablero */}
          <div
            style={{
              position: "relative",
              opacity: boardIn,
              transform: `scale(${0.9 + boardIn * 0.1})`,
            }}
          >
            <div
              style={{
                display: "flex",
                background: colors.surface,
                padding: 20,
                borderRadius: 36,
                gap: 10,
                boxShadow: "0 12px 32px rgba(77, 150, 255, 0.18)",
              }}
            >
              {Array.from({ length: CELLS }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: CELL - 10,
                    height: CELL - 10,
                    borderRadius: 24,
                    background:
                      i === GOAL
                        ? colors.accentSoft
                        : i % 2 === 0
                          ? colors.primarySoft
                          : colors.secondarySoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i === OBSTACLE ? (
                    <div
                      style={{
                        width: 90,
                        height: 70,
                        background: "#a0a4b8",
                        borderRadius: "40px 46px 18px 18px",
                        boxShadow: "inset -10px -8px 0 rgba(0,0,0,0.12)",
                      }}
                    />
                  ) : null}
                  {i === GOAL ? (
                    <Star
                      size={110}
                      style={{
                        transform: `scale(${1 + goalPop * 0.35})`,
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            {/* Robot encima del tablero */}
            <div
              style={{
                position: "absolute",
                left: 20 + x * CELL - 40,
                top: -110 + y,
              }}
            >
              <Robot pose={pose} size={240} float={!running} />
            </div>

            <div
              style={{
                position: "absolute",
                top: CELL + 50,
                width: "100%",
                textAlign: "center",
                fontSize: 52,
                fontWeight: 800,
                color: colors.secondary,
                opacity: goalPop,
                transform: `translateY(${(1 - goalPop) * 20}px)`,
              }}
            >
              ¡Llegó a la estrella!
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
