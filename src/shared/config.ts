import { DEFAULT_SETTINGS, type TimerSettings } from './timer'

export type Ambito = 'facultad' | 'autoestudio'

/** Lo que estás estudiando: se elige antes de arrancar el foco. */
export interface Selection {
  ambito: Ambito
  /** Facultad: una carpeta de `Cursada/Materias`. Autoestudio: texto libre (ej. "Inglés"). */
  materia: string
  /** Opcional. */
  tema: string
}

export interface AppConfig {
  /** Carpeta raíz del vault de Obsidian; `null` si todavía no se eligió. */
  vaultPath: string | null
  timer: TimerSettings
  selection: Selection
}

/** Un cambio parcial de la config: lo que no viene queda como estaba. */
export interface ConfigPatch {
  vaultPath?: string | null
  timer?: Partial<TimerSettings>
  selection?: Partial<Selection>
}

export const DEFAULT_CONFIG: AppConfig = {
  vaultPath: null,
  timer: DEFAULT_SETTINGS,
  selection: { ambito: 'facultad', materia: '', tema: '' }
}

/** Una línea del registro de estudio (`Sistema/Pomodoro/AAAA-MM.md`). */
export interface LogEntry {
  /** Cuándo arrancó el foco (epoch en ms). */
  startedAt: number
  ambito: Ambito
  materia: string
  /** Vacío si no se eligió tema. */
  tema: string
  minutos: number
}

/** Lo que la interfaz necesita del vault para armar los selectores. */
export interface Catalog {
  vaultOk: boolean
  materias: string[]
  conceptos: string[]
  /** Áreas de autoestudio usadas alguna vez, de la más reciente a la más vieja. */
  autoestudio: string[]
  /** Temas usados en cada materia, del más reciente al más viejo. */
  temasPorMateria: Record<string, string[]>
}

export interface AppInfo {
  /** `npm run dev:rapido`: las duraciones de la config se ignoran. */
  fastMode: boolean
  /** Ruta de `test-vault/` (solo en desarrollo). */
  testVaultPath: string | null
}

export interface LogSaved {
  materia: string
  minutos: number
  file: string
}

/** `null` si cancelaste el diálogo. */
export type ChooseVaultResult = { path: string } | { error: string } | null
