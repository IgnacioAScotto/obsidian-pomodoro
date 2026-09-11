import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  shell,
  Tray,
  type NativeImage
} from 'electron'
import { readFileSync } from 'fs'
import { join } from 'path'
import { is, optimizer } from '@electron-toolkit/utils'
import { PomodoroTimer } from './timer'
import {
  DEFAULT_SETTINGS,
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

const settings = process.env['POMODORO_RAPIDO'] ? FAST_SETTINGS : DEFAULT_SETTINGS
const timer = new PomodoroTimer(settings)

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let trayIcons: Record<Phase | 'idle', NativeImage>
let quitting = false
let hiddenNoticeShown = false
// Guardamos la última notificación para que no la borre el recolector de basura antes del clic.
let lastNotification: Notification | null = null

// ---------- Ventana ----------

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 600,
    minWidth: 360,
    minHeight: 520,
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

  mainWindow.on('ready-to-show', () => mainWindow?.show())

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

function updateWindowTitle(state: TimerState): void {
  const title =
    state.status === 'idle'
      ? APP_NAME
      : `${formatTime(state.remainingMs)} · ${PHASE_LABEL[state.phase]}`
  mainWindow?.setTitle(title)
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
  const key = `${state.phase}|${state.status}|${minutesLeft}`
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
    focus: settings.autoStartFocus
      ? 'Arranca el próximo foco.'
      : 'Cuando quieras, arrancá el próximo foco.',
    shortBreak: 'Descanso corto: levantate, estirá, tomá agua.',
    longBreak: 'Descanso largo: te lo ganaste.'
  }
  notify(title, nextMessage[end.next])
}

// ---------- Timer ↔ interfaz ----------

timer.on('state', (state: TimerState) => {
  mainWindow?.webContents.send('timer:state', state)
  updateTray(state)
  updateWindowTitle(state)
})

timer.on('phase-end', (end: PhaseEnd) => {
  mainWindow?.webContents.send('timer:phase-end', end)
  if (end.completed) notifyPhaseEnd(end)
})

ipcMain.handle('timer:get-state', () => timer.getState())
ipcMain.on('timer:toggle', () => timer.toggle())
ipcMain.on('timer:skip', () => timer.skip())
ipcMain.on('timer:reset', () => timer.reset())

// ---------- Ciclo de vida ----------

app.setName(APP_NAME)

// Una sola instancia: si la abrís de nuevo, se muestra la que ya está corriendo.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', showWindow)

  app.whenReady().then(() => {
    // F12 abre las herramientas de desarrollo mientras programamos.
    app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

    createTray()
    createWindow()
  })
}

app.on('before-quit', () => {
  quitting = true
})

// Sin ícono en la barra no habría forma de volver a la app, así que en ese caso sí se cierra.
app.on('window-all-closed', () => {
  if (!tray) app.quit()
})
