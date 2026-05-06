import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../src/storage/memory.ts';
import { createNote } from '../src/models/note.ts';

describe('storage/memory', () => {
  beforeEach(() => storage._reset());

  it('guarda y recupera una nota', () => {
    const note = storage.save(createNote({ title: 'a', body: 'b' }));
    assert.equal(storage.findById(note.id)?.title, 'a');
  });

  it('lista todas las notas cuando no se filtra', () => {
    storage.save(createNote({ title: 'a' }));
    storage.save(createNote({ title: 'b' }));
    assert.equal(storage.list().length, 2);
  });

  it('filtra por archived', () => {
    const n1 = storage.save(createNote({ title: 'a' }));
    storage.save(createNote({ title: 'b' }));
    storage.update(n1.id, { archived: true });
    assert.equal(storage.list({ archived: true }).length, 1);
    assert.equal(storage.list({ archived: false }).length, 1);
  });
});
