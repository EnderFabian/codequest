import { Leaf, LogOut, VolumeX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCalmMode } from '../../context/CalmModeContext'
import { ROLE_HOME, ROLE_LABELS } from '../../types/auth'
import { Button } from '../ui/Button'

export function Header() {
  const { calmMode, toggleCalmMode } = useCalmMode()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link
          to={user ? ROLE_HOME[user.rol] : '/'}
          className="flex items-center gap-3 rounded-2xl no-underline transition-calm hover:opacity-90"
          aria-label="CodeQuest — inicio"
        >
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={40} height={40} className="rounded-xl" />
          <span className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            CodeQuest
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Acciones principales">
          <Button
            variant={calmMode ? 'secondary' : 'ghost'}
            size="md"
            onClick={toggleCalmMode}
            aria-pressed={calmMode}
            aria-label={calmMode ? 'Desactivar Modo Calma' : 'Activar Modo Calma'}
            className="!min-h-10 !px-3 sm:!px-4"
          >
            {calmMode ? <VolumeX size={18} aria-hidden /> : <Leaf size={18} aria-hidden />}
            <span className="hidden sm:inline">Modo Calma</span>
          </Button>

          {user ? (
            <>
              <span className="hidden text-sm font-bold text-ink-muted md:inline">
                {user.nombre} · {ROLE_LABELS[user.rol]}
              </span>
              <Button
                variant="ghost"
                size="md"
                onClick={logout}
                aria-label="Cerrar sesión"
                className="!min-h-10 !px-3"
              >
                <LogOut size={18} aria-hidden />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </>
          ) : (
            <Link to="/entrar" className="no-underline">
              <Button variant="primary" size="md" className="!min-h-10">
                Entrar
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
