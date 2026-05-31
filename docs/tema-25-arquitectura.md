---
hidden: true
---

# Tema 25 — Arquitectura, diseño de software, patrones y decisiones técnicas asistidas por IA sin perder criterio humano

> **Duración estimada:** ~90 min
> **Tipo:** conceptual + demos guiadas

## Objetivo del tema

Usar Claude Code como sparring de arquitectura: explorar alternativas antes de escribir código, redactar ADRs con criterio y detectar deuda arquitectónica con datos del repo en la mano. Al terminar, el alumno trata las decisiones de diseño como **artefactos versionados** — propuesta, trade-offs, ADR, plan de mitigación — en lugar de improvisarlas en el primer commit. El agente acelera el análisis y la redacción; el juicio sobre qué entra al repo sigue siendo humano.

***

## 1. Exploración de alternativas de diseño antes de escribir implementación

Antes de tocar un solo archivo, la pregunta no es "¿cómo lo implemento?" — es "¿qué alternativas tengo y qué cuesta cada una en este repo?". Un agente que va directo a generar código se salta el paso más importante.

| Antipatrón al pedir diseño | Por qué falla | Mejor pregunta inicial |
|---|---|---|
| "Impleméntame X" | Salta el espacio de alternativas; te quedas con la primera idea | "Dame 3 alternativas para resolver X, con trade-offs" |
| "Cuál es la mejor arquitectura para Y" | Pregunta abstracta — la respuesta también lo será | "Para este repo, con estas restricciones, qué opciones tengo" |
| "Usa el patrón Z" | Decide antes de evaluar; el patrón puede no encajar aquí | "¿Hay un patrón ya presente que cubre esto?" |
| "Hazme una solución limpia" | "Limpia" no es criterio operativo | "Optimiza para [coste de cambio / simplicidad / extensibilidad] y explica el trade-off" |

> Regla mental: **antes de implementar, exploras**. El espacio de alternativas se enumera primero; la elección viene después, con criterios explícitos.

Lo que se pide al agente en fase de exploración:

- **Enumerar 2–4 alternativas reales**, no variantes cosméticas de la misma idea.
- **Trade-offs por alternativa** en ejes acordados (coste de implementación, coste de cambio futuro, riesgo, simplicidad, encaje con lo ya existente).
- **Restricciones del repo concreto**: lenguaje, framework, capas existentes, deuda conocida. Sin ese contexto, las alternativas son genéricas.
- **Recomendación con justificación**, no "depende". Si depende, explicitar **de qué**.

### 🧪 Demo 1 — Explorar alternativas para una decisión pendiente plantada

- **Objetivo:** convertir una "decisión pendiente" plantada en el repo (migrar `storage/memory.ts` a algo persistente) en una tabla razonada de 3 alternativas con trade-offs, sin escribir aún ni una línea de código.
- **Setup:** rama `tema-25/inicio`. El repo trae `docs/architecture/PENDING-001-persistencia.md` con el contexto de la decisión pendiente, junto con `docs/architecture/ADR-001-storage-en-memoria.md` y `ADR-002-express-framework.md` ya escritos como referencia.

**Pasos:**

1. Desde el REPL, pedir el mapa de alternativas:
   ```
   Lee docs/architecture/PENDING-001-persistencia.md y src/storage/memory.ts.
   Dame 3 alternativas reales para sustituir el storage in-memory por algo
   persistente. Para cada alternativa: una frase de qué es, qué cambia en
   el código (qué archivos toca, qué interfaz se mantiene).
   ```
2. Pedir los trade-offs en ejes explícitos:
   ```
   Para esas 3 alternativas, dame una tabla con columnas: coste de
   implementación (alto/medio/bajo), coste de cambio futuro, riesgo,
   simplicidad operativa, encaje con la capa services/ actual. Una frase
   por celda.
   ```
3. Pedir la recomendación condicionada:
   ```
   Recomienda una de las 3 dado este contexto: Notebox sigue siendo
   ejemplo de curso pero queremos demostrar persistencia real sin
   complicar el arranque. La recomendación tiene que justificarse en los
   ejes de la tabla, no en preferencia personal.
   ```
4. Pedir explícitamente lo que NO recomendaría:
   ```
   ¿Cuál de las 3 alternativas descartarías primero y por qué? Si todas
   son razonables, dilo — pero da una jerarquía clara.
   ```
