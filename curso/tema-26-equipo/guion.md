# Tema 26 — Trabajo en equipo, estándares compartidos y gobierno de uso de Claude Code en organizaciones

> Duración estimada: 90 min · Tipo: conceptual + demos guiadas.
> Repositorio de prácticas: rama `tema-26/inicio` (Notebox con `docs/governance/POLITICA-CLAUDE-CODE.md` plantada deliberadamente vaga, `CLAUDE.md` con convenciones de equipo, `.claude/settings.json` versionado con reglas mezcladas, `docs/governance/MANAGED-SETTINGS-EJEMPLO.json` como referencia, `docs/governance/RUBRICA-REVIEW.md`, `docs/governance/PLANTILLA-DDR.md` y `.claude/auditoria/decisiones.md` con entradas de ejemplo dimensionadas a propósito — una granular, una vaga, una razonable).

## 0. Objetivo del tema

Cerrar el bloque de gobernanza: que el alumno pase de "yo uso Claude Code" a "este equipo usa Claude Code con reglas comunes". Sabe **dónde vive cada regla** (managed, project, `CLAUDE.md`), qué se delega y qué no, cómo se reparten responsabilidades entre dev, reviewer y tech lead, y cómo se deja trazabilidad ligera de decisiones críticas para que la adopción resista la rotación.

---

## 1. Flujo de sesión

Estructura **intercalada** — cada bloque (política / distribución / trazabilidad) es una pieza autónoma y el ejercicio aplica el patrón en caliente sobre el repo plantado. Los tres ejercicios entregan `.md`; no se modifica código fuente.

```
00:00 — Encuadre                                            (5 min)
00:05 — Demo 1: auditar la política plantada                (10 min)
00:15 — Ejercicio 1: POLITICA-CLAUDE-CODE-V2.md             (25 min, en clase)
00:40 — Demo 2: distribuir reglas managed/project/CLAUDE.md (10 min)
00:50 — Ejercicio 2: DISTRIBUCION-REGLAS.md                 (25 min, en clase)
01:15 — Demo 3: trazabilidad de decisiones críticas         (10 min)
01:25 — Ejercicio 3: TRAZABILIDAD-DECISIONES.md             (25 min, en clase)
01:50 — Cierre y puente al Tema 27                          (5 min)
```

> Nota de timing: el contenido base es ~110 min. Para 90 min, recortar los ejercicios a 20 min cada uno (basta para tabla principal + 1 sección extra). El aprendizaje más rentable está en E1 (política operativa) y E2 (distribución de reglas) — E3 puede quedar como práctica parcial si va apretado.

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "Hasta aquí habéis aprendido a usar Claude Code como devs individuales. Hoy cerramos el bloque: cómo lo usa **un equipo**. La diferencia no es trivial — el individuo se beneficia de la velocidad; el equipo se beneficia de la **consistencia**. Y la consistencia no se consigue con buenos propósitos: se materializa en artefactos versionados. Política, settings, `CLAUDE.md`, skills, log de decisiones. Lo que no está en un archivo no se aplica."

Tres ideas en pizarra:

1. **Cada regla tiene un sitio.** Managed para lo no negociable de la org. Project para el contrato del repo. `CLAUDE.md` para convenciones. User/local para preferencias personales. Si una regla está en el sitio equivocado, o se incumple o asfixia.
2. **La política es operativa, no aspiracional.** Tres bloques: permitido, con review, prohibido. Si una línea necesita interpretarse para aplicarse, está mal escrita. La política se mide en "¿puedo hacer X mañana sin preguntar?".
3. **La adopción se codifica.** Lo que vive en la cabeza del dev senior se rompe si rota. Lo que vive en `CLAUDE.md`, en settings, en logs de decisiones — sobrevive. El test de resiliencia del equipo: ¿si rota el dev que más sabe de IA, qué se rompe?

> "Vais a tocar **tres ramas**. La primera es auditar una política de uso que el equipo plantó deliberadamente vaga — vais a reescribirla para que sea operativa. La segunda es distribuir reglas entre managed, project y `CLAUDE.md` con criterio. La tercera es diseñar el mecanismo de trazabilidad de decisiones críticas. Los tres ejercicios entregan `.md`. No se toca código."

---

