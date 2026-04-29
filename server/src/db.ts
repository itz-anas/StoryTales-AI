import { createClient } from "@libsql/client";

// ── Turso client ──────────────────────────────────────────────
const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// ── Create tables on startup ──────────────────────────────────
export async function initDb() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      genre TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      description TEXT NOT NULL,
      cover_image TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      outline TEXT NOT NULL,
      content TEXT,
      sort_order INTEGER NOT NULL,
      is_complete INTEGER DEFAULT 0
    );
  `);
}

// ── Types ─────────────────────────────────────────────────────
export interface BookRow {
  id: string;
  title: string;
  genre: string;
  target_audience: string;
  description: string;
  cover_image: string | null;
  created_at: number;
}

export interface ChapterRow {
  id: string;
  book_id: string;
  title: string;
  outline: string;
  content: string | null;
  sort_order: number;
  is_complete: number;
}

// ── Helpers ───────────────────────────────────────────────────
// Turso returns rows as Record<string, Value> — cast to typed rows
function toBookRow(row: Record<string, any>): BookRow {
  return {
    id:              String(row.id),
    title:           String(row.title),
    genre:           String(row.genre),
    target_audience: String(row.target_audience),
    description:     String(row.description),
    cover_image:     row.cover_image ? String(row.cover_image) : null,
    created_at:      Number(row.created_at),
  };
}

function toChapterRow(row: Record<string, any>): ChapterRow {
  return {
    id:         String(row.id),
    book_id:    String(row.book_id),
    title:      String(row.title),
    outline:    String(row.outline),
    content:    row.content ? String(row.content) : null,
    sort_order: Number(row.sort_order),
    is_complete: Number(row.is_complete),
  };
}

// ── Queries ───────────────────────────────────────────────────
export async function getAllBooks(): Promise<BookRow[]> {
  const result = await db.execute("SELECT * FROM books ORDER BY created_at DESC");
  return result.rows.map(toBookRow);
}

export async function getBookById(id: string): Promise<BookRow | null> {
  const result = await db.execute({
    sql: "SELECT * FROM books WHERE id = ?",
    args: [id],
  });
  return result.rows.length ? toBookRow(result.rows[0]) : null;
}

export async function getChaptersByBookId(bookId: string): Promise<ChapterRow[]> {
  const result = await db.execute({
    sql: "SELECT * FROM chapters WHERE book_id = ? ORDER BY sort_order",
    args: [bookId],
  });
  return result.rows.map(toChapterRow);
}

export async function insertBook(book: BookRow): Promise<void> {
  await db.execute({
    sql: "INSERT INTO books (id, title, genre, target_audience, description, cover_image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [book.id, book.title, book.genre, book.target_audience, book.description, book.cover_image, book.created_at],
  });
}

export async function insertChapter(chapter: Omit<ChapterRow, "content"> & { content?: string }): Promise<void> {
  await db.execute({
    sql: "INSERT INTO chapters (id, book_id, title, outline, content, sort_order, is_complete) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [chapter.id, chapter.book_id, chapter.title, chapter.outline, chapter.content || null, chapter.sort_order, chapter.is_complete],
  });
}

export async function updateChapterContent(id: string, content: string, isComplete: boolean): Promise<void> {
  await db.execute({
    sql: "UPDATE chapters SET content = ?, is_complete = ? WHERE id = ?",
    args: [content, isComplete ? 1 : 0, id],
  });
}

export async function updateBookCover(bookId: string, coverImage: string): Promise<void> {
  await db.execute({
    sql: "UPDATE books SET cover_image = ? WHERE id = ?",
    args: [coverImage, bookId],
  });
}

export async function deleteBook(id: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM books WHERE id = ?",
    args: [id],
  });
}

export async function deleteChapter(id: string): Promise<void> {
  await db.execute({
    sql: "DELETE FROM chapters WHERE id = ?",
    args: [id],
  });
}

export default db;