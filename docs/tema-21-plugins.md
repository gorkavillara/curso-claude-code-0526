# Tema 21 — Sistema de plugins, marketplaces, hooks y extensibilidad

> **Duración estimada:** \~90 min **Tipo:** conceptual + demos guiadas

## Objetivo del tema

Entender qué empaqueta hoy un plugin de Claude Code (comandos, skills, agentes, hooks, MCPs), saber instalar y gobernar plugins desde el repo y desde el usuario, escribir hooks pre/post tool para reforzar políticas técnicas reales, y diseñar un plugin propio sin convertir la extensibilidad en deuda técnica.

***

## 1. Qué permite hoy el sistema oficial de plugins de Claude Code

Un **plugin** de Claude Code es una unidad distribuible que empaqueta varias extensiones a la vez: comandos personalizados (`/foo`), skills, subagentes, hooks de ciclo de vida y servidores MCP. Antes de los plugins, cada equipo replicaba a mano sus `.claude/commands/`, `.claude/agents/` y `settings.json` en cada repo. Ahora puede publicarlo una vez, versionarlo y consumirlo el equipo entero.

| Sin plugins                               | Con plugins                                   |
| ----------------------------------------- | --------------------------------------------- |
| Copy/paste de `.claude/` entre repos      | Un plugin instalable como unidad              |
| Actualizar un command = tocar N repos     | Bump de versión del plugin y `/plugin update` |
| Skills del autor cuelgan en su máquina    | Skills versionadas y compartidas              |
| Hooks de gobierno en cada `settings.json` | Hook empaquetado y declarado por el plugin    |
| Imposible auditar qué corre cada dev      | Lista de plugins activos comprobable          |

> Un plugin es **el equivalente a un paquete npm para Claude Code**: empaqueta capacidades, declara su contrato, se versiona y se instala. Lo que cambia es que el "runtime" no es Node, es el agente.

Qué puede meter dentro un plugin (todo opcional, todo combinable):

* **Commands** — slash commands `/<plugin>:<comando>` reutilizables.
* **Skills** — skills auto-invocables al estilo del Tema 9.
* **Agents** — subagentes (Tema 19) listos para invocar.
* **Hooks** — handlers que disparan en eventos del ciclo (`PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`...).
* **MCP servers** — servidores MCP (Tema 20) declarados como parte del plugin.

### 🧪 Demo 1 — Inspeccionar un plugin local plantado en el repo

* **Objetivo:** ver la anatomía real de un plugin: su `plugin.json`, qué declara, dónde viven los commands, hooks, skills y agents.
* **Setup:** rama `tema-21/inicio`. El repo trae un plugin local plantado en `.claude/plugins/pr-helper/` con `plugin.json`, `commands/`, `hooks/`, `skills/` y `agents/`. Lanzar Claude Code en la raíz del repo.

**Prompt literal:**

```
Abre el plugin local `.claude/plugins/pr-helper/` y explícame:
1. Qué declara su plugin.json (nombre, versión, autor, descripción).
2. Qué commands expone (lista por nombre).
3. Qué hooks declara y a qué evento se enganchan.
4. Qué skills y agentes empaqueta.
5. Si tuvieras que distribuir este plugin a otro equipo, qué archivos
   serían imprescindibles y qué archivos sobran.

No ejecutes nada todavía. Solo describe el catálogo del plugin.
```

**Qué observar:**

* Claude lee el **`plugin.json`** y cita campos concretos (`name`, `version`, `description`).
* Los commands viven en `.claude/plugins/pr-helper/commands/*.md`. Cada `.md` con frontmatter es un slash command.
* El hook está declarado en `plugin.json` o en un `hooks.json` aparte, no en el `settings.json` del repo. Esa es la diferencia clave entre **plugin** y **configuración suelta**.
* Skills y agents siguen el mismo formato del Tema 9 y 19, pero embebidos en el plugin.
* Comentar: el plugin **no se ha activado todavía** — está plantado, pero hace falta `/plugin enable` para que Claude lo cargue en sesión.

### 🧩 Ejercicio 1 — Activar e inventariar un plugin local

