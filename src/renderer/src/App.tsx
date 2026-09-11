import { useCallback, useEffect, useState } from 'react'
import type { AppConfig, AppInfo, Catalog, Selection } from '../../shared/config'
import { formatTime } from '../../shared/timer'
import Settings from './components/Settings'
import Stats from './components/Stats'
import SubjectPicker from './components/SubjectPicker'
import Timer from './components/Timer'
import { useTimerState } from './useTimerState'

type View = 'timer' | 'stats' | 'settings'

interface Toast {
  text: string
  error?: boolean
}

function vaultLabel(path: string | null, info: AppInfo): string {
  if (!path) return ''
  if (path === info.testVaultPath) return 'Vault de prueba'
  return path.split('/').filter(Boolean).pop() ?? path
}

function App(): React.JSX.Element {
  const timerState = useTimerState()
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [info, setInfo] = useState<AppInfo | null>(null)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [view, setView] = useState<View>('timer')
  const [toast, setToast] = useState<Toast | null>(null)

  const refreshCatalog = useCallback(() => {
    window.api.vault.catalog().then(setCatalog)
  }, [])

  useEffect(() => {
    window.api.config.get().then(setConfig)
    window.api.app.info().then(setInfo)
    refreshCatalog()

    // Si agregaste una materia en Obsidian, aparece cuando volvés a la ventana.
    window.addEventListener('focus', refreshCatalog)
    const offSaved = window.api.log.onSaved((saved) => {
      setToast({ text: `Guardado en Obsidian: ${saved.minutos} min de ${saved.materia}` })
      refreshCatalog()
    })
    const offError = window.api.log.onError((message) => {
      setToast({ text: `No se pudo guardar: ${message}`, error: true })
    })
    return () => {
      window.removeEventListener('focus', refreshCatalog)
      offSaved()
      offError()
    }
  }, [refreshCatalog])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(id)
  }, [toast])

  if (!timerState || !config || !info || !catalog) return <main className="app" />

  const changeSelection = (selection: Selection): void => {
    setConfig({ ...config, selection })
    window.api.config.update({ selection })
  }

  const changeConfig = (next: AppConfig): void => {
    setConfig(next)
    refreshCatalog()
  }

  // Primer uso de la app instalada: todavía no hay vault elegido.
  const chooseVault = async (): Promise<void> => {
    const result = await window.api.vault.choose()
    if (!result) return
    if ('error' in result) {
      setToast({ text: result.error, error: true })
      return
    }
    changeConfig(await window.api.config.get())
  }

  // Tocar el botón de la vista abierta vuelve al timer.
  const toggleView = (next: View): void => setView(view === next ? 'timer' : next)

  // Mientras hay un foco en marcha no se cambia la materia: el tiempo es de lo que elegiste al arrancar.
  const focusInProgress = timerState.phase === 'focus' && timerState.status !== 'idle'
  const blockedReason =
    catalog.vaultOk && !config.selection.materia.trim()
      ? 'Elegí qué estudiás para arrancar el foco'
      : null

  return (
    <main className="app">
      <header className="topbar">
        <span className={catalog.vaultOk ? 'vault-status ok' : 'vault-status'}>
          {catalog.vaultOk
            ? vaultLabel(config.vaultPath, info)
            : 'Sin vault: el tiempo no se guarda'}
        </span>
        <div className="topbar-actions">
          {view !== 'timer' && timerState.status !== 'idle' && (
            <button className="mini-timer" onClick={() => setView('timer')} title="Volver al timer">
              {formatTime(timerState.remainingMs)}
            </button>
          )}
          <button
            className={view === 'stats' ? 'icon-button active' : 'icon-button'}
            onClick={() => toggleView('stats')}
            title="Estadísticas"
          >
            📊
          </button>
          <button
            className={view === 'settings' ? 'icon-button active' : 'icon-button'}
            onClick={() => toggleView('settings')}
            title="Ajustes"
          >
            ⚙
          </button>
        </div>
      </header>

      {view === 'settings' && (
        <Settings
          config={config}
          info={info}
          onConfigChange={changeConfig}
          onClose={() => setView('timer')}
        />
      )}
      {view === 'stats' && <Stats vaultOk={catalog.vaultOk} />}
      {view === 'timer' && (
        <div className="main-view">
          {catalog.vaultOk ? (
            <SubjectPicker
              selection={config.selection}
              catalog={catalog}
              locked={focusInProgress}
              onChange={changeSelection}
            />
          ) : (
            <div className="onboarding">
              <p>
                Para guardar tu tiempo de estudio en Obsidian, elegí la carpeta de tu vault (la que
                tiene la carpeta oculta <code>.obsidian</code>).
              </p>
              <button className="button-soft" onClick={chooseVault}>
                Elegir vault…
              </button>
            </div>
          )}
          <Timer state={timerState} blockedReason={blockedReason} />
        </div>
      )}

      {toast && (
        <div className={toast.error ? 'toast error' : 'toast'} role="status">
          {toast.text}
        </div>
      )}
    </main>
  )
}

export default App
