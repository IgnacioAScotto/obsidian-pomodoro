import { describe, expect, it } from 'vitest'
import type { LogEntry } from '../src/shared/config'
import {
  filterEntries,
  formatMinutes,
  periodRange,
  timeline,
  totalMinutes,
  totalsByMateria
} from '../src/shared/stats'
import { at } from './helpers'

// Jueves 10 de septiembre de 2026.
const HOY = at(2026, 9, 10, 20, 0)

const entry = (startedAt: number, patch: Partial<LogEntry> = {}): LogEntry => ({
  startedAt,
  ambito: 'facultad',
  materia: 'Objetos II',
  tema: '',
  minutos: 25,
  ...patch
})

describe('periodRange', () => {
  it('la semana va de lunes a domingo', () => {
    expect(periodRange('week', HOY)).toEqual({
      start: at(2026, 9, 7),
      end: at(2026, 9, 14),
      label: '7 sep – 13 sep 2026'
    })
  })

  it('se puede ir a la semana anterior, aunque cambie el mes', () => {
    expect(periodRange('week', HOY, -1)).toMatchObject({
      start: at(2026, 8, 31),
      label: '31 ago – 6 sep 2026'
    })
  })

  it('mes y año, también hacia atrás', () => {
    expect(periodRange('month', HOY)).toEqual({
      start: at(2026, 9, 1),
      end: at(2026, 10, 1),
      label: 'septiembre 2026'
    })
    expect(periodRange('month', HOY, -9).label).toBe('diciembre 2025')
    expect(periodRange('year', HOY, -1)).toEqual({
      start: at(2025, 1, 1),
      end: at(2026, 1, 1),
      label: '2025'
    })
  })
})

describe('cuentas', () => {
  const entries = [
    entry(at(2026, 9, 6, 22, 0)), // domingo de la semana anterior
    entry(at(2026, 9, 7, 19, 0)),
    entry(at(2026, 9, 7, 19, 30), { materia: 'Matemática II', minutos: 50 }),
    entry(at(2026, 9, 10, 18, 0), { ambito: 'autoestudio', materia: 'Inglés', minutos: 15 }),
    entry(at(2026, 9, 13, 23, 59))
  ]
  const week = periodRange('week', HOY)

  it('filtra por período y por ámbito', () => {
    expect(filterEntries(entries, week, 'todo')).toHaveLength(4)
    expect(filterEntries(entries, week, 'facultad')).toHaveLength(3)
    expect(filterEntries(entries, week, 'autoestudio')).toHaveLength(1)
  })

  it('suma por materia, de la que más a la que menos', () => {
    const inWeek = filterEntries(entries, week, 'todo')
    expect(totalMinutes(inWeek)).toBe(115)
    expect(totalsByMateria(inWeek)).toEqual([
      { materia: 'Matemática II', ambito: 'facultad', minutos: 50 },
      { materia: 'Objetos II', ambito: 'facultad', minutos: 50 },
      { materia: 'Inglés', ambito: 'autoestudio', minutos: 15 }
    ])
  })

  it('reparte la semana en días de lunes a domingo', () => {
    expect(timeline(entries, 'week', week).map((b) => b.minutos)).toEqual([75, 0, 0, 15, 0, 0, 25])
  })

  it('el mes tiene un casillero por día y el año uno por mes', () => {
    const month = timeline(entries, 'month', periodRange('month', HOY))
    expect(month).toHaveLength(30)
    expect(month[5]).toEqual({ label: '6', minutos: 25 })

    const year = timeline(entries, 'year', periodRange('year', HOY))
    expect(year).toHaveLength(12)
    expect(year[8]).toEqual({ label: 'sep', minutos: 140 })
  })
})

describe('formatMinutes', () => {
  it('muestra horas y minutos', () => {
    expect(formatMinutes(0)).toBe('0 min')
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(120)).toBe('2 h')
    expect(formatMinutes(205)).toBe('3 h 25 min')
  })
})
