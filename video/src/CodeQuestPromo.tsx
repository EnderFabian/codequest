import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Html5Audio, interpolate, staticFile } from "remotion";
import { Sfx } from "./components/Sfx";
import { Blocks } from "./scenes/Blocks";
import { Celebrate } from "./scenes/Celebrate";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Roles } from "./scenes/Roles";
import { SCENES, TOTAL_DURATION, TRANSITION } from "./theme";

// Frame donde empieza cada cambio de escena (para el sonido de transición).
const transitionStarts = Object.values(SCENES)
  .slice(0, -1)
  .map((_, i, all) =>
    all.slice(0, i + 1).reduce((sum, d) => sum + d - TRANSITION, 0),
  );

const transition = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TRANSITION })}
  />
);

// El video completo: las cinco escenas, unidas con un fundido suave,
// con música de fondo tranquila.
export const CodeQuestPromo: React.FC = () => {
  return (
    <>
      <Html5Audio
        src={staticFile("audio/music.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 15, TOTAL_DURATION - 45, TOTAL_DURATION],
            [0, 0.6, 0.6, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )
        }
      />
      {transitionStarts.map((at) => (
        <Sfx key={at} name="whoosh" at={at} volume={0.25} />
      ))}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.intro}>
          <Intro />
        </TransitionSeries.Sequence>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENES.blocks}>
          <Blocks />
        </TransitionSeries.Sequence>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENES.roles}>
          <Roles />
        </TransitionSeries.Sequence>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENES.celebrate}>
          <Celebrate />
        </TransitionSeries.Sequence>
        {transition}
        <TransitionSeries.Sequence durationInFrames={SCENES.outro}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