5. Cerrar sin implementar:
   ```
   No escribas código aún. Resume en 3 bullets qué decisión queda
   pendiente y qué información me falta para tomarla.
   ```

**Qué observar:**

- La tabla de alternativas debe tener **3 opciones reales** (p.ej. SQLite embebido, Postgres en Docker, fichero JSON con `fs.promises`), no variantes de la misma (p.ej. "Postgres", "Postgres con pool", "Postgres en RDS").
- Los trade-offs deben usar los **ejes acordados** (coste de cambio, simplicidad, riesgo) — no "es elegante" o "es lo que usa todo el mundo".
- La recomendación final debe **señalar qué pierdes** con esa elección, no solo qué ganas.
- Si el agente salta a "te lo implemento ahora", redirigir: "exploración primero, implementación cuando decida el humano".

### 🧩 Ejercicio 1 — Alternativas de diseño para una decisión pendiente

> **Rama:** `git checkout tema-25/ejercicio-01` · **Tiempo:** 30 min · **Tipo:** En clase

Lee `docs/architecture/PENDING-001-persistencia.md` plantado, explora 3 alternativas reales con Claude usando los ejes de trade-off acordados, justifica la recomendación y deja constancia de qué descartas. Entrega `OPCIONES-PERSISTENCIA.md` con: tabla de alternativas (mínimo 3) con trade-offs por eje, recomendación razonada con lo que se pierde, alternativa descartada con motivo, y "qué información me falta para decidir" — al menos 2 puntos.

---

## 2. Análisis de trade-offs entre simplicidad, extensibilidad y coste de cambio

Cada decisión arquitectónica se paga en uno o varios ejes. Confundir simplicidad con extensibilidad — o pensar que se pueden maximizar las dos a la vez — es el error más caro.

| Eje | Qué optimiza | Qué se sacrifica | Cuándo prioriza |
|---|---|---|---|
| **Simplicidad** | Que cualquiera lea el código y lo entienda en minutos | Capacidad de extender sin tocar lo existente | Equipo pequeño, scope acotado, MVP, ejemplos didácticos |
| **Extensibilidad** | Añadir variantes sin modificar el core (Open/Closed) | Líneas de indirección, abstracciones que cuestan mantener | Producto con plugins, integraciones múltiples, casos de uso heterogéneos |
| **Coste de cambio futuro** | Que un cambio de motor / framework / proveedor toque pocos archivos | Esfuerzo extra hoy en interfaces y adapters | Áreas con alta probabilidad de migración (storage, mensajería, auth) |
| **Rendimiento** | Latencia, throughput, memoria | Legibilidad, abstracción, generalidad | Caminos calientes ya medidos, no por anticipación |
| **Reusabilidad** | Misma pieza sirve para varios consumidores | Acoplamiento a un contrato común que puede no encajar a todos | Librería interna que de verdad varios equipos van a usar |

> Regla mental: **no se optimizan los cinco ejes a la vez**. Elegir uno o dos por decisión, declarar los otros y aceptar lo que se sacrifica. Lo contrario es marketing de arquitectura.

Cómo se pide al agente un análisis de trade-offs honesto:

- **Anclar los ejes antes** de hacer la pregunta. "Optimiza para simplicidad y coste de cambio, no para extensibilidad" devuelve respuestas accionables.
- **Pedir qué se sacrifica**, no solo qué se gana. Una decisión que "no tiene contras" es una decisión mal analizada.
- **Forzar comparación contra el statu quo**. "Qué cuesta esta alternativa frente a no hacer nada" es la primera pregunta del coste de cambio.
- **Cuantificar lo cuantificable**: "líneas tocadas", "archivos nuevos", "tests que hay que reescribir". Lo subjetivo va en prosa, lo medible en cifras.

### Antipatrones del análisis de trade-offs con IA

- ❌ Pedir "qué arquitectura me recomiendas para X" sin ejes ni restricciones. Devuelve respuestas de blog.
- ❌ Aceptar una recomendación que solo enumera ventajas. Si no hay sección "qué se pierde", el análisis está sesgado.
- ❌ Confundir "el agente coincide con mi idea inicial" con validación. Pedirle el contraargumento explícito.
- ❌ Optimizar extensibilidad cuando la incertidumbre del dominio aún es alta. Diseñar para el cambio que no ha llegado es el origen de la sobreingeniería.

