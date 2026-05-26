# Soluciones — Tema 10

## Ejercicio 1 — Navegación con prompts de exploración

### Respuestas de referencia

**Pregunta 1: ¿Qué hace `src/search/index.ts` y cómo se invoca desde la ruta de búsqueda?**

`src/search/index.ts` implementa búsqueda lineal sobre el array de notas, filtrando por coincidencia en `title` o `body`. Se invoca desde `src/routes/notes.ts` en el handler de `GET /notes/search` pasando la lista completa de notas y el parámetro `q`.

**Pregunta 2: Convenciones de error del repositorio**

El repo usa errores semánticos de dominio (p. ej., `NoteNotFoundError`, `InvalidNoteError`) en lugar de `Error` genérico. Ejemplos típicos en `src/services/notes.ts`.

**Pregunta 3: Flujo de `GET /notes/search?q=...`**

`src/routes/notes.ts` (handler) → extrae `q` del query string → llama a `src/services/notes.ts:searchNotes(q)` → este llama a `src/search/index.ts:search(notes, q)` → devuelve el array filtrado → la ruta responde 200 con los resultados.

### Criterio de éxito

- Todas las respuestas citan rutas de archivo.
- Los prompts usados incluyen restricciones como "cita rutas exactas" o "no inventes".
- Si Claude cometió algún error en las respuestas, el alumno lo detectó al verificar.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Respuestas sin citar archivos | Pedir que relean el EJERCICIO.md — el criterio de éxito exige citas |
| Alumnos que leyeron los archivos directamente | El punto del ejercicio es practicar los prompts. Pedirles que rehagan con prompts |
| Claude inventó una ruta o función | Señalarlo como ejemplo de alucinación — siempre verificar las citas |

---

## Ejercicio 2 — Zonas frágiles con evidencia

### Zonas frágiles esperadas en Notebox

Las tres zonas más probables que Claude detectará:

1. **`src/search/index.ts`** — Búsqueda lineal O(n) sin tests directos. Señal: no hay archivo `search.test.ts`. Riesgo: el comportamiento de búsqueda no está protegido por tests.

2. **`src/storage/memory.ts`** — Storage en memoria sin persistencia. Señal: todos los datos se pierden al reiniciar. Riesgo: cualquier error de concurrencia o reinicio destruye el estado.

3. **`src/services/notes.ts` (funciones `archive`/`unarchive`)** — Anidación profunda con lógica duplicada. Señal: mismo patrón de if/else en ambas funciones. Riesgo: cambiar una sin tocar la otra introduce inconsistencias.

### Criterio de éxito

- Cada zona incluye: archivo, función o línea, señal concreta, riesgo.
- Al menos dos zonas tienen un número de línea citado.
- No hay zonas genéricas sin evidencia ("el código podría ser más eficiente").

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Zonas sin línea citada | Pedir que lancen un segundo prompt: "para esta zona, lee el archivo y dime la línea exacta" |
| Riesgos vagos ("podría fallar") | Pedir que contextualicen: ¿en qué situación concreta? |
| Menos de 3 zonas con evidencia | Señalarlo — el criterio del ejercicio es 3 con cita |

---

## Ejercicio 3 — Guía de onboarding

### Guía de referencia

**Orden de lectura (8 archivos máximo):**

1. `README.md` — qué es el proyecto y cómo arranca.
2. `package.json` — dependencias, scripts, runtime.
3. `src/server.ts` — entry point y configuración Express.
4. `src/routes/notes.ts` — todos los endpoints disponibles.
5. `src/models/note.ts` — estructura de datos central.
6. `src/services/notes.ts` — lógica de negocio (el corazón del sistema).
7. `src/storage/memory.ts` — cómo se persisten los datos.
8. `test/notes.service.test.ts` — qué comportamientos están testados.

**Los 3 flujos más importantes:**

1. `POST /notes` → `routes/notes.ts` → `services/notes.ts:createNote` → `storage/memory.ts:save`
2. `GET /notes/search?q=` → `routes/notes.ts` → `services/notes.ts:searchNotes` → `search/index.ts:search`
3. `POST /notes/:id/archive` → `routes/notes.ts` → `services/notes.ts:archiveNote` → `storage/memory.ts:update`

**Lo que no debe tocar en los primeros días:**

- `src/storage/memory.ts` — cualquier cambio aquí afecta a todas las operaciones.
- `src/models/note.ts` — cambiar el tipo base rompe todo lo que depende de él.

**Sección que Claude no puede generar (añadida manualmente):**

