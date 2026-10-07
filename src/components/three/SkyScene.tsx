import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/** Colores de los bloques del juego (Iniciar, Avanzar, Saltar, Repetir, Si). */
const BLOCK_COLORS = ['#6bcb77', '#4d96ff', '#9b72e8', '#ff9f5a', '#ffd93d']

type Item = {
  kind: 'block' | 'star' | 'planet'
  /** x como fracción del borde visible (0.8 = cerca del borde); y y z en unidades del mundo. */
  pos: [number, number, number]
  rot: [number, number, number]
  scale: number
  color: string
  speed: number
}

function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function makeItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (k: number) => seeded(i * 7 + k)
    const kind: Item['kind'] = i % 5 === 0 ? 'star' : i % 7 === 3 ? 'planet' : 'block'
    // Se ubican sobre todo a los costados para no tapar el contenido.
    const side = i % 2 === 0 ? -1 : 1
    return {
      kind,
      pos: [side * (1.0 + r(1) * 0.16), -0.9 + r(2) * 1.8, -2 - r(3) * 6],
      rot: [r(4) * Math.PI, r(5) * Math.PI, r(6) * Math.PI],
      scale: 0.45 + r(7) * 0.55,
      color: BLOCK_COLORS[i % BLOCK_COLORS.length],
      speed: 0.4 + r(8) * 0.6,
    }
  })
}

function starGeometry() {
  const shape = new THREE.Shape()
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? 0.5 : 0.22
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelSize: 0.05,
    bevelThickness: 0.05,
    bevelSegments: 2,
  })
}

const CAMERA_Z = 6
const HALF_FOV = Math.tan(THREE.MathUtils.degToRad(25))

function Floating({ item, calm }: { item: Item; calm: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const { size } = useThree()
  // Convierte la posición relativa en coordenadas del mundo según la pantalla,
  // para que los objetos queden en los costados y no tapen el contenido.
  const halfH = HALF_FOV * (CAMERA_Z - item.pos[2])
  const halfW = halfH * (size.width / size.height)
  const pos: [number, number, number] = [item.pos[0] * halfW, item.pos[1] * halfH, item.pos[2]]
  const star = useMemo(() => (item.kind === 'star' ? starGeometry() : null), [item.kind])
  useFrame((state) => {
    const g = ref.current
    if (!g || calm) return
    const t = state.clock.elapsedTime * item.speed
    g.position.y = pos[1] + Math.sin(t + item.pos[0] * 5) * 0.35
    g.rotation.x = item.rot[0] + t * 0.25
    g.rotation.y = item.rot[1] + t * 0.35
  })
  return (
    <group ref={ref} position={pos} rotation={item.rot} scale={item.scale}>
      {item.kind === 'block' ? (
        <group>
          <RoundedBox args={[1.6, 0.7, 0.7]} radius={0.18} smoothness={4}>
            <meshStandardMaterial color={item.color} roughness={0.45} />
          </RoundedBox>
          {/* "Muesca" de encastre como en los bloques de programación */}
          <RoundedBox args={[0.42, 0.2, 0.5]} radius={0.08} position={[-0.35, 0.42, 0]}>
            <meshStandardMaterial color={item.color} roughness={0.45} />
          </RoundedBox>
        </group>
      ) : item.kind === 'star' ? (
        <mesh geometry={star!}>
          <meshStandardMaterial color="#ffd93d" emissive="#ffb800" emissiveIntensity={0.3} roughness={0.35} />
        </mesh>
      ) : (
        <group>
          <mesh>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshStandardMaterial color="#8fc1ff" roughness={0.5} />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[0.85, 0.06, 12, 48]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/** Mueve la cámara apenas siguiendo al puntero (efecto de profundidad). */
function Parallax({ calm }: { calm: boolean }) {
  useFrame(({ camera, pointer }, dt) => {
    if (calm) return
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.8, 2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.5, 2, dt)
    camera.lookAt(0, 0, -4)
  })
  return null
}

/** Fondo 3D decorativo: bloques, estrellas y planetas flotando. */
export function SkyScene({ calm = false, density = 14 }: { calm?: boolean; density?: number }) {
  const items = useMemo(() => makeItems(density), [density])
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: 50, position: [0, 0, CAMERA_Z] }}
      gl={{ alpha: true, antialias: true }}
      frameloop={calm ? 'demand' : 'always'}
      eventSource={document.body}
      eventPrefix="client"
    >
      <hemisphereLight args={['#ffffff', '#cfe0ff', 1.2]} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      {items.map((item, i) => (
        <Floating key={i} item={item} calm={calm} />
      ))}
      <Parallax calm={calm} />
    </Canvas>
  )
}
