import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Surface } from '../ui/Surface'
import { linkStudentByCode } from '../../lib/studentCode'

type Audience = 'familia' | 'profesional'

export function LinkStudentForm({
  audience,
  onLinked,
}: {
  audience: Audience
  onLinked: (nombre: string) => void
}) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)
    try {
      const linked = await linkStudentByCode(codigo)
      setCodigo('')
      setNotice(`Listo. Ya puedes ver el avance de ${linked.nombre}.`)
      onLinked(linked.nombre)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo vincular.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Surface className="mt-8 text-left" as="section">
      <h2 className="text-xl font-extrabold text-ink">Vincular estudiante</h2>
      <p className="mt-2 max-w-2xl text-ink-muted">
        {audience === 'familia'
          ? 'Escribe el código que aparece en la cuenta del estudiante. Solo verás a quien vincules, no al resto.'
          : 'Escribe el código de cada estudiante. Puedes agregar a todos, uno por uno. Sin el código no aparece nadie.'}
      </p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
        <div className="w-full sm:max-w-xs">
          <Input
            label="Código del estudiante"
            name="codigo-estudiante"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value.toUpperCase())}
            placeholder="AB12-CD34"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            hint="Son 8 letras o números."
          />
        </div>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Un momento…' : 'Vincular'}
        </Button>
      </form>
      {notice ? (
        <p role="status" className="mt-3 font-bold text-ink">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 rounded-2xl bg-alert-soft px-4 py-3 text-sm font-bold text-ink">
          {error}
        </p>
      ) : null}
    </Surface>
  )
}
