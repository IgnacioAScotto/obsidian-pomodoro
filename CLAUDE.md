# Obsidian Pomodoro — instrucciones para el agente

App de escritorio (Electron) de **Nacho** (Ignacio A. Scotto), estudiante de informática en la
UNAHUR. Es su **primera app hecha vibecodeando**: el código lo escribe el agente, Nacho prueba y
opina. Explicale lo que hacés en criollo, sin dar por sentado que sabe Electron o React.

## Qué hace

1. **Pomodoro**: foco / descanso corto / descanso largo, con materia y tema elegidos antes de arrancar.
2. **Registro en Obsidian**: cada bloque de foco se agrega como una línea en el vault, para ver
   horas por materia en la semana, el mes y el año.
3. **Tareas**: lee las tareas del plugin Tasks del vault y las marca como hechas en el archivo.

## Stack

Electron + electron-vite + React + TypeScript. Vitest para tests. electron-builder para empaquetar.

```
src/main/        proceso principal: ventana, bandeja, timer, acceso al disco (vault)
src/preload/     puente seguro entre main y la interfaz (window.api)
src/renderer/    interfaz React
test-vault/      vault falso para desarrollar y testear sin tocar el real
```

La interfaz **nunca toca el disco**: pide todo al proceso principal por IPC a través de `window.api`.

## El vault

Vault real: `~/Documents/Obsidian/Cerebro Digital` (tiene su propio `CLAUDE.md` con las convenciones;
leelo antes de cambiar el formato de algo que se escribe ahí).

- **Registro**: `Sistema/Pomodoro/AAAA-MM.md`, uno por mes, `tipo: registro-estudio` en el frontmatter.
  Una línea por bloque de foco, con campos inline de Dataview:
  `- [fecha:: 2026-09-10T19:30] [ambito:: facultad] [materia:: [[Objetos II]]] [tema:: Strategy] [minutos:: 25]`
- **Materias**: las carpetas de `Cursada/Materias/`.
- **Tareas**: sintaxis emoji del plugin Tasks (`- [ ] texto 📅 2026-09-15 #facultad`).
  Al completar: `[ ]` → `[x]` y se agrega ` ✅ AAAA-MM-DD`.

## Reglas duras

1. **La app escribe en el vault solo dos cosas**: agrega líneas al final del registro mensual y
   cambia el checkbox (+ fecha ✅) de una tarea. Nada más. Nunca reescribe un archivo entero con
   contenido reconstruido.
2. **Nunca escribir en `Fuentes/`** del vault.
3. Antes de modificar una tarea, **releer el archivo** y comprobar que la línea sigue igual. Si no
   coincide, no tocar nada.
4. Todo lo que lee o escribe el vault lleva **tests** en `tests/`, contra `test-vault/`.
5. Interfaz, mensajes y comentarios en **español rioplatense**. Nombres de variables y funciones en inglés.

## Flujo de trabajo

- Una rama por fase (`fase-1-timer`, `fase-2-registro`, …), commits chicos con mensaje en español,
  Pull Request con `gh` y merge a `main`. `main` siempre funciona.
- Antes de commitear: `npm run typecheck` y `npm test` tienen que pasar.
- El plan completo, con las fases, está en el README.

## Comandos

```bash
npm run dev         # abre la app en modo desarrollo (se recarga sola)
npm test            # tests
npm run typecheck   # chequeo de tipos
npm run build:linux # AppImage + .deb en dist/
```
