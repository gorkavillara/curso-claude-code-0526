const notes = new Map();

export const storage = {
  save(note) {
    notes.set(note.id, note);
    return note;
  },

  findById(id) {
    return notes.get(id) ?? null;
  },

  list({ archived } = {}) {
    const all = Array.from(notes.values());
    if (archived === undefined) return all;
    return all.filter((n) => n.archived === archived);
  },

  update(id, patch) {
    const current = notes.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    notes.set(id, next);
    return next;
  },

  _reset() {
    notes.clear();
  },
};
