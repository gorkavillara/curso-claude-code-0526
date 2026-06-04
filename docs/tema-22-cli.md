# Tema 22 — Opciones avanzadas de CLI, sesiones, historiales y productividad

> **Duración estimada:** \~90 min **Tipo:** práctico + demos guiadas

## Objetivo del tema

Convertir la CLI de Claude Code en el centro operativo del día: dominar el REPL frente a la ejecución puntual por flags, gestionar sesiones largas con `/compact`, `/resume` y `/rewind`, mover servidores y colas largas al background, configurar atajos y prompt de arranque, y orquestar el trabajo con multiplexores. Al terminar, el alumno usa Claude Code como herramienta de terminal, no como chat.

***

## 1. Uso del REPL interactivo frente a ejecución puntual por flags

Hay dos formas de invocar Claude Code y conviene saber **cuándo usar cada una**.

|                   | REPL interactivo                                     | Ejecución puntual (flags)                            |
| ----------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| Cómo se lanza     | `claude` (sin argumentos)                            | `claude -p "<prompt>"` o `claude --print "<prompt>"` |
| Para qué sirve    | Sesiones de trabajo, varias iteraciones, exploración | One-shot: pipe, script, CI, hook, automatización     |
| Mantiene contexto | Sí (hasta `/compact` o cierre)                       | No (cada invocación arranca limpia)                  |
| Salida            | Stream interactivo en TTY                            | stdout/stderr aprovechables por otro proceso         |
| Coste mental      | Alto (estás "dentro")                                | Bajo (entra, ejecuta, sale)                          |

> Regla mental: **REPL para trabajo de desarrollo, flags para automatización**. Si te encuentras lanzando `claude` para preguntar una sola cosa y salir, probablemente quieres `claude -p`.

Flags imprescindibles para uso puntual:

* `claude -p "<prompt>"` — ejecución no interactiva. Devuelve la respuesta por stdout y termina.
* `claude -p "<prompt>" --output-format json` — salida estructurada, útil para pipes.
* `cat archivo.log | claude -p "Resume los errores"` — stdin como contexto adicional.
* `claude -c` / `claude --continue` — retoma la última sesión sin elegirla.
* `claude -r` / `claude --resume` — abre el selector de sesiones para retomar una concreta.

### 🧪 Demo 1 — REPL vs `-p`, slash commands y `--add-dir`

* **Objetivo:** ver en directo la diferencia entre REPL y modo `-p`, listar los slash commands disponibles y añadir un directorio adicional al working set.
* **Setup:** rama `tema-22/inicio`. El repo trae el Notebox + un comando slash plantado en `.claude/commands/repo-status.md` y un directorio gemelo `../notas-soporte/` con material auxiliar.

**Pasos:**

1.  Desde la terminal, ejecutar primero el modo puntual:

    ```bash
    claude -p "Lista los archivos de src/ y dime qué hace cada uno en una línea."
    ```

    Observar que devuelve la respuesta y vuelve al prompt del shell.
2. Lanzar el REPL: `claude`. Dentro, ejecutar `/help` y `/status` para inspeccionar el estado de la sesión.
3.  Ejecutar el comando slash plantado del proyecto:

    ```
    /repo-status
    ```

    El comando lee `package.json`, `.mcp.json` y `.claude/` y devuelve un resumen de qué hay configurado.
4.  Añadir el directorio adicional sin reiniciar la sesión:

    ```
    /add-dir ../notas-soporte
    ```

    Pedir a Claude: `Cita un archivo de ../notas-soporte/ y explica qué contiene.`

**Qué observar:**

* En `-p`, la sesión termina al devolver la respuesta. No hay seguimiento.
* En el REPL, `/status` muestra modelo, directorios incluidos, herramientas y memoria activa.
* El slash command `/repo-status` se invoca igual que los oficiales, pero vive en `.claude/commands/` y es **del proyecto** (no del usuario, no de un plugin).
* Tras `/add-dir`, el directorio adicional aparece en `/status`. Es la forma limpia de trabajar con dos repos relacionados sin pegar rutas absolutas.

### 🧩 Ejercicio 1 — REPL, flags y comandos slash del proyecto

> **Rama:** `git checkout tema-22/ejercicio-01` · **Tiempo:** 30 min · **Tipo:** En clase

Activa los caminos REPL y `-p`, ejecuta el comando slash del proyecto plantado y añade un directorio adicional con `/add-dir`. Documenta en `CLI-INVENTARIO.md` qué comandos slash hay disponibles, cuándo usarías `-p` vs REPL y qué dos automatizaciones harías con `claude -p` en un script.

