# Progreso — cómo seguir desde cualquier chat

> **Si sos un chat nuevo**: leé este archivo y `CLAUDE.md` antes de tocar nada. Acá está qué se hizo,
> qué decisiones se tomaron y qué sigue. Actualizalo al terminar cada fase.

## Cómo retomar (para Nacho)

```bash
cd ~/Documents/Proyectos/obsidian-pomodoro
git checkout main && git pull     # traer lo último de GitHub
claude                            # abrir Claude Code en esta carpeta
```

Y escribile algo como: **"Leé PROGRESO.md y seguimos con la Fase 6"** (o la que toque).
Desde otra compu o desde claude.ai/code: el repo es `github.com/IgnacioAScotto/obsidian-pomodoro`.

---

## Estado al 2026-09-10

| Fase | Qué quedó | PR |
|---|---|---|
| 0 · Preparación | repo público, README, CLAUDE.md, licencia MIT; vault versionado en repo privado | — |
| 1 · Timer | pomodoro 25/5/15 (largo cada 4), notificaciones, campanita, ícono de tomate en la barra con menú, cerrar = esconder | #1 ✅ |
| 2 · Registro | selector "¿Qué estudiás?" (Facultad / Por mi cuenta + tema), cada foco se agrega a `Sistema/Pomodoro/AAAA-MM.md`, ajustes (vault y duraciones) | #2 ✅ |
| 3 · Estadísticas | pantalla 📊 (semana/mes/año, filtro por ámbito, barras por materia, evolución) + tablero `Sistema/Tableros/Tiempo de estudio.md` en el vault | #3 ✅ |
| 4 · Tareas (leer) | — | pendiente |
| 5 · Tareas (completar) | — | pendiente |
| 6 · Instalable | — | pendiente |

Todo probado por Nacho y mergeado a `main`. 38 tests pasando (`npm test`).

### Pendientes chicos (fuera de las fases)

- [ ] **Abrir en Obsidian el vault correcto** (hacerlo primero). Al 2026-09-10 Obsidian tenía
  registrada como vault la carpeta `~/Documents/Obsidian` (la de arriba), no `Cerebro Digital`. Así
  las consultas del vault con rutas (`FROM "Cursada/…"`, `dv.pages('"Sistema/Pomodoro"')`) no
  encuentran nada, incluido el tablero *Tiempo de estudio*. Arreglo: en Obsidian, *Abrir otro vault →
  Abrir carpeta como vault →* `~/Documents/Obsidian/Cerebro Digital`. Es la migración que el
  `04 Montaje` del vault ya marca como pendiente (`setup.sh` copia plugins y config hacia adentro).
- [ ] **Activar Dataview JS** en ese vault: Ajustes → Dataview → *Enable JavaScript Queries*. No había
  `data.json` de Dataview en ninguno de los dos `.obsidian`, así que figura como no activado. Sin esto
  el tablero *Tiempo de estudio* muestra código.
- [ ] **Apuntar la app al vault real** (⚙ → Elegir carpeta → `~/Documents/Obsidian/Cerebro Digital`).
  Hasta ahora solo escribió en `test-vault/`. En `npm run dev:rapido` cada foco guarda 1 minuto:
  si se prueba contra el vault real, después hay que borrar esas líneas.
- [ ] **Commit de los cambios de otra sesión en el vault** (notas de clase nuevas, `00 Contexto`,
  la Clase 05 renombrada, y `Wiki/bitacora.md`, que también tiene la línea `setup` de esta app). Quedaron
  sin commitear a propósito: no eran de esta sesión. Mirar `git status` en el vault y decidir con Nacho.

---

## Qué sigue

### Recomendación: arrancar por la Fase 6 (instalable)

Es corta y hace que Nacho **use la app de verdad todos los días** (desde el lanzador, sin terminal,
apuntando al vault real) mientras se desarrollan las tareas. Así el tablero junta datos reales.
Después, Fases 4 y 5, y se reinstala el `.deb` cuando estén.

### Fase 6 · Instalable

- `npm run build:linux` → `dist/` con `.deb` y AppImage (`electron-builder.yml` ya está: appId
  `ar.scotto.obsidian-pomodoro`, productName `Obsidian Pomodoro`, categoría Education).
- Recomendar el **`.deb`** (`sudo apt install ./dist/obsidian-pomodoro_<versión>_amd64.deb`): instala en
  `/opt` con `chrome-sandbox` como root, así no hace falta `--no-sandbox`. La AppImage en Ubuntu 24.04+
  choca con AppArmor (mismo problema del sandbox que en dev).
- Revisar que el ícono aparezca en el dock de GNOME (puede hacer falta `desktopName` / `StartupWMClass`).
- La app instalada usa **otra config** que la de desarrollo (`~/.config/Obsidian Pomodoro/` vs
  `~/.config/Obsidian Pomodoro (dev)/`) y arranca **sin vault**: en el primer uso hay que elegirlo en ⚙.
- Opcional: arranque automático con un `.desktop` en `~/.config/autostart/` (preguntar).
- Subir la versión en `package.json` (hoy `0.1.0`).

### Fase 4 · Tareas (leer)

