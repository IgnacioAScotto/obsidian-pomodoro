import { useEffect } from 'react'
import { formatTime, PHASE_LABEL, type TimerState } from '../../../shared/timer'

const RADIUS = 120
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Cuántos puntitos del ciclo (foco, foco, foco, foco → descanso largo) van pintados. */
function focusDotsDone(state: TimerState): number {
  const inCycle = state.focusCount % state.longBreakEvery
  const cycleJustEnded = state.phase === 'longBreak' && inCycle === 0 && state.focusCount > 0
  return cycleJustEnded ? state.longBreakEvery : inCycle
}

/** Si estás escribiendo en un campo, la barra espaciadora escribe un espacio y no toca el timer. */
function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches('input, textarea, select'))
  )
}

interface Props {
  state: TimerState
  /** Si no es `null`, no se puede arrancar un foco y se muestra este motivo. */
  blockedReason: string | null
}

export default function Timer({ state, blockedReason }: Props): React.JSX.Element {
  const startBlocked = blockedReason !== null && state.phase === 'focus' && state.status === 'idle'

  // Barra espaciadora: iniciar / pausar.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.code !== 'Space' || event.repeat || isTyping(event.target)) return
      event.preventDefault()
      if (!startBlocked) window.api.timer.toggle()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [startBlocked])

  const progress = state.durationMs > 0 ? 1 - state.remainingMs / state.durationMs : 0
  const dotsDone = focusDotsDone(state)
  const mainLabel =
    state.status === 'running' ? 'Pausar' : state.status === 'paused' ? 'Reanudar' : 'Iniciar'

  // Después de un clic el botón pierde el foco, así la barra espaciadora no lo vuelve a apretar.
  const clickThen =
    (action: () => void) =>
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      event.currentTarget.blur()
      action()
    }

  return (
    <section className={`timer phase-${state.phase} status-${state.status}`}>
      <p className="phase-label">{PHASE_LABEL[state.phase]}</p>

      <div className="ring">
        <svg viewBox="0 0 280 280" aria-hidden="true">
          <circle className="ring-track" cx="140" cy="140" r={RADIUS} />
          <circle
            className="ring-progress"
            cx="140"
            cy="140"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            transform="rotate(-90 140 140)"
          />
        </svg>
        <span className="time">{formatTime(state.remainingMs)}</span>
      </div>

      <div className="dots" title={`${dotsDone} de ${state.longBreakEvery} focos del ciclo`}>
        {Array.from({ length: state.longBreakEvery }, (_, i) => (
          <span key={i} className={i < dotsDone ? 'dot done' : 'dot'} />
        ))}
      </div>

      <div className="controls">
        <button
          className="secondary"
          onClick={clickThen(window.api.timer.reset)}
          title="Reiniciar la fase"
        >
          ↺
        </button>
        <button
          className="primary"
          onClick={clickThen(window.api.timer.toggle)}
          disabled={startBlocked}
        >
          {mainLabel}
        </button>
        <button
          className="secondary"
          onClick={clickThen(window.api.timer.skip)}
          title="Saltar a la siguiente fase"
        >
          ⏭
        </button>
      </div>

      <p className={startBlocked ? 'hint warning' : 'hint'}>
        {startBlocked ? blockedReason : 'Espacio para iniciar o pausar'}
      </p>
    </section>
  )
}