***

## 2. Gestión de sesiones largas, compactación y recuperación de contexto

Una sesión larga acumula contexto: archivos leídos, comandos ejecutados, decisiones tomadas. Llega un momento en el que ese contexto es **más ruido que señal** (o roza el límite de ventana). La CLI ofrece dos mecanismos complementarios:

| Mecanismo                  | Qué hace                                                                         | Cuándo usarlo                                                                  |
| -------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `/compact`                 | Resume la conversación previa en un summary y lo usa como nuevo punto de partida | La sesión va lenta o se acerca al límite, pero quieres seguir en el mismo hilo |
| `/clear`                   | Borra el contexto y arranca limpio dentro de la misma instancia                  | Cambias de tarea radicalmente, no quieres arrastrar nada                       |
| `/resume` (`claude -r`)    | Abre el selector de sesiones anteriores guardadas                                | Quieres retomar un trabajo de ayer / la semana pasada                          |
| `claude -c` (`--continue`) | Retoma la última sesión sin selector                                             | Cerraste sin querer y quieres volver                                           |

> `compact` **no es magia**: es un resumen. Después de compactar, el agente sabe _menos_ detalles concretos. Si la tarea exige fidelidad fina (debug de un error oscuro), valora si te conviene cerrar y abrir limpio en vez de compactar.

### Anatomía de una sesión persistente

Cada sesión deja huella en disco (típicamente en `~/.claude/projects/<hash-del-repo>/` o equivalente). Lo importante para el alumno:

* **Es por proyecto.** Si cambias de repo, cambias de "espacio" de sesiones.
* **Sobrevive al reinicio de terminal.** Cerrar la ventana no destruye la sesión.
* **Se puede inspeccionar y limpiar.** Carpetas antiguas son borrables; no son código del proyecto.

### 🧪 Demo 2 — Sesión larga, `/compact`, `/resume` y `/rewind`

* **Objetivo:** ver el ciclo completo de una sesión que dura más de un sentado: trabajar, compactar, salir, retomar con `/resume`, y deshacer un paso con `/rewind`.
* **Setup:** rama `tema-22/inicio`. El repo trae una `notas-sesion.md` plantada con tres tareas pequeñas (añadir validación, escribir test, actualizar README).

**Pasos:**

1. Abrir `claude` y pedir: `Lee notas-sesion.md y resuelve la tarea 1.` Confirmar que la resuelve y los tests siguen verdes.
2. Pedir: `Ahora la tarea 2.` Y a continuación `Ahora la tarea 3.`
3. Ejecutar `/status` y observar el tamaño aproximado del contexto.
4.  Ejecutar `/compact` con una instrucción de foco:

    ```
    /compact Resume las decisiones tomadas en las tareas 1 a 3 y mantén la lista de archivos modificados.
    ```

    Tras el compact, pedir `¿Qué archivos hemos tocado hasta ahora?` para verificar qué recuerda.
5. Probar `/rewind` (o el equivalente que ofrezca la versión instalada) para volver al estado anterior al último cambio. Confirmar que el archivo modificado vuelve al estado previo.
6.  Salir de Claude (`/exit` o `Ctrl+D`). Desde el shell:

    ```bash
    claude -r
    ```

    Elegir la sesión recién cerrada del selector. Confirmar que el contexto compactado sigue ahí.

**Qué observar:**

* Tras `/compact`, el agente **no cita literalmente** las respuestas previas: trabaja sobre el resumen.
* `/rewind` revierte el último cambio del agente, no del repo entero. No sustituye a `git`.
* `claude -r` muestra las sesiones recientes con timestamp y un título descriptivo (típicamente la primera frase del usuario).
* `claude -c` salta el selector y abre la última. Útil cuando solo cerraste por accidente.

### 🧩 Ejercicio 2 — Sesiones largas, compactación y recuperación

> **Rama:** `git checkout tema-22/ejercicio-02` · **Tiempo:** 30 min · **Tipo:** En clase

Trabaja una sesión sobre las tres tareas plantadas en `notas-sesion.md`, ejecuta `/compact` con foco explícito, cierra la sesión, retómala con `claude -r` y prueba `/rewind` sobre un cambio del agente. Documenta en `SESION-LARGA.md` qué se ha perdido tras `/compact`, qué ha quedado y cómo gobernarías esto en sesiones de equipo de 4–5 horas.

