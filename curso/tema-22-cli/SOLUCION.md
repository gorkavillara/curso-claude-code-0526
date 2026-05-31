# Solución — Tema 22

Soluciones de referencia para el instructor. No compartir con alumnos antes de la sesión.

---

## Ejercicio 1 — `CLI-INVENTARIO.md` esperado

### Comandos slash relevantes (lista mínima esperable)

Oficiales (los alumnos deben mencionar al menos 6):
- `/help`, `/status`, `/usage`, `/config`, `/permissions`, `/mcp`, `/resume`, `/rewind`, `/compact`, `/clear`, `/add-dir`, `/exit`.

Del proyecto (plantados en el repo):
- `/repo-status` — vive en `.claude/commands/repo-status.md`. Resume `package.json`, `.mcp.json` y `.claude/`.

### REPL vs `-p` — al menos 3 diferencias

| | REPL | `-p` |
|---|---|---|
| Contexto entre prompts | Sí | No |
| Salida | Stream en TTY | stdout aprovechable |
| Para qué | Trabajo en curso | One-shot / automatización |
| Sesiones recuperables | Sí | No |
| Coste mental | Alto | Bajo |

### Dos automatizaciones con `claude -p`

Ejemplos válidos:
- Resumen diario de PRs abiertos: `gh pr list --json title,url | claude -p "Genera un resumen ejecutivo en 5 bullets"`.
- Audit nocturno de un log: `tail -1000 /var/log/app.log | claude -p "Detecta errores anómalos y priorízalos"`.
- Generación de release notes: `git log v1.0.0..HEAD --oneline | claude -p "Agrupa por feature/fix/chore"`.
- Validación de un Dockerfile en CI: `cat Dockerfile | claude -p "Audita por simplicidad y seguridad"`.

### `claude -c` vs `claude -r`

- `-c` / `--continue`: retoma la **última** sesión sin selector. Cuando solo cerraste sin querer.
- `-r` / `--resume`: abre el selector de sesiones recientes. Cuando quieres elegir cuál.

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| "El `-p` no recuerda la respuesta anterior" | Confunden `-p` con REPL. `-p` no mantiene contexto. |
| "No veo `/repo-status` en `/help`" | Están en otro directorio. El comando es del proyecto: solo aparece dentro del repo. |
| Pegan rutas absolutas en el prompt en vez de `/add-dir` | Funciona peor: el agente no garantiza poder leer fuera de los directorios configurados. |
| Confunden `claude -c` con `claude -r` | Aclarar la regla: `-c` última, `-r` selector. |

---

## Ejercicio 2 — `SESION-LARGA.md` esperado

### Métricas antes/después de cada `/compact`

Los alumnos deben anotar (cifras aproximadas, varían por modelo):

| Momento | Tokens contexto (aprox.) | % ventana usada |
|---|---|---|
| Inicio sesión | < 5k | < 5% |
| Tras tarea 1 | ~15k | ~10% |
| Tras tarea 2 | ~25k | ~15% |
| Tras tarea 3 | ~40k | ~25% |
| Tras `/compact` | ~10k | ~5% |

Aceptar variación; lo importante es que **el compact reduce significativamente** y que el alumno lo haya observado con `/usage`.

### Qué se ha perdido tras `/compact`

Lo típico (verificar con preguntas concretas):

- ✅ Conserva: archivos modificados, decisiones de alto nivel, tareas completadas.
- ❌ Pierde: mensajes literales de tests, líneas exactas modificadas, pasos intermedios del razonamiento.
- ❌ Pierde con frecuencia: el orden exacto de operaciones, errores intermedios resueltos.

### Gobierno de sesión larga en equipo (4–5 horas)

Respuesta modelo:

> "Una sesión por intención. Si trabajo 5h en el mismo feature, `/compact` con foco cada 1–1.5h para no llegar al límite. `/usage` cada 30 min para anticipar. Si cambio de feature, **cierro y abro limpio** — no compacto. Antes de cerrar al final del día, anoto el estado en un `NOTAS-SESION.md` para retomar mañana con `claude -r` sin depender del compact."

