---
hidden: true
---

# Tema 17 — Dependencias, paquetes y migraciones de librerías o frameworks con criterio técnico y plan de transición

> **Duración estimada:** ~60 min
> **Tipo:** práctico + demos guiadas

## Objetivo del tema

Gestionar dependencias con criterio: saber cuáles importan, planificar migraciones por fases con tests como red, y usar Claude para acelerar lo mecánico de los breaking changes sin perder el control.

***

## 1. Análisis del estado de dependencias y versiones desactualizadas

Tres preguntas iniciales para cualquier `package.json`:

| Pregunta | Cómo se contesta |
|---|---|
| ¿Qué tan desactualizadas están? | `npm outdated` |
| ¿Hay vulnerabilidades conocidas? | `npm audit` |
| ¿Hay dependencias sin uso real? | `depcheck` o `knip` |

> Una dependencia que no usas activamente es ruido. Una desactualizada es deuda. Una vulnerable es incidente esperando ocurrir.

### 🧪 Demo 1 — Diagnóstico del estado de dependencias

- **Objetivo:** producir un informe accionable del estado actual de dependencias.
- **Setup:** `git checkout tema-17/inicio`, `npm install`.

**Prompt literal:**

```
[CONTEXTO]
Analiza package.json y package-lock.json del repositorio. Información
relevante: `npm outdated` y `npm audit` se han ejecutado y su output
está disponible si lo pides.

[OBJETIVO]
Genera un informe de salud de dependencias:
1. Dependencias desactualizadas con salto > 1 major (alto riesgo de upgrade).
2. Dependencias con vulnerabilidades conocidas.
3. Dependencias probablemente sin uso en src/ (búsqueda con grep).
4. Dependencias que podrían sustituirse por stdlib (ej: utilidades pequeñas).

[FORMATO]
Tabla por categoría. Cada fila: nombre, evidencia, propuesta.
```

**Qué observar:**

- Claude correlaciona `npm outdated` con `package.json` y grep en `src/`.
- Las "probablemente sin uso" están justificadas con grep concreto.
- No propone upgrades en bloque: prioriza por severidad.

### 🧩 Ejercicio 1 — Diagnóstico de salud del repo

> **Rama:** `git checkout tema-17/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Genera el informe de salud de dependencias de Notebox. Entrega 4 tablas: desactualizadas, vulnerables, sin uso, sustituibles por stdlib. Verifica al menos 2 hallazgos a mano (grep o búsqueda directa).

## 2. Identificación de librerías de riesgo o mantenimiento dudoso

Señales de dependencia frágil:

- Último commit hace más de 18 meses.
- Mantenida por una sola persona.
- Issues abiertas masivas sin respuesta.
- Pocos contributors o ninguno reciente.
- Es la "única opción" — sin alternativas en su nicho.

> Una dependencia con mantenimiento dudoso es código que **vas a tener que mantener tú** cuando deje de actualizarse. Cuantifica ese coste antes de adoptarla.

## 3. Diseño de migraciones de framework en fases con pruebas de regresión

Migrar Express 4 → 5, React 17 → 18, Node 18 → 22 no es "actualizar la versión". Es un proyecto con fases:

```
Fase 0  — Suite de tests existente verde y útil
Fase 1  — Leer changelog y mapear breaking changes a tu código
Fase 2  — Actualizar dependencia en una rama de migración
Fase 3  — Aplicar cambios por área (rutas, services, storage)
Fase 4  — Tests verdes tras cada área
Fase 5  — Comparar comportamiento contra rama anterior (canary, shadow)
Fase 6  — Merge a main detrás de feature flag si aplica
```

> Si no tienes Fase 0 sólida, **no migres**. Primero estabiliza el suite, luego migra.

### 🧪 Demo 2 — Plan de migración por fases

- **Objetivo:** generar el plan para subir una dependencia con breaking changes.
- **Setup:** misma rama. Express 4 → 5 como ejemplo.

**Prompt literal:**

```
[CONTEXTO]
Notebox usa Express 4.x. Queremos migrar a Express 5.x. Los breaking
changes principales que conozco:
- Routing handlers ya no pueden ser strings/paths con regex no-soportada.
- `app.del()` removido (usar `app.delete()`).
- `res.send(status)` removido (usar `res.status(...)`).
- Cambios en async error handling (errors lanzados en async ya se capturan).