- `src/main/vault/tasks.ts`: recorrer los `.md` del vault **salvo** `Fuentes/`, `Sistema/Plantillas/`,
  `Sistema/Agente/` (ahí las tareas son ejemplos), `.obsidian/`, `.trash/`. Saltear lo que esté dentro
  de bloques de código (```` ``` ````).
- Por cada `- [ ]` / `- [x]`: texto, 📅 vence, ⏳ programada, 🛫 inicio, ✅ hecha, 🔁 recurrencia, `#tags`,
  archivo, número de línea, línea original exacta, y **materia según la ruta**
  (`Cursada/Materias/<Materia>/…`).
- Orden = el de los tableros del vault (ver `Sistema/Tableros/Hoy.md` y el `CLAUDE.md` del vault):
  prioridad **derivada de la fecha** (🔺 vence hoy/mañana o vencida · ⏫ esta semana · 🔼 este mes ·
  🔽 sin fecha), entre materias solo por fecha, **Curso Python siempre al final**. Lo vencido no baja.
- Vista "Tareas" en la app (nuevo botón arriba), filtro por materia.
- `chokidar` con debounce (~500 ms) para refrescar cuando se edita en Obsidian.
- Tests contra `test-vault/` (agregarle tareas de ejemplo en las materias).

### Fase 5 · Tareas (completar)

- Al marcar: **releer el archivo**, verificar que la línea guardada siga idéntica; si cambió, buscarla por
  texto exacto; si no aparece o aparece dos veces, **no tocar nada** y refrescar.
- `- [ ]` → `- [x]` + ` ✅ AAAA-MM-DD` (formato del plugin Tasks; si la línea termina en un block id
  `^abc`, la fecha va antes). Desmarcar hace lo inverso.
- Tareas con 🔁: se muestran pero se completan desde Obsidian (el plugin crea la próxima repetición).
  Botón para abrirla: `obsidian://open?vault=…&file=…`.
- "Arrancar pomodoro" desde una tarea: completa materia (de la ruta) y tema (el texto de la tarea).

### Ideas para después

Capturar tareas nuevas a `00 Inbox.md` · atajo de teclado global · sección "Tiempo dedicado" en el MOC
de cada materia · modo foco.

---

## Decisiones tomadas (no re-discutir sin motivo)

- **Electron + electron-vite + React + TypeScript**. Vitest para tests. Recharts para gráficos.
- **Registro**: un archivo por mes en `Sistema/Pomodoro/`, `tipo: registro-estudio`, una línea por foco
  con campos inline de Dataview. Facultad = wikilink a la materia; autoestudio = texto libre.
  Se registra el foco completo, o uno cortado si pasó los **5 minutos**. La app **solo agrega al final**.
- **Sin materia elegida no arranca un foco** (si hay vault). Durante el foco la selección se bloquea.
- **En desarrollo**: config aparte (`… (dev)`) y vault por defecto = `test-vault/`. Los tests escriben
  en una copia temporal de `test-vault/`.
- **Timer en el proceso principal**, calculado desde la hora de fin (`endAt`), no con un contador.
- **Flujo Git**: una rama por fase → commit en español → push → PR con `gh` → Nacho prueba → merge.
- **El vault se toca lo mínimo**: la documentación de lo que la app escribe está en el `CLAUDE.md`,
  `01 Convenciones`, `03 Plugins` y `04 Montaje` del vault (hecho en la Fase 3).

## Mapa del código

```
src/main/index.ts          ventana, ícono en la barra, notificaciones, IPC, registro de focos
src/main/timer.ts          PomodoroTimer (eventos `state` y `phase-end`)
src/main/config.ts         config en JSON (userData/config.json)
src/main/vault/log.ts      escribir y leer el registro mensual
src/main/vault/catalog.ts  materias, conceptos, temas y áreas usadas
src/shared/                tipos compartidos, interfaz `Api` (window.api), cuentas de estadísticas
src/preload/index.ts       implementación de window.api
src/renderer/src/          App.tsx + components/ (Timer, SubjectPicker, Stats, Settings)
tests/                     Vitest
test-vault/                vault falso
```

## Cosas que conviene saber

- **Ubuntu 24.04+ y el sandbox**: `npm run dev` usa `--noSandbox` porque el sistema no deja usar el
  sandbox de Chromium desde `node_modules`. La app instalada por `.deb` no lo necesita.
- **npm 11 bloquea scripts de instalación**: `electron` y `esbuild` están aprobados en `allowScripts`
  del `package.json`. Si un paquete nuevo necesita su script: `npm approve-scripts <paquete>`.
- **`npm run dev` no recarga el proceso principal**: si se cambia algo en `src/main/`, hay que cerrar la
  app (Salir desde el ícono) y volver a abrirla. La interfaz sí se recarga sola.
- **El ícono de la barra no puede mostrar texto en GNOME**: el tiempo restante está en su menú, en el
  título de la ventana y en el color del tomate.
- **Para matar la app desde un script**: `pkill -f '[o]bsidian-pomodoro/node_modules/electron'`
  (los corchetes evitan que `pkill -f` se mate a sí mismo).
- **Cerrar la ventana no cierra la app**: sigue en el ícono de la barra. Salir = menú del ícono → Salir.

## Repos

- App (público): https://github.com/IgnacioAScotto/obsidian-pomodoro
- Vault (privado): https://github.com/IgnacioAScotto/cerebro-digital