> **Rama:** `git checkout tema-21/ejercicio-01` · **Tiempo:** 25 min · **Tipo:** En clase

Activa el plugin `pr-helper` ya plantado en `.claude/plugins/`, ejecuta uno de sus commands y rellena `INVENTARIO-PLUGIN.md` con el catálogo completo (commands, hooks, skills, agents) y una decisión justificada de **qué activarías a nivel proyecto y qué a nivel usuario**.

***

## 2. Plugins que empaquetan skills, agentes, hooks y servidores MCP

Un plugin no tiene que empaquetar las cinco cosas. Lo habitual es que combine **2–3** según su propósito:

| Tipo de plugin                  | Empaqueta típicamente           | Ejemplo                                                 |
| ------------------------------- | ------------------------------- | ------------------------------------------------------- |
| **Productividad personal**      | Commands + skills               | `/pr-summary`, skill `commit-msg-style`                 |
| **Calidad de equipo**           | Commands + hooks                | `/lint-on-save`, hook `PreToolUse` que ejecuta `eslint` |
| **Integración corporativa**     | MCP server + commands           | Servidor MCP de Jira + `/jira:open`                     |
| **Subagentes especializados**   | Agents + skills                 | `code-reviewer`, `release-manager`                      |
| **Plataforma interna completa** | Commands + agents + hooks + MCP | "Plugin del equipo de plataforma"                       |

> Si un plugin solo tiene **un** comando suelto, probablemente debería ser un command del repo, no un plugin. Empaquetas cuando hay **un conjunto coherente** que se distribuye junto.

Anatomía típica de un plugin:

```
.claude/plugins/<nombre-plugin>/
├── plugin.json              # Manifest: name, version, author, contracts
├── README.md                # Para humanos: qué hace, cómo se usa
├── commands/                # Slash commands del plugin
│   ├── summary.md           # /pr-helper:summary
│   └── checklist.md
├── hooks/                   # Handlers de eventos
│   └── pre-bash-audit.sh
├── skills/                  # Skills auto-invocables
│   └── commit-msg-style/SKILL.md
├── agents/                  # Subagentes
│   └── pr-reviewer.md
└── mcp-servers/             # (opcional) Servidores MCP del plugin
    └── jira-internal/server.js
```

Lo que distingue un plugin de un `.claude/` suelto es **el manifest** (`plugin.json`). Es lo que permite a Claude Code identificarlo, versionarlo y activarlo o desactivarlo como una unidad.

## 3. Gestión mediante `/plugin install`, `/plugin enable`, `/plugin disable` y `/plugin marketplace`

Los comandos de Claude Code para gobernar plugins forman un ciclo de vida claro:

| Comando                      | Para qué                                                       |
| ---------------------------- | -------------------------------------------------------------- |
| `/plugin install <fuente>`   | Instalar un plugin (local, marketplace o git)                  |
| `/plugin list`               | Listar los plugins instalados y su estado (enabled / disabled) |
| `/plugin enable <nombre>`    | Activar un plugin instalado en la sesión actual                |
| `/plugin disable <nombre>`   | Desactivar sin desinstalar                                     |
| `/plugin uninstall <nombre>` | Eliminar el plugin                                             |
| `/plugin update <nombre>`    | Refrescar a la última versión publicada                        |
| `/plugin marketplace`        | Listar y navegar marketplaces conocidos                        |
| `/plugin validate <ruta>`    | Validar un plugin local antes de distribuirlo                  |

> Regla mental: **instalar ≠ activar**. Un plugin instalado pero deshabilitado no carga sus commands, ni dispara sus hooks. Es importante para el gobierno: puedes traerte un plugin del marketplace para inspeccionarlo y dejarlo `disabled` hasta haberlo revisado.

Tres fuentes habituales para `/plugin install`:

* **Ruta local** — `.claude/plugins/<nombre>/` plantado en el repo. Útil para plugins internos del equipo o en desarrollo.
* **Marketplace** — `<marketplace>/<plugin>` (ej. una entrada del marketplace oficial de Anthropic o de uno propio).
* **Git URL** — `https://github.com/<org>/<repo>` con un `plugin.json` en la raíz. Útil para plugins en repos propios sin publicar.

