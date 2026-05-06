import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { notesService } from '../src/services/notes.js';
import { storage } from '../src/storage/memory.js';

describe('notesService', () => {
  beforeEach(() => storage._reset());

  it('crea una nota con título y body', () => {
    const n = notesService.create({ title: 'hola', body: 'mundo' });
    assert.equal(n.title, 'hola');
    assert.equal(n.archived, false);
  });

  it('archiva una nota existente', () => {
    const n = notesService.create({ title: 'hola' });
    const archived = notesService.archive(n.id);
    assert.equal(archived.archived, true);
  });

  it('desarchiva una nota archivada', () => {
    const n = notesService.create({ title: 'hola' });
    notesService.archive(n.id);
    const back = notesService.unarchive(n.id);
    assert.equal(back.archived, false);
  });

  it('devuelve null al archivar una nota inexistente', () => {
    assert.equal(notesService.archive('no-existe'), null);
  });
});
