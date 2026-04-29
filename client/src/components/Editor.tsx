import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Save, Sparkles, Download, 
  FileText, Trash2, Plus, Loader2, BookOpen 
} from 'lucide-react';
import { Streamdown } from 'streamdown';
import { Book } from '../types';

interface EditorProps {
  book: Book;
  onBack: () => void;
  onUpdateChapter: (chapterId: string, content: string) => void;
  onGenerateChapter: (chapterId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAddChapter: (title: string) => void;
  onPreview: () => void; // Re-added Preview Prop
}

export const Editor: React.FC<EditorProps> = ({
  book, onBack, onUpdateChapter, onGenerateChapter, onDeleteChapter, onAddChapter, onPreview
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>(book.chapters[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState('');

  const activeChapter = book.chapters.find(c => c.id === activeChapterId);

  useEffect(() => {
    if (activeChapter) {
      setLocalContent(activeChapter.content);
      setIsEditing(false);
    }
  }, [activeChapterId, book.chapters]);

  // FIXED: Download Logic
  const exportBook = () => {
    let fullText = `# ${book.title}\n\n`;
    book.chapters.forEach(c => { 
      fullText += `## ${c.title}\n\n${c.content || 'No content generated yet.'}\n\n`; 
    });
    
    const blob = new Blob([fullText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/\s+/g, '_')}_Manuscript.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (activeChapter) {
      onUpdateChapter(activeChapter.id, localContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#E6E6E6] text-[#1A1A1A] font-light overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-80 border-r border-black/10 flex flex-col">
        <div className="p-8 border-b border-black/10">
          <button onClick={onBack} className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black mb-6 flex items-center gap-2">
            <ChevronLeft size={14} /> Library
          </button>
          <h2 className="text-2xl font-bold tracking-tighter uppercase leading-none">{book.title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="px-4 py-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-black/20">
            <span>Chapters</span>
            <Plus size={14} className="cursor-pointer hover:text-black" onClick={() => {
              const t = prompt("Chapter title?");
              if(t) onAddChapter(t);
            }} />
          </div>

          {book.chapters.map((chapter, idx) => (
            <div key={chapter.id} onClick={() => setActiveChapterId(chapter.id)}
              className={`p-4 cursor-pointer transition-all border ${
                activeChapterId === chapter.id ? 'bg-white border-black/10 shadow-lg' : 'border-transparent hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-black/20">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-tight truncate">{chapter.title}</p>
                </div>
                {chapter.isGenerating && <Loader2 size={12} className="animate-spin" />}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Preview & Download */}
        <div className="p-8 border-t border-black/10 bg-white/30 space-y-3">
          <button 
            onClick={onPreview} 
            className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-black/10 py-3 hover:bg-black/5 transition-all"
          >
            <BookOpen size={14} /> Book Preview
          </button>
          <button 
            onClick={exportBook} 
            className="w-full text-[10px] font-bold uppercase tracking-widest bg-black text-white py-4 hover:opacity-90 transition-all"
          >
            <Download size={14} className="inline mr-2" /> Download .MD
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 bg-white overflow-y-auto flex flex-col">
        {!activeChapter ? (
          <div className="flex-1 flex items-center justify-center text-black/20 uppercase text-[10px] font-bold tracking-widest">
            Select a segment to begin
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <header className="h-20 px-12 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <h1 className="text-xs font-bold uppercase tracking-[0.2em]">{activeChapter.title}</h1>
              
              <div className="flex gap-8 items-center">
                {activeChapter.isGenerating ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> Neural Writing...
                  </span>
                ) : !activeChapter.content ? (
                  <button 
                    onClick={() => onGenerateChapter(activeChapter.id)}
                    className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Sparkles size={12} /> Generate
                  </button>
                ) : isEditing ? (
                  <button onClick={handleSave} className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-black pb-1">
                    Save Changes
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-black pb-1">
                    Edit Segment
                  </button>
                )}
              </div>
            </header>

            {/* Writing Area */}
            <div className="max-w-3xl mx-auto py-24 px-12 w-full">
              {activeChapter.isGenerating ? (
                <div className="font-serif text-xl leading-[200%] text-black/20 italic">
                  Drafting narrative via SmartTales Engine...
                </div>
              ) : !activeChapter.content ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#E6E6E6] rounded-full flex items-center justify-center mb-6 text-black/20">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Segment is Empty</h3>
                  <button 
                    onClick={() => onGenerateChapter(activeChapter.id)}
                    className="text-[10px] font-bold uppercase tracking-widest border-b border-black hover:opacity-50 transition-opacity"
                  >
                    Generate via AI →
                  </button>
                </div>
              ) : isEditing ? (
                <textarea
                  value={localContent}
                  onChange={(e) => setLocalContent(e.target.value)}
                  className="w-full h-[70vh] outline-none text-xl leading-[200%] text-[#1A1A1A] font-serif resize-none bg-transparent"
                  spellCheck={false}
                />
              ) : (
                <article className="prose prose-slate max-w-none font-serif text-xl leading-[200%] text-[#1A1A1A]">
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