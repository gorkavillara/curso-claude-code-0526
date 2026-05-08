---
hidden: true
---

# Tema 3 — Preparación del entorno técnico

> **Duración estimada:** \~60 min **Tipo:** práctico + demos guiadas

## Objetivo del tema

Dejar tu entorno **listo para sesiones intensivas**: instalación limpia, permisos correctos, validaciones hechas y errores típicos descartados antes de empezar.

***

## 1. Instalación ordenada del entorno de desarrollo y terminal asociada

Antes de instalar Claude Code, **el stack profesional debe estar listo**:

* **Runtime principal del equipo** (Node 24+, Python 3.11+, Go 1.22+, Java 21+, según tu caso).
* **Terminal moderna:** Windows Terminal + PowerShell 7, iTerm2, Alacritty o terminal Linux.
* **Editor con buena UX de diffs:** VS Code o IDE de JetBrains.
* **Git** instalado y autenticado.

> Si la base no está limpia, Claude Code amplifica el caos en vez de aportar.

## 2. Preparación del sistema para múltiples repositorios y monorepos

* Un directorio raíz para todos los repos (ej.: `~/dev/`, `C:\dev\`).
* Convención de nombres y separación entre **repos personales** y **profesionales**.
* Para monorepos grandes: usar `--add-dir` para añadir paths fuera del cwd.
* Evita anidar repos dentro de repos (Claude se confunde con `.git` colaterales).

## 3. Variables de entorno, autenticación y validación de acceso al servicio

* `ANTHROPIC_API_KEY` (entornos sin OAuth) o login interactivo (Team / Enterprise).
* `claude --version` debe responder.
* `claude` con sesión arrancada → `/status` muestra modelo + workspace + cuenta.
* Si tu organización usa SSO (Okta, Entra, Google Workspace), valida que el flujo de login funciona desde **el equipo del curso**, no solo el de oficina.

### 🧪 Demo 1 — Primer login y validación

* **Objetivo:** confirmar que tu instalación está sana antes de tocar ningún repo.
* **Setup:** terminal abierta, sin Claude Code arrancado todavía.

**Pasos:**

1. `claude --version` → versión instalada.
2. `claude` → arranca sesión interactiva. Si pide login, hazlo.
3. Dentro de la sesión: `/status` → comprueba modelo y workspace.
4. Pregunta trivial: `dime "hola" y nada más`. Debe responder.
5. `/exit`.

**Qué observar:**

* Si `claude --version` falla → problema de PATH o instalación.
* Si `/status` muestra workspace incorrecto → estás logueado donde no toca.
* Si la respuesta tarda mucho o falla → revisar VPN / firewall / proxy corporativo.

## 4. Organización local de repositorios y carpetas de trabajo auxiliares

* `~/dev/<empresa>/<repo>` para trabajo profesional.
* `~/scratch/` o `~/tmp/` para experimentos efímeros.
* `~/.claude/` y `<repo>/.claude/` separadas mentalmente:
  * `~/.claude/` → tuyo, global.
  * `<repo>/.claude/` → del equipo, versionado.

## 5. Preparación del editor para diffs, linting y navegación rápida

* **Linter del proyecto activo** (ESLint, ruff, golangci-lint, ktlint…).
* **Formatter on save** activado.
* Atajos memorizados: _go to definition_, _find usages_, _abrir archivo por nombre_.
* Vista de diff lateral funcionando (en VS Code: panel "Source Control").

> Sin estas tres cosas, revisar lo que produce Claude se hace tedioso y pierdes la velocidad que la herramienta te da.

## 6. Configuración inicial de Git, ramas y reglas de trabajo antes de invocar la IA

* `git config --global user.name` y `user.email` configurados.
* SSH key cargada o PAT activo.
* Convención de ramas del equipo conocida (`feature/...`, `fix/...`, `EV-XXX/...`).
* Pre-commit hooks instalados si el proyecto los tiene.
* Estado limpio (`git status`) antes de empezar una sesión con Claude.

## 7. Verificación de permisos mínimos para editar, ejecutar y validar cambios

Comprueba que tu usuario puede:

* Escribir en `~/.claude/`.
* Escribir en el repo.
* Ejecutar comandos del proyecto: `npm test`, `npm run dev`, `docker run`…
* Pasar antivirus / EDR sin bloqueo en operaciones del agente.

### 🧪 Demo 2 — Validación de permisos y comandos clave

* **Objetivo:** descartar bloqueadores antes de la primera sesión real.
* **Setup:** terminal en la raíz del repo Notebox.

**Pasos:**

1.  Verifica `~/.claude/` (Linux/macOS):

    ```bash
    mkdir -p ~/.claude && touch ~/.claude/.test-write && rm ~/.claude/.test-write && echo OK
    ```

    Windows (PowerShell):

    ```powershell
    New-Item -ItemType Directory -Force -Path "$HOME\.claude" | Out-Null
    Set-Content "$HOME\.claude\.test-write" "ok"; Remove-Item "$HOME\.claude\.test-write"; "OK"
    ```
2.  Comandos del proyecto:

    ```
    npm install
    npm test
    npm run typecheck
    ```
3.  Docker:

    ```
    docker run --rm hello-world
    ```

**Qué observar:**

* Cualquier "permission denied" → escálalo a IT antes de seguir.
* Si Docker pide credenciales → resuélvelo ahora, no en mitad del curso.

## 8. Integración con Docker, runtimes y utilidades habituales del equipo

* **Docker Desktop / Podman / Rancher** arrancando sin error.
* Runtimes del equipo activos (`node`, `python`, `go`, `java`).
* Utilidades habituales: `gh`, `jq`, `curl`, `httpie` si se usan.
* Variables de entorno del proyecto cargadas (`.env` local, `.envrc` con direnv, etc.).

## 9. Checklist de salud técnica del entorno antes de sesiones intensivas con Claude Code

| ✅ | Comprobación                             |
| - | ---------------------------------------- |
| ☐ | `claude --version` y `/status` OK        |
| ☐ | Login al workspace correcto              |
| ☐ | `~/.claude/` con permisos R/W            |
| ☐ | Repo con `git status` limpio             |
| ☐ | Linter y formatter activos en el editor  |
| ☐ | `npm test` (o equivalente) verde         |
| ☐ | Docker funcionando si lo usa el proyecto |
| ☐ | VPN corporativa activa si aplica         |
| ☐ | Antivirus / EDR sin alertas pendientes   |

### 🧪 Demo 3 — Health check completo del entorno

* **Objetivo:** ejecutar el checklist de un tirón antes de la primera sesión seria.
* **Setup:** terminal limpia, repo Notebox.

**Pasos:**

1. Recorre la tabla del punto 9 marcando casillas.
2. En cuanto encuentres una casilla que falle, **detente y arréglala** antes de seguir.
3.  Cuando todo esté verde, lanza `claude` y pídele:

    ```
    Resume en 3 líneas qué hace este repo y dime si detectas algo
    raro en la configuración o en las dependencias.
    ```
4. Si responde citando archivos reales y sin errores → entorno listo.

**Qué observar:**

* El health check se hace **una vez por sesión**, no una vez por curso.
* Si alguno falla intermitentemente, anótalo: probablemente sea un problema de red o EDR que vuelva más adelante.

## 10. Errores de arranque más frecuentes y cómo evitarlos

| Síntoma                                   | Causa típica                   | Solución                             |
| ----------------------------------------- | ------------------------------ | ------------------------------------ |
| `claude: command not found`               | PATH                           | Reinstalar / añadir bin al PATH      |
| `401 Unauthorized`                        | Token inválido o expirado      | Re-login                             |
| Login bloqueado por SSO                   | Política corporativa           | Pedir a IT                           |
| Sin permiso para escribir en `~/.claude/` | Antivirus / EDR                | Excepción en EDR                     |
| `npm test` rompe nada más empezar         | Dependencias desactualizadas   | `rm -rf node_modules && npm install` |
| Respuestas lentas / timeouts              | Proxy / firewall corporativo   | Pedir whitelist a IT                 |
| `permission denied` en Docker             | Docker socket / grupo `docker` | Añadir usuario al grupo              |
| Cambios de Claude no se aplican           | Modo `plan` activo             | Cambiar a `default` o `acceptEdits`  |

***

## Resumen

* Stack profesional **antes** que Claude Code.
* `~/.claude/` y `<repo>/.claude/` son cosas distintas.
* Permisos verificados con un script de tres líneas, no a ojo.
* Health check antes de cada sesión intensiva.
* Los errores típicos casi siempre son **PATH, token, EDR o proxy**.
