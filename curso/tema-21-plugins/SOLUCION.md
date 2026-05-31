# Soluciones — Tema 21

## Ejercicio 1 — Activar e inventariar un plugin local

### Solución de referencia

El plugin plantado en `.claude/plugins/pr-helper/` tiene la siguiente estructura:

```
.claude/plugins/pr-helper/
├── plugin.json
├── README.md
├── commands/
│   ├── summary.md          → /pr-helper:summary
│   └── checklist.md        → /pr-helper:checklist
├── hooks/
│   └── pre-bash-audit.sh
├── skills/
│   └── commit-msg-style/
│       └── SKILL.md
└── agents/
    └── pr-reviewer.md
```

**`plugin.json` esperado:**

```json
{
  "name": "pr-helper",
  "version": "0.1.0",
  "description": "Comandos, hook de auditoría y skill de estilo de commit para PRs internos",
  "author": "Equipo de plataforma",
  "commands": ["commands/summary.md", "commands/checklist.md"],
  "hooks": {
    "PreToolUse": "hooks/pre-bash-audit.sh"
  },
  "skills": ["skills/commit-msg-style"],
  "agents": ["agents/pr-reviewer.md"]
}
```

**Activación:** según la versión instalada de Claude Code:

- Con `/plugin enable pr-helper` si el comando existe.
- Si no, el plugin se activa al estar plantado en `.claude/plugins/` y referenciado en `.claude/settings.json` (`enabledPlugins: ["pr-helper"]` o equivalente). El `EJERCICIO.md` cubre los dos caminos.

**`INVENTARIO-PLUGIN.md` ejemplo de respuesta correcta:**

```markdown
# Inventario del plugin pr-helper

## Commands

| Comando | Qué hace |
|---|---|
| `/pr-helper:summary` | Genera un resumen del PR actual basado en el diff |
| `/pr-helper:checklist` | Devuelve la checklist de revisión interna |

## Hooks

| Evento | Script | Para qué |
|---|---|---|
| `PreToolUse` | `hooks/pre-bash-audit.sh` | Loguea cada invocación de Bash a `.claude/audit/bash.log` |

## Skills

| Skill | Cuándo se activa |
|---|---|
| `commit-msg-style` | Cuando el usuario pide redactar un commit message |

## Agents

| Agente | Cuándo invocar |
|---|---|
| `pr-reviewer` | Para revisión de PRs (analiza diff y deja feedback estructurado) |

## Activación: proyecto vs usuario

- **A nivel proyecto** (viaja con el repo):
  - El hook `PreToolUse` → política de auditoría obligatoria para todo el equipo.
  - El agente `pr-reviewer` → la revisión sigue la misma plantilla en todo el equipo.
  - La skill `commit-msg-style` → estilo de commit consistente en este repo.

- **A nivel usuario** (personal):
  - Los commands `/pr-helper:summary` y `/pr-helper:checklist` podrían quedarse a
    nivel usuario si solo los uso yo. Pero como el plugin es del equipo, es más
    coherente que viajen con el repo y todo el mundo tenga el mismo lenguaje.

- **Decisión:** todo a nivel proyecto. El plugin es del equipo, no personal.
```

### Criterio de éxito

- [ ] El alumno distingue "plantado" de "activado".
- [ ] Lista todos los commands, hooks, skills y agents del plugin.
- [ ] Justifica al menos un componente en cada scope (repo / usuario) o argumenta por qué todo va en uno solo.
- [ ] El command `/pr-helper:summary` (o equivalente) se ha ejecutado al menos una vez.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Confunden plugin plantado con plugin activo | Recordar: plantar en `.claude/plugins/` no carga nada. La activación es deliberada. |
| Confunden el hook del plugin con un hook suelto en `settings.json` | Mostrar la línea `"hooks"` del `plugin.json`. El plugin lo declara como propio. |
| Justifican el scope sin reflexionar ("todo en repo porque sí") | Pedirles ejemplo concreto: si alguien no usa nunca `/pr-helper:checklist`, ¿qué pasa? |

---

## Ejercicio 2 — Escribir un hook con justificación de gobierno

### Solución de referencia

