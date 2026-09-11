import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  shell,
  Tray,
  type NativeImage,
  type OpenDialogOptions
} from 'electron'
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { is, optimizer } from '@electron-toolkit/utils'
import { HIDDEN_FLAG, isAutostartEnabled, setAutostart } from './autostart'
import { loadConfig, mergeConfig, saveConfig } from './config'
import { PomodoroTimer } from './timer'
import { buildCatalog, isVault } from './vault/catalog'
import { appendEntry, readEntries } from './vault/log'
import type { AutostartState } from '../shared/api'
import type {
  AppConfig,
  AppInfo,
  ChooseVaultResult,
  ConfigPatch,
  LogSaved
} from '../shared/config'
import {
  FAST_SETTINGS,
  formatTime,
  PHASE_LABEL,
  type Phase,
  type PhaseEnd,
  type TimerState
} from '../shared/timer'
import appIcon from '../../resources/icon.png?asset'
import trayIdle from '../../resources/tray-idle.png?asset'
import trayIdle2x from '../../resources/tray-idle@2x.png?asset'
import trayFocus from '../../resources/tray-focus.png?asset'
import trayFocus2x from '../../resources/tray-focus@2x.png?asset'
import trayShort from '../../resources/tray-short.png?asset'
import trayShort2x from '../../resources/tray-short@2x.png?asset'
import trayLong from '../../resources/tray-long.png?asset'
import trayLong2x from '../../resources/tray-long@2x.png?asset'

const APP_NAME = 'Obsidian Pomodoro'
/** Un foco cortado antes de tiempo se guarda solo si duró al menos esto. */
const MIN_PARTIAL_MINUTES = 5

app.setName(APP_NAME)
// En desarrollo la config va a otra carpeta, así las pruebas no pisan la de la app instalada.
if (is.dev) app.setPath('userData', join(app.getPath('appData'), `${APP_NAME} (dev)`))

const CONFIG_FILE = join(app.getPath('userData'), 'config.json')
const FAST_MODE = Boolean(process.env['POMODORO_RAPIDO'])
// Al iniciar sesión (arranque automático) la app abre solo el ícono de la barra.
const START_HIDDEN = process.argv.includes(HIDDEN_FLAG)
const TEST_VAULT = is.dev ? join(app.getAppPath(), 'test-vault') : null

let config: AppConfig = loadConfig(CONFIG_FILE)
// En desarrollo, si todavía no elegiste un vault, arrancamos con el de prueba.
if (!config.vaultPath && TEST_VAULT) config = { ...config, vaultPath: TEST_VAULT }

const timer = new PomodoroTimer(FAST_MODE ? FAST_SETTINGS : config.timer)

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let trayIcons: Record<Phase | 'idle', NativeImage>
let quitting = false
let hiddenNoticeShown = false
// Guardamos la última notificación para que no la borre el recolector de basura antes del clic.
let lastNotification: Notification | null = null

// ---------- Ventana ----------

/** `show = false` crea la ventana escondida: el timer y el sonido andan igual. */
function createWindow(show = true): void {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 700,
    minWidth: 360,
    minHeight: 620,
    show: false,
    title: APP_NAME,
    backgroundColor: '#1e1e2e',
    autoHideMenuBar: true,
    icon: appIcon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      // Que el timer y el sonido funcionen igual con la ventana escondida.
      backgroundThrottling: false,
      autoplayPolicy: 'no-user-gesture-required'
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (show) mainWindow?.show()
  })

  // El título de la ventana lo maneja la app (muestra el tiempo), no el <title> del HTML.
  mainWindow.on('page-title-updated', (event) => event.preventDefault())

  // Cerrar la ventana la esconde: el timer sigue en el ícono de la barra.
  // Para salir de verdad está "Salir" en el menú de ese ícono.
  mainWindow.on('close', (event) => {
    if (quitting || !tray) return
    event.preventDefault()
    mainWindow?.hide()
    if (!hiddenNoticeShown) {
      hiddenNoticeShown = true
      notify('Sigo acá', 'El timer sigue corriendo. Lo encontrás en el ícono de la barra de arriba.')
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // En desarrollo carga el servidor de Vite (se recarga solo); instalada, el HTML compilado.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function showWindow(): void {
  if (!mainWindow) {
    createWindow()
    return
  }
  mainWindow.show()
  mainWindow.focus()
}

function sendToWindow(channel: string, payload: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload)
}

function updateWindowTitle(state: TimerState): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  const title =
    state.status === 'idle'
      ? APP_NAME
      : `${formatTime(state.remainingMs)} · ${PHASE_LABEL[state.phase]}`
  mainWindow.setTitle(title)
}

