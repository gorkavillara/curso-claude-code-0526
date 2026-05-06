export function search(notes, query) {
  if (!query) return [];
  const q = query.trim();
  return notes.filter((note) => {
    const haystack = `${note.title} ${note.body}`;
    return haystack.includes(q);
  });
}
