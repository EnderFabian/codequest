import { ArrowRight, Blocks, HeartHandshake, LineChart, Puzzle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HeroVisual } from '../components/landing/HeroVisual'
import { Button } from '../components/ui/Button'
import { Surface } from '../components/ui/Surface'
import { useCalmMode } from '../context/CalmModeContext'

const roles = [
  {
    icon: Puzzle,
    title: 'Estudiante',
    text: 'Mapa de retos, bloques visuales y estrellas. Simple, predecible y motivador.',
    tone: 'bg-primary-soft text-primary',
  },
  {
    icon: HeartHandshake,
    title: 'Padre o cuidador',
    text: 'Sigue el avance, el tiempo de uso y comparte con otras familias.',
    tone: 'bg-secondary-soft text-secondary',
  },
  {
    icon: LineChart,
    title: 'Profesional',
    text: 'Monitorea intentos, tiempos y compara pretest / postest con reportes.',
    tone: 'bg-accent-soft text-ink',
  },
] as const

export function LandingPage() {
  const { calmMode } = useCalmMode()

  return (
    <main>
      {/* Hero: una sola composición — marca + mensaje + CTA + visual dominante */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:py-16">
          <div className="text-left">
            <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-primary">
              CodeQuest
            </p>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl">
              Pensamiento lógico, paso a paso, a tu ritmo
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-muted">
              Plataforma inclusiva de programación por bloques para niños, niñas y adolescentes
              con TEA. Colorida, calmada y diseñada para aprender sin sobrecarga.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/entrar" className="no-underline">
                <Button variant="primary" size="lg" aria-label="Empezar en CodeQuest">
                  Empezar
                  <ArrowRight size={20} aria-hidden />
                </Button>
              </Link>
              <a href="#como-funciona" className="no-underline">
                <Button variant="ghost" size="lg">
                  Cómo funciona
                </Button>
              </a>
            </div>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <HeroVisual calm={calmMode} />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-14" aria-labelledby="como-titulo">
        <h2 id="como-titulo" className="text-left text-3xl font-extrabold text-ink">
          Cómo funciona
        </h2>
        <p className="mt-2 max-w-2xl text-left text-ink-muted">
          Un camino claro: diagnóstico corto, retos con Blockly y seguimiento para familias y
          profesionales.
        </p>

        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              n: '1',
              title: 'Prueba diagnóstica',
              desc: 'Una batería corta establece el nivel inicial de pensamiento lógico.',
            },
            {
              n: '2',
              title: 'Retos por bloques',
              desc: 'Secuencias, condicionales y bucles con feedback amable e intentos ilimitados.',
            },
            {
              n: '3',
              title: 'Progreso visible',
              desc: 'Estrellas, mapa de niveles y datos útiles para acompañar el aprendizaje.',
            },
          ].map((step) => (
            <li key={step.n} className="list-none">
              <Surface className="h-full text-left">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-lg font-extrabold text-white"
                  aria-hidden
                >
                  {step.n}
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-ink">{step.title}</h3>
                <p className="mt-2 text-ink-muted">{step.desc}</p>
              </Surface>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-6 pb-16" aria-labelledby="roles-titulo">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="text-left">
            <h2 id="roles-titulo" className="text-3xl font-extrabold text-ink">
              Tres espacios, un mismo camino
            </h2>
            <p className="mt-2 max-w-xl text-ink-muted">
              Cada rol ve solo lo que necesita. Menos ruido, más claridad.
            </p>
          </div>
          <Blocks className="hidden text-primary sm:block" size={36} aria-hidden />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {roles.map(({ icon: Icon, title, text, tone }) => (
            <Surface key={title} className="text-left" as="article">
              <span className={`inline-flex rounded-2xl p-3 ${tone}`} aria-hidden>
                <Icon size={26} />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-ink">{title}</h3>
              <p className="mt-2 text-ink-muted">{text}</p>
            </Surface>
          ))}
        </div>
      </section>

      <section className="border-t border-border/80 bg-surface/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-left">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              Lista para el aprendizaje calmado
            </h2>
            <p className="mt-2 max-w-xl text-ink-muted">
              Activa el Modo Calma cuando lo necesites. Menos animación, colores más suaves, misma
              claridad.
            </p>
          </div>
          <Link to="/entrar" className="no-underline">
            <Button variant="secondary" size="lg">
              Crear cuenta
              <ArrowRight size={20} aria-hidden />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-6 text-center text-sm text-ink-muted">
        CodeQuest · Universidad Libre Seccional Cúcuta · Ingeniería en TIC
      </footer>
    </main>
  )
}
