import { Router } from 'express';
import { notesService } from '../services/notes.js';

export const notesRouter = Router();

notesRouter.post('/', (req, res) => {
  const { title, body } = req.body ?? {};
  const note = notesService.create({ title, body });
  res.status(201).json(note);
});

notesRouter.get('/', (req, res) => {
  const { archived } = req.query;
  const filter =
    archived === undefined ? {} : { archived: archived === 'true' };
  res.json(notesService.list(filter));
});

notesRouter.get('/search', (req, res) => {
  const { q } = req.query;
  res.json(notesService.search(q));
});

notesRouter.post('/:id/archive', (req, res) => {
  const result = notesService.archive(req.params.id);
  if (!result) return res.status(404).json({ error: 'not found' });
  res.json(result);
});

notesRouter.post('/:id/unarchive', (req, res) => {
  const result = notesService.unarchive(req.params.id);
  if (!result) return res.status(404).json({ error: 'not found' });
  res.json(result);
});
