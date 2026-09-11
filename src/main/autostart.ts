import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { dirname, join } from 'path'

/** Archivo que GNOME (y cualquier escritorio freedesktop) lee al iniciar sesión. */
const AUTOSTART_FILE = join(
  process.env['XDG_CONFIG_HOME'] || join(homedir(), '.config'),
  'autostart',
  'obsidian-pomodoro.desktop'
)

/** Argumento con el que la app arranca solo en el ícono de la barra, sin abrir la ventana. */
export const HIDDEN_FLAG = '--hidden'

export function isAutostartEnabled(): boolean {
  return existsSync(AUTOSTART_FILE)
}

export function setAutostart(enabled: boolean, executable: string): void {
  if (!enabled) {
    rmSync(AUTOSTART_FILE, { force: true })
    return
  }
  mkdirSync(dirname(AUTOSTART_FILE), { recursive: true })
  writeFileSync(AUTOSTART_FILE, autostartEntry(executable))
}

/** El `.desktop` de arranque. La ruta va entre comillas porque la app se instala en `/opt/Obsidian Pomodoro/`. */
export function autostartEntry(executable: string): string {
  return [
    '[Desktop Entry]',
    'Type=Application',
    'Name=Obsidian Pomodoro',
    'Comment=Pomodoro conectado a Obsidian',
    `Exec="${executable}" ${HIDDEN_FLAG}`,
    'Icon=obsidian-pomodoro',
    'X-GNOME-Autostart-enabled=true',
    ''
  ].join('\n')
}
