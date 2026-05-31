# Soluciones — Tema 19

## Ejercicio 1 — Revisar con un subagente plantado

### Solución de referencia

El subagente `code-reviewer` ya está en `.claude/agents/code-reviewer.md` de `tema-19/ejercicio-01`. El alumno debe invocarlo explícitamente:

```
Usa el subagente code-reviewer sobre src/services/notes.ts.
Devuélveme el informe en su formato habitual.
```

**Hallazgos esperados del subagente** (mínimos):

| Categoría | Hallazgo | Severidad | Propuesta |
|---|---|---|---|
| Readability | `archive()` tiene 4 niveles de if/else anidados | Alta | Early return: `if (!note) return null; if (note.archived) return note; ...` |
| Readability | `unarchive()` duplica la estructura de `archive()` (DRY) | Media | Extraer helper `setArchived(id, value)` reutilizable |
| Correctness | La validación `note.title.length > 0` se aplica **después** de comprobar `archived`. Si una nota archivada tiene title vacío, `archive` la devuelve sin más. Inconsistencia silenciosa. | Media | Mover validación al inicio o eliminarla si no aporta |
| Scope | El reviewer no opina sobre `routes/` ni `storage/` — su scope es `services/` (respetar el rol) | — | — |

**Comparación con review "a pelo":**

El subagente:
- **Siempre** señala la duplicación entre `archive` y `unarchive` (un humano la nota tarde si la nota).
- **Siempre** clasifica por severidad (un humano improvisa).
- **No edita**: solo Read/Grep/Glob — esto se observa en que no propone diffs, propone descripciones.

### Criterio de éxito

- [ ] El alumno invocó el subagente **explícitamente** (no "revísame esto").
- [ ] El output respeta el formato definido en la skill del subagente.
- [ ] El subagente NO ha editado nada (tools restringidas).
- [ ] El alumno anota al menos 1 hallazgo del subagente que se le habría escapado a pelo.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Pedirle "revísame esto" sin invocar el subagente | El agente principal responde a pelo. Reformular invocando `code-reviewer` por nombre. |
| Esperar que el subagente edite el código | El reviewer no edita por diseño. El alumno aplica el fix después con el agente principal o a mano. |
| Saltarse el formato fijo del output | "No me importa el formato, solo dime lo que falla". Eso anula el valor: la consistencia entre invocaciones es la feature. |

---

## Ejercicio 2 — Diseñar un subagente con tools acotadas

### Solución de referencia

Archivo final: `.claude/agents/test-coverage-auditor.md`.

```markdown
---
name: test-coverage-auditor
description: Auditor de cobertura de tests del módulo Notebox. Detecta caminos no cubiertos, tests tautológicos y tests frágiles. Puede escribir tests nuevos en test/, pero NO toca src/.
tools: Read, Grep, Glob, Edit, Write, Bash(npm test:*)
---

# Test Coverage Auditor

## Cuándo activarme

- Antes de mergear un PR que toca `src/services/` o `src/routes/`.
- Cuando se añade una función pública nueva sin test asociado.
- Para auditar la suite y detectar tests frágiles, tautológicos o redundantes.

## Reglas duras

- **NO edito código en `src/`.** Si el alumno o el agente principal me pide tocar `src/`, devuelvo la petición al agente principal.
- **Solo escribo en `test/`.** Mis ediciones se limitan a esa carpeta.
- **Solo ejecuto `npm test`.** No ejecuto otros comandos ni `git`.

## Formato de salida

1. **Cobertura por función:** tabla con función, líneas cubiertas (estimación a partir del código de tests), caminos no felices probados.
2. **Tests problemáticos detectados:** lista con tipo (frágil / tautológico / redundante) y por qué.
3. **Tests propuestos:** lista de tests nuevos que rellenarían huecos, con esqueletos en `test/`.

## Restricciones para el agente principal

Si invocas este subagente y necesitas también arreglar el código de `src/`, hazlo en una llamada separada al agente principal. Yo no lo haré.
```

**Invocación de validación:**

```
Usa el subagente test-coverage-auditor sobre src/services/notes.ts.
```

El subagente debe identificar al menos:

- `archive()` no se prueba con id inexistente.
- `archive()` no se prueba con nota ya archivada (retorna la nota sin cambios — comportamiento poco intuitivo, hay que cubrirlo).
- `unarchive()` no tiene ni un solo test propio.
- El test `storage.test.ts` no cubre el caso de `update` con un id que no existe.

