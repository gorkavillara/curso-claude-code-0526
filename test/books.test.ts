import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { buildApp } from '../src/server.ts';
import { storage } from '../src/storage/memory.ts';

describe('books API', () => {
  beforeEach(() => storage._reset());
  const app = buildApp();

  it('POST /books crea un libro', async () => {
    const r = await request(app)
      .post('/books')
      .send({ title: 'Refactoring', author: 'Martin Fowler' });
    assert.equal(r.status, 201);
    assert.equal(r.body.title, 'Refactoring');
    assert.ok(r.body.id);
  });

  it('POST /books rechaza payload inválido', async () => {
    const r = await request(app).post('/books').send({ title: 'sin autor' });
    assert.equal(r.status, 400);
  });

  it('GET /books lista los libros', async () => {
    await request(app).post('/books').send({ title: 'A', author: 'X' });
    await request(app).post('/books').send({ title: 'B', author: 'Y' });
    const r = await request(app).get('/books');
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 2);
  });

  it('GET /books/:id devuelve 404 si no existe', async () => {
    const r = await request(app).get('/books/no-existe');
    assert.equal(r.status, 404);
  });

  it('DELETE /books/:id elimina un libro existente', async () => {
    const created = await request(app)
      .post('/books')
      .send({ title: 'A', author: 'X' });
    const r = await request(app).delete(`/books/${created.body.id}`);
    assert.equal(r.status, 204);
    const r2 = await request(app).get(`/books/${created.body.id}`);
    assert.equal(r2.status, 404);
  });
});
