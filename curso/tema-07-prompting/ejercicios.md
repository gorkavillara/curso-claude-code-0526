# Tema 7 — Ejercicios

> Material de partida: rama `tema-07/inicio`. Carpeta de trabajo: `curso/tema-07-prompting/codigo/`.
> Antes de empezar: `npm install` y `npm test` (todos los tests deben estar verdes).
>
> **Cómo se trabaja:** cada ejercicio se hace **prompteando con Claude Code**, no escribiendo el código a mano. Si os bloqueáis, intentad mejorar el prompt antes de teclear vosotros.

---

## Ejercicio 1 — Cambio mínimo bien acotado (20 min)

### Contexto

`src/services/notes.ts` tiene dos funciones casi idénticas: `archive(id)` y `unarchive(id)`. Están llenas de `if` anidados y duplican estructura.

### Enunciado

Pedid a Claude Code que **refactorice ambas funciones** con estas restricciones:

- Mantener exactamente las firmas `archive(id)` y `unarchive(id)`.
- No tocar **ningún otro archivo** del repositorio.
- Los tests existentes (`npm test`) deben seguir pasando sin cambios.
- No introducir dependencias nuevas.

Después comprobad con `npm test` que todo sigue verde.

### Pista

El prompt debe **prohibir** explícitamente cosas. Si solo dices "refactoriza", Claude puede tocar `routes/`, `models/` o cualquier sitio. La gracia del ejercicio es que el alumno descubra que **las restricciones se escriben antes**.

Esqueleto sugerido:

```
[CONTEXTO]  …
[OBJETIVO]  reducir duplicación entre archive() y unarchive() en
            src/services/notes.ts
[RESTRICCIONES]
- mantener firmas …
- no tocar otros archivos
- npm test debe seguir verde
[FORMATO]   archivo final completo + lista corta de cambios
[EVIDENCIA] dime en una frase qué duplican antes de tocar nada
```

### Solución de referencia

Una versión razonable de `archive`/`unarchive` extrae el patrón común:

```ts
import type { Note } from '../models/note.ts';

function setArchived(id: string, value: boolean): Note | null {
  const note = storage.findById(id);
  if (!note) return null;
  if (note.archived === value) return note;
  if (!note.title) return null;
  return storage.update(id, { archived: value });
}

export const notesService = {
  // ...
  archive(id: string) { return setArchived(id, true); },
  unarchive(id: string) { return setArchived(id, false); },
};
```

Lo que el formador valida en clase:
- ¿Mantuvo las firmas? ✅
- ¿Tocó solo `services/notes.ts`? ✅
- ¿Pasan los tests? ✅
- ¿La explicación final es honesta o se inventa cambios?

---

## Ejercicio 2 — Diagnóstico antes de arreglar (25 min)

### Contexto

Un usuario reporta dos bugs de búsqueda:

1. Crea una nota con título `"Mañana es lunes"`. Busca con `q=MAÑANA`. No devuelve nada.
2. Busca con `q=manana` (sin ñ). Tampoco devuelve nada.

El código sospechoso vive en `src/search/index.ts`.

### Enunciado

**Antes de pedir el arreglo**, pedid a Claude Code que os dé **3 alternativas** para resolver el problema, con sus trade-offs (coste, riesgos, casos donde se queda corta cada una).

Después, **vosotros** (no Claude) decidís cuál implementar y prompteáis el cambio con un segundo prompt acotado.

Para cerrar:
- Añadid al menos **2 tests nuevos** que cubran los dos casos del bug (mayúsculas y acentos).
- `npm test` debe seguir verde con los tests viejos **y** los nuevos.

### Pista

- El prompt 1 (alternativas) **no debe pedir código**. Si Claude empieza a escribir código, repíteselo.
- El prompt 2 (implementación) sí pide código, pero solo de `search/index.ts` y de los tests. Nada más.
- Si os tienta saltaros el paso 1, recordad: **decisiones de diseño no se delegan**.

### Solución de referencia

Las 3 alternativas típicas:

| Alternativa | Coste | Riesgos | Se queda corta en… |
|---|---|---|---|
| `toLowerCase()` en haystack y query | 1 línea | Ninguno | Acentos (mañana ≠ manana) |
| `toLowerCase() + normalize('NFD').replace(/\p{Diacritic}/gu, '')` | 2-3 líneas | Pierde matiz semántico (ñ → n). Aceptable para búsqueda. | Búsqueda fuzzy / typos |
| Indexar con una lib (`fuse.js`, `flexsearch`) | dependencia + setup | Más superficie, sobre-ingeniería para una nota en memoria | — |

Implementación esperada del paso 2:

```js
// src/search/index.ts
import type { Note } from '../models/note.ts';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function search(notes: Note[], query: string | undefined | null): Note[] {
  if (!query) return [];
  const q = normalize(query.trim());
  if (!q) return [];
  return notes.filter((note) =>
    normalize(`${note.title} ${note.body}`).includes(q),
  );
}
```