[OBJETIVO]
Genera el plan de migración por fases. Para cada fase:
- Qué cambia.
- Qué archivos afecta concretamente.
- Cómo verificar (comando exacto).
- Qué hacer si falla.

[FORMATO]
Lista numerada de fases. Cada fase con sus 4 subcampos.
```

**Qué observar:**

- Claude lee `src/routes/` y `src/server.ts` antes de proponer el plan.
- Cada fase termina con verificación: `npm test`, no "comprobar que funciona".
- Las fases son **pequeñas**: cada una mergea por separado si compensa.

### 🧩 Ejercicio 2 — Plan de migración de una dependencia

> **Rama:** `git checkout tema-17/ejercicio-02` · **Tiempo:** 20 min · **Tipo:** En clase

Diseña el plan de migración para una dependencia indicada en `EJERCICIO.md` (Express, una utilidad o el runtime de tests). Entrega el plan en fases con verificación concreta tras cada una y aplica la primera fase.

## 4. Refactorización por breaking changes de APIs y contratos internos

Cuando una dependencia cambia su API, tu código se rompe en sitios concretos. Patrón para resolver con Claude:

```
[CONTEXTO]
Express 5 deprecó res.send(status). Pega aquí el output de:
git grep -n "res.send(\d" src/

[OBJETIVO]
Genera un parche que reemplace todas las ocurrencias por
res.status(status).send(body). Si la línea no tiene body claro,
márcala para revisar manualmente.

[RESTRICCIONES]
- Solo tocas src/.
- Diff aplicable directamente.
```

> Cuando el cambio es mecánico, Claude lo aplica en 30 segundos. Cuando requiere criterio, lo marca para revisión manual.

## 5. Sustitución de dependencias críticas sin detener la operación

Patrón Strangler Fig adaptado a dependencias:

1. **Identifica la frontera** entre tu código y la dependencia (función adaptadora, repository, fachada).
2. **Implementa la nueva dependencia** detrás de la misma frontera.
3. **Conmuta con feature flag**: ENV variable que elige entre vieja y nueva.
4. **Mide en producción**: latencia, errores, output equivalente.
5. **Elimina la vieja** solo cuando la nueva esté estable.

> Sustituir una dependencia crítica de golpe es la receta del incidente. Hazlo gradual o no lo hagas.

## 6. Generación de scripts o guías de migración para el equipo

Si el upgrade afecta a 30 sitios similares, **escribe un codemod**. Claude puede generar uno simple:

```
[OBJETIVO]
Escribe un script Node que recorra src/ buscando el patrón
`res.send(NNN)` y lo reemplace por `res.status(NNN).send()`.
Que registre las ocurrencias modificadas.