## 4. Validación de plugins con `/plugin validate` antes de distribuirlos

Antes de empujar un plugin a un marketplace (o a otros repos), `/plugin validate` chequea:

| Chequeo                       | Falla si...                                      |
| ----------------------------- | ------------------------------------------------ |
| `plugin.json` válido          | Falta `name`, `version`, JSON malformado         |
| Commands bien declarados      | Frontmatter inválido, nombre con colisión        |
| Hooks bien declarados         | Evento desconocido, script inexistente           |
| Skills con `SKILL.md` válido  | Falta el frontmatter `name` / `description`      |
| Agents con frontmatter válido | Sin `name`, `description` o `tools` mal formados |
| MCP servers arrancan          | `command` no existe, error en el handshake       |

> Validar es el **`npm publish --dry-run` de los plugins**. Si lo saltas, la primera vez que un compañero haga `/plugin install` se encuentra el bug en su sesión, no en la tuya.

### 🧪 Demo 2 — Escribir un hook PreToolUse de gobierno y verlo dispararse

* **Objetivo:** ver cómo un hook bloquea o registra una acción del agente. Aquí lo usamos para auditar todas las invocaciones de `Bash` en una sesión.
* **Setup:** rama `tema-21/inicio`. El repo ya trae un hook `PreToolUse` declarado en `.claude/settings.json` que loguea cada ejecución de Bash a `.claude/audit/bash.log`. Lanzar Claude Code en la raíz.

**Prompt literal:**

```
Ejecuta `ls -la` desde Bash y luego `node --version`.
Después, abre .claude/audit/bash.log y dime qué se ha registrado:
1. Qué campos guarda el log por cada invocación.
2. En qué momento se ha escrito cada línea (antes o después del comando).
3. Si tú quisieras BLOQUEAR un comando concreto (no solo loguearlo),
   qué cambio mínimo tendrías que hacer en el hook.
```

**Qué observar:**

* Antes de cada `Bash`, el hook **se dispara y escribe en el log** con el comando, timestamp y sesión.
* El hook es **PreToolUse**: corre **antes** de ejecutar la herramienta. Si saliera con código distinto de 0, la herramienta se aborta.
* Para **bloquear** en vez de loguear, basta con que el hook devuelva un exit code de error y un mensaje por stderr.
* Cambiar a **PostToolUse** mueve el momento: corre tras el comando, útil para auditoría con resultado, no para prevención.
* Si Claude no es consciente de que existe el hook, sigue actuando normal — el hook es **del cliente**, no del prompt.

### 🧩 Ejercicio 2 — Escribir un hook con justificación de gobierno

> **Rama:** `git checkout tema-21/ejercicio-02` · **Tiempo:** 25 min · **Tipo:** En clase

Extiende el hook plantado: en lugar de **loguear todo Bash**, debe **bloquear** los comandos que toquen `.env` o ejecuten `rm -rf` y seguir logueando el resto. Documenta en `GOBIERNO-HOOK.md` qué política técnica refuerza, qué decisión tomas sobre eventos `PreToolUse` vs `PostToolUse` y qué pasaría si otro miembro del equipo desactivara el hook.

***

## 5. Uso de marketplaces adicionales con `extraKnownMarketplaces`

Un **marketplace** es un índice de plugins descubribles. Claude Code trae uno oficial por defecto, y permite añadir más mediante el campo `extraKnownMarketplaces` en el `settings.json` (a nivel usuario o proyecto):

```jsonc
{
  "extraKnownMarketplaces": [
    {
      "name": "imagina-internal",
      "url": "https://plugins.imagina.example/registry.json",
      "trust": "trusted"
    }
  ]
}
```

| Campo   | Para qué                                                                 |
| ------- | ------------------------------------------------------------------------ |
| `name`  | Nombre estable que usarás en `/plugin install <market>/<plugin>`         |
| `url`   | Endpoint que devuelve el índice (JSON con la lista de plugins)           |
| `trust` | `trusted` salta confirmaciones de instalación; `prompt` siempre pregunta |

