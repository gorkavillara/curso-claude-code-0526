import { randomUUID } from 'node:crypto';

export function createNote({ title, body }) {
  return {
    id: randomUUID(),
    title,
    body: body ?? '',
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