---

## 3. Uso de Claude Code para revisar bounded contexts, capas y contratos

Un repo bien diseñado tiene **fronteras visibles**: módulos con responsabilidad clara, capas que solo hablan con su vecina inmediata, contratos que no se rompen sin avisar. Cuando esas fronteras se difuminan, el coste de cambio se dispara.

| Concepto | Qué define | Síntoma de problema | Cómo lo verifica el agente |
|---|---|---|---|
| **Bounded context** | Modelo de dominio coherente dentro de una frontera | El mismo concepto significa cosas distintas en módulos distintos | Pedir: "¿en qué módulos aparece el concepto `note`? ¿Tienen la misma forma?" |
| **Capa** | Nivel de abstracción (rutas, services, storage, modelos) | Una capa importa de varios niveles, o la capa baja conoce a la alta | "Lista los imports de cada capa. ¿Alguno cruza la frontera?" |
| **Contrato** | API pública de un módulo (tipos exportados, funciones expuestas) | Cambios en el contrato no se reflejan en los consumidores | "¿Qué cambia en el contrato de `storage` si lo sustituyo? ¿Quién lo consume?" |
| **Acoplamiento** | Cuánto sabe un módulo de otro | Cambiar `A` obliga a cambiar `B`, `C`, `D` aunque sean conceptualmente distintos | "Si reemplazo `storage/memory.ts` por un adapter SQL, ¿qué archivos tocan?" |

> Regla mental: **un repo sano se puede dibujar en una servilleta**. Si dibujarlo te lleva más de 5 minutos o el dibujo tiene flechas que cruzan capas, hay deuda estructural.

### Cómo dirigir al agente a leer fronteras

- **Pídele primero el mapa**, no el diagnóstico. "Lista los módulos de `src/` con una frase de responsabilidad cada uno". Si el mapa es confuso, el código también.
- **Pregunta por imports cruzados**. "¿Algún archivo de `routes/` importa directamente de `storage/`?" Saltarse `services/` es señal de filtración de capa.
- **Verifica contratos exportados**. "Listame qué exporta `storage/memory.ts` y quién lo consume". Si lo consumen 6 sitios, cambiar la interfaz cuesta 6 veces más.
- **No confundas estilo con estructura**. "El código es feo" no es un problema arquitectónico. "Routes habla con storage saltándose services" sí lo es.

---

## 4. Identificación de patrones ya presentes en el repositorio

Antes de proponer un patrón nuevo, el agente debe **descubrir los que ya están**. Introducir un Strategy donde ya hay un Strategy con otro nombre es duplicar abstracción, no añadir orden.

| Patrón habitual | Cómo se reconoce en el código | Cuándo NO añadirlo si ya existe |
|---|---|---|
| **Repository** | Objeto con `save`, `findById`, `list`, `update` que esconde el detalle de storage | `src/storage/memory.ts` ya lo es — añadir uno encima es redundancia |
| **Service layer** | Capa intermedia que orquesta storage + dominio + validación | Si ya hay `services/`, no crear "managers" o "helpers" paralelos |
| **Adapter** | Implementación intercambiable que cumple un contrato común | Si el storage ya es intercambiable por interfaz, no envolverlo otra vez |
| **Strategy** | Selección de algoritmo en tiempo de ejecución | Si hay un `if/else` de 3 ramas estable, Strategy puede empeorar la legibilidad |
| **Factory** | Construcción centralizada de objetos complejos | Si `new Note(...)` es directo y se construye en un solo sitio, no hace falta factory |

> Regla mental: **el patrón ya presente gana al patrón propuesto**. Si el repo tiene Repository sin llamarse así, lo respetas; no añades una segunda capa para "formalizar" lo que ya funciona.

Lo que se pide al agente antes de proponer patrones:

- **Inventario primero**: "qué patrones identificables hay ya en `src/`, citando archivo".
- **Mapeo de nombres**: el código puede usar otra terminología. "El equivalente a Repository aquí es `storage/memory.ts`".
- **Coherencia interna**: si un módulo sigue un patrón, el resto del módulo debería seguirlo. Inconsistencia parcial es peor que no usar el patrón.

