---
hidden: true
---

# Tema 9 — Skills reutilizables para estandarizar tareas técnicas del equipo y reducir prompting repetitivo

> **Duración estimada:** ~60 min
> **Tipo:** práctico — alumnos delante del teclado

## Objetivo del tema

Pasar de escribir el mismo prompt diez veces a encapsularlo en una skill que cualquier miembro del equipo invoca con un comando. Las skills son la capa de estandarización entre el agente genérico y las convenciones específicas de tu organización.

***

## 1. Qué son las Skills y cómo amplían la capacidad de Claude Code

Una skill es una instrucción reutilizable encapsulada en un archivo `SKILL.md`. En lugar de redactar el mismo prompt complejo cada vez, lo escribes una vez con todo el contexto necesario y lo invocas cuando lo necesitas.

| Sin skills | Con skills |
|---|---|
| Prompt largo cada vez | Una línea: `/review-pr` |
| Contexto en tu cabeza | Contexto en el archivo |
| Inconsistente entre sesiones | Reproducible y versionable |
| Solo tú lo sabes usar | Todo el equipo lo usa igual |

> Las skills no son atajos de teclado. Son **contratos de comportamiento** compartidos.

## 2. Estructura de un `SKILL.md` útil para tareas repetibles y bien delimitadas

Ubicación: `.claude/skills/<nombre>/SKILL.md`

```yaml
---
name: <slug-en-kebab-case>
description: <cuándo se activa automáticamente — opcional>
---

# Instrucciones de la skill

<contexto fijo, objetivo, restricciones, formato de salida>
```

Lo que diferencia una skill buena de una mala:

- **Contexto fijo**: convenciones del repo, rutas importantes, framework de tests.
- **Objetivo claro** en una frase.
- **Restricciones explícitas**: qué no debe hacer, qué firma debe respetar.
- **Formato de salida** esperado: tabla, lista, diff, código completo.

Lo que *no* debe tener una skill:

- ❌ Pasos genéricos que Claude ya sabe hacer sin instrucciones.
- ❌ Más de un objetivo. Si hace A y B, son dos skills.
- ❌ Instrucciones que cambian cada vez que la usas.

### 🧪 Demo 1 — Crear `/add-tests` desde cero

- **Objetivo:** ver el proceso completo de diseñar y activar una skill nueva.
- **Setup:** repo Notebox en `tema-09/inicio`. Sin ningún archivo en `.claude/skills/`.

**Pasos:**

1. Crea el directorio `.claude/skills/add-tests/` y el archivo `SKILL.md`:

```
---
name: add-tests
description: Añade tests cuando el usuario menciona "tests para" o "cubre con tests"
---

# Skill: add-tests

Añade tests de unidad para la función indicada en el repositorio Notebox.

## Contexto

- Framework: node --test (nativo, sin jest/vitest).
- Tests en test/. Nombre: <módulo>.test.ts.
- No mockear el storage en unit tests del service.
- Cada test cubre un comportamiento, no varios.

## Objetivo

Generar los tests mínimos que cubran camino feliz, casos borde y error.

## Formato de salida

1. Lista de comportamientos a testear (antes del código).
2. Código de los tests.
3. Resultado de npm test.
```

2. Abre una nueva sesión y escribe:

```
add-tests para la función createNote de src/services/notes.ts
```

**Qué observar:**

- Claude carga el `SKILL.md` antes de responder.
- Lista comportamientos antes de escribir código (como dice la skill).
- Sigue las convenciones del repo sin que las repitas en el prompt.
- El formato es exactamente el que especificaste.

## 3. Diferencia entre skill automática e invocación explícita mediante `/skill-name`

| Modo | Cómo funciona | Cuándo usarlo |
|---|---|---|
| **Automático** | `description:` actúa como trigger — Claude la activa si el mensaje encaja | Skills que siempre son la respuesta correcta a un tipo de petición |
| **Explícito** | El usuario escribe `/nombre-skill` | Skills que se activan solo cuando se decide conscientemente |

Una skill sin `description:` solo responde a `/nombre-skill`. Con ella, Claude decide cuándo aplicarla.

> Regla: **si la skill siempre es la respuesta correcta a ese patrón de petición, pon `description:`. Si no, actívala tú.**

### 🧪 Demo 2 — Auto-trigger vs invocación explícita

- **Objetivo:** contrastar los dos modos de activación con la misma skill.
- **Setup:** skill `add-tests` de la Demo 1.

**Pasos:**

1. Con `description:` presente, escribe en el chat: `"quiero cubrir createNote con tests"` — sin `/add-tests`.
2. Observa que Claude activa la skill automáticamente.
3. Borra la línea `description:` del `SKILL.md`. Reinicia la sesión.
4. Repite el mismo mensaje — Claude responde sin usar la skill.
5. Escribe explícitamente `/add-tests` — la skill se activa.

**Qué observar:**

- El auto-trigger convierte la skill en parte invisible del flujo.
- Sin `description:`, es un comando consciente, no un comportamiento implícito.
- La diferencia no está en el resultado sino en quién decide cuándo aplicarla.

## 4. Diseño de skills para code review, testing, docs o despliegue

Los cuatro patrones de mayor retorno en equipos de ingeniería:

