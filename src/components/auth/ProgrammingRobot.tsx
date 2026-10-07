import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ROBOT_FRAMES, ROBOT_POSES, type RobotPose } from '../../assets/robot'
import './ProgrammingRobot.css'

type BlockKind = 'start' | 'move' | 'say' | 'loop'
type Pose = RobotPose
type Facing = 'left' | 'right'

type Step = {
  t: number
  x: number
  y: number
  rot: number
  facing: Facing
  pose: Pose
  carry: BlockKind | null
  placed: BlockKind[]
  glow?: BlockKind | null
  celebrate?: boolean
  seeking?: boolean
}

const FRAMES = ROBOT_FRAMES
const POSES = ROBOT_POSES

const META: Record<BlockKind, { label: string; color: string; icon: string }> = {
  start: { label: 'Iniciar', color: '#FFC83D', icon: '⚑' },
  move: { label: 'Avanzar', color: '#4F91F9', icon: '→' },
  say: { label: 'Decir', color: '#8B5CF6', icon: '💬' },
  loop: { label: 'Repetir', color: '#63D471', icon: '↻' },
}

const ORDER: BlockKind[] = ['start', 'move', 'say', 'loop']

/** Posiciones de bloques sueltos (% del escenario) */
const SOURCE_POS: Record<BlockKind, { x: number; y: number }> = {
  start: { x: 14, y: 58 },
  move: { x: 12, y: 28 },
  say: { x: 22, y: 44 },
  loop: { x: 10, y: 70 },
}

/**
 * Historia ~28s con frames oficiales PNG:
 * idle / fly / wave / happy / celebrate
 */
const SCRIPT: Step[] = [
  // Exploración
  { t: 1400, x: 44, y: 38, rot: -3, facing: 'right', pose: 'idle', carry: null, placed: [], seeking: true },
  { t: 1500, x: 68, y: 20, rot: 7, facing: 'right', pose: 'fly', carry: null, placed: [], seeking: true },
  { t: 1200, x: 32, y: 48, rot: -8, facing: 'left', pose: 'fly', carry: null, placed: [], glow: 'start', seeking: true },

  // Amarillo — interactuar → recoger → transportar → colocar → feliz
  { t: 900, x: 20, y: 52, rot: -4, facing: 'left', pose: 'wave', carry: null, placed: [], glow: 'start' },
  { t: 700, x: 20, y: 52, rot: -2, facing: 'left', pose: 'happy', carry: 'start', placed: [], glow: 'start' },
  { t: 1600, x: 70, y: 24, rot: 8, facing: 'right', pose: 'fly', carry: 'start', placed: [] },
  { t: 850, x: 74, y: 36, rot: 3, facing: 'right', pose: 'fly', carry: 'start', placed: [] },
  { t: 800, x: 74, y: 36, rot: 0, facing: 'right', pose: 'happy', carry: null, placed: ['start'] },

  // Azul
  { t: 1100, x: 34, y: 22, rot: -10, facing: 'left', pose: 'fly', carry: null, placed: ['start'], seeking: true },
  { t: 850, x: 18, y: 26, rot: -4, facing: 'left', pose: 'wave', carry: null, placed: ['start'], glow: 'move' },
  { t: 650, x: 18, y: 26, rot: 0, facing: 'left', pose: 'happy', carry: 'move', placed: ['start'] },
  { t: 1500, x: 72, y: 22, rot: 9, facing: 'right', pose: 'fly', carry: 'move', placed: ['start'] },
  { t: 800, x: 74, y: 30, rot: 2, facing: 'right', pose: 'fly', carry: 'move', placed: ['start'] },
  { t: 750, x: 74, y: 30, rot: 0, facing: 'right', pose: 'happy', carry: null, placed: ['start', 'move'] },

  // Morado
  { t: 1000, x: 50, y: 54, rot: 5, facing: 'right', pose: 'fly', carry: null, placed: ['start', 'move'], seeking: true },
  { t: 850, x: 26, y: 42, rot: -6, facing: 'left', pose: 'wave', carry: null, placed: ['start', 'move'], glow: 'say' },
  { t: 650, x: 26, y: 42, rot: -2, facing: 'left', pose: 'happy', carry: 'say', placed: ['start', 'move'] },
  { t: 1500, x: 68, y: 18, rot: 8, facing: 'right', pose: 'fly', carry: 'say', placed: ['start', 'move'] },
  { t: 800, x: 74, y: 24, rot: 2, facing: 'right', pose: 'fly', carry: 'say', placed: ['start', 'move'] },
  { t: 750, x: 74, y: 24, rot: 0, facing: 'right', pose: 'happy', carry: null, placed: ['start', 'move', 'say'] },

  // Verde
  { t: 1000, x: 24, y: 56, rot: -10, facing: 'left', pose: 'fly', carry: null, placed: ['start', 'move', 'say'], seeking: true },
  { t: 850, x: 16, y: 58, rot: -4, facing: 'left', pose: 'wave', carry: null, placed: ['start', 'move', 'say'], glow: 'loop' },
  { t: 650, x: 16, y: 58, rot: 0, facing: 'left', pose: 'happy', carry: 'loop', placed: ['start', 'move', 'say'] },
  { t: 1600, x: 66, y: 16, rot: 10, facing: 'right', pose: 'fly', carry: 'loop', placed: ['start', 'move', 'say'] },
  { t: 800, x: 74, y: 20, rot: 2, facing: 'right', pose: 'fly', carry: 'loop', placed: ['start', 'move', 'say'] },
  { t: 800, x: 74, y: 20, rot: 0, facing: 'right', pose: 'happy', carry: null, placed: ['start', 'move', 'say', 'loop'] },

  // Celebración
  { t: 1100, x: 46, y: 34, rot: 0, facing: 'right', pose: 'celebrate', carry: null, placed: ['start', 'move', 'say', 'loop'], celebrate: true },
  { t: 900, x: 52, y: 20, rot: 8, facing: 'right', pose: 'celebrate', carry: null, placed: ['start', 'move', 'say', 'loop'], celebrate: true },
  { t: 900, x: 40, y: 28, rot: -8, facing: 'left', pose: 'celebrate', carry: null, placed: ['start', 'move', 'say', 'loop'], celebrate: true },
  { t: 1200, x: 46, y: 32, rot: 0, facing: 'right', pose: 'happy', carry: null, placed: ['start', 'move', 'say', 'loop'], celebrate: true },

  // Reset suave
  { t: 1300, x: 30, y: 44, rot: -5, facing: 'left', pose: 'fly', carry: null, placed: ['start', 'move', 'say', 'loop'] },
  { t: 1000, x: 44, y: 38, rot: -2, facing: 'right', pose: 'idle', carry: null, placed: [], seeking: true },
]

