---
hidden: true
---

# Tema 19 — Subagentes, especialización de roles y trabajo distribuido dentro de Claude Code

> **Duración estimada:** ~90 min
> **Tipo:** conceptual + demos guiadas

## Objetivo del tema

Diseñar subagentes con rol acotado para tareas largas o de dominio (review, testing, seguridad, documentación), entender cuándo conviene segmentar el trabajo en varios agentes y cuándo no, y mantenerlos legibles, restringidos y gobernables.

***

## 1. Qué papel juegan los subagentes en flujos complejos de desarrollo

Un **subagente** es un agente especializado que vive junto a Claude Code y que se invoca para un tipo de tarea concreto. No es un Claude paralelo: es una **definición de rol** (system prompt + restricciones + herramientas permitidas) que el agente principal delega cuando detecta que toca esa tarea.

| Agente principal | Subagente |
|---|---|
| Sesión interactiva con el desarrollador | Rol fijo, invocable bajo demanda |
| Tiene acceso a todo el repo y a todas las tools | Tiene **solo** las tools que su definición permite |
| Memoria de la sesión actual | Auto memory propia y aislada por invocación |
| Sirve para tareas abiertas | Sirve para tareas repetibles y delimitadas |

> Un subagente no es "Claude más listo". Es **Claude con menos margen para improvisar** y más contexto del dominio que le toca.

Vive en `.claude/agents/<nombre>.md` (nivel proyecto) o `~/.claude/agents/<nombre>.md` (nivel usuario), con frontmatter YAML:

```yaml
---
name: code-reviewer
description: Revisor de PRs internos. Detecta sobreedición, validación movida, deps nuevas sin justificar.
tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*)
---

# Instrucciones del subagente
...
```

### 🧪 Demo 1 — Invocar un subagente plantado para revisar código existente

- **Objetivo:** ver cómo el agente principal delega en un subagente especializado y qué cambia respecto a pedirlo "a pelo".
- **Setup:** rama `tema-19/inicio` (Notebox con un `.claude/agents/code-reviewer.md` ya plantado). El archivo `src/services/notes.ts` tiene las funciones `archive` y `unarchive` con if/else anidados que claman refactor.

**Prompt literal:**

```
Usa el subagente code-reviewer para revisar el archivo
src/services/notes.ts. Quiero un informe en su formato habitual:
hallazgos por categoría (correctness, readability, scope) con
severidad y propuesta concreta. No edites nada todavía.
```

**Qué observar:**

- El agente principal **anuncia** que delega en `code-reviewer` (lo verás en la cabecera del turno).
- El subagente responde **en el formato definido en su frontmatter / system prompt** (`.claude/agents/code-reviewer.md`): tabla de hallazgos, severidad, propuesta.
- Solo usa `Read` / `Grep` / `Glob` — no edita ni ejecuta tests. Está restringido.
- Comparado con un `revísame esto` genérico, el output es **predecible** y **comparable** entre PRs.

### 🧩 Ejercicio 1 — Revisar con un subagente plantado

> **Rama:** `git checkout tema-19/ejercicio-01` · **Tiempo:** 15 min · **Tipo:** En clase

Usa el subagente `code-reviewer` plantado en el repo para auditar `src/services/notes.ts`. Anota qué hallazgos detecta el subagente que se te habrían escapado en una review "a pelo" y rellena el formato de salida con tus propias notas.

---

## 2. Cuándo conviene usar un subagente revisor, arquitecto o tester especializado

Tres arquetipos útiles, con criterio de cuándo activarlos:

| Subagente | Cuándo lo invocas | Cuándo NO |
|---|---|---|
| **Revisor** (`code-reviewer`) | PRs internos, diffs grandes, checklist de equipo siempre el mismo | Cambio de 1 línea evidente |
| **Arquitecto** (`architect`) | Decisiones de stack, contratos públicos, ADR | Implementación táctica del día a día |
| **Tester** (`test-coverage-auditor`) | Diseñar suite nueva, auditar cobertura semántica, detectar tests frágiles | Añadir un test aislado a una función nueva |
| **Documentador** (`docs-writer`) | JSDoc / TSdoc masivo, README de un módulo, ADR a partir de un diff | Comentario inline puntual |
| **Auditor de seguridad** (`security-auditor`) | Endpoints nuevos, dependencias añadidas, código con I/O o auth | Cambio cosmético de UI |

> Un subagente compensa cuando la tarea se repite **≥3 veces al mes** y tiene un **formato de salida estable**. Si lo invocarías una vez al año, sobra.

## 3. Configuración de subagentes a nivel usuario o proyecto

Dos scopes, dos propósitos:

| Scope | Ubicación | Cuándo |
|---|---|---|
| **Usuario** | `~/.claude/agents/<nombre>.md` | Tu manera de revisar PRs, tu estilo de tests. Te acompaña entre repos. |
| **Proyecto** | `<repo>/.claude/agents/<nombre>.md` | Convenciones del equipo. Versionados en git. Comprobados en review. |

Reglas mentales:

