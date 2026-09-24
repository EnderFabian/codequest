import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Surface } from '../components/ui/Surface'
import { useAuth } from '../context/AuthContext'

const DEMO_ROWS = [
  { estudiante: 'Luna', reto: 'Secuencia 1', intentos: 2, tiempo: '45 s', acierto: 'Sí' },
  { estudiante: 'Luna', reto: 'Secuencia 2', intentos: 4, tiempo: '1 m 10 s', acierto: 'Sí' },
  { estudiante: 'Luna', reto: 'Condicional 1', intentos: 3, tiempo: '2 m 05 s', acierto: 'En curso' },
]

export function ProfesionalHomePage() {
  const { user } = useAuth()

  function exportCsv() {
    const header = 'estudiante,reto,intentos,tiempo,acierto\n'
    const body = DEMO_ROWS.map((r) =>
      [r.estudiante, r.reto, r.intentos, r.tiempo, r.acierto].join(','),
    ).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'codequest-intentos-demo.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 text-left">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">
            Panel profesional
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-ink">Hola, {user?.nombre}</h1>
          <p className="mt-3 max-w-xl text-lg text-ink-muted">
            Vista de monitoreo con datos de ejemplo. Luego se conectarán los intentos reales de
            Firestore.
          </p>
        </div>
        <Button variant="secondary" onClick={exportCsv} aria-label="Exportar tabla a CSV">
          Exportar CSV
        </Button>
      </div>

      <Surface className="mt-8 overflow-x-auto text-left" as="section">
        <h2 className="mb-4 text-xl font-extrabold text-ink">Intentos recientes</h2>
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-border text-sm text-ink-muted">
              <th className="py-3 pr-3 font-bold">Estudiante</th>
              <th className="py-3 pr-3 font-bold">Reto</th>
              <th className="py-3 pr-3 font-bold">Intentos</th>
              <th className="py-3 pr-3 font-bold">Tiempo</th>
              <th className="py-3 font-bold">Acierto</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ROWS.map((row) => (
              <tr key={`${row.estudiante}-${row.reto}`} className="border-b border-border/80">
                <td className="py-3 pr-3 font-bold text-ink">{row.estudiante}</td>
                <td className="py-3 pr-3 text-ink">{row.reto}</td>
                <td className="py-3 pr-3 text-ink">{row.intentos}</td>
                <td className="py-3 pr-3 text-ink">{row.tiempo}</td>
                <td className="py-3 text-ink">{row.acierto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Surface>

      <Link to="/" className="mt-8 inline-block font-bold text-primary no-underline hover:underline">
        Ir al inicio
      </Link>
    </main>
  )
}
