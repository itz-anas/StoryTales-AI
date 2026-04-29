import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { Plus, Clock, Trash2 } from 'lucide-react';

export const Dashboard: React.FC<DashboardProps> = ({ books = [], onNewBook, onOpenBook, onDeleteBook }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalChapters = books.reduce((acc, book) => acc + (book.chapters?.length || 0), 0);
    const uniqueGenres = new Set(books.map(b => b.genre).filter(Boolean)).size;
    return { totalChapters, uniqueGenres };
  }, [books]);

  return (
    /* h-screen + overflow-y-auto ensures the scrollbar only appears when content overflows */
    <div className="h-screen w-full overflow-y-auto bg-[#E6E6E6] text-[#1A1A1A] font-light flex flex-col selection:bg-black selection:text-white">
      
      {/* Main Content Wrapper - flex-1 allows this to grow and push footer down */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-8 pt-10 flex flex-col items-center">
        

        {/* Header Section */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-16">
          <div className="text-center md:text-left">
            <h1 className="text-xs font-bold tracking-[0.2em] uppercase opacity-40 mb-2">Your Library</h1>
            <p className="text-5xl font-bold tracking-tighter uppercase leading-none">
              {books.length} Total Projects
            </p>
          </div>
          <button
            onClick={onNewBook}
            className="bg-[#1A1A1A] text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-110 hover:bg-black transition-all active:scale-95 shadow-2xl"
          >
            Create New Book
          </button>
        </div>

        {/* Stats Row */}
        {books.length > 0 && (
          <div className="w-full flex justify-center md:justify-start gap-20 mb-20">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Chapters</p>
              <p className="text-4xl font-medium tracking-tighter">{stats.totalChapters}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">Genres</p>
              <p className="text-4xl font-medium tracking-tighter">{stats.uniqueGenres}</p>
            </div>
          </div>
        )}

        {/* Grid Area */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => onOpenBook(book.id)}
              className="group bg-white p-10 transition-all duration-500 cursor-pointer relative hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-4"
            >
              <div className="flex justify-between items-start mb-10">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] border border-black/10 px-2 py-1">
                  {book.genre || 'General'}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }} className="text-black/10 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-4 leading-tight">{book.title}</h3>
              <p className="text-sm text-black/50 line-clamp-3 leading-[200%] mb-12">{book.description}</p>
              <div className="flex items-center justify-between pt-6 border-t border-black/5 text-[9px] font-bold uppercase tracking-widest opacity-30">
                <span><Clock size={12} className="inline mr-1" /> {new Date(book.createdAt).toLocaleDateString()}</span>
                <span>{book.chapters?.length || 0} Chapters</span>
              </div>
            </div>
          ))}

          {/* Add Placeholder - Only appears if there is space */}
          {books.length > 0 && (
            <div onClick={onNewBook} className="border border-dashed border-black/10 flex items-center justify-center p-12 group cursor-pointer hover:bg-white transition-all">
              <Plus size={24} className="text-black/10 group-hover:text-black transition-all group-hover:rotate-90 duration-500" />
            </div>
          )}
        </div>
      </div>

      {/* Naked Footer - Pushed to the very bottom */}
      <footer className="w-full py-12 flex flex-col items-center justify-center flex-shrink-0">
        <div className="flex items-center gap-4 opacity-30">
          <span className="text-[15px] font-black uppercase tracking-[0.5em]">
            Powered By SmartTales AI
          </span>
          <span className="w-1 h-1 bg-black rounded-full" />
          <span className="text-[15px] font-bold uppercase tracking-widest">
            2026
          </span>
        </div>
      </footer>
    </div>
  );
};