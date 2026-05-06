import type { Book } from '../models/book.ts';

const books = new Map<string, Book>();

export const storage = {
  save(book: Book): Book {
    books.set(book.id, book);
    return book;
  },

  findById(id: string): Book | null {
    return books.get(id) ?? null;
  },

  list(): Book[] {
    return Array.from(books.values());
  },

  remove(id: string): boolean {
    return books.delete(id);
  },

  _reset(): void {
    books.clear();
  },
};