---

## 5. Propuesta de patrones adecuados sin introducir sobreingeniería gratuita

Un patrón es **una solución a un problema concreto**, no un adorno. Introducir Factory, Builder o Observer "por si acaso" añade superficie de mantenimiento sin beneficio inmediato.

| Tentación | Qué la justifica | Qué la desaconseja |
|---|---|---|
| Añadir interfaz para un único implementador | Tests que necesitan un doble | "Algún día tendremos otro adapter" sin evidencia |
| Crear Factory para construcción simple | Lógica de construcción condicional, parámetros derivados | `new X(a, b)` directo en un solo sitio |
| Introducir Strategy para 2 casos | Las 2 ramas cambian por motivos distintos y crecerán | Un `switch` de 2 casos estable durante meses |
| Inyectar dependencias por constructor en todo | Tests sin mocks globales, sustitución de adapters real | Inyectar `Date.now` cuando bastaba `() => new Date()` |
| Capa de DTOs distinta del modelo de dominio | Modelo expuesto difiere del interno (campos calculados, anidamiento) | El DTO es una copia byte a byte del modelo |

> Regla mental: **YAGNI gana por defecto**. La extensibilidad se introduce cuando hay **al menos dos consumidores reales**, no cuando hay uno potencial.

### 🧪 Demo 2 — Redactar un ADR sobre una decisión pendiente del repo

- **Objetivo:** convertir la decisión pendiente "validación de input: en routes o en services" en un ADR completo, con contexto real del código, decisión en presente y consecuencias honestas (qué se gana y qué se pierde).
- **Setup:** rama `tema-25/inicio`. El repo trae `docs/architecture/PENDING-002-validacion-en-routes-o-services.md` con el dilema planteado, junto con los ADR-001 y ADR-002 ya escritos como modelo de formato.

**Pasos:**

1. Recoger el contexto antes de redactar:
   ```
   Lee docs/architecture/PENDING-002-validacion-en-routes-o-services.md,
   src/routes/notes.ts y src/services/notes.ts. Resume en 5 bullets el
   estado actual: dónde se valida hoy, dónde no, qué inconsistencias
   hay entre rutas. Sin proponer todavía.
   ```
2. Pedir las dos opciones con trade-offs:
   ```
   Dame dos opciones concretas: (A) toda la validación en routes,
   (B) toda la validación en services. Trade-offs en ejes simplicidad,
   coste de cambio y testabilidad. Una columna por opción.
   ```
3. Decidir antes de redactar el ADR:
   ```
   Recomienda una de las dos para este repo dado que (1) la API es
   pequeña, (2) queremos reusar la lógica desde el servidor MCP del
   Tema 20, (3) los tests de services ya existen. Justifica.
   ```
4. Redactar el ADR siguiendo el formato del repo:
   ```
   Genera ADR-003 en docs/architecture/ siguiendo exactamente el formato
   de ADR-001 (Contexto, Decisión, Consecuencias). Decisión en presente
   imperativa. Consecuencias incluye qué se gana, qué se pierde y qué
   queda por verificar. Máximo media página.
   ```
5. Cruzar con el código antes de cerrar:
   ```
   ¿El ADR-003 propuesto contradice algo de los ADR-001 o ADR-002 ya
   escritos? Si entran en conflicto, márcalo explícitamente — un ADR
   nuevo no se silencia con uno viejo, lo deprecia.
   ```

**Qué observar:**

- "Decisión" debe estar en **presente imperativo** ("La validación de input vive en services") — no "deberíamos plantearnos" ni "propongo que".
- "Consecuencias" tiene tres sub-bloques implícitos: **se gana**, **se pierde**, **queda por verificar**. Si falta el "se pierde", el ADR está incompleto.
- El ADR debe **citar archivos concretos** del repo, no hablar en abstracto.
- Si la decisión deprecia un ADR anterior, debe **decirlo explícitamente** en el bloque "Consecuencias".

### 🧩 Ejercicio 2 — Redacción de un ADR completo

> **Rama:** `git checkout tema-25/ejercicio-02` · **Tiempo:** 30 min · **Tipo:** En clase

