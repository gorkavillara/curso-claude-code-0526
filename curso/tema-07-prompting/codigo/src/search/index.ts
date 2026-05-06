import type { Note } from '../models/note.ts';

export function search(notes: Note[], query: string | undefined | null): Note[] {
  if (!query) return [];
  const q = query.trim();
  return notes.filter((note) => {
    const haystack = `${note.title} ${note.body}`;
    return haystack.includes(q);
  });
}
