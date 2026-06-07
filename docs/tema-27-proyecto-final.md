---
hidden: true
---

# Tema 27 — Proyecto final: flujo completo de ingeniería de software asistida con Claude Code sobre un repositorio real

> **Tipo:** proyecto final guiado (capstone)
> **Duración estimada:** sesión completa de proyecto

## Objetivo del tema

Recorrer un ciclo completo de ingeniería sobre un repositorio real —de diagnóstico a PR mergeada— encadenando todo lo aprendido en el curso: contexto, permisos, skills, MCP, nueva funcionalidad, refactor, seguridad, Git y CI/CD. No se aprende una técnica nueva: se **integra** todo en un único flujo defendible.

> Los temas 1–26 te dieron las piezas. El proyecto final es montar el motor con ellas y arrancarlo sobre código vivo.

***

## El proyecto en una imagen

Diez fases agrupadas en cuatro bloques. El proyecto real rara vez es lineal —vuelves atrás—, pero el orden por defecto es este:

```
BLOQUE A · Preparar el terreno      BLOQUE B · Construir
  1. Diagnóstico del repo             5. Nueva funcionalidad (tests + docs)
  2. CLAUDE.md, settings, políticas   6. Refactor de zona heredada
  3. Skills y subagentes
  4. MCP y plugins                   BLOQUE C · Asegurar y entregar
                                      7. Seguridad, dependencias, calidad
BLOQUE D · Consolidar                 8. Commits, rama, PR, merge
 10. Presentación y roadmap           9. CI/CD e incidencias
```

| Fase | Entregable de la fase | Se apoya en |
| ---- | --------------------- | ----------- |
| 1. Diagnóstico | Mapa del repo y zonas frágiles | [Tema 10](tema-10-exploracion-repos.md) |
| 2. CLAUDE.md y políticas | `CLAUDE.md` + `settings.json` del proyecto | [Tema 4](tema-04-configuracion.md) · [Tema 5](tema-05-permisos-sandboxing.md) · [Tema 7](tema-07-claude-md-memoria.md) |
| 3. Skills y subagentes | 1–2 automatismos del caso | [Tema 9](tema-09-skills.md) · [Tema 19](tema-19-subagentes.md) |
| 4. MCP y plugins | Integraciones justificadas | [Tema 20](tema-20-mcp.md) · [Tema 21](tema-21-plugins.md) |
| 5. Nueva funcionalidad | Feature con tests y docs | [Tema 8](tema-08-prompting.md) · [Tema 11](tema-11-nuevas-funcionalidades.md) · [Tema 13](tema-13-testing.md) · [Tema 14](tema-14-documentacion.md) |
| 6. Refactor | Zona heredada mejorada sin romper | [Tema 12](tema-12-refactorizacion.md) · [Tema 13](tema-13-testing.md) |
| 7. Seguridad y calidad | Revisión en tres pasadas | [Tema 15](tema-15-code-review.md) · [Tema 16](tema-16-seguridad.md) · [Tema 17](tema-17-dependencias-migraciones.md) |
| 8. Commits y PR | Rama con PR auditable | [Tema 18](tema-18-git.md) |
| 9. CI/CD | Pipeline en verde, incidencias resueltas | [Tema 24](tema-24-devops.md) |
| 10. Presentación | ADRs + roadmap de adopción | [Tema 25](tema-25-arquitectura.md) · [Tema 26](tema-26-equipo.md) |

***

## 1. Diagnóstico inicial del repositorio, stack y reglas técnicas del proyecto

Antes de cambiar nada, construye un mapa mental del proyecto: qué hace, qué stack usa, cómo está organizado y dónde están las zonas frágiles. Esta fase es de **lectura** — usa el modo plan para que Claude no edite.

- Identifica entry points, servicios principales y cómo se relacionan.
- Detecta las **convenciones internas** (naming, manejo de errores, estructura de tests).
- Localiza las zonas de más riesgo (deuda técnica, código sin tests).
- Aprende a arrancar el proyecto y a correr la suite.

**Entregable:** un mapa del repo (arquitectura + 3 zonas frágiles) contrastado con archivos reales, no inventado.

```
[CONTEXTO]
Tengo que trabajar sobre este repositorio y no lo conozco a fondo.

[OBJETIVO]
Explóralo y dame, sin tocar nada:
1. Qué hace el proyecto y qué stack usa (5 líneas).
2. Entry points, servicios principales y cómo se relacionan.
3. Convenciones internas (naming, errores, tests).
4. Las 3 zonas que más cuidado requieren.
5. Cómo se arranca y cómo se ejecutan los tests.

[FORMATO]
Cita rutas reales. Si algo es ambiguo, márcalo como suposición.
```

