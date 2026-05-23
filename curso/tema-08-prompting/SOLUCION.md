# Tema 8 — Solución de referencia

## Ejercicio 1 — Refactor acotado

### Comportamiento del prompt vago

"Refactoriza services/notes.ts, está un poco desordenado" en modo default típicamente:
- Toca `routes/notes.ts` también (para "completar" el refactor).
- Renombra variables que no pediste.
- A veces cambia la firma de `archive` a `archive(id: string): Promise<Note | null>`.
- Agrega `console.log` de debug.

### Resultado esperado del prompt con restricciones

```ts
// src/services/notes.ts — función auxiliar extraída
function setArchived(id: string, value: boolean): Note | null {
  const note = storage.findById(id);
  if (!note) return null;
  if (note.archived === value) return note;
  if (!note.title) return null;
  return storage.update(id, { archived: value });
}

// Las firmas públicas quedan igual:
archive(id: string): Note | null { return setArchived(id, true); },
unarchive(id: string): Note | null { return setArchived(id, false); },
```

**Lo que el formador valida:**
- ¿Solo tocó `src/services/notes.ts`? ✅
- ¿Mantiene las firmas `archive(id)` y `unarchive(id)`? ✅
- ¿`npm test` pasa? ✅
- ¿La evidencia previa fue honesta o se inventó cambios?

---

## Ejercicio 2 — Diagnóstico antes de implementar

### Las 3 alternativas típicas

| Alternativa | Coste | Riesgos | Se queda corta en |
|---|---|---|---|
| `toLowerCase()` en haystack y query | 1 línea | Ninguno | Acentos (mañana ≠ manana) |
| `toLowerCase() + normalize('NFD').replace(/\p{Diacritic}/gu, '')` | 3-4 líneas | Pierde matiz semántico (ñ → n). Aceptable para búsqueda | Búsqueda fuzzy / typos |
| Indexar con lib (`fuse.js`, `flexsearch`) | dependencia + setup | Más superficie, sobre-ingeniería para API en memoria | — |

**La opción correcta para este proyecto:** alternativa 2 — sin dependencias, cubre los dos casos del bug.

### Implementación esperada

```ts
// src/search/index.ts
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function search(notes: Note[], query: string | undefined | null): Note[] {
  if (!query) return [];
  const q = normalize(query.trim());
  if (!q) return [];
  return notes.filter((note) =>
    normalize(`${note.title} ${note.body}`).includes(q)
  );
}
```

### Tests nuevos esperados (`test/search.test.ts`)

```ts
describe('search', () => {
  const notes = [{ id: '1', title: 'Mañana es lunes', body: '', archived: false, createdAt: new Date() }];

  it('search: encuentra ignorando mayúsculas', () => {
    assert.equal(search(notes, 'MAÑANA').length, 1);
  });

  it('search: encuentra ignorando acentos', () => {
    assert.equal(search(notes, 'manana').length, 1);
  });

  it('search: devuelve vacío con query vacía', () => {
    assert.deepEqual(search(notes, ''), []);
  });
});
```

---

## Ejercicio 3 — Validación en la frontera correcta

### La decisión arquitectónica correcta

**Validación de forma** (`title` presente, `body` no demasiado largo) → `src/routes/notes.ts`.

Razón: la frontera HTTP es quien conoce el formato de la petición. El service no debería recibir inputs inválidos — confía en que la ruta ya los filtró.

**Validación de negocio** (¿puede archivar una nota ya archivada?) → `src/services/notes.ts`.

Razón: es una regla de dominio, no de formato. No depende de HTTP.

### Implementación esperada

```ts
// src/routes/notes.ts
function validateCreatePayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return 'body requerido';
  const { title, body } = payload as { title?: unknown; body?: unknown };
  if (typeof title !== 'string' || title.trim().length === 0) return 'title requerido';
  if (title.length > 200) return `title demasiado largo (max 200)`;
  if (body !== undefined && typeof body !== 'string') return 'body debe ser string';
  if (body !== undefined && body.length > 5000) return `body demasiado largo (max 5000)`;
  return null;
}

router.post('/', (req, res) => {
  const error = validateCreatePayload(req.body);
  if (error) return res.status(400).json({ error });
  const note = notesService.create({ title: req.body.title.trim(), body: req.body.body });
  res.status(201).json(note);
});
```

### Tests nuevos esperados

```ts
describe('POST /notes validación', () => {
  it('400 si falta title', async () => {
    const r = await request(app).post('/notes').send({ body: 'x' });
    assert.equal(r.status, 400);
  });
  it('400 si title supera 200 chars', async () => {
    const r = await request(app).post('/notes').send({ title: 'a'.repeat(201) });
    assert.equal(r.status, 400);
  });
  it('400 si body supera 5000 chars', async () => {
    const r = await request(app).post('/notes').send({ title: 'ok', body: 'x'.repeat(5001) });
    assert.equal(r.status, 400);
  });
});
```

### Lo que el formador valida

- ¿Validó en `routes/`, no en `services/`?
- ¿Sin librerías nuevas?
- ¿Los mensajes de error son útiles?
- Si Claude puso la validación en el sitio equivocado: ¿lo detectó el alumno y lo debatió?
