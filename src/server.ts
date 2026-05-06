import express, { type Express } from 'express';
import { booksRouter } from './routes/books.ts';

export function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/books', booksRouter);
  app.get('/health', (_req, res) => res.json({ ok: true }));
  return app;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const port = process.env.PORT ?? 3000;
  buildApp().listen(port, () => {
    console.log(`bookshelf listening on :${port}`);
  });
}
