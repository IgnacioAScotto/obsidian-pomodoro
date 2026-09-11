import { cpSync, mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const TEST_VAULT = join(process.cwd(), 'test-vault')
const LOGS = join('Sistema', 'Pomodoro')

/**
 * Copia `test-vault/` a una carpeta temporal, así cada test escribe sin ensuciar el original.
 * No copia los registros que haya dejado usar la app en desarrollo.
 */
export function makeTempVault(): string {
  const dir = mkdtempSync(join(tmpdir(), 'pomodoro-vault-'))
  cpSync(TEST_VAULT, dir, { recursive: true, filter: (src) => !src.includes(LOGS) })
  return dir
}

/** Fecha en hora local; el mes va de 1 a 12 como en el calendario. */
export function at(year: number, month: number, day: number, hours = 0, minutes = 0): number {
  return new Date(year, month - 1, day, hours, minutes).getTime()
}
