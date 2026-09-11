# Obsidian Pomodoro

App de escritorio para Linux que junta un **timer pomodoro** con tu **vault de Obsidian**:

- Cada bloque de foco se registra en el vault con la **materia** y el **tema** que elegiste, para ver
  a qué le dedicaste más horas en la semana, el mes y el año.
- Lee las **tareas** del plugin [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) y,
  cuando las completás en la app, quedan marcadas en Obsidian.

> Proyecto personal y primera app hecha vibecodeando con [Claude Code](https://claude.com/claude-code).

## Estado

| Fase | Qué incluye | Estado |
|---|---|---|
| 0 · Preparación | repo, estructura, documentación | ✅ |
| 1 · Timer | pomodoro 25/5/15, notificaciones, icono en la barra | ✅ |
| 2 · Registro | escribir cada bloque de foco en el vault | ✅ |
| 3 · Estadísticas | gráficos por materia en la app y tablero en Obsidian | ✅ |
| 4 · Tareas (leer) | lista de tareas del vault ordenadas por vencimiento | |
| 5 · Tareas (completar) | marcar como hechas desde la app | |
| 6 · Instalable | .deb, aparece en el lanzador, arranque automático opcional | ⏳ |

## Cómo se guarda el tiempo en el vault

Un archivo por mes en `Sistema/Pomodoro/AAAA-MM.md`, con una línea por bloque de foco usando campos
inline de [Dataview](https://blacksmithgu.github.io/obsidian-dataview/):

```markdown
- [fecha:: 2026-09-10T19:30] [ambito:: facultad] [materia:: [[Objetos II]]] [tema:: Patrón Strategy] [minutos:: 25]
```

La app solo **agrega** líneas al registro y cambia el checkbox de las tareas que completás. No toca
nada más del vault.

## Instalar (Ubuntu / Debian)

```bash
npm install
npm run build:linux                                        # genera dist/obsidian-pomodoro_<versión>_amd64.deb
sudo apt install ./dist/obsidian-pomodoro_*_amd64.deb      # la instala en /opt y en el lanzador
```

La primera vez que la abras te pide la carpeta de tu vault. Para actualizarla, repetí los mismos pasos.
Para desinstalarla: `sudo apt remove obsidian-pomodoro`.

## Desarrollo

Requisitos: Linux, Node 20 o superior.

```bash
npm install
npm run dev         # abre la app en modo desarrollo
npm run dev:rapido  # igual, pero con foco de 1 min y descansos de 15/30 s para probar
npm test            # tests automáticos
npm run typecheck   # chequeo de tipos
npm run build:linux # genera AppImage y .deb en dist/
```

> **Ubuntu 24.04 o superior**: `npm run dev` lanza Electron con `--no-sandbox` porque el sistema
> no deja usar el sandbox de Chromium desde `node_modules`. La versión instalada desde el `.deb`
> no lo necesita.

## Licencia

[MIT](LICENSE)