- **Si el subagente refleja las reglas del equipo, va en el repo.** Que entre por PR como cualquier otro cambio.
- **Si refleja tu hábito personal**, va en `~/.claude/agents/`.
- **Si dos developers necesitan el mismo subagente**, deja de ser personal: súbelo al repo.

> Un subagente en `~/.claude/agents/` que nadie más del equipo tiene es invisible para el resto. Si te ayuda tanto que lo invocas a diario, el equipo merece tenerlo también.

## 4. Restricción de herramientas y alcance de cada subagente

La restricción de tools es **el corazón del diseño** de un subagente. Decide qué puede y qué no puede hacer.

| Tipo de subagente | Tools típicas | Por qué |
|---|---|---|
| Revisor | `Read`, `Grep`, `Glob`, `Bash(git diff:*)`, `Bash(git log:*)` | Solo audita. **No edita ni ejecuta** comandos arbitrarios. |
| Tester | `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash(npm test:*)` | Puede escribir tests y ejecutarlos, pero no modificar `src/`. |
| Documentador | `Read`, `Grep`, `Glob`, `Edit(*.md)`, `Write(*.md)` | Edita documentación, **no código**. |
| Auditor de seguridad | `Read`, `Grep`, `Glob`, `Bash(npm audit:*)`, `Bash(git log:*)` | Solo lectura + auditoría. Cero edición. |

> Si el subagente necesita "todas las tools", probablemente no es un subagente: es Claude Code con otro system prompt. Y eso aporta poco.

### 🧪 Demo 2 — Crear un subagente nuevo con tools restringidas

- **Objetivo:** ver el ciclo completo de diseñar, activar y validar un subagente con permisos acotados.
- **Setup:** rama `tema-19/inicio`. No existe `.claude/agents/docs-writer.md`.

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

**Qué observar:**

- El frontmatter YAML lista **exactamente** las tools permitidas — sin `Bash`.
- Al invocarlo sobre `memory.ts`, el subagente lee, escribe JSDoc, y reporta. **No intenta** ejecutar tests ni `git diff`.
- Si pides "y ahora corre los tests", el subagente debe rebotar la petición o devolverla al agente principal. Está restringido por diseño.

### 🧩 Ejercicio 2 — Diseñar un subagente con tools acotadas

> **Rama:** `git checkout tema-19/ejercicio-02` · **Tiempo:** 20 min · **Tipo:** En clase

Crea un subagente `test-coverage-auditor` a nivel proyecto con tools que **solo le permitan auditar y escribir tests** (no tocar `src/`). Invócalo sobre el módulo `src/services/notes.ts` y verifica que respeta la restricción cuando se le pide editar el código de producción.

---

## 5. Uso de `--agents` para añadir subagentes dinámicamente en sesión

Hay tres formas de tener subagentes activos en una sesión:

| Forma | Sintaxis | Cuándo |
|---|---|---|
| **Por archivo** | `.claude/agents/*.md` en el repo o el home | Permanentes, versionados |
| **Inyectados al arrancar** | `claude --agents path/to/code-reviewer.md` | Ad-hoc, no quieres trackearlo todavía |
| **Invocación explícita** | "Usa el subagente X para…" en el chat | Activación bajo demanda |

`--agents` es útil para **probar un subagente antes de versionarlo** o para casos puntuales (auditoría externa, sesión one-off). En cuanto lo uses dos veces, súbelo al repo.

## 6. Auto memory propio de subagentes y su utilidad práctica

Cada subagente tiene su propio cuaderno de notas (auto memory) **aislado** del agente principal y del resto de subagentes.

- **Utilidad:** el `code-reviewer` recuerda los hallazgos sistemáticos del equipo (siempre se nos cuela `console.log`, las validaciones suelen estar en el sitio equivocado).
- **Riesgo:** acumular ruido. Una auto memory de 500 líneas en un subagente es señal de que está sobredimensionado o de que la memoria no se ha curado.
- **Buena práctica:** revisar la auto memory de los subagentes del repo en cada release, igual que se revisa el `CLAUDE.md`.

> La auto memory del subagente es **memoria de rol**, no memoria de proyecto. Si el `code-reviewer` recuerda "el módulo `notes` usa Express 4", esa información va en `CLAUDE.md`, no en su memoria.

## 7. Diseño de equipos de agentes para tareas largas y segmentadas

Cuando una tarea no cabe en una sola sesión y tiene fases distinguibles, segmentarla en varios subagentes puede multiplicar la calidad:

```
Migración de Express 4 → 5
├── architect            : decide el orden de las rutas
├── codemod-runner       : aplica los cambios mecánicos
├── test-coverage-auditor: verifica que la suite cubre lo que se mueve
└── code-reviewer        : audita el diff final antes de PR
```

Cada subagente trabaja en su fase, deja un artefacto (informe, diff, tests nuevos) y el siguiente lo consume.

> Equipo de agentes ≠ delegación ciega. Tú decides qué se invoca en qué orden, y cada artefacto sigue pasando por tu revisión.

### 🧪 Demo 3 — Orquestar dos subagentes en la misma sesión