***

## 3. Comandos `/config`, `/status`, `/usage`, `/mcp`, `/permissions`, `/resume` y `/rewind`

Cada slash command de la CLI cubre **una dimensión** del estado. Conviene tenerlos memorizados como atajos:

| Comando        | Para qué                                                                 | Cuándo lo lanzas                                 |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| `/help`        | Lista todos los comandos disponibles                                     | Primera sesión, o tras actualizar Claude Code    |
| `/status`      | Estado actual: modelo, directorios, herramientas, hooks, plugins activos | Cuando algo se comporta raro                     |
| `/config`      | Inspeccionar y editar configuración (theme, modelo, modos)               | Cambios puntuales sin tocar `settings.json`      |
| `/usage`       | Tokens consumidos, ventana usada, coste estimado                         | Decidir si compactar o seguir                    |
| `/mcp`         | Servidores MCP conectados y su estado (ver Tema 20)                      | Debug de un MCP que no responde                  |
| `/permissions` | Reglas allow/deny activas en la sesión                                   | Cuando Claude pide confirmación constante        |
| `/resume`      | Selector de sesiones para retomar (= `claude -r`)                        | Volver a un trabajo previo                       |
| `/rewind`      | Deshacer el último paso del agente                                       | Te has arrepentido del cambio que acaba de hacer |

> Convención mental: **`/status` antes de cualquier debug**. Cuando un alumno dice "Claude no encuentra `tal archivo`", el 80% de las veces es un `/add-dir` que falta o un directorio que no está incluido.

### Comandos slash propios del proyecto

Además de los oficiales, cada proyecto puede declarar sus propios en `.claude/commands/<nombre>.md`. Un archivo Markdown con frontmatter (`description`, `argument-hint`) basta para que aparezca en `/help` como `/<nombre>`. Son **del repo**: viajan con `git`, los ve todo el equipo, no se confunden con los del usuario en `~/.claude/commands/`.

> Si un equipo tiene 3 patrones recurrentes ("auditar dependencias", "preparar release", "verificar configuración del entorno"), tres archivos en `.claude/commands/` ahorran semanas de "¿cómo era el prompt que usábamos?".

***

## 4. Uso de historial, búsqueda y edición avanzada de prompts en terminal

Dentro del REPL, escribir prompts largos a pelo es ineficiente. La CLI ofrece varias formas de acelerar:

| Acción                       | Cómo                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Recuperar prompts anteriores | Flechas arriba/abajo (historial), igual que un shell                                             |
| Buscar en el historial       | `Ctrl+R` (estilo bash reverse-search) en la mayoría de terminales                                |
| Editar en el editor externo  | Atajo (típicamente `Ctrl+X Ctrl+E` o el que defina tu shell) abre `$EDITOR` con el prompt actual |
| Multilinea                   | `Shift+Enter` (o el que detecte tu terminal) para salto de línea sin enviar                      |
| Cancelar la respuesta        | `Esc` (puede variar por versión) — Claude para de generar                                        |
| Salir                        | `/exit` o `Ctrl+D`                                                                               |

> Editar prompts complejos en `$EDITOR` (vim, nano, VS Code…) en vez de a línea evita errores típicos: comillas mal cerradas, comandos a medias, salto de tarea por enviar pulsando Enter sin querer. **Si el prompt ocupa más de 10 líneas, edítalo fuera.**

### Estrategia para prompts recurrentes

Si un prompt se repite (auditoría semanal, resumen de PRs, status de despliegue), tres opciones por orden de coste:

1. **Comando slash del proyecto** (`.claude/commands/<nombre>.md`) — el prompt vive en el repo, es reutilizable por todos.
2. **Skill del usuario o proyecto** (`~/.claude/skills/` o `.claude/skills/`) — para prompts con lógica más rica (Tema 9).
3. **Alias del shell** que llama a `claude -p` con el prompt completo — útil para automatización fuera de sesión.

***

## 5. Aprovechamiento de comandos en background para dev servers y colas largas

Dentro del REPL, **no toda ejecución bloquea la sesión**. Comandos largos (servidores de desarrollo, watchers, builds, colas) pueden lanzarse en background y seguir conversando.

Patrón base:

```
Lanza `npm run dev` en background y devuélveme el control.
Cuando responda en el puerto 3000, pídeme la primera ruta a probar.
```

Lo que ocurre por debajo:

