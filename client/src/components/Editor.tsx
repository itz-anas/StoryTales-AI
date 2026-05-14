import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Sparkles, Download, FileText, Trash2, Plus, Loader2, BookOpen, Sun, Moon } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { Book } from '../types';

interface EditorProps {
  book: Book;
  onBack: () => void;
  onUpdateChapter: (chapterId: string, content: string) => void;
  onGenerateChapter: (chapterId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAddChapter: (title: string) => void;
  onPreview: () => void;
  onUpdateBookCover?: (cover: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const getT = (isDark: boolean) => isDark ? {
  pageBg: '#111010', sidebarBg: '#161414', editorBg: '#1a1818',
  border: '#2a2520', borderFaint: '#1e1c18',
  text: '#f0ece6', textMuted: '#7a7068', textFaint: '#3a3028',
  accent: '#f0a030', accentFg: '#111010', accentBg: 'rgba(240,160,48,0.1)',
  headerBg: 'rgba(22,20,20,0.95)',
  activeChapter: '#1a1818', activeChapterBorder: '#2a2520',
  hoverChapter: 'rgba(240,160,48,0.05)',
  footerBg: '#161414', footerBorder: '#1e1c18',
  inputBg: '#111010',
  toggleBg: '#1a1818', toggleBorder: '#2a2520',
  emptyIconBg: '#1a1818',
  dlBtnBg: '#f0a030', dlBtnText: '#111010',
  previewBtnBorder: '#2a2520',
} : {
  pageBg: '#f2f5f7', sidebarBg: '#e8eef2', editorBg: '#ffffff',
  border: '#ccd8e0', borderFaint: '#e4ecf0',
  text: '#1a2530', textMuted: '#8090a0', textFaint: '#b0c8d8',
  accent: '#1a8a8a', accentFg: '#ffffff', accentBg: 'rgba(26,138,138,0.08)',
  headerBg: 'rgba(255,255,255,0.95)',
  activeChapter: '#ffffff', activeChapterBorder: '#ccd8e0',
  hoverChapter: 'rgba(26,138,138,0.05)',
  footerBg: 'rgba(255,255,255,0.5)', footerBorder: '#dce8f0',
  inputBg: '#f2f5f7',
  toggleBg: '#dce8f0', toggleBorder: '#ccd8e0',
  emptyIconBg: '#e4ecf0',
  dlBtnBg: '#1a2530', dlBtnText: '#ffffff',
  previewBtnBorder: '#ccd8e0',
};

export const Editor: React.FC<EditorProps> = ({
  book, onBack, onUpdateChapter, onGenerateChapter, onDeleteChapter,
  onAddChapter, onPreview, isDark, toggleTheme,
}) => {
  const [activeChapterId, setActiveChapterId] = useState(book.chapters[0]?.id || '');
  const [isEditing, setIsEditing]             = useState(false);
  const [localContent, setLocalContent]       = useState('');
  const T = getT(isDark);

  const activeChapter = book.chapters.find(c => c.id === activeChapterId);

  useEffect(() => {
    if (activeChapter) { setLocalContent(activeChapter.content); setIsEditing(false); }
  }, [activeChapterId, book.chapters]);

  const exportBook = () => {
    let text = `# ${book.title}\n\n`;
    book.chapters.forEach(c => { text += `## ${c.title}\n\n${c.content || 'No content yet.'}\n\n`; });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([text], { type: 'text/markdown' })),
      download: `${book.title.replace(/\s+/g, '_')}_Manuscript.md`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleSave = () => {
    if (activeChapter) { onUpdateChapter(activeChapter.id, localContent); setIsEditing(false); }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: T.pageBg, color: T.text }}>

      {/* Sidebar */}
      <aside className="w-72 flex flex-col flex-shrink-0" style={{ background: T.sidebarBg, borderRight: `1px solid ${T.border}` }}>
        {/* Sidebar Header */}
        <div className="p-6" style={{ borderBottom: `1px solid ${T.border}` }}>
          {/* Logo */}
          <div className="text-base font-bold mb-5" style={{ fontFamily: 'Georgia,serif' }}>
            Story<span style={{ color: T.accent }}>Tales</span> AI
          </div>
          <button onClick={onBack}
            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 transition-all hover:opacity-60"
            style={{ color: T.textMuted }}>
            <ChevronLeft size={13} /> Library
          </button>
          <h2 className="text-xl font-bold tracking-tight leading-snug" style={{ fontFamily: 'Georgia,serif' }}>
            {book.title}
          </h2>
          <p className="text-[10px] mt-1 font-medium" style={{ color: T.textMuted }}>{book.genre}</p>
        </div>

        {/* Chapters list */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="px-3 py-3 flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: T.textFaint }}>Chapters</span>
            <button onClick={() => { const t = prompt('Chapter title?'); if (t) onAddChapter(t); }}
              className="p-1 rounded transition-all hover:opacity-70" style={{ color: T.accent }}>
              <Plus size={13} />
            </button>
          </div>
          {book.chapters.map((ch, idx) => (
            <div key={ch.id} onClick={() => setActiveChapterId(ch.id)}
              className="p-3 rounded-lg mb-1 cursor-pointer transition-all flex items-center gap-3"
              style={{
                background: activeChapterId === ch.id ? T.activeChapter : 'transparent',
                border: `1px solid ${activeChapterId === ch.id ? T.activeChapterBorder : 'transparent'}`,
              }}
              onMouseEnter={e => { if (activeChapterId !== ch.id) e.currentTarget.style.background = T.hoverChapter; }}
              onMouseLeave={e => { if (activeChapterId !== ch.id) e.currentTarget.style.background = 'transparent'; }}>
              <span className="text-[9px] font-bold w-4 flex-shrink-0" style={{ color: T.textFaint }}>{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-tight truncate" style={{ color: T.text }}>{ch.title}</p>
                {ch.isComplete && (
                  <p className="text-[9px] mt-0.5" style={{ color: T.accent }}>✓ Complete</p>
                )}
              </div>
              {ch.isGenerating && <Loader2 size={11} className="animate-spin flex-shrink-0" style={{ color: T.accent }} />}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 space-y-2" style={{ borderTop: `1px solid ${T.footerBorder}`, background: T.footerBg }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
            style={{ background: T.toggleBg, border: `1px solid ${T.toggleBorder}`, color: T.accent }}>
            {isDark ? <Sun size={12} /> : <Moon size={12} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={onPreview}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80"
            style={{ border: `1px solid ${T.previewBtnBorder}`, color: T.text }}>
            <BookOpen size={13} /> Book Preview
          </button>
          <button onClick={exportBook}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-90"
            style={{ background: T.dlBtnBg, color: T.dlBtnText }}>
            <Download size={13} /> Download .MD
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col" style={{ background: T.editorBg }}>
        {!activeChapter ? (
          <div className="flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest"
            style={{ color: T.textFaint }}>
            Select a chapter to begin
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <header className="h-16 px-10 flex items-center justify-between sticky top-0 z-10"
              style={{ background: T.headerBg, borderBottom: `1px solid ${T.border}`, backdropFilter: 'blur(8px)' }}>
              <h1 className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: T.text }}>
                {activeChapter.title}
              </h1>
              <div className="flex gap-4 items-center">
                {/* Delete chapter */}
                <button onClick={() => onDeleteChapter(activeChapter.id)}
                  className="p-1 rounded transition-colors" style={{ color: T.textFaint }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#e05050')}
                  onMouseLeave={e => (e.currentTarget.style.color = T.textFaint)}>
                  <Trash2 size={14} />
                </button>

                {activeChapter.isGenerating ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: T.textMuted }}>
                    <Loader2 size={12} className="animate-spin" style={{ color: T.accent }} /> Neural Writing...
                  </span>
                ) : !activeChapter.content ? (
                  <button onClick={() => onGenerateChapter(activeChapter.id)}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
                    style={{ background: T.accent, color: T.accentFg }}>
                    <Sparkles size={12} /> Generate
                  </button>
                ) : isEditing ? (
                  <button onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-90"
                    style={{ background: T.accent, color: T.accentFg }}>
                    <Save size={12} /> Save
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)}
                    className="text-[10px] font-bold uppercase tracking-widest pb-0.5 transition-all hover:opacity-60"
                    style={{ color: T.text, borderBottom: `1px solid ${T.accent}` }}>
                    Edit Chapter
                  </button>
                )}
              </div>
            </header>

            {/* Writing Area */}
            <div className="max-w-3xl mx-auto py-20 px-10 w-full flex-1">
              {activeChapter.isGenerating ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: T.accent, borderTopColor: 'transparent' }} />
                  <p className="text-lg font-serif italic" style={{ color: T.textMuted }}>
                    Drafting narrative via SmartTales Engine...
                  </p>
                </div>
              ) : !activeChapter.content ? (
                <div className="py-24 text-center flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: T.emptyIconBg }}>
                    <FileText size={20} style={{ color: T.textFaint }} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: T.text }}>
                    Chapter is Empty
                  </h3>
                  <p className="text-xs" style={{ color: T.textMuted }}>
                    Use AI to generate content for this chapter
                  </p>
                  <button onClick={() => onGenerateChapter(activeChapter.id)}
                    className="text-[10px] font-bold uppercase tracking-widest mt-2 pb-0.5 transition-all hover:opacity-60"
                    style={{ color: T.accent, borderBottom: `1px solid ${T.accent}` }}>
                    Generate via AI →
                  </button>
                </div>
              ) : isEditing ? (
                <textarea value={localContent} onChange={e => setLocalContent(e.target.value)} spellCheck={false}
                  className="w-full h-[70vh] outline-none text-xl leading-[200%] resize-none bg-transparent font-serif"
                  style={{ color: T.text, caretColor: T.accent }} />
              ) : (
                <article className="prose max-w-none font-serif text-xl leading-[200%]"
                  style={{ color: T.text }}>
                  <Streamdown>{activeChapter.content}</Streamdown>
                </article>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};