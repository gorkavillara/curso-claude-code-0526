# Tema 18 — Git, branching, hotfixes y conflictos

> **Duración estimada:** \~60 min **Tipo:** práctico — alumnos delante del teclado

## Objetivo del tema

Usar Claude como copiloto de Git con criterio: preparar hotfixes acotados, resolver conflictos con razonamiento semántico (no mecánico) y generar commits y PRs que sigan siendo legibles dentro de 6 meses.

***

## 1. Exploración de ramas y contexto antes de tocar un cambio urgente

Antes de tocar nada en una urgencia:

```bash
git log --oneline -20 main
git branch -a | grep -i fix
git diff main..origin/main
```

Pídeselo a Claude en lenguaje natural:

```
Resúmeme el estado actual del repo: en qué rama estoy, cuántos commits
me separan de main, qué archivos hay sin commitear, y si hay alguna
rama remota reciente que parezca related al bug que voy a tocar.
```

> Saber **dónde estás** antes de cualquier acción en Git. La urgencia no exime del diagnóstico.

### 🧪 Demo 1 — Preparar un hotfix acotado

* **Objetivo:** crear una rama de hotfix, aplicar un fix mínimo y dejar todo listo para PR.
* **Setup:** `git checkout main`. Bug reportado: `searchNotes("MAÑANA")` devuelve vacío con un title "Mañana".

**Prompt literal:**

```
[CONTEXTO]
Bug en producción: searchNotes(q) no encuentra resultados cuando el query
tiene mayúsculas o acentos diferentes al title.

[OBJETIVO]
Prepara un hotfix:
1. Crea rama `hotfix/search-normalize` desde main.
2. Aplica el fix mínimo en src/search/index.ts.
3. Añade un test de regresión que cubra el caso.
4. Genera el mensaje de commit siguiendo Conventional Commits.

[RESTRICCIONES]
- No tocar nada fuera de src/search/ y test/.
- El fix debe ser revertible con un solo commit.
- Sin refactors oportunistas.
```

**Qué observar:**

* Claude crea la rama desde main, no desde la rama actual.
* El fix es mínimo: solo lo que cubre el bug.
* El commit message es escaneable: `fix(search): normalize query and title for case/accents`.

### 🧩 Ejercicio 1 — Hotfix sobre un bug crítico

> **Rama:** `git checkout tema-18/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Recibes un bug crítico documentado en el `EJERCICIO.md`. Prepara la rama de hotfix, aplica el fix mínimo, añade test de regresión y genera el commit message en Conventional Commits. Verifica que el fix es revertible con un solo commit.

## 2. Preparación de hotfixes seguros y acotados sobre producción

Reglas no negociables para hotfix:

* **Rama desde el commit de producción**, no desde main si main ya tiene cambios no desplegados.
* **Una sola intención por rama.** Si descubres otro bug, otra rama.
* **Tests primero** (regresión) — el fix llega después.
* **Revertible:** un único commit que se pueda `git revert` sin efectos colaterales.

> Hotfix con scope expandido = hotfix que rompe producción dos veces.

## 3. Generación de mensajes de commit útiles y con atribución configurable

Un commit message útil:

```
<tipo>(<scope opcional>): <qué cambia en imperativo, en una línea>

<por qué cambia, no qué — el qué está en el diff>

