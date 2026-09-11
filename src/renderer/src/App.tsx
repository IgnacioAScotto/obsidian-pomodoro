import { useCallback, useEffect, useState } from 'react'
import type { AppConfig, AppInfo, Catalog, Selection } from '../../shared/config'
import Settings from './components/Settings'
import SubjectPicker from './components/SubjectPicker'
import Timer from './components/Timer'
import { useTimerState } from './useTimerState'

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
  const [view, setView] = useState<'timer' | 'settings'>('timer')
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
        <button
          className="icon-button"
          onClick={() => setView(view === 'settings' ? 'timer' : 'settings')}
          title="Ajustes"
        >
          ⚙
        </button>
      </header>

      {view === 'settings' ? (
        <Settings
          config={config}
          info={info}
          onConfigChange={changeConfig}
          onClose={() => setView('timer')}
        />
      ) : (
        <div className="main-view">
          {catalog.vaultOk && (
            <SubjectPicker
              selection={config.selection}
              catalog={catalog}
              locked={focusInProgress}
              onChange={changeSelection}
            />
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
