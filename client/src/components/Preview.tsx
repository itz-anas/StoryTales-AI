import React, { forwardRef, useMemo } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Book } from '../types';
import { Streamdown } from 'streamdown';
import { X, Book as BookIcon, Sun, Moon } from 'lucide-react';

interface PreviewProps {
  book: Book;
  onClose: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

interface PageProps {
  children: React.ReactNode;
  number?: number;
  position?: 'left' | 'right' | 'cover';
  className?: string;
}

const splitContent = (content: string, charsPerPage = 1000): string[] => {
  if (!content) return [];
  const parts: string[] = [];
  const paragraphs = content.split(/\n\n+/);
  let current = '';
  for (const p of paragraphs) {
    if ((current.length + p.length) > charsPerPage && current.length > 0) {
      parts.push(current); current = p;
    } else {
      current += (current ? '\n\n' : '') + p;
    }
  }
  if (current) parts.push(current);
  return parts;
};

const Page = forwardRef<HTMLDivElement, PageProps>(({ children, number, position = 'right', className = '' }, ref) => {
  const isLeft  = position === 'left';
  const isCover = position === 'cover';
  return (
    <div ref={ref}
      className={`bg-[#fdfbf7] h-full shadow-inner relative overflow-hidden ${className}`}
      style={{ backgroundImage: !isCover ? 'linear-gradient(to right,rgba(0,0,0,0.03) 0%,rgba(0,0,0,0) 5%,rgba(0,0,0,0) 95%,rgba(0,0,0,0.03) 100%)' : undefined }}>
      <div className={`h-full p-10 flex flex-col ${isCover ? '' : 'text-slate-800'}`}>{children}</div>
      {number && (
        <div className={`absolute bottom-6 w-full px-10 text-xs text-slate-400 font-serif flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
          <span>{number}</span>
        </div>
      )}
      {!isCover && (
        <div className={`absolute top-0 bottom-0 w-8 pointer-events-none ${isLeft ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} from-black/5 to-transparent`} />
      )}
    </div>
  );
});
Page.displayName = 'Page';

export const Preview: React.FC<PreviewProps> = ({ book, onClose, isDark, toggleTheme }) => {
  const pages = useMemo(() => {
    const _pages: Array<{
      type: 'cover' | 'intro' | 'toc' | 'chapter-title' | 'content' | 'end';
      content?: string; title?: string; chapterIndex?: number;
    }> = [];
    _pages.push({ type: 'cover' });
    _pages.push({ type: 'intro' });
    _pages.push({ type: 'toc' });
    book.chapters.forEach((ch, i) => {
      _pages.push({ type: 'chapter-title', title: ch.title, chapterIndex: i + 1 });
      if (!ch.content) {
        _pages.push({ type: 'content', content: '*Chapter content not generated yet.*' });
      } else {
        splitContent(ch.content, 1200).forEach(part => _pages.push({ type: 'content', content: part }));
      }
    });
    _pages.push({ type: 'end' });
    return _pages;
  }, [book]);

  // Cover gradient based on theme
  const coverBg = isDark
    ? 'linear-gradient(135deg,#1a1208 0%,#2a1c08 50%,#111010 100%)'
    : 'linear-gradient(135deg,#1a2530 0%,#0d4040 50%,#1a2530 100%)';
  const accentColor = isDark ? '#f0a030' : '#1a8a8a';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{ background: 'rgba(10,10,12,0.93)', backdropFilter: 'blur(12px)' }}>

      {/* Ambient bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, rgba(240,160,48,0.06) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(26,138,138,0.08) 0%, transparent 70%)',
        }} />

      {/* Controls */}
      <div className="absolute top-5 right-5 z-50 flex items-center gap-3">
        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: accentColor }}>
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
          {isDark ? 'Light' : 'Dark'}
        </button>
        <button onClick={onClose}
          className="p-3 rounded-full transition-all group"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <X size={20} className="text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Hint */}
      <div className="relative z-10 mb-5 flex items-center gap-3 text-white/50 text-xs font-medium">
        <BookIcon size={14} />
        <span>Reading Mode</span>
        <span className="w-1 h-1 rounded-full bg-white/30" />
        <span>Click corners or drag to turn pages</span>
      </div>

      {/* Book */}
      <div className="relative shadow-2xl z-10">
        {/* @ts-ignore */}
        <HTMLFlipBook
          width={500} height={720} size="fixed"
          minWidth={300} maxWidth={1000} minHeight={400} maxHeight={1533}
          maxShadowOpacity={0.5} showCover={true} mobileScrollSupport={true}
          className="shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
          startPage={0} drawShadow={true} flippingTime={1000}
          usePortrait={false} startZIndex={0} autoSize={true}
          clickEventForward={true} useMouseEvents={true}
          swipeDistance={30} showPageCorners={true} disableFlipByClick={false}>
          {pages.map((p, idx) => {
            const position = idx === 0 ? 'cover' : idx % 2 === 0 ? 'right' : 'left';
            const pageNumber = idx > 0 ? idx : undefined;

            if (p.type === 'cover') return (
              <Page key={idx} position="cover">
                <div className="h-full flex flex-col items-center justify-center relative overflow-hidden"
                  style={{ background: coverBg }}>
                  {book.coverImage && (
                    <div className="absolute inset-0 opacity-30 mix-blend-overlay">
                      <img src={book.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    </div>
                  )}
                  <div className="relative z-10 p-8 w-full h-full flex flex-col justify-between text-center"
                    style={{ border: `2px solid rgba(255,255,255,0.12)`, margin: 16 }}>
                    <div className="mt-12">
                      <h1 className="text-5xl font-serif font-bold tracking-wide text-white drop-shadow leading-tight">
                        {book.title}
                      </h1>
                      <div className="w-20 h-1 mx-auto my-8 rounded-full" style={{ background: accentColor }} />
                      <p className="text-xl font-serif italic tracking-wider" style={{ color: `${accentColor}cc` }}>
                        {book.genre}
                      </p>
                    </div>
                    <p className="mb-8 text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      SmartTales Edition
                    </p>
                  </div>
                </div>
              </Page>
            );

            if (p.type === 'intro') return (
              <Page key={idx} number={pageNumber} position={position}>
                <div className="h-full flex flex-col justify-center text-center px-4">
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-10">
                    Copyright © {new Date().getFullYear()}
                  </p>
                  <h3 className="font-serif font-bold text-slate-800 text-2xl mb-4">{book.title}</h3>
                  <p className="text-slate-600 italic mb-8 leading-relaxed max-w-xs mx-auto text-sm">{book.description}</p>
                  <div className="w-10 h-10 rounded-full bg-slate-100 mx-auto flex items-center justify-center">
                    <BookIcon size={18} className="text-slate-300" />
                  </div>
                </div>
              </Page>
            );

            if (p.type === 'toc') return (
              <Page key={idx} number={pageNumber} position={position}>
                <div className="h-full overflow-hidden">
                  <h2 className="text-center font-serif text-2xl mb-8 text-slate-800 tracking-tight">Contents</h2>
                  <ul className="space-y-4">
                    {book.chapters.map((ch, i) => (
                      <li key={ch.id} className="flex items-end gap-1">
                        <span className="font-serif text-slate-700 font-medium bg-[#fdfbf7] pr-2 z-10 relative text-sm">
                          {i + 1}. {ch.title}
                        </span>
                        <span className="border-b border-dotted border-slate-300 flex-1 mb-1" />
                      </li>
                    ))}
                  </ul>
                </div>
              </Page>
            );

            if (p.type === 'chapter-title') return (
              <Page key={idx} number={pageNumber} position={position}>
                <div className="h-full flex flex-col justify-center items-center text-center">
                  <span className="text-slate-400 text-xs uppercase tracking-widest mb-4">Chapter {p.chapterIndex}</span>
                  <h2 className="font-serif text-3xl font-bold text-slate-900 mb-6 px-4 leading-tight">{p.title}</h2>
                  <div className="w-6 h-6 text-slate-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
              </Page>
            );

            if (p.type === 'content') return (
              <Page key={idx} number={pageNumber} position={position}>
                <div className="prose prose-slate prose-sm font-serif max-w-none text-justify leading-7">
                  <Streamdown>{p.content || ''}</Streamdown>
                </div>
              </Page>
            );

            if (p.type === 'end') return (
              <Page key={idx} number={pageNumber} position={position}>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <BookIcon size={30} className="mx-auto mb-3 opacity-25" />
                    <p className="font-serif italic text-sm">The End</p>
                    <p className="text-xs mt-2 uppercase tracking-widest opacity-50">SmartTales AI</p>
                  </div>
                </div>
              </Page>
            );

            return <Page key={idx} position={position}>{null}</Page>;
          })}
        </HTMLFlipBook>
      </div>
    </div>
  );
};