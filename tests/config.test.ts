import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { loadConfig, mergeConfig, saveConfig } from '../src/main/config'
import { DEFAULT_CONFIG } from '../src/shared/config'

const tempFile = (): string => join(mkdtempSync(join(tmpdir(), 'pomodoro-config-')), 'config.json')

describe('config', () => {
  it('sin archivo usa los valores por defecto', () => {
    expect(loadConfig(tempFile())).toEqual(DEFAULT_CONFIG)
  })

  it('un archivo roto no rompe la app', () => {
    const file = tempFile()
    writeFileSync(file, 'esto no es json {')
    expect(loadConfig(file)).toEqual(DEFAULT_CONFIG)
  })

  it('guarda y vuelve a leer lo mismo', () => {
    const file = tempFile()
    const config = mergeConfig(DEFAULT_CONFIG, {
      vaultPath: '/home/nacho/vault',
      selection: { materia: 'Objetos II' }
    })
    saveConfig(file, config)
    expect(loadConfig(file)).toEqual(config)
  })

  it('un cambio parcial no borra los campos que no vinieron', () => {
    const config = mergeConfig(DEFAULT_CONFIG, { timer: { focusMinutes: 50 } })
    expect(config.timer).toMatchObject({ focusMinutes: 50, shortBreakMinutes: 5 })
    expect(config.selection).toEqual(DEFAULT_CONFIG.selection)
  })
})
