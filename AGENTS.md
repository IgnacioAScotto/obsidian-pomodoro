# AGENTS.md — Obsidian Pomodoro

> **Este archivo es la única fuente de verdad del proyecto.** Si sos una IA (Claude, Codex, Cursor,
> Copilot, lo que sea) y vas a trabajar acá, leelo completo: con esto alcanza para entender qué es,
> qué está hecho, qué falta, cómo está armado y cómo hay que trabajar. Al terminar cualquier cambio
> importante, **actualizá la sección [Estado actual](#4-estado-actual)**.
>
> Última actualización: **2026-09-11**.

---

## 1. Qué es

**Obsidian Pomodoro** es una app de escritorio para Linux (Ubuntu, GNOME) que junta tres cosas:

1. **Un timer pomodoro** (foco / descanso corto / descanso largo).
2. **Un registro del tiempo de estudio dentro de Obsidian**: cada bloque de foco queda anotado en el
   vault con la materia (o el tema propio) y el tema, para después ver en gráficos a qué le dedicó más
   tiempo en la semana, el mes y el año.
3. **Un gestor de tareas** que lee las tareas del vault (plugin Tasks de Obsidian) y, cuando se marcan
   como hechas en la app, quedan marcadas en Obsidian. *(Todavía no está hecho: Fases 4 y 5.)*

Es un proyecto personal de **Nacho** (Ignacio A. Scotto), estudiante de informática en la UNAHUR, y es
**su primera app hecha "vibecodeando"**: el código lo escribe la IA, Nacho prueba, decide y aprende.

- Código: `~/Documents/Proyectos/obsidian-pomodoro` · repo **público**
  https://github.com/IgnacioAScotto/obsidian-pomodoro
- Vault de Obsidian: `~/Documents/Obsidian/Cerebro Digital` · repo **privado**
  https://github.com/IgnacioAScotto/cerebro-digital

## 2. A dónde quiere llegar

La meta es **una sola herramienta de escritorio para estudiar**, siempre a mano (ícono en la barra,
arranca con la compu), donde Nacho:

1. **Ve qué tiene que hacer**: las tareas de su vault, ordenadas con las mismas reglas de prioridad que
   ya usa en Obsidian (por vencimiento).
2. **Elige una tarea o una materia y arranca un pomodoro** sin salir de la app.
3. **Marca la tarea como hecha** y queda hecha en Obsidian.
4. **Mira cuánto estudió** de cada materia y de cada tema propio (semana, mes, año) para sacar
   conclusiones: a qué le dedica más, a qué le falta, cómo evoluciona.

Principio de diseño: **Obsidian es la fuente de verdad.** La app no tiene base de datos propia: todo lo
que importa (tareas, tiempo estudiado) vive en archivos Markdown del vault, legibles y editables a mano,
versionados con Git. La app lee y escribe esos archivos de forma mínima y cuidadosa.

Objetivo paralelo: que Nacho **aprenda el flujo de desarrollo** (Git, ramas, Pull Requests, tests,
empaquetado) haciendo algo que usa todos los días.

## 3. Cómo trabajar con Nacho

- **Idioma**: español rioplatense (voseo), directo, sin relleno. La interfaz de la app, los mensajes de
  commit, los comentarios del código y la documentación van en español. Los nombres de variables y
  funciones, en inglés.
- **Es principiante en desarrollo de apps.** Explicá lo que hacés en criollo y sin dar nada por sabido
  (qué es un commit, un PR, un proceso principal de Electron). Pero no lo abrumes: lo justo.
- **Fases chicas y probadas.** Cada fase se prueba antes de pasar a la siguiente. Nacho la usa, dice
  qué le molesta en lenguaje normal, se corrige en la misma rama, y recién ahí se mergea.
- **Él no escribe código.** Si hace falta que corra algo que pide contraseña (`sudo`), dale el comando
  exacto para pegar en su terminal (Ctrl+Alt+T, pegar con Ctrl+Shift+V) y explicale qué va a ver.
- **No inventes**: si no sabés algo del vault o del estado, fijate (archivos, `git`, `gh`) antes de afirmar.
- Nacho puede comentar en el chat sin haber probado todo: antes de mergear, confirmá que probó lo que
  la fase necesita.

---

## 4. Estado actual

| Fase | Qué incluye | Estado |
|---|---|---|
| 0 · Preparación | repo público, README, licencia MIT, estructura; vault versionado en repo privado | ✅ |
| 1 · Timer | pomodoro 25/5/15 (largo cada 4), notificaciones de GNOME, campanita, ícono de tomate en la barra con menú, cerrar la ventana = esconderla | ✅ PR #1 |
| 2 · Registro | selector "¿Qué estudiás?" (Facultad / Por mi cuenta + tema), cada foco se escribe en `Sistema/Pomodoro/AAAA-MM.md`, ajustes (vault y duraciones) | ✅ PR #2 |
| 3 · Estadísticas | pantalla 📊 en la app (semana/mes/año, filtro por ámbito, barras por materia, evolución) + tablero `Sistema/Tableros/Tiempo de estudio.md` en el vault | ✅ PR #3 |
| 6 · Instalable | paquete `.deb` 0.3.0 con perfil de AppArmor, entrada en el lanzador, bienvenida para elegir el vault, arranque automático opcional | 🟡 PR #4 abierto |
| 4 · Tareas (leer) | lista de tareas del vault con prioridades | ⬜ pendiente |
| 5 · Tareas (completar) | marcar/desmarcar desde la app | ⬜ pendiente |

La Fase 6 se hizo antes que la 4 a propósito: así Nacho usa la app instalada todos los días (y el
tablero junta datos reales) mientras se hacen las tareas.

**Tests**: 39 pasando (`npm test`). **Rama actual**: `fase-6-instalable`.

### Pendientes inmediatos, en orden

1. **Terminar de probar la Fase 6.** El `.deb` ya está instalado (`dpkg`: `obsidian-pomodoro 0.3.0`,
   perfil de AppArmor en `/etc/apparmor.d/obsidian-pomodoro`) y aparece en el lanzador. Falta que Nacho:
   - confirme que en el **dock de GNOME se ve el tomate** y no una rueda genérica (si sale la rueda:
     revisar que el `app_id` de Wayland coincida con `StartupWMClass=obsidian-pomodoro`);
   - en la bienvenida elija el vault **`~/Documents/Obsidian/Cerebro Digital`** (al 2026-09-11 la app
     instalada todavía no tenía vault y el vault real no tenía `Sistema/Pomodoro/`);
   - haga un foco real y se verifique la línea en `Sistema/Pomodoro/2026-09.md`.
   Después: **mergear el PR #4** (`gh pr merge 4 --merge --delete-branch`) y marcar la fase como ✅ acá.
2. **Arreglos en Obsidian (los hace Nacho, 2 minutos):**
   - Obsidian tiene registrada como vault la carpeta **de arriba** (`~/Documents/Obsidian`), no
     `Cerebro Digital`. Así las consultas del vault con rutas (`FROM "Cursada/…"`, `"Sistema/Pomodoro"`)
     no encuentran nada. Arreglo: *Abrir otro vault → Abrir carpeta como vault →* `Cerebro Digital`.
     (Es una migración que el propio vault marca como pendiente en `Sistema/Agente/04 Montaje.md`;
     `Sistema/Agente/setup.sh` copia la config y los plugins hacia adentro.)
   - Activar **Ajustes → Dataview → Enable JavaScript Queries** en ese vault. Sin eso, el tablero
     *Tiempo de estudio* muestra código en vez de gráficos.
3. **Cambios sin commit en el repo del vault**: al 2026-09-11 había **17**, hechos por otra sesión de IA
   (notas de clase nuevas, `Sistema/Agente/00 Contexto.md`, una clase renombrada y `Wiki/bitacora.md`,
   que además tiene una línea `setup` de esta app). No se commitearon porque no eran de este trabajo:
   preguntarle a Nacho y commitearlos juntos.
4. **Fase 4** (ver abajo).

---

## 5. Lo que falta

### Fase 4 · Tareas (leer)

**Objetivo**: una vista "Tareas" en la app con las tareas pendientes del vault, ordenadas como en el
tablero *Hoy* de Obsidian, para elegir qué estudiar.

- Nuevo `src/main/vault/tasks.ts` (+ tests en `tests/tasks.test.ts` contra `test-vault/`, al que hay que
  agregarle tareas de ejemplo en las notas de las materias).
- **Qué archivos recorrer**: todos los `.md` del vault **salvo** `Fuentes/` (y **no seguir symlinks**:
  `Fuentes/Facultad` apunta a varios GB de PDFs), `Sistema/Plantillas/`, `Sistema/Agente/` (ahí las
  tareas son ejemplos), `.obsidian/`, `.trash/`. Ignorar lo que esté dentro de bloques de código
  (```` ``` ````), porque ahí hay consultas `tasks` y ejemplos.
- **Qué es una tarea**: una línea de lista con checkbox, `- [ ]` (pendiente) o `- [x]` (hecha), con la
  sintaxis emoji del plugin Tasks (ver [§6.3](#63-tareas)). De cada una sacar: texto limpio, 📅 vence,
  ⏳ programada, 🛫 inicio, ✅ fecha de hecha, 🔁 recurrencia, `#tags`, archivo, número de línea,
  **la línea original exacta** (la necesita la Fase 5) y **la materia según la ruta**
  (`Cursada/Materias/<Materia>/…` → `<Materia>`; fuera de ahí, sin materia).
- **Orden y prioridad** (copiar las reglas del vault, [§6.4](#64-prioridad-de-tareas)): grupos
  🔺 / ⏫ / 🔼 / 🔽 derivados de la fecha, dentro de cada grupo por fecha, y **Curso Python siempre al
  final**, en su propio grupo.
- **Vista**: nuevo botón en la barra de arriba (junto a 📊 y ⚙). Filtro por materia. Mostrar de qué
  nota viene cada tarea.
- **Actualización en vivo**: vigilar el vault con `chokidar` (debounce ~500 ms) para que si Nacho edita en
  Obsidian, la lista cambie sola. Mandar un evento por IPC a la interfaz.

### Fase 5 · Tareas (completar)

- **Marcar como hecha** (regla dura, es lo más delicado de toda la app):
  1. Releer el archivo en ese momento.
  2. Comprobar que en el número de línea guardado siga **exactamente** la línea original. Si cambió,
     buscar esa línea exacta en el archivo; si no aparece, o aparece más de una vez, **no tocar nada**,
     avisar y refrescar la lista.
  3. Reemplazar `- [ ]` por `- [x]` y agregar ` ✅ AAAA-MM-DD` (fecha local de hoy) al final, que es lo
     que hace el plugin Tasks. Si la línea termina en un block id (`^abc123`), la fecha va antes del id.
  4. Escribir el archivo cambiando **solo esa línea** (conservar saltos de línea y todo lo demás).
- **Desmarcar**: lo inverso (`- [x]` → `- [ ]` y sacar el ` ✅ fecha`).
- **Tareas recurrentes (🔁)**: se muestran pero **no** se completan desde la app (el plugin Tasks crea la
  siguiente repetición y replicarlo es propenso a errores). Botón para abrir la nota en Obsidian:
  `obsidian://open?vault=<nombre>&file=<ruta sin .md>`.
- **"Arrancar pomodoro" desde una tarea**: completa el selector con la materia (de la ruta) y el texto
  de la tarea como tema, y va al timer.
- Tests exhaustivos: línea movida, línea editada, línea duplicada, block id, CRLF, archivo con y sin
  salto de línea final.
- Al terminar: subir versión (`package.json`), `npm run build:linux` y que Nacho reinstale el `.deb`.

### Ideas para después (no comprometidas)

Capturar tareas nuevas al `00 Inbox.md` del vault · atajo de teclado global para iniciar/pausar ·
sección "Tiempo dedicado" en la nota de cada materia · modo foco (bloquear distracciones) ·
metas semanales de horas por materia.

---

## 6. El vault de Obsidian (lo que la app necesita saber)

El vault es el "segundo cerebro" de Nacho. Tiene **sus propias instrucciones para IAs** en
`Cerebro Digital/CLAUDE.md` (y un `AGENTS.md` que apunta ahí) y un dossier en `Sistema/Agente/`: si
alguna vez tenés que trabajar *en el vault* (no en la app), seguí esas reglas. Acá está solo lo
necesario para la app.

### 6.1 Estructura

```
Cerebro Digital/
├── CLAUDE.md · AGENTS.md          instrucciones del vault
├── 00 Inbox.md                    captura rápida
├── Fuentes/                       bibliografía (symlink a PDFs de la facu) — SOLO LECTURA, no está en Git
├── Wiki/                          conocimiento (Conceptos/, Resumenes/, …, indice.md, bitacora.md)
├── Cursada/
│   ├── 2026-C2.md                 panel del cuatrimestre
│   └── Materias/<Materia>/        una carpeta por materia: <Materia>.md (MOC), Clases/, Guias/, Parciales/
└── Sistema/
    ├── Plantillas/                plantillas de Templater (tienen tareas de ejemplo: ignorar)
    ├── Tableros/                  Hoy · Semana · Mes · Backlog · Tiempo de estudio
    ├── Pomodoro/                  ← lo escribe la app (registro de estudio, uno por mes)
    └── Agente/                    dossier para la IA del vault (tiene tareas de ejemplo: ignorar)
```

Materias del cuatrimestre 2026-C2 (carpetas de `Cursada/Materias/`): Base de Datos, Curso Python,
Estructura de Datos, Lenguajes Informáticos I, Matemática II, Objetos II. La app las lee de las
carpetas, no están fijas en el código.

Plugins de Obsidian instalados que importan: **Tasks** (8.4, configuración por defecto: formato emoji,
agrega ✅ fecha al completar, sin filtro global), **Dataview** (0.5.68), Templater. Obsidian 1.13.7
(renderiza mermaid, incluidos `pie` y `xychart-beta`).

### 6.2 Convenciones generales

- Toda nota tiene `tipo:` en el frontmatter (`clase`, `guia`, `parcial`, `materia`, `tablero`,
  `registro-estudio`, …). Fechas del frontmatter en ISO `AAAA-MM-DD`.
- Enlaces con wikilinks `[[Nombre]]`. Nombres de archivo en español, con tildes y espacios.
- **Nunca** escribir en `Fuentes/`.

### 6.3 Tareas

Sintaxis del plugin Tasks, dentro de la nota a la que pertenecen (no hay lista central):

```markdown
- [ ] Resolver Guía 05 de Estructura de Datos 📅 2026-09-15 #facultad
- [x] Leer el apunte de recursión 📅 2026-09-08 ✅ 2026-09-07
```

- Emojis: 📅 vence · ⏳ programada · 🛫 inicio · ✅ hecha · 🔁 recurrencia · ➕ creada.
  **La prioridad NO se escribe con emoji** en este vault: se deriva de la fecha (ver abajo).
- Tags: `#facultad` (todo lo de la cursada) · `#high-focus` · `#low-energy` · `#mantenimiento` ·
  `#esperando`.

### 6.4 Prioridad de tareas

Se **deriva del vencimiento**, nunca se fija a mano (reglas del vault, ver `Sistema/Tableros/Hoy.md`):

| Grupo | Cuándo |
|---|---|
| 🔺 Urgente | vence hoy o mañana, **y todo lo vencido** (lo vencido no baja de nivel) |
| ⏫ Alto | vence en 2 a 7 días |
| 🔼 Medio | vence en 8 a 31 días |
| 🔽 Bajo | sin fecha |

- Las materias de la facultad valen todas lo mismo: entre ellas se ordena **solo por fecha**.
- **El Curso Python va siempre último**, sea cual sea su vencimiento (se reconoce por la ruta
  `Cursada/Materias/Curso Python/`).
- Tareas con vencimiento a más de 31 días: el tablero *Hoy* no las muestra. En la app, **preguntarle a
  Nacho** (propuesta: un grupo "Más adelante" al final).

### 6.5 Registro de estudio (lo escribe la app)

Un archivo por mes: `Sistema/Pomodoro/AAAA-MM.md`. Una línea por bloque de foco, con campos inline de
Dataview:

```markdown
---
tipo: registro-estudio
mes: 2026-09
---

# Registro de estudio — septiembre 2026

> [!info] Lo escribe la app Obsidian Pomodoro: una línea por bloque de foco.
> Se puede corregir a mano respetando el formato. El resumen está en [[Tiempo de estudio]].

- [fecha:: 2026-09-10T19:30] [ambito:: facultad] [materia:: [[Objetos II]]] [tema:: Patrón Strategy] [minutos:: 25]
- [fecha:: 2026-09-10T20:05] [ambito:: autoestudio] [materia:: Inglés] [minutos:: 25]
```

- `fecha`: hora **local** de inicio del foco. `ambito`: `facultad` (materia como wikilink a su nota) o
  `autoestudio` (texto libre, lo que Nacho estudia por su cuenta). `tema`: opcional. `minutos`: entero.
- Se guarda un foco completo, o uno cortado (saltado, reiniciado, app cerrada) si duró **5 minutos o más**.
- La app **solo agrega líneas al final**; nunca reescribe el archivo. Nacho puede corregir líneas a mano.
- El formato está documentado también en el vault (`CLAUDE.md`, `Sistema/Agente/01 Convenciones.md`).
  **Si lo cambiás, cambiá también el parser (`src/main/vault/log.ts`), el tablero del vault y esa documentación.**

### 6.6 Tablero *Tiempo de estudio*

`Sistema/Tableros/Tiempo de estudio.md` (en el vault, no en este repo). Un bloque `dataviewjs` que lee
`Sistema/Pomodoro/` y dibuja con mermaid: resumen de horas (semana / mes / año, facultad vs por mi
cuenta), torta y tabla por materia en cada período, horas por semana (últimas 16) y por mes. Necesita
Dataview JS activado.

### 6.7 Qué puede tocar la app en el vault

Solo dos cosas: **agregar líneas** al registro de `Sistema/Pomodoro/` y (Fase 5) **cambiar el checkbox
y la fecha ✅ de una tarea**. Nada más. El vault está en Git: `git diff` en el vault muestra exactamente
qué cambió.

---

## 7. Arquitectura de la app

### 7.1 Stack

- **Electron 39** + **electron-vite 5** + **React 19** + **TypeScript**.
- **Vitest** para tests · **Recharts** para gráficos · **electron-builder 26** para empaquetar.
- Sin librerías de estado ni de UI: React plano y un CSS propio (`main.css`, paleta Catppuccin Mocha).

### 7.2 Cómo está repartido

Electron tiene dos mundos:
- **Proceso principal** (`src/main/`, Node): ventana, ícono en la barra, notificaciones, timer, config y
  **todo el acceso al disco**.
- **Interfaz** (`src/renderer/`, React en la ventana): **nunca toca el disco**. Pide todo por IPC a través
  de `window.api`, que expone el **preload** (`src/preload/index.ts`).
- `src/shared/`: tipos y funciones puras que usan los dos lados (incluida la interfaz `Api`).

```
src/main/index.ts          ventana, ícono de la barra, notificaciones, IPC, registro de focos, ciclo de vida
src/main/timer.ts          PomodoroTimer: eventos `state` y `phase-end`
src/main/config.ts         config en JSON (userData/config.json): cargar, guardar, mezclar cambios parciales
src/main/autostart.ts      arranque automático (~/.config/autostart/obsidian-pomodoro.desktop)
src/main/vault/log.ts      escribir y leer el registro mensual (formato §6.5)
src/main/vault/catalog.ts  materias (carpetas), conceptos (Wiki/Conceptos), temas y áreas ya usados
src/shared/timer.ts        tipos del timer, duraciones por defecto, formatTime
src/shared/config.ts       AppConfig, Selection, LogEntry, Catalog, …
src/shared/stats.ts        cuentas de estadísticas (períodos, totales por materia, línea de tiempo)
src/shared/api.ts          interfaz Api = lo que existe en window.api
src/preload/index.ts       implementación de window.api con ipcRenderer
src/renderer/src/App.tsx   vistas (timer / estadísticas / ajustes), barra de arriba, avisos
src/renderer/src/components/  Timer, SubjectPicker, Stats, Settings
tests/                     Vitest (timer, log, catalog, config, stats, autostart)
test-vault/                vault falso con la misma estructura, para desarrollar y testear
resources/                 íconos del tomate (app y barra, 1x y 2x)
build/icon.png             ícono 512 px para el paquete
```

### 7.3 `window.api` (IPC)

| Llamada | Canal | Qué hace |
|---|---|---|
| `app.info()` | `app:info` | `{ fastMode, testVaultPath }` |
| `app.autostart.get()` / `.set(bool)` | `autostart:get` / `autostart:set` | solo en la app instalada |
| `config.get()` / `config.update(patch)` | `config:get` / `config:update` | config con cambios parciales |
| `vault.choose()` | `vault:choose` | diálogo de carpeta; valida que tenga `.obsidian` |
| `vault.catalog()` | `vault:catalog` | materias, conceptos, temas y áreas usadas |
| `timer.getState/toggle/skip/reset` | `timer:*` | control del pomodoro |
| `timer.onState(cb)` / `onPhaseEnd(cb)` | `timer:state` / `timer:phase-end` | eventos del timer |
| `log.entries()` | `log:entries` | todos los registros del vault |
| `log.onSaved(cb)` / `onError(cb)` | `log:saved` / `log:error` | aviso al guardar un foco |

Para agregar algo: tipo en `src/shared/api.ts` → implementación en `src/preload/index.ts` →
`ipcMain.handle/on` en `src/main/index.ts`.

### 7.4 Decisiones de diseño (no re-discutir sin motivo)

- **El timer vive en el proceso principal** y se calcula desde la hora de fin (`endAt`), no contando
  segundos: no se desfasa con la ventana escondida ni si la compu se traba. Emite `state` como mucho una
  vez por segundo.
- Por defecto: foco 25, descanso corto 5, largo 15 cada 4 focos; **el descanso arranca solo, el foco no**.
  Todo configurable en ⚙.
- **Sin materia elegida no se puede arrancar un foco** (si hay vault). Durante un foco la selección se
  bloquea: el tiempo es de lo que se eligió al arrancar.
- **Cerrar la ventana la esconde**; la app sigue en el ícono de la barra. Se sale desde el menú del ícono.
  Una sola instancia a la vez.
- **Desarrollo vs instalada**: en desarrollo la config va a `~/.config/Obsidian Pomodoro (dev)/` y el vault
  por defecto es `test-vault/`. La instalada usa `~/.config/Obsidian Pomodoro/` y arranca sin vault
  (muestra una bienvenida para elegirlo). Así las pruebas nunca tocan el vault real sin querer.
- **Empaquetado solo `.deb`**: instala en `/opt/Obsidian Pomodoro/` con `chrome-sandbox` y un perfil de
  AppArmor (Ubuntu 24.04+ restringe los user namespaces). La AppImage choca con AppArmor.
- `desktopName` (package.json) = `obsidian-pomodoro.desktop` y `StartupWMClass=obsidian-pomodoro`, para
  que GNOME asocie la ventana con el ícono del lanzador.
- El ícono de la barra en GNOME **no puede mostrar texto**: el tiempo restante va en su menú, en el título
  de la ventana y en el color del tomate (gris quieto, rojo foco, verde descanso corto, azul largo).

---

## 8. Reglas duras

1. **La app escribe en el vault solo lo de [§6.7](#67-qué-puede-tocar-la-app-en-el-vault).** Nunca
   reescribe un archivo con contenido reconstruido, nunca escribe en `Fuentes/`.
2. Antes de modificar una tarea: **releer el archivo y verificar la línea exacta**. Si no coincide, no tocar.
3. **Todo lo que lee o escribe el vault lleva tests** en `tests/`, contra una copia temporal de
   `test-vault/` (`tests/helpers.ts` → `makeTempVault()`).
4. Probar primero contra `test-vault/`; el vault real solo cuando la función sea confiable.
5. `npm run typecheck` y `npm test` tienen que pasar antes de cada commit.
6. No mergear una fase sin que Nacho la haya probado.
7. Si trabajás en el vault (no en la app), seguí `Cerebro Digital/CLAUDE.md`.

## 9. Flujo de trabajo

- **Una rama por fase** (`fase-4-tareas`, …) desde `main` actualizado (`git checkout main && git pull`).
- Commits chicos, **mensaje en español** (primera línea corta, después el detalle).
- `git push -u origin <rama>` → **Pull Request con `gh pr create`** (descripción: qué trae, cómo probarlo,
  checklist) → Nacho prueba → correcciones en la misma rama → `gh pr merge <n> --merge --delete-branch`.
- `main` siempre funciona.
- Al cerrar una fase: actualizar este archivo (estado y pendientes) y la tabla del `README.md`.
- Cambios en `src/main/` no se recargan solos en desarrollo: cerrar la app (menú del ícono → Salir) y
  volver a correr `npm run dev`. La interfaz sí se recarga sola.

## 10. Comandos

```bash
npm install            # dependencias
npm run dev            # app en modo desarrollo (usa test-vault/ por defecto)
npm run dev:rapido     # igual, con foco de 1 min y descansos de 15/30 s, para probar
npm test               # tests (Vitest)
npm run typecheck      # chequeo de tipos
npm run build:linux    # genera dist/obsidian-pomodoro_<versión>_amd64.deb

# instalar / actualizar (lo corre Nacho, pide contraseña):
sudo apt install ./dist/obsidian-pomodoro_<versión>_amd64.deb
# desinstalar:
sudo apt remove obsidian-pomodoro
```

## 11. Problemas conocidos y trucos

- **Sandbox en desarrollo**: Ubuntu 24.04+ no deja usar el sandbox de Chromium desde `node_modules`, por
  eso los scripts `dev` usan `--noSandbox`. La app instalada no lo necesita.
- **npm 11 bloquea scripts de instalación**: `electron` y `esbuild` están aprobados en `allowScripts` del
  `package.json`. Si un paquete nuevo necesita su script: `npm approve-scripts <paquete>`.
- **Matar la app desde un script**: `pkill -f` mira la línea de comando completa, así que si el patrón
  aparece en cualquier parte del mismo comando (por ejemplo en la línea que lanzó la app), **mata a la
  propia terminal** (sale con código 144; pasó dos veces). En desarrollo, en un comando aparte:
  `pkill -f '[o]bsidian-pomodoro/node_modules/electron'`. La instalada, por nombre y sin `-f`:
  `pkill obsidian-pomod`.
- `~/.config/Obsidian Pomodoro/` tiene caché de Chromium de las primeras pruebas: es inofensiva.
- Si `sudo apt install` de un `.deb` local avisa *"Download is performed unsandboxed as root"*: es normal.

## 12. Historial

| Fecha | Qué pasó |
|---|---|
| 2026-09-10 | Plan de 7 fases aprobado. Fases 0 a 3 hechas, probadas y mergeadas (PR #1–#3). Vault versionado con Git. Tablero *Tiempo de estudio* y documentación del registro en el vault. |
| 2026-09-11 | Fase 6: `.deb` 0.3.0 construido, instalado y visible en el lanzador (PR #4, falta la prueba final). Este `AGENTS.md` pasa a ser el documento único del proyecto. |

---

*Mantené este archivo al día: es lo único que necesita leer quien siga el proyecto.*
