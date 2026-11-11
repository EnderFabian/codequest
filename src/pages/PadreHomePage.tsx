import { Link } from 'react-router-dom'
import { StudentReport } from '../components/family/StudentReport'
import { useAuth } from '../context/AuthContext'

export function PadreHomePage() {
  const { user } = useAuth()

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="text-left">
        <p className="text-sm font-extrabold uppercase tracking-widest text-secondary">
          Portal de familias
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink">Hola, {user?.nombre}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-muted">
          Aquí ves cómo avanza, cuánto ha jugado hoy y en qué momento puedes acompañar.
        </p>
      </div>

      <StudentReport audience="familia" />

      <Link to="/" className="mt-8 inline-block font-bold text-primary no-underline hover:underline">
        Ir al inicio
      </Link>
    </main>
  )
}
