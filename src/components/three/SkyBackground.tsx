import { lazy, Suspense, useMemo } from 'react'
import { useCalmMode } from '../../context/CalmModeContext'

const SkyScene = lazy(() => import('./SkyScene').then((m) => ({ default: m.SkyScene })))

function canUse3D() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Fondo 3D fijo detrás de la página. No recibe clics ni lo leen los lectores de pantalla. */
export function SkyBackground({ density }: { density?: number }) {
  const { calmMode } = useCalmMode()
  const ok = useMemo(() => canUse3D(), [])
  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    [],
  )
  if (!ok) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-40 sm:opacity-60" aria-hidden>
      <Suspense fallback={null}>
        <SkyScene calm={calmMode || reduced} density={density} />
      </Suspense>
    </div>
  )
}
