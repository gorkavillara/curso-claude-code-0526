---
name: curso-tema-doc
description: Genera la documentación de un tema del curso de Claude Code en docs/, replicando exactamente la estructura, el estilo esquemático y el formato de demos del Tema 1 (docs/tema-01-fundamentos.md). Usa anexo.md como fuente de verdad para el título y los puntos del tema. Trigger cuando el usuario pida "haz el tema X", "documenta el tema X", "genera la doc del tema X", "el tema X está pendiente", o equivalente, en el contexto del curso.
---

# Skill: curso-tema-doc

Genera el archivo `docs/tema-XX-<slug>.md` siguiendo **exactamente** la estructura y el estilo del Tema 1 (`docs/tema-01-fundamentos.md`), tomando el título y los puntos de `anexo.md`.

---

## Inputs

- **Número de tema** (1–27). Si el usuario no lo dice, pregúntalo.
- (Opcional) Indicaciones específicas del usuario para alguna demo o sección.

## Fuentes obligatorias antes de escribir

Antes de generar nada, **lee siempre**:

1. `anexo.md` → título y puntos exactos del tema solicitado.
2. `docs/tema-01-fundamentos.md` → plantilla viva. Si hay duda de formato, gana este archivo.
3. `docs/SUMMARY.md` → confirma el `filename` del tema y los enlaces a otros temas (para cross-links).
4. `README.md` y `package.json` del proyecto Notebox (raíz) → recordar el repo de prácticas para diseñar demos realistas.

> Si el filename del tema no aparece en `SUMMARY.md`, **detente y pide confirmación** al usuario antes de inventarlo.

---

## Reglas inviolables

1. **El título del tema (H1) debe ser el subtítulo en mayúsculas de `anexo.md`** convertido a sentence case y precedido de `# Tema X — `. No reescribas, no resumas, no parafrasees.
2. **Cada punto del tema debe aparecer EXACTAMENTE igual que en `anexo.md`** como `## N. <punto>`. No corrijas typos, no acortes, no fusiones puntos.
3. **Recompón los saltos de línea internos** que `anexo.md` tiene por anchura de columna (un punto puede ocupar 2–3 líneas en el anexo: júntalas en una sola).
4. **Duración estimada:** `~60 min`.
5. **Eliminar la sección final "Demos prácticas"** (las demos van intercaladas, no al final).
6. **No añadir secciones que no estén en el Tema 1** (no metas "Recursos", "FAQ", "Ejercicios" salvo que el usuario lo pida).
7. **Idioma:** español, con tildes correctas. Tono directo, profesional, opinionado, en segunda persona ("tú").

---

## Estructura obligatoria del archivo

Replica este esqueleto exactamente:

```markdown
# Tema X — <Subtítulo de anexo.md en sentence case>

> **Duración estimada:** ~60 min
> **Tipo:** <conceptual | conceptual + demos guiadas | práctico | etc.>

## Objetivo del tema

<1–2 frases. Esquemático. Qué se lleva el alumno al terminar.>

---

## 1. <Punto 1 EXACTO de anexo.md>

<Contenido esquemático: tabla, bullets cortos, frases punzantes.>

### 🧪 Demo 1 — <Título de la demo>

<Bloque de demo según la plantilla de demos.>

## 2. <Punto 2 EXACTO de anexo.md>

<Contenido…>

### 🧪 Demo 2 — <Título de la demo>

<…>

## 3. <Punto 3 EXACTO de anexo.md>

<Contenido…>

### 🧪 Demo 3 — <Título de la demo>

<…>

## 4. <Punto 4 EXACTO de anexo.md>

<Contenido…>

(… continúa hasta el último punto del tema en anexo.md …)

---

## Resumen

- <4–5 bullets cortos. Una idea por bullet.>
- <…>
```

---

## Reglas de estilo (esquemático)

Sigue el patrón del Tema 1. Concretamente:

