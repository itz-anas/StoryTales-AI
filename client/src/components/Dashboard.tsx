import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { Plus, Clock, Trash2, Video, Sun, Moon } from 'lucide-react';

interface DashboardProps {
  books: Omit<Book, 'chapters'>[];
  onNewBook: () => void;
  onOpenBook: (id: string) => void;
  onDeleteBook: (id: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const getT = (isDark: boolean) => isDark ? {
  pageBg: '#111010', cardBg: '#1a1818', statBg: '#1a1818',
  border: '#2a2520', borderCard: '#2a2520',
  text: '#f0ece6', textMuted: '#7a7068', textFaint: '#3a3028',
  accent: '#f0a030', accentFg: '#111010', accentBg: 'rgba(240,160,48,0.1)',
  accentBorder: '#3a3020', footerBorder: '#1e1c18',
  sketchOpacity: 0.06, toggleBg: '#1a1818', toggleBorder: '#2a2520',
  progressTrack: '#2a2520', placeholder: '#2a2520', placeholderIcon: '#3a3028',
  placeholderHover: 'rgba(240,160,48,0.05)',
} : {
  pageBg: '#f2f5f7', cardBg: '#ffffff', statBg: '#e4ecf0',
  border: '#ccd8e0', borderCard: '#dce8f0',
  text: '#1a2530', textMuted: '#8090a0', textFaint: '#b0c8d8',
  accent: '#1a8a8a', accentFg: '#ffffff', accentBg: 'rgba(26,138,138,0.08)',
  accentBorder: '#a0d0d0', footerBorder: '#dce8f0',
  sketchOpacity: 0.07, toggleBg: '#e4ecf0', toggleBorder: '#ccd8e0',
  progressTrack: '#dce8f0', placeholder: '#dce8f0', placeholderIcon: '#b0c8d8',
  placeholderHover: 'rgba(26,138,138,0.04)',
};

const GENRE_STYLES: Record<string, { bar: string; badgeBg: string; badgeText: string }> = {
  fiction:     { bar: 'linear-gradient(90deg,#7c5cad,#9b6dc5)', badgeBg: '#f0eaf8', badgeText: '#7c5cad' },
  mystery:     { bar: 'linear-gradient(90deg,#1d6a7a,#2a9db5)', badgeBg: '#e0f5fa', badgeText: '#1d6a7a' },
  'sci-fi':    { bar: 'linear-gradient(90deg,#1a6b3a,#27a85a)', badgeBg: '#e0f5ea', badgeText: '#1a6b3a' },
  scifi:       { bar: 'linear-gradient(90deg,#1a6b3a,#27a85a)', badgeBg: '#e0f5ea', badgeText: '#1a6b3a' },
  business:    { bar: 'linear-gradient(90deg,#b5651d,#e07b2a)', badgeBg: '#fef0e0', badgeText: '#b5651d' },
  'self help': { bar: 'linear-gradient(90deg,#8b1a2a,#c4283e)', badgeBg: '#fde8ea', badgeText: '#8b1a2a' },
  selfhelp:    { bar: 'linear-gradient(90deg,#8b1a2a,#c4283e)', badgeBg: '#fde8ea', badgeText: '#8b1a2a' },
  romance:     { bar: 'linear-gradient(90deg,#8a1a4a,#c4286e)', badgeBg: '#fde8f2', badgeText: '#8a1a4a' },
  horror:      { bar: 'linear-gradient(90deg,#3a0a0a,#8b1a1a)', badgeBg: '#fde8e8', badgeText: '#8b1a1a' },
  fantasy:     { bar: 'linear-gradient(90deg,#1a3a7a,#2a5ab5)', badgeBg: '#e8eef8', badgeText: '#1a3a7a' },
  default:     { bar: 'linear-gradient(90deg,#1a8a8a,#30b8b8)', badgeBg: '#e0f5f5', badgeText: '#1a8a8a' },
};

function getGenreStyle(genre?: string, dark = false) {
  const key = (genre || '').toLowerCase().replace(/\s+/g, '');
  const s = GENRE_STYLES[key] || GENRE_STYLES[(genre || '').toLowerCase()] || GENRE_STYLES.default;
  return dark ? { ...s, badgeBg: 'rgba(255,255,255,0.07)' } : s;
}

const SketchBg: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => (
  <svg className="pointer-events-none absolute inset-0 w-full h-full"
    viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
    <g stroke={color} strokeWidth="1.2" fill="none">
      <path d="M80 100 Q110 72 140 100 L140 230 Q110 210 80 230 Z" strokeDasharray="4 3" />
      <path d="M140 100 Q170 72 200 100 L200 230 Q170 210 140 230 Z" strokeDasharray="4 3" />
      <line x1="140" y1="100" x2="140" y2="230" strokeDasharray="3 4" />
      <line x1="95" y1="130" x2="133" y2="130" strokeDasharray="3 5" />
      <line x1="95" y1="148" x2="130" y2="148" strokeDasharray="3 5" />
      <line x1="148" y1="130" x2="188" y2="130" strokeDasharray="3 5" />
      <line x1="148" y1="148" x2="185" y2="148" strokeDasharray="3 5" />
    </g>
    <g stroke={color} strokeWidth="1.2" fill="none">
      <path d="M1050 40 Q1110 10 1140 55 Q1090 110 1040 170 Q1048 120 1050 40Z" strokeDasharray="4 3" />
      <line x1="1050" y1="40" x2="1040" y2="170" strokeDasharray="3 4" />
    </g>
    <g stroke={color} strokeWidth="0.9" fill="none">
      <path d="M340 55 L343 44 L346 55 L356 55 L348 62 L351 73 L343 66 L335 73 L338 62 L330 55Z" strokeDasharray="2 1" />
      <path d="M860 160 L863 149 L866 160 L876 160 L868 167 L871 178 L863 171 L855 178 L858 167 L850 160Z" strokeDasharray="2 1" />
      <path d="M55 460 L58 449 L61 460 L71 460 L63 467 L66 478 L58 471 L50 478 L53 467 L45 460Z" strokeDasharray="2 1" />
      <path d="M600 820 L603 809 L606 820 L616 820 L608 827 L611 838 L603 831 L595 838 L598 827 L590 820Z" strokeDasharray="2 1" />
    </g>
    <g fill={color}>
      <circle cx="520" cy="40" r="2.5" opacity="0.6" />
      <circle cx="535" cy="50" r="1.5" opacity="0.5" />
      <circle cx="270" cy="340" r="2" opacity="0.5" />
      <circle cx="940" cy="680" r="2.2" opacity="0.5" />
    </g>
    <g stroke={color} strokeWidth="0.6" opacity="0.3">
      <line x1="0" y1="310" x2="1200" y2="310" strokeDasharray="6 12" />
      <line x1="0" y1="500" x2="1200" y2="500" strokeDasharray="6 12" />
      <line x1="0" y1="690" x2="1200" y2="690" strokeDasharray="6 12" />
    </g>
    <g stroke={color} strokeWidth="1" fill="none" opacity="0.6">
      <path d="M30 820 L90 790 L75 850" strokeDasharray="4 4" />
      <path d="M1150 820 L1100 790 L1115 850" strokeDasharray="4 4" />
    </g>
    <g stroke={color} strokeWidth="1" fill="none" opacity="0.45">
      <path d="M590 120 Q600 110 610 120 Q620 135 605 145 Q588 152 580 135 Q575 115 595 105 Q618 98 628 120" strokeDasharray="3 3" />
    </g>
  </svg>
);

const ThemeToggle: React.FC<{ isDark: boolean; toggle: () => void; T: ReturnType<typeof getT> }> = ({ isDark, toggle, T }) => (
  <button onClick={toggle}
    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
    style={{ background: T.toggleBg, border: `1px solid ${T.toggleBorder}`, color: T.accent }}>
    {isDark ? <Sun size={14} /> : <Moon size={14} />}
    {isDark ? 'Light' : 'Dark'}
  </button>
);

const VideoButton: React.FC<{ T: ReturnType<typeof getT> }> = ({ T }) => {
  const [status, setStatus] = useState<'idle' | 'progress'>('idle');
  const [hover, setHover] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {hover && status === 'idle' && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
          <div className="whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-medium flex items-center gap-2 shadow-xl"
            style={{ background: T.cardBg, border: `1px solid ${T.border}`, color: T.accent }}>
            🎬 AI Video Story Generator
          </div>
          <div className="w-0 h-0 mx-auto"
            style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${T.border}` }} />
        </div>
      )}
      <button onClick={e => { e.stopPropagation(); setStatus(p => p === 'idle' ? 'progress' : 'idle'); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all duration-200"
        style={{
          border: `1px solid ${status === 'progress' ? T.accent : T.border}`,
          color: status === 'progress' ? T.accent : T.textMuted,
          background: status === 'progress' ? T.accentBg : 'transparent',
        }}>
        <Video size={11} className={status === 'progress' ? 'animate-spin' : ''}
          style={status === 'progress' ? { animationDuration: '1.5s' } : {}} />
        {status === 'progress' ? 'In Progress...' : 'Generate Video'}
      </button>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ books = [], onNewBook, onOpenBook, onDeleteBook, isDark, toggleTheme }) => {
  const T = getT(isDark);
  const stats = useMemo(() => ({
    totalChapters: books.reduce((acc, book) => acc + ((book as any).chapterCount || 0), 0),
    uniqueGenres: new Set(books.map(b => b.genre).filter(Boolean)).size,
  }), [books]);

  return (
    <div className="relative h-screen w-full overflow-y-auto flex flex-col" style={{ background: T.pageBg, color: T.text }}>
      <SketchBg color={T.accent} opacity={T.sketchOpacity} />
      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-8 pt-8 flex flex-col">

        {/* Header */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <div className="text-2xl font-bold mb-3" style={{ fontFamily: 'Georgia,serif', color: T.text }}>
              Story<span style={{ color: T.accent }}>Tales</span> AI
            </div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: T.textMuted }}>Your Library</p>
            <h1 className="text-5xl font-bold tracking-tighter uppercase leading-none" style={{ fontFamily: 'Georgia,serif' }}>
              {books.length} Total Projects
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} toggle={toggleTheme} T={T} />
            <button onClick={onNewBook}
              className="px-6 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
              style={{ background: T.accent, color: T.accentFg }}>
              + Create New Book
            </button>
          </div>
        </div>

        {/* Stats */}
        {books.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Books',     value: books.length },
              { label: 'Chapters', value: stats.totalChapters },
              { label: 'Genres',    value: stats.uniqueGenres },
              { label: 'Active',    value: books.length },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-5 py-4"
                style={{ background: T.statBg, border: `1px solid ${T.border}` }}>
                <p className="text-2xl font-light" style={{ color: T.accent }}>{s.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] mt-1" style={{ color: T.textMuted }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {books.length > 0 && (
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: T.textMuted }}>Recent Books</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
          {books.map((book) => {
            const g = getGenreStyle(book.genre, isDark);
            const total = (book as any).chapterCount || 0;
            const done  = (book as any).completedChapterCount || 0;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
            
            return (
              <div key={book.id} onClick={() => onOpenBook(book.id)}
                className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col"
                style={{ background: T.cardBg, border: `1px solid ${T.borderCard}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)')}>
                <div style={{ height: 5, background: g.bar }} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[8px] font-black uppercase tracking-[0.18em] px-2 py-1 rounded"
                      style={{ background: g.badgeBg, color: g.badgeText }}>
                      {book.genre || 'General'}
                    </span>
                    <button onClick={e => { e.stopPropagation(); onDeleteBook(book.id); }}
                      className="p-1 rounded transition-colors" style={{ color: T.textFaint }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#e05050')}
                      onMouseLeave={e => (e.currentTarget.style.color = T.textFaint)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2 leading-snug"
                    style={{ fontFamily: 'Georgia,serif', color: T.text }}>{book.title}</h3>
                  <p className="text-[11px] line-clamp-3 leading-relaxed mb-4 flex-1"
                    style={{ color: T.textMuted }}>{book.description}</p>
                  
                  {/* Progress bar — fills based on completed chapters */}
                  <div className="mb-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>
                        {done} / {total} Chapters
                      </span>
                      <span className="text-[9px] font-bold" style={{ color: T.accent }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-[3px] rounded-full" style={{ background: T.progressTrack }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: g.bar }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2"
                    style={{ borderTop: `1px solid ${T.border}` }}>
                    <span className="text-[9px] flex items-center gap-1" style={{ color: T.textFaint }}>
                      <Clock size={10} />
                      {new Date(book.createdAt).toLocaleDateString()}
                    </span>
                    <VideoButton T={T} />
                  </div>
                </div>
              </div>
            );
          })}

          {books.length > 0 && (
            <div onClick={onNewBook}
              className="rounded-xl flex items-center justify-center min-h-[200px] cursor-pointer group transition-all"
              style={{ border: `1px dashed ${T.placeholder}` }}
              onMouseEnter={e => (e.currentTarget.style.background = T.placeholderHover)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Plus size={22} className="transition-all group-hover:rotate-90 duration-500" style={{ color: T.placeholderIcon }} />
            </div>
          )}

          {books.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center py-32 gap-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: T.statBg }}>📚</div>
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2" style={{ color: T.text }}>No books yet</h3>
                <p className="text-sm mb-6" style={{ color: T.textMuted }}>Create your first AI-powered book</p>
                <button onClick={onNewBook} className="px-6 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest"
                  style={{ background: T.accent, color: T.accentFg }}>
                  + Create New Book
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-10 w-full py-6 flex items-center justify-center"
        style={{ borderTop: `1px solid ${T.footerBorder}` }}>
        <div className="flex items-center gap-3 opacity-25 text-[20px] font-black uppercase tracking-[0.4em]" style={{ color: T.text }}>
          <span>Powered By SmartTales AI</span>
          <span className="w-1 h-1 rounded-full" style={{ background: T.accent }} />
          <span>2026</span>
        </div>
      </footer>
    </div>
  );
};