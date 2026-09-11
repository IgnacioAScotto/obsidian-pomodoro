# AGENTS.md — Obsidian Pomodoro

> **Documento único del proyecto.** Con este archivo alcanza para entender qué es la app, para qué
> sirve, qué se hizo, dónde estamos, qué falta y cómo hay que trabajar. Lo leen Hermes, Claude Code,
> Codex o Cursor. Mantenelo al día y **por debajo de 20.000 caracteres**: Hermes recorta los archivos
> de contexto más largos. Última actualización: **2026-09-11**.

## 1. Qué es y para qué

**Obsidian Pomodoro** es una app de escritorio para Linux (Ubuntu 26.04, GNOME, Wayland) de **Nacho**
(Ignacio A. Scotto), estudiante de informática en la UNAHUR. Junta tres cosas:

1. **Timer pomodoro** (foco / descanso corto / descanso largo).
2. **Registro del tiempo de estudio en su vault de Obsidian**: cada foco queda anotado con la materia
   (o tema propio) y el tema, para ver en gráficos cuánto estudió de cada cosa por semana, mes y año.
3. **Gestor de tareas** que lee las tareas del vault (plugin Tasks) y las marca como hechas en
   Obsidian. **Todavía no existe: son las Fases 4 y 5.**

**A dónde quiere llegar**: una sola herramienta para estudiar, siempre a mano (ícono en la barra,
arranca con la compu), donde Nacho ve qué tiene que hacer, elige una tarea o materia, arranca un
pomodoro, marca la tarea como hecha y después mira cuánto estudió para sacar conclusiones.

**Principio**: **Obsidian es la fuente de verdad.** La app no tiene base de datos: tareas y tiempo
viven en Markdown del vault, legibles, editables a mano y versionados con Git.

**Objetivo paralelo**: es su **primera app hecha "vibecodeando"**. El código lo escribe la IA; Nacho
prueba, decide y aprende el flujo (Git, ramas, PR, tests, empaquetado).

- Código: `~/Documents/Proyectos/obsidian-pomodoro` → https://github.com/IgnacioAScotto/obsidian-pomodoro (público)
- Vault: `~/Documents/Obsidian/Cerebro Digital` → https://github.com/IgnacioAScotto/cerebro-digital (privado)

## 2. Cómo trabajar con Nacho

- **Español rioplatense** (voseo), directo. Interfaz, commits, comentarios y docs en español; nombres
  de variables y funciones en inglés.
- **Es principiante**: explicá en criollo, sin dar nada por sabido, pero sin abrumar.
- **Fases chicas**: cada fase se prueba antes de seguir. Nacho usa la app, dice qué le molesta, se
  corrige en la misma rama y recién ahí se mergea. **No arranques una fase sin que te lo pida.**
- **No escribe código.** Lo que pida `sudo` lo corre él: dale el comando exacto para pegar en su
  terminal (Ctrl+Alt+T, pegar con Ctrl+Shift+V) y explicale qué va a ver.
- **No inventes**: verificá el estado (archivos, `git`, `gh`) antes de afirmar algo.

## 3. Dónde estamos (2026-09-11)

| Fase | Qué incluye | Estado |
|---|---|---|
| 0 · Preparación | repos, README, licencia MIT; vault versionado con Git | ✅ |
| 1 · Timer | 25/5/15 (largo cada 4), notificaciones, campanita, ícono de tomate en la barra, cerrar = esconder | ✅ PR #1 |
| 2 · Registro | "¿Qué estudiás?" (Facultad / Por mi cuenta + tema), cada foco se escribe en el vault, ajustes | ✅ PR #2 |
| 3 · Estadísticas | pantalla 📊 (semana/mes/año, filtros, barras, evolución) + tablero en el vault | ✅ PR #3 |
| 6 · Instalable | `.deb` 0.3.0 con perfil de AppArmor, lanzador, bienvenida sin vault, arranque automático | ✅ PR #4 |
| 4 · Tareas (leer) | ver §4 | ⬜ **siguiente, sin empezar** |
| 5 · Tareas (completar) | ver §4 | ⬜ |

La 6 se hizo antes que la 4 para que Nacho use la app instalada todos los días mientras se hacen las
tareas. `main` tiene todo lo mergeado, no hay ramas abiertas. **39 tests** pasando.

**Instalado en la compu**: `obsidian-pomodoro 0.3.0` (`/opt/Obsidian Pomodoro/`), aparece en el
lanzador y apunta al vault `Cerebro Digital`. Todavía no registró ningún foco en el vault real.

### Pendientes antes de la Fase 4

1. **Verificar** con Nacho (no se confirmó): que el **dock de GNOME muestre el tomate** y no una rueda
   genérica, y que **un foco real** quede en `Sistema/Pomodoro/2026-09.md` del vault.
