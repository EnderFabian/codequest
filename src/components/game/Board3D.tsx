import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, Sparkles, useTexture } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ROBOT_FRAMES, ROBOT_POSES, type RobotPose } from '../../assets/robot'
import { boardThemeForLevel, type BoardTheme } from '../../game/boardThemes'
import type { StepResult, Tile } from '../../game/types'

/** Distancia entre casillas en el mundo 3D. */
const S = 1.35
const TILE_TOP = 0.22
const ROBOT_SIZE = 1.45

export type BoardAnim = {
  /** Cambia en cada paso para disparar una animación nueva. */
  key: number
  kind: 'idle' | 'walk' | 'jump' | 'fall' | 'bump' | 'success'
  durationMs: number
}

type Props = {
  tiles: Tile[]
  baseTiles: Tile[]
  position: number
  status: StepResult['status']
  anim: BoardAnim
  calm: boolean
  /** Desplazamiento horizontal del mapa (exploración con arrastre). */
  panX?: number
  /** Zoom de cámara (1 = normal). */
  zoom?: number
  /** Si true, la cámara no sigue al robot (modo explorar). */
  exploring?: boolean
  theme?: BoardTheme
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

function starShape() {
  const shape = new THREE.Shape()
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? 0.32 : 0.14
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return shape
}

function Star3D({ x, collected, calm }: { x: number; collected: boolean; calm: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const geometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(starShape(), {
        depth: 0.12,
        bevelEnabled: true,
        bevelSize: 0.03,
        bevelThickness: 0.03,
        bevelSegments: 2,
      }),
    [],
  )
  const gone = useRef(0)

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    gone.current = THREE.MathUtils.damp(gone.current, collected ? 1 : 0, 6, dt)
    const t = state.clock.elapsedTime
    g.rotation.y = calm ? 0.4 : t * 1.6
    g.position.y = TILE_TOP + 0.55 + (calm ? 0 : Math.sin(t * 2 + x) * 0.06) + gone.current * 1.2
    const s = (1 - gone.current) * (1 + gone.current * 0.6)
    g.scale.setScalar(Math.max(0.0001, s))
  })

  return (
    <group ref={ref} position={[x, TILE_TOP + 0.55, 0]}>
      <mesh geometry={geometry} position={[0, 0, -0.06]} castShadow>
        <meshStandardMaterial color="#ffd93d" emissive="#ffb800" emissiveIntensity={0.35} roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  )
}

function Flag({ x, calm }: { x: number; calm: boolean }) {
  const cloth = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (cloth.current && !calm) cloth.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.25
  })
  return (
    <group position={[x + 0.3, TILE_TOP, -0.3]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 12]} />
        <meshStandardMaterial color="#5c5c6e" />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffd93d" />
      </mesh>
      <mesh ref={cloth} position={[0.28, 1.18, 0]} castShadow>
        <boxGeometry args={[0.52, 0.34, 0.03]} />
        <meshStandardMaterial color="#6bcb77" />
      </mesh>
    </group>
  )
}