<refs: closes #123, refs incidente XXXX>
```

Tipos comunes (Conventional Commits):

| Tipo       | Cuándo                                    |
| ---------- | ----------------------------------------- |
| `feat`     | Nueva funcionalidad visible               |
| `fix`      | Corrección de bug                         |
| `refactor` | Cambio interno sin alterar comportamiento |
| `perf`     | Mejora de rendimiento                     |
| `test`     | Añadir o arreglar tests                   |
| `docs`     | Solo documentación                        |
| `chore`    | Tareas de mantenimiento (deps, configs)   |

> "Mejoras varias" no es un commit message. Si necesitas más de una frase para el qué, son dos commits.

## 4. Revisión previa a merge para detectar conflictos funcionales

Hay dos tipos de conflictos:

| Tipo           | Cómo se detecta                               | Cómo se resuelve       |
| -------------- | --------------------------------------------- | ---------------------- |
| **Sintáctico** | Git marca `<<<<<<<`                           | Eligiendo qué mantener |
| **Semántico**  | Tests pasan en ambas ramas, fallan al mergear | Razonamiento humano    |

Los segundos son los peligrosos. Pídele a Claude que los busque:

```
[OBJETIVO]
Estoy a punto de mergear feature/X a main. Aunque git no marca conflictos
sintácticos, revísame:
- Funciones que ambas ramas han modificado pero con cambios distintos.
- Tests que pasan en cada rama por separado pero podrían fallar combinados.
- Cambios en el contrato de funciones llamadas por ambas ramas.

[FORMATO]
Tabla: función/archivo, qué cambió en cada rama, riesgo de conflicto semántico.
```

## 5. Asistencia en resolución de conflictos de merge con criterio semántico

Cuando aparece un conflicto, **no resuelvas el archivo a archivo**. Pídele a Claude el contexto:

```
[CONTEXTO]
Estoy mergeando feature/X a main. Hay conflicto en src/services/notes.ts.

[OBJETIVO]
Resúmeme:
1. Qué hace la versión de main en esa zona.
2. Qué hace la versión de feature/X en esa zona.
3. Cuál es la intención de cada uno (basado en el commit message respectivo).
4. Propuesta de resolución que preserva ambas intenciones.

[RESTRICCIONES]
- No edites el archivo todavía: dame el análisis primero.
```

> Resolver mecánicamente (`git checkout --ours`/`--theirs`) es la forma rápida de perder cambios buenos. Resuelve con cabeza.

### 🧪 Demo 2 — Resolver un conflicto de merge con criterio

* **Objetivo:** resolver un conflicto donde la resolución mecánica falla.
* **Setup:** rama `tema-18/inicio`. Tras `git merge feature/normalize-search` aparece conflicto en `src/search/index.ts`.

**Prompt literal:**

```
[CONTEXTO]
Conflicto en src/search/index.ts tras git merge feature/normalize-search.
Main: ha añadido logging dentro de search().
Feature: ha añadido normalización de query + title.

[OBJETIVO]
Propón la resolución que preserva ambos cambios. Explica brevemente
por qué cada bloque debe quedar como queda.

[FORMATO]
1. Archivo final propuesto.
2. Justificación por bloque.
3. Test que verifique que ambos comportamientos siguen funcionando.
```

**Qué observar:**

* Claude analiza intenciones antes de proponer el merge.
* Identifica que ambos cambios pueden coexistir (no son mutuamente excluyentes).
* Propone un test que verifica que ambas intenciones siguen vivas.

### 🧩 Ejercicio 2 — Resolver conflictos con criterio

> **Rama:** `git checkout tema-18/ejercicio-02` · **Tiempo:** 20 min · **Tipo:** En clase

Recibes una rama con conflictos plantados al intentar mergear. Usa Claude para entender ambas intenciones, propón la resolución, aplícala y verifica que un test cubre **ambos comportamientos** preservados (no solo uno).

## 6. Recuperación de contexto en ramas antiguas o trabajos interrumpidos

Cuando vuelves a una rama de hace 3 meses:

```
[OBJETIVO]
Estoy retomando la rama `wip/auth-refactor`. Resúmeme:
1. Qué intenta hacer (basado en commits y archivos cambiados).
2. Qué quedó a medias (TODOs, tests rojos, archivos modificados sin commit).
3. Qué ha cambiado en main desde que se creó esta rama que pueda afectarla.
4. Si compensa retomarla o reescribirla desde main.
```

> Una rama de 3 meses suele ser **deuda no priorizada**. La pregunta no es "cómo la retomo": es "**compensa retomarla**".

## 7. Uso de `/rewind`, `/resume`, `--continue` y control de sesiones relacionadas

Comandos de sesión de Claude Code relevantes para Git:

| Comando                | Para qué                                                                         |
| ---------------------- | -------------------------------------------------------------------------------- |
| `/rewind`              | Volver atrás varios mensajes en la sesión actual sin perder el contexto del repo |
| `/resume`              | Retomar una sesión previa (útil tras cierre accidental)                          |
| `claude --continue`    | Continuar la última sesión desde la CLI                                          |
| `claude --resume <id>` | Retomar una sesión específica                                                    |

Profundizamos en CLI avanzada y sesiones en el [Tema 22](tema-22-cli-avanzada.md).

## 8. Preparación de pull requests mejor explicadas y más auditables

Ver patrón completo en el [Tema 15](tema-15-code-review.md). Lo específico para PRs con cambios de Git:

* Si hay cambios en historial (rebase, squash), **explícalo**. Reviewers ven menos commits.
* Si hay reverts, enlazar el commit revertido.
* Si la rama parte de un commit no-main (otra rama de feature), aclararlo.

### 🧪 Demo 3 — PR con commits limpios

* **Objetivo:** preparar una rama con commits coherentes y un PR auditable.
* **Setup:** rama con commits intermedios desordenados.

**Prompt literal:**

```
[CONTEXTO]
La rama actual tiene 8 commits con mensajes como "wip", "más cosas",
"arreglo el arreglo". Voy a abrir PR.

