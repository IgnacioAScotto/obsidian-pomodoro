import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import {
  appendEntry,
  cleanText,
  formatEntry,
  localIso,
  parseEntry,
  readEntries
} from '../src/main/vault/log'
import type { LogEntry } from '../src/shared/config'
import { at, makeTempVault } from './helpers'

const entry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  startedAt: at(2026, 9, 10, 19, 30),
  ambito: 'facultad',
  materia: 'Objetos II',
  tema: 'Patrón Strategy',
  minutos: 25,
  ...overrides
})

describe('formatEntry', () => {
  it('escribe la materia de la facultad como wikilink', () => {
    expect(formatEntry(entry())).toBe(
      '- [fecha:: 2026-09-10T19:30] [ambito:: facultad] [materia:: [[Objetos II]]] [tema:: Patrón Strategy] [minutos:: 25]'
    )
  })

  it('el autoestudio va como texto, y sin tema si no hay', () => {
    expect(formatEntry(entry({ ambito: 'autoestudio', materia: 'Inglés', tema: '' }))).toBe(
      '- [fecha:: 2026-09-10T19:30] [ambito:: autoestudio] [materia:: Inglés] [minutos:: 25]'
    )
  })

  it('limpia lo que rompería Dataview', () => {
    expect(cleanText(' Árbol [AVL]\nrotación:: doble ')).toBe('Árbol AVL rotación: doble')
  })

  it('usa la hora local con dos dígitos', () => {
    expect(localIso(at(2026, 1, 5, 8, 3))).toBe('2026-01-05T08:03')
  })
})

describe('appendEntry', () => {
  it('crea el archivo del mes con su encabezado', () => {
    const vault = makeTempVault()
    const file = appendEntry(vault, entry())

    expect(file).toBe(join(vault, 'Sistema', 'Pomodoro', '2026-09.md'))
    const text = readFileSync(file, 'utf8')
    expect(text).toMatch(/^---\ntipo: registro-estudio\nmes: 2026-09\n---\n/)
    expect(text).toContain('# Registro de estudio — septiembre 2026')
    expect(text.endsWith(`${formatEntry(entry())}\n`)).toBe(true)
  })

  it('solo agrega al final: lo que ya estaba queda intacto', () => {
    const vault = makeTempVault()
    const file = appendEntry(vault, entry())
    const before = readFileSync(file, 'utf8')

    appendEntry(vault, entry({ tema: 'Template Method' }))
    const after = readFileSync(file, 'utf8')
    expect(after.startsWith(before)).toBe(true)
    expect(after.slice(before.length)).toBe(`${formatEntry(entry({ tema: 'Template Method' }))}\n`)
  })

  it('respeta lo que escribiste a mano aunque no hayas dejado un enter al final', () => {
    const vault = makeTempVault()
    const file = appendEntry(vault, entry())
    appendFileSync(file, 'Nota mía sin enter')

    appendEntry(vault, entry())
    expect(readFileSync(file, 'utf8')).toContain('Nota mía sin enter\n- [fecha::')
  })

  it('cada mes va en su propio archivo', () => {
    const vault = makeTempVault()
    appendEntry(vault, entry({ startedAt: at(2026, 10, 1, 9, 0) }))
    expect(existsSync(join(vault, 'Sistema', 'Pomodoro', '2026-10.md'))).toBe(true)
    expect(existsSync(join(vault, 'Sistema', 'Pomodoro', '2026-09.md'))).toBe(false)
  })
})

describe('readEntries', () => {
  it('lee de vuelta exactamente lo que escribió appendEntry', () => {
    const vault = makeTempVault()
    const written = [
      entry(),
      entry({
        ambito: 'autoestudio',
        materia: 'Inglés',
        tema: '',
        minutos: 12,
        startedAt: at(2026, 10, 2, 21, 5)
      })
    ]
    written.forEach((e) => appendEntry(vault, e))
    expect(readEntries(vault)).toEqual(written)
  })

  it('ignora las líneas que no son registros y los archivos que no son de un mes', () => {
    const vault = makeTempVault()
    const file = appendEntry(vault, entry())
    appendFileSync(file, '- una lista cualquiera\n- [minutos:: 10] sin fecha ni materia\n')
    writeFileSync(join(vault, 'Sistema', 'Pomodoro', 'notas.md'), `${formatEntry(entry())}\n`)

    expect(readEntries(vault)).toHaveLength(1)
  })

  it('entiende un wikilink con alias', () => {
    expect(
      parseEntry('- [fecha:: 2026-09-10T19:30] [materia:: [[Objetos II|OO2]]] [minutos:: 25]')
    ).toMatchObject({ materia: 'Objetos II', ambito: 'facultad', tema: '', minutos: 25 })
  })

  it('si todavía no hay registros devuelve una lista vacía', () => {
    expect(readEntries(makeTempVault())).toEqual([])
  })
})