function TileBlock({
  tile,
  x,
  index,
  theme,
}: {
  tile: Tile
  x: number
  index: number
  theme: BoardTheme
}) {
  if (tile === '_') {
    // Hueco: sin piso, solo un brillo de agua muy abajo.
    return (
      <mesh position={[x, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial color={theme.water} transparent opacity={0.55} />
      </mesh>
    )
  }
  const top =
    tile === 'F'
      ? theme.accent
      : tile === '★'
        ? '#ffe066'
        : index % 2 === 0
          ? theme.grassA
          : theme.grassB
  return (
    <group position={[x, 0, 0]}>
      {/* Isla flotante: tierra abajo, pasto arriba */}
      <RoundedBox args={[1.18, 0.95, 1.18]} radius={0.14} position={[0, -0.48, 0]} receiveShadow>
        <meshStandardMaterial color={theme.dirt} roughness={0.88} />
      </RoundedBox>
      <RoundedBox args={[1.12, 0.22, 1.12]} radius={0.08} position={[0, TILE_TOP - 0.1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={top} roughness={0.7} />
      </RoundedBox>
      {tile === '#' ? (
        <group position={[0, TILE_TOP, 0]}>
          <RoundedBox args={[0.86, 0.95, 0.86]} radius={0.08} position={[0, 0.48, 0]} castShadow>
            <meshStandardMaterial color="#c97b4a" roughness={0.8} />
          </RoundedBox>
          {[0.2, 0.5, 0.8].map((y) => (
            <mesh key={y} position={[0, y, 0.435]}>
              <boxGeometry args={[0.86, 0.03, 0.01]} />
              <meshStandardMaterial color="#9e5a32" />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  )
}

function Clouds({ width, calm }: { width: number; calm: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const clouds = useMemo(
    () =>
      Array.from({ length: Math.ceil(width / 2.5) + 3 }, (_, i) => ({
        x: -3 + i * 2.6 + (i % 3) * 0.4,
        y: -2.4 - (i % 2) * 0.6,
        z: -2.5 - (i % 3) * 1.2,
        s: 0.6 + (i % 3) * 0.25,
      })),
    [width],
  )
  useFrame((_, dt) => {
    if (ref.current && !calm) {
      ref.current.position.x += dt * 0.15
      if (ref.current.position.x > 2.6) ref.current.position.x = 0
    }
  })
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {[
            [0, 0, 0, 0.7],
            [0.6, 0.1, 0, 0.55],
            [-0.6, 0.05, 0, 0.5],
            [0.2, 0.35, 0, 0.5],
          ].map(([x, y, z, r], j) => (
            <mesh key={j} position={[x, y, z]}>
              <sphereGeometry args={[r, 20, 20]} />
              <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Robot({
  targetX,
  anim,
  status,
  calm,
  onX,
}: {
  targetX: number
  anim: BoardAnim
  status: StepResult['status']
  calm: boolean
  onX: (x: number) => void
}) {
  const textures = useTexture(ROBOT_POSES.map((p) => ROBOT_FRAMES[p]))
  const texByPose = useMemo(() => {
    const map = {} as Record<RobotPose, THREE.Texture>
    ROBOT_POSES.forEach((p, i) => {
      textures[i].colorSpace = THREE.SRGBColorSpace
      textures[i].anisotropy = 4
      map[p] = textures[i]
    })
    return map
  }, [textures])

  const group = useRef<THREE.Group>(null)
  const sprite = useRef<THREE.Sprite>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.SpriteMaterial>(null)
  const current = useRef({ x: targetX, y: 0 })
  const tween = useRef({ fromX: targetX, toX: targetX, start: 0, kind: anim.kind, dur: 1 })
  const pose = useRef<RobotPose>('wave')
  const born = useRef<number | null>(null)

  useEffect(() => {
    tween.current = {
      fromX: current.current.x,
      toX: targetX,
      start: performance.now(),
      kind: anim.kind,
      dur: Math.max(120, anim.durationMs * (calm ? 1.15 : 0.92)),
    }
    // Solo reacciona a un paso nuevo (anim.key); targetX llega junto con él.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim.key])

  useFrame((state) => {
    const g = group.current
    const sp = sprite.current
    if (!g || !sp || !material.current) return
    const now = performance.now()
    if (born.current == null) born.current = now
    const tw = tween.current
    const t = clamp01((now - tw.start) / tw.dur)
    const e = easeInOut(t)
    const time = state.clock.elapsedTime
    let x = tw.toX
    let y = 0
    let opacity = 1
    let sx = 1
    let sy = 1
    let tilt = 0
    let nextPose: RobotPose = 'idle'

    switch (tw.kind) {
      case 'walk':
        x = THREE.MathUtils.lerp(tw.fromX, tw.toX, e)
        y = Math.sin(Math.PI * t) * 0.22 + Math.abs(Math.sin(Math.PI * 2 * t)) * 0.08
        sy = 1 - Math.sin(Math.PI * 2 * t) * 0.06
        sx = 1 + Math.sin(Math.PI * 2 * t) * 0.05
        tilt = -0.1 * Math.sin(Math.PI * t)
        // Ciclo feliz de caminata: alterna fotogramas.
        nextPose = t < 1 ? (Math.floor(t * 6) % 2 === 0 ? 'walk_a' : 'walk_b') : 'happy'
        break
      case 'jump':
        x = THREE.MathUtils.lerp(tw.fromX, tw.toX, e)
        y = Math.sin(Math.PI * t) * (0.55 + Math.abs(tw.toX - tw.fromX) * 0.12)
        sy = t < 0.12 ? 1 - t * 0.8 : 1 + Math.sin(Math.PI * t) * 0.06
        tilt = -0.25 * Math.sin(Math.PI * t)
        nextPose = t < 1 ? 'fly' : 'happy'
        break
      case 'fall': {
        const walkPart = clamp01(t / 0.35)
        const dropPart = clamp01((t - 0.35) / 0.65)
        x = THREE.MathUtils.lerp(tw.fromX, tw.toX, easeInOut(walkPart))
        y = Math.sin(Math.PI * walkPart) * 0.22 - dropPart * dropPart * 3.8
        opacity = 1 - dropPart * 0.85
        tilt = dropPart * 1.15
        sx = 1 + dropPart * 0.08
        sy = 1 - dropPart * 0.12
        nextPose = dropPart < 0.08 ? 'walk_a' : 'fall'
        break
      }
      case 'bump': {
        const push = Math.sin(Math.PI * Math.min(1, t * 1.6))
        x = tw.toX + push * 0.32
        sx = 1 - push * 0.12
        tilt = push * 0.18 + (t > 0.6 && !calm ? Math.sin(t * 60) * 0.05 * (1 - t) : 0)
        nextPose = t < 0.6 ? 'fly' : 'wave'
        break
      }
      case 'success': {
        x = tw.toX
        const hop = Math.abs(Math.sin(Math.PI * 2 * Math.min(t, 1)))
        y = calm ? 0 : hop * 0.45
        nextPose = 'celebrate'
        break
      }
      default: {
        const sinceBorn = now - born.current
        nextPose = sinceBorn < 1800 ? 'wave' : status === 'fail_wall' ? 'wave' : 'idle'
      }
    }

    // Respiración suave cuando está quieto.
    const idleBob = !calm && (tw.kind === 'idle' || t >= 1) ? Math.sin(time * 2.2) * 0.05 : 0
    if (tw.kind === 'success' && t >= 1 && !calm) y = Math.abs(Math.sin(time * 3)) * 0.18

    current.current.x = x
    current.current.y = y
    onX(x)

    g.position.set(x, TILE_TOP + ROBOT_SIZE * 0.47 + y + idleBob, 0.05)
    sp.scale.set(ROBOT_SIZE * sx, ROBOT_SIZE * sy, 1)
    material.current.rotation = tilt
    material.current.opacity = opacity

    if (nextPose !== pose.current) {
      pose.current = nextPose
      material.current.map = texByPose[nextPose]
      material.current.needsUpdate = true
    }

    if (shadow.current) {
      const h = Math.max(0, y)
      const visible = tw.kind === 'fall' ? 1 - clamp01((t - 0.4) / 0.2) : 1
      shadow.current.position.set(x, TILE_TOP + 0.01, 0.05)
      shadow.current.scale.setScalar(Math.max(0.3, 1 - h * 0.35))
      ;(shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.22 * visible * (1 - h * 0.25)
    }
  })

  return (
    <>
      <group ref={group}>
        <sprite ref={sprite}>
          <spriteMaterial ref={material} map={texByPose.wave} transparent depthWrite={false} />
        </sprite>
        {status === 'success' && !calm ? (
          <Sparkles count={40} scale={[2.2, 2.2, 1.5]} size={6} speed={0.6} color="#ffd93d" />
        ) : null}
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 32]} />
        <meshBasicMaterial color="#1b2340" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </>
  )
}

function CameraRig({
  width,
  robotX,
  panX = 0,
  zoom = 1,
  exploring = false,
}: {
  width: number
  robotX: React.RefObject<number>
  panX?: number
  zoom?: number
  exploring?: boolean
}) {
  const { camera, size } = useThree()
  const target = useRef(new THREE.Vector3())
  useFrame((_, dt) => {
    const narrow = size.width < 640
    const z = Math.max(0.55, Math.min(1.6, zoom))
    // Un poco más cerca para que el tablero se sienta grande.
    const visible = (narrow ? 3.2 : 5.2) / z
    let cx: number
    if (exploring) {
      const min = visible / 2 - 0.4
      const max = Math.max(min, width - visible / 2 + 0.4)
      cx = THREE.MathUtils.clamp(panX, min, max)
    } else if (width <= visible) {
      cx = width / 2
    } else {
      cx = THREE.MathUtils.clamp(
        (robotX.current ?? 0) + 1.2,
        visible / 2 - 0.4,
        width - visible / 2 + 0.4,
      )
    }
    const dist = (narrow ? 5.6 : 5.9) / z
    target.current.x = THREE.MathUtils.damp(target.current.x, cx, exploring ? 8 : 4, dt)
    camera.position.set(target.current.x - 0.45, 3.35 / Math.sqrt(z), dist)
    camera.lookAt(target.current.x, 0.55, 0)
  })
  return null
}

function ThemeSky({ theme, width }: { theme: BoardTheme; width: number }) {
  const mid = width / 2
  return (
    <group>
      {/* Cielo en capas para más profundidad y contraste */}
      <mesh position={[mid, 3.2, -8]} scale={[Math.max(18, width + 14), 10, 1]}>
        <planeGeometry />
        <meshBasicMaterial color={theme.skyTop} />
      </mesh>
      <mesh position={[mid, 0.2, -7.2]} scale={[Math.max(18, width + 14), 5.5, 1]}>
        <planeGeometry />
        <meshBasicMaterial color={theme.skyMid} />
      </mesh>
      <mesh position={[mid, -2.6, -6.4]} scale={[Math.max(18, width + 14), 4, 1]}>
        <planeGeometry />
        <meshBasicMaterial color={theme.skyBottom} />
      </mesh>
      {/* Suelo lejano con más contraste */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[mid, -2.35, 0]} receiveShadow>
        <circleGeometry args={[Math.max(10, width * 0.9), 64]} />
        <meshStandardMaterial color={theme.hemiGround} roughness={1} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

export function Board3D({
  tiles,
  baseTiles,
  position,
  status,
  anim,
  calm,
  panX = 0,
  zoom = 1,
  exploring = false,
  theme = boardThemeForLevel('secuencias', 0),
}: Props) {
  const width = (tiles.length - 1) * S
  const robotX = useRef(position * S)
  const starIdx = baseTiles.map((t, i) => (t === '★' ? i : -1)).filter((i) => i >= 0)
  const flagIdx = baseTiles.findIndex((t) => t === 'F')

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 36, position: [width / 2, 3.8, 7.2], near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%', touchAction: exploring ? 'none' : 'auto' }}
    >
      <color attach="background" args={[theme.skyTop]} />
      <fog attach="fog" args={[theme.skyMid, 12, 26]} />
      <hemisphereLight args={[theme.hemiSky, theme.hemiGround, 1.35]} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <ThemeSky theme={theme} width={width} />
      <group>
        {baseTiles.map((t, i) => (
          <TileBlock key={i} tile={t === 'M' ? '.' : t} x={i * S} index={i} theme={theme} />
        ))}
        {starIdx.map((i) => (
          <Star3D key={`star-${i}`} x={i * S} collected={tiles[i] !== '★'} calm={calm} />
        ))}
        {flagIdx >= 0 ? <Flag x={flagIdx * S} calm={calm} /> : null}
        <Robot
          targetX={position * S}
          anim={anim}
          status={status}
          calm={calm}
          onX={(x) => {
            robotX.current = x
          }}
        />
        <Clouds width={width} calm={calm} />
      </group>
      <CameraRig width={width} robotX={robotX} panX={panX} zoom={zoom} exploring={exploring} />
    </Canvas>
  )
}
