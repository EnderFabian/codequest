import celebrate from './robot_celebrate.webp'
import fall from './robot_fall.webp'
import fly from './robot_fly.webp'
import happy from './robot_happy.webp'
import idle from './robot_idle.webp'
import jumpApex from './robot_jump_apex.webp'
import jumpDown from './robot_jump_down.webp'
import jumpUp from './robot_jump_up.webp'
import walkA from './robot_walk_a.webp'
import walkB from './robot_walk_b.webp'
import walkL from './robot_walk_l.webp'
import walkR from './robot_walk_r.webp'
import wave from './robot_wave.webp'

export type RobotPose =
  | 'idle'
  | 'fly'
  | 'happy'
  | 'wave'
  | 'celebrate'
  | 'walk_a'
  | 'walk_b'
  | 'walk_l'
  | 'walk_r'
  | 'jump_up'
  | 'jump_apex'
  | 'jump_down'
  | 'fall'

/** Poses de la mascota (WebP livianos). */
export const ROBOT_FRAMES: Record<RobotPose, string> = {
  idle,
  fly,
  happy,
  wave,
  celebrate,
  walk_a: walkA,
  walk_b: walkB,
  walk_l: walkL,
  walk_r: walkR,
  jump_up: jumpUp,
  jump_apex: jumpApex,
  jump_down: jumpDown,
  fall,
}

export const ROBOT_POSES = Object.keys(ROBOT_FRAMES) as RobotPose[]

/** Poses usadas en UI (avatar), sin ciclo de caminata/salto/caída. */
export const ROBOT_UI_POSES: RobotPose[] = ['idle', 'fly', 'happy', 'wave', 'celebrate']
