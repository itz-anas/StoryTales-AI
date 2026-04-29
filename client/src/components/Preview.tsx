import React, { forwardRef, useMemo } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Book } from '../types';
import { Streamdown } from 'streamdown';
import { X, Book as BookIcon } from 'lucide-react';

interface PreviewProps {
  book: Book;
  onClose: () => void;
}

interface PageProps {
  children: React.ReactNode;
  number?: number;
  position?: 'left' | 'right' | 'cover';
  className?: string;
}

// Utility to split markdown content into page-sized chunks
const splitContent = (content: string, charsPerPage: number = 1000): string[] => {
  if (!content) return [];
  const parts: string[] = [];
  const paragraphs = content.split(/\n\n+/); // Split by paragraphs
  
  let currentPart = "";
  
  for (const p of paragraphs) {
    // If a single paragraph is huge, we might have to let it overflow or split it aggressively,
    // but for now we assume paragraphs are reasonable.
    if ((currentPart.length + p.length) > charsPerPage && currentPart.length > 0) {
      parts.push(currentPart);
      currentPart = p;
    } else {
      currentPart += (currentPart ? "\n\n" : "") + p;
    }
  }
  
  if (currentPart) {
    parts.push(currentPart);
  }
  
  return parts;
};

// Page Component for the FlipBook
const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ children, number, position = 'right', className = '' }, ref) => {
    
    // Page formatting based on position
    const isLeft = position === 'left';
    const isCover = position === 'cover';
    
    return (
      <div 
        className={`bg-[#fdfbf7] h-full shadow-inner relative overflow-hidden ${className} ${!isCover ? 'border-r-0' : ''}`} 
        ref={ref}
        style={{
             // Add a subtle paper texture effect
             backgroundImage: !isCover ? 'linear-gradient(to right, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 5%, rgba(0,0,0,0) 95%, rgba(0,0,0,0.03) 100%)' : undefined
        }}
      >
        <div className={`h-full p-10 md:p-12 flex flex-col ${isCover ? '' : 'text-slate-800'}`}>
            {children}
        </div>
        
        {/* Page Number */}
        {number && (
          <div className={`absolute bottom-6 w-full px-10 text-xs text-slate-400 font-serif flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
            <span>{number}</span>
          </div>
        )}
        
        {/* Spine Shadow for inner pages */}
        {!isCover && (
            <div className={`absolute top-0 bottom-0 w-8 pointer-events-none ${isLeft ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} from-black/5 to-transparent`} />
        )}
      </div>
    );
  }
);

Page.displayName = 'Page';

export const Preview: React.FC<PreviewProps> = ({ book, onClose }) => {
  
  // Calculate pages
  const pages = useMemo(() => {
    const _pages: Array<{
        type: 'cover' | 'intro' | 'toc' | 'chapter-title' | 'content' | 'end';
        content?: string;
        title?: string;
        chapterIndex?: number;
    }> = [];

    // 0. Cover
    _pages.push({ type: 'cover' });

    // 1. Intro / Copyright
    _pages.push({ type: 'intro' });

    // 2. TOC
    _pages.push({ type: 'toc' });

    // Chapters
    book.chapters.forEach((chapter, index) => {
        // Chapter Title Page
        _pages.push({ type: 'chapter-title', title: chapter.title, chapterIndex: index + 1 });
        
        // Content Pages
        if (!chapter.content) {
            _pages.push({ type: 'content', content: "*Chapter content not generated yet.*" });
        } else {
            const split = splitContent(chapter.content, 1200);
            split.forEach(part => {
                _pages.push({ type: 'content', content: part });
            });
        }
    });

    // End Page
    _pages.push({ type: 'end' });

    // Ensure we have an even number of pages for the back cover if needed, 
    // but react-pageflip handles odd numbers by showing a blank back. 
    // We'll leave it as is.
    return _pages;
  }, [book]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md bg-slate-900/90 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615800098779-1be4350c595d?q=80&w=2940&auto=format&fit=crop')] bg-cover opacity-10 pointer-events-none" />

      {/* Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        <button 
            onClick={onClose}
            className="bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/10 shadow-lg group"
        >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      <div className="mb-6 text-white/70 text-sm font-medium flex items-center gap-3 relative z-10 animate-fade-in-down">
         <BookIcon size={16} /> Reading Mode <span className="w-1 h-1 bg-white/50 rounded-full" /> Click corners or drag to turn
      </div>

      <div className="relative shadow-2xl rounded-sm max-h-full">
        {/* @ts-ignore - react-pageflip types compatibility */}
        <HTMLFlipBook
          width={500}
          height={720}
          size="fixed"
          minWidth={300}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1533}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          startPage={0}
          drawShadow={true}
          flippingTime={1000}
          usePortrait={false}
          startZIndex={0}
          autoSize={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {pages.map((p, idx) => {
              // Page 0 is Cover (Right).
              // Page 1 is Left (Intro).
              // Page 2 is Right (TOC).
              // So: Odd index = Left, Even index = Right (except 0).
              const position = idx === 0 ? 'cover' : idx % 2 === 0 ? 'right' : 'left';
              
              // Visual page number: Starts counting at Intro (page 1)
              const pageNumber = idx > 0 ? idx : undefined;

              if (p.type === 'cover') {
                  return (
                    <Page key={idx} position="cover" className="bg-brand-900">
                        <div className="h-full flex flex-col items-center justify-center text-white border-4 border-white/10 relative overflow-hidden">
                            {book.coverImage && (
                                <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                                    <img src={book.coverImage} className="w-full h-full object-cover" alt="Cover" />
                                </div>
                            )}
                            <div className="relative z-10 p-8 w-full h-full flex flex-col justify-between border-2 border-white/20 m-4 text-center">
                                <div className="mt-12">
                                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-wide text-brand-50 drop-shadow-md leading-tight">{book.title}</h1>
                                    <div className="w-24 h-1 bg-brand-400 mx-auto my-8 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                                    <p className="text-xl text-brand-100 font-serif italic tracking-wider">{book.genre}</p>
                                </div>
                                <div className="mb-8">
                                    <p className="text-xs text-brand-200 uppercase tracking-[0.2em]">SmartTales Edition</p>
                                </div>
                            </div>
                        </div>
                    </Page>
                  );
              }

              if (p.type === 'intro') {
                  return (
                    <Page key={idx} number={pageNumber} position={position}>
                       <div className="h-full flex flex-col justify-center text-center px-4">
                          <p className="text-slate-400 text-xs uppercase tracking-widest mb-12">Copyright © {new Date().getFullYear()}</p>
                          <h3 className="font-serif font-bold text-slate-800 text-2xl mb-6">{book.title}</h3>
                          <p className="text-slate-600 italic mb-8 leading-relaxed max-w-xs mx-auto text-sm">{book.description}</p>
                          <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-300">
                              <BookIcon size={20} />
                          </div>
                       </div>
                    </Page>
                  );
              }

              if (p.type === 'toc') {
                return (
                    <Page key={idx} number={pageNumber} position={position}>
                        <div className="h-full overflow-hidden">
                            <h2 className="text-center font-serif text-2xl mb-8 text-slate-800 tracking-tight">Contents</h2>
                            <ul className="space-y-4">
                                {book.chapters.map((chapter, i) => (
                                    <li key={chapter.id} className="flex justify-between items-end group cursor-pointer">
                                        <span className="font-serif text-slate-700 font-medium group-hover:text-brand-600 transition-colors bg-[#fdfbf7] pr-2 z-10 relative text-sm">
                                            {i + 1}. {chapter.title}
                                        </span>
                                        <span className="border-b border-dotted border-slate-300 flex-1 mb-1 mx-1"></span>
                                        {/* Since we don't have exact page numbers for chapters in this dynamic reflow, we omit them or use placeholders */}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Page>
                );
              }

              if (p.type === 'chapter-title') {
                  return (
                      <Page key={idx} number={pageNumber} position={position}>
                          <div className="h-full flex flex-col justify-center items-center text-center">
                              <span className="text-slate-400 font-sans text-xs uppercase tracking-widest mb-4">Chapter {p.chapterIndex}</span>
                              <h2 className="font-serif text-3xl font-bold text-slate-900 mb-6 px-4 leading-tight">{p.title}</h2>
                              <div className="w-8 h-8 text-slate-300">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                              </div>
                          </div>
                      </Page>
                  );
              }

              if (p.type === 'content') {
                  return (
                      <Page key={idx} number={pageNumber} position={position}>
                          <div className="prose prose-slate prose-sm font-serif max-w-none text-justify leading-7">
                              <Streamdown>{p.content || ''}</Streamdown>
                          </div>
                      </Page>
                  );
              }

              if (p.type === 'end') {
                  return (
                      <Page key={idx} number={pageNumber} position={position}>
                         <div className="h-full flex items-center justify-center">
                            <div className="text-center text-slate-400">
                                <BookIcon size={32} className="mx-auto mb-3 opacity-30" />
                                <p className="font-serif italic text-sm">The End</p>
                            </div>
                         </div>
                      </Page>
                  );
              }

              return <Page key={idx} position={position}>{null}</Page>;
          })}
        </HTMLFlipBook>
      </div>
    </div>
  );
};