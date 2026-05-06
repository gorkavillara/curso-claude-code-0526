import { randomUUID } from 'node:crypto';

export interface Note {
  id: string;
  title: string;
  body: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  body?: string;
}

export function createNote({ title, body }: CreateNoteInput): Note {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    title,
    body: body ?? '',
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}
