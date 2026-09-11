import { mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { buildCatalog, isVault, listConceptos, listMaterias } from '../src/main/vault/catalog'
import { appendEntry } from '../src/main/vault/log'
import type { LogEntry } from '../src/shared/config'
import { at, makeTempVault } from './helpers'

describe('catálogo del vault', () => {
  it('reconoce un vault por la carpeta .obsidian', () => {
    expect(isVault(makeTempVault())).toBe(true)
    expect(isVault(mkdtempSync(join(tmpdir(), 'no-es-vault-')))).toBe(false)
  })

  it('lista las materias en orden alfabético', () => {
    expect(listMaterias(makeTempVault())).toEqual([
      'Estructura de Datos',
      'Matemática II',
      'Objetos II'
    ])
  })

  it('lista los conceptos del wiki', () => {
    expect(listConceptos(makeTempVault())).toEqual(['Patrón Strategy', 'Recursión'])
  })

  it('arma los temas y las áreas usadas, de lo más reciente a lo más viejo', () => {
    const vault = makeTempVault()
    const log = (day: number, patch: Partial<LogEntry>): void => {
      appendEntry(vault, {
        startedAt: at(2026, 9, day, 19, 0),
        ambito: 'facultad',
        materia: 'Objetos II',
        tema: '',
        minutos: 25,
        ...patch
      })
    }
    log(1, { tema: 'Strategy' })
    log(3, { tema: 'Template Method' })
    log(5, { tema: 'Strategy' })
    log(2, { ambito: 'autoestudio', materia: 'Inglés' })
    log(4, { ambito: 'autoestudio', materia: 'Rust' })

    const catalog = buildCatalog(vault)
    expect(catalog.temasPorMateria['Objetos II']).toEqual(['Strategy', 'Template Method'])
    expect(catalog.autoestudio).toEqual(['Rust', 'Inglés'])
  })

  it('sin vault devuelve un catálogo vacío', () => {
    expect(buildCatalog(null)).toMatchObject({ vaultOk: false, materias: [] })
  })
})