### Cuándo usar **tabla**

- Comparativas (autocompletado vs agentic, chat vs Claude Code, ventajas vs límites).
- Listas con dos o más columnas semánticamente equivalentes.
- Pasos paralelos de dos herramientas en la misma tarea.

### Cuándo usar **bullets**

- Listas de casos de uso, riesgos, antipatrones, mitigaciones.
- "Qué observar" en demos.
- "Tu trabajo al terminar" → bullets con `- [ ]` (checkbox).

### Cuándo usar **prosa**

- Solo cuando una idea no se descompone limpiamente en bullets.
- Máximo 2–3 frases seguidas. Si se pasa, partirla en bullets.

### Frases ancla y blockquotes

Usa `> ` para:

- Frases memorables ("El commit lo firmas tú").
- Avisos ("⚠️ Que pueda hacerlo no significa que deba hacerlo").
- Reglas mentales ("valor = tiempo ahorrado − revisión − coste").

### Cross-links

Cuando un punto se profundiza en otro tema, enlaza:

```markdown
> Profundizamos en el [Tema 9 — Exploración de repositorios](tema-09-exploracion-repos.md).
```

Resuelve el filename consultando `SUMMARY.md`.

---

## Reglas para las demos

### Cuántas

**2–3 demos por tema**, no más. Distribuirlas, no concentrarlas al final.

### Dónde colocarlas

- **Demo 1** → después del primer punto que se puede demostrar (típicamente punto 1, 2 o 3).
- **Demo 2** → después de un punto conceptual donde aporte ver el comportamiento real.
- **Demo 3** → después de un punto que cierre el bucle completo (ej.: edición + ejecución + validación).
- Si el tema es muy conceptual (ej.: Tema 1, Tema 25), las demos pueden ser de **comparación** o **exploración**.
- Si el tema es muy práctico (ej.: Tema 4 settings, Tema 17 git), las demos son **operativas** sobre el repo Notebox o sobre `~/.claude/`.

### Formato (replicar exactamente)

```markdown
### 🧪 Demo N — <Título de la demo>

- **Objetivo:** <una frase>.
- **Setup:** <qué tener listo antes de empezar>.

**Prompt literal:**   ← solo si la demo se basa en un prompt concreto

```
<prompt copiable, multi-línea>
```

**Pasos esperados:**   ← solo si tiene sentido enumerarlos

1. <…>
2. <…>

**Qué observar:**

- <punto 1>
- <punto 2>

**Tu trabajo al terminar:**   ← solo cuando hay que revisar diff o validar

- [ ] <acción>
- [ ] <acción>

> **Cierre:** <una frase que conecte con el resto del tema o un tema futuro.>
```

Variantes válidas: si la demo es comparativa entre dos herramientas, usar **tabla paso-a-paso** (como Demo 1 del Tema 1) en vez de "Pasos esperados".

### Repositorio de prácticas

- Por defecto, las demos usan el **repo Notebox** del propio proyecto (raíz: `src/`, `test/`, `package.json`). Es una API mínima de notas en Node 24 + Express + TypeScript.
- Estructura útil para demos:
  - `src/server.ts` — entry point.
  - `src/routes/notes.ts` — endpoints HTTP.
  - `src/services/notes.ts` — lógica.
  - `src/storage/memory.ts` — repositorio en memoria.
  - `src/search/index.ts` — búsqueda por texto.
  - `src/models/note.ts` — tipos + factory.
  - `test/notes.service.test.ts`, `test/storage.test.ts`.
- Comandos: `npm install`, `npm run dev`, `npm test`, `npm run typecheck`.
- Si una demo necesita un repo distinto (ej.: monorepo, repo legacy, repo Python), dilo explícitamente en **Setup**.

---

## Convención de filenames

Los slugs de los archivos están definidos en `docs/SUMMARY.md`. **Úsalos tal cual.** Mapeo de referencia:

