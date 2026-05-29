---
hidden: true
---

# Tema 12 — Refactorización profunda y modernización progresiva de código heredado sin romper el producto

> **Duración estimada:** ~60 min
> **Tipo:** práctico — alumnos delante del teclado

## Objetivo del tema

Refactorizar con criterio: distinguir deuda estructural de mejoras cosméticas, mover en lotes pequeños y usar los tests como red de seguridad. Claude Code acelera el cambio mecánico; el diseño del refactor sigue siendo tuyo.

***

## 1. Identificación de olores de código y prioridades de refactorización

No todo huele igual. Una lista de olores **priorizada por impacto**:

| Olor | Impacto típico | Cuándo refactorizar ya |
|---|---|---|
| Duplicación entre módulos con lógica de negocio | Bugs divergen en cada copia | Antes del siguiente cambio sobre cualquiera |
| Funciones con anidación profunda (≥4 niveles) | Imposible razonar sobre los caminos | Antes del primer test nuevo |
| Acoplamiento entre capas (ruta llama a storage) | Imposible cambiar una capa sin tocar la otra | Antes de añadir una capa nueva |
| Nombres equivocados (función dice `get`, hace `mutate`) | Lectores razonan sobre la mentira | Cuanto antes |
| Comentarios largos explicando qué hace el código | El código no se explica solo | Renombrar/extraer es mejor que comentar |

> Refactoriza lo que **vas a tocar la próxima vez**, no lo que te parece feo desde la lejanía.

### 🧪 Demo 1 — Detectar olores con criterio de impacto

- **Objetivo:** identificar 3 olores en Notebox y ordenarlos por impacto real, no por "fealdad" superficial.
- **Setup:** `git checkout tema-12/inicio`, `npm test` verde.

**Prompt literal:**

```
Analiza src/ de este repositorio. Identifica los 3 olores de código con
mayor impacto en mantenibilidad. Para cada uno:
- Archivo y líneas concretas.
- Por qué es deuda estructural (no cosmética).
- Qué cambio futuro se hace más costoso por su culpa.
No me digas "podría ser más limpio". Quiero impacto verificable.
```

**Qué observar:**

- Claude cita archivos y líneas, no categorías abstractas.
- La justificación menciona un cambio futuro concreto, no "es feo".
- Si Claude propone reescribir todo, redirígelo: queremos foco.

### 🧩 Ejercicio 1 — Priorizar olores con criterio de impacto

> **Rama:** `git checkout tema-12/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Identifica 5 olores en `src/` de Notebox y ordénalos en una tabla por impacto real (no por estética). Para cada uno, cita archivo+línea, motivo estructural y el cambio futuro que se vuelve más caro si no se refactoriza.

## 2. Separación entre deuda estructural y simples mejoras cosméticas

| Estructural (refactorizar) | Cosmético (dejar pasar) |
|---|---|
| Duplicación que ya ha causado un bug | Inconsistencias de naming sin impacto |
| Funciones que mezclan validación y persistencia | Comentarios redundantes |
| Acoplamiento entre módulos que deberían ser independientes | Falta de JSDoc |
| Lógica condicional explosiva (cyclomatic ≥ 10) | Líneas largas |

> El refactor cosmético tiene coste cero esperado **y** beneficio cero esperado. No lo confundas con valor.

## 3. Extracción de funciones, módulos y capas para reducir acoplamiento

Pasos para extraer con seguridad:

1. **Test de comportamiento** sobre la función original (si no existe, créalo primero).
2. **Identifica el bloque cohesivo** que va a salir (no extraigas 3 líneas que no van juntas).
3. **Extrae con nombre nuevo** que describa el qué, no el cómo.
4. **Verifica el test** sigue verde.
5. **Repite** si quedan bloques cohesivos.

> Nunca extraigas sin un test que cubra el comportamiento. Sin test, "no rompo nada" es una creencia, no una garantía.

### 🧪 Demo 2 — Extracción guiada con red de seguridad

- **Objetivo:** extraer una función duplicada manteniendo los tests verdes en cada paso.
- **Setup:** misma rama, foco en `src/services/notes.ts` (funciones `archive` y `unarchive` duplican estructura).

**Prompt literal:**

```
[CONTEXTO]
src/services/notes.ts. archive(id) y unarchive(id) tienen la misma estructura:
buscar nota, validar existencia, mutar campo, persistir.

[OBJETIVO]
Extraer la lógica común a una función privada updateArchiveState(id, archived).
Mantener las firmas archive(id) y unarchive(id) intactas.

[RESTRICCIONES]
- Solo toca src/services/notes.ts.
- Cada paso debe terminar con npm test verde.
- Diff mínimo. No introduzcas dependencias nuevas.

