# Tema 19 — Subagentes, especialización de roles y trabajo distribuido

> Duración estimada: 90 min · Tipo: conceptual + demos guiadas.
> Repositorio de prácticas: rama `tema-19/inicio` (Notebox con subagentes `code-reviewer` y `security-auditor` ya plantados en `.claude/agents/`).

## 0. Objetivo del tema

Que el alumno sepa diseñar un subagente con rol acotado y tools restringidas, invocarlo en sesión, orquestar dos o más subagentes para una tarea segmentada, y decidir cuándo NO usar subagente (sobreorquestación).

---

## 1. Flujo de sesión

Estructura **intercalada**. Cada demo va seguida del ejercicio relacionado, porque cada subagente es una técnica autónoma y practicarla en caliente refuerza el hábito.

```
00:00 — Encuadre                                       (5 min)
00:05 — Demo 1: invocar un subagente plantado          (10 min)
00:15 — Ejercicio 1: revisar con code-reviewer         (15 min, en clase)
00:30 — Demo 2: crear un subagente con tools acotadas  (10 min)
00:40 — Ejercicio 2: diseñar test-coverage-auditor     (20 min, en clase)
01:00 — Demo 3: orquestar dos subagentes               (10 min)
01:10 — Ejercicio 3: diseñar un equipo de subagentes   (20 min, en clase)
01:30 — Cierre y puente                                (5 min)
```

---

## 2. Encuadre — lo que digo (≈ 5 min)

> "Hasta ahora hemos usado Claude Code como un solo agente: una sola sesión, todo el contexto del repo, todas las tools disponibles. Eso funciona para el día a día, pero **falla cuando la tarea se repite mucho** (review de PRs, auditoría de seguridad, generación de docs) o cuando **tiene fases distinguibles** (migración, refactor por capas). Hoy vamos a especializar el agente."

Tres ideas en pizarra:

1. **Subagente = rol con menos margen de improvisar**, no Claude más listo.
2. **Restringir tools es el corazón del diseño.** Si no restringes, no aporta.
3. **Equipo de agentes ≠ delegación ciega.** Tú decides el orden y revisas cada artefacto.

---

## 3. Demo 1 + Ejercicio 1 — Invocar un subagente plantado (≈ 25 min)

### Demo 1 (10 min)

> Setup: `git checkout tema-19/inicio`. Comprueba que `.claude/agents/code-reviewer.md` existe en el repo. Abre `src/services/notes.ts` (verás las funciones `archive` y `unarchive` con if/else anidados — basura clásica que un reviewer cazaría).

**Prompt literal:**

```
Usa el subagente code-reviewer para revisar el archivo
src/services/notes.ts. Quiero un informe en su formato habitual:
hallazgos por categoría (correctness, readability, scope) con
severidad y propuesta concreta. No edites nada todavía.
```

Lo que el alumno ve:

- El agente principal anuncia: "Delegando en `code-reviewer`...".
- El subagente devuelve **una tabla en el formato definido en su frontmatter / system prompt** (`.claude/agents/code-reviewer.md`): categoría, hallazgo, severidad, propuesta.
- No edita ni ejecuta tests — solo tiene `Read`, `Grep`, `Glob`.
- El output es **comparable con la próxima invocación**. Esa es la ganancia.

> "El valor no está en que detecte más cosas que tú. Está en que **siempre detecta las mismas cosas en el mismo formato**. La consistencia es la feature."

### Ejercicio 1 (15 min)

> **Rama:** `git checkout tema-19/ejercicio-01`

Los alumnos invocan el subagente `code-reviewer` plantado para auditar `src/services/notes.ts`. Comparan el output con lo que ellos mismos habrían escrito "a pelo" y rellenan en el `EJERCICIO.md` qué hallazgos se habrían escapado.

**Lo que el formador observa:**

- ¿Invocan el subagente explícitamente o le piden "revísame esto"?
- ¿Notan que el subagente respeta su restricción de tools (no edita)?
- ¿Identifican algún hallazgo del subagente que ellos no habrían señalado?

---

## 4. Demo 2 + Ejercicio 2 — Crear un subagente nuevo con tools restringidas (≈ 30 min)

### Demo 2 (10 min)

> Setup: `git checkout tema-19/inicio`. No existe `.claude/agents/docs-writer.md`.

**Prompt literal:**

```
Crea un subagente nuevo en .claude/agents/docs-writer.md que:
- Genere JSDoc para funciones públicas exportadas del módulo
  que se le pase como argumento.
- Solo tenga permitidas las tools: Read, Grep, Glob, Edit, Write.
- No pueda ejecutar Bash bajo ningún concepto.
- Devuelva al final un resumen de qué archivos tocó y por qué.

Después invócalo sobre src/storage/memory.ts y enséñame el diff
que propone.
```

Lo que el alumno ve:

- Claude propone el frontmatter YAML con la lista de tools.
- Al invocarlo sobre `memory.ts`, el subagente **solo edita comentarios**: no toca lógica.
- Si después se le pide "y ahora corre los tests", el subagente debe rebotar la petición.

> "El subagente no se rebela porque tenga 'voluntad'. Se rebela porque le hemos quitado las tools. La restricción no es una sugerencia: es la realidad técnica."

### Ejercicio 2 (20 min)

> **Rama:** `git checkout tema-19/ejercicio-02`

Los alumnos crean un subagente `test-coverage-auditor` en `.claude/agents/test-coverage-auditor.md` con tools que solo le permitan **leer código y escribir tests** (Read, Grep, Glob, Edit en `test/**`, Write en `test/**`, Bash de `npm test`). No puede tocar `src/`. Lo invocan sobre `src/services/notes.ts` y verifican que respeta la restricción cuando se le pide "ya que estás, arregla también el código".

