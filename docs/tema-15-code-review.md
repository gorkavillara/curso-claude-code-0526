---
hidden: true
---

# Tema 15 — Revisión de código, pull requests y análisis de cambios con foco en calidad, mantenibilidad y riesgo

> **Duración estimada:** ~60 min
> **Tipo:** práctico — alumnos delante del teclado

## Objetivo del tema

Usar Claude Code como co-piloto de revisión: leer diffs con criterio del proyecto, priorizar lo que importa y escribir comentarios accionables. La revisión sigue siendo humana; Claude reduce el coste de leer lo grande sin atajar el juicio.

***

## 1. Lectura crítica de diffs y detección temprana de cambios peligrosos

El primer barrido de un PR no es leer línea a línea. Es contestar:

| Pregunta | Cómo se contesta |
|---|---|
| ¿Qué archivos toca? | `git diff --stat main...HEAD` |
| ¿Hay cambios fuera del scope anunciado? | Comparar con la descripción del PR |
| ¿Aparecen archivos sensibles? (`migrations/`, `auth/`, `payments/`) | Grep en la lista de archivos |
| ¿Hay borrados grandes no justificados? | `git diff --stat | sort -k 3 -n` |
| ¿Hay binarios o lockfiles nuevos? | Listar archivos no de código |

> Si el diff toca algo que no esperabas según la descripción, **antes de leer línea a línea, pregunta por qué**.

### 🧪 Demo 1 — Resumen y priorización del PR

- **Objetivo:** Claude propone los 3 puntos más riesgosos del PR para mirar primero.
- **Setup:** `git checkout tema-15/inicio`, PR no trivial cargado en una rama local (la rama tiene cambios documentados).

**Prompt literal:**

```
Compara la rama actual con main. Resume los cambios en 5 puntos máximo.
Marca los 3 más arriesgados con justificación basada en código (no en intuición).
Cita rutas y líneas para cada riesgo.
```

**Qué observar:**

- Claude lee el diff entero antes de resumir.
- "Arriesgado" se justifica con criterios verificables: cambio de contrato, falta de tests, capa crítica, etc.
- Las rutas y líneas citadas existen.

### 🧩 Ejercicio 1 — Revisar un diff con criterio del proyecto

> **Rama:** `git checkout tema-15/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Sobre un PR plantado en el repo, lanza el prompt de revisión y entrega: 5 puntos del PR, 3 marcados como arriesgados con archivo+línea y motivo. Verifica al menos 2 riesgos abriendo el archivo a mano.

## 2. Evaluación de consistencia con patrones y normas del repositorio

Las normas no obvias del repo (las que viven en `CLAUDE.md`, `.claude/rules/` o solo en el código):

- Validación en service, no en ruta.
- Errores semánticos de dominio, no `Error` genérico.
- Tests con `node --test`.
- No mockear el storage en unit tests del service.

Pregunta a Claude:

```
¿El cambio respeta las normas declaradas en CLAUDE.md y .claude/rules/?
Para cada infracción: archivo, línea, regla violada, propuesta de fix.
```

> Una revisión sin las normas del repo es opinión personal. Con las normas, es trabajo verificable.

## 3. Identificación de deuda añadida en una pull request aparentemente correcta

Un PR puede pasar tests, cumplir todas las reglas y aún así dejar el repo peor. Señales:

- Duplica un patrón ya existente en otro sitio (sin justificación).
- Introduce una abstracción de un solo uso ("por si acaso").
- Borra un test "porque ya no aplica" sin explicar por qué.
- Añade un parámetro opcional para evitar un breaking change que debía hacerse.

> Pregunta al PR: ¿el código del repo está mejor o peor después de mergear esto?

## 4. Revisión de claridad, complejidad y mantenibilidad del cambio propuesto

Métricas baratas que Claude puede calcular:

| Métrica | Umbral típico |
|---|---|
| Líneas cambiadas por archivo | > 200 → pedir split |
| Profundidad de anidación | ≥ 4 → simplificar |
| Funciones nuevas sin test | > 0 → bloquear |
| Imports nuevos a librerías externas | > 0 → justificar en descripción |

Pero la métrica más cara es la legibilidad. Lee 3 funciones del PR sin contexto. Si no entiendes qué hacen por el nombre, no las puedes revisar.

## 5. Señalado de errores de validación, gestión de estados o manejo de excepciones

Checklist rápido al pasar por cada función nueva o modificada:

- ¿Valida sus inputs? ¿Dónde?
- ¿Qué pasa si una llamada async falla? ¿Se captura el error?
- ¿El estado mutable está acotado? ¿Hay race conditions?
- ¿Los errores que lanza se mapean a respuestas HTTP correctas?

> El 80% de los bugs reales que llegan a producción están en uno de estos cuatro sitios. Mira aquí primero.

## 6. Construcción de comentarios de revisión claros y accionables

Un buen comentario tiene tres partes:

```markdown
[ubicación: archivo:línea]
Observación: <qué ves>
Por qué importa: <consecuencia concreta, no opinión>
Sugerencia: <acción específica, no "deberías considerar...">
```

Ejemplo malo: *"esto no me gusta, no es muy limpio"*.
Ejemplo bueno: *"`services/notes.ts:42` — `archive` muta el array original. Si dos requests llegan simultáneas, el segundo verá estado inconsistente. Sugerencia: clonar la nota antes de mutar, como hace `update` en la línea 28."*

### 🧪 Demo 2 — Generar comentarios accionables sobre un PR mal hecho

- **Objetivo:** convertir un diff problemático en 3-4 comentarios procesables.
- **Setup:** misma rama. PR con problemas conocidos: validación en ruta cuando debería ir en servicio, error genérico en vez de semántico, sin tests.

**Prompt literal:**

```
[CONTEXTO]
Diff actual contra main. El CLAUDE.md dice:
- Validación de negocio va en services/, no en routes/.
- Errores semánticos del dominio, no Error genérico.
- Cualquier cambio en services/ tiene tests asociados.

