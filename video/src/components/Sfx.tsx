import { Html5Audio, Sequence, staticFile } from "remotion";

export type SfxName = "pop" | "step" | "jump" | "chime" | "success" | "whoosh";

// Un efecto de sonido que suena en el frame `at` de la escena.
// Los archivos se generan con scripts/generate-audio.py.
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({
  name,
  at,
  volume = 0.6,
}) => {
  return (
    <Sequence from={at} layout="none" name={`Sonido: ${name}`}>
      <Html5Audio src={staticFile(`audio/${name}.mp3`)} volume={volume} />
    </Sequence>
  );
};