| Tema | Filename |
|---|---|
| 1 | `tema-01-fundamentos.md` |
| 2 | `tema-02-interfaces.md` |
| 3 | `tema-03-entorno.md` |
| 4 | `tema-04-configuracion.md` |
| 5 | `tema-05-permisos-sandboxing.md` |
| 6 | `tema-06-ides.md` |
| 7 | `tema-07-claude-md-memoria.md` |
| 8 | `tema-08-prompting.md` |
| 9 | `tema-09-exploracion-repos.md` |
| 10 | `tema-10-nuevas-funcionalidades.md` |
| 11 | `tema-11-refactorizacion.md` |
| 12 | `tema-12-testing.md` |
| 13 | `tema-13-documentacion.md` |
| 14 | `tema-14-code-review.md` |
| 15 | `tema-15-seguridad.md` |
| 16 | `tema-16-dependencias-migraciones.md` |
| 17 | `tema-17-git.md` |
| 18 | `tema-18-skills.md` |
| 19 | `tema-19-subagentes.md` |
| 20 | `tema-20-mcp.md` |
| 21 | `tema-21-plugins-hooks.md` |
| 22 | `tema-22-cli-avanzada.md` |
| 23 | `tema-23-docker.md` |
| 24 | `tema-24-devops-cicd.md` |
| 25 | `tema-25-arquitectura.md` |
| 26 | `tema-26-equipo-gobierno.md` |
| 27 | `tema-27-proyecto-final.md` |

> Si `SUMMARY.md` no coincide con esta tabla, **gana `SUMMARY.md`**.

---

## Pasos de ejecución

1. **Leer fuentes.** Abre `anexo.md`, localiza el bloque del tema solicitado, extrae el subtítulo y los puntos. Recompón saltos de línea.
2. **Verificar filename.** Localiza el enlace del tema en `docs/SUMMARY.md`.
3. **Releer Tema 1.** Asegúrate de tener fresco el formato de demos y secciones.
4. **Diseñar demos.** Antes de escribir, decide:
   - 2 o 3 demos.
   - Después de qué punto va cada una.
   - Qué se demuestra (con o sin prompt literal, con tabla comparativa o no).
5. **Escribir el archivo** siguiendo la estructura obligatoria.
6. **Revisar antes de cerrar:**
   - [ ] Todos los puntos del anexo aparecen, en orden, con el texto exacto.
   - [ ] Hay 2 o 3 demos (no más, no menos), intercaladas.
   - [ ] No existe sección "## Demos prácticas" al final.
   - [ ] El tono es esquemático: tablas/bullets predominan, prosa solo donde aporta.
   - [ ] Hay un `## Resumen` final con 4–5 bullets.
   - [ ] Cross-links a otros temas resueltos correctamente.
   - [ ] Cero typos en español, tildes correctas.
7. **Reportar al usuario** un resumen muy breve: qué demos se diseñaron y dónde se colocaron.

---

## Antipatrones (qué NO hacer)

- ❌ Reescribir o "mejorar" los puntos del anexo. Son canon.
- ❌ Añadir un punto 11, 12… que no esté en el anexo.
- ❌ Meter las demos al final en una sección "Demos prácticas".
- ❌ Hacer 4+ demos por tema.
- ❌ Usar prosa larga cuando un bullet o una tabla resolvería igual.
- ❌ Inventar comandos o features de Claude Code que no existan; si dudas, dilo en el texto en vez de afirmar.
- ❌ Crear el archivo en una carpeta distinta a `docs/`.
- ❌ Dejar el `SUMMARY.md` desactualizado si el tema no estaba enlazado todavía.

---

## Ejemplo canónico

`docs/tema-01-fundamentos.md` es la **referencia viva**. Cuando dudes de cualquier detalle de formato (cómo se separa una sección, cómo se titula una demo, cuántos bullets en el resumen, dónde van los `---`), abre ese archivo y replica.
