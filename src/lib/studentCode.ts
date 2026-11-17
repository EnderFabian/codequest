import { supabase } from './supabase'

export function normalizeStudentCode(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (compact.length !== 8) return null
  return `${compact.slice(0, 4)}-${compact.slice(4)}`
}

export async function linkStudentByCode(code: string) {
  if (!supabase) throw new Error('La nube no está configurada en este equipo.')
  const normal = normalizeStudentCode(code)
  if (!normal) throw new Error('El código tiene 8 letras o números, por ejemplo AB12-CD34.')

  const { data, error } = await supabase.rpc('vincular_por_codigo', { p_codigo: normal })
  if (error || !data?.length) {
    throw new Error('Ese código no corresponde a ningún estudiante.')
  }
  return { id: data[0].estudiante_id as string, nombre: data[0].nombre as string }
}
