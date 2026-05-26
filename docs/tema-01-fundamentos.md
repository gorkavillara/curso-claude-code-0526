# Tema 1 — Fundamentos de Claude Code como sistema agentic de ingeniería de software sobre repositorios reales

> **Duración estimada:** ~60 min
> **Tipo:** conceptual + demos guiadas

## Objetivo del tema

Distinguir **autocompletado** de **sistema agentic**. Saber **dónde Claude Code aporta y dónde estorba**. Aceptar que **la responsabilidad técnica sigue siendo del desarrollador**.

---

## 1. Qué es Claude Code y qué diferencia aporta frente a asistentes de autocompletado tradicionales

Claude Code = **agente de programación**. Recibe un objetivo → decide qué archivos abrir → lee → edita varios a la vez → ejecuta comandos → valida → itera.

| | Autocompletado clásico | Claude Code (agentic) |
|---|---|---|
| Unidad de trabajo | Línea o bloque | Tarea sobre el repo |
| Iniciativa | Reactivo | Proactivo (planifica y ejecuta) |
| Contexto | Archivo abierto | Repo entero + comandos + herramientas |
| Acciones | Sugerir texto | Leer, editar, ejecutar, validar |
| Memoria | Ninguna | `CLAUDE.md`, settings, auto memory |

> _"El autocompletado te ayuda a escribir más rápido el código que ya tenías en la cabeza. Claude Code te ayuda a no tener que tenerlo todo en la cabeza."_

### 🧪 Demo 1 — GitHub Copilot vs Claude Code en la misma tarea

- **Objetivo:** ver la diferencia entre *sugerencia por línea* y *tarea por sesión*.
- **Setup:** repo Bookshelf (rama `tema-01/inicio`, API mínima de libros en Node + TypeScript) abierto en VS Code, Copilot activo, Claude Code disponible.
- **Tarea:** añadir `outOfPrint: boolean` al modelo `Book` y propagarlo a routes, storage y tests.

| Paso | Copilot | Claude Code |
|---|---|---|
| 1 | Escribes en `models/book.ts`; sugiere tipo | Una sola petición |
| 2 | Cambias de archivo; pierde contexto | `Glob` + `Grep` localiza usos de `Book` |
| 3 | Repites en cada archivo (4×) | Edita los archivos en una pasada |
| 4 | Si olvidas un sitio, lo descubre un test | Ejecuta `npm test` y arregla si falla |
| 5 | Coherencia entre archivos = tu trabajo | Coherencia ya hecha; **revisión sigue siendo tuya** |

**Cierre:** no compiten — se complementan. Copilot línea a línea, Claude Code para tareas multiarchivo o que requieren leer antes de escribir.

### 🧩 Ejercicio 1 — "Cuéntame este repo en 5 líneas"

> **Rama:** `git checkout tema-01/ejercicio` · **Tiempo:** 15 min · **Tipo:** En clase

Pide a Claude un resumen del repo en 5 líneas restringidas — citando archivos y sin inventar. Después audita tú al modelo abriendo los archivos a mano y detecta qué se saltó o qué se inventó.

---

## 2. Lectura contextual del repositorio y comprensión de varias capas del proyecto

Antes de escribir, **lee**. Descubre el repo archivo a archivo según lo necesita.

- Empieza típicamente por `Glob` → `Grep` → `Read`.
- Repo ordenado (nombres claros, README útil, `CLAUDE.md`) → menos archivos leídos, más acierto.
- Cruza capas: detecta que un endpoint en `routes/` llama a `services/` y persiste en `storage/`, y propone cambios coherentes con esa cadena.

> Parte del valor está en **dejar el repo legible para un agente** (y, de paso, para humanos nuevos).

### 🧪 Demo 2 — Lectura contextual sobre un repo desconocido

- **Objetivo:** ver cómo descubre un repo desde cero y **cita** lo que ha leído.
- **Setup:** repo que no conozcas de memoria. Sin contexto previo.

**Prompt literal:**

```
Sin abrir más archivos de los necesarios, dime en 5 líneas qué hace este
repositorio, cuál es el entry point y cuáles son las 3 dependencias más
importantes. No inventes nada: si no estás seguro de algo, dilo.
```

**Qué observar:**

- Lee `README.md`, `package.json` (o `pyproject.toml`/`go.mod`) y el entry point.
- Cita rutas concretas (`src/server.ts`).
- Si algo es ambiguo, lo marca como *"no estoy seguro"*.
- Lee **pocos** archivos: prioriza los de mayor densidad informativa.

**Compara:** un chat web te lo inventa entero. Aquí está leyendo el código real.

> Patrón base de exploración: **preguntar → leer → responder citando**. Profundizamos en el [Tema 10](tema-10-exploracion-repos.md).

### 🧩 Ejercicio 2 — Mismo trabajo, dos herramientas

> **Rama:** `git checkout tema-01/ejercicio` · **Tiempo:** 20 min · **Tipo:** En clase

Implementa `PUT /books/:id` dos veces: primero solo con el autocompletado del IDE y después solo con Claude Code. Cronometra ambas, anota errores corregidos y decide para qué tipo de tarea compensa cada herramienta.

---

## 3. Edición multiarchivo y ejecución de comandos dentro del flujo de desarrollo

Capacidades:

- Edita varios archivos en una pasada → diff revisable.
- Ejecuta comandos (`npm test`, `tsc --noEmit`, `git status`…) y lee la salida.
- Reacciona a errores: test rojo → lo lee → corrige el origen.
- Pide confirmación antes de comandos destructivos (según modo y permisos — Tema 5).

