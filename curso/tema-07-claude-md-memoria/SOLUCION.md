# Tema 7 — Solución de referencia

## Ejercicio 1 — Crear un CLAUDE.md desde cero

### Comportamiento esperado SIN CLAUDE.md

Cuando se pide "añade validación: el title no puede estar vacío", Claude típicamente:
- Pone la validación en `routes/` (lógica de interfaz HTTP) — puede ser correcto.
- O en `services/` (mezcla validación de forma con negocio) — error arquitectónico.
- Lanza `throw new Error('title requerido')` — error genérico sin tipo.

### CLAUDE.md mínimo correcto

```markdown
# Notebox

API mínima de notas en Node 24 + Express + TypeScript.

## Arquitectura
- `src/routes/` → endpoints HTTP (Express). Valida forma, llama al service, traduce errores.
- `src/services/` → lógica de negocio. Valida reglas de dominio.
- `src/storage/` → repositorio en memoria (Map).
- `src/models/` → tipos y factories.

## Convenciones
- Validación de **forma** (presencia, tipo, longitud) → `routes/`.
- Validación de **negocio** (¿puede archivar si ya está archivado?) → `services/`.
- Nunca `throw new Error(message)` directo. Usar `{ type: 'INVALID_INPUT', message: '...' }`.
- Tests con `node --test`. Sin mocks del storage en tests de service.

## Comandos
- `npm test`, `npm run typecheck`, `npm run dev`.

## Reglas duras
- No tocar `node_modules/`.
- Cambios al modelo `Note` requieren actualizar tests existentes.
```

### Comportamiento esperado CON CLAUDE.md

Con las reglas anteriores, Claude:
- Pone la validación de `title` en `routes/notes.ts`.
- Usa `{ type: 'INVALID_INPUT', message: 'title requerido' }` en lugar de `Error` genérico.
- La ruta transforma ese objeto a `res.status(400).json({ error: ... })`.

### Lo que el formador valida

- ¿Cambió el lugar de la validación entre sesión 1 y sesión 2?
- ¿Usó error semántico vs Error genérico?
- ¿Son las reglas del CLAUDE.md concretas y verificables?

---

## Ejercicio 2 — Segmentar con .claude/rules/

### Reglas ambiguas en el CLAUDE.md plantado

| Regla | Por qué es ambigua |
|---|---|
| "El código debe ser limpio y mantenible" | Sin criterio concreto — cada agente lo interpreta diferente |
| "Escribe código que un junior pueda entender" | Subjetivo, no afecta decisiones reales |
| "Usa nombres de variable descriptivos" | No define qué es "descriptivo" — no cambia el output |
| "Los tests deben ser rápidos" | Sin umbral concreto — no accionable |

### CLAUDE.md final correcto (tras segmentar)

```markdown
# Notebox

API mínima de notas en Node 24 + Express + TypeScript.

## Arquitectura
- `src/routes/` → endpoints HTTP.
- `src/services/` → lógica de negocio.
- `src/storage/` → repositorio en memoria.
- `src/models/` → tipos y factories.

## Convenciones
- Validación de forma → `routes/`. Validación de negocio → `services/`.
- Ver `.claude/rules/error-handling.md` para el patrón de errores.

## Comandos
- `npm test`, `npm run typecheck`, `npm run dev`.

## Reglas duras
- No tocar `node_modules/`.
- Cambios al modelo `Note` requieren actualizar tests existentes.
```

### Archivos de rules

`.claude/rules/testing.md`:
```markdown
# Reglas de testing — Notebox

- Tests con `node --test`, sin framework externo.
- Un test cubre exactamente un comportamiento. Si el nombre tiene "y", divide.
- Formato: `<función>: <comportamiento esperado>` (ej: `search: devuelve [] con query null`).
- No mockear storage en tests de service — usar `storage._reset()` en `beforeEach`.
- Tests de integración HTTP en `test/*.integration.test.ts` con supertest.
```

`.claude/rules/error-handling.md`:
```markdown
# Manejo de errores — Notebox

- Nunca `throw new Error(message)`. Crear `{ type: 'NOT_FOUND' | 'INVALID_INPUT', message: string }`.
- `routes/` transforma errores del service a HTTP: NOT_FOUND → 404, INVALID_INPUT → 400.
- No incluir stack traces en respuestas de error.
```

### Lo que el formador valida

- ¿Identificó las 3-4 reglas ambiguas? ¿Las justificó?
- ¿El CLAUDE.md final tiene menos líneas y más precisión?
- El test con `createNote: devuelve error si title está vacío` (formato correcto).
