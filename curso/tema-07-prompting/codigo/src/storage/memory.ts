import type { Note } from '../models/note.ts';

const notes = new Map<string, Note>();

export interface ListFilters {
  archived?: boolean;
}

export const storage = {
  save(note: Note): Note {
    notes.set(note.id, note);
    return note;
  },

  findById(id: string): Note | null {
    return notes.get(id) ?? null;
  },

  list(filters: ListFilters = {}): Note[] {
    const all = Array.from(notes.values());
    if (filters.archived === undefined) return all;
    return all.filter((n) => n.archived === filters.archived);
  },

  update(id: string, patch: Partial<Note>): Note | null {
    const current = notes.get(id);
    if (!current) return null;
    const next: Note = { ...current, ...patch, updatedAt: new Date().toISOString() };
    notes.set(id, next);
    return next;
  },

  _reset(): void {
    notes.clear();
  },
};
