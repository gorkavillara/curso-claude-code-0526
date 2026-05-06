import { createNote } from '../models/note.js';
import { storage } from '../storage/memory.js';
import { search as searchIndex } from '../search/index.js';

export const notesService = {
  create({ title, body }) {
    const note = createNote({ title, body });
    return storage.save(note);
  },

  list(filters) {
    return storage.list(filters);
  },

  search(query) {
    const all = storage.list();
    return searchIndex(all, query);
  },

  archive(id) {
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

  unarchive(id) {
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
