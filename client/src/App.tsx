import React, { useState, useEffect } from 'react';
import { Book, ViewState, WizardFormData } from './types';
import { Dashboard } from './components/Dashboard';
import { Wizard } from './components/Wizard';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import {
  getBooks,
  getBook,
  createBook,
  generateChapterContent,
  updateChapter,
  updateBookCover,
  addChapter,
  deleteBook,
  deleteChapter as deleteChapterApi,
} from './services/api';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [books, setBooks] = useState<Omit<Book, 'chapters'>[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load books on mount
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBook = async (data: WizardFormData) => {
    setIsGenerating(true);
    try {
      const newBook = await createBook(data);
      setBooks(prev => [{ ...newBook, chapters: [] }, ...prev]);
      setActiveBook(newBook);
      setView('editor');
    } catch (error) {
      console.error("Error creating book", error);
      alert("Failed to generate outline. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateChapter = async (chapterId: string) => {
    if (!activeBook) return;

    try {
      // Update local state to show generating
      setActiveBook(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(c =>
            c.id === chapterId
              ? { ...c, isGenerating: true, content: '' }
              : c
          ),
        };
      });

      let accumulatedContent = '';

      await generateChapterContent(activeBook.id, chapterId, (chunk) => {
        accumulatedContent += chunk;
        setActiveBook(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            chapters: prev.chapters.map(c =>
              c.id === chapterId
                ? { ...c, content: accumulatedContent }
                : c
            ),
          };
        });
      });

      // Mark as complete
      setActiveBook(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(c =>
            c.id === chapterId
              ? { ...c, isGenerating: false, isComplete: true }
              : c
          ),
        };
      });
    } catch (error) {
      console.error("Error generating chapter", error);
      alert("Failed to generate chapter content.");
      // Revert generating state
      setActiveBook(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(c =>
            c.id === chapterId
              ? { ...c, isGenerating: false }
              : c
          ),
        };
      });
    }
  };

  const handleUpdateChapter = async (chapterId: string, content: string) => {
    if (!activeBook) return;

    try {
      await updateChapter(activeBook.id, chapterId, content);
      setActiveBook(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(c =>
            c.id === chapterId ? { ...c, content } : c
          ),
        };
      });
    } catch (error) {
      console.error("Failed to update chapter:", error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteBook(bookId);
        setBooks(prev => prev.filter(b => b.id !== bookId));
        if (activeBook?.id === bookId) {
          setActiveBook(null);
          setView('dashboard');
        }
      } catch (error) {
        console.error("Failed to delete book:", error);
      }
    }
  };

  const handleUpdateBookCover = async (coverImage: string) => {
    if (!activeBook) return;
    try {
      await updateBookCover(activeBook.id, coverImage);
      setActiveBook(prev => prev ? { ...prev, coverImage } : prev);
    } catch (error) {
      console.error("Failed to update cover:", error);
    }
  };

  const handleAddChapter = async (title: string) => {
    if (!activeBook) return;
    try {
      const newChapter = await addChapter(activeBook.id, title);
      setActiveBook(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: [...prev.chapters, newChapter],
        };
      });
    } catch (error) {
      console.error("Failed to add chapter:", error);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!activeBook) return;
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      try {
        await deleteChapterApi(activeBook.id, chapterId);
        setActiveBook(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            chapters: prev.chapters.filter(c => c.id !== chapterId),
          };
        });
      } catch (error) {
        console.error("Failed to delete chapter:", error);
      }
    }
  };

  const handleOpenBook = async (bookId: string) => {
    setIsLoading(true);
    try {
      const book = await getBook(bookId);
      setActiveBook(book);
      setView('editor');
    } catch (error) {
      console.error("Failed to load book:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-center mt-4 text-slate-700 dark:text-slate-300">Loading...</p>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <Dashboard
          books={books}
          onNewBook={() => setView('wizard')}
          onOpenBook={handleOpenBook}
          onDeleteBook={handleDeleteBook}
        />
      )}

      {view === 'wizard' && (
        <Wizard
          onCancel={() => setView('dashboard')}
          onSubmit={handleCreateBook}
          isGenerating={isGenerating}
        />
      )}

      {view === 'editor' && activeBook && (
        <Editor
          book={activeBook}
          onBack={() => { setActiveBook(null); setView('dashboard'); }}
          onUpdateChapter={handleUpdateChapter}
          onGenerateChapter={handleGenerateChapter}
          onUpdateBookCover={handleUpdateBookCover}
          onPreview={() => setView('preview')}
          onAddChapter={handleAddChapter}
          onDeleteChapter={handleDeleteChapter}
        />
      )}

      {view === 'preview' && activeBook && (
        <Preview
          book={activeBook}
          onClose={() => setView('editor')}
        />
      )}
    </div>
  );
};

export default App;