> Empezar a cambiar código sin diagnóstico es la causa nº1 de tocar la capa equivocada. El mapa es barato; el cambio en el sitio incorrecto, no.

## 2. Definición de `CLAUDE.md`, settings y políticas mínimas del equipo

Convierte lo aprendido en la fase 1 en **contexto permanente**: las convenciones, el stack y las reglas quedan escritas para que Claude no las reinvente en cada prompt, y los permisos quedan acotados para que no haga daño.

| Qué fijas | Dónde vive |
| --- | --- |
| Descripción, stack, estructura, convenciones, comandos de arranque/test | `CLAUDE.md` |
| Comandos peligrosos que requieren confirmación; archivos sensibles vetados (`.env`) | `.claude/settings.json` (deny rules) |
| Qué reglas viajan en el repo vs. cuáles son personales | scope proyecto vs. usuario |

**Entregable:** un `CLAUDE.md` que refleja el proyecto real (no genérico) y un `settings.json` con los permisos acotados.

> Un `CLAUDE.md` copiado de otro proyecto contradice el código real y confunde más que ayudar. El contexto se gana en la fase 1, no se copia.

## 3. Creación de skills y configuración de subagentes útiles para el caso

Automatiza lo que vas a repetir durante el proyecto. La regla de entrada es la **repetición**: si una tarea aparece 3+ veces, merece una skill o un subagente; si es de un solo uso, no.

- **Skill** (`SKILL.md`): para flujos repetibles (generar el commit con tu formato, lanzar el checklist de PR).
- **Subagente**: para un rol especializado (revisor, tester, arquitecto) con herramientas acotadas.

**Entregable:** 1–2 automatismos con **un** propósito claro cada uno, no una colección "por si acaso".

> Crear skills especulativas genera dispersión: skills que nadie recuerda que existen. Automatiza lo que ya te dolió repetir, no lo que imaginas que repetirás.

## 4. Integración de MCP o plugins donde aporten valor real al flujo

Abre Claude a las herramientas reales del equipo (Jira, CI, base de datos, observabilidad) **solo donde aporta valor de verdad** — no por coleccionar conectores. Para cada integración candidata, responde en una línea: *¿qué tarea concreta del proyecto desbloquea?* Si no sabes responder, no la conectes.

- **MCP**: datos y herramientas externas ([Tema 20](tema-20-mcp.md)).
- **Plugin**: empaquetar commands + hooks + skills que viajen con el repo ([Tema 21](tema-21-plugins.md)).
- Revisa toda integración externa **como una dependencia**: léete el `plugin.json` y al menos un hook antes de activarla.

**Entregable:** las integraciones activas justificadas, con su superficie de riesgo evaluada.

> Conectar todo lo conectable infla la superficie de ataque y ralentiza las sesiones sin valor proporcional. Cada conector es una puerta: ábrela solo si entra algo por ella.

## 5. Desarrollo de una nueva funcionalidad con pruebas y documentación asociada

Implementa algo nuevo sin que Claude toque más de lo necesario y sin dejar atrás tests ni docs. La clave es el **plan de impacto antes del código**.

- Define el **objetivo en una frase** y, sobre todo, **qué NO entra** en esta versión.
- Identifica las **capas que toca** (modelo → servicio → ruta → UI): eso fija el alcance.
- Implementa **por capas**, una a una, validando cada paso.
- Si la feature es de UI, aprovecha que Claude Code es **multimodal**: pásale una captura del estado actual y del objetivo.

**Entregable:** la feature implementada, con tests que cubren la lógica nueva (no coverage vacío), documentación actualizada y un diff revisable.

```
[OBJETIVO]
Quiero añadir <funcionalidad>. Antes de escribir código:
1. Lista los archivos y capas que afecta.
2. Los tests que habrá que crear.
3. Los 3 mayores riesgos.
Reutiliza las convenciones y componentes existentes. No escribas código todavía.
```

> Pedir "implementa la feature completa" en un prompt hace que toque 12 archivos cuando bastaban 4 y mete decisiones de diseño que deberían ser tuyas. El plan primero; el código, por capas.

## 6. Refactorización de una zona heredada con validación de impacto

Mejora la forma de una zona frágil **sin cambiar su comportamiento**. El riesgo es romper algo que funcionaba, así que el primer paso casi nunca es el refactor.

1. **Red de seguridad primero:** ¿hay tests? Si no, ese es el paso 0 — captura el comportamiento actual con tests antes de tocar nada.
2. **Plan en pasos pequeños**, cada uno verificable con esos tests.
3. **Acota el alcance**: señala los archivos exactos (`@ruta`); un refactor sin límites se expande solo.

**Entregable:** la zona mejorada con los tests previos pasando idénticos, un diff legible y sin lógica nueva colada disfrazada de refactor.

