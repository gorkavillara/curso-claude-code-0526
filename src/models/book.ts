import { randomUUID } from 'node:crypto';

export interface Book {
  id: string;
  title: string;
  author: string;
  createdAt: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
}

export function createBook({ title, author }: CreateBookInput): Book {
  return {
    id: randomUUID(),
    title,
    author,
    createdAt: new Date().toISOString(),
  };
}
