import { Link } from 'react-router-dom'
import { Surface } from '../components/ui/Surface'
import { useAuth } from '../context/AuthContext'

export function PadreHomePage() {
  const { user } = useAuth()

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="text-left">
        <p className="text-sm font-extrabold uppercase tracking-widest text-secondary">
          Portal de familias
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink">Hola, {user?.nombre}</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-muted">
          Seguimiento simple del progreso de tu hijo/a. Las gráficas completas llegan con el módulo
          de dashboards.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {[
          { label: 'Estrellas', value: '12' },
          { label: 'Retos hechos', value: '4' },
          { label: 'Tiempo esta semana', value: '48 min' },
        ].map((stat) => (
          <Surface key={stat.label} className="text-left">
            <p className="text-sm font-bold text-ink-muted">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-ink">{stat.value}</p>
          </Surface>
        ))}
      </div>

      <Surface className="mt-5 text-left">
        <h2 className="text-xl font-extrabold text-ink">Hijo/a vinculado/a</h2>
        <p className="mt-2 text-ink-muted">
          En la demo, Ana está vinculada con Luna (estudiante). Más adelante conectarás cuentas
          reales.
        </p>
      </Surface>

      <Link to="/" className="mt-8 inline-block font-bold text-primary no-underline hover:underline">
        Ir al inicio
      </Link>
    </main>
  )
}