> Refactorizar sin tests es cambiar a ciegas. Y mezclar refactor con feature nueva en el mismo commit hace el review imposible: una cosa cada vez.

## 7. Revisión de seguridad, dependencias y calidad del cambio completo

Antes de pedir el merge, revisa el cambio completo desde tres ángulos. Claude apoya; **la decisión final es tuya**. Pide revisiones **específicas**, no un "¿está bien?".

| Pasada | Qué busca |
| --- | --- |
| **Seguridad** | Validación y saneamiento de entradas, secretos expuestos, authz, OWASP top |
| **Dependencias** | Librerías nuevas, mantenimiento dudoso, superficie de ataque añadida |
| **Calidad** | Complejidad, mantenibilidad, manejo de errores, deuda añadida |

**Entregable:** un informe con cada hallazgo (severidad, `archivo:línea`, propuesta), distinguiendo lo bloqueante de lo opcional, y los bloqueantes resueltos.

> Un "todo correcto" genérico produce falsas certezas. La IA en revisión rinde cuando le das una pregunta concreta y un foco, no un visto bueno global.

## 8. Preparación de commits, rama, PR y criterios de merge

Deja el trabajo en una rama con commits limpios y un PR que un reviewer entienda en dos minutos. El germen de todo es una línea: **qué cuenta este PR a quien lo revise** — el problema que resuelve y la decisión principal de diseño.

- Commits que **cuentan una historia**, no "wip" sueltos.
- Descripción de PR con: qué resuelve, qué decisiones tomaste, qué probar, qué riesgos quedan.
- Atribución de commits según la política del equipo.
- Criterios de merge explícitos (tests verdes, review aprobada).

**Entregable:** una rama con PR auditable, pensada para un reviewer que no tiene tu contexto.

> Dejar que la IA genere commits sin juicio produce un historial ruidoso que no ayuda a nadie. El PR explica el *por qué*, no solo el *qué*.

## 9. Ejecución de checks de CI/CD y revisión de incidencias encontradas

Haz que el pipeline pase y, si falla, entiende por qué y arréglalo con criterio — **sin delegar decisiones críticas de despliegue a la IA**. Ten claro qué checks son bloqueantes para el merge (build, test, lint, scan).

- Ante un fallo, pásale a Claude el **log del job** y pide **causa raíz**, no solo la línea que rompe.
- Distingue si el fallo es del código, del test o de la configuración del pipeline.
- Arregla la causa, no el síntoma.

**Entregable:** todos los checks bloqueantes en verde, con las incidencias resueltas en su origen.

> Forzar el verde silenciando un test o el scan no arregla nada: solo mueve el problema a producción.

## 10. Presentación final del flujo de trabajo resultante, decisiones tomadas y roadmap de adopción en equipo

Cierra el ciclo: cuenta qué hiciste, qué decisiones tomaste y por qué, y cómo el equipo adopta este flujo de forma sostenible. Es lo que separa "usé Claude una vez" de "el equipo trabaja así".

- Sintetiza las **decisiones técnicas que importaron** en formato **ADR** (contexto, decisión, consecuencias).
- Propón un **roadmap de adopción**: qué del flujo (`CLAUDE.md`, skills, hooks, políticas) merece estandarizarse y en qué orden.
- Registra **qué funcionó y qué no** con Claude en este proyecto.

**Entregable:** ADRs de las decisiones clave + un roadmap de adopción concreto, de forma que el conocimiento no dependa de una sola persona.

> Terminar en el merge y no consolidar hace que el siguiente proyecto empiece de cero. Lo que no se registra, se pierde con la rotación del equipo.

***

## Anexo — Buenas prácticas para diferentes situaciones

> **Esto es una guía genérica.** No es *el* método correcto: es un esqueleto probado que adaptas a tu forma de trabajar, a tu equipo y a tus herramientas. Donde aquí pone "Obsidian", lee "Confluence, Notion, Jira, un `.md` en el repo o un papel".

El proyecto final es un ciclo completo. Pero el día a día está lleno de **situaciones puntuales** que no son un proyecto entero. Este anexo es la chuleta de bolsillo: la abres cuando te sientas a resolver un caso concreto.

### La regla que atraviesa todas las situaciones: documentar primero

El error más caro no es un mal prompt: es **lanzar Claude sin haber decidido tú qué quieres**. Antes del primer prompt, escribe una nota corta. Cuando documentas antes:

- Te obligas a pensar el *qué* y el *por qué* antes que el *cómo*. Las decisiones de diseño las tomas tú, no el modelo.
- Conviertes esa nota en **contexto reutilizable**: la pegas en el prompt, la guardas como `CLAUDE.md`, la referencias con `@archivo`.
- Tienes con qué **verificar** al final: ¿hace el código lo que la nota decía?