**Lo que el formador observa:**

- ¿La lista de tools del frontmatter es **explícita** o ponen comodín?
- ¿El subagente rebota cuando le piden tocar `src/`?
- ¿Los tests que escribe el subagente cubren los caminos no felices (no solo `archive` con id válido, también con id inexistente, con nota ya archivada, etc.)?

---

## 5. Demo 3 + Ejercicio 3 — Equipo de subagentes (≈ 30 min)

### Demo 3 (10 min)

> Setup: `git checkout tema-19/inicio`. Subagentes `code-reviewer` y `security-auditor` plantados.

**Prompt literal:**

```
Quiero auditar src/services/notes.ts y src/routes/notes.ts antes
de aprobar el cambio. Coordina así:

1. Lanza el subagente code-reviewer sobre los dos archivos.
   Pídele su informe de hallazgos.
2. Después, lanza el subagente security-auditor sobre los mismos
   archivos. Pídele riesgos de seguridad concretos.
3. Una vez tengas ambos informes, prepara una sola tabla
   consolidada: categoría, hallazgo, severidad, qué subagente
   lo detectó. No edites código todavía.
```

Lo que el alumno ve:

- El agente principal invoca los dos subagentes **en orden** (no en paralelo desordenado).
- Cada subagente devuelve su informe en **su propio formato**.
- La consolidación final dice **qué subagente detectó cada cosa**: trazabilidad.
- Hay hallazgos que solo aparecen porque el rol correcto los está mirando (input no validado en `routes` lo ve `security-auditor`; if/else anidado en `services` lo ve `code-reviewer`).

> "Esto no es 'dos Claudes mejor que uno'. Es **dos roles distintos viendo el mismo código**. La diferencia está en lo que miran, no en cuánto."

### Ejercicio 3 (20 min)

> **Rama:** `git checkout tema-19/ejercicio-03`

Los alumnos reciben una tarea ambigua en `EJERCICIO.md`: auditar un cambio plantado en `src/services/notes.ts` (un nuevo método `bulkArchive`) antes de mergear. Tienen que decidir:

1. Qué subagentes invocan (de los plantados o creando uno nuevo).
2. En qué orden.
3. Qué artefacto produce cada uno.
4. **Cuándo deciden no usar subagente** y resolver a mano.

Documentan la decisión en `EQUIPO.md` (archivo que crean) con justificación.

**Lo que el formador observa:**

- ¿Justifican el orden de invocación o lo ponen por orden de aparición?
- ¿Reconocen los casos donde un subagente sobra? (cambio trivial → revisión manual basta).
- ¿Hay alumnos que invocan los **tres** subagentes "por si acaso"? Eso es sobreorquestación. Señalarlo.

---

## 6. Cierre y puente (≈ 5 min)

Resumen en pizarra:

1. **Subagente = rol acotado + tools restringidas.** No es Claude paralelo.
2. **Si no restringes tools, no aporta.** Es Claude Code con otro system prompt.
3. **Repite ≥3 veces al mes con formato estable** → compensa el subagente. Si no, sobra.
4. **Equipo de agentes** vale cuando hay fases distinguibles. Si no, hay sobreorquestación.

**Puente al Tema 20:**

> "Hasta ahora, todo lo que ha hecho Claude vive dentro del proceso de Claude Code: el repo, los comandos del shell, las skills, los subagentes. En el próximo tema abrimos el agente al mundo: **MCP**, conectores remotos, servidores propios. Es donde Claude deja de hablar solo con vuestro repo y empieza a hablar con Jira, GitHub, vuestro datawarehouse o vuestro CI."

---

## 7. Notas para el formador

- **Pregunta típica:** *"¿Un subagente y una skill no son lo mismo?"* → No. Una skill es **un comando reutilizable** invocable por el agente principal. Un subagente es **un agente con su propio rol, sus propias tools y su propia auto memory**. Una skill se ejecuta dentro del agente principal; un subagente es un proceso conceptualmente separado al que se delega.

- **Pregunta típica:** *"¿Puedo tener subagentes que se llamen entre sí?"* → Técnicamente no es lo habitual. El agente principal orquesta; los subagentes son hojas, no nodos. Si necesitas cadenas largas, posiblemente estés sobreorquestando.

- **Error común en el Ejercicio 1:** invocar el subagente con un prompt vago ("revísame esto"). El subagente devuelve algo razonable, pero el alumno no aprovecha el formato fijo de salida. Insistir: el valor está en pedir su formato.

- **Error común en el Ejercicio 2:** poner `tools: *` o no listar las tools. El subagente entonces tiene acceso a Bash y rompe la restricción. Mostrar cómo se nota: el subagente acaba ejecutando `npm test` aunque no debería.

- **Error común en el Ejercicio 3:** invocar los tres subagentes en paralelo "por si acaso". Eso no es orquestar, es lavar las manos. La buena respuesta es **decidir el orden con criterio** o, mejor, decir "para esto un subagente sobra".

- **Si alguien acaba antes:** que cree un subagente `pr-describer` que solo lea el `git log` y `git diff` y produzca una descripción de PR en Markdown. Tools: `Read`, `Grep`, `Bash(git diff:*)`, `Bash(git log:*)`. Sin Edit ni Write.

- **Sobre `--agents`:** mostrar que sirve para **probar antes de versionar**. Si lo usan dos veces, súbelo al repo. Mencionarlo en el ejercicio 2 como atajo: pueden lanzar Claude con `claude --agents /tmp/test-coverage-auditor.md` antes de hacer el commit final.

- **Sobre auto memory:** dejar claro que es **por subagente**, no compartida. Si el `code-reviewer` aprende algo, no lo sabe el `security-auditor`. Eso es deliberado: los roles son independientes.