## 3. Demo 1 + Ejercicio 1 — Auditar la política plantada (≈ 35 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-26/inicio && npm install && npm test`. Verificar que `docs/governance/POLITICA-CLAUDE-CODE.md`, `CLAUDE.md` y `.claude/settings.json` están en su sitio. Abrir el REPL desde la raíz.

**Prompt literal (dentro del REPL):**

```
Lee docs/governance/POLITICA-CLAUDE-CODE.md, .claude/settings.json y
CLAUDE.md. Dame 5 vaguedades concretas de la política: secciones que
un dev nuevo no sabría aplicar mañana sin preguntar. Para cada una:
cita textual, por qué es vaga, propuesta de reformulación operativa.
```

(esperar — debe identificar frases tipo "usar la IA responsablemente", "tener cuidado con código generado", "consultar al equipo si hay duda")

```
¿Hay alguna regla de la política que el .claude/settings.json
contradiga (permite lo que la política prohíbe, o prohíbe lo que la
política permite)? Lista las contradicciones con archivo y línea.
```

(esperar — el repo está plantado con al menos una contradicción real: la política dice "no leer .env", el settings permite leer `.env.example`. Marcar si el agente confunde uno con otro.)

```
¿Qué tareas habituales de un dev del Notebox NO están cubiertas en
la política? Pensad en: tocar storage/memory.ts, modificar
package.json, escribir tests, cambiar .env. Para cada hueco: en qué
bloque debería ir (permitido / con review / prohibido) y por qué.
```

(esperar — la política plantada no menciona ni `package.json`, ni migraciones ni `services/`)

```
Dame 3 cambios concretos a la política, priorizados por impacto. Cada
cambio: sección a modificar, texto antes, texto después, qué evita.
```

(esperar)

```
¿Qué partes de la política dejarías como están y por qué? Una
política que se reescribe entera cada trimestre no se aplica.
```

Lo que el alumno ve:

- Las vaguedades son **citas textuales**, no resúmenes. Si el agente dice "la sección X es vaga" sin pegar el texto exacto, redirigir: "cita la frase concreta".
- Las contradicciones aparecen con archivo y línea de ambos lados. Sin esa pareja, no son accionables.
- Los huecos se identifican desde tareas reales (modificar `services/`, añadir dependencia, cambiar `.env`) — no desde categorías abstractas.
- Si el agente quiere reescribir toda la política, cortar: "3 cambios priorizados, no rewrite".

> "Una política mal escrita es peor que no tener política: da falsa seguridad de que el equipo está alineado cuando cada dev la interpreta como quiere. La política operativa se mide en cuánto tarda un dev en saber qué hacer mañana sin preguntar."

### Ejercicio 1 (25 min)

> **Rama:** `git checkout tema-26/ejercicio-01`

Los alumnos:

1. Verifican `npm install && npm test`. Todo en verde (incluido el smoke test `governance-fixtures.test.ts` que valida que los archivos plantados existen y tienen la forma esperada).
2. Leen `docs/governance/POLITICA-CLAUDE-CODE.md`, `CLAUDE.md` y `.claude/settings.json`.
3. Auditan la política con los prompts de la demo (vaguedades, contradicciones, huecos).
4. Reescriben las 3 secciones más rentables aplicando los cambios.
5. Entregan `POLITICA-CLAUDE-CODE-V2.md` en la raíz con:
   - Tabla de vaguedades detectadas (cita textual, problema, reformulación).
   - Contradicciones encontradas (política dice X, settings dice Y, con cita).
   - Huecos identificados (mínimo 3 tareas no cubiertas en la política plantada).
   - Política reescrita aplicando los 3 cambios más rentables.
   - Sección "Qué dejo igual y por qué" con al menos 2 puntos justificados.

**Lo que el formador observa:**

- ¿Citan textual o resumen? Si dicen "la sección de seguridad es vaga" sin texto, redirigir.
- ¿La contradicción es real o inventada? Si el agente confunde `.env` con `.env.example`, señalarlo — la auditoría tiene que ser precisa.
- ¿Reescriben la política o solo la critican? El entregable incluye texto nuevo, no solo diagnóstico.
- ¿La sección "qué dejo igual" es de verdad o es relleno? Una política que se mantiene es la que no se reescribe entera cada vez.

> "Pregunta de control: dentro de 6 meses, un dev nuevo llega al repo y lee la política. ¿Sabe qué hacer mañana sin preguntar? Si la respuesta es no, no es política — es manifesto."

---