* Claude lanza el comando con la herramienta `Bash` en modo background (típicamente con `run_in_background` o equivalente).
* El proceso queda asociado a la sesión. La conversación sigue.
* Se puede consultar el output incrementalmente (los stdout llegan como notificaciones).
* Al cerrar la sesión, el comando termina (salvo que se haya hecho `disown` explícito o se ejecute en un multiplexor — punto 9).

Casos típicos de background útil:

| Caso                                        | Por qué interesa                                                      |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `npm run dev` / `pnpm dev`                  | Mantener el servidor vivo mientras el agente edita y prueba endpoints |
| Watchers de tests (`vitest --watch`)        | Re-corren tests en cada cambio; Claude lee resultados como vienen     |
| Builds largos (`tsc -w`, `webpack --watch`) | El compilador valida en paralelo                                      |
| Colas o jobs (`sidekiq`, `celery worker`)   | El agente puede inspeccionar logs mientras siguen procesando          |
| `tail -f` sobre un log                      | Streaming continuo de un proceso externo                              |

Antipatrones:

* ❌ Lanzar 4 comandos en background sin pensar — la sesión se llena de procesos huérfanos.
* ❌ Lanzar el dev server en foreground y luego no poder pedir más cosas al agente.
* ❌ Olvidar que al cerrar la sesión los procesos mueren. Para producción real, usa un multiplexor o `systemd`.

***

## 6. Gestión de directorios adicionales con `--add-dir`

Por defecto, Claude Code opera sobre el directorio donde lo lanzaste. Pero a veces el contexto útil **vive fuera**:

* Un repo gemelo con notas o specs (`../notas-soporte/`).
* Un proyecto de docs que documenta este código (`../docs-internas/`).
* Un fixture de tests que mantienes en otra carpeta (`../test-data/`).

Dos formas de incluirlos:

| Cómo                                    | Cuándo                                             |
| --------------------------------------- | -------------------------------------------------- |
| `claude --add-dir ../carpeta` al lanzar | Sabes desde el principio que necesitas esa carpeta |
| `/add-dir ../carpeta` dentro del REPL   | Lo descubres a mitad de sesión                     |

Reglas de uso:

* Las rutas adicionales pueden ser **absolutas o relativas** al cwd.
* Cada `add-dir` amplía la superficie de archivos legibles/editables. Pensar **antes** de añadir todo `$HOME`.
* En `/status` aparece la lista actual; siempre que algo "no se encuentra", revísalo antes de añadir más.

> Una sesión con 6 directorios adicionales es una sesión sin foco. Si necesitas eso, probablemente quieras un **monorepo** o un **workspace**, no más `--add-dir`.

***

## 7. Uso de `--append-system-prompt` y estrategias de prompt de arranque

Toda sesión arranca con un **system prompt** que define el tono, las convenciones y las prioridades del agente. La CLI permite extenderlo (no reemplazarlo) con:

```bash
claude --append-system-prompt "Responde siempre en español. Cuando ejecutes tests, usa npm test y reporta solo los fallos."
```

Esto añade tu texto **al final** del system prompt oficial. Persiste durante toda la sesión.

### Cuándo usarlo

| Caso                        | Ejemplo de append                                                         |
| --------------------------- | ------------------------------------------------------------------------- |
| Idioma o estilo             | "Responde en español. Tono directo, sin fórmulas corporativas."           |
| Convención del proyecto     | "Antes de cualquier edición, lanza `tsc --noEmit` y para si hay errores." |
| Restricción de alcance      | "No toques `infra/` salvo que te lo pida explícitamente."                 |
| Comportamiento de seguridad | "Nunca leas ni imprimas el contenido de `.env` o archivos en `secrets/`." |
| Formato de salida           | "Cuando termines, devuelve siempre un resumen en bullets de 4 líneas."    |

> `--append-system-prompt` no reemplaza a `CLAUDE.md`. La diferencia: `CLAUDE.md` vive en el repo y aplica a **todas las sesiones** que se lancen ahí; `--append-system-prompt` aplica solo a **esa invocación**. Útil para experimentos, scripts y modos puntuales.

### Estrategias de prompt de arranque en scripts

Para automatizaciones (ej. revisiones nocturnas, resúmenes diarios), el patrón típico es:

```bash
claude -p "$(cat prompts/resumen-diario.md)" \
  --append-system-prompt "$(cat prompts/system-resumen.md)" \
  --output-format json > resumen.json
```

Un archivo para el prompt, otro para el system append, salida JSON parseable. Reproducible y versionable.

