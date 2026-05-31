# Tema 25 — Arquitectura, diseño de software y decisiones técnicas asistidas por IA

> Duración estimada: 90 min · Tipo: conceptual + demos guiadas.
> Repositorio de prácticas: rama `tema-25/inicio` (Notebox con `docs/architecture/` plantado: ADR-001 y ADR-002 escritos como referencia, dos decisiones pendientes — persistencia y validación —, y `DEUDA-CONOCIDA.md` con la lista de olores arquitectónicos reales del repo y la próxima feature planificada).

## 0. Objetivo del tema

Que el alumno use Claude Code como sparring de arquitectura: explora 2–4 alternativas con trade-offs en ejes acordados antes de implementar nada, redacta ADRs con el formato del repo (Contexto, Decisión, Consecuencias) anclados a archivos concretos, y detecta deuda arquitectónica con conexión operativa a la próxima feature. La IA acelera el análisis y la redacción; el juicio sobre qué entra al repo sigue siendo humano y se ejercita en clase.

---

## 1. Flujo de sesión

Estructura **intercalada**, como los Temas 22, 23 y 24. Cada bloque (alternativas / ADR / deuda) es una pieza autónoma y el ejercicio aplica el patrón en caliente sobre el repo.

```
00:00 — Encuadre                                          (5 min)
00:05 — Demo 1: alternativas de persistencia              (10 min)
00:15 — Ejercicio 1: opciones de persistencia razonadas   (30 min, en clase)
00:45 — Demo 2: ADR de validación en routes vs services   (10 min)
00:55 — Ejercicio 2: redactar ADR-003 completo            (30 min, en clase)
01:25 — Demo 3: deuda arquitectónica + plan mitigación    (10 min)
01:35 — Ejercicio 3: DEUDA-ARQUITECTONICA.md con plan     (30 min, en clase)
02:05 — Cierre y puente                                   (5 min)
```

> Nota de timing: la versión completa son ~125 min. Para 90 min, recortar los ejercicios a 20 min cada uno (suficiente para entregar la tabla principal sin la sección "qué dejo sin tocar") o, mejor, recortar el Ejercicio 3 a 15 min — el aprendizaje principal está en E1 (alternativas) y E2 (ADR formal). El E3 puede quedar como práctica guiada parcial.

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "Los temas anteriores nos llevaron del editor al pipeline. Hoy subimos un nivel: arquitectura. Y aquí Claude Code tiene un papel muy específico — sparring de exploración, redactor de ADRs, auditor de consistencia. Lo que NO hace bien: decidir solo. Una decisión arquitectónica buena necesita contexto que no está en el código — roadmap de producto, calendario del equipo, cultura técnica. La IA lo desconoce, y por eso hoy la usamos para acelerar el análisis y la redacción, pero la firma sigue siendo humana."

Tres ideas en pizarra:

1. **Exploración antes de implementación.** 2–4 alternativas reales con trade-offs en ejes acordados (simplicidad, coste de cambio, extensibilidad, riesgo). Recomendación con lo que se pierde, no solo con lo que se gana.
2. **ADRs concretos, no aspiracionales.** Contexto con datos del repo (archivos, líneas), Decisión en presente imperativo, Consecuencias con qué se gana / qué se pierde / qué queda por verificar.
3. **Deuda arquitectónica medida.** Antes de la siguiente feature, qué nos va a morder primero. Sin medirlo, las features se entregan con factura escondida.

> "Hoy vais a tocar **tres ramas**: una para explorar alternativas de persistencia (decisión pendiente plantada en el repo), otra para redactar un ADR completo sobre validación de input, otra para auditar la deuda arquitectónica con conexión a la próxima feature. Los tres ejercicios entregan `.md` — no se modifica código fuente. La pregunta de hoy es: **¿qué decisión arquitectónica firmáis y con qué evidencia?**"

---

## 3. Demo 1 + Ejercicio 1 — Alternativas de diseño (≈ 40 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-25/inicio && npm install && npm test`. Verificar que `docs/architecture/PENDING-001-persistencia.md` existe junto a los ADR-001 y ADR-002. Abrir el REPL desde la raíz del repo.

**Prompt literal (dentro del REPL):**

```
Lee docs/architecture/PENDING-001-persistencia.md y src/storage/memory.ts.
Dame 3 alternativas reales para sustituir el storage in-memory por algo
persistente. Para cada alternativa: una frase de qué es, qué cambia en
el código (qué archivos toca, qué interfaz se mantiene).
```

(esperar — deben aparecer 3 opciones distinguibles: SQLite embebido, Postgres en contenedor, fichero JSON en disco — no variantes de la misma)

