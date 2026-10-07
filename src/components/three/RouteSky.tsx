import { useLocation } from 'react-router-dom'
import { SkyBackground } from './SkyBackground'

/** Fondo 3D en todas las pantallas menos dentro de un reto (ahí ya está el tablero 3D). */
export function RouteSky() {
  const { pathname } = useLocation()
  if (pathname.includes('/reto/')) return null
  return <SkyBackground />
}