Recoge el contexto del repo, decide entre las dos opciones planteadas en `PENDING-002-validacion-en-routes-o-services.md` y entrega `docs/architecture/ADR-003-validacion-de-input.md` siguiendo exactamente el formato de los ADR-001 y ADR-002 plantados: Contexto con datos del repo, Decisión en presente imperativa, Consecuencias con qué se gana, qué se pierde y qué queda por verificar. Adicionalmente, actualiza `docs/architecture/README.md` añadiendo la nueva entrada al índice.

---

## 6. Evaluación de deuda arquitectónica antes de nuevas funcionalidades

Añadir features sobre deuda arquitectónica acumula intereses. Cada nueva funcionalidad sobre una capa ya filtrada o un módulo ya inflado **multiplica el coste futuro**, no lo suma.

| Tipo de deuda arquitectónica | Síntoma observable | Cómo lo mide el agente |
|---|---|---|
| **Capa filtrada** | Routes habla con storage saltándose services | Grep de imports cruzados entre capas |
| **God module** | Un archivo con responsabilidades de 3 conceptos distintos | Líneas + número de imports + funciones exportadas |
| **Lógica duplicada en endpoints** | El mismo `if/else` o validación copiada en 4 rutas | Grep del patrón + comparación de cuerpos |
| **Abstracción sin segundo consumidor** | Interfaz definida con un único implementador real | Buscar quién implementa y quién consume |
| **Inconsistencia de naming** | El mismo concepto con 3 nombres distintos en distintos archivos | "Note", "Item", "Entry" para la misma entidad |
| **Acoplamiento temporal** | Llamar a `init()` antes de `use()` o se rompe | Comentarios "// llamar antes de X", orden implícito |
| **Anidamiento profundo** | `if/else/if/else` de 5+ niveles por función | Profundidad de indentación + complejidad ciclomática |

> Regla mental: **la deuda arquitectónica se mide antes de pagar la siguiente cuota**. Si el sprint promete 3 features y el repo tiene una capa filtrada, una de esas 3 features pagará el coste — la duda es cuál.

Cómo se pide al agente un diagnóstico honesto de deuda:

- **Pedir un inventario priorizado**, no una lista exhaustiva. "Top 5 olores arquitectónicos con coste estimado en líneas tocadas si los arreglo ahora vs en 6 meses".
- **Forzar la conexión con la siguiente feature planificada**. "Si añadimos paginación al endpoint `/notes`, ¿qué deuda nos va a morder primero?".
- **Distinguir deuda intencional de deuda accidental**. La intencional está documentada (en un ADR o en un comentario); la accidental no.
- **No confundir deuda con preferencia**. "No me gusta el estilo del código" no es deuda. "Cambiar el storage cuesta tocar 8 archivos porque routes lo importa directamente" sí.

### 🧪 Demo 3 — Detectar deuda arquitectónica y proponer plan de mitigación

- **Objetivo:** producir un inventario priorizado de deuda arquitectónica del repo Notebox, con coste estimado, plan de mitigación por orden de rentabilidad, y conexión con la próxima feature planificada (paginación).
- **Setup:** rama `tema-25/inicio`. El repo tiene deuda real plantada: `services/notes.ts` con anidamiento profundo (5 niveles en `archive` y `unarchive`), búsqueda case-sensitive (`src/search/index.ts`), validación inconsistente entre rutas, y storage in-memory acoplado por import directo. Existe también `docs/architecture/DEUDA-CONOCIDA.md` con el contexto y la lista de features previstas.

**Pasos:**

1. Pedir el inventario priorizado:
   ```
   Lee src/ completo y docs/architecture/DEUDA-CONOCIDA.md. Dame los
   top 5 olores arquitectónicos del repo, ordenados por coste real si
   los dejamos. Para cada uno: archivo y línea, tipo de deuda (capa
   filtrada / god module / duplicación / etc.), estimación de líneas
   tocadas si lo arreglo ahora vs en 6 meses (orden de magnitud).
   ```
2. Conectar con la siguiente feature:
   ```
   Si la próxima feature es añadir paginación a GET /notes (límite +
   offset), ¿qué deuda de las anteriores nos va a morder primero?
   Justifica con archivos concretos.
   ```
3. Pedir el plan de mitigación en pasos pequeños:
   ```
   Para los 3 olores más rentables, dame un plan de mitigación
   incremental. Cada paso: qué cambia, en qué archivo, qué tests cubren
   ese cambio. Sin reescrituras completas — pasos chiquitos.
   ```
