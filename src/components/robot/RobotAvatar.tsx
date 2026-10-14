import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ROBOT_FRAMES, ROBOT_UI_POSES, type RobotPose } from '../../assets/robot'
import './RobotAvatar.css'

type Props = {
  /** Pose fija, o una lista de poses que se alternan suavemente. */
  pose?: RobotPose | RobotPose[]
  /** Ancho del robot en px. */
  size?: number
  /** Globo de diálogo opcional. */
  say?: ReactNode
  /** Inclina al robot en 3D siguiendo el puntero. */
  followPointer?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Mascota de CodeQuest con profundidad 3D: flota, respira, inclina el cuerpo
 * hacia el puntero y cambia de pose con un fundido suave. En Modo Calma o con
 * "reducir movimiento" se queda quieta.
 */
export function RobotAvatar({
  pose = 'idle',
  size = 220,
  say,
  followPointer = true,
  className = '',
  style,
}: Props) {
  const poses = Array.isArray(pose) ? pose : [pose]
  const [index, setIndex] = useState(0)
  const current = poses[index % poses.length]
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (poses.length < 2) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % poses.length), 2600)
    return () => window.clearInterval(id)
  }, [poses.length])

  useEffect(() => {
    const el = stage.current
    if (!el || !followPointer) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth
        const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight
        el.style.setProperty('--tilt-y', `${Math.max(-1, Math.min(1, dx * 2)) * 18}deg`)
        el.style.setProperty('--tilt-x', `${Math.max(-1, Math.min(1, dy * 2)) * -12}deg`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [followPointer])

  return (
    <div
      ref={stage}
      className={`cq-robot ${className}`}
      style={{ ...style, ['--robot-size' as string]: `${size}px` }}
      aria-hidden
    >
      <div className="cq-robot-tilt">
        <div className="cq-robot-halo" />
        <div className="cq-robot-float">
          <div className="cq-robot-body">
            {ROBOT_UI_POSES.map((p) => (
              <img
                key={p}
                src={ROBOT_FRAMES[p]}
                alt=""
                draggable={false}
                className={p === current ? 'is-on' : ''}
              />
            ))}
          </div>
          <div className="cq-robot-jets">
            <i />
            <i />
            <i />
          </div>
        </div>
        {say ? (
          <div className="cq-robot-say-wrap">
            <div className="cq-robot-say">{say}</div>
          </div>
        ) : null}
      </div>
      <div className="cq-robot-shadow" />
    </div>
  )
}