***

## 8. Atajos y keybindings para productividad diaria en sesiones intensivas

Los keybindings reducen la fricción de cada turno. Tres categorías:

### a) Atajos dentro del REPL

| Atajo (referencia, puede variar) | Acción                                        |
| -------------------------------- | --------------------------------------------- |
| `Ctrl+C`                         | Cancelar la generación actual                 |
| `Esc`                            | Interrumpir respuesta (en versiones modernas) |
| `Ctrl+D` o `/exit`               | Salir de la sesión                            |
| `Shift+Enter`                    | Salto de línea sin enviar                     |
| `Ctrl+X Ctrl+E` (típico)         | Abrir el prompt en `$EDITOR`                  |
| Flechas arriba/abajo             | Historial de prompts                          |
| `Ctrl+R`                         | Búsqueda inversa en historial                 |

> Estos atajos varían según versión y terminal. **Comprueba `/help` y la documentación de tu versión** antes de memorizar nada. La idea es que CADA terminal tiene atajos; aprovecha los del tuyo.

### b) Atajos del shell que llaman a `claude`

Alias y funciones en `~/.zshrc` / `~/.bashrc` que ahorran tecleo:

```bash
# Resumen rápido del repo actual
alias cstatus='claude -p "Resume en 5 líneas qué hay en este repo y cuál es el entry point."'

# Auditar el último diff
alias caudit='git diff HEAD~1 | claude -p "Audita este diff: bugs, malos olores, riesgos."'

# Continuar la última sesión sin selector
alias cc='claude -c'
```

### c) Keybindings del editor / multiplexor

Si trabajas con tmux + vim + claude, los keybindings que más rentan son los que mueven entre paneles (un panel para Claude, otro para los tests, otro para el server). Ver punto 9.

***

## 9. Organización del trabajo en tmux, screen u otros multiplexores

Claude Code dentro de una terminal sola es un chat. Dentro de un multiplexor, es **un panel más** de tu centro de operaciones.

Layout típico con tmux para una sesión de desarrollo:

```
┌─────────────────────┬───────────────────────┐
│                     │                       │
│   Claude Code       │   Tests en watch      │
│   (REPL activo)     │   (npm run test:w)    │
│                     │                       │
├─────────────────────┼───────────────────────┤
│                     │                       │
│   Dev server        │   Shell libre         │
│   (npm run dev)     │   (git, npm, etc.)    │
│                     │                       │
└─────────────────────┴───────────────────────┘
```

Ventajas frente a tener cuatro terminales sueltas:

| Tema                           | Sin multiplexor           | Con multiplexor                |
| ------------------------------ | ------------------------- | ------------------------------ |
| Sobrevive a un reinicio de SSH | No                        | Sí (`tmux attach`)             |
| Restaurar layout idéntico      | A mano cada vez           | `tmuxinator`, `tmux-resurrect` |
| Saltar entre paneles           | `Alt+Tab` por toda la app | Un atajo, mismo proceso        |
| Compartir sesión con otro dev  | Casi imposible            | `tmux attach -t <sesión>`      |

Patrón productivo:

* Un **panel para Claude** con la sesión larga del feature.
* Un **panel para tests** en watch.
* Un **panel para el server** o el watcher de build.
* Un **panel libre** para `git`, `gh`, exploración manual.

> `tmux`/`screen`/`zellij` son herramientas externas al alumno: la CLI de Claude no las trae ni las configura. La sesión las usa **como entorno**, no las gestiona. Por eso este tema las trata conceptualmente, no con fixtures plantados: la configuración vive en `~/.tmux.conf` del alumno.

### 🧪 Demo 3 — Background, `--append-system-prompt` y layout productivo

* **Objetivo:** ver cómo se lanza un servidor en background desde Claude, cómo afecta `--append-system-prompt` al tono de la sesión y cómo encaja todo en un layout de multiplexor.
* **Setup:** rama `tema-22/inicio`. El repo trae un script plantado `scripts/dev-server.sh` que arranca un servidor de eco simple en el puerto 3001 y escribe a `logs/dev-server.log`.

**Pasos:**

1.  Cerrar cualquier sesión previa. Lanzar Claude con un system prompt extra:

    ```bash
    claude --append-system-prompt "Responde en español, tono directo. Antes de cualquier edición lanza `npm test`. Si fallan tests, para y pídeme instrucciones."
    ```