- **Objetivo:** ver cómo coordinar dos subagentes (`code-reviewer` + `security-auditor`) para auditar un cambio plantado.
- **Setup:** rama `tema-19/inicio` con ambos subagentes plantados en `.claude/agents/`. El módulo `src/services/notes.ts` tiene la complejidad anidada y un endpoint expuesto en `src/routes/notes.ts`.

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

**Qué observar:**

- El agente principal invoca los subagentes **en orden**, no en paralelo desordenado.
- Cada subagente produce **su propio informe** con su formato.
- La consolidación final identifica **qué subagente** detectó cada cosa (auditoría de tu equipo de agentes).
- Hay hallazgos que solo aparecen porque tienes el rol correcto mirando (el `security-auditor` ve cosas que el `code-reviewer` ignora, y viceversa).

### 🧩 Ejercicio 3 — Diseñar un equipo de subagentes

> **Rama:** `git checkout tema-19/ejercicio-03` · **Tiempo:** 20 min · **Tipo:** En clase

Recibes una tarea ambigua: "auditar un endpoint nuevo antes de mergear". Diseña el equipo: qué subagentes invocas, en qué orden, qué artefacto produce cada uno y **cuándo decides no usar subagente** y resolverlo tú directamente. Documenta la decisión en `EQUIPO.md` y justifica.

## 8. Casos de uso de subagentes en debugging, documentación o seguridad

Tres ejemplos canónicos:

- **`debug-postmortem`** — recibe un stack trace + archivos afectados, produce hipótesis priorizadas y comandos de bisección.
  - **Tools:** `Read`, `Grep`, `Glob`, `Bash(git log:*)`, `Bash(git bisect:*)`.
  - **No tools:** `Edit`, `Write` — el postmortem **analiza**, no corrige.

- **`api-docs`** — recibe un archivo de routes y produce documentación OpenAPI / Markdown con ejemplos.
  - **Tools:** `Read`, `Grep`, `Glob`, `Edit(*.md)`, `Write(*.md)`.
  - **No tools:** `Edit(src/**)` — no toca código de producción.

- **`security-auditor`** — recibe un cambio (o el repo entero) y produce un informe con hallazgos de seguridad clasificados.
  - **Tools:** `Read`, `Grep`, `Glob`, `Bash(npm audit:*)`, `Bash(git log:*)`.
  - **No tools:** ninguna que edite o ejecute código arbitrario.

> Patrón: **un subagente por intención**. Si un mismo subagente quiere "auditar y arreglar", son dos.

## 9. Riesgos de sobreorquestación dentro del flujo del desarrollador

| Antipatrón | Síntoma | Coste |
|---|---|---|
| **Subagente por cada función** | 14 archivos en `.claude/agents/` | Nadie sabe cuál invocar; ninguno se mantiene. |
| **Subagente "general"** sin restricciones | Tools = todas | Es Claude Code disfrazado. No aporta. |
| **Cadena de subagentes para cambios triviales** | `architect → reviewer → tester` para añadir un campo | Coste alto + delay; el cambio era de 3 minutos. |
| **Subagentes que se contradicen** | `code-reviewer` dice "valida en routes", `architect` dice "valida en services" | Falta de criterio común en las instrucciones. |
| **Auto memory descontrolada** | Subagente con 500 líneas de "lecciones aprendidas" | Es ruido. Curar la memoria es parte del mantenimiento. |

> La regla mental: **si invocar el subagente cuesta más que hacer la tarea a mano, sobra**.

## 10. Criterios para mantener subagentes útiles, legibles y gobernables

Checklist mental antes de añadir un subagente al repo:

- [ ] **Intención única**: hace una cosa. Si hace dos, son dos subagentes.
- [ ] **Tools restringidas**: lista explícita; nada de "todas".
- [ ] **Formato de salida estable**: cualquier invocación produce un output comparable con la anterior.
- [ ] **Documentado**: el archivo explica para qué sirve y cuándo NO usarlo.
- [ ] **Versionado**: vive en `.claude/agents/` del repo, entra por PR.
- [ ] **Revisado**: el equipo lo ha visto. No es propiedad de quien lo escribió.
- [ ] **Curado periódicamente**: auto memory revisada cada release.
- [ ] **Con criterio de baja**: si nadie lo invoca en 3 meses, se borra.

> Los subagentes que sobreviven son los que el equipo **invoca sin pensarlo**. El resto son archivos muertos en `.claude/agents/` que nadie audita.

***

## Resumen

- Un subagente es un **rol acotado** (system prompt + restricciones + tools), no un Claude paralelo.
- Tres scopes: archivo en proyecto, archivo en home, inyección con `--agents`.
- **Restringir tools es el corazón del diseño**: si no lo restringes, no aporta.
- Compensa cuando la tarea es **repetida (≥3 veces/mes)** y tiene **formato de salida estable**.
- Equipo de agentes ≠ delegación ciega. Tú decides el orden, tú revisas cada artefacto.
- Subagente sin uso real en 3 meses = subagente que se borra.
