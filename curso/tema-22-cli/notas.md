# Notas internas — Tema 22

Notas operativas del autor sobre decisiones de diseño y limitaciones que no caben en el guion.

---

## Por qué multiplexores (tmux/screen/zellij) son conceptuales y no fixtures plantados

El **principio inviolable** de la skill `curso-tema-doc` (Componente 3) exige que todo fixture viva en el repo: bug plantado, hook plantado, plugin plantado, etc. El alumno hace `git checkout && npm install && npm test` y todo está listo.

Para multiplexores **eso no aplica**:

- `tmux`, `screen`, `zellij` son herramientas del **shell del alumno**, no del repo de prácticas.
- Su configuración vive en `~/.tmux.conf`, `~/.screenrc`, `~/.config/zellij/`. Tocarla desde el repo sería invasivo y reversible solo a mano.
- Cada alumno usa una distinta (o ninguna). Forzar tmux en clase rompería a quien viva en VS Code terminal, a quien use WezTerm con tabs, a quien use Windows Terminal con paneles propios.
- El valor del tema no es "aprender tmux" sino **entender que la CLI de Claude se beneficia de vivir dentro de un multiplexor**. Eso es conceptual.

**Decisión:** tratar el punto 9 conceptualmente. Demo 3 lo muestra en pizarra/ASCII. El Ejercicio 3 pide al alumno **diseñar** su layout en `PRODUCTIVIDAD.md`, no configurarlo en clase.

Si un alumno ya usa tmux y quiere enseñarlo, dejarle 5 min al final de E3. No es parte del recorrido obligatorio.

---

## Por qué keybindings del REPL están documentados con un disclaimer

Los keybindings del REPL de Claude Code (`Ctrl+X Ctrl+E`, `Esc`, `Shift+Enter`, etc.) **varían entre versiones, terminales y sistemas operativos**:

- `Shift+Enter` para multilínea depende del emulador (funciona en iTerm2, varía en Windows Terminal).
- `Ctrl+X Ctrl+E` (abrir editor externo) requiere que `$EDITOR` esté configurado y depende del shell.
- `Esc` para interrumpir cambia con la versión instalada de Claude Code.

**Decisión:** documentarlos como "referencia, puede variar" y remitir al `/help` de la versión instalada como fuente de verdad. No exigir un atajo concreto en el ejercicio.

El valor pedagógico es **saber que existen y dónde buscarlos**, no memorizar combinaciones que cambiarán.

---

## Por qué `/rewind` se trata como "puede no estar disponible"

`/rewind` es un comando relativamente reciente y su disponibilidad depende de la versión de Claude Code instalada. Algunas builds antiguas no lo exponen, otras lo exponen con limitaciones.

**Decisión:** mencionarlo en docs y guion como parte del kit de sesiones largas, pero el `EJERCICIO.md` debe aceptar la alternativa "no está disponible en mi versión, lo documento así". El alumno no falla el ejercicio por una limitación de su build.

Probarlo el día anterior y, si la sesión no lo tiene, anunciarlo al inicio.

---

## Por qué no plantamos un `~/.zshrc` o `~/.bashrc` modificado

Por la misma razón que no plantamos tmux: el shell config vive **fuera del repo**. Modificarlo en `tema-22/inicio` rompería la máquina del alumno o se ignoraría (porque su shell carga `~/.zshrc`, no nuestro repo).

**Decisión:** los aliases del Ejercicio 3 son una **propuesta documentada en `PRODUCTIVIDAD.md`**. Si el alumno quiere instalarlos, los copia él a su `~/.zshrc`. No es parte del fixture.

---

## Por qué el dev-server.sh es bash y no compatible con PowerShell puro

`scripts/dev-server.sh` usa shebang `#!/usr/bin/env bash`. Funciona en macOS, Linux, WSL y Git Bash en Windows. **No** en PowerShell puro.

**Decisión:** documentar en el README de `tema-22/inicio` que el script requiere bash. Si un alumno está en PowerShell sin bash:

- Opción A: ejecutar el server con `node scripts/dev-server.js` (no plantado, lo escribiría a mano). **Rechazado** — viola el principio inviolable.
- Opción B: avisar que necesita Git Bash o WSL. **Aceptado** — es un requisito documentado del entorno, no un fixture que falte.

Para sesiones donde la mayoría usa Windows puro, el instructor puede ofrecer una variante PowerShell (`scripts/dev-server.ps1`) pero NO se planta por defecto: añadiría 2 fixtures por concepto y enturbiaría el repo.

---

## Por qué `notas-sesion.md` tiene exactamente 3 tareas

Necesitamos que la sesión del Ejercicio 2 sea **suficientemente larga** para que `/compact` tenga algo que resumir, pero **suficientemente corta** para caber en 30 min con la verificación.

- 1 tarea: el compact no se nota.
- 5 tareas: el alumno no termina en 30 min.
- **3 tareas**: el compact se nota, el alumno termina con margen, y queda tiempo para `/rewind` y `claude -r`.

Las tareas son intencionadamente pequeñas (añadir una validación, escribir un test, actualizar el README). No son el aprendizaje principal — el aprendizaje es la **gestión de la sesión**.

---

## Por qué `../notas-soporte/` está fuera del repo (no en una subcarpeta)

Si la pusiéramos en `./notas-soporte/` dentro del repo, `--add-dir` sería innecesario: Claude ya la vería. El punto del ejercicio es **practicar `--add-dir` con un directorio que el agente NO ve por defecto**, lo que exige que esté fuera del cwd.

**Decisión:** plantar `notas-soporte/` un nivel por encima del repo, con un script de setup que el README documenta. El alumno verifica la existencia con `ls ../notas-soporte/` antes de empezar.

Riesgo: si el repo se clona en un directorio sin permisos para crear `../notas-soporte/`, el ejercicio falla. El README lo cubre con instrucciones de fallback (crear la carpeta donde el alumno tenga permisos y usar la ruta absoluta).

---

## Decisión de filename: `tema-22-cli.md` vs `tema-22-cli-avanzada.md`

La tabla de la skill (`curso-tema-doc/SKILL.md`) lista el filename como `tema-22-cli-avanzada.md`. Pero el usuario explícitamente pidió `tema-22-cli.md` en este tema. Gana la instrucción del usuario para este caso concreto.

`SUMMARY.md` se actualiza con el filename que efectivamente se usa (`tema-22-cli.md`). La regla "gana `SUMMARY.md`" de la skill sigue funcionando: ambos coinciden.
