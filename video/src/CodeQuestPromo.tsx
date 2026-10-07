import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Blocks } from "./scenes/Blocks";
import { Celebrate } from "./scenes/Celebrate";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Roles } from "./scenes/Roles";
import { SCENES, TRANSITION } from "./theme";

const transition = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TRANSITION })}
  />
);

// El video completo: las cinco escenas, unidas con un fundido suave.
export const CodeQuestPromo: React.FC = () => {
  return (
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
  );
};
