// Cuentas para las estadísticas: todo función pura, así se testea sin abrir la app.
import type { Ambito, LogEntry } from './config'

export type Period = 'week' | 'month' | 'year'
export type AmbitoFilter = Ambito | 'todo'

/** Intervalo `[start, end)` en epoch ms, con su nombre para mostrar. */
export interface Range {
  start: number
  end: number
  label: string
}

export interface MateriaTotal {
  materia: string
  ambito: Ambito
  minutos: number
}

export interface Bucket {
  label: string
  minutos: number
}

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
]
const MONTHS_SHORT = MONTHS.map((month) => month.slice(0, 3))
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/**
 * El período que contiene a `reference`, corrido `offset` períodos (-1 = el anterior).
 * La semana va de lunes a domingo, como la cursada.
 */
export function periodRange(period: Period, reference: number, offset = 0): Range {
  const ref = new Date(reference)
  const year = ref.getFullYear()
  const month = ref.getMonth()

  if (period === 'week') {
    const monday = ref.getDate() - ((ref.getDay() + 6) % 7) + offset * 7
    const first = new Date(year, month, monday)
    const last = new Date(year, month, monday + 6)
    return {
      start: first.getTime(),
      end: new Date(year, month, monday + 7).getTime(),
      label: `${first.getDate()} ${MONTHS_SHORT[first.getMonth()]} – ${last.getDate()} ${MONTHS_SHORT[last.getMonth()]} ${last.getFullYear()}`
    }
  }

  if (period === 'month') {
    const first = new Date(year, month + offset, 1)
    return {
      start: first.getTime(),
      end: new Date(year, month + offset + 1, 1).getTime(),
      label: `${MONTHS[first.getMonth()]} ${first.getFullYear()}`
    }
  }

  return {
    start: new Date(year + offset, 0, 1).getTime(),
    end: new Date(year + offset + 1, 0, 1).getTime(),
    label: String(year + offset)
  }
}

export function filterEntries(entries: LogEntry[], range: Range, ambito: AmbitoFilter): LogEntry[] {
  return entries.filter(
    (e) =>
      e.startedAt >= range.start &&
      e.startedAt < range.end &&
      (ambito === 'todo' || e.ambito === ambito)
  )
}

export function totalMinutes(entries: LogEntry[]): number {
  return entries.reduce((total, e) => total + e.minutos, 0)
}

/** Minutos por materia, de la que más a la que menos. */
export function totalsByMateria(entries: LogEntry[]): MateriaTotal[] {
  const totals = new Map<string, MateriaTotal>()
  for (const e of entries) {
    const key = `${e.ambito}|${e.materia}`
    const total = totals.get(key) ?? { materia: e.materia, ambito: e.ambito, minutos: 0 }
    total.minutos += e.minutos
    totals.set(key, total)
  }
  return [...totals.values()].sort(
    (a, b) => b.minutos - a.minutos || a.materia.localeCompare(b.materia, 'es')
  )
}

/** Minutos repartidos en días (semana y mes) o en meses (año), para el gráfico de barras. */
export function timeline(entries: LogEntry[], period: Period, range: Range): Bucket[] {
  const first = new Date(range.start)
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const labels =
    period === 'week'
      ? WEEKDAYS
      : period === 'month'
        ? Array.from({ length: daysInMonth }, (_, i) => String(i + 1))
        : MONTHS_SHORT
  const buckets = labels.map((label) => ({ label, minutos: 0 }))

  for (const e of entries) {
    if (e.startedAt < range.start || e.startedAt >= range.end) continue
    const d = new Date(e.startedAt)
    const index =
      period === 'week' ? (d.getDay() + 6) % 7 : period === 'month' ? d.getDate() - 1 : d.getMonth()
    buckets[index].minutos += e.minutos
  }
  return buckets
}

/** `45 min`, `2 h`, `3 h 25 min`. */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60)
  const minutes = Math.round(total % 60)
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}
