import { Html5Audio, Sequence, staticFile } from "remotion";

export type VoiceLine =
  | "intro"
  | "blocks"
  | "run"
  | "goal"
  | "roles"
  | "celebrate"
  | "outro";

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

// Una frase del narrador (generadas con scripts/generate-voice.py).
export const Voice: React.FC<{ line: VoiceLine; at: number }> = ({
  line,
  at,
}) => {
  return (
    <Sequence from={at} layout="none" name={`Voz: ${line}`}>
      <Html5Audio src={staticFile(`voice/${line}.mp3`)} volume={1} />
    </Sequence>
  );
};