> Un marketplace adicional es **un canal de actualización abierto** al agente. Tratarlo con el mismo cuidado que un mirror de npm interno: si la URL cae bajo control de otro, todos los plugins instalados desde ella son vector de ataque.

Indices de marketplace internos suelen ser un JSON estático servido por un bucket o repo:

```json
{
  "plugins": [
    {
      "name": "pr-helper",
      "version": "1.3.0",
      "source": "https://github.com/imagina/cc-plugin-pr-helper",
      "description": "Comandos y hooks para PRs internos"
    }
  ]
}
```

## 6. Configuración de plugins a nivel usuario y a nivel repositorio

Igual que `settings.json`, los plugins viven en **dos scopes** complementarios:

| Scope            | Dónde                                                 | Para qué                                                 |
| ---------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| **Repositorio**  | `.claude/settings.json` + `.claude/plugins/` del repo | Plugins que el equipo necesita para trabajar en ESE repo |
| **Usuario**      | `~/.claude/settings.json` + `~/.claude/plugins/`      | Plugins personales (productividad, estilo)               |
| **Organización** | Política central (Enterprise)                         | Plugins obligatorios u obligatoriamente bloqueados       |

Reglas mentales:

* **Plugins del repo viajan en el repo**: si el plugin lo necesita TODO el equipo (linter, hook de seguridad, command de release), va en `.claude/plugins/` del repo, commiteado.
* **Plugins de usuario son personales**: tu `pr-summary` que organiza tus PRs como te gusta, no lo metas en el repo del equipo.
* **No mezclar scopes**: si un alumno encuentra que un command "no funciona en este repo pero sí en otro", lo más probable es que esté instalado a nivel usuario y se haya desactivado a nivel repo.

> El equipo gobierna lo que viaja en el repo. El usuario gobierna lo suyo. Mezclarlos genera plugins fantasma: el dev que los tiene piensa que están en el repo, los demás no los ven.

## 7. Restricciones corporativas sobre marketplaces y plugins permitidos

En entornos corporativos, no todo plugin es aceptable. Los frenos típicos:

| Mecanismo                                   | Dónde se aplica                  | Bloquea...                                        |
| ------------------------------------------- | -------------------------------- | ------------------------------------------------- |
| `extraKnownMarketplaces` vacío              | Política central                 | Que el dev añada marketplaces no aprobados        |
| `allowedPlugins` / `deniedPlugins`          | `settings.json` (org o proyecto) | Plugins concretos por nombre                      |
| `trust: "prompt"` en marketplace            | `extraKnownMarketplaces`         | Instalación silenciosa: siempre pide confirmación |
| Revisión obligatoria de `plugin.json` en PR | Política de repo                 | Que un plugin entre al repo sin code review       |
| Hooks `PreToolUse` que auditan ejecuciones  | `.claude/settings.json`          | Comandos peligrosos aunque vengan de un plugin    |

> Conectar un marketplace nuevo o activar un plugin **es un cambio de superficie**. En un repo corporativo, debe pasar por code review como cualquier dependencia.

## 8. Diseño de hooks pre y post tool para reforzar políticas técnicas

Los **hooks** son el mecanismo más fino de gobierno: se enganchan al ciclo de vida del agente y pueden inspeccionar, registrar o bloquear acciones. Eventos habituales:

| Evento             | Cuándo dispara                                           | Caso de uso                                  |
| ------------------ | -------------------------------------------------------- | -------------------------------------------- |
| `SessionStart`     | Al arrancar la sesión                                    | Cargar contexto, validar entorno             |
| `UserPromptSubmit` | Tras un prompt del usuario                               | Logging, redacción de secretos               |
| `PreToolUse`       | Antes de ejecutar una tool (Bash, Write, Edit, MCP, ...) | Bloquear / auditar                           |
| `PostToolUse`      | Tras ejecutar una tool                                   | Auditar resultado, lint del archivo cambiado |
| `Notification`     | Cuando Claude muestra una notificación al usuario        | Integración con sistemas externos            |
| `Stop`             | Al terminar el turno                                     | Resumen, commit automático                   |