// ---------- Ícono en la barra ----------

function trayImage(path1x: string, path2x: string): NativeImage {
  const image = nativeImage.createFromPath(path1x)
  image.addRepresentation({ scaleFactor: 2, buffer: readFileSync(path2x) })
  return image
}

function createTray(): void {
  trayIcons = {
    idle: trayImage(trayIdle, trayIdle2x),
    focus: trayImage(trayFocus, trayFocus2x),
    shortBreak: trayImage(trayShort, trayShort2x),
    longBreak: trayImage(trayLong, trayLong2x)
  }
  tray = new Tray(trayIcons.idle)
  tray.on('click', showWindow)
  updateTray(timer.getState())
}

let lastTrayKey = ''

function updateTray(state: TimerState): void {
  if (!tray) return

  // En Linux el menú del ícono se reconstruye entero: lo hacemos como mucho una vez por minuto.
  const minutesLeft = Math.ceil(state.remainingMs / 60_000)
  const materia = config.selection.materia.trim()
  const key = `${state.phase}|${state.status}|${minutesLeft}|${materia}`
  if (key === lastTrayKey) return
  lastTrayKey = key

  tray.setImage(state.status === 'running' ? trayIcons[state.phase] : trayIcons.idle)

  const statusText =
    state.status === 'running'
      ? `quedan ${minutesLeft} min`
      : state.status === 'paused'
        ? `en pausa, quedan ${minutesLeft} min`
        : 'sin arrancar'
  const summary = `${PHASE_LABEL[state.phase]} — ${statusText}`
  const toggleLabel =
    state.status === 'running' ? 'Pausar' : state.status === 'paused' ? 'Reanudar' : 'Iniciar'

  tray.setToolTip(summary)
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: summary, enabled: false },
      ...(materia ? [{ label: `Estudiando: ${materia}`, enabled: false }] : []),
      { type: 'separator' },
      { label: toggleLabel, click: () => timer.toggle() },
      { label: 'Saltar fase', click: () => timer.skip() },
      { label: 'Mostrar ventana', click: showWindow },
      { type: 'separator' },
      {
        label: 'Salir',
        click: () => {
          quitting = true
          app.quit()
        }
      }
    ])
  )
}

// ---------- Notificaciones ----------

function notify(title: string, body: string): void {
  if (!Notification.isSupported()) return
  lastNotification = new Notification({ title, body, icon: appIcon })
  lastNotification.on('click', showWindow)
  lastNotification.show()
}

function notifyPhaseEnd(end: PhaseEnd): void {
  const title = end.phase === 'focus' ? '¡Foco terminado! 🍅' : 'Se terminó el descanso'
  const nextMessage: Record<Phase, string> = {
    focus: config.timer.autoStartFocus
      ? 'Arranca el próximo foco.'
      : 'Cuando quieras, arrancá el próximo foco.',
    shortBreak: 'Descanso corto: levantate, estirá, tomá agua.',
    longBreak: 'Descanso largo: te lo ganaste.'
  }
  notify(title, nextMessage[end.next])
}

// ---------- Registro en el vault ----------