```
Para esas 3 alternativas, dame una tabla con columnas: coste de
implementación (alto/medio/bajo), coste de cambio futuro, riesgo,
simplicidad operativa, encaje con la capa services/ actual. Una frase
por celda.
```

(esperar — debe haber al menos una celda con un trade-off honesto, no todas a favor)

```
Recomienda una de las 3 dado este contexto: Notebox sigue siendo
ejemplo de curso pero queremos demostrar persistencia real sin
complicar el arranque. La recomendación tiene que justificarse en los
ejes de la tabla, no en preferencia personal.
```

(esperar — la recomendación debe nombrar lo que se pierde)

```
¿Cuál de las 3 alternativas descartarías primero y por qué? Si todas
son razonables, dilo — pero da una jerarquía clara.
```

(esperar)

```
No escribas código aún. Resume en 3 bullets qué decisión queda
pendiente y qué información me falta para tomarla.
```

Lo que el alumno ve:

- Las 3 alternativas deben ser **realmente distintas** (motor + medio): SQLite (fichero embebido), Postgres (servidor externo), JSON en disco (sin SGBD). Si el agente da "Postgres / Postgres con pool / Postgres en RDS", redirigir.
- Los trade-offs deben usar los **ejes anclados en el prompt**. Si el agente añade "elegancia" o "popularidad", redirigir.
- La recomendación debe nombrar **lo que se sacrifica**. Si dice "SQLite, es la mejor", sin contras, pedir "qué pierdes con SQLite frente a Postgres".
- Si el agente salta a implementar, cortar y volver a la exploración. **Hoy no se toca código**.

> "Esto es la conversación que tendríais en una sesión de diseño antes de tocar nada. La diferencia con tener al agente es que la tabla aparece en 30 segundos, no en 30 minutos. Vuestro trabajo es **anclar los ejes** y **forzar el contra-argumento** — sin eso, la IA da respuestas de blog."

### Ejercicio 1 (30 min)

> **Rama:** `git checkout tema-25/ejercicio-01`

Los alumnos:

1. Verifican `npm install && npm test`. Todo en verde (incluido el smoke test `architecture-fixtures.test.ts` que valida que los archivos plantados existen).
2. Leen `docs/architecture/PENDING-001-persistencia.md` y `src/storage/memory.ts`.
3. Piden las 3 alternativas con el primer prompt. Verifican que son **realmente distintas**.
4. Piden la tabla de trade-offs con los ejes acordados (coste de implementación, coste de cambio, riesgo, simplicidad operativa, encaje con services/).
5. Recomiendan una alternativa con justificación **y lo que se pierde**.
6. Identifican qué alternativa descartarían primero y por qué.
7. Rellenan `OPCIONES-PERSISTENCIA.md` en la raíz con:
   - Tabla de alternativas (mínimo 3) con trade-offs por eje.
   - Recomendación razonada (mínimo 5 líneas), con lo que se gana y lo que se pierde.
   - Alternativa descartada con motivo.
   - Sección "Qué información me falta para decidir" — al menos 2 puntos concretos (ej. "no sé cuántas notas espera tener un usuario en producción", "no sé si hay restricciones de cumplimiento sobre dónde viven los datos").

**Lo que el formador observa:**

- ¿Anclan los ejes en el prompt o aceptan la primera tabla genérica? Empujar a "trade-offs por eje acordado, no genéricos".
- ¿La recomendación solo enumera ventajas? Forzar la pregunta "qué pierdes con esa elección".
- ¿La sección "qué me falta para decidir" es seria o es relleno? "No estoy seguro" no cuenta. "No conozco el coste operativo de mantener Postgres en producción" sí.
- ¿Algún alumno propone una 4ª alternativa que el agente no había dado (ej. KV embebido tipo LMDB, redis local)? Excelente — apuntar como práctica avanzada.

> "El alumno que entrega 'todas las alternativas son buenas, depende' no ha hecho el ejercicio. **Depende de qué** es la pregunta que tenéis que contestar — y eso obliga a poner pesos a los ejes."

---

## 4. Demo 2 + Ejercicio 2 — Redacción de un ADR completo (≈ 40 min)

### Demo 2 (10 min)

> Setup: `git checkout tema-25/inicio`. Verificar que existe `docs/architecture/PENDING-002-validacion-en-routes-o-services.md` con el dilema planteado, y que los ADR-001 y ADR-002 están como modelo de formato.

**Prompt literal (dentro del REPL):**

