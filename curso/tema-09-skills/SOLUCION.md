# Soluciones — Tema 9

## Ejercicio 1 — Skill `/doc-function`

### Solución de referencia

`.claude/skills/doc-function/SKILL.md`:

```markdown
---
name: doc-function
description: Documenta una función cuando el usuario pide "documenta [función]" o "JSDoc para"
---

# Skill: doc-function

Documenta cualquier función del repositorio Notebox con JSDoc en español.

## Contexto

- Idioma: comentarios en español.
- Incluir siempre: @param (con tipo), @returns (con tipo y descripción).
- Incluir @throws si la función puede lanzar una excepción conocida.
- No añadir @description si el nombre de la función ya es descriptivo.
- No añadir comentarios de relleno ("Esta función hace X" cuando X ya se lee en el nombre).

## Objetivo

JSDoc mínima y útil: solo lo que no se lee en el código.

## Formato de salida

La función completa con la JSDoc insertada encima.
```

### Criterio de éxito

- La skill genera `@param`, `@returns` y `@throws` cuando corresponde.
- Los comentarios están en español.
- No hay líneas de relleno tipo `// Esta función crea una nota`.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| `description:` demasiado genérica ("documenta código") | Se activa en contextos no deseados — pedir que la restrinjan |
| Comentarios en inglés | La skill no especificó el idioma |
| `@description` vacío o redundante | Pedir que eliminen lo que ya dice el nombre |

---

## Ejercicio 2 — Auto-trigger vs invocación explícita

### Criterio de descripción bien calibrada

- **Sí activa**: mensajes como "tests para createNote", "cubre con tests archiveNote", "añade tests a getNotes".
- **No activa**: "revisa el código", "mejora la función", "¿qué hace createNote?".

Una buena `description:`: `"Añade tests cuando el usuario menciona 'tests para', 'cubre con tests' o 'añade tests a'"`

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Description muy genérica ("ayuda con tests") | Activa la skill en preguntas teóricas sobre testing |
| Description muy específica ("tests para createNote") | No se activa para otras funciones |
| No probaron el caso negativo | Pedir que añadan un mensaje que NO debería activarla |

---

## Ejercicio 3 — Skill `/pre-deploy`

### Solución de referencia

`.claude/skills/pre-deploy/SKILL.md`:

```markdown
---
name: pre-deploy
---

# Skill: pre-deploy

Verifica que el repositorio Notebox está listo para desplegar.

## Checks obligatorios

1. Tests: ejecuta `npm test`. Si falla algún test, reporta cuáles.
2. Typecheck: ejecuta `npm run typecheck`. Si hay errores de tipo, reporta cuáles.
3. Console.log: busca `console.log` en src/ (no en test/). Si hay alguno, lista los archivos.
4. CHANGELOG: si existe CHANGELOG.md, verifica que tiene una entrada con la fecha de hoy o más reciente.

## Formato de salida

Tabla: check → resultado (✅ pasa / ❌ falla) → detalle si falla.
Conclusión: ¿listo para desplegar o necesita correcciones?
```

### Criterio de éxito

- Los 4 checks son verificables automáticamente (el agente puede ejecutarlos o buscarlos).
- Si un check falla, el formato de salida dice qué falla y dónde.
- La skill no tiene invocación automática (es una decisión consciente deployar).

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Checks aspiracionales no verificables ("el código está limpio") | No hay forma de que Claude los evalúe objetivamente |
| Añadieron `description:` a `/pre-deploy` | Preguntarles: ¿queréis que se active automáticamente al deploear? |
| Formato de salida sin distinción pasa/falla | Claude reportará ambigüedad |