Patrón canónico de hook bash:

```bash
#!/usr/bin/env bash
# .claude/plugins/pr-helper/hooks/pre-bash-audit.sh
# Recibe el contexto del evento por stdin (JSON).

input="$(cat)"
tool="$(echo "$input" | jq -r '.tool_name')"
cmd="$(echo "$input" | jq -r '.tool_input.command // ""')"

# Log siempre
echo "[$(date -Iseconds)] $tool: $cmd" >> .claude/audit/bash.log

# Bloqueo selectivo
if echo "$cmd" | grep -qE '(rm -rf|\.env)'; then
  echo "Comando bloqueado por política: $cmd" >&2
  exit 2
fi
exit 0
```

Reglas duras de diseño:

* **Un hook tiene que ser rápido**. Si tarda 2 segundos, cada `Bash` tarda 2 segundos extra.
* **Stdin = contexto del evento**. Salida JSON estructurada por stdout / mensaje por stderr.
* **Exit code 0 = sigue; 2 = bloquea; otros = error y se aborta el flujo**.
* **Idempotencia**: el hook se puede re-disparar si el cliente reintenta. No genere efectos secundarios persistentes en cada call.
* **Fail closed para seguridad, fail open para auditoría**. Decide qué te importa: ¿que pase un comando peligroso, o que se rompa la sesión si el log no escribe?

## 9. Casos de plugin interno para formato, despliegue o seguridad

Dónde un plugin interno paga el coste de mantenerlo:

| Caso                        | Empaqueta                                           | Por qué un plugin (y no un .claude/ suelto)                 |
| --------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| **Formato y estilo**        | Hook `PostToolUse` + skill `commit-msg-style`       | El equipo formatea igual sin que cada dev recuerde la regla |
| **Despliegue**              | Command `/deploy:staging` + agent `release-manager` | Despliegues consistentes; nadie inventa pasos               |
| **Seguridad**               | Hook `PreToolUse` + skill `secrets-check`           | Política central reforzada, no opcional                     |
| **Onboarding**              | Command `/onboarding:start` + skill `repo-tour`     | Nuevos miembros se orientan solos                           |
| **Integración corporativa** | MCP server + commands                               | Jira, Slack, Datadog accesibles del agente                  |

Cuándo NO conviene hacer plugin:

* Un solo command para un solo repo → `.claude/commands/` suelto.
* Una skill que solo usa una persona → `~/.claude/skills/`.
* Un hook experimental que estás probando → `settings.json` directo del repo; promociona a plugin solo cuando esté estable.

> Un plugin no es un experimento: es **API pública para tu equipo**. Hazlo plugin cuando hay 3+ personas que lo van a usar y cuando vas a versionarlo.

### 🧪 Demo 3 — Validar un plugin con `/plugin validate`

* **Objetivo:** ejecutar la validación oficial sobre el plugin plantado y entender qué chequea exactamente.
* **Setup:** rama `tema-21/inicio`. El plugin `pr-helper` está en `.claude/plugins/`. En la sesión de Claude, ejecutar el comando de validación.

**Prompt literal:**

```
Valida el plugin `pr-helper` plantado en `.claude/plugins/pr-helper/`.
Si Claude Code expone `/plugin validate` en esta sesión, úsalo directamente
y muéstrame el output completo. Si no, audita manualmente:
1. ¿plugin.json tiene name, version, description?
2. ¿Cada command en commands/ tiene frontmatter válido?
3. ¿Los hooks declarados existen como scripts y son ejecutables?
4. ¿Las skills y agents tienen su frontmatter mínimo?

Devuélveme el informe estructurado con OK / WARN / FAIL por cada chequeo
y termina con una propuesta de versión para publicar este plugin (semver).
```

**Qué observar:**

