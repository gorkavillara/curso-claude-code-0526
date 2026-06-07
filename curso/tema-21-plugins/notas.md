[Documentar en faq-alumnos -> Dudas surgidas en las sesiones]

- Pregunta recurrente: ¿`/plugin install` / `/plugin enable` / `/plugin validate` están disponibles en mi versión? — Depende de la versión instalada de Claude Code. El ecosistema de plugins ha evolucionado rápido; algunos comandos pueden venir bajo flags experimentales o con otros nombres en versiones intermedias. **Probarlo el día anterior** con la versión que se va a usar.

- Pregunta recurrente: "¿Cómo bloqueo un comando exactamente?" — En PreToolUse, el exit code que bloquea es **2**, no 1. `exit 1` se interpreta como error genérico (no necesariamente bloquea según versión). `exit 0` deja pasar. Documentado en el SOLUCION del Ejercicio 2.

- Pregunta recurrente: "¿Por qué a veces el hook no se dispara?" — Las causas habituales: el plugin no está activo, `settings.local.json` sobreescribe el `settings.json` del repo, el script no tiene permisos de ejecución (`chmod +x`), o el hook está mal declarado en `plugin.json`. Checklist en `notas.md` del ejercicio.

[Modificación de la documentación de temas generados en la carpeta docs]

- **[VERIFICADO 2026-06] `extraKnownMarketplaces`** es un **objeto indexado por nombre**, NO un array, y cada entrada lleva un `source` (no una `url` suelta con `trust`):
  ```jsonc
  { "extraKnownMarketplaces": { "imagina-marketplace": { "source": { "source": "github", "repo": "owner/repo" } } } }
  ```
  El docs del tema ya está corregido. Seguir reverificando en cada edición: la nomenclatura ha cambiado al menos una vez.

- **[VERIFICADO 2026-06] La forma canónica de declarar hooks en un plugin NO es el formato simple** `"hooks": { "PreToolUse": "ruta.sh" }` que plantamos. El formato real es el mismo de `settings.json`: un `hooks/hooks.json` (descubierto por convención) o inline en el manifest, con `matcher` + `hooks: [{ "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/..." }]`.
  ⚠️ **El `plugin.json` del fixture (`pr-helper`) en `SOLUCION.md` usa el formato simple, que no es el real.** Pendiente: actualizar el fixture en la rama `tema-21/inicio` del repo de código y el `plugin.json` de `SOLUCION.md` al formato `hooks/hooks.json` real. No tocado todavía porque vive en el repo de código (otra rama), no en este repo de docs.

- **[VERIFICADO 2026-06] El manifest vive en `.claude-plugin/plugin.json`**, no en `plugin.json` de la raíz del plugin. Los componentes (`commands/`, `agents/`, `skills/`, `hooks/`) se descubren por convención; el manifest solo requiere `name`. El fixture y `SOLUCION.md` deberían reflejar esta ruta cuando se actualicen.

- Revisar la convención de namespace para commands de plugin: `<plugin>:<command>` o `/<plugin>:<command>`. Documentar el que use la versión vigente.

[Decisiones de diseño del tema]

- **No se conecta marketplace remoto real en clase.** Cada empresa tiene su flujo (o no tiene). El punto 5 del docs es conceptual y se complementa con el inventario plantado en `marketplace.json` local. Justificación: forzar un marketplace remoto requiere infraestructura que rompe la portabilidad del curso entre cohortes.

- **El marketplace.json plantado es ficticio.** Vive en `.claude/plugins/marketplace.json` y declara dos plugins disponibles internamente: `pr-helper` (el plantado) y un placeholder `release-manager`. No tiene URL real porque no hay servidor que lo sirva. Sirve solo para demostrar la **forma** del archivo, no su consumo en vivo.

- **El plugin plantado (`pr-helper`) es real, no placeholder.** Tiene 2 commands, 1 hook, 1 skill y 1 agente, todos funcionales. Es lo suficientemente grande para inventariarlo en serio y lo suficientemente pequeño para no enturbiar la sesión.

- **El hook usa bash + jq por simplicidad pedagógica.** Es el patrón canónico que aparece en la documentación oficial. Si el aula está en Windows puro sin `jq`, hay una variante con `node -e` que parsea el JSON sin dependencias externas:

  ```bash
  #!/usr/bin/env bash
  input="$(cat)"
  tool="$(node -e 'let d=""; process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).tool_name||""))' <<< "$input")"
  cmd="$(node -e 'let d=""; process.stdin.on("data",c=>d+=c).on("end",()=>console.log((JSON.parse(d).tool_input||{}).command||""))' <<< "$input")"
  # ... resto igual
  ```

  No la plantamos por defecto porque enturbia, pero la dejamos en `notas.md` para que el instructor pueda intercambiarla si la sala lo necesita.

- **Las skills del autor (`curso-tema-doc`, etc.) están en `.gitignore` del repo de código** (`.claude/skills/`). Pero las skills empaquetadas como parte de un plugin (`.claude/plugins/<plugin>/skills/`) SÍ se trackean. Es coherente: el primer caso son skills del instructor que no debe distribuir; el segundo son skills del plugin que se distribuyen con el plugin.

- **El plugin se planta en `tema-21/inicio`** para que esté disponible en los tres ejercicios. Los `EJERCICIO.md` añaden el enunciado específico de cada uno encima del baseline.

[Reflexión post-sesión]

- Si la versión de Claude Code disponible no expone `/plugin enable` o `/plugin validate`, el ejercicio 1 se hace activando el plugin manualmente vía `settings.json` y el ejercicio 3 se hace con auditoría manual. La pedagogía no cambia; el comando exacto puede variar. **Apuntar después de cada cohorte qué comando funcionó** para mantener el `EJERCICIO.md` calibrado.

- Si algún alumno trae un plugin propio del trabajo, dejar 5 min al final para que lo enseñe. Suele ser la mejor demostración de cuándo merece la pena empaquetar.

- Si la sesión va sobrada (los Ejercicios 1 y 2 acaban antes de tiempo), pedir al alumno avanzado que escriba un **segundo hook** `PostToolUse` que detecte secretos en archivos editados por `Edit`. Es práctica extra del mismo patrón, sin abrir tema nuevo.

- Atención al timing del Ejercicio 3: 20 min es ajustado. Si el alumno se entretiene eligiendo qué añadir, recortar: que añada una skill simple (la `branch-naming` de la solución sirve de plantilla) y documente el cambio. La reflexión sobre semver y tests es más importante que la complejidad de la capacidad añadida.