[OBJETIVO]
Genera 3 comentarios de revisión. Por cada uno:
- Ubicación (archivo:línea).
- Observación (qué ves).
- Por qué importa (cita la regla del CLAUDE.md o consecuencia técnica).
- Sugerencia accionable.

[FORMATO]
Bloques markdown citables directamente en GitHub/GitLab.
```

**Qué observar:**

- Cada comentario es accionable: alguien puede aplicar la sugerencia tal cual.
- La justificación cita la regla violada, no opinión.
- Tres comentarios pequeños valen más que uno gigante.

### 🧩 Ejercicio 2 — Comentarios accionables sobre cambios reales

> **Rama:** `git checkout tema-15/ejercicio-02` · **Tiempo:** 15 min · **Tipo:** En clase

Sobre un diff problemático, genera 3-4 comentarios siguiendo el patrón ubicación / observación / por qué importa / sugerencia. Verifica que cada sugerencia es aplicable sin pedir aclaraciones adicionales.

## 7. Uso de Claude Code para preparar PRs mejor justificadas

Antes de pedir review:

```
[OBJETIVO]
Genera la descripción del PR para el cambio actual contra main.
Estructura:
1. Qué cambia (3-5 bullets).
2. Por qué (motivo concreto, no genérico).
3. Cómo lo verifico (tests, scenarios).
4. Qué queda fuera del scope (lo que no toca este PR, deliberadamente).
5. Riesgos conocidos.
```

> El bloque "qué queda fuera del scope" es el que evita los comentarios del tipo "¿y por qué no aprovechaste para arreglar X?".

## 8. Generación de resúmenes de cambio útiles para reviewers y managers técnicos

Audiencias distintas, resúmenes distintos:

| Audiencia | Qué quiere ver |
|---|---|
| Reviewer técnico | Archivos tocados, riesgos, tests añadidos |
| Manager técnico | Qué resuelve, qué desbloquea, qué deja pendiente |
| QA | Casos a verificar manualmente, regresiones potenciales |

Claude puede generar las tres versiones desde el mismo diff con prompts distintos.

## 9. Integración de revisión asistida en procesos colaborativos de Git

Donde encaja Claude en el flujo de PR:

| Fase | Quién | Qué hace |
|---|---|---|
| Antes de pedir review | Autor | Pide a Claude resumen + descripción de PR |
| Revisión inicial | Reviewer humano | Lee resumen, marca 2-3 zonas a mirar |
| Lectura asistida | Reviewer + Claude | Pide explicaciones puntuales sobre las zonas marcadas |
| Comentarios | Reviewer | Decide qué pedir (Claude propone, humano firma) |
| Iteración | Autor | Aplica cambios, vuelve a pedir resumen al cierre |

### 🧪 Demo 3 — Descripción de PR para el cambio del Ejercicio 2

- **Objetivo:** producir la descripción de PR que acompañaría al cambio que se está revisando.
- **Setup:** misma rama.

**Prompt literal:**

```
Genera la descripción del PR para los cambios de la rama actual contra main.
Estructura:
1. Qué cambia (bullets, archivos concretos).
2. Por qué ahora (motivo verificable).
3. Cómo verificar (comandos exactos).
4. Fuera del scope (lo que deliberadamente no se toca).
5. Riesgos conocidos.
Máximo 200 palabras.
```

**Qué observar:**

- La descripción es revisable en menos de 2 minutos.
- "Fuera del scope" preempta comentarios redundantes.
- Los comandos de verificación son ejecutables.

### 🧩 Ejercicio 3 — Preparar descripción del PR propio

> **Rama:** `git checkout tema-15/ejercicio-03` · **Tiempo:** 15 min · **Tipo:** En clase

Genera la descripción del PR que acompañe a un cambio plantado en el repo. La descripción debe ser revisable en 2 minutos e incluir el bloque "fuera del scope" con al menos 2 entradas.

## 10. Límites de la IA en revisión y momentos donde conviene revisión humana profunda

Claude **no** puede juzgar:

- Si una decisión de arquitectura encaja con la dirección del producto.
- Si el cambio respeta acuerdos verbales del equipo no escritos.
- Si el código rompe contratos implícitos con otros equipos.
- Si la persona que envió el PR está estresada/sobrecargada — y el feedback debe adaptarse a eso.

> Lo que Claude propone es texto. Lo que tú firmas son decisiones. La distinción no se delega.

***

## Resumen

- Primer barrido del PR: archivos tocados, scope, sensibilidades. Después leer línea a línea.
- Comentarios accionables: ubicación, observación, por qué, sugerencia. Nada de "no me gusta".
- Las normas del repo (CLAUDE.md, rules) son tu apalancamiento — sin ellas la revisión es opinión.
- Descripción del PR con "fuera del scope" preempta el 50% de comentarios redundantes.
- Claude lee rápido lo grande. Tú firmas las decisiones.
