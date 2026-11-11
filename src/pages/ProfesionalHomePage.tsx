import { Link } from 'react-router-dom'
import { AdminTimePanel } from '../components/admin/AdminTimePanel'
import { StudentReport } from '../components/family/StudentReport'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { challengeLabel, pullCompanionReport } from '../lib/companionReport'

export function ProfesionalHomePage() {
  const { user } = useAuth()

  async function exportCsv() {
    const report = await pullCompanionReport()
    const header = 'estudiante,reto,resultado,intentos,tiempo_seg,fecha\n'
    const body = report.students
      .flatMap((student) =>
        student.attempts.map((item) =>
          [
            student.nombre,
            challengeLabel(item.challengeId),
            item.aciertos ? 'logrado' : 'pendiente',
            item.numeroIntentos,
            item.tiempoResolucionSeg,
            item.fechaHora,
          ].join(','),
        ),
      )
      .join('\n')
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'codequest-avance.csv'
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
          <p className="mt-3 max-w-2xl text-lg text-ink-muted">
            Avance por habilidad, tiempo del día y partidas reales para decidir cómo apoyar.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void exportCsv()} aria-label="Exportar el avance a CSV">
          Exportar CSV
        </Button>
      </div>

      <StudentReport audience="profesional" />
      <AdminTimePanel />

      <Link to="/" className="mt-8 inline-block font-bold text-primary no-underline hover:underline">
        Ir al inicio
      </Link>
    </main>
  )
}