Si un alumno propone "siempre `/compact`", señalar: el compact pierde detalle. Para tareas de debug fino (perseguir un error oscuro), compactar te quita las pistas que necesitas.

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| `/compact` sin instrucción de foco | Resumen genérico, pierde lo importante. Forzar la instrucción explícita. |
| `/rewind` confundido con `git reset` | Aclarar: `/rewind` deshace el último paso del agente, no estado del repo. |
| Sesión no aparece en `claude -r` | Suelen haber cambiado de directorio. Las sesiones son por proyecto. |
| Compactan después de cada respuesta | Sobre-compactación: pierdes contexto sin ganar nada. |

---

## Ejercicio 3 — `PRODUCTIVIDAD.md` esperado

### `--append-system-prompt` propio (ejemplo válido)

```
Responde siempre en español, tono directo, sin fórmulas corporativas.
Antes de editar archivos en src/, lanza `npm test` y resume el estado.
No edites archivos en test/ sin pedírmelo explícitamente.
Cuando termines una tarea, devuelve un resumen en 4 bullets máximo.
```

Criterio de validez:
- Mínimo 2 reglas (idioma/tono + comportamiento).
- En español, sin contradicciones.
- No reemplaza al `CLAUDE.md` (que es del repo).

### Tres aliases del shell (ejemplo válido)

```bash
# Resumen rápido del repo actual
alias cstatus='claude -p "Resume en 5 líneas qué hay en este repo, entry point y dependencias clave."'

# Auditoría del último diff
alias caudit='git diff HEAD~1 | claude -p "Audita este diff: bugs, malos olores, riesgos. Sé directo."'

# Continuar la última sesión
alias cc='claude -c'
```

Criterio de validez:
- Tres aliases distintos, no variaciones del mismo.
- Al menos uno usa pipe (stdin como contexto).
- Al menos uno sirve para automatización (no solo para teclear menos).

### Layout de multiplexor (ejemplo válido)

```
Sesión tmux: feature-x

Panel 1 (50% izq):  Claude Code (REPL de la sesión)
Panel 2 (50% der):  Tests en watch (npm run test:watch)
Panel 3 (abajo izq): Dev server (npm run dev)
Panel 4 (abajo der): Shell libre (git, gh, exploración)

Atajo: tmux new -s feature-x para crear; tmux attach -t feature-x para retomar.
```

Criterio de validez:
- Claude tiene su propio panel (no compartido con shell).
- Hay al menos un panel para "lo que está corriendo" (server o watcher).
- Hay un panel libre para `git`/exploración.

### Regla anti-ejemplo en `--append-system-prompt`

Respuestas esperadas:

- "No respondas nunca con un resumen": contradice utilidad del agente.
- "Ignora `CLAUDE.md`": rompe el sistema de memoria del repo.
- "No leas tests": castra una capacidad clave.
- "Asume que todo lo que digo está bien sin verificar": rompe el rol del agente.

Cualquier regla que **anule una capacidad fundamental** o **introduzca riesgo** vale como anti-ejemplo.

### Errores frecuentes a señalar

| Síntoma | Diagnóstico |
|---|---|
| `--append-system-prompt` de 30 líneas | Eso es un `CLAUDE.md` mal puesto. Append = 2–4 líneas. |
| Reglas contradictorias con el system oficial | El agente ignora el append o pelea contra sí mismo. |
| Server lanzado en foreground | Bloquea el REPL. Recordar `en background`. |
| Layout sin Claude en él | Buena señal de pensar el entorno, malo si era despiste. Preguntar. |
| Tres aliases que son lo mismo con flags distintos | Pedir diversidad: resumen, audit, automatización. |

---

## Coherencia con docs/ y guion

- Las tres demos del guion (`/repo-status` + `/add-dir`, `/compact` + `/resume` + `/rewind`, background + `--append-system-prompt`) coinciden 1:1 con las del `docs/tema-22-cli.md`. Mismos prompts literales.
- Los tres ejercicios entregan tres documentos distintos: `CLI-INVENTARIO.md`, `SESION-LARGA.md`, `PRODUCTIVIDAD.md`. No se confunden entre ramas.
- Las previews 🧩 en docs/ repiten literalmente la rama, el tiempo (30 min) y el tipo (En clase).