**Verificación de la restricción:**

Pídele:

```
Ya que estás, refactoriza archive() en src/services/notes.ts
para eliminar los if/else anidados.
```

Respuesta esperada: el subagente rechaza la petición y propone que se le pida al agente principal.

### Criterio de éxito

- [ ] `.claude/agents/test-coverage-auditor.md` existe en el repo.
- [ ] El frontmatter lista las tools de forma **explícita** (sin comodines).
- [ ] El subagente, al ser invocado, escribe tests en `test/` (no en `src/`).
- [ ] Al pedirle tocar `src/`, **rebota** la petición.
- [ ] `npm test` sigue verde tras la invocación.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Frontmatter sin lista explícita de tools (o con `*`) | El subagente acaba con todas las tools. Pedir lista cerrada. |
| Permitir Bash sin restringir (`Bash` en vez de `Bash(npm test:*)`) | El subagente puede ejecutar cualquier comando. Restringir al comando concreto. |
| El subagente edita `src/` "porque se lo pidieron" | La lista de tools no incluía la restricción de path. Pedir `Edit(test/**)` y `Write(test/**)`. |
| Tests que solo cubren caminos felices | El subagente debe forzar a cubrir los no felices. Si no lo hace, ajustar su skill. |

---

## Ejercicio 3 — Diseñar un equipo de subagentes

### Solución de referencia

El cambio plantado en `tema-19/ejercicio-03` es un método `bulkArchive` añadido a `src/services/notes.ts` (sin tests, sin validación de input, con un `console.log` colado para debugging).

**Decisión esperada en `EQUIPO.md` (ejemplo de respuesta correcta):**

```markdown
# Decisión de equipo de subagentes para auditar bulkArchive

## Subagentes a invocar y orden

1. **code-reviewer** primero — porque detecta correctness/readability/scope y deja un baseline de hallazgos.
2. **security-auditor** después — porque la función recibe input externo (lista de ids), y el reviewer no mira validación de input.

NO invoco `test-coverage-auditor` en este caso, porque el cambio
todavía no está implementado correctamente. Una auditoría de
cobertura de un código que va a cambiar es desperdicio: lo dejo
para después del primer round de fixes.

## Artefactos

- `code-reviewer` → informe en su formato habitual (tabla de hallazgos).
- `security-auditor` → tabla de riesgos (id inyectado, lista sin tamaño máximo, falta de auth check si aplica).

## Cuándo decido no usar subagente

Si el cambio fuera trivial (renombrar un parámetro, añadir un campo
booleano con valor por defecto), me lo salto y reviso a mano.
Invocar dos subagentes para 3 minutos de cambio es sobreorquestación.

## Tabla consolidada

| Categoría | Hallazgo | Severidad | Subagente |
|---|---|---|---|
| Correctness | console.log colado en bulkArchive | Media | code-reviewer |
| Scope | bulkArchive itera con for + push (no .map) | Baja | code-reviewer |
| Security | No valida que `ids` sea array | Alta | security-auditor |
| Security | No limita el tamaño del array (DoS potencial) | Alta | security-auditor |
| Security | No comprueba permisos por nota | Media | security-auditor |
```

### Criterio de éxito

- [ ] `EQUIPO.md` existe en la rama del alumno.
- [ ] Justifica el orden de invocación con criterio (no "por orden alfabético").
- [ ] Identifica **al menos un caso** donde NO usar subagente y por qué.
- [ ] La tabla consolidada atribuye cada hallazgo al subagente que lo detectó.
- [ ] El alumno NO invoca los 3 subagentes "por si acaso" (sobreorquestación).

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Invocar `code-reviewer`, `security-auditor` y `test-coverage-auditor` los tres sin pensar | Sobreorquestación. El tercero no aporta sobre código que va a cambiar. |
| No justificar el orden | Si el orden es aleatorio, la consolidación pierde valor. Forzar criterio. |
| Olvidar el "cuándo NO" | Es la parte más importante del ejercicio. Sin esto, todo cambio acaba pasando por subagente. |
| `EQUIPO.md` sin tabla consolidada | El valor de orquestar es **producir el artefacto final**. Sin tabla, son dos informes sueltos. |
