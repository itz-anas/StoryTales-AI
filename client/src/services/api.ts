import type { Book, Chapter, WizardFormData } from '../types';

const API_BASE = '/api';

export async function getBooks(): Promise<Omit<Book, 'chapters'>[]> {
  const response = await fetch(`${API_BASE}/books`);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}

export async function getBook(id: string): Promise<Book> {
  const response = await fetch(`${API_BASE}/books/${id}`);
  if (!response.ok) throw new Error('Failed to fetch book');
  return response.json();
}

export async function createBook(data: WizardFormData): Promise<Book> {
  const response = await fetch(`${API_BASE}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create book');
  return response.json();
}

export async function generateChapterContent(
  bookId: string,
  chapterId: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch(`${API_BASE}/books/${bookId}/chapters/${chapterId}/generate`, {
    method: 'POST',
  });

  if (!response.ok) throw new Error('Failed to generate chapter');

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    onChunk(chunk);
  }
}

export async function updateChapter(bookId: string, chapterId: string, content: string): Promise<void> {
  const response = await fetch(`${API_BASE}/books/${bookId}/chapters/${chapterId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to update chapter');
}

export async function updateBookCover(bookId: string, coverImage: string): Promise<void> {
  const response = await fetch(`${API_BASE}/books/${bookId}/cover`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coverImage }),
  });
  if (!response.ok) throw new Error('Failed to update cover');
}

export async function addChapter(bookId: string, title: string): Promise<Chapter> {
  const response = await fetch(`${API_BASE}/books/${bookId}/chapters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to add chapter');
  return response.json();
}

export async function deleteBook(bookId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/books/${bookId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete book');
}

export async function deleteChapter(bookId: string, chapterId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/books/${bookId}/chapters/${chapterId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete chapter');
}