## 4. Demo 2 + Ejercicio 2 — Distribución de reglas managed/project/`CLAUDE.md` (≈ 35 min)

### Demo 2 (10 min)

> Setup: `git checkout tema-26/inicio`. Verificar `.claude/settings.json`, `CLAUDE.md` y `docs/governance/MANAGED-SETTINGS-EJEMPLO.json`. Recordar la jerarquía: managed > project > user; settings.json restringe, `CLAUDE.md` orienta.

**Prompt literal (dentro del REPL):**

```
Lee .claude/settings.json, CLAUDE.md y
docs/governance/MANAGED-SETTINGS-EJEMPLO.json. Lista todas las reglas
activas con (a) qué imponen, (b) en qué archivo viven hoy, (c) a quién
afectan (este repo, toda la org, este dev).
```

(esperar — el inventario debe distinguir tipos de regla, no mezclarlos en lista plana)

```
Para cada regla, di si está en el sitio correcto o si debería estar
en otro nivel. Criterios: managed para reglas no negociables de la
org, project para contratos del repo, CLAUDE.md para convenciones,
user para preferencias personales. Justifica cada movimiento.
```

(esperar — el repo está plantado con al menos: un deny de `.env` que sería razonable en managed, una convención de idioma de respuesta en settings.json que debería estar en `CLAUDE.md`)

```
¿Hay reglas que están escritas como prosa en CLAUDE.md pero podrían
imponerse técnicamente en settings.json (allow/deny, hook)? Listarlas
con propuesta de conversión.
```

(esperar — debe identificar al menos una "convención" del `CLAUDE.md` que en realidad es un `deny` natural)

```
¿Hay reglas que están en settings.json pero deberían ser convención
(porque settings.json no las puede imponer realmente)? Por ejemplo:
"el modelo prefiere respuestas cortas" no es una regla, es una
convención de CLAUDE.md.
```

(esperar)

```
Resume el plan en una tabla: regla, sitio actual, sitio propuesto,
motivo. Máximo 8 filas. Si la tabla tiene más, agrupa por categoría.
```

Lo que el alumno ve:

- El inventario distingue qué es regla técnica (impuesta por settings) y qué es convención (escrita en `CLAUDE.md`). Si el agente los mezcla, redirigir: "una columna por tipo".
- El criterio managed/project/`CLAUDE.md` se aplica con preguntas operativas: ¿aplica a toda la org? ¿solo este repo? ¿es convención humana?
- Si el agente propone "todo a managed", cortar: managed es restricción no negociable, no contenedor universal.
- Las reglas mal expresadas son las más interesantes — la prosa que se podría imponer técnicamente, o el setting técnico que es realmente convención.

> "El error más común de adopción no es 'no tener reglas' — es tener reglas en el sitio equivocado. Una convención impuesta como permission crea fricción; un permission escrito como convención se incumple. La distribución correcta es la que reduce ambos riesgos."

### Ejercicio 2 (25 min)

> **Rama:** `git checkout tema-26/ejercicio-02`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Auditan `.claude/settings.json`, `CLAUDE.md` y `MANAGED-SETTINGS-EJEMPLO.json` con los prompts de la demo.
3. Entregan `DISTRIBUCION-REGLAS.md` en la raíz con:
   - Tabla completa de reglas (regla, sitio actual, sitio propuesto, motivo).
   - Mínimo 2 reglas que conviene **subir a managed** (con justificación de por qué son no negociables a nivel org).
   - Mínimo 2 reglas que conviene **bajar a `CLAUDE.md`** (con justificación de por qué son convención y no restricción técnica).
   - Mínimo 2 reglas **mal expresadas** (prosa que debería ser técnica, o técnica que debería ser convención).
   - Una frase de justificación por cada decisión.

**Lo que el formador observa:**

- ¿Distinguen regla técnica de convención? Si tratan todo como "regla", el ejercicio no se ha entendido.
- ¿Suben todo a managed por defecto? Redirigir: managed es restricción no negociable, no contenedor universal.
- ¿Cada movimiento tiene justificación operativa o es preferencia? "Esto debería ir aquí porque queda mejor" no es justificación.
- ¿Detectan las reglas mal expresadas o las pasan por alto? Es el punto más rentable — un setting que no se puede imponer o una convención que se podría imponer son señales de adopción inmadura.

> "Cuando un equipo tiene una regla en el sitio equivocado, pasa una de dos cosas: o el equipo la incumple sin darse cuenta, o pierde tiempo justificando excepciones. Ambas son señales de que la regla no estaba en el nivel correcto."