/** Guarda en el vault un foco que terminó, o que se cortó después de los 5 minutos. */
function recordFocus(end: PhaseEnd): void {
  const minutos = Math.round(end.elapsedMs / 60_000)
  if (minutos < 1 || (!end.completed && minutos < MIN_PARTIAL_MINUTES)) return

  const { vaultPath, selection } = config
  const materia = selection.materia.trim()
  if (!vaultPath || !materia) return

  try {
    const file = appendEntry(vaultPath, {
      startedAt: end.startedAt,
      ambito: selection.ambito,
      materia,
      tema: selection.tema.trim(),
      minutos
    })
    const saved: LogSaved = { materia, minutos, file }
    sendToWindow('log:saved', saved)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    sendToWindow('log:error', message)
    notify('No pude guardar el pomodoro en Obsidian', message)
  }
}

// ---------- Config y vault ----------

function updateConfig(patch: ConfigPatch): AppConfig {
  config = mergeConfig(config, patch)
  saveConfig(CONFIG_FILE, config)
  if (patch.timer && !FAST_MODE) timer.updateSettings(config.timer)
  updateTray(timer.getState())
  return config
}

async function chooseVault(): Promise<ChooseVaultResult> {
  const options: OpenDialogOptions = {
    title: 'Elegí la carpeta de tu vault de Obsidian',
    defaultPath: config.vaultPath ?? join(homedir(), 'Documents'),
    properties: ['openDirectory']
  }
  const result = mainWindow
    ? await dialog.showOpenDialog(mainWindow, options)
    : await dialog.showOpenDialog(options)
  const path = result.filePaths[0]
  if (result.canceled || !path) return null
  if (!isVault(path)) {
    return { error: 'Esa carpeta no es un vault de Obsidian: no tiene la carpeta oculta .obsidian.' }
  }
  updateConfig({ vaultPath: path })
  return { path }
}

// ---------- Timer ↔ interfaz ----------

timer.on('state', (state: TimerState) => {
  sendToWindow('timer:state', state)
  updateTray(state)
  updateWindowTitle(state)
})

timer.on('phase-end', (end: PhaseEnd) => {
  sendToWindow('timer:phase-end', end)
  if (end.phase === 'focus') recordFocus(end)
  if (end.completed) notifyPhaseEnd(end)
})

ipcMain.handle('app:info', (): AppInfo => ({ fastMode: FAST_MODE, testVaultPath: TEST_VAULT }))
// El arranque automático solo tiene sentido en la app instalada (en desarrollo apuntaría a node_modules).
ipcMain.handle(
  'autostart:get',
  (): AutostartState => ({
    available: app.isPackaged,
    enabled: app.isPackaged && isAutostartEnabled()
  })
)
ipcMain.handle('autostart:set', (_event, enabled: boolean): boolean => {
  if (!app.isPackaged) return false
  setAutostart(enabled, process.execPath)
  return isAutostartEnabled()
})
ipcMain.handle('config:get', () => config)
ipcMain.handle('config:update', (_event, patch: ConfigPatch) => updateConfig(patch))
ipcMain.handle('vault:choose', () => chooseVault())
ipcMain.handle('vault:catalog', () => buildCatalog(config.vaultPath))
ipcMain.handle('log:entries', () =>
  config.vaultPath && isVault(config.vaultPath) ? readEntries(config.vaultPath) : []
)
ipcMain.handle('timer:get-state', () => timer.getState())
ipcMain.on('timer:toggle', () => timer.toggle())
ipcMain.on('timer:skip', () => timer.skip())
ipcMain.on('timer:reset', () => timer.reset())

// ---------- Ciclo de vida ----------

// Una sola instancia: si la abrís de nuevo, se muestra la que ya está corriendo.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', showWindow)

  app.whenReady().then(() => {
    // F12 abre las herramientas de desarrollo mientras programamos.
    app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

    createTray()
    createWindow(!START_HIDDEN)
  })
}

app.on('before-quit', () => {
  quitting = true
  // Si cerrás la app en medio de un foco, se guarda lo que llevabas (si pasó los 5 minutos).
  const state = timer.getState()
  if (state.phase === 'focus' && state.status !== 'idle') timer.reset()
})

// Sin ícono en la barra no habría forma de volver a la app, así que en ese caso sí se cierra.
app.on('window-all-closed', () => {
  if (!tray) app.quit()
})
