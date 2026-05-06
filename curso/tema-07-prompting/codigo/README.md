# Notebox — pequeña API de notas (Node + Express)

Aplicación Node.js deliberadamente **pequeña pero imperfecta**. La usamos en el Tema 7 para practicar **prompting profesional** sobre código real.

## Qué hace

Una API HTTP minimalista para crear, listar, buscar y archivar notas de texto. Almacenamiento en memoria (no es producción).

## Estructura

```
codigo/
  src/
    server.js              # Entry point Express
    routes/notes.js        # Endpoints HTTP
    services/notes.js      # Lógica de negocio (con olores)
    storage/memory.js      # "Repositorio" en memoria
    search/index.js        # Búsqueda con un bug sutil
    models/note.js         # Factory de notas
  test/
    notes.service.test.js  # Cobertura incompleta a propósito
    storage.test.js
  package.json
```

## Cómo arrancar

```bash
npm install
npm run dev          # arranca con nodemon en :3000
npm test             # ejecuta los tests con node --test
```

Endpoints:
- `POST   /notes`        — crear  `{ title, body }`
- `GET    /notes`        — listar (filtros: `?archived=true`)
- `GET    /notes/search` — buscar `?q=...`
- `POST   /notes/:id/archive` — archivar
- `POST   /notes/:id/unarchive`

## Lo que NO está bien (a propósito)

Este código tiene **4 problemas diseñados** para los ejercicios. **No los toques antes de leer `ejercicios.md`** — la gracia es que el alumno los descubra prompteando.

> Pista para el formador: están repartidos entre `services/notes.js`, `search/index.js`, la validación de entrada en `routes/notes.js` y la cobertura de tests. Detalles en `SOLUCION.md` (sólo en `main`, no en la rama `tema-07/inicio`).