---

## 5. Demo 3 + Ejercicio 3 — Trazabilidad de decisiones críticas (≈ 35 min)

### Demo 3 (10 min)

> Setup: `git checkout tema-26/inicio`. Verificar `.claude/auditoria/decisiones.md` (con 3 entradas plantadas: una demasiado granular, una vaga, una razonable) y `docs/governance/PLANTILLA-DDR.md`.

**Prompt literal (dentro del REPL):**

```
Lee .claude/auditoria/decisiones.md. Para cada una de las 3 entradas:
¿es ruido (demasiado granular, no aporta), está bien dimensionada, o
es vaga (no se puede reconstruir el razonamiento)? Justifica con
citas textuales del log.
```

(esperar — el agente debe identificar: entrada 1 demasiado granular tipo "le pedí a Claude que renombrase una variable", entrada 2 vaga tipo "decidimos cambiar el storage", entrada 3 razonable)

```
Dado el repo Notebox (Express + storage in-memory + servidor MCP +
plugin local), lista 5 tipos de cambio que SÍ se auditarían y 5 que
NO. Criterio: blast radius real, no preferencia. Para cada tipo, una
frase de por qué.
```

(esperar — los "sí" deben ser cambios de impacto: arquitectura, auth, migraciones, deps críticas; los "no" deben ser locales: refactor, tests, docs)

```
Diseña el formato canónico de una entrada de .claude/auditoria/decisiones.md
para cambios de blast radius alto. Campos mínimos, ejemplo concreto
sobre uno de los cambios anteriores del repo (ej. "decidir si la
validación vive en routes o services"). Máximo 8 líneas por entrada.
```

(esperar — campos esperados: fecha, decisión, contexto, prompts usados, firmante humano, ADR/DDR relacionado)

```
¿Quién escribe la entrada, cuándo, quién la revisa? Sin un dueño y un
trigger, el log se queda obsoleto. Define el ciclo en 3 frases.
```

(esperar)

```
Lista 3 antipatrones que harían inservible este mecanismo (ej.
loggear cada prompt, escribir entradas vacías para cumplir,
abandonar el log a los 2 meses). Una contramedida concreta por
antipatrón.
```

Lo que el alumno ve:

- El diagnóstico es **con cita textual** del log plantado. Si el agente dice "la entrada 2 es vaga" sin pegar el texto, redirigir.
- La distinción "se audita / no se audita" sigue criterio de blast radius. Si el agente quiere auditar refactors locales, cortar: eso es ruido.
- El formato canónico es **ejecutable en 8 líneas**. Si el agente propone una plantilla de 15 campos, nadie la rellena.
- El ciclo de mantenimiento define dueño y trigger. Sin eso, cualquier log se abandona.

> "Auditar no es vigilar — es dejar rastro suficiente para reconstruir el razonamiento 6 meses después. Si nadie puede responder 'quién decidió esto y con qué evidencia', la trazabilidad está rota — aunque todo el mundo se acuerde ahora."

### Ejercicio 3 (25 min)

> **Rama:** `git checkout tema-26/ejercicio-03`

Los alumnos:

1. Verifican `npm install && npm test`.
2. Auditan el log plantado en `.claude/auditoria/decisiones.md` y leen `PLANTILLA-DDR.md`.
3. Diseñan el mecanismo con los prompts de la demo.
4. Entregan `TRAZABILIDAD-DECISIONES.md` en la raíz con:
   - Diagnóstico de las 3 entradas plantadas (cuál es ruido, cuál vaga, cuál razonable, **con cita textual**).
   - Lista de qué se audita y qué no para el Notebox (5+5 tipos de cambio, justificados por blast radius).
   - Formato canónico final de entrada (máximo 8 líneas, con ejemplo real sobre el repo — por ejemplo, "decidir si validación va en routes o services").
   - Ciclo de mantenimiento (quién escribe, cuándo, qué trigger, quién revisa).
   - 3 antipatrones con contramedida concreta cada uno.

**Lo que el formador observa:**

