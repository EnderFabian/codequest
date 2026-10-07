import celebrate from './robot_celebrate.webp'
import fly from './robot_fly.webp'
import happy from './robot_happy.webp'
import idle from './robot_idle.webp'
import wave from './robot_wave.webp'

export type RobotPose = 'idle' | 'fly' | 'happy' | 'wave' | 'celebrate'

/** Poses de la mascota (WebP livianos, generados desde frames/). */
export const ROBOT_FRAMES: Record<RobotPose, string> = {
  idle,
  fly,
  happy,
  wave,
  celebrate,
}

export const ROBOT_POSES = Object.keys(ROBOT_FRAMES) as RobotPose[]