[RESTRICCIONES]
- Usa solo stdlib (fs, path).
- Sin dependencias nuevas.
- Idempotente: ejecutarlo dos veces no debe romper nada.
```

Para migraciones grandes, los codemods de `jscodeshift` o herramientas oficiales del framework son mejores. Pídeselo a Claude si existen.

## 7. Evaluación de impacto en build, tests, pipelines y despliegue

Antes de mergear cualquier upgrade significativo:

- [ ] **Build:** ¿tiempo de build se mantiene? ¿tamaño del bundle cambia?
- [ ] **Tests:** ¿todos verdes? ¿alguno tarda anormalmente más?
- [ ] **Pipelines:** ¿el CI necesita actualizar imágenes Docker, Node version, etc.?
- [ ] **Despliegue:** ¿hay scripts de migración (DB, configuración) que correr?
- [ ] **Cliente:** ¿algún consumidor externo (frontend, móvil) necesita cambios coordinados?

Cruzaremos esto con CI/CD en el [Tema 24](tema-24-devops-cicd.md).

## 8. Estrategias para migraciones de frontend, backend y tooling

| Tipo | Patrón recomendado |
|---|---|
| **Backend framework** (Express, Spring, Django) | Por fases, feature flag, canary |
| **Frontend framework** (React, Vue) | Branch separada, comparación visual, A/B en producción |
| **Tooling** (linter, formatter, test runner) | Suele ser mecánico — codemod + commit grande limpio |
| **Runtime** (Node, JVM, Python) | Bumpear en CI primero, ejecutar suite, después local |

> El error clásico es tratar todas las migraciones igual. Tienen riesgos y patrones distintos.

## 9. Revisión de changelogs, patrones de compatibilidad y costes de cambio

Antes de subir una versión, **lee el changelog**. Sí, de verdad. Claude puede ayudar:

```
[OBJETIVO]
He decidido subir lodash de 4.17 a 5.0. Lee el changelog oficial
y dime qué cambios pueden afectarme dadas estas funciones que usamos:
- _.cloneDeep
- _.debounce
- _.merge

[FORMATO]
Por función: ¿cambia su contrato en 5.0? ¿hay un reemplazo recomendado?
```

> Cambialog escrito por humano + tu uso real = el coste real de la migración.

### 🧪 Demo 3 — Codemod para breaking change mecánico

- **Objetivo:** generar un script que aplique un cambio mecánico repetitivo de una migración.
- **Setup:** misma rama. Hay 5+ usos de un patrón obsoleto.

**Prompt literal:**

```
[CONTEXTO]
Hay que reemplazar todas las ocurrencias de `app.del(...)` por
`app.delete(...)` en src/. La firma y el comportamiento son idénticos.

[OBJETIVO]
Genera un script Node de un solo archivo que:
1. Recorra src/ recursivamente.
2. Reemplace `app.del(` por `app.delete(` solo cuando esté precedido por
   `app.` (no como substring de otra cosa).
3. Registre los archivos modificados.

[RESTRICCIONES]
- Solo stdlib.
- Idempotente: ejecutar dos veces no rompe.
```

**Qué observar:**

- El script usa AST si está disponible, o regex con contexto suficiente.
- Es idempotente — verificable lanzándolo dos veces.
- Registra los cambios para que sean revisables en el PR.

### 🧩 Ejercicio 3 — Script de migración

> **Rama:** `git checkout tema-17/ejercicio-03` · **Tiempo:** 15 min · **Tipo:** En clase

Genera un script que aplique un cambio mecánico repetitivo indicado en `EJERCICIO.md`. Verifica que es idempotente, lánzalo y revisa el diff antes de aceptar. La suite debe seguir verde tras la migración.

## 10. Uso de Claude Code para reducir fricción en evoluciones tecnológicas inevitables

Donde Claude aporta más en dependencias y migraciones:

- **Diagnóstico inicial** del estado del repo.
- **Plan por fases** con criterios de verificación.
- **Codemods simples** para cambios mecánicos.
- **Lectura de changelogs** correlacionada con tu uso real.

Lo que sigue siendo decisión humana:

- Cuándo migrar (priorización vs otras necesidades).
- Qué dependencias mantener vs eliminar.
- Aceptar riesgo residual de una versión que no se va a actualizar más.

***

## Resumen

- Una dependencia que no usas activamente es ruido. Una desactualizada es deuda. Una vulnerable es incidente esperando.
- No migres sin suite de tests sólida. Estabilizar primero.
- Migraciones grandes → fases pequeñas con verificación tras cada una.
- Cambios mecánicos → codemod. Decisiones → humano.
- Strangler Fig para dependencias críticas. Nunca sustitución de golpe.
