import { EventEmitter } from 'events'
import type { Phase, PhaseEnd, Status, TimerSettings, TimerState } from '../shared/timer'

const TICK_MS = 250

/**
 * Pomodoro que vive en el proceso principal, así sigue corriendo aunque la ventana esté cerrada.
 *
 * No cuenta segundos: guarda la hora a la que termina la fase (`endAt`) y en cada tick la compara
 * con el reloj. Así no se desfasa si la compu se traba o la ventana queda en segundo plano.
 *
 * Eventos:
 * - `state` (TimerState): cada vez que cambia algo visible (como mucho una vez por segundo).
 * - `phase-end` (PhaseEnd): cuando una fase que había arrancado termina, se salta o se reinicia.
 */
export class PomodoroTimer extends EventEmitter {
  private phase: Phase = 'focus'
  private status: Status = 'idle'
  private durationMs: number
  private remainingMs: number
  private endAt = 0
  private startedAt: number | null = null
  private focusCount = 0
  private ticker: NodeJS.Timeout | null = null
  private lastShownSecond = -1

  constructor(private settings: TimerSettings) {
    super()
    this.durationMs = this.durationOf(this.phase)
    this.remainingMs = this.durationMs
  }

  getState(): TimerState {
    return {
      phase: this.phase,
      status: this.status,
      remainingMs: this.currentRemaining(),
      durationMs: this.durationMs,
      focusCount: this.focusCount,
      longBreakEvery: this.settings.longBreakEvery
    }
  }

  start(): void {
    if (this.status === 'running') return
    this.startedAt ??= Date.now()
    this.endAt = Date.now() + this.remainingMs
    this.status = 'running'
    this.ticker = setInterval(() => this.tick(), TICK_MS)
    this.emitState()
  }

  pause(): void {
    if (this.status !== 'running') return
    this.remainingMs = this.currentRemaining()
    this.status = 'paused'
    this.stopTicker()
    this.emitState()
  }

  toggle(): void {
    if (this.status === 'running') this.pause()
    else this.start()
  }

  /** Corta la fase actual y pasa a la siguiente, sin arrancarla. */
  skip(): void {
    this.finish(false)
  }

  /** Vuelve la fase actual al principio. Si ya había arrancado, avisa cuánto se llegó a hacer. */
  reset(): void {
    this.emitPhaseEnd(false, this.phase)
    this.goTo(this.phase)
    this.emitState()
  }

  updateSettings(settings: TimerSettings): void {
    this.settings = settings
    // Una fase en curso conserva su duración; la nueva se aplica desde la próxima.
    if (this.startedAt === null) this.goTo(this.phase)
    this.emitState()
  }

  /** Lo llama el intervalo; es público para poder testearlo. */
  tick(): void {
    if (this.status !== 'running') return
    if (this.currentRemaining() <= 0) this.finish(true)
    else this.emitState(true)
  }

  dispose(): void {
    this.stopTicker()
    this.removeAllListeners()
  }

  private finish(completed: boolean): void {
    if (completed && this.phase === 'focus') this.focusCount++
    const next = this.nextPhase(completed)
    this.emitPhaseEnd(completed, next)
    this.goTo(next)

    const autoStart = next === 'focus' ? this.settings.autoStartFocus : this.settings.autoStartBreaks
    if (completed && autoStart) this.start()
    else this.emitState()
  }

  private nextPhase(completed: boolean): Phase {
    if (this.phase !== 'focus') return 'focus'
    const cycleDone = completed && this.focusCount % this.settings.longBreakEvery === 0
    return cycleDone ? 'longBreak' : 'shortBreak'
  }

  /** Deja el timer quieto al principio de la fase indicada. */
  private goTo(phase: Phase): void {
    this.stopTicker()
    this.phase = phase
    this.status = 'idle'
    this.startedAt = null
    this.durationMs = this.durationOf(phase)
    this.remainingMs = this.durationMs
  }

  private emitPhaseEnd(completed: boolean, next: Phase): void {
    if (this.startedAt === null) return // la fase ni había arrancado: no hay nada que contar
    const end: PhaseEnd = {
      phase: this.phase,
      completed,
      elapsedMs: this.durationMs - this.currentRemaining(),
      startedAt: this.startedAt,
      endedAt: Date.now(),
      next
    }
    this.emit('phase-end', end)
  }

  private emitState(onlyOnNewSecond = false): void {
    const second = Math.ceil(this.currentRemaining() / 1000)
    if (onlyOnNewSecond && second === this.lastShownSecond) return
    this.lastShownSecond = second
    this.emit('state', this.getState())
  }

  private currentRemaining(): number {
    return this.status === 'running' ? Math.max(0, this.endAt - Date.now()) : this.remainingMs
  }

  private durationOf(phase: Phase): number {
    const minutes = {
      focus: this.settings.focusMinutes,
      shortBreak: this.settings.shortBreakMinutes,
      longBreak: this.settings.longBreakMinutes
    }[phase]
    return Math.round(minutes * 60_000)
  }

  private stopTicker(): void {
    if (this.ticker) clearInterval(this.ticker)
    this.ticker = null
  }
}