- ¿Las citas son textuales? Si dicen "entrada 2 es vaga" sin pegar la frase, redirigir.
- ¿La lista "se audita / no se audita" sigue criterio de blast radius o es preferencia? "Esto suena importante" no es criterio.
- ¿El formato canónico cabe en 8 líneas? Las plantillas largas no se aplican.
- ¿Definen dueño Y trigger del ciclo? Sin los dos, el mecanismo se abandona a los 2 meses.
- ¿Los antipatrones tienen contramedida concreta o son lista de quejas? "Loggear todo es malo" sin contramedida es ruido.

> "Una pregunta de control: si rota el tech lead del equipo en 3 meses, ¿el log es reconstruible para quien venga después? Si la respuesta es no, el mecanismo no resiste rotación — y la trazabilidad sin resiliencia es ilusión de control."

---

## 6. Cierre y puente al Tema 27 (≈ 5 min)

Resumen en pizarra (4 bullets):

1. **Reglas en su sitio.** Managed > project > user; settings restringe, `CLAUDE.md` orienta.
2. **Política operativa.** Tres bloques: permitido / con review / prohibido. Sin interpretar.
3. **Trazabilidad ligera.** Lo que tiene blast radius se anota; lo demás se confía al commit. Sin dueño y trigger, ningún log sobrevive.
4. **Adopción codificada.** Lo que no está en un artefacto versionado desaparece con quien lo sabía. Política, settings, `CLAUDE.md`, skills, log, rúbrica.

Frase de cierre del bloque T19–T26:

> "Habéis cerrado el bloque de gobernanza. Empezamos en el Tema 19 con subagentes, llegamos a MCP, plugins, CLI avanzada, Docker, CI/CD, arquitectura — y hemos terminado en gobierno de equipo. Lo que en los primeros temas era 'cómo uso yo Claude Code' aquí se ha convertido en 'cómo lo usa un equipo con consistencia que resiste rotación'."

Frase de puente al Tema 27:

> "El Tema 27 es el proyecto final. Vais a integrar TODO lo anterior — política, settings, `CLAUDE.md`, skills, subagentes, MCP, plugins, revisión asistida — sobre un repositorio real. Hoy hemos cerrado el marco; el Tema 27 lo aplica de principio a fin sobre código que importa."

---

## 7. Notas para el formador

### Requisitos técnicos

- Rama `tema-26/inicio` con `npm install && npm test` en verde antes de empezar la sesión.
- Verificar que `docs/governance/`, `CLAUDE.md`, `.claude/settings.json`, `.claude/auditoria/decisiones.md` están plantados.
- Verificar que el smoke test `test/governance-fixtures.test.ts` pasa: valida que los archivos existen y tienen la forma esperada.

### Errores comunes

- **Alumnos que reescriben toda la política en E1.** Redirigir: el ejercicio pide priorizar 3 cambios. Una política reescrita entera no se mantiene.
- **Alumnos que tratan todo como managed en E2.** Redirigir: managed es no negociable a nivel org. Un repo pequeño no necesita managed para casi nada.
- **Alumnos que diseñan una plantilla de auditoría de 15 campos en E3.** Redirigir: las plantillas largas no se rellenan. 8 líneas máximo.
- **Alumnos que confunden contradicción real con contradicción aparente** (ej. `.env` vs `.env.example`). Insistir en cita textual de ambos lados.

### Preguntas trampa esperables

- "¿Y si nuestra organización no tiene managed settings?" → La pregunta es válida: en ese caso project + `CLAUDE.md` cargan toda la responsabilidad. La práctica sigue siendo distribuirlas correctamente entre los niveles que sí existen.
- "¿Y si no auditamos nada, pasa algo?" → Hasta que pasa. La auditoría útil es la que no se nota cuando no hace falta y aparece cuando sí.
- "¿No es contradictorio pedir trazabilidad y odiar la burocracia?" → No: trazabilidad ligera es la que cubre blast radius alto sin granular el ruido. La burocracia es trazabilidad de todo, incluido lo trivial.

### Variantes de tiempo

- **Versión corta (60 min):** saltarse el E3 completo, hacer solo demo 3 como referencia. La trazabilidad puede quedar como lectura para casa.
- **Versión larga (120 min):** añadir un ejercicio extra en el que cada alumno propone una skill compartida para el equipo y se debate si entra al repo según criterios del Tema 9.

### Material a tener abierto

- Doc del tema (`docs/tema-26-equipo.md`).
- Repo Notebox en `tema-26/inicio`.
- Referencia a Tema 4 (settings y scopes) y Tema 7 (`CLAUDE.md`) para alumnos que lleguen sin haber repasado.
