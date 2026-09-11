import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import type { Catalog } from '../../shared/config'
import { readEntries } from './log'

const byName = (a: string, b: string): number => a.localeCompare(b, 'es')

/** Un vault de Obsidian se reconoce por la carpeta oculta `.obsidian`. */
export function isVault(path: string): boolean {
  return existsSync(join(path, '.obsidian'))
}

/** Las carpetas de `Cursada/Materias`, una por materia. */
export function listMaterias(vaultPath: string): string[] {
  const dir = join(vaultPath, 'Cursada', 'Materias')
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort(byName)
}

/** Los conceptos del wiki (`Wiki/Conceptos/*.md`), para autocompletar el tema. */
export function listConceptos(vaultPath: string): string[] {
  const dir = join(vaultPath, 'Wiki', 'Conceptos')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.slice(0, -3))
    .sort(byName)
}

/** Sin repetidos, de lo más reciente a lo más viejo (recibe la lista en orden cronológico). */
function recentUnique(values: string[]): string[] {
  return [...new Set([...values].reverse())]
}

export function buildCatalog(vaultPath: string | null): Catalog {
  if (!vaultPath || !isVault(vaultPath)) {
    return { vaultOk: false, materias: [], conceptos: [], autoestudio: [], temasPorMateria: {} }
  }

  const entries = readEntries(vaultPath).sort((a, b) => a.startedAt - b.startedAt)

  const temasPorMateria: Record<string, string[]> = {}
  for (const materia of new Set(entries.map((e) => e.materia))) {
    const temas = entries.filter((e) => e.materia === materia && e.tema).map((e) => e.tema)
    if (temas.length > 0) temasPorMateria[materia] = recentUnique(temas)
  }

  return {
    vaultOk: true,
    materias: listMaterias(vaultPath),
    conceptos: listConceptos(vaultPath),
    autoestudio: recentUnique(
      entries.filter((e) => e.ambito === 'autoestudio').map((e) => e.materia)
    ),
    temasPorMateria
  }
}
