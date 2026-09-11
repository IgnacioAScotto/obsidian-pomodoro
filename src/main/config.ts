import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { DEFAULT_CONFIG, type AppConfig, type ConfigPatch } from '../shared/config'

/** Lee la config guardada; si no existe o está rota, arranca con los valores por defecto. */
export function loadConfig(file: string): AppConfig {
  try {
    const saved = JSON.parse(readFileSync(file, 'utf8')) as ConfigPatch
    return mergeConfig(DEFAULT_CONFIG, saved)
  } catch {
    return structuredClone(DEFAULT_CONFIG)
  }
}

export function saveConfig(file: string, config: AppConfig): void {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(config, null, 2))
}

/** Aplica un cambio parcial sin perder los campos anidados que no vinieron. */
export function mergeConfig(base: AppConfig, patch: ConfigPatch): AppConfig {
  return {
    vaultPath: patch.vaultPath !== undefined ? patch.vaultPath : base.vaultPath,
    timer: { ...base.timer, ...patch.timer },
    selection: { ...base.selection, ...patch.selection }
  }
}