| Vía para dar el contexto a Claude | Cuándo usarla |
| --- | --- |
| **Pegar en el prompt** | Nota corta y de un solo uso (un plan, un brief). |
| **`@ruta/archivo.md`** | El doc vive en el repo y quieres que Claude lo lea entero. |
| **`CLAUDE.md`** | Contexto permanente del proyecto (convenciones, stack, decisiones). |
| **Skill** | El flujo se repite igual cada vez → lo encapsulas. |

> La herramienta da igual. El hábito es el que importa: **una nota antes de cada tarea no trivial.**

### La plantilla común por situación

Cada situación sigue **siempre** el mismo esqueleto. Memoriza el esqueleto, no las situaciones:

```
① Cuándo aplica          → reconoces que estás en este caso
② Qué documentas          → qué capturas y dónde (genérico, adáptalo)
③ Prompt clave            → el prompt que dispara la tarea
④ Cómo sabes que acabaste → el criterio de cierre
```

### Situaciones de proyecto (desarrolladas en las fases de arriba)

Las cuatro situaciones "de arco largo" que más se preguntan tienen su receta completa en las fases del proyecto:

| Situación | Dónde está el detalle |
| --- | --- |
| **Proyecto nuevo** | Fases 1–2 (diagnóstico → `CLAUDE.md` desde el día 1) + Fase 5 |
| **Documentación** | Fase 1 (explorar) + Fase 5 (documentar la feature) |
| **Refactorizar** | Fase 6 (red de tests → plan → pasos pequeños) |
| **Rediseño UI/UX** | Fase 5 (captura multimodal + sistema de diseño existente) |

### Situaciones de calidad y evolución (fichas exprés)

**Escribir tests / subir cobertura**
- *Cuándo:* tienes lógica sin cubrir, o quieres blindar un bug recién arreglado para que no vuelva.
- *Qué documentas:* qué comportamiento **crítico** debe quedar cubierto — no "subir el % de coverage".
- *Prompt clave:*
  ```
  Identifica la lógica crítica y los casos borde de @ruta (incluye inputs
  inválidos y rutas de error). Propón los tests, agrúpalos por escenario y
  explícame qué prueba cada uno. No busques coverage vacío.
  ```

**Revisar un PR (propio o ajeno)**
- *Cuándo:* te toca aprobar un cambio, o quieres auto-revisarte antes de pedir review.
- *Qué documentas:* qué te preocupa de este cambio (el área de riesgo que más miras).
- *Prompt clave:*
  ```
  Revisa este diff en tres pasadas separadas: 1) bugs y casos no contemplados,
  2) deuda y mantenibilidad, 3) seguridad. Para cada hallazgo: severidad,
  archivo:línea y propuesta concreta. Distingue bloqueante de opcional.
  ```

**Actualizar dependencias / migrar versión**
- *Cuándo:* bump con breaking changes (p. ej. React 18→19, un framework, una librería core).
- *Qué documentas:* versión origen/destino y qué partes del código usan la API que cambia.
- *Prompt clave:*
  ```
  Voy a migrar <dep> de <vX> a <vY>. Lee el changelog de breaking changes y:
  1. Localiza en el repo el código afectado.
  2. Dame un plan por fases (lotes pequeños) con su test de regresión cada uno.
  No migres nada todavía: primero el plan y los riesgos.
  ```

**Resolver conflictos de merge**
- *Cuándo:* un merge o rebase con conflictos que no son triviales.
- *Qué documentas:* qué hacía **cada rama** en la zona en conflicto (la intención de ambos lados).
- *Prompt clave:*
  ```
  Tengo este conflicto de merge en @archivo. Lado A hacía <intención A>, lado B
  hacía <intención B>. Resuélvelo preservando AMBAS intenciones con criterio
  semántico; si son incompatibles, dímelo en vez de elegir uno a ciegas.
  ```

> El catálogo crece con tu experiencia: cada vez que repitas una situación 3 veces, escríbele su ficha — o conviértela en una skill ([Tema 9](tema-09-skills.md)).

***

## Resumen

- El proyecto final **integra** todo el curso en un flujo de 10 fases sobre un repositorio real: del diagnóstico a la PR mergeada y al roadmap de adopción.
- Cuatro bloques: **preparar el terreno** (1–4), **construir** (5–6), **asegurar y entregar** (7–9) y **consolidar** (10).
- Cada fase tiene un **entregable** concreto; el alumno decide, Claude ejecuta.
- La regla que atraviesa todo: **documentar antes de lanzar el prompt** — la nota define el resultado.
- El anexo de buenas prácticas es la chuleta de bolsillo para las **situaciones puntuales** del día a día que no son un proyecto entero.
