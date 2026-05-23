# Tema 1 — Solución de referencia

## Ejercicio 1 — "Cuéntame este repo en 5 líneas"

### Prompt modelo

```
Resume este repositorio en 5 líneas. Cita archivos concretos por su ruta.
Si no estás seguro de algo, no lo escribas.
```

### Respuesta esperada de Claude

Una buena respuesta menciona los 5 puntos siguientes. Si falta alguno o Claude inventa algo, úsalo como ejemplo en clase:

1. API REST de inventario de libros con operaciones CRUD básicas (`POST /books`, `GET /books`, `GET /books/:id`, `DELETE /books/:id`).
2. Stack: Node 24 + Express + TypeScript con type-stripping nativo (sin transpilación a JS).
3. Entry point: `src/server.ts` exporta `buildApp()`, que monta las rutas desde `src/routes/books.ts`.
4. Almacenamiento **en memoria** (`src/storage/memory.ts`, Map). No es persistente: los datos se pierden al reiniciar.
5. Tests con `node --test` nativos en `test/books.test.ts` (5 casos: crear, rechazar inválido, listar, 404, borrar).

### Errores frecuentes que señalar en clase

| Error de Claude | Por qué importa |
|---|---|
| "Almacenamiento persistente" o "base de datos" | Es un Map en memoria. Señal de que Claude no leyó `storage/memory.ts`. |
| Inventar endpoints que no existen (`PUT /books/:id`) | No existe todavía. Se añade en el Ejercicio 2. |
| Omitir `tsconfig.json` o la ausencia de build step | El README no lo menciona, pero el código sí lo usa. |
| Respuesta de más de 5 líneas | El alumno no impuso la restricción o Claude la ignoró. |

### Lo que el alumno debe detectar al auditar

```bash
cat README.md         # compara con lo que dijo Claude
cat package.json      # ¿mencionó el test runner?
cat src/server.ts     # ¿citó buildApp()?
cat src/storage/memory.ts  # ¿dijo "en memoria"?
```

---

## Ejercicio 2 — Mismo trabajo, dos herramientas

### Solución técnica: `PUT /books/:id`

```ts
// src/routes/books.ts — añadir después del router.get('/:id', ...)

router.put('/:id', (req: Request, res: Response) => {
  const book = storage.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'libro no encontrado' });

  const { title, author } = req.body ?? {};
  if (
    title === undefined &&
    author === undefined
  ) {
    return res.status(400).json({ error: 'se requiere al menos title o author' });
  }

  const updated = storage.update(req.params.id, {
    ...(typeof title === 'string' && { title }),
    ...(typeof author === 'string' && { author }),
  });

  res.json(updated);
});
```

```ts
// src/storage/memory.ts — añadir método update
update(id: string, fields: Partial<Omit<Book, 'id'>>): Book | null {
  const book = this.books.get(id);
  if (!book) return null;
  const updated = { ...book, ...fields };
  this.books.set(id, updated);
  return updated;
}
```

```ts
// test/books.test.ts — test nuevo
it('PUT /books/:id actualiza el título', async () => {
  const create = await request(app).post('/books').send({ title: 'Original', author: 'Autor' });
  const { id } = create.body;
  const r = await request(app).put(`/books/${id}`).send({ title: 'Actualizado' });
  assert.equal(r.status, 200);
  assert.equal(r.body.title, 'Actualizado');
  assert.equal(r.body.author, 'Autor');
});
```

### Lo que el formador valida en la comparativa

| Métrica | Autocompletado | Claude Code |
|---|---|---|
| Tiempo medio | 8-12 min | 3-5 min (con buen prompt) |
| Errores que requieren corrección manual | 1-2 (test, storage.update) | 0-1 si el prompt incluye restricciones |
| Contexto necesario previo | El alumno debe conocer el patrón | Claude lee el código existente |

El objetivo no es que gane Claude: es que el alumno identifique **para qué tipo de tarea le compensa cada herramienta** según su contexto.

---

## Ejercicio 3 — La lista negra del equipo

### Ejemplos de listas bien formadas

**Sí-Claude** (ejemplos representativos):
- Escribir tests para una función que ya existe y tiene comportamiento claro.
- Generar un endpoint CRUD siguiendo el patrón de los que ya hay en el repo.
- Añadir validación de entrada a rutas existentes.
- Documentar una función con JSDoc a partir del código.
- Migrar un componente de callbacks a async/await manteniendo la firma.

**No-Claude** (con justificación):

| Tarea | Por qué no |
|---|---|
| Lógica de precios con reglas de negocio implícitas | Las reglas solo las conoce producto. Claude inventa reglas plausibles pero incorrectas. |
| Cambios en el módulo de pagos / Stripe | Consecuencia silenciosa si falla. No hay test que cubra todos los escenarios reales. |
| Migraciones de BD destructivas (DROP, ALTER) | Irreversible. El riesgo supera el ahorro de tiempo. |
| Cambios en autorización / roles de usuario | Un error expone datos de otros usuarios. Requiere revisión humana siempre. |
| Código en el DSL interno de la empresa | Sin representación en el entrenamiento → alucinaciones garantizadas. |

### Matiz importante para clase

Si un alumno mete "todo lo de seguridad" en No-Claude:

> *"Claude ayuda en seguridad: puede revisar código buscando vulnerabilidades conocidas, sugerir mejoras defensivas, generar tests de seguridad. Lo que no delegamos es la **decisión final**. Volveremos a esto en el Tema 14."*