4. Verificar que el plan no introduce más deuda:
   ```
   Revisa el plan. ¿Algún paso introduce abstracción sin segundo
   consumidor, o crea una capa nueva sin justificación? Si sí,
   propone una alternativa más directa.
   ```
5. Cerrar con lo que NO se hace:
   ```
   Lista qué deuda dejas sin tocar en este sprint y por qué. La
   priorización de lo que NO se arregla es tan importante como la de
   lo que sí.
   ```

**Qué observar:**

- El inventario debe **citar archivos y líneas reales** del repo, no hablar en abstracto.
- La conexión con la feature de paginación debe ser **operativa**: "para paginar, `services/notes.ts` necesita un `list(limit, offset)`, pero el anidamiento actual de `archive/unarchive` indica que esta capa tiene problemas previos que conviene resolver antes".
- El plan de mitigación debe ser **incremental** — sin "reescribimos el módulo entero". Si el agente propone refactor masivo, redirigir.
- La sección "qué dejo sin tocar" no puede estar vacía. Una decisión consciente de no actuar también es arquitectura.

### 🧩 Ejercicio 3 — Diagnóstico de deuda arquitectónica y plan de mitigación

> **Rama:** `git checkout tema-25/ejercicio-03` · **Tiempo:** 30 min · **Tipo:** En clase

Audita el repo con Claude, identifica los 5 olores arquitectónicos más rentables, conecta con la próxima feature planificada (paginación de `/notes`) y propón un plan de mitigación incremental. Entrega `DEUDA-ARQUITECTONICA.md` con: tabla de los 5 olores (archivo, línea, tipo, coste ahora vs en 6 meses), conexión con la feature de paginación, plan incremental para los 3 más rentables (paso a paso, archivos tocados, tests que cubren), y sección "qué dejo sin tocar y por qué" con al menos 2 puntos justificados.

---

## 7. Discusión de alternativas para módulos críticos o legacy

Un módulo crítico (storage, auth, búsqueda) o un módulo legacy (código viejo que nadie quiere tocar) requiere una conversación más profunda que el resto. Las alternativas se discuten con datos, no con intuición, y la decisión se toma con varias cabezas — incluida la del agente, pero nunca solo la del agente.

| Tipo de módulo | Por qué requiere discusión extra | Riesgo de delegar a la IA en solitario |
|---|---|---|
| **Storage / persistencia** | Cambio caro, datos en juego, migraciones | Migración propuesta sin pensar en datos en vuelo |
| **Autenticación / autorización** | Seguridad, cumplimiento, blast radius | Cambio que rompe sesiones activas o expone tokens |
| **Búsqueda / indexación** | Comportamiento dependiente de datos reales | Algoritmo "más limpio" que devuelve peores resultados |
| **Pasarela de pagos** | Estado externo, idempotencia, fraude | Reintento mal hecho que cobra dos veces |
| **Código legacy sin tests** | Comportamiento no documentado en assertions | Refactor que rompe casos que nadie sabía que existían |
| **Migración de framework / lenguaje** | Coste alto, beneficio diferido | "Reescribir desde cero" como propuesta sin plan de coexistencia |

> Regla mental: **cuanto más crítico el módulo, más voces necesita la decisión**. La IA es una de ellas, no la única. El módulo legacy se discute en una sesión humana — el agente aporta análisis y memoria histórica del código, no veredicto.

Cómo se pide al agente análisis sobre módulos críticos o legacy:

- **Empezar por la auditoría, no por la propuesta.** "Antes de proponer nada, qué hace exactamente este módulo y qué consume".
- **Recoger lo no obvio.** Si hay comentarios "// no tocar", "// HACK", "// TODO desde 2019", el agente los lista — son pistas.
- **Pedir el plan de coexistencia.** Para módulos críticos, raramente se sustituye en un commit. "Cómo conviven la versión vieja y la nueva durante 2 sprints".
- **Forzar la opción 'no hacer nada'** como alternativa válida. A veces la deuda se asume conscientemente porque el coste de tocarla supera el dolor que genera.

### Antipatrones al discutir módulos críticos con IA