**Hook esperado en `.claude/plugins/pr-helper/hooks/pre-bash-audit.sh`:**

```bash
#!/usr/bin/env bash
# PreToolUse hook — bloquea rm -rf y .env; loguea el resto.

input="$(cat)"
tool="$(echo "$input" | jq -r '.tool_name // ""')"
cmd="$(echo "$input" | jq -r '.tool_input.command // ""')"
ts="$(date -Iseconds)"

# Patrón de bloqueo: rm -rf o cualquier referencia explícita a .env
if echo "$cmd" | grep -qE 'rm[[:space:]]+-rf|(^|[[:space:]/])\.env(\b|$)'; then
  echo "[$ts] BLOCKED $tool: $cmd" >> .claude/audit/bash.log
  echo "Política de gobierno: comando bloqueado ($cmd). Justifica el uso o adáptalo." >&2
  exit 2
fi

# Log + paso libre
echo "[$ts] $tool: $cmd" >> .claude/audit/bash.log
exit 0
```

**Verificación esperada desde Claude:**

- `ls -la` → log `ls -la`, comando ejecutado normalmente.
- `rm -rf /tmp/foo` → log con `BLOCKED`, mensaje de error, **no se ejecuta**.
- `cat .env` → log con `BLOCKED`, mensaje de error, **no se ejecuta**.

**`GOBIERNO-HOOK.md` ejemplo de respuesta correcta:**

```markdown
# Gobierno del hook PreToolUse

## Política técnica reforzada

Cubre dos riesgos del Tema 16 (seguridad y hardening):

1. **Borrado masivo accidental** (`rm -rf`): un agente con permiso de Bash
   puede destruir el repo o el FS. El hook lo previene a nivel cliente.
2. **Lectura de secretos** (`.env`): el agente no debe leer credenciales,
   ni siquiera por accidente al diagnosticar.

## PreToolUse vs PostToolUse

Elijo **PreToolUse** porque la política exige **prevenir**, no auditar.
PostToolUse llega tarde: el `rm -rf` ya ejecutó. PostToolUse encaja en
auditoría de cambios (qué se escribió, qué archivos cambiaron tras una
Edit), pero no en bloqueo.

## Qué pasa si otro miembro del equipo desactiva el hook

El hook está declarado en `.claude/settings.json`, que viaja con el repo.
Si alguien lo desactiva localmente en su `.claude/settings.local.json`
(que NO se commitea), su sesión deja de tener el bloqueo y nadie se entera.

**Mitigación:**

- Política central (Anthropic Enterprise): el hook se declara a nivel
  organización y no se puede sobrescribir localmente.
- Code review: cualquier cambio sobre `settings.json` debe pasar por PR.
- Detección: un job de CI puede verificar que el hook está activo cuando
  alguien sube cambios (script que compara contra una checksum esperada).
```

### Criterio de éxito

- [ ] El hook bloquea `rm -rf` y `.env` con `exit 2` y mensaje por stderr.
- [ ] El hook sigue logueando los comandos no bloqueados.
- [ ] El log muestra entradas `BLOCKED` cuando hay bloqueo.
- [ ] `GOBIERNO-HOOK.md` justifica la elección `PreToolUse` y reflexiona sobre el riesgo de desactivación local.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Usar `exit 1` esperando bloqueo | En Claude Code, el código que bloquea es `exit 2`. Verificar con `rm -rf` y comprobar que se aborta. |
| `grep` sin escape de `.` en `.env` | `\.env` con escape; `.env` sin escape captura `aenv`, `xenvy`... falso positivo. |
| `PostToolUse` para bloqueo | Llega tarde. Demostrarlo: el comando ya ejecutó. |
| No reflexionar sobre `settings.local.json` | El alumno copia el hook pero no se da cuenta de que es esquivable. Insistir en gobierno central. |

---

## Ejercicio 3 — Crear o validar un plugin propio

### Solución de referencia

Hay tres caminos válidos. Mostramos la opción **skill nueva** (más demostrativa); el alumno puede elegir command o hook con la misma estructura.

**Opción A: skill nueva `branch-naming` en el plugin**

```
.claude/plugins/pr-helper/skills/branch-naming/SKILL.md
```