*Decisiones de diseño intencionales que no deben "corregirse":*
- El storage en memoria es deliberado para el contexto del curso. No añadir base de datos.
- Los tests usan `node --test` nativo. No migrar a jest o vitest.

### Criterio de éxito

- El orden de lectura empieza por los archivos de mayor densidad informativa.
- Al menos un flujo cita los 3 archivos que atraviesa (ruta, servicio, storage).
- La sección "no tocar" es específica, no genérica.
- El alumno añadió al menos un punto que Claude no podía saber sin contexto externo.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Guía sin rutas de archivo | Señalarlo como output genérico; pedir que refinen el prompt |
| "No tocar" vacío o genérico | Pedir al alumno: ¿qué sabéis vosotros del proyecto que Claude no sabe? |
| No añadieron ninguna sección manual | El valor del ejercicio está precisamente en completar lo que la IA no puede saber |

---

## Ejercicio 4 (extra) — Skill `/onboarding-repo`

### Solución de referencia

`.claude/skills/onboarding-repo/SKILL.md`:

```markdown
---
name: onboarding-repo
description: Genera ONBOARDING.md para un repo desconocido cuando el usuario pide "onboarding de este repo", "ayúdame a entrar a este proyecto" o "guía para nuevo dev"
---

# Skill: onboarding-repo

Acelera la incorporación de un desarrollador a un repositorio desconocido. Genera un fichero `ONBOARDING.md` en la raíz del repo con tres secciones obligatorias, todas con rutas reales citadas.

## Restricciones generales

- **Cita rutas exactas en cada afirmación.** Si no puedes citar un archivo, di "no estoy seguro" en vez de inventarlo.
- **No leas más de 10 archivos en total.** Prioriza por densidad informativa: README, package.json (o equivalente), entry point, carpetas de primer nivel, después archivos concretos solo si hacen falta.
- **Idioma del output:** español.

## Pasos

1. **Mapa de capas.** Identifica entry point, rutas/handlers, servicios o lógica de negocio, storage o persistencia. Cita la ruta exacta de cada elemento.
2. **Zonas frágiles.** Detecta 3 zonas con deuda técnica o riesgo. Para cada una: archivo, función o línea concreta, señal observable, riesgo real. Nada genérico.
3. **Guía de onboarding.** Genera:
   - Orden de lectura (máximo 8 archivos, en orden de prioridad).
   - Qué hace cada archivo en una línea.
   - Los 3 flujos más importantes del sistema con los archivos que atraviesan.
   - Qué no debe tocar en los primeros días y por qué.
4. **Sección manual.** Añade al final un bloque marcado como `<!-- A completar por el equipo -->` para que un humano rellene las decisiones de diseño intencionales que no deben "corregirse" (Claude no puede inferir esto del código).

## Formato de salida

Escribe el resultado en `ONBOARDING.md` en la raíz del repo. No respondas en el chat; usa el fichero como entregable.
```

### Criterio de éxito

- La skill se auto-activa con frases del estilo "onboarding de este repo" pero **no** se dispara con "explícame este código" o "qué hace este archivo".
- El `ONBOARDING.md` generado cita rutas reales en cada sección (verificable abriendo los archivos).
- Las zonas frágiles incluyen archivo y línea, no solo descripción.
- El alumno probó la skill contra al menos un repo distinto a Notebox.
- La sección manual `<!-- A completar por el equipo -->` está presente y vacía (es trabajo humano).

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| `description:` demasiado abierta ("ayuda con repos") | Auto-dispara en contextos no deseados — pedir que la restrinjan a frases concretas |
| La skill responde en el chat en vez de crear `ONBOARDING.md` | Falta la instrucción explícita en "Formato de salida" — sin fichero, no hay artefacto reutilizable |
| El output no cita rutas | La restricción "cita rutas exactas" no está suficientemente reforzada — añadirla también en cada paso, no solo en el preámbulo |
| Solo se probó contra Notebox | El valor de una skill es que generaliza — pedir que la lancen contra otro repo (puede ser cualquiera del alumno) |
| Olvidaron la sección manual | El punto del ejercicio 3 era reconocer qué Claude no puede saber. La skill debe preservar ese hueco para que el humano lo rellene |

### Extensión opcional

Si el alumno termina rápido: pedir que añada un paso 5 a la skill que proponga un esqueleto de `CLAUDE.md` para el repo basado en el `ONBOARDING.md` generado. Esto enlaza tema-10 (exploración) con tema-7 (CLAUDE.md como contexto permanente).
