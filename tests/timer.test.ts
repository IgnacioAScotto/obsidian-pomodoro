import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PomodoroTimer } from '../src/main/timer'
import { DEFAULT_SETTINGS, type PhaseEnd, type TimerSettings } from '../src/shared/timer'

const MIN = 60_000

function makeTimer(overrides: Partial<TimerSettings> = {}): {
  timer: PomodoroTimer
  ends: PhaseEnd[]
} {
  const timer = new PomodoroTimer({ ...DEFAULT_SETTINGS, ...overrides })
  const ends: PhaseEnd[] = []
  timer.on('phase-end', (end: PhaseEnd) => ends.push(end))
  return { timer, ends }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-10T19:00:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PomodoroTimer', () => {
  it('arranca en foco, quieto, con 25 minutos', () => {
    const { timer } = makeTimer()
    expect(timer.getState()).toMatchObject({
      phase: 'focus',
      status: 'idle',
      remainingMs: 25 * MIN,
      focusCount: 0
    })
  })

  it('termina el foco a los 25 minutos y avisa cuánto duró', () => {
    const { timer, ends } = makeTimer()
    timer.start()
    vi.advanceTimersByTime(10 * MIN)
    expect(timer.getState().remainingMs).toBe(15 * MIN)

    vi.advanceTimersByTime(15 * MIN)
    expect(ends).toHaveLength(1)
    expect(ends[0]).toMatchObject({
      phase: 'focus',
      completed: true,
      elapsedMs: 25 * MIN,
      startedAt: new Date('2026-09-10T19:00:00').getTime(),
      next: 'shortBreak'
    })
  })

  it('las pausas no cuentan como tiempo de foco', () => {
    const { timer, ends } = makeTimer()
    timer.start()
    vi.advanceTimersByTime(5 * MIN)
    timer.pause()
    vi.advanceTimersByTime(30 * MIN)
    expect(timer.getState()).toMatchObject({ status: 'paused', remainingMs: 20 * MIN })

    timer.start()
    vi.advanceTimersByTime(20 * MIN)
    expect(ends[0]).toMatchObject({ completed: true, elapsedMs: 25 * MIN })
  })

  it('el descanso arranca solo, pero el foco siguiente espera a que lo inicies', () => {
    const { timer } = makeTimer()
    timer.start()
    vi.advanceTimersByTime(25 * MIN)
    expect(timer.getState()).toMatchObject({ phase: 'shortBreak', status: 'running' })

    vi.advanceTimersByTime(5 * MIN)
    expect(timer.getState()).toMatchObject({ phase: 'focus', status: 'idle' })
  })

  it('después de 4 focos completos toca el descanso largo', () => {
    const { timer } = makeTimer()
    for (let i = 0; i < 3; i++) {
      timer.start()
      vi.advanceTimersByTime(25 * MIN) // foco
      vi.advanceTimersByTime(5 * MIN) // descanso corto
    }
    timer.start()
    vi.advanceTimersByTime(25 * MIN)
    expect(timer.getState()).toMatchObject({ phase: 'longBreak', focusCount: 4 })
  })

  it('saltar un foco lo informa como incompleto y no lo cuenta', () => {
    const { timer, ends } = makeTimer()
    timer.start()
    vi.advanceTimersByTime(10 * MIN)
    timer.skip()

    expect(ends[0]).toMatchObject({ phase: 'focus', completed: false, elapsedMs: 10 * MIN })
    expect(timer.getState()).toMatchObject({ phase: 'shortBreak', status: 'idle', focusCount: 0 })
  })

  it('saltar una fase que no arrancó no informa nada', () => {
    const { timer, ends } = makeTimer()
    timer.skip()
    expect(ends).toHaveLength(0)
    expect(timer.getState().phase).toBe('shortBreak')
  })

  it('reiniciar vuelve la fase al principio e informa lo que se llegó a hacer', () => {
    const { timer, ends } = makeTimer()
    timer.start()
    vi.advanceTimersByTime(7 * MIN)
    timer.reset()

    expect(ends[0]).toMatchObject({ phase: 'focus', completed: false, elapsedMs: 7 * MIN })
    expect(timer.getState()).toMatchObject({
      phase: 'focus',
      status: 'idle',
      remainingMs: 25 * MIN
    })
  })

  it('cambiar la configuración no altera una fase en curso', () => {
    const { timer, ends } = makeTimer()
    timer.start()
    vi.advanceTimersByTime(5 * MIN)
    timer.updateSettings({ ...DEFAULT_SETTINGS, focusMinutes: 50 })
    vi.advanceTimersByTime(20 * MIN)
    expect(ends[0]).toMatchObject({ completed: true, elapsedMs: 25 * MIN })
  })
})
