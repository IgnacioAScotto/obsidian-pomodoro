import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { Api } from '../shared/api'
import type { LogSaved } from '../shared/config'
import type { PhaseEnd, TimerState } from '../shared/timer'

/** Escucha un canal del proceso principal y devuelve la función para dejar de escucharlo. */
function subscribe<T>(channel: string, callback: (payload: T) => void): () => void {
  const listener = (_event: IpcRendererEvent, payload: T): void => callback(payload)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

// Todo lo que la interfaz puede pedirle al proceso principal pasa por acá.
const api: Api = {
  app: {
    info: () => ipcRenderer.invoke('app:info'),
    autostart: {
      get: () => ipcRenderer.invoke('autostart:get'),
      set: (enabled) => ipcRenderer.invoke('autostart:set', enabled)
    }
  },
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    update: (patch) => ipcRenderer.invoke('config:update', patch)
  },
  vault: {
    choose: () => ipcRenderer.invoke('vault:choose'),
    catalog: () => ipcRenderer.invoke('vault:catalog')
  },
  timer: {
    getState: () => ipcRenderer.invoke('timer:get-state'),
    toggle: () => ipcRenderer.send('timer:toggle'),
    skip: () => ipcRenderer.send('timer:skip'),
    reset: () => ipcRenderer.send('timer:reset'),
    onState: (callback) => subscribe<TimerState>('timer:state', callback),
    onPhaseEnd: (callback) => subscribe<PhaseEnd>('timer:phase-end', callback)
  },
  log: {
    entries: () => ipcRenderer.invoke('log:entries'),
    onSaved: (callback) => subscribe<LogSaved>('log:saved', callback),
    onError: (callback) => subscribe<string>('log:error', callback)
  }
}

contextBridge.exposeInMainWorld('api', api)