```
Lee docs/architecture/PENDING-002-validacion-en-routes-o-services.md,
src/routes/notes.ts y src/services/notes.ts. Resume en 5 bullets el
estado actual: dónde se valida hoy, dónde no, qué inconsistencias
hay entre rutas. Sin proponer todavía.
```

(esperar — el agente debe identificar que la validación es inconsistente entre POST `/notes` y `archive`/`unarchive`)

```
Dame dos opciones concretas: (A) toda la validación en routes,
(B) toda la validación en services. Trade-offs en ejes simplicidad,
coste de cambio y testabilidad. Una columna por opción.
```

(esperar)

```
Recomienda una de las dos para este repo dado que (1) la API es
pequeña, (2) queremos reusar la lógica desde el servidor MCP del
Tema 20, (3) los tests de services ya existen. Justifica.
```

(esperar — la recomendación racional es services, por el reuso del MCP)

```
Genera ADR-003 en docs/architecture/ siguiendo exactamente el formato
de ADR-001 (Contexto, Decisión, Consecuencias). Decisión en presente
imperativa. Consecuencias incluye qué se gana, qué se pierde y qué
queda por verificar. Máximo media página.
```

(esperar)

```
¿El ADR-003 propuesto contradice algo de los ADR-001 o ADR-002 ya
escritos? Si entran en conflicto, márcalo explícitamente — un ADR
nuevo no se silencia con uno viejo, lo deprecia.
```

Lo que el alumno ve:

- "Decisión" debe estar en **presente imperativo**: "La validación de input vive en `services/`". Si el agente escribe "se considera mover" o "deberíamos plantearnos", redirigir.
- "Consecuencias" debe tener **tres sub-bloques implícitos**: qué se gana, qué se pierde, qué queda por verificar. Si solo hay ventajas, el ADR está incompleto.
- El ADR debe **citar archivos concretos** (`src/routes/notes.ts`, `src/services/notes.ts`, `mcp-servers/notebox/server.js`), no hablar en abstracto.
- Si el ADR-003 contradice un ADR anterior, debe **decirlo explícitamente**. Lo contrario es deuda documental.

> "El ADR es un acta de decisión — no un brainstorming, no una propuesta. Tres bloques, presente imperativo, archivo citado. Si vuestro ADR sobrevive a borrar la sección 'Consecuencias', no es ADR, es nota."

### Ejercicio 2 (30 min)

> **Rama:** `git checkout tema-25/ejercicio-02`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Recogen el contexto del repo con el primer prompt (sin proponer).
3. Piden las dos opciones con trade-offs anclados a ejes.
4. Deciden con los criterios del repo (reuso desde MCP, tests existentes, simplicidad).
5. Generan `docs/architecture/ADR-003-validacion-de-input.md` siguiendo el formato exacto de ADR-001 y ADR-002.
6. Actualizan `docs/architecture/README.md` añadiendo la nueva entrada al índice (la rama trae el `README.md` con ADR-001 y ADR-002 listados; el alumno añade ADR-003).
7. Verifican coherencia con los ADRs anteriores. Si hay conflicto, lo declaran explícitamente.

**Lo que el formador observa:**

- ¿Decisión en presente imperativo o aspiracional? **Crítico** — pedir reformulación si dice "deberíamos" o "se propone".
- ¿Las Consecuencias tienen los tres sub-bloques (gana / pierde / por verificar) o solo ventajas? Si falta "se pierde", el ADR está sesgado.
- ¿Cita archivos del repo o habla en abstracto? Sin grep posible, el ADR flota.
- ¿Actualiza el `README.md` del índice o solo crea el archivo nuevo? El índice es parte del entregable — un ADR no listado es un ADR perdido.
- ¿Alguien propone marcar el ADR como "Aceptado" / "Propuesto"? Bonus — apuntar como práctica avanzada de gobernanza arquitectónica.

> "Una pregunta de control: dentro de 6 meses, un dev nuevo llega al repo y abre `docs/architecture/`. ¿Entiende vuestra decisión sin tener que preguntar a nadie? Si la respuesta es no, el ADR está incompleto."

---

## 5. Demo 3 + Ejercicio 3 — Deuda arquitectónica y plan de mitigación (≈ 40 min)

### Demo 3 (10 min)

> Setup: `git checkout tema-25/inicio`. El repo tiene deuda real plantada: `services/notes.ts` con anidamiento profundo (5 niveles en `archive`/`unarchive`), búsqueda `case-sensitive` en `src/search/index.ts`, validación inconsistente entre rutas, y storage acoplado por import directo desde `services/`. Existe `docs/architecture/DEUDA-CONOCIDA.md` con el contexto y la próxima feature planificada (paginación de `/notes`).

