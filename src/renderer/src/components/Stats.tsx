import { useEffect, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { LogEntry } from '../../../shared/config'
import {
  filterEntries,
  formatMinutes,
  periodRange,
  timeline,
  totalMinutes,
  totalsByMateria,
  type AmbitoFilter,
  type Period
} from '../../../shared/stats'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'year', label: 'Año' }
]

const AMBITOS: { id: AmbitoFilter; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'facultad', label: 'Facultad' },
  { id: 'autoestudio', label: 'Por mi cuenta' }
]

const TIMELINE_TITLE: Record<Period, string> = {
  week: 'Por día',
  month: 'Por día del mes',
  year: 'Por mes'
}

// Colores de Catppuccin; cada materia recibe siempre el mismo.
const PALETTE = ['#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#94e2d5', '#89b4fa', '#cba6f7', '#f5c2e7']
const AXIS_TICK = { fill: '#a6adc8', fontSize: 11 }

function colorFor(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

function hoursTick(minutes: number): string {
  return minutes >= 60 ? `${+(minutes / 60).toFixed(1)}h` : `${minutes}m`
}

interface Props {
  vaultOk: boolean
}

export default function Stats({ vaultOk }: Props): React.JSX.Element {
  const [entries, setEntries] = useState<LogEntry[] | null>(null)
  const [period, setPeriod] = useState<Period>('week')
  const [offset, setOffset] = useState(0)
  const [ambito, setAmbito] = useState<AmbitoFilter>('todo')

  useEffect(() => {
    const load = (): void => {
      window.api.log.entries().then(setEntries)
    }
    load()
    // Se actualiza al volver a la ventana (por si corregiste algo en Obsidian) y al guardar un foco.
    window.addEventListener('focus', load)
    const offSaved = window.api.log.onSaved(load)
    return () => {
      window.removeEventListener('focus', load)
      offSaved()
    }
  }, [])

  if (!vaultOk) {
    return (
      <section className="stats">
        <p className="empty">Elegí tu vault en ⚙ para ver las estadísticas.</p>
      </section>
    )
  }
  if (!entries) return <section className="stats" />

  const range = periodRange(period, Date.now(), offset)
  const inRange = filterEntries(entries, range, ambito)
  const total = totalMinutes(inRange)
  const totals = totalsByMateria(inRange)
  const maxMinutes = totals[0]?.minutos ?? 0
  const buckets = timeline(inRange, period, range)

  const changePeriod = (next: Period): void => {
    setPeriod(next)
    setOffset(0)
  }

  return (
    <section className="stats">
      <div className="segmented three">
        {PERIODS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={id === period ? 'active' : ''}
            onClick={() => changePeriod(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="period-nav">
        <button className="icon-button" onClick={() => setOffset(offset - 1)} title="Anterior">
          ‹
        </button>
        <span>{range.label}</span>
        <button
          className="icon-button"
          onClick={() => setOffset(offset + 1)}
          disabled={offset >= 0}
          title="Siguiente"
        >
          ›
        </button>
      </div>

      <div className="segmented three small">
        {AMBITOS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={id === ambito ? 'active' : ''}
            onClick={() => setAmbito(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="total">
        <span className="total-time">{formatMinutes(total)}</span>
        <span className="total-sub">
          {inRange.length} {inRange.length === 1 ? 'foco' : 'focos'}
        </span>
      </div>

      {totals.length === 0 ? (
        <p className="empty">No hay focos registrados en este período.</p>
      ) : (
        <>
          <h3>Por materia</h3>
          <ul className="bars">
            {totals.map((t) => (
              <li key={`${t.ambito}|${t.materia}`}>
                <div className="bar-label">
                  <span>{t.materia}</span>
                  <span>
                    {formatMinutes(t.minutos)} · {Math.round((t.minutos / total) * 100)} %
                  </span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(t.minutos / maxMinutes) * 100}%`,
                      background: colorFor(t.materia)
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <h3>{TIMELINE_TITLE[period]}</h3>
          <div className="chart">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={buckets} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  interval={period === 'month' ? 4 : 0}
                />
                <YAxis
                  width={36}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickFormatter={hoursTick}
                />
                <Tooltip
                  cursor={{ fill: '#313244' }}
                  contentStyle={{ background: '#181825', border: 'none', borderRadius: 8 }}
                  labelStyle={{ color: '#cdd6f4' }}
                  itemStyle={{ color: '#f38ba8' }}
                  formatter={(value) => [formatMinutes(Number(value)), 'Estudio']}
                />
                <Bar dataKey="minutos" fill="#f38ba8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  )
}