- ❌ Pedir al agente que "modernice" un módulo legacy sin analizar primero qué casos cubre y qué tests hay. "Modernizar" sin tests es lotería.
- ❌ Aceptar una propuesta de migración que no contemple datos en vuelo. Storage migrado sin plan de migración de datos es bug a futuro.
- ❌ Decidir sustituir un módulo legacy "porque está feo" sin medir el coste real. Lo feo que funciona puede ser barato; lo bonito por reescribir suele ser caro.
- ❌ Confundir "tengo análisis del agente" con "tengo decisión técnica". El análisis informa; la decisión la firma una persona.

---

## 8. Preparación de ADRs y argumentos técnicos bien estructurados

Un ADR es **un acta de decisión arquitectónica**. No es un blog post, no es una propuesta, no es un brainstorming. Tiene tres bloques (Contexto, Decisión, Consecuencias), está numerado, no se borra y vive en el repo junto al código que decide.

| Bloque del ADR | Qué responde | Trampa habitual |
|---|---|---|
| **Contexto** | Qué problema concreto resuelve y qué restricciones aplican | Vaguedad: "queremos mejorar la arquitectura" |
| **Decisión** | Qué se ha decidido, en presente imperativo, en una frase | Aspiración: "deberíamos plantearnos hacer X" |
| **Consecuencias** | Qué se gana, qué se pierde, qué queda por verificar | Solo ventajas, sin contras ni TODOs |
| **(Estado opcional)** | Aceptado / Deprecado / Sustituido por ADR-NNN | Borrar el ADR viejo en vez de marcarlo como deprecado |

> Regla mental: **una decisión, un ADR**. Si el documento decide 3 cosas, son 3 ADRs. Si decide "nada concreto", no es un ADR — es una nota.

### Formato canónico (siguiendo el repo)

```markdown
# ADR-NNN — Decisión en imperativo

**Contexto:** problema concreto, datos que conoces, restricciones reales del repo, archivos involucrados.

**Decisión:** qué se ha decidido. Una frase, presente imperativo. Sin "se considera" ni "se propone".

**Consecuencias:** qué se gana, qué se pierde, qué queda por verificar. Tres frases mínimo, una para cada bloque.
```

### Reglas de oro para ADRs con IA

- **El agente redacta el borrador, el humano firma.** Un ADR sin revisor es una nota suelta.
- **El ADR cita archivos del repo.** Si no se puede grep nada del ADR contra el código, está flotando.
- **No se silencia un ADR viejo con uno nuevo sin marcarlo.** Sustituido por / Deprecado por: ADR-NNN. La trazabilidad arquitectónica vive en la cadena de ADRs.
- **El ADR se commitea con el código de la decisión.** Si el ADR llega en un PR y el código en otro, la trazabilidad se pierde.

---

## 9. Revisión de consistencia entre diseño y código final entregado

Un ADR sin verificación es una promesa. La pregunta operativa al cierre de una decisión es: **¿el código que se ha entregado cumple lo que el ADR dice?**

| Forma de inconsistencia diseño ↔ código | Cómo se detecta | Coste si no se detecta |
|---|---|---|
| ADR dice "validación en services", código valida en routes | Grep de validación + cruce con ADR | Lógica duplicada, validación parcial, tests engañosos |
| ADR dice "storage intercambiable por interfaz", solo hay un implementador y se importa directo | Buscar imports de `storage/memory.ts` desde fuera de su carpeta | Cambio de motor cuesta tocar N archivos en vez de uno |
| ADR dice "sin dependencia X", `package.json` la trae como transitiva | `npm ls X` + revisión de devDependencies | Decisión escrita, decisión incumplida sin saberlo |
| ADR dice "todos los endpoints autenticados", hay un endpoint público | Lista de routes + cruce con middleware de auth | Filtración de datos no detectada |
| ADR dice "convención de errores X", servicios devuelven null en algunos casos | Grep de `return null` vs throws | Cliente confundido por contratos inconsistentes |

> Regla mental: **el ADR sin verificación es deuda documentada**. Más caro que no tener ADR — porque hay quien lo cita como si se cumpliese.

### Cómo dirigir al agente a verificar consistencia