**Prompt literal (dentro del REPL):**

```
Lee src/ completo y docs/architecture/DEUDA-CONOCIDA.md. Dame los
top 5 olores arquitectónicos del repo, ordenados por coste real si
los dejamos. Para cada uno: archivo y línea, tipo de deuda (capa
filtrada / god module / duplicación / etc.), estimación de líneas
tocadas si lo arreglo ahora vs en 6 meses (orden de magnitud).
```

(esperar — debe identificar al menos: anidamiento en archive/unarchive, search case-sensitive, validación inconsistente, import directo de storage desde services, naming inconsistente de errores)

```
Si la próxima feature es añadir paginación a GET /notes (límite +
offset), ¿qué deuda de las anteriores nos va a morder primero?
Justifica con archivos concretos.
```

(esperar — el agente debe conectar con `services/notes.ts` y `storage/memory.ts`)

```
Para los 3 olores más rentables, dame un plan de mitigación
incremental. Cada paso: qué cambia, en qué archivo, qué tests cubren
ese cambio. Sin reescrituras completas — pasos chiquitos.
```

(esperar)

```
Revisa el plan. ¿Algún paso introduce abstracción sin segundo
consumidor, o crea una capa nueva sin justificación? Si sí,
propone una alternativa más directa.
```

(esperar — clave: detectar si el agente quiere meter un Repository nuevo donde ya hay storage)

```
Lista qué deuda dejas sin tocar en este sprint y por qué. La
priorización de lo que NO se arregla es tan importante como la de
lo que sí.
```

Lo que el alumno ve:

- El inventario debe **citar archivo y línea** del repo, no decir "el código está mal estructurado".
- La conexión con paginación debe ser **operativa**: para añadir `list(limit, offset)` en services, el anidamiento actual demuestra que la capa tiene problemas previos. Eso es lo que muerde primero.
- El plan de mitigación debe ser **incremental** — un cambio por paso, con tests existentes que lo cubren. Si el agente propone "refactor de toda la capa services", redirigir.
- "Qué dejo sin tocar" no puede estar vacío. Decidir no actuar también es arquitectura.

> "La deuda arquitectónica es como la fiscal: lo que no pagas se compone. La pregunta no es '¿hay deuda?' — siempre hay. Es '¿qué deuda nos va a morder en la próxima feature, y vale la pena pagarla ahora vs después?'."

### Ejercicio 3 (30 min)

> **Rama:** `git checkout tema-25/ejercicio-03`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Auditan el repo con el primer prompt. Inventario priorizado (mínimo 5 olores).
3. Conectan con la feature de paginación. Cuál muerde primero.
4. Plan incremental para los 3 más rentables.
5. Verifican que el plan no introduce más deuda.
6. Rellenan `DEUDA-ARQUITECTONICA.md` con:
   - Tabla de los 5 olores: archivo, línea, tipo, coste ahora vs en 6 meses (orden de magnitud, no números absolutos).
   - Conexión con paginación: qué deuda muerde primero y por qué.
   - Plan incremental para los 3 más rentables: paso a paso, archivo tocado, test que cubre.
   - Sección "Qué dejo sin tocar y por qué" — al menos 2 puntos justificados.

**Lo que el formador observa:**

- ¿Citan archivos y líneas o hablan en abstracto? "El código está acoplado" no es deuda diagnosticada; "routes/notes.ts línea 6 valida title sin librería compartida" sí.
- ¿La conexión con paginación es operativa o decorativa? Si solo dice "la deuda nos afectará", redirigir a "qué archivo, qué línea, qué cambio".
- ¿El plan de mitigación es incremental o propone reescritura masiva? Si lo segundo, recordar la regla del Tema 12 (refactorización progresiva).
- ¿La sección "qué dejo sin tocar" tiene contenido real? "Búsqueda case-sensitive — no afecta a la próxima feature y es cambio trivial cuando toque" es válida; "todo lo demás se queda" no.
- ¿Algún alumno propone tests que aún no existen como condición previa al refactor? Excelente — la prudencia técnica senior se nota en eso.

> "Tres cambios este sprint, dos asumidos como deuda consciente. Si el `.md` no tiene esa segunda parte, no es una decisión de arquitectura — es una lista de buenos deseos."

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Exploración antes que implementación.** 2–4 alternativas reales con trade-offs en ejes anclados; recomendación con lo que se pierde, no solo con lo que se gana.
2. **ADRs concretos.** Contexto con archivos citados, decisión en presente imperativo, consecuencias con qué se gana, qué se pierde y qué queda por verificar.
3. **Deuda medida y conectada a la siguiente feature.** Inventario priorizado, plan incremental, qué dejo sin tocar y por qué.
4. **La IA acelera, el humano firma.** Análisis, redacción y auditoría sí; decisiones que dependen de producto, equipo o calendario no.