2.  Dentro de la sesión, pedir:

    ```
    Lanza `scripts/dev-server.sh` en background y devuélveme el control.
    Cuando arranque, pídeme la primera petición que quiero probar.
    ```
3. Mientras el servidor está vivo, pedir al agente que lea `logs/dev-server.log` y muestre las últimas líneas. Verificar que sigue conversando sin bloqueo.
4. (Conceptual, en pizarra o demo del instructor) Mostrar un `tmux` con cuatro paneles: Claude, tests, dev-server, shell libre. Comentar `tmux attach`, `Ctrl+B + flechas`.

**Qué observar:**

* El `--append-system-prompt` se nota desde la primera respuesta: tono, idioma, regla pre-edición.
* El comando en background **no bloquea** el REPL. El control vuelve enseguida.
* Los logs del servidor se leen como cualquier archivo. La sesión los puede inspeccionar bajo demanda.
* El multiplexor no es de Claude: es del alumno. Pero la sesión de Claude funciona idéntica dentro o fuera.

### 🧩 Ejercicio 3 — Productividad: background, system prompt y layout

> **Rama:** `git checkout tema-22/ejercicio-03` · **Tiempo:** 30 min · **Tipo:** En clase

Lanza Claude con `--append-system-prompt`, arranca el `dev-server.sh` plantado en background, inspecciona el log mientras conversas y rellena `PRODUCTIVIDAD.md` con tu layout de tmux ideal (o tu equivalente), tres aliases que crearías y la regla que añadirías a `--append-system-prompt` para tu día a día.

***

## 10. Estrategias para convertir la CLI en centro operativo del desarrollador

La diferencia entre "uso Claude Code" y "vivo en Claude Code" es disciplina de entorno. Heurísticas para llegar al segundo nivel:

* **Una sesión por intención.** Un feature, una sesión. No mezcles dos features en el mismo hilo: el `/compact` te mezclará decisiones.
* **`/status` reflejo.** Antes de cualquier debug, `/status`. La mitad de los "Claude no ve X" son `/add-dir` faltantes.
* **`/usage` antes de compactar.** Saber cuánta ventana queda decide si compactar o cerrar y abrir limpio.
* **Comandos del proyecto en el repo.** Si un prompt se repite, vive en `.claude/commands/`. Si solo lo usas tú, en `~/.claude/commands/`. Nunca en post-its.
* **Background para lo que dure más de 5 segundos.** El REPL no es para esperar; es para conversar.
* **Sesiones largas dentro de tmux.** Si tu sesión dura más de una hora, ponla en un multiplexor. Te ahorrarás un día de trabajo perdido por una desconexión SSH.
* **`--append-system-prompt` para reglas del día.** "Hoy solo backend, no toques el front." "Hoy auditoría, no escribas, solo lee." Reglas explícitas evitan tener que recordar al agente.
* **Limpiar sesiones viejas.** El historial es útil hasta que es ruido. Borrar carpetas de proyectos antiguos no rompe nada.

> Una CLI dominada **no se nota**: es transparente. Cuando empiezas a pelearte con ella (sesiones perdidas, contexto saturado, comandos olvidados), es señal de que falta disciplina, no de que la herramienta sea mala.

| Antipatrón                           | Síntoma                                | Corrección                                   |
| ------------------------------------ | -------------------------------------- | -------------------------------------------- |
| Una sola sesión eterna para todo     | Compact tras compact, contexto borroso | Cierra y abre sesiones por intención         |
| Ignorar `/usage`                     | Compact cuando ya no queda ventana     | `/usage` cada media hora en sesiones largas  |
| Lanzar todo en foreground            | El REPL se queda colgado esperando     | Background para servers, watchers y colas    |
| Prompts repetidos a mano             | Tipear lo mismo 4 veces al día         | Comando slash del proyecto o alias del shell |
| Sin multiplexor en sesiones de horas | Pierdes la sesión al desconectar       | `tmux new -s feature-x` desde el inicio      |

***

## Resumen

* **REPL para trabajo, `-p` para automatización.** Distintos modos, distintas herramientas.
* **`/compact`, `/resume`, `/rewind`** gobiernan la sesión larga: resumen, retomar, deshacer.
* **`/status`, `/config`, `/usage`, `/mcp`, `/permissions`** son tu panel de control. Memorízalos.
* **Background, `--add-dir` y `--append-system-prompt`** convierten la CLI en herramienta de día completo.
* **Multiplexor (tmux, screen, zellij)** transforma Claude Code de chat en centro operativo. La disciplina del entorno marca la diferencia.
