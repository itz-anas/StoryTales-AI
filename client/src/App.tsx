import React, { useState, useEffect } from 'react';
import { Book, ViewState, WizardFormData } from './types';
import { Dashboard } from './components/Dashboard';
import { Wizard } from './components/Wizard';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import {
  getBooks, getBook, createBook, generateChapterContent,
  updateChapter, updateBookCover, addChapter,
  deleteBook, deleteChapter as deleteChapterApi,
} from './services/api';

const App: React.FC = () => {
  const [view, setView]               = useState<ViewState>('dashboard');
  const [books, setBooks]             = useState<Omit<Book, 'chapters'>[]>([]);
  const [activeBook, setActiveBook]   = useState<Book | null>(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDark, setIsDark]           = useState(false);

  const toggleTheme = () => setIsDark(p => !p);

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try { setBooks(await getBooks()); }
    catch (e) { console.error('Failed to load books:', e); }
    finally { setIsLoading(false); }
  };

  const handleCreateBook = async (data: WizardFormData) => {
    setIsGenerating(true);
    try {
      const newBook = await createBook(data);
      setBooks(prev => [{ ...newBook, chapters: [] }, ...prev]);
      setActiveBook(newBook);
      setView('editor');
    } catch (e) {
      console.error('Error creating book', e);
      alert('Failed to generate outline. Please try again.');
    } finally { setIsGenerating(false); }
  };

  const handleGenerateChapter = async (chapterId: string) => {
    if (!activeBook) return;
    setActiveBook(prev => !prev ? prev : {
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === chapterId ? { ...c, isGenerating: true, content: '' } : c
      ),
    });
    let accumulated = '';
    try {
      await generateChapterContent(activeBook.id, chapterId, (chunk) => {
        accumulated += chunk;
        setActiveBook(prev => !prev ? prev : {
          ...prev,
          chapters: prev.chapters.map(c =>
            c.id === chapterId ? { ...c, content: accumulated } : c
          ),
        });
      });
      setActiveBook(prev => !prev ? prev : {
        ...prev,
        chapters: prev.chapters.map(c =>
          c.id === chapterId ? { ...c, isGenerating: false, isComplete: true } : c
        ),
      });
    } catch (e) {
      console.error('Error generating chapter', e);
      alert('Failed to generate chapter content.');
      setActiveBook(prev => !prev ? prev : {
        ...prev,
        chapters: prev.chapters.map(c =>
          c.id === chapterId ? { ...c, isGenerating: false } : c
        ),
      });
    }
  };

  const handleUpdateChapter = async (chapterId: string, content: string) => {
    if (!activeBook) return;
    try {
      await updateChapter(activeBook.id, chapterId, content);
      setActiveBook(prev => !prev ? prev : {
        ...prev,
        chapters: prev.chapters.map(c => c.id === chapterId ? { ...c, content } : c),
      });
    } catch (e) { console.error('Failed to update chapter:', e); }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await deleteBook(bookId);
      setBooks(prev => prev.filter(b => b.id !== bookId));
      if (activeBook?.id === bookId) { setActiveBook(null); setView('dashboard'); }
    } catch (e) { console.error('Failed to delete book:', e); }
  };

  const handleUpdateBookCover = async (coverImage: string) => {
    if (!activeBook) return;
    try {
      await updateBookCover(activeBook.id, coverImage);
      setActiveBook(prev => prev ? { ...prev, coverImage } : prev);
    } catch (e) { console.error('Failed to update cover:', e); }
  };

  const handleAddChapter = async (title: string) => {
    if (!activeBook) return;
    try {
      const ch = await addChapter(activeBook.id, title);
      setActiveBook(prev => !prev ? prev : { ...prev, chapters: [...prev.chapters, ch] });
    } catch (e) { console.error('Failed to add chapter:', e); }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!activeBook) return;
    if (!window.confirm('Are you sure you want to delete this chapter?')) return;
    try {
      await deleteChapterApi(activeBook.id, chapterId);
      setActiveBook(prev => !prev ? prev : {
        ...prev,
        chapters: prev.chapters.filter(c => c.id !== chapterId),
      });
    } catch (e) { console.error('Failed to delete chapter:', e); }
  };

  const handleOpenBook = async (bookId: string) => {
    setIsLoading(true);
    try {
      const book = await getBook(bookId);
      setActiveBook(book);
      setView('editor');
    } catch (e) { console.error('Failed to load book:', e); }
    finally { setIsLoading(false); }
  };

  const T = isDark
    ? { bg: '#111010', card: '#1a1818', text: '#f0ece6', accent: '#f0a030' }
    : { bg: '#f2f5f7', card: '#ffffff', text: '#1a2530', accent: '#1a8a8a' };

  return (
    <div className="h-full flex flex-col" style={{ background: T.bg, color: T.text }}>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="p-8 rounded-2xl flex flex-col items-center gap-4 shadow-2xl"
            style={{ background: T.card, border: `1px solid ${isDark ? '#2a2520' : '#ccd8e0'}` }}>
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: T.accent, borderTopColor: 'transparent' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.accent }}>
              Loading...
            </p>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <Dashboard
          books={books}
          onNewBook={() => setView('wizard')}
          onOpenBook={handleOpenBook}
          onDeleteBook={handleDeleteBook}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      {view === 'wizard' && (
        <Wizard
          onCancel={() => setView('dashboard')}
          onSubmit={handleCreateBook}
          isGenerating={isGenerating}
          isDark={isDark}
          toggleTheme={toggleTheme}
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
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      {view === 'preview' && activeBook && (
        <Preview
          book={activeBook}
          onClose={() => setView('editor')}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};

export default App;