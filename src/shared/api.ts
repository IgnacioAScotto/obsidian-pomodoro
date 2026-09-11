import type { PhaseEnd, TimerState } from './timer'

/**
 * Lo que la interfaz puede pedirle al proceso principal (`window.api`).
 * La implementación está en `src/preload/index.ts`.
 */
export interface Api {
  timer: {
    getState(): Promise<TimerState>
    toggle(): void
    skip(): void
    reset(): void
    /** Devuelve la función para dejar de escuchar. */
    onState(callback: (state: TimerState) => void): () => void
    onPhaseEnd(callback: (end: PhaseEnd) => void): () => void
  }
}