[OBJETIVO]
Propón cómo reorganizarlos:
1. Identifica los commits que tienen contenido distinto.
2. Sugiere agrupación en 2-3 commits lógicos.
3. Mensajes en Conventional Commits para cada uno.
4. Comandos git exactos para hacer la reorganización (interactive rebase).

[RESTRICCIONES]
- No alteres el contenido final del diff.
- Si algún commit es revert de otro de la misma rama, sugerir eliminar ambos.
```

**Qué observar:**

* Claude propone agrupación lógica, no por proximidad temporal.
* Los mensajes finales son escaneables.
* Los comandos `git rebase -i` son correctos.

### 🧩 Ejercicio 3 — PR con commits limpios

> **Rama:** `git checkout tema-18/ejercicio-03` · **Tiempo:** 15 min · **Tipo:** En clase

Recibe una rama con commits desordenados. Reorganízalos en 2-3 commits coherentes con mensajes en Conventional Commits. Genera la descripción del PR siguiendo el formato del [Tema 15](tema-15-code-review.md).

## 9. Integración con workflows de revisión y ramas protegidas

Buenas prácticas con ramas protegidas:

* **Sin push directo a main.** Todo vía PR.
* **Required reviews.** Mínimo 1, en repos sensibles 2.
* **CI verde antes de merge.** Sin excepciones manuales salvo emergencia documentada.
* **Squash o merge commit, no rebase merge:** depende del estilo del repo. Coherencia > preferencia.
* **Lineal history** vs **merge commits visibles** — decisión del equipo, en ADR (ver [Tema 14](tema-14-documentacion.md)).

## 10. Buenas prácticas para no convertir la IA en un generador de commits sin juicio

Lo que Claude hace bien:

* **Mensajes de commit en Conventional Commits** a partir del diff.
* **Descripción de PR** combinada con la descripción del cambio.
* **Detección de conflictos semánticos** que git no marca.
* **Reorganización de commits** sin alterar el resultado final.

Lo que sigue siendo humano:

* Decidir cuándo squash y cuándo no.
* Decidir si un cambio merece su propia rama o va en la actual.
* Asumir la responsabilidad del commit firmado.

> El commit lo firmas tú. Aunque el mensaje lo proponga Claude.

***

## Resumen

* Hotfix = rama acotada, scope mínimo, revertible con un commit.
* Conventional Commits no es preferencia: es protocolo legible automatizable.
* Conflictos semánticos son los caros — no los marca git, los detecta tu cabeza (o Claude si se lo pides).
* Resolución mecánica de conflictos = pérdida de cambios. Razona la intención de cada lado.
* Una rama de 3 meses suele ser deuda no priorizada. La pregunta es si compensa retomarla.