Tests nuevos (en un archivo `test/search.test.ts`):

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { search } from '../src/search/index.ts';

describe('search', () => {
  const notes = [{ title: 'Mañana es lunes', body: '' }];

  it('encuentra ignorando mayúsculas', () => {
    assert.equal(search(notes, 'MAÑANA').length, 1);
  });

  it('encuentra ignorando acentos', () => {
    assert.equal(search(notes, 'manana').length, 1);
  });

  it('devuelve vacío con query vacía', () => {
    assert.deepEqual(search(notes, ''), []);
  });
});
```

Lo que el formador valida:
- ¿El alumno se resistió a pedir código en el prompt 1?
- ¿Eligió la opción (b) o justificó (a) o (c)?
- ¿Los tests nuevos cubren ambos casos del bug?

---

## Ejercicio 3 — Validación en la frontera (15 min)

### Contexto

`POST /notes` en `src/routes/notes.ts` acepta cualquier cosa: título vacío, body de 1 MB, peticiones sin body. La aplicación no se rompe pero guarda basura.

### Enunciado

Prompted a Claude Code para añadir **validación mínima** en la capa de ruta:

- `title`: requerido, string no vacío, máximo 200 caracteres.
- `body`: opcional, máximo 5000 caracteres.
- Respuesta `400` con `{ error: <mensaje claro> }` cuando falle.

Restricciones:
- Sin librerías nuevas (no `zod`, no `joi`, no `express-validator`).
- Cambio acotado a `src/routes/notes.ts`.
- Tests existentes deben seguir pasando.

Añadid 3 tests nuevos: título ausente, título demasiado largo, body demasiado largo.

### Pista

La pregunta interesante de este ejercicio no es "¿cómo valido?", es **"¿dónde valido?"**. Si Claude propone validar dentro del service, párale: la validación de **forma** va en la frontera HTTP. La validación de **negocio** (p.ej. "no puedes archivar dos veces") va en el service.

### Solución de referencia

```ts
// src/routes/notes.ts
import type { Request, Response } from 'express';

const TITLE_MAX = 200;
const BODY_MAX = 5000;

function validateCreatePayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return 'body requerido';
  const { title, body } = payload as { title?: unknown; body?: unknown };
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'title requerido';
  }
  if (title.length > TITLE_MAX) return `title demasiado largo (max ${TITLE_MAX})`;
  if (body !== undefined && typeof body !== 'string') return 'body debe ser string';
  if (body !== undefined && body.length > BODY_MAX) {
    return `body demasiado largo (max ${BODY_MAX})`;
  }
  return null;
}

notesRouter.post('/', (req: Request, res: Response) => {
  const error = validateCreatePayload(req.body);
  if (error) return res.status(400).json({ error });
  const note = notesService.create({
    title: (req.body.title as string).trim(),
    body: req.body.body as string | undefined,
  });
  res.status(201).json(note);
});
```

Tests nuevos (con `supertest`):

```js
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { buildApp } from '../src/server.ts';
import { storage } from '../src/storage/memory.ts';

describe('POST /notes validación', () => {
  beforeEach(() => storage._reset());
  const app = buildApp();

  it('400 si falta title', async () => {
    const r = await request(app).post('/notes').send({ body: 'x' });
    assert.equal(r.status, 400);
  });

  it('400 si title pasa de 200', async () => {
    const r = await request(app)
      .post('/notes')
      .send({ title: 'a'.repeat(201) });
    assert.equal(r.status, 400);
  });

  it('400 si body pasa de 5000', async () => {
    const r = await request(app)
      .post('/notes')
      .send({ title: 'ok', body: 'x'.repeat(5001) });
    assert.equal(r.status, 400);
  });
});
```

Lo que el formador valida:
- ¿Validó en `routes/`, no en `services/`?
- ¿Sin librerías nuevas?
- ¿Los mensajes de error son útiles?

---

## Cierre del bloque

Tres preguntas para asentar:

1. ¿Qué cambia en tu prompt cuando pides "alternativas" en lugar de "implementación"?
2. ¿Cuál es la diferencia entre validación de forma y validación de negocio? ¿Por qué importa al prompter?
3. Si tuvieras que reducir un prompt profesional a una sola regla, ¿cuál sería?

(Respuesta esperada de la 3: *"Decir lo que NO se puede tocar."*)

---

## Para el formador — los 4 problemas plantados

Por si los alumnos no los detectan todos:

1. **`services/notes.ts`**: anidación profunda y duplicación entre `archive`/`unarchive` → Ejercicio 1.
2. **`search/index.ts`**: no normaliza case ni acentos → Ejercicio 2.
3. **`routes/notes.ts`**: sin validación de entrada → Ejercicio 3.
4. **Cobertura de tests**: no hay tests para `search/` ni para validación HTTP → se completa al hacer los ejercicios 2 y 3.