function RobotSprite({ pose, facing }: { pose: Pose; facing: Facing }) {
  return (
    <div className={`cq2-sprite cq2-face-${facing}`}>
      {POSES.map((p) => (
        <img
          key={p}
          src={FRAMES[p]}
          alt=""
          draggable={false}
          className={`cq2-frame ${p === pose ? 'cq2-frame-on' : ''}`}
        />
      ))}
    </div>
  )
}

function BlockChip({
  kind,
  className = '',
  style,
}: {
  kind: BlockKind
  className?: string
  style?: CSSProperties
}) {
  const m = META[kind]
  return (
    <div className={`cq2-block ${className}`} style={{ background: m.color, ...style }}>
      <span aria-hidden>{m.icon}</span>
      <span>{m.label}</span>
    </div>
  )
}

/** Escena viva: mascota 3D oficial (PNG) construyendo un programa. */
export function ProgrammingRobot() {
  const [i, setI] = useState(0)
  const [reduced, setReduced] = useState(false)
  const stageRef = useRef<HTMLElement>(null)

  // La escena se inclina en 3D siguiendo el puntero.
  useEffect(() => {
    const el = stageRef.current
    if (!el || reduced) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height
        el.style.setProperty('--stage-ry', `${Math.max(-1, Math.min(1, dx)) * 8}deg`)
        el.style.setProperty('--stage-rx', `${Math.max(-1, Math.min(1, dy)) * -6}deg`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduced])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const fn = () => setReduced(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => {
      setI((n) => (n + 1) % SCRIPT.length)
    }, SCRIPT[i].t)
    return () => window.clearTimeout(id)
  }, [i, reduced])

  const step = reduced
    ? {
        x: 48,
        y: 38,
        rot: 0,
        facing: 'right' as Facing,
        pose: 'idle' as Pose,
        carry: null,
        placed: [...ORDER],
        glow: null,
        celebrate: false,
        seeking: false,
      }
    : SCRIPT[i]

  const flyMs = reduced ? 0 : Math.min(Math.max(SCRIPT[i].t * 0.88, 850), 2200)
  const heightFactor = 1 - step.y / 120
  const shadowScale = 0.5 + (1 - heightFactor) * 0.6
  const shadowOpacity = 0.1 + (1 - heightFactor) * 0.16

  const remaining = useMemo(
    () => ORDER.filter((k) => !step.placed.includes(k) && k !== step.carry),
    [step.placed, step.carry],
  )

  const bobClass = [
    'cq2-bob',
    step.pose === 'idle' ? 'cq2-bob-idle' : '',
    step.pose === 'celebrate' ? 'cq2-bob-party' : '',
    step.pose === 'happy' && !step.celebrate ? 'cq2-bob-happy' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside ref={stageRef} className="cq2-stage" aria-hidden="true">
      <div className={`cq2-world ${reduced ? 'cq2-reduced' : ''}`}>
        <div className="cq2-sky" />
        <div className="cq2-grid" />

        <div className="cq2-program">
          <p className="cq2-caption">Programa</p>
          <div className="cq2-stack">
            {[...step.placed].reverse().map((kind) => (
              <BlockChip key={`p-${kind}`} kind={kind} className="cq2-block-placed" />
            ))}
            {step.placed.length === ORDER.length ? (
              <div className={`cq2-ok ${step.celebrate ? 'cq2-ok-pop' : ''}`}>✓</div>
            ) : null}
          </div>
        </div>

        {remaining.map((kind) => {
          const pos = SOURCE_POS[kind]
          const glowing = step.glow === kind
          return (
            <div
              key={`s-${kind}`}
              className={`cq2-float-slot ${glowing ? 'cq2-glow' : ''}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <BlockChip kind={kind} className="cq2-block-float" />
            </div>
          )
        })}

        <div
          className={['cq2-fly', step.seeking ? 'cq2-seeking' : '', step.celebrate ? 'cq2-party' : ''].join(
            ' ',
          )}
          style={{
            transform: `translate3d(${step.x}%, ${step.y}%, 0)`,
            transitionDuration: `${flyMs}ms`,
          }}
        >
          <div
            className="cq2-pilot"
            style={{ transform: `translate3d(-50%, -50%, 0) rotate(${step.rot}deg)` }}
          >
            <div className={bobClass}>
              <RobotSprite pose={step.pose} facing={step.facing} />
              {step.carry ? (
                <div className="cq2-carry">
                  <BlockChip kind={step.carry} className="cq2-block-carry" />
                </div>
              ) : null}
              {step.celebrate ? (
                <div className="cq2-sparkles">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              ) : null}
            </div>
            <div
              className="cq2-shadow"
              style={{
                transform: `translateX(-50%) scale(${shadowScale})`,
                opacity: shadowOpacity,
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