**Puente al Tema 26:**

> "Hemos llevado a Claude Code desde el editor (Temas 1-22), al contenedor (Tema 23), al pipeline (Tema 24) y a la mesa de arquitectura (hoy). En el Tema 26 cerramos el ciclo: cómo organiza un equipo el uso de Claude Code — estándares compartidos, políticas de revisión, gobernanza. Hasta ahora habéis trabajado individualmente; el Tema 26 es el manual de equipo."

---

## 7. Notas para el formador

- **Requisito técnico:** Node 24+ para los tests. El tema es conceptual: ningún ejercicio modifica código fuente — todos entregan `.md`. La verificación es lectura humana del documento entregado.

- **Pregunta típica:** *"¿No es mejor implementar y luego documentar la decisión?"* → No, para decisiones arquitectónicas. Una vez implementado, el sesgo de status quo hace que cuestionar la decisión sea muy caro. El ADR escrito **antes** de implementar es lo que mantiene la decisión revisable. Si la implementación demuestra que la decisión era errónea, se redacta el ADR de sustitución — pero al menos hay trazabilidad.

- **Pregunta típica:** *"El ADR no es burocracia para equipos pequeños?"* → Depende. En equipo de 1–2 personas con scope acotado, sí — la conversación basta. En cuanto el equipo crece o el código va a vivir más de 6 meses, el ADR ahorra más tiempo del que cuesta. La regla: si la decisión va a impactar a alguien que no estaba en la conversación, escribir el ADR.

- **Pregunta típica:** *"¿Cómo distingo deuda arquitectónica de preferencia estética?"* → La deuda tiene **coste operativo medible**: "cambiar el storage cuesta tocar 8 archivos", "añadir un test cuesta 1h porque los mocks son complejos". La preferencia estética es "no me gusta el estilo". Si el alumno no puede medir el coste, no es deuda — es opinión.

- **Pregunta típica:** *"¿Por qué no dejo que el agente decida cuando los trade-offs son claros?"* → Porque "claros" según el agente significa "claros con la información que tiene". El agente no sabe que el equipo cambia de cloud el próximo trimestre, ni que el tech lead va a salir, ni que producto va a girar el roadmap. Esas variables no están en el código y son las que más pesan en arquitectura.

- **Error común en el Ejercicio 1:** trade-offs genéricos sin pesos. "Postgres es más escalable, SQLite es más simple" — sin decir cuánto vale cada cosa en este repo concreto. Pedir reformulación con pesos numéricos o cualitativos (alto/medio/bajo) por eje.

- **Error común en el Ejercicio 2:** Decisión en condicional o aspiracional. "Se propone mover la validación a services". Pedir reformulación a presente imperativo: "La validación de input vive en `services/`". También: olvidar actualizar el `README.md` del índice de ADRs.

- **Error común en el Ejercicio 3:** plan no incremental. El alumno propone "refactorizar toda la capa services" en un paso. Recordar la regla del Tema 12: un cambio, una verificación. Tres pasos pequeños valen más que uno grande.

- **Si la sesión va sobrada:** pedir al alumno más rápido que añada un **ADR de sustitución** que deprecie ADR-001 (storage in-memory) a favor de la alternativa elegida en el Ejercicio 1. Es el ejercicio de "cómo se evoluciona la cadena de ADRs" — alta densidad pedagógica.

- **Sobre `.claude/skills/`:** sigue valiendo el patrón de temas anteriores. Las skills DEL AUTOR (`curso-tema-doc`, etc.) NO se trackean. Verificar antes de pushear.

- **Sobre la conexión con el Tema 14:** el Tema 14 introdujo ADRs como parte del paisaje documental. El Tema 25 los profundiza como **artefacto arquitectónico**. Si en clase preguntan por la diferencia: el Tema 14 enseñó **a escribir** ADRs; el Tema 25 enseña **a decidir** y luego escribir.

- **Sobre la conexión con el Tema 12:** la refactorización progresiva del Tema 12 es el músculo del plan de mitigación del Ejercicio 3. Si los alumnos lo recuerdan, se nota — los planes son incrementales por defecto.

- **Sobre la decisión "no hacer nada":** en arquitectura es una alternativa válida y muchas veces la correcta. Si ningún alumno la propone como alternativa al statu quo del storage in-memory, abrir el debate en clase — Notebox sigue siendo curso, in-memory puede ser la opción correcta durante años más.
