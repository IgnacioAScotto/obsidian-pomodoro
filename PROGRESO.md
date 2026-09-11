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

## Estado al 2026-09-11

| Fase | Qué quedó | PR |
|---|---|---|
| 0 · Preparación | repo público, README, CLAUDE.md, licencia MIT; vault versionado en repo privado | — |
| 1 · Timer | pomodoro 25/5/15 (largo cada 4), notificaciones, campanita, ícono de tomate en la barra con menú, cerrar = esconder | #1 ✅ |
| 2 · Registro | selector "¿Qué estudiás?" (Facultad / Por mi cuenta + tema), cada foco se agrega a `Sistema/Pomodoro/AAAA-MM.md`, ajustes (vault y duraciones) | #2 ✅ |
| 3 · Estadísticas | pantalla 📊 (semana/mes/año, filtro por ámbito, barras por materia, evolución) + tablero `Sistema/Tableros/Tiempo de estudio.md` en el vault | #3 ✅ |
| 4 · Tareas (leer) | — | pendiente |
| 5 · Tareas (completar) | — | pendiente |
| 6 · Instalable | `.deb` 0.3.0 (con perfil de AppArmor), lanzador de GNOME, bienvenida para elegir el vault, arranque automático opcional en ⚙ | #4 (falta que Nacho lo instale y lo pruebe) |

Fases 0–3 probadas por Nacho y mergeadas a `main`. 39 tests pasando (`npm test`).

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

### Fase 6 · Instalable (en PR #4, falta la prueba de Nacho)

- Construido y revisado: `dist/obsidian-pomodoro_0.3.0_amd64.deb` (~93 MB). Instala en
  `/opt/Obsidian Pomodoro/`, el comando `obsidian-pomodoro`, el `.desktop` con `StartupWMClass=obsidian-pomodoro`
  (coincide con `desktopName` del `package.json`) y el ícono. El post-install de electron-builder ajusta
  `chrome-sandbox` e instala un perfil de AppArmor en `/etc/apparmor.d/obsidian-pomodoro` (Ubuntu 24.04+).
- Solo `.deb`: la AppImage choca con AppArmor en Ubuntu 24.04+.
- Instalar/actualizar: `npm run build:linux && sudo apt install ./dist/obsidian-pomodoro_*_amd64.deb`
  (lo corre Nacho: pide contraseña). Desinstalar: `sudo apt remove obsidian-pomodoro`.
- La app instalada usa `~/.config/Obsidian Pomodoro/` (dev usa `… (dev)`) y arranca **sin vault**: muestra
  una bienvenida con el botón "Elegir vault…".
- Arranque automático: casilla en ⚙ → *Inicio* (solo en la app instalada). Escribe
  `~/.config/autostart/obsidian-pomodoro.desktop` con `--hidden`, que abre solo el ícono de la barra.
- **A verificar con Nacho**: que en el dock aparezca el tomate y no una rueda genérica (si falla, revisar
  el `app_id` de Wayland contra `StartupWMClass`), las notificaciones y el ícono de la barra.

### Recomendación: después, Fase 4

Con la app instalada y apuntando al vault real, el tablero junta datos reales mientras se hacen las
tareas (Fases 4 y 5). Al terminar cada una: subir la versión y reinstalar el `.deb`.

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
src/main/autostart.ts      arranque automático (~/.config/autostart), solo en la app instalada
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
- **Para matar la app desde un script, cuidado con `pkill -f`**: mira la línea de comando completa de
  cada proceso, así que si el patrón aparece en cualquier parte del comando que lo ejecuta (por ejemplo,
  en la misma línea que lanzó la app), **mata a la propia terminal** (sale con código 144). Pasó dos veces.
  - Dev: `pkill -f '[o]bsidian-pomodoro/node_modules/electron'`, en un comando **aparte** del que la lanzó.
  - Empaquetada: por nombre de proceso, sin `-f`: `pkill obsidian-pomod` (el nombre se corta a 15 letras).
- `~/.config/Obsidian Pomodoro/` tiene caché de Chromium de las primeras pruebas (Fase 1): es inofensiva,
  no hay `config.json`.
- **Cerrar la ventana no cierra la app**: sigue en el ícono de la barra. Salir = menú del ícono → Salir.

## Repos

- App (público): https://github.com/IgnacioAScotto/obsidian-pomodoro
- Vault (privado): https://github.com/IgnacioAScotto/cerebro-digital