> ⚠️ Que pueda hacerlo no significa que deba hacerlo siempre. Más amplitud de cambio = más cuidado en el review.

### 🧪 Demo 3 — Edición multiarchivo con validación automática

- **Objetivo:** ver el bucle *leer → editar → ejecutar tests → reaccionar* sin salir de la conversación.
- **Setup:** Bookshelf limpio (rama `tema-01/inicio`), `npm test` funcionando.

**Prompt literal:**

```
Añade una validación: el campo `title` no puede tener más de 100 caracteres.
Si se supera, devuelve 400 con un mensaje claro. Añade un test que cubra
tanto el caso válido como el inválido. Ejecuta los tests y confirma que
todo pasa antes de devolverme el resultado.
```

**Pasos esperados:**

1. **Lee:** `models/book.ts`, `routes/books.ts`, `storage/memory.ts`, tests.
2. **Plan:** anuncia qué va a tocar.
3. **Edita:** validación + propagación + test nuevo.
4. **Ejecuta:** `npm test`. Si falla, lo arregla; no para.
5. **Cierra:** tests verdes + scope respetado.

**Tu trabajo al terminar:**

- [ ] Leer el diff entero.
- [ ] Verificar cambio mínimo y acotado.
- [ ] Confirmar que los tests cubren lógica real, no solo el camino feliz.

> Patrón base de trabajo con Claude Code: **intención clara → ejecución agentic → revisión humana del diff**.

### 🧩 Ejercicio 3 — La lista negra del equipo

> **Rama:** `git checkout tema-01/ejercicio` · **Tiempo:** 15 min · **Tipo:** En clase

Pensando en tu proyecto real (no en este de ejemplo), escribe dos listas cortas: 5 tareas que delegarías a Claude Code mañana y 5 que no le pasarías ni con buenos prompts, cada una con una frase de justificación.

---

## 4. Casos de uso donde Claude Code aporta más valor en equipos de software

- **Cambios multiarchivo:** refactor, renombrado semántico, propagación de contratos.
- **Leer mucho para escribir poco:** módulos legacy, mapear usos de una función, ADR.
- **Onboarding** a un repo nuevo.
- **Testing, docs, revisión de PRs:** trabajo que el equipo siempre pospone.
- **Tareas repetitivas pero no idénticas:** migrar 30 endpoints con variaciones.

> Patrón: **bajo riesgo individual + alto coste agregado**.

## 5. Tareas donde sigue siendo mejor una intervención manual directa del desarrollador

- **Arquitectura con consecuencias:** stack, contratos públicos, modelo de datos.
- **Errores caros y silenciosos:** pagos, permisos, autenticación, migraciones destructivas.
- **Cambios de 30 segundos** que ya tienes en la cabeza.
- **Cuando no puedes validar el output.**

> Regla: **si no puedes revisar el output con criterio, no lo aceptes.**

## 6. Riesgos de usar IA sin contexto, sin criterio o sin validación

| Riesgo | Qué ocurre |
|---|---|
| Alucinación plausible | Inventa funciones, opciones o imports que no existen |
| Sobreedición | Pides 1 archivo y toca 12 |
| Falsa certeza | Explica con seguridad algo incorrecto |
| Uniformización a la baja | Todo el equipo prompteа igual → código mediocre homogéneo |
| Fugas de información | Claves o datos de cliente entran al prompt sin querer |

**Mitigación:** `CLAUDE.md` explícito + permisos restrictivos en zonas críticas + **revisión humana siempre antes de merge**.

## 7. Papel del desarrollador como responsable final de decisiones técnicas

> **El asistente nunca firma el commit. Lo firmas tú.**

- Lees el diff antes de aceptar. Cada vez.
- Decides qué entra al repo. El agente propone; tú dispones.
- Validas comportamiento (tests verdes ≠ feature correcta).
- Mantienes el criterio arquitectónico que el agente no tiene.

> Si aceptas *"por inercia"*, baja el ritmo. Velocidad = consecuencia, no objetivo.

## 8. Ventajas y límites de un sistema agentic sobre código vivo

| Ventajas | Límites |
|---|---|
| Escala trabajo de bajo nivel sin escalar al equipo | No tiene memoria viva del producto |
| Reduce el coste de docs, tests y refactors pequeños | No tiene criterio de negocio |
| Permite explorar alternativas rápido | "Razonamiento" probabilístico → improvisa donde falta contexto |
| Acelera onboarding a repos nuevos | Cuesta dinero por uso (Enterprise: cada token cuenta) |

> Regla mental: **valor = (tiempo ahorrado) − (tiempo de revisión) − (coste API)**. Si no sale, no lo estás usando bien.

## 9. Diferencia entre usar Claude para chatear y usar Claude Code para construir

| | Claude (chat) | Claude Code |
|---|---|---|
| Entrada | Texto plano | Repo + comandos + texto |
| Salida | Texto / código pegable | Diffs aplicados al repo |
| Verificación | Tú lo copias y pruebas | El agente puede ejecutar tests |
| Errores | Inventa con contexto general | Lee el código real antes de responder |
| Persistencia | Conversación efímera | `CLAUDE.md`, settings, memoria del proyecto |

---

## Resumen

- Claude Code = **agente**, no autocompletado. Trabaja en tareas, no en líneas.
- Lee el repo antes de escribir.
- Aporta más en multiarchivo, exploración, testing, docs y review.
- No es para arquitectura crítica, negocio ni cambios pequeños que ya tienes en la cabeza.
- **El commit lo firmas tú.** Siempre.
