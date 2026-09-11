import { useEffect, useState } from 'react'
import type { TimerState } from '../../shared/timer'
import { playChime } from './sound'

/** Estado del timer, sincronizado con el proceso principal. Suena la campanita al terminar cada fase. */
export function useTimerState(): TimerState | null {
  const [state, setState] = useState<TimerState | null>(null)

  useEffect(() => {
    window.api.timer.getState().then(setState)
    const offState = window.api.timer.onState(setState)
    const offEnd = window.api.timer.onPhaseEnd((end) => {
      if (end.completed) playChime()
    })
    return () => {
      offState()
      offEnd()
    }
  }, [])

  return state
}