[FORMATO]
1. Primer paso: extraer la función sin cambiar las dos públicas. Tests verdes.
2. Segundo paso: hacer que archive y unarchive usen la nueva función. Tests verdes.
```

**Qué observar:**

- Claude divide el refactor en dos commits lógicos.
- Los tests pasan tras cada paso, no solo al final.
- La firma pública no cambia: callers no se enteran.

### 🧩 Ejercicio 2 — Extraer función duplicada paso a paso

> **Rama:** `git checkout tema-12/ejercicio-02` · **Tiempo:** 20 min · **Tipo:** En clase

Refactoriza `archive` y `unarchive` para que compartan la lógica común. Hazlo en dos commits lógicos con `npm test` verde tras cada uno. Mantén intactas las firmas públicas.

## 4. Simplificación de lógica compleja con validación de comportamiento previo

Antes de tocar una función compleja, **caracterízala con tests**: tests que documentan lo que hace hoy, incluyendo los caminos raros. Estos tests son tu contrato con el pasado.

```
[OBJETIVO]
Crea tests de caracterización para getNotesByTag(notes, tag) sin cambiar
ni una línea de la función. Cubre: tag inexistente, tag en mayúsculas,
array vacío, notas sin tags.
```

Con la red puesta, simplifica.

## 5. Reescritura gradual de áreas frágiles con tests como red de seguridad

El antipatrón clásico: "voy a reescribir esto entero".

Mejor patrón:

1. **Tests de caracterización** sobre el comportamiento actual.
2. **Aísla la frontera** del módulo a reescribir.
3. **Crea la nueva implementación** en paralelo, detrás de la misma firma.
4. **Conmuta con feature flag** y mide el cambio en producción.
5. **Elimina el código viejo** solo cuando la nueva versión esté estable.

> Reescribir sin pasos intermedios es un proyecto de meses. Con pasos intermedios es una serie de PRs revisables.

## 6. Refactorización orientada a mantenibilidad, legibilidad y extensibilidad

Tres objetivos, tres preguntas:

- **Mantenibilidad:** ¿el próximo bug aquí será fácil de arreglar?
- **Legibilidad:** ¿un dev nuevo entiende esto sin hablar con nadie?
- **Extensibilidad:** ¿añadir el siguiente requisito se hará sin tocar 10 archivos?

Si la respuesta a las tres es "sí", no refactorices.

## 7. Revisión del impacto sobre rendimiento, contratos y dependencias

Cosas que se rompen sin que los tests las pillen:

| Riesgo | Cómo verificarlo |
|---|---|
| Cambio en latencia | Benchmark mínimo del path crítico |
| Cambio en el contrato público | Diff de tipos exportados o de OpenAPI |
| Nueva dependencia | Diff del `package.json` antes de aceptar |
| Cambio en formato de logs | Grep en consumidores de logs |

Pregunta a Claude antes de merge:

```
Compara la rama actual con main. ¿Hay cambios que afecten al contrato
público, al rendimiento del path crítico o que introduzcan nuevas dependencias?
Cita rutas exactas.
```

## 8. Documentación del before/after para justificar el cambio

Todo refactor profundo necesita una mini explicación en el PR:

```
[FORMATO]
Genera la descripción del PR con:
1. Estado antes (1 párrafo).
2. Estado después (1 párrafo).
3. Por qué este cambio compensa ahora (motivo concreto: incidente, feature próxima, etc.).
4. Qué riesgos quedan y cómo se mitigan.
```

> Si no puedes explicar el "por qué ahora", el refactor no compensa.

### 🧪 Demo 3 — Generar descripción before/after del PR

- **Objetivo:** producir la descripción del PR del refactor de la Demo 2.
- **Setup:** refactor de archive/unarchive aplicado en la rama.

**Prompt literal:**

```
Genera la descripción del PR para el refactor que acabamos de hacer en
src/services/notes.ts. Estructura:
1. Antes (1 párrafo).
2. Después (1 párrafo).
3. Por qué ahora (motivo concreto, no genérico).
4. Riesgos residuales.
Sé conciso. Reviewers no quieren leer prosa.
```

**Qué observar:**

- La descripción menciona archivos concretos y firmas.
- "Por qué ahora" no es "porque es buena práctica" — es un motivo verificable.
- Los riesgos están priorizados, no listados en bloque.

### 🧩 Ejercicio 3 — Documentar el refactor para PR

> **Rama:** `git checkout tema-12/ejercicio-03` · **Tiempo:** 15 min · **Tipo:** En clase

A partir del refactor del Ejercicio 2, genera la descripción del PR siguiendo el formato antes / después / por qué ahora / riesgos. La descripción debe ser revisable en menos de 2 minutos por un reviewer.

## 9. Estrategias para refactorizar en ramas seguras y lotes pequeños

Reglas operativas:

- Una rama, **un olor**.
- Cada commit **deja los tests verdes**.
- PRs de refactor: nunca mezclados con features.
- Si el refactor crece más allá de 200 LOC cambiadas, **divídelo**.

> Lotes pequeños tienen probabilidad alta de mergearse. Lotes grandes mueren en review.

## 10. Uso de Claude Code para modernizar sin reescribir ciegamente todo el sistema

Pídele a Claude que actúe como ayudante mecánico, no como diseñador:

- **Sí:** aplicar un patrón ya decidido por ti a 30 sitios.
- **Sí:** generar tests de caracterización antes de un refactor.
- **Sí:** documentar before/after para el PR.
- **No:** "moderniza este archivo" sin restricciones — sobreedita.
- **No:** "refactoriza el repo" — no tiene foco, toca todo.

> El diseño del refactor lo defines tú. Claude lo aplica.

***

## Resumen

- Refactoriza lo que vas a tocar pronto, no lo que te parece feo.
- Distingue deuda estructural (cuesta dinero) de cosméticos (no compensa).
- Sin test, no hay refactor. Caracteriza antes de tocar.
- Lotes pequeños, una rama por olor, PR explicado con "antes / después / por qué ahora".
- Claude ejecuta el cambio mecánico. El diseño es tuyo.
