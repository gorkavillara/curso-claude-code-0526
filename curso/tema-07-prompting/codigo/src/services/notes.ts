import { createNote, type CreateNoteInput, type Note } from '../models/note.ts';
import { storage, type ListFilters } from '../storage/memory.ts';
import { search as searchIndex } from '../search/index.ts';

export const notesService = {
  create(input: CreateNoteInput): Note {
    const note = createNote(input);
    return storage.save(note);
  },

  list(filters?: ListFilters): Note[] {
    return storage.list(filters);
  },

  search(query: string | undefined | null): Note[] {
    const all = storage.list();
    return searchIndex(all, query);
  },

  archive(id: string): Note | null {
    const note = storage.findById(id);
    if (note) {
      if (note.archived === false) {
        if (note.title && note.title.length > 0) {
          const updated = storage.update(id, { archived: true });
          if (updated) {
            return updated;
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return note;
      }
    } else {
      return null;
    }
  },

  unarchive(id: string): Note | null {
    const note = storage.findById(id);
    if (note) {
      if (note.archived === true) {
        if (note.title && note.title.length > 0) {
          const updated = storage.update(id, { archived: false });
          if (updated) {
            return updated;
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return note;
      }
    } else {
      return null;
    }
  },
};