| Tipo de skill | Qué resuelve | Trigger típico |
|---|---|---|
| **Code review** | Revisión según las convenciones del proyecto, no criterios genéricos | `/review-pr` |
| **Testing** | Tests con el framework y convenciones del repo | Auto: "tests para" |
| **Docs** | Documentación en el formato interno del equipo | `/doc-module` |
| **Despliegue** | Checklist de release con los checks obligatorios | `/pre-deploy` |

El principio: **lo genérico lo sabe hacer Claude; lo específico de tu proyecto vive en la skill**.

### 🧪 Demo 3 — Skill de code review con criterios del proyecto

- **Objetivo:** diseñar una skill de revisión que aplique las convenciones específicas del repo.
- **Setup:** misma rama `tema-09/inicio`.

**Pasos:**

1. Crea `.claude/skills/review-pr/SKILL.md`:

```
---
name: review-pr
description: Revisa los cambios actuales cuando el usuario pide "revisa el PR" o "haz review"
---

# Skill: review-pr

Revisa el diff actual contra las convenciones del repositorio Notebox.

## Criterios de revisión

1. Capas: la lógica de negocio está en services/, no en routes/.
2. Errores semánticos: no se lanza Error genérico — se usan clases del dominio.
3. Tests: cualquier cambio en un service tiene tests asociados.
4. Tipado: no hay `any` sin justificación.
5. Scope: el cambio está acotado, sin refactors no solicitados.

## Formato de salida

Tabla: archivo → observación → severidad (🔴 bloquea / 🟡 mejora / 🟢 ok).
Conclusión: ¿listo para merge o necesita cambios?
```

2. Introduce deliberadamente lógica de negocio en `src/routes/notes.ts`.
3. Lanza `/review-pr`.

**Qué observar:**

- Claude detecta la violación de capas y la marca 🔴.
- El formato es exactamente la tabla definida en la skill.
- Sin la skill, una revisión genérica no detectaría esta convención específica.

## 5. Reutilización de skills por proyecto, por usuario o por organización

| Ámbito | Ubicación | Quién la usa |
|---|---|---|
| **Proyecto** | `<repo>/.claude/skills/` | Todos en el repo (versionada en git) |
| **Usuario** | `~/.claude/skills/` | Tú en todos tus repos |
| **Organización** | Managed settings | Todo el equipo, sin opción de desactivar |

Una skill en el repo es parte del contrato del proyecto, como el `CLAUDE.md` o el linter. Una skill personal es una preferencia tuya que no debe imponerse al equipo.

## 6. Migración conceptual desde comandos personalizados a skills unificadas

Si tienes scripts de bash personalizados o prompts guardados en notas:

1. **Identifica el contexto implícito**: qué asume el script del repo.
2. **Escribe ese contexto** en `SKILL.md` como sección fija.
3. **Define el objetivo** en una frase.
4. **Elimina el script**: la skill lo reemplaza con más contexto y sin dependencias de shell.

## 7. Estrategias de nombrado, documentación y mantenimiento de skills

- **Nombres en kebab-case, verbales**: `add-tests`, `review-pr`, `doc-module`. No: `testing`, `reviews`, `utils`.
- **Una skill, un objetivo**. Si hace A y B, son dos skills.
- **Documenta el por qué**, no solo el qué: el "por qué existe" es lo que se pierde cuando alguien la edita meses después.
- **Revisión periódica**: una skill que nadie usa en 30 días tiene un problema de diseño o de naming.

## 8. Versionado de skills compartidas sin romper hábitos del equipo

Las skills en el repo siguen el mismo ciclo que el código:

- Los cambios se revisan en PR como cualquier cambio de código.
- Si cambias el comportamiento de una skill existente, actualiza su documentación y avisa al equipo.
- Para cambios disruptivos, crea `review-pr-v2/` en paralelo antes de reemplazar la original.

## 9. Ejemplos de skills corporativas de alto valor recurrente

| Skill | Qué hace |
|---|---|
| `pre-deploy` | Checklist de tests, seguridad y configuración antes de desplegar |
| `add-migration` | Genera migraciones con las convenciones del ORM del equipo |
| `doc-adr` | Documenta una decisión arquitectónica en formato ADR |
| `review-security` | Revisa cambios de autenticación/autorización con criterios OWASP |
| `onboarding-check` | Lista los pasos para que un repo sea adoptable por el equipo |

## 10. Gobierno de skills para evitar dispersión y duplicidad.

- **Registro centralizado**: `README.md` en `.claude/skills/` con tabla de todas las skills activas.
- **Responsable por skill**: cada skill tiene un dueño que responde de su mantenimiento.
- **Auditoría trimestral**: qué skills se usan, cuáles están obsoletas, cuáles deben subirse a managed.
- **Criterio de entrada**: una skill se crea cuando el mismo prompt se repite más de tres veces en el equipo.

> Ver [Tema 26](tema-26-equipo-gobierno.md) para políticas de gobierno de skills a escala de organización.

***

## Resumen

- Una skill es un `SKILL.md` que encapsula contexto, objetivo y formato para una tarea repetida.
- Auto-trigger con `description:`; invocación explícita con `/nombre-skill`.
- El valor está en el contexto específico del proyecto, no en las instrucciones genéricas.
- Una skill por objetivo, en kebab-case, versionada como el código.
- Gobernadas con registro, responsable y auditoría periódica.
