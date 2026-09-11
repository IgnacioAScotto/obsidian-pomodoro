import type {
  AppConfig,
  AppInfo,
  Catalog,
  ChooseVaultResult,
  ConfigPatch,
  LogSaved
} from './config'
import type { PhaseEnd, TimerState } from './timer'

/**
 * Lo que la interfaz puede pedirle al proceso principal (`window.api`).
 * La implementación está en `src/preload/index.ts`.
 * Las funciones `on…` devuelven otra función para dejar de escuchar.
 */
export interface Api {
  app: {
    info(): Promise<AppInfo>
  }
  config: {
    get(): Promise<AppConfig>
    update(patch: ConfigPatch): Promise<AppConfig>
  }
  vault: {
    /** Abre el diálogo para elegir la carpeta del vault y la guarda si es válida. */
    choose(): Promise<ChooseVaultResult>
    catalog(): Promise<Catalog>
  }
  timer: {
    getState(): Promise<TimerState>
    toggle(): void
    skip(): void
    reset(): void
    onState(callback: (state: TimerState) => void): () => void
    onPhaseEnd(callback: (end: PhaseEnd) => void): () => void
  }
  log: {
    onSaved(callback: (saved: LogSaved) => void): () => void
    onError(callback: (message: string) => void): () => void
  }
}
