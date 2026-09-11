import { describe, expect, it } from 'vitest'
import { autostartEntry } from '../src/main/autostart'

describe('autostartEntry', () => {
  it('arranca escondida y con la ruta entre comillas (la carpeta tiene un espacio)', () => {
    const entry = autostartEntry('/opt/Obsidian Pomodoro/obsidian-pomodoro')
    expect(entry).toContain('Exec="/opt/Obsidian Pomodoro/obsidian-pomodoro" --hidden\n')
    expect(entry.startsWith('[Desktop Entry]\nType=Application\n')).toBe(true)
  })
})
