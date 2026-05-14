import React, { useState } from 'react';
import { WizardFormData } from '../types';
import { Loader2, ArrowRight, Sun, Moon } from 'lucide-react';

interface WizardProps {
  onCancel: () => void;
  onSubmit: (data: WizardFormData) => void;
  isGenerating: boolean;
  isDark: boolean;
  toggleTheme: () => void;
}

const getT = (isDark: boolean) => isDark ? {
  overlay: 'rgba(17,16,16,0.97)', cardBg: '#1a1818', border: '#2a2520',
  text: '#f0ece6', textMuted: '#7a7068', textFaint: '#3a3028',
  accent: '#f0a030', accentFg: '#111010', accentHover: '#e09020',
  inputBg: 'transparent', inputBorder: '#2a2520',
  genreActive: '#f0a030', genreActiveFg: '#111010',
  genreInactive: '#1a1818', genreInactiveBorder: '#2a2520', genreInactiveText: '#5a5048',
  stepDot: '#2a2520', stepDotActive: '#f0a030',
  toggleBg: '#1a1818', toggleBorder: '#2a2520',
} : {
  overlay: 'rgba(242,245,247,0.97)', cardBg: '#ffffff', border: '#ccd8e0',
  text: '#1a2530', textMuted: '#8090a0', textFaint: '#b0c8d8',
  accent: '#1a8a8a', accentFg: '#ffffff', accentHover: '#158080',
  inputBg: 'transparent', inputBorder: '#ccd8e0',
  genreActive: '#1a2530', genreActiveFg: '#ffffff',
  genreInactive: 'transparent', genreInactiveBorder: '#ccd8e0', genreInactiveText: '#8090a0',
  stepDot: '#dce8f0', stepDotActive: '#1a8a8a',
  toggleBg: '#e4ecf0', toggleBorder: '#ccd8e0',
};

const GENRES = ['Fiction', 'Mystery', 'Sci-Fi', 'Business', 'Self Help', 'Romance', 'Fantasy', 'Horror'];

export const Wizard: React.FC<WizardProps> = ({ onCancel, onSubmit, isGenerating, isDark, toggleTheme }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    title: '', genre: 'Fiction', targetAudience: '', description: '',
  });
  const T = getT(isDark);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { if (!formData.title) return; setStep(2); }
    else { if (!formData.targetAudience || !formData.description) return; onSubmit(formData); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: T.overlay, backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-4xl rounded-2xl p-10 shadow-2xl relative"
        style={{ background: T.cardBg, border: `1px solid ${T.border}` }}>

        {/* Top bar */}
        <div className="flex justify-between items-center mb-10 pb-5"
          style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-4">
            {/* Logo */}
            <span className="text-lg font-bold" style={{ fontFamily: 'Georgia,serif', color: T.text }}>
              Story<span style={{ color: T.accent }}>Tales</span> AI
            </span>
            {/* Step indicator */}
            <div className="flex items-center gap-2 ml-4">
              {[1, 2].map(n => (
                <React.Fragment key={n}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                    style={{
                      background: step >= n ? T.stepDotActive : T.stepDot,
                      color: step >= n ? T.accentFg : T.textMuted,
                    }}>{n}</div>
                  {n < 2 && <div className="w-8 h-[1px]" style={{ background: step > 1 ? T.stepDotActive : T.border }} />}
                </React.Fragment>
              ))}
              <span className="text-[10px] font-bold uppercase tracking-widest ml-2" style={{ color: T.textMuted }}>
                Step {step} of 2
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: T.toggleBg, border: `1px solid ${T.toggleBorder}`, color: T.accent }}>
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
              {isDark ? 'Light' : 'Dark'}
            </button>
            <button onClick={onCancel}
              className="text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-50"
              style={{ color: T.textMuted }}>
              Discard
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="min-h-[320px]">
            {step === 1 ? (
              <div className="space-y-10">
                <div className="pb-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>
                    Book Title
                  </label>
                  <input type="text" required autoFocus placeholder="Enter your book title..."
                    className="w-full bg-transparent text-4xl font-bold outline-none"
                    style={{ color: T.text, caretColor: T.accent }}
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-5" style={{ color: T.textMuted }}>
                    Genre
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(g => (
                      <button key={g} type="button"
                        onClick={() => setFormData({ ...formData, genre: g })}
                        className="px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all"
                        style={{
                          background: formData.genre === g ? T.genreActive : T.genreInactive,
                          color: formData.genre === g ? T.genreActiveFg : T.genreInactiveText,
                          borderColor: formData.genre === g ? T.genreActive : T.genreInactiveBorder,
                        }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="pb-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>
                    Target Audience
                  </label>
                  <input type="text" required
                    className="w-full bg-transparent text-2xl font-bold outline-none"
                    style={{ color: T.text, caretColor: T.accent }}
                    placeholder="Who is this story for?"
                    value={formData.targetAudience}
                    onChange={e => setFormData({ ...formData, targetAudience: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: T.textMuted }}>
                    Description
                  </label>
                  <textarea required rows={5}
                    className="w-full bg-transparent text-lg font-medium outline-none resize-none leading-relaxed"
                    style={{ color: T.text, caretColor: T.accent }}
                    placeholder="Describe the main plot, characters, and themes..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: `1px solid ${T.border}` }}>
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)}
                className="text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-60"
                style={{ color: T.textMuted, borderBottom: `1px solid ${T.border}`, paddingBottom: 2 }}>
                ← Back
              </button>
            ) : <div />}
            <button type="submit" disabled={isGenerating}
              className="flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: T.accent, color: T.accentFg }}>
              {isGenerating ? 'Generating...' : step === 1 ? 'Next' : 'Generate Book'}
              {isGenerating ? <Loader2 className="animate-spin" size={15} /> : <ArrowRight size={15} />}
            </button>
          </div>
        </form>

        {/* Generating overlay */}
        {isGenerating && (
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center z-10"
            style={{ background: `${T.cardBg}ee`, backdropFilter: 'blur(4px)' }}>
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mb-4"
              style={{ borderColor: T.accent, borderTopColor: 'transparent' }} />
            <p className="text-sm font-bold" style={{ color: T.text }}>✦ Weaving your story...</p>
            <p className="text-[11px] mt-2" style={{ color: T.textMuted }}>AI is generating your chapter outline</p>
          </div>
        )}
      </div>
    </div>
  );
};