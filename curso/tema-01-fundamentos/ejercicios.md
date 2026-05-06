# Tema 1 — Ejercicios

> Material de partida: rama `tema-01/inicio`. El código vive en la **raíz** del repo (`src/`, `test/`, `package.json`...). Es una API minimalista de inventario de libros.
> Antes de empezar: `git checkout tema-01/inicio`, `npm install` y `npm test` (deben pasar todos en verde).

Este tema es **conceptual**. Los ejercicios son de **observación, criterio y comparación** — no de implementación. El backend está aquí solo para tener algo concreto sobre lo que prompter.

---

## Ejercicio 1 — "Cuéntame este repo en 5 líneas" (15 min)

### Enunciado

Abre Claude Code apuntando a la raíz de este repo. Sin tú abrir ningún archivo a mano, pídele que te resuma el proyecto con esta restricción: **5 líneas, sin inventar, citando archivos**.

Después responde por escrito (un párrafo corto):
1. ¿Acertó en lo importante?
2. ¿Se inventó algo? ¿Cómo lo detectaste? (Pista: ahora sí puedes abrir archivos para validar.)
3. ¿Usarías esa descripción tal cual para onboardear a un compañero nuevo?

### Pista

Empieza con un prompt restrictivo:

```
Resume este repositorio en 5 líneas. Cita archivos concretos por su ruta.
Si no estás seguro de algo, no lo escribas.
```

El truco está en que **tú vas a auditar al modelo**, no aprender del repo. Dale una pasada después con `cat README.md`, `cat package.json` y un vistazo a `src/`.

### Solución de referencia (qué espero leer del alumno)

Una buena descripción del repo menciona:
- Es una **API REST** de inventario de libros (CRUD básico).
- Stack: **Node 24 + Express + TypeScript** ejecutado con type-stripping nativo.
- Entry point: `src/server.ts` → `buildApp()` que monta `src/routes/books.ts`.
- Almacenamiento **en memoria** (`src/storage/memory.ts`), no producción.
- Tests con `node --test` en `test/`.

Lo que el formador valida:
- Si Claude inventó endpoints que no existen → señalarlo en clase.
- Si Claude se saltó `tsconfig.json` → puntualizar que el README no menciona TS pero el código sí.
- Si Claude dijo "almacenamiento persistente": **error**, no lo es.

---

## Ejercicio 2 — Mismo trabajo, dos herramientas (20 min)

### Enunciado

Vais a **añadir un nuevo endpoint** `PUT /books/:id` que actualice el libro existente. Hacedlo dos veces:

- **A)** Solo con autocompletado de vuestro IDE (Copilot, IntelliSense, lo que uséis).
- **B)** Solo con Claude Code, prompteando la tarea entera.

Cronometrad cada una. Anotad:
- Tiempo total.
- Errores que tuvisteis que corregir vosotros.
- Si el resultado final fue equivalente.

> Importante: para hacer la versión A y la versión B no podéis empezar de la misma rama modificada. Trabajad en dos ramas distintas (`mi-prueba-a` y `mi-prueba-b`) que partan ambas de `tema-01/inicio`. Al final, descartadlas.

### Pista

La tarea tiene esta forma:

- `PUT /books/:id` recibe `{ title?, author? }`.
- Si el libro no existe → 404.
- Si la entrada está vacía o no es objeto → 400.
- Si va bien → 200 con el libro actualizado.
- Añadid 1 test que cubra el caso "actualizo el título de un libro existente".

### Solución de referencia (lo que el ejercicio debería revelar)

No hay un "ganador" predeterminado. Lo importante es que el alumno **identifique para qué tipo de tarea le compensó cada herramienta**.

Patrones esperables:

- Con autocompletado: rápido escribir el handler si ya tienes el patrón en la cabeza, pero te toca escribir el test desde cero.
- Con Claude: si prompteas bien, te resuelve handler + test + actualización mental del README en una sola pasada. Si prompteas mal, tarda más que a mano.
- Si el alumno dice "perdí 5 min explicándole el contexto": señal de que el repo no estaba realmente abierto, o el prompt era genérico.

---

## Ejercicio 3 — La lista negra del equipo (15 min)

### Enunciado

Mirando este repo y pensando en tu **proyecto real** (no en este de ejemplo), escribe **dos listas cortas**:

- **Sí-Claude**: 5 tareas concretas que delegarías a Claude Code mañana.
- **No-Claude**: 5 tareas que **NO** delegarías ni con buenos prompts. Para cada una, una frase de por qué.

### Pista

No vale "lo que sea sencillo / complicado". Pide categorías como:

- ¿Es tarea con **resultado verificable** rápido?
- ¿Tiene **consecuencia silenciosa** si falla? (pagos, permisos, migraciones, criptografía)
- ¿Hay **convenciones implícitas** del equipo que no están escritas en ningún sitio?

### Solución de referencia (criterios que espero ver en la lista "No-Claude")

- Lógica de **negocio sutil** que sólo está clara hablando con producto.
- Cambios sobre **infra de pagos / autenticación / autorización** sin revisión humana posterior.
- **Migraciones de datos destructivas** (drop, alter sin reversible).
- Código en lenguajes / frameworks **muy poco representados** en el entrenamiento (DSLs internos).
- Cambios donde **no hay test** ni manera fácil de comprobar que sigue funcionando.

Si un alumno mete "todo lo de seguridad" en No-Claude, matízalo: Claude **ayuda** en seguridad (lo veremos en Tema 14), pero la decisión final es humana.

---

## Cierre del bloque

Tres preguntas para pasar de tema (oral o en chat):

1. ¿Qué tarea de tu próxima sprint le pasarías a Claude Code el primer día?
2. ¿Qué tarea **no** le pasarías ni aunque te insistan?
3. ¿Cuál crees que es el mayor riesgo si tu equipo entero adopta esto sin método?

Estas tres preguntas vuelven a salir en el Tema 26 (gobierno y estándares de equipo). Es la primera siembra.
