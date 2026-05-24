# Soluciones — Tema 11

## Ejercicio 1 — Plan de impacto para PATCH /notes/:id

### Plan de referencia

**Archivos afectados por capa:**

| Capa | Archivo | Cambio necesario |
|---|---|---|
| Servicio | `src/services/notes.ts` | Nuevo método `updateNote(id, { title?, body? })` |
| Ruta | `src/routes/notes.ts` | Nuevo handler `PATCH /notes/:id` |
| Storage | `src/storage/memory.ts` | Método `update(id, changes)` si no existe |
| Modelo | `src/models/note.ts` | Sin cambios (el modelo ya tiene `title` y `body`) |

**Tests que habrá que crear:**

- `updateNote` con solo `title` (body no cambia).
- `updateNote` con solo `body` (title no cambia).
- `updateNote` con ambos campos.
- `updateNote` con ID inexistente → `NoteNotFoundError`.
- `PATCH /notes/:id` con cuerpo vacío → 400.
- `PATCH /notes/:id` con campo desconocido → 400.

**Riesgos:**

1. **PATCH debe ser realmente parcial**: si no se pasa `title`, no debe sobrescribirse con `undefined`.
2. **Validación de campos desconocidos**: si el body incluye `id` o `archived`, la ruta debe rechazarlo.
3. **Retrocompatibilidad del storage**: si `update` no existe en el storage, hay que añadirlo sin romper `save` y `findById`.

### Criterio de éxito

- El plan distingue correctamente las 4 capas.
- Identifica el riesgo del PATCH parcial (no sobrescribir con undefined).
- Los tests incluyen al menos el caso de campo desconocido.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Plan sin riesgos | Pedir explícitamente: "¿qué puede salir mal si implementas esto sin cuidado?" |
| No identificaron el riesgo de sobrescritura parcial | Señalarlo: ¿qué pasa si `PATCH /notes/1 { title: "nuevo" }` sobrescribe `body` con undefined? |
| Tests solo del camino feliz | Pedir que añadan al menos el caso de ID inexistente y el caso de campo desconocido |

---

## Ejercicio 2 — Implementar PATCH por capas

### Implementación de referencia

**Capa 1 — servicio (`src/services/notes.ts`):**

```typescript
async updateNote(id: string, changes: { title?: string; body?: string }): Promise<Note> {
  const note = await this.storage.findById(id);
  if (!note) throw new NoteNotFoundError(id);
  const updated = { ...note, ...changes, updatedAt: new Date() };
  return this.storage.update(id, updated);
}
```

**Capa 2 — ruta (`src/routes/notes.ts`):**

```typescript
router.patch('/:id', async (req, res) => {
  const allowed = new Set(['title', 'body']);
  const unknown = Object.keys(req.body).filter(k => !allowed.has(k));
  if (unknown.length > 0) return res.status(400).json({ error: `Campos no permitidos: ${unknown.join(', ')}` });
  if (!req.body.title && !req.body.body) return res.status(400).json({ error: 'Se requiere al menos title o body' });

  const note = await notesService.updateNote(req.params.id, req.body);
  res.json(note);
});
```

### Criterio de éxito

- El servicio usa spread (`{ ...note, ...changes }`) para no sobrescribir campos no enviados.
- La ruta rechaza campos desconocidos con 400.
- La ruta rechaza body vacío con 400.
- `npm test` verde después de cada capa.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| `Object.assign(note, changes)` muta el objeto original | Señalarlo: usar spread o crear un objeto nuevo |
| No rechazaron campos desconocidos | Preguntar: ¿qué pasa si alguien envía `{ archived: false }`? |
| Implementaron todo de golpe sin validar por capas | Señalarlo sin penalizar — pedir que expliquen cómo sabrían dónde está el problema si algo falla |

---

## Ejercicio 3 — Checklist y descripción de PR

### Checklist de referencia

- [ ] Tests de `updateNote` en verde (camino feliz + parcial + error).
- [ ] Tests de integración del endpoint `PATCH /notes/:id` (200, 400 cuerpo vacío, 400 campo desconocido, 404 ID inexistente).
- [ ] Validación de entrada en la ruta verificada con `npm test`.
- [ ] `npm run typecheck` limpio.
- [ ] README actualizado si documenta los endpoints disponibles.
- [ ] No hay `console.log` en el código nuevo.
- [ ] Revisión manual: ¿el PATCH es realmente parcial (no sobrescribe campos no enviados)?

### Descripción de PR de referencia

```
## Añadir PATCH /notes/:id (actualización parcial)

### Qué hace
Permite actualizar parcialmente una nota. El body puede incluir `title`,
`body` o ambos. Campos no reconocidos se rechazan con 400.

### Por qué
La API solo permitía reemplazar notas completas (PUT). Con este endpoint
los clientes pueden actualizar un campo sin conocer el estado completo.

### Qué se probó
- Actualización solo de title (body no cambia).
- Actualización solo de body.
- Actualización de ambos campos.
- Body vacío → 400.
- Campo desconocido → 400.
- ID inexistente → 404.

### Decisiones de diseño
- La validación de campos permitidos vive en la ruta (forma), no en el servicio (negocio).
- `updatedAt` se actualiza automáticamente al hacer PATCH.

### Riesgos conocidos
- No hay protección contra race conditions en el storage en memoria.
```

### Criterio de éxito

- El checklist incluye tests de integración (no solo unitarios).
- La descripción del PR menciona las decisiones de diseño tomadas.
- La sección "riesgos conocidos" es honesta sobre las limitaciones.

### Errores frecuentes

| Error | Cómo señalarlo |
|---|---|
| Checklist genérico ("los tests pasan") | Pedir que especifiquen qué tests concretos |
| Descripción del PR sin decisiones de diseño | Pedir: ¿dónde pusisteis la validación y por qué ahí? |
| Sin sección de riesgos | Pedir: ¿qué no habéis podido testear o qué dejáis pendiente conscientemente? |
