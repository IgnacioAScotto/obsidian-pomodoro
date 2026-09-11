// Tipos del pomodoro que comparten el proceso principal y la interfaz.

export type Phase = 'focus' | 'shortBreak' | 'longBreak'
export type Status = 'idle' | 'running' | 'paused'

export interface TimerSettings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  /** Cada cuántos focos completos toca el descanso largo. */
  longBreakEvery: number
  /** Si el descanso arranca solo cuando termina un foco. */
  autoStartBreaks: boolean
  /** Si el foco arranca solo cuando termina un descanso. */
  autoStartFocus: boolean
}

export interface TimerState {
  phase: Phase
  status: Status
  /** Milisegundos que faltan para que termine la fase. */
  remainingMs: number
  /** Duración total de la fase actual, en milisegundos. */
  durationMs: number
  /** Focos completos desde que se abrió la app. */
  focusCount: number
  longBreakEvery: number
}

/** Se emite cuando una fase que había arrancado termina, se salta o se reinicia. */
export interface PhaseEnd {
  phase: Phase
  /** `true` si llegó a cero; `false` si se saltó o se reinició antes. */
  completed: boolean
  /** Tiempo efectivo de la fase, sin contar las pausas. */
  elapsedMs: number
  /** Cuándo arrancó la fase (epoch en ms). */
  startedAt: number
  endedAt: number
  /** La fase que viene después. */
  next: Phase
}

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
  autoStartBreaks: true,
  autoStartFocus: false
}

/** Duraciones cortitas para probar la app sin esperar 25 minutos (`npm run dev:rapido`). */
export const FAST_SETTINGS: TimerSettings = {
  ...DEFAULT_SETTINGS,
  focusMinutes: 1,
  shortBreakMinutes: 0.25,
  longBreakMinutes: 0.5
}

export const PHASE_LABEL: Record<Phase, string> = {
  focus: 'Foco',
  shortBreak: 'Descanso corto',
  longBreak: 'Descanso largo'
}

/** `mm:ss`, redondeando para arriba: con 0,4 s restantes todavía muestra `00:01`. */
export function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
