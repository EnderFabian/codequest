import celebrate from './robot_celebrate.webp'
import fall from './robot_fall.webp'
import fly from './robot_fly.webp'
import happy from './robot_happy.webp'
import idle from './robot_idle.webp'
import walkA from './robot_walk_a.webp'
import walkB from './robot_walk_b.webp'
import wave from './robot_wave.webp'

export type RobotPose =
  | 'idle'
  | 'fly'
  | 'happy'
  | 'wave'
  | 'celebrate'
  | 'walk_a'
  | 'walk_b'
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
  fall,
}

export const ROBOT_POSES = Object.keys(ROBOT_FRAMES) as RobotPose[]

/** Poses usadas en UI (avatar), sin ciclo de caminata/caída. */
export const ROBOT_UI_POSES: RobotPose[] = ['idle', 'fly', 'happy', 'wave', 'celebrate']
