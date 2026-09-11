import { useState } from 'react'
import type { AppConfig, AppInfo } from '../../../shared/config'
import type { TimerSettings } from '../../../shared/timer'

type NumberSetting = 'focusMinutes' | 'shortBreakMinutes' | 'longBreakMinutes' | 'longBreakEvery'

const NUMBER_FIELDS: { key: NumberSetting; label: string; min: number; max: number }[] = [
  { key: 'focusMinutes', label: 'Foco (min)', min: 1, max: 180 },
  { key: 'shortBreakMinutes', label: 'Descanso corto (min)', min: 1, max: 60 },
  { key: 'longBreakMinutes', label: 'Descanso largo (min)', min: 1, max: 120 },
  { key: 'longBreakEvery', label: 'Descanso largo cada (focos)', min: 1, max: 12 }
]

interface Props {
  config: AppConfig
  info: AppInfo
  onConfigChange(config: AppConfig): void
  onClose(): void
}

export default function Settings({
  config,
  info,
  onConfigChange,
  onClose
}: Props): React.JSX.Element {
  const [timer, setTimer] = useState<TimerSettings>(config.timer)
  const [vaultError, setVaultError] = useState<string | null>(null)

  const usingTestVault = info.testVaultPath !== null && config.vaultPath === info.testVaultPath

  const chooseVault = async (): Promise<void> => {
    const result = await window.api.vault.choose()
    if (!result) return
    if ('error' in result) {
      setVaultError(result.error)
      return
    }
    setVaultError(null)
    onConfigChange(await window.api.config.get())
  }

  const useTestVault = async (): Promise<void> => {
    if (!info.testVaultPath) return
    setVaultError(null)
    onConfigChange(await window.api.config.update({ vaultPath: info.testVaultPath }))
  }

  const save = async (): Promise<void> => {
    // Si un número quedó vacío o fuera de rango, lo llevamos al límite más cercano.
    const clamped = { ...timer }
    for (const { key, min, max } of NUMBER_FIELDS) {
      clamped[key] = Math.min(max, Math.max(min, Math.round(timer[key]) || min))
    }
    onConfigChange(await window.api.config.update({ timer: clamped }))
    onClose()
  }

  return (
    <section className="settings">
      <header>
        <h2>Ajustes</h2>
        <button className="link" onClick={onClose}>
          Volver
        </button>
      </header>

      <h3>Vault de Obsidian</h3>
      <p className="path">{config.vaultPath ?? 'Sin elegir'}</p>
      {usingTestVault && (
        <p className="note">
          Es el vault de prueba del proyecto: podés romper lo que quieras. Cuando confíes en la
          app, elegí tu vault real.
        </p>
      )}
      {vaultError && <p className="note error">{vaultError}</p>}
      <div className="row">
        <button className="button-soft" onClick={chooseVault}>
          Elegir carpeta…
        </button>
        {info.testVaultPath && !usingTestVault && (
          <button className="link" onClick={useTestVault}>
            Volver al vault de prueba
          </button>
        )}
      </div>

      <h3>Pomodoro</h3>
      {info.fastMode && (
        <p className="note">
          Modo rápido activo: hasta que lo cierres se usan 1 min de foco y descansos de 15 y 30 s.
        </p>
      )}
      <div className="grid">
        {NUMBER_FIELDS.map(({ key, label, min, max }) => (
          <label key={key} className="field">
            <span>{label}</span>
            <input
              type="number"
              min={min}
              max={max}
              value={timer[key]}
              onChange={(event) => setTimer({ ...timer, [key]: Number(event.target.value) })}
            />
          </label>
        ))}
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={timer.autoStartBreaks}
          onChange={(event) => setTimer({ ...timer, autoStartBreaks: event.target.checked })}
        />
        El descanso arranca solo al terminar el foco
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={timer.autoStartFocus}
          onChange={(event) => setTimer({ ...timer, autoStartFocus: event.target.checked })}
        />
        El foco arranca solo al terminar el descanso
      </label>

      <button className="primary" onClick={save}>
        Guardar
      </button>
    </section>
  )
}
