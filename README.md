# Bookshelf — pequeña API de inventario de libros (Node + Express + TypeScript)

> Rama `tema-01/inicio` del repo del curso. El código del proyecto vive en la raíz: `src/`, `test/`.

API REST minimalista para gestionar un inventario de libros. Almacenamiento en memoria. Sirve como **repo de prácticas** para el Tema 1: explorar un repositorio desconocido con Claude Code y comparar formas de trabajar.

Los enunciados de los ejercicios están en `curso/tema-01-fundamentos/ejercicios.md`.

## Estructura

```
src/
  server.ts            # Entry point Express
  routes/books.ts      # Endpoints HTTP
  storage/memory.ts    # Repositorio en memoria
  models/book.ts       # Tipos + factory
test/
  books.test.ts        # Tests con node --test + supertest
package.json
tsconfig.json
```

## Requisitos

- **Node 24+** (usamos type-stripping nativo).

## Cómo arrancar

```bash
npm install
npm run dev          # arranca en :3000 con --watch
npm test             # ejecuta los tests con node --test
npm run typecheck    # tsc --noEmit
```

## Endpoints

- `POST   /books`        — `{ title, author }` → 201 con el libro creado
- `GET    /books`        — listar todos los libros
- `GET    /books/:id`    — recuperar un libro por id
- `DELETE /books/:id`    — eliminar un libro
- `GET    /health`       — `{ ok: true }`
