# Notebox — pequeña API de notas (Node + Express + TypeScript)

Aplicación Node.js deliberadamente **pequeña pero imperfecta**. La usamos en el Tema 7 para practicar **prompting profesional** sobre código real.

## Qué hace

Una API HTTP minimalista para crear, listar, buscar y archivar notas de texto. Almacenamiento en memoria (no es producción).

## Estructura

```
codigo/
  src/
    server.ts              # Entry point Express
    routes/notes.ts        # Endpoints HTTP
    services/notes.ts      # Lógica de negocio (con olores)
    storage/memory.ts      # "Repositorio" en memoria
    search/index.ts        # Búsqueda con un bug sutil
    models/note.ts         # Tipos + factory de notas
  test/
    notes.service.test.ts  # Cobertura incompleta a propósito
    storage.test.ts
  package.json
  tsconfig.json
```

## Requisitos

- **Node 24+** (usamos type-stripping nativo: `node` ejecuta `.ts` directamente sin transpilar).
- En Node 22.x necesitarías el flag `--experimental-strip-types`. Por simplicidad pedimos 24.

## Cómo arrancar

```bash
npm install
npm run dev          # arranca en :3000 con --watch
npm test             # ejecuta los tests con node --test
npm run typecheck    # tsc --noEmit
```

Endpoints:
- `POST   /notes`        — crear  `{ title, body }`
- `GET    /notes`        — listar (filtros: `?archived=true`)
- `GET    /notes/search` — buscar `?q=...`
- `POST   /notes/:id/archive` — archivar
- `POST   /notes/:id/unarchive`

## Lo que NO está bien (a propósito)

Este código tiene **4 problemas diseñados** para los ejercicios. **No los toques antes de leer `ejercicios.md`** — la gracia es que el alumno los descubra prompteando.

> Pista para el formador: están repartidos entre `services/notes.ts`, `search/index.ts`, la validación de entrada en `routes/notes.ts` y la cobertura de tests. Detalles en `SOLUCION.md` (sólo en `main`, no en la rama `tema-07/inicio`).
