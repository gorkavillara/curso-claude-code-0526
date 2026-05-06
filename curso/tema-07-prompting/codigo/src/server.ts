import express, { type Express } from 'express';
import { notesRouter } from './routes/notes.ts';

export function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/notes', notesRouter);
  app.get('/health', (_req, res) => res.json({ ok: true }));
  return app;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const port = process.env.PORT ?? 3000;
  buildApp().listen(port, () => {
    console.log(`notebox listening on :${port}`);
  });
}
