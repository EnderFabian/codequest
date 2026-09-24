import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ProgrammingRobot } from '../components/auth/ProgrammingRobot'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Surface } from '../components/ui/Surface'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOME, ROLE_LABELS, type UserRole } from '../types/auth'

const ROLES: UserRole[] = ['estudiante', 'padre', 'profesional']

export function LoginPage() {
  const { user, login, register, loginAsDemo } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [rol, setRol] = useState<UserRole>('estudiante')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={ROLE_HOME[user.rol]} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const logged = await login(email, password)
        navigate(ROLE_HOME[logged.rol])
      } else {
        const created = await register({ nombre, email, password, rol })
        navigate(ROLE_HOME[created.rol])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemo(demoRol: UserRole) {
    setError('')
    setLoading(true)
    try {
      await loginAsDemo(demoRol)
      navigate(ROLE_HOME[demoRol])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al entrar con demo')
    } finally {
      setLoading(false)
    }
  }

  const loginForm = (
    <Surface className="text-left">
      <p className="text-sm font-extrabold uppercase tracking-widest text-primary">CodeQuest</p>
      <h1 className="mt-2 text-3xl font-extrabold text-ink">
        {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </h1>
      <p className="mt-2 text-ink-muted">
        Elige tu rol y entra. También puedes usar una cuenta demo con un clic.
      </p>

      <div className="mt-5 flex gap-2" role="tablist" aria-label="Modo de acceso">
        <Button
          variant={mode === 'login' ? 'primary' : 'ghost'}
          className="flex-1"
          onClick={() => {
            setMode('login')
            setError('')
          }}
          aria-selected={mode === 'login'}
        >
          Entrar
        </Button>
        <Button
          variant={mode === 'register' ? 'primary' : 'ghost'}
          className="flex-1"
          onClick={() => {
            setMode('register')
            setError('')
          }}
          aria-selected={mode === 'register'}
        >
          Registrarme
        </Button>
      </div>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {mode === 'register' ? (
          <>
            <Input
              label="Nombre"
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
              autoComplete="name"
            />
            <fieldset>
              <legend className="mb-2 font-bold text-ink">Soy…</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRol(r)}
                    aria-pressed={rol === r}
                    className={[
                      'rounded-2xl border-2 px-3 py-3 text-sm font-bold transition-calm',
                      rol === r
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border bg-surface text-ink hover:border-primary',
                    ].join(' ')}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        ) : null}

        <Input
          label="Correo"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
          autoComplete="email"
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          hint={mode === 'login' ? 'Demo: codequest' : undefined}
        />

        {error ? (
          <p
            role="alert"
            className="rounded-2xl bg-alert-soft px-4 py-3 text-sm font-bold text-ink"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Un momento…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-6">
        <p className="mb-3 text-sm font-bold text-ink-muted">Entrar rápido (demo)</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {ROLES.map((r) => (
            <Button
              key={r}
              variant="ghost"
              className="w-full !px-2 !text-sm"
              disabled={loading}
              onClick={() => handleDemo(r)}
              aria-label={`Entrar como ${ROLE_LABELS[r]} demo`}
            >
              {ROLE_LABELS[r]}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          luna@codequest.demo · ana@codequest.demo · camilo@codequest.demo
          <br />
          Contraseña: <strong>codequest</strong>
        </p>
      </div>

      <Link to="/" className="mt-5 inline-block font-bold text-primary no-underline hover:underline">
        Volver al inicio
      </Link>
    </Surface>
  )

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center overflow-x-hidden px-5 py-10">
      <div className="grid w-full items-center gap-8 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:gap-14">
        <div className="mx-auto w-full max-w-xl lg:mx-0">{loginForm}</div>
        <ProgrammingRobot />
      </div>
    </main>
  )
}