- **Lista los ADRs primero, código después.** "Lee `docs/architecture/`, lista los ADRs vigentes con su decisión en una frase". Después: "para cada uno, busca evidencia en el código de que se cumple".
- **Cita archivo y línea** en cada hallazgo de inconsistencia. Sin referencia concreta, la revisión no es accionable.
- **Distingue desviación intencional de accidental.** Si la desviación está documentada (en un comentario, en una nota), no es un olor; es un trade-off conocido.
- **Cierra con propuesta**, no solo diagnóstico. "Actualizar el ADR" o "actualizar el código" son dos respuestas válidas; lo que no vale es dejar la inconsistencia abierta.

---

## 10. Límites de la IA en arquitectura y necesidad de juicio técnico senior

La IA es **buen sparring de arquitectura** — enumera alternativas, redacta ADRs, detecta inconsistencias, mantiene memoria del repo. Pero hay decisiones que **no se delegan**, ni siquiera parcialmente, porque dependen de contexto que no está en el código.

Lo que la IA **no** decide en arquitectura:

- **Qué evoluciona el producto en los próximos 12 meses.** Lo sabe producto y negocio, no el repo.
- **Cuál es el coste real de pagar una migración ahora vs después.** Depende de calendario, equipo, ventana de mercado.
- **Qué deuda arquitectónica se asume conscientemente.** Decisión política dentro del equipo, no técnica.
- **Cuándo un módulo crítico se reescribe vs se parchea.** Riesgo no compresible a métricas del repo.
- **Qué patrones encajan con la cultura del equipo.** Inyección de dependencias por constructor es bonita si el equipo la entiende; tóxica si no.
- **Si una decisión vale la pena para un equipo pequeño con scope acotado.** YAGNI lo decide quien conoce el roadmap, no el agente.

Lo que la IA **sí** hace bien en arquitectura:

- Enumerar alternativas con trade-offs cuando los ejes se le anclan explícitamente.
- Redactar el borrador de ADR siguiendo el formato del repo.
- Detectar imports cruzados, capas filtradas, abstracciones sin segundo consumidor.
- Cruzar ADRs vigentes contra el código para encontrar deriva.
- Mantener una memoria del repo más fiable que la del humano que viene una vez al mes a tocar el código.

> Regla mental: **la IA acelera el análisis y la redacción; el juicio técnico senior firma la decisión**. Un agente que decide solo está saltándose el paso donde un humano asume la responsabilidad — y la responsabilidad arquitectónica es lo que un seniorato técnico aporta de verdad.

| Decisión arquitectónica típica | ¿Quién decide? | ¿Qué aporta Claude? |
|---|---|---|
| Sustituir storage in-memory por SQLite | Tech lead + equipo | Tabla de alternativas, ADR redactado, plan de migración |
| Promover una abstracción a librería compartida | Tech lead + plataforma | Análisis de consumidores actuales, contrato propuesto |
| Aceptar deuda arquitectónica para llegar a una release | Producto + tech lead | Lista de la deuda con coste estimado |
| Reescribir un módulo legacy | Tech lead + dueño del módulo | Auditoría del módulo, casos cubiertos, plan de coexistencia |
| Adoptar un patrón nuevo (Strategy, Adapter) | Equipo técnico | Justificación de necesidad, ejemplos de aplicación en el repo |
| Eliminar una capa | Tech lead | Análisis de imports cruzados, propuesta de plan paso a paso |

***

## Resumen

- **Exploración antes que implementación.** 2–4 alternativas con trade-offs en ejes acordados; recomendación con lo que se pierde, no solo con lo que se gana.
- **Trade-offs honestos.** No se optimizan simplicidad, extensibilidad y coste de cambio a la vez. Elegir 1–2 ejes por decisión y declarar los otros.
- **Patrones presentes antes que patrones nuevos.** Si el repo ya tiene Repository sin llamarse así, se respeta; no se añade capa para "formalizar".
- **ADRs concretos.** Contexto con datos del repo, decisión en presente imperativo, consecuencias con qué se gana, qué se pierde y qué queda por verificar.
- **Deuda arquitectónica medida.** Antes de la siguiente feature, qué nos va a morder primero. Sin medirlo, las features se entregan con factura escondida.
- **Consistencia diseño ↔ código.** ADR sin verificación es deuda documentada — más cara que no tener ADR.
- **La IA acelera, el humano firma.** Alternativas, ADRs, auditorías sí; decisiones que dependen del producto, del equipo o del calendario no.