* Si `/plugin validate` está disponible, devuelve un informe estructurado por sección.
* Si no, Claude hace la auditoría leyendo los archivos uno a uno (igual de útil para la práctica).
* Los `WARN` típicos: `description` vacía, frontmatter incompleto, hooks sin permisos de ejecución, dependencias del plugin no declaradas.
* La propuesta de versión obliga a pensar en semver real: ¿cambio breaking? ¿feature? ¿fix?
* Nota: la disponibilidad de `/plugin validate` depende de la versión instalada de Claude Code. Si la sesión no lo tiene, el ejercicio sigue funcionando con la auditoría manual.

### 🧩 Ejercicio 3 — Crear o validar un plugin propio

> **Rama:** `git checkout tema-21/ejercicio-03` · **Tiempo:** 20 min · **Tipo:** En clase

Partiendo del plugin plantado `pr-helper`, **empaqueta una capacidad nueva** dentro del mismo plugin (una skill propia, un command o un hook adicional) y valida el plugin completo. Documenta el cambio en `PLUGIN-CAMBIO.md`: qué añades, qué versión semver le subes, qué tests harías antes de publicarlo a un marketplace interno.

***

## 10. Buenas prácticas para no convertir la extensibilidad en una fuente de caos técnico

Cuando un equipo abraza plugins sin disciplina, lo que ayer era productividad mañana es "no sé por qué este repo se comporta distinto en mi máquina". Heurísticas para evitarlo:

* **Inventario explícito.** Un `PLUGINS.md` (o sección del README) que liste los plugins que el equipo espera tener activos en ESE repo. Si no aparece en el inventario, **no es de equipo, es personal**.
* **Versión fijada.** Los plugins se versionan con semver. `1.x` rompe API; `x.1` añade feature; `x.x.1` arregla bug. Tratarlos como dependencias.
* **Hooks rápidos.** Un hook que añade 2s por tool destruye la sesión. Medir y abortar hooks lentos.
* **Hooks fail-explicit**. Si un hook falla, que el mensaje explique **por qué** y **qué hacer**. No `exit 1` mudo.
* **Plugins con un propósito.** Un plugin con 12 commands no relacionados no es un plugin: es una basura empaquetada. Divídelo.
* **Tests del plugin.** Si publicas, tienes tests del comportamiento de cada command y hook. Como con cualquier librería.
* **Revisar plugins externos como dependencias.** Antes de `/plugin install <market>/<algo>`, lee el `plugin.json` y al menos un hook. El plugin corre con tu sesión.
* **Desactivar en lugar de borrar.** Si un plugin estorba en un proyecto, `disable` antes de uninstall. Te ahorras tener que reinstalarlo.

| Antipatrón                            | Síntoma                                    | Coste                              |
| ------------------------------------- | ------------------------------------------ | ---------------------------------- |
| Plugin con 30 commands                | Cada miembro usa 2 distintos               | Surface enorme, mantenimiento alto |
| Hook que escribe a la red sin retry   | A veces falla la sesión sin razón aparente | Sesiones inestables                |
| Marketplace nuevo añadido sin revisar | Un plugin malicioso entra silencioso       | Token / código exfiltrado          |
| Plugin "del autor" no documentado     | Quien se va lo deja roto                   | Bus factor 1                       |
| Hooks que mutan el repo sin avisar    | Diffs misteriosos en commit                | Pérdida de confianza               |

> Una extensibilidad sin gobierno **es una superficie de ataque y un coste de mantenimiento disfrazados de productividad**. Plugins son una herramienta de plataforma, no un atajo personal del último miembro que llegó.

***

## Resumen

* Un **plugin** empaqueta commands, skills, agents, hooks y MCP servers como una unidad versionable.
* Ciclo: `install` → `enable` → `validate` → `update`. Instalar ≠ activar.
* **Hooks** son el mecanismo más fino de gobierno: `PreToolUse` para prevenir, `PostToolUse` para auditar.
* **Marketplaces** propios son canales de actualización: trátalos como mirrors npm internos.
* Scope **repo vs usuario** importa: lo que TODO el equipo necesita va en el repo; lo personal en `~/.claude/`.
* Sin inventario, semver, tests y revisión, los plugins se convierten en **deuda técnica con permisos**.