```markdown
---
name: branch-naming
description: Aplica la convención de naming interna para ramas de feature, bugfix y hotfix. Trigger cuando el usuario pide crear una rama o sugerir nombres.
---

# Skill: branch-naming

Convención del equipo:

- `feature/EV-<num>-<slug>` para features.
- `bugfix/EV-<num>-<slug>` para bugfix vinculado a ticket.
- `hotfix/<slug>-YYYYMMDD` para hotfix en producción.
- Slug en kebab-case, ASCII, sin tildes, < 40 caracteres.

Cuando el usuario pida nombre de rama:
1. Identifica el tipo (feature / bugfix / hotfix).
2. Pide el número de ticket si no lo hay.
3. Sugiere el slug a partir del título del ticket.
4. Devuelve el nombre completo y el comando `git checkout -b ...`.
```

**`plugin.json` actualizado:**

```json
{
  "name": "pr-helper",
  "version": "0.2.0",
  "description": "Comandos, hook de auditoría, skill de estilo de commit y naming de ramas para PRs internos",
  "author": "Equipo de plataforma",
  "commands": ["commands/summary.md", "commands/checklist.md"],
  "hooks": {
    "PreToolUse": "hooks/pre-bash-audit.sh"
  },
  "skills": ["skills/commit-msg-style", "skills/branch-naming"],
  "agents": ["agents/pr-reviewer.md"]
}
```

Versión: `0.1.0` → `0.2.0` (bump minor: feature nueva, no breaking).

**`PLUGIN-CAMBIO.md` ejemplo:**

```markdown
# Cambio en el plugin pr-helper

## Capacidad añadida

Skill `branch-naming`: aplica la convención interna de naming de ramas.
Trigger automático cuando el usuario pide crear una rama o sugerir nombres.

## Versión

`0.1.0` → `0.2.0` (semver: bump minor — feature nueva, retrocompatible,
no rompe el comportamiento anterior).

Si hubiera cambiado el comportamiento del hook existente (p. ej. ahora
bloquea algo que antes no), sería `1.0.0` (bump major).

## Tests previos a publicar

1. **Skill se activa con el trigger esperado.** Prompt: "necesito una rama
   nueva para el ticket EV-432". La skill debe disparar.
2. **Skill NO se activa fuera del trigger.** Prompt: "explícame este código".
   La skill NO debe disparar.
3. **Output respeta el formato.** El nombre devuelto encaja con el regex
   `^(feature|bugfix|hotfix)/[a-z0-9-]+$`.
4. **Plugin pasa `/plugin validate`** sin warnings ni fails.
5. **Hook sigue funcionando** tras el cambio: ejecutar un comando bloqueado
   y comprobar que el bloqueo sigue activo.

## Distribución

Como el plugin vive en el repo del equipo:

- **Fuente: marketplace interno** (`imagina-internal/pr-helper`) si lo
  tenemos publicado.
- **Alternativa: git URL** (`https://github.com/imagina/cc-plugin-pr-helper`)
  si no hay marketplace.
- **Ruta local** solo en desarrollo, no para distribución.
```

### Criterio de éxito

- [ ] El alumno añade UNA capacidad nueva coherente con el propósito del plugin.
- [ ] El `plugin.json` se actualiza con la versión semver correcta (`0.1.0` → `0.2.0` o `0.1.1` según corresponda).
- [ ] La capacidad nueva tiene su frontmatter / declaración mínima.
- [ ] El plugin pasa la validación manual o automática sin fails.
- [ ] `PLUGIN-CAMBIO.md` propone al menos 3 tests con sentido (comportamiento, no implementación).

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Bump arbitrario (`0.1.0` → `2.0.0` por una skill nueva) | Pedir justificación semver. Una feature retrocompatible es minor. |
| Añadir 3 capacidades "ya que estamos" | Antipatrón. Una intención por iteración. |
| Tests que verifican implementación (líneas exactas, paths) | Tests frágiles. Pedir tests de comportamiento. |
| Olvidar actualizar `plugin.json` con la capacidad nueva | El plugin no la expone aunque el archivo exista. Mostrar la línea `"skills": [...]`. |
| Cambio que rompe un command existente y se sube como minor | Es major. Insistir. |
