import "./index.css";
import { Composition, Folder } from "remotion";
import { CodeQuestPromo } from "./CodeQuestPromo";
import { Blocks } from "./scenes/Blocks";
import { Celebrate } from "./scenes/Celebrate";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Roles } from "./scenes/Roles";
import { FPS, SCENES, TOTAL_DURATION } from "./theme";

// Cada <Composition> aparece en la barra lateral de Remotion Studio.
// Para renderizar el video completo: npm run render

const size = { fps: FPS, width: 1920, height: 1080 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CodeQuestPromo"
        component={CodeQuestPromo}
        durationInFrames={TOTAL_DURATION}
        {...size}
      />
      <Folder name="Escenas">
        <Composition
          id="Intro"
          component={Intro}
          durationInFrames={SCENES.intro}
          {...size}
        />
        <Composition
          id="Bloques"
          component={Blocks}
          durationInFrames={SCENES.blocks}
          {...size}
        />
        <Composition
          id="Roles"
          component={Roles}
          durationInFrames={SCENES.roles}
          {...size}
        />
        <Composition
          id="Celebracion"
          component={Celebrate}
          durationInFrames={SCENES.celebrate}
          {...size}
        />
        <Composition
          id="Cierre"
          component={Outro}
          durationInFrames={SCENES.outro}
          {...size}
        />
      </Folder>
    </>
  );
};