2. **Obsidian** (lo hace Nacho): tiene abierta como vault la carpeta de arriba (`~/Documents/Obsidian`)
   y no `Cerebro Digital`, así que las consultas con rutas del vault no encuentran nada. Arreglo:
   *Abrir otro vault → Abrir carpeta como vault →* `Cerebro Digital`. Después, **Ajustes → Dataview →
   Enable JavaScript Queries** (sin eso, el tablero *Tiempo de estudio* muestra código).
3. **Vault**: hay **17 cambios sin commit** de otra sesión de IA (notas de clase, `00 Contexto`,
   `Wiki/bitacora.md` con una línea de esta app). Preguntarle a Nacho y commitearlos.

## 4. Qué falta

### Fase 4 · Tareas (leer)

Vista "Tareas" con las pendientes del vault, ordenadas como el tablero *Hoy* de Obsidian.

- Nuevo `src/main/vault/tasks.ts` + `tests/tasks.test.ts` (agregar tareas de ejemplo a `test-vault/`).
- **Recorrer** los `.md` del vault **salvo** `Fuentes/` (**no seguir symlinks**: apunta a GB de PDFs),
  `Sistema/Plantillas/` y `Sistema/Agente/` (tareas de ejemplo), `.obsidian/`, `.trash/`. Ignorar
  bloques de código (```` ``` ````).
- **Tarea** = línea `- [ ]` o `- [x]` con sintaxis del plugin Tasks (§5.2). Extraer: texto, 📅 vence,
  ⏳ programada, 🛫 inicio, ✅ hecha, 🔁 recurrencia, `#tags`, archivo, n° de línea, **línea original
  exacta** (la usa la Fase 5) y **materia por ruta** (`Cursada/Materias/<Materia>/…`).
- **Orden**: grupos de prioridad de §5.3, dentro de cada grupo por fecha, **Curso Python al final**.
- **Vista**: botón nuevo arriba (junto a 📊 y ⚙), filtro por materia, de qué nota viene cada tarea.
- **En vivo**: `chokidar` (debounce ~500 ms) + evento por IPC, para reflejar ediciones en Obsidian.

### Fase 5 · Tareas (completar)

- **Marcar** (lo más delicado de la app): releer el archivo; comprobar que en la línea guardada siga
  **exactamente** la línea original; si no, buscarla textual; si no aparece o aparece más de una vez,
  **no tocar nada**, avisar y refrescar. Si está: `- [ ]` → `- [x]` + ` ✅ AAAA-MM-DD` (fecha local) al
  final, o antes de un block id `^abc` si lo hay. Escribir cambiando **solo esa línea**.
- **Desmarcar**: lo inverso. **Recurrentes (🔁)**: se muestran, no se completan desde la app; botón para
  abrirlas en Obsidian (`obsidian://open?vault=…&file=…`).
- **"Arrancar pomodoro"** desde una tarea: materia de la ruta, texto de la tarea como tema.
- Tests: línea movida, editada, duplicada, block id, CRLF, sin salto final.
- Al terminar: subir versión en `package.json`, `npm run build:linux`, Nacho reinstala el `.deb`.

**Ideas sin compromiso**: capturar tareas al `00 Inbox.md`, atajo global, "tiempo dedicado" en la nota
de cada materia, metas semanales de horas.

## 5. El vault de Obsidian (lo que la app necesita)

Es el "segundo cerebro" de Nacho, con **sus propias instrucciones** en `Cerebro Digital/CLAUDE.md` y
`Sistema/Agente/`. Si trabajás *en el vault*, seguí esas reglas.

### 5.1 Estructura

```
Cerebro Digital/
├── 00 Inbox.md · CLAUDE.md · AGENTS.md
├── Fuentes/        PDFs de la facu (symlink) — SOLO LECTURA, fuera de Git
├── Wiki/           conocimiento (Conceptos/, indice.md, bitacora.md…)
├── Cursada/2026-C2.md · Cursada/Materias/<Materia>/  (<Materia>.md, Clases/, Guias/, Parciales/)
└── Sistema/        Plantillas/ · Tableros/ (Hoy, Semana, Mes, Backlog, Tiempo de estudio) ·
                    Pomodoro/ (lo escribe la app) · Agente/
```

Materias 2026-C2 (la app las lee de las carpetas): Base de Datos, Curso Python, Estructura de Datos,
Lenguajes Informáticos I, Matemática II, Objetos II. Plugins: **Tasks 8.4** (por defecto: emoji,
agrega ✅ al completar, sin filtro global), **Dataview 0.5.68**. Obsidian 1.13.7. Toda nota tiene
`tipo:` en el frontmatter; fechas ISO; wikilinks `[[…]]`.

### 5.2 Tareas

```markdown
- [ ] Resolver Guía 05 de Estructura de Datos 📅 2026-09-15 #facultad
- [x] Leer apunte de recursión 📅 2026-09-08 ✅ 2026-09-07
```

Emojis: 📅 vence · ⏳ programada · 🛫 inicio · ✅ hecha · 🔁 recurrencia · ➕ creada. **La prioridad
no se escribe con emoji**, se deriva de la fecha. Tags: `#facultad`, `#high-focus`, `#low-energy`,
`#mantenimiento`, `#esperando`.

### 5.3 Prioridad (reglas del vault, ver `Sistema/Tableros/Hoy.md`)

| Grupo | Cuándo |
|---|---|
| 🔺 Urgente | vence hoy o mañana, **y todo lo vencido** (no baja de nivel) |
| ⏫ Alto | vence en 2 a 7 días |
| 🔼 Medio | vence en 8 a 31 días |
| 🔽 Bajo | sin fecha |

Entre materias se ordena **solo por fecha**. **Curso Python siempre último.** Tareas a más de 31 días:
*Hoy* no las muestra; **preguntarle a Nacho** (propuesta: grupo "Más adelante").

### 5.4 Registro de estudio (lo escribe la app)

`Sistema/Pomodoro/AAAA-MM.md`, uno por mes, frontmatter `tipo: registro-estudio` y `mes: AAAA-MM`,
un título y un callout; después una línea por foco:

```markdown
- [fecha:: 2026-09-10T19:30] [ambito:: facultad] [materia:: [[Objetos II]]] [tema:: Patrón Strategy] [minutos:: 25]
- [fecha:: 2026-09-10T20:05] [ambito:: autoestudio] [materia:: Inglés] [minutos:: 25]
```

- `fecha` = hora local de inicio. `ambito`: `facultad` (wikilink) o `autoestudio` (texto). `tema` opcional.
- Se guarda un foco completo o uno cortado de **5 minutos o más**. **La app solo agrega al final.**
- Documentado también en el vault (`CLAUDE.md`, `Sistema/Agente/01 Convenciones.md`). **Si cambiás el
  formato**, cambiá el parser (`src/main/vault/log.ts`), el tablero y esa documentación.
- Tablero `Sistema/Tableros/Tiempo de estudio.md` (en el vault): `dataviewjs` + mermaid con resumen,
  torta y tabla por materia (semana/mes/año) y horas por semana y por mes.

**La app solo puede**: agregar líneas al registro y (Fase 5) cambiar checkbox + ✅ de una tarea.

## 6. Arquitectura

**Stack**: Electron 39, electron-vite 5, React 19, TypeScript, Vitest, Recharts, electron-builder 26.
CSS propio (`main.css`, paleta Catppuccin Mocha).

**Proceso principal** (`src/main/`, Node) = ventana, barra, notificaciones, timer, config y **todo el
disco**. **Interfaz** (`src/renderer/`, React) **nunca toca el disco**: usa `window.api` (preload).

```
src/main/index.ts          ventana, ícono, notificaciones, IPC, guarda los focos, ciclo de vida
src/main/timer.ts          PomodoroTimer (eventos state / phase-end)
src/main/config.ts         config JSON (userData/config.json)
src/main/autostart.ts      ~/.config/autostart/obsidian-pomodoro.desktop (solo instalada)
src/main/vault/log.ts      escribir/leer el registro (§5.4)
src/main/vault/catalog.ts  materias, conceptos (Wiki/Conceptos), temas y áreas usadas
src/shared/                tipos, Api (window.api), stats.ts (cuentas de estadísticas)
src/preload/index.ts       window.api con ipcRenderer
src/renderer/src/          App.tsx + components/ (Timer, SubjectPicker, Stats, Settings)
tests/  test-vault/  resources/ (íconos)  build/icon.png
```

**Agregar algo a `window.api`**: tipo en `src/shared/api.ts` → `src/preload/index.ts` →
`ipcMain.handle/on` en `src/main/index.ts`. Hoy existen `app.info`, `app.autostart.get/set`,
`config.get/update`, `vault.choose/catalog`, `timer.getState/toggle/skip/reset/onState/onPhaseEnd`,
`log.entries/onSaved/onError`.

**Decisiones (no re-discutir sin motivo)**:
- El timer vive en el proceso principal y se calcula desde la **hora de fin**, no contando segundos.
- Descanso arranca solo, foco no. Duraciones configurables en ⚙.
- **Sin materia elegida no arranca un foco**; durante el foco la selección se bloquea.
- Cerrar la ventana la esconde; se sale desde el menú del ícono. Una sola instancia.
- **Dev vs instalada**: dev usa `~/.config/Obsidian Pomodoro (dev)/` y `test-vault/`; la instalada,
  `~/.config/Obsidian Pomodoro/` y arranca sin vault (bienvenida para elegirlo).
- **Solo `.deb`**: `/opt` + `chrome-sandbox` + perfil de AppArmor (Ubuntu 24.04+). La AppImage choca
  con AppArmor. `desktopName` = `obsidian-pomodoro.desktop`, `StartupWMClass=obsidian-pomodoro`.
- El ícono de la barra en GNOME **no muestra texto**: tiempo en su menú, en el título y en el color.

## 7. Reglas duras

1. La app toca el vault **solo** como dice §5.4. Nunca reescribe archivos enteros ni escribe en `Fuentes/`.
2. Antes de modificar una tarea: **releer y verificar la línea exacta**; si no coincide, no tocar.
3. Todo lo que lee o escribe el vault lleva **tests** contra una copia de `test-vault/`
   (`makeTempVault()` en `tests/helpers.ts`). Probar primero en `test-vault/`.
4. `npm run typecheck` y `npm test` pasan antes de cada commit.
5. No mergear una fase sin que Nacho la haya probado.

## 8. Flujo de trabajo y comandos

- **Una rama por fase** (`fase-4-tareas`) desde `main` actualizado → commits chicos en español →
  `git push -u origin <rama>` → `gh pr create` (qué trae, cómo probarlo, checklist) → Nacho prueba →
  correcciones en la rama → `gh pr merge <n> --merge --delete-branch`. `main` siempre funciona.
- Al cerrar una fase: actualizar este archivo (§3) y la tabla del `README.md`.
- En desarrollo, los cambios en `src/main/` no se recargan: salir de la app y volver a correr.

```bash
npm run dev          # desarrollo (usa test-vault/)
npm run dev:rapido   # foco de 1 min, descansos de 15/30 s
npm test             # tests
npm run typecheck
npm run build:linux  # dist/obsidian-pomodoro_<versión>_amd64.deb
sudo apt install ./dist/obsidian-pomodoro_<versión>_amd64.deb   # lo corre Nacho
```

## 9. Trabajar con Hermes

Nacho sigue el proyecto con **Hermes Agent** (v0.21, instalado en `~/.local/bin/hermes`), configurado
con `claude-opus-5` y proveedor `anthropic` (API de Claude).

- **Abrirlo en la carpeta del proyecto**, así carga este archivo:
  `cd ~/Documents/Proyectos/obsidian-pomodoro && hermes` (o `hermes --in ~/Documents/Proyectos/obsidian-pomodoro`).
  Hermes busca `.hermes.md` → `AGENTS.override.md` → `AGENTS.md` → `CLAUDE.md` y usa **el primero**.
  **No lo abras en el vault**: ahí cargaría las instrucciones del vault.
- **No crees `.hermes.md` ni `AGENTS.override.md`** en el repo: taparían este archivo. `CLAUDE.md`
  solo importa este archivo para Claude Code.
- Si este archivo pasa ~20.000 caracteres, Hermes lo recorta: mantenelo compacto.
- Herramientas en la compu: git, `gh` (logueado como IgnacioAScotto), Node 24 / npm, Python 3.
  Sin `sudo`: eso lo hace Nacho.
- **Primer mensaje sugerido**: *"Leé AGENTS.md, revisá `git status` y `git log -5`, resolvé conmigo los
  pendientes de §3 y después contame el plan para la Fase 4 antes de escribir código."*

## 10. Problemas conocidos

- **Sandbox en dev**: Ubuntu 24.04+ no deja usar el sandbox de Chromium desde `node_modules`; los
  scripts `dev` usan `--noSandbox`. La instalada no lo necesita.
- **npm 11** bloquea scripts de instalación: `electron` y `esbuild` están en `allowScripts`
  (`package.json`). Paquete nuevo con script: `npm approve-scripts <paquete>`.
- **`pkill -f`** mira la línea de comando completa: si el patrón aparece en el mismo comando que lo
  ejecuta, **mata a la propia terminal** (código 144, pasó dos veces). Dev, en un comando aparte:
  `pkill -f '[o]bsidian-pomodoro/node_modules/electron'`. Instalada: `pkill obsidian-pomod`.
- `sudo apt install` de un `.deb` local avisa *"Download is performed unsandboxed as root"*: normal.

## 11. Historial

- **2026-09-10**: plan de 7 fases aprobado; Fases 0–3 hechas y mergeadas (PR #1–#3); vault en Git;
  tablero *Tiempo de estudio* y documentación del registro en el vault.
- **2026-09-11**: Fase 6 (`.deb` 0.3.0) instalada y mergeada (PR #4); vault real elegido en la app.
  Este archivo pasa a ser el documento único, preparado para seguir con Hermes.
