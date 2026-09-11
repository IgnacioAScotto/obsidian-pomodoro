import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import type { Ambito, LogEntry } from '../../shared/config'

/** Carpeta del vault donde van los registros, uno por mes. */
export const LOG_DIR = join('Sistema', 'Pomodoro')

const LOG_FILE_NAME = /^\d{4}-\d{2}\.md$/
const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
]

// Un campo inline de Dataview: `[clave:: valor]`. El valor puede traer un wikilink `[[...]]` adentro.
const FIELD = /\[(\w+)::\s*((?:\[\[[^\]]*\]\]|[^\]])*?)\s*\]/g

const pad = (n: number): string => String(n).padStart(2, '0')

/** `AAAA-MM-DDTHH:mm` en hora local (la del reloj de la compu, no UTC). */
export function localIso(time: number): string {
  const d = new Date(time)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Saca lo que rompería la sintaxis de Dataview: corchetes, saltos de línea y `::`. */
export function cleanText(text: string): string {
  return text
    .replace(/[[\]\r\n]/g, ' ')
    .replace(/::/g, ':')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatEntry(entry: LogEntry): string {
  const materia = cleanText(entry.materia)
  const fields = [
    `[fecha:: ${localIso(entry.startedAt)}]`,
    `[ambito:: ${entry.ambito}]`,
    `[materia:: ${entry.ambito === 'facultad' ? `[[${materia}]]` : materia}]`
  ]
  const tema = cleanText(entry.tema)
  if (tema) fields.push(`[tema:: ${tema}]`)
  fields.push(`[minutos:: ${entry.minutos}]`)
  return `- ${fields.join(' ')}`
}

export function logFilePath(vaultPath: string, time: number): string {
  const d = new Date(time)
  return join(vaultPath, LOG_DIR, `${d.getFullYear()}-${pad(d.getMonth() + 1)}.md`)
}

function fileHeader(time: number): string {
  const d = new Date(time)
  return [
    '---',
    'tipo: registro-estudio',
    `mes: ${d.getFullYear()}-${pad(d.getMonth() + 1)}`,
    '---',
    '',
    `# Registro de estudio — ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    '',
    '> [!info] Lo escribe la app Obsidian Pomodoro: una línea por bloque de foco.',
    '> Se puede corregir a mano respetando el formato. El resumen está en [[Tiempo de estudio]].',
    '',
    ''
  ].join('\n')
}

/**
 * Agrega una línea al registro del mes y devuelve la ruta del archivo. Si el archivo no existe,
 * lo crea con su encabezado. **Nunca reescribe lo que ya estaba: solo agrega al final.**
 *
 * Es sincrónica a propósito, para poder guardar un foco a medias justo antes de cerrar la app.
 */
export function appendEntry(vaultPath: string, entry: LogEntry): string {
  const file = logFilePath(vaultPath, entry.startedAt)
  mkdirSync(dirname(file), { recursive: true })
  if (!existsSync(file)) writeFileSync(file, fileHeader(entry.startedAt))

  // Si lo editaste a mano y no quedó un salto de línea al final, lo agregamos antes.
  const current = readFileSync(file, 'utf8')
  const separator = current === '' || current.endsWith('\n') ? '' : '\n'
  appendFileSync(file, `${separator}${formatEntry(entry)}\n`)
  return file
}

/** `[[Objetos II]]` o `[[Objetos II|OO2]]` → `Objetos II`. El texto sin link queda igual. */
function stripLink(value: string): string {
  const match = /^\[\[([^\]|]+)(?:\|[^\]]*)?\]\]$/.exec(value.trim())
  return (match ? match[1] : value).trim()
}

function parseLocalIso(value: string | undefined): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value ?? '')
  if (!m) return null
  const [, year, month, day, hours = '0', minutes = '0'] = m
  return new Date(+year, +month - 1, +day, +hours, +minutes).getTime()
}

/** Interpreta una línea del registro; devuelve `null` si no es un registro válido. */
export function parseEntry(line: string): LogEntry | null {
  if (!/^\s*[-*] /.test(line)) return null
  const fields: Record<string, string> = {}
  for (const [, key, value] of line.matchAll(FIELD)) fields[key.toLowerCase()] = value

  const startedAt = parseLocalIso(fields['fecha'])
  const minutos = Number(fields['minutos'])
  if (startedAt === null || !fields['materia'] || !Number.isFinite(minutos)) return null

  const ambito: Ambito = fields['ambito'] === 'autoestudio' ? 'autoestudio' : 'facultad'
  return {
    startedAt,
    ambito,
    materia: stripLink(fields['materia']),
    tema: fields['tema']?.trim() ?? '',
    minutos
  }
}

/** Todos los registros del vault, en el orden de los archivos. */
export function readEntries(vaultPath: string): LogEntry[] {
  const dir = join(vaultPath, LOG_DIR)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => LOG_FILE_NAME.test(name))
    .sort()
    .flatMap((name) => readFileSync(join(dir, name), 'utf8').split('\n'))
    .map(parseEntry)
    .filter((entry): entry is LogEntry => entry !== null)
}
