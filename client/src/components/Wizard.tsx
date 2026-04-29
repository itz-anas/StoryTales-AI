import React, { useState } from 'react';
import { WizardFormData } from '../types';
import { Loader2, ArrowRight } from 'lucide-react';

export const Wizard: React.FC<WizardProps> = ({ onCancel, onSubmit, isGenerating }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    title: '', genre: 'Non-Fiction', targetAudience: '', description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { if (!formData.title) return; setStep(2); }
    else { if (!formData.targetAudience || !formData.description) return; onSubmit(formData); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#E6E6E6]/95 backdrop-blur-md text-[#1A1A1A]">
      <div className="bg-white w-full max-w-4xl p-12 shadow-2xl border border-black/5">
        <div className="flex justify-between items-center mb-16 border-b border-black/10 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Step {step} of 2</span>
          <button onClick={onCancel} className="text-xs font-bold uppercase tracking-widest hover:opacity-50">Discard</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="min-h-[350px]">
            {step === 1 ? (
              <div className="space-y-12">
                <div className="border-b border-black/10 pb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40">Title</label>
                  <input type="text" required autoFocus placeholder="Enter Title..."
                    className="w-full bg-transparent text-4xl font-bold outline-none placeholder:text-black/5"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-6 opacity-40">Genre</label>
                  <div className="flex flex-wrap gap-2">
                    {['Fiction', 'Mystery', 'Sci-Fi', 'Business', 'Self Help'].map((g) => (
                      <button key={g} type="button" onClick={() => setFormData({ ...formData, genre: g })}
                        className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          formData.genre === g ? 'bg-black text-white' : 'border-black/10 text-black/40 hover:border-black'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="border-b border-black/10 pb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40">Target Audience</label>
                  <input type="text" required className="w-full bg-transparent text-2xl font-bold outline-none"
                    placeholder="Who is this story for?"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-4 opacity-40">Description</label>
                  <textarea required rows={5} className="w-full bg-transparent text-xl font-medium outline-none resize-none leading-[180%]"
                    placeholder="Describe the main plot points..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-16">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest border-b border-black">Back</button>
            )}
            <button type="submit" disabled={isGenerating}
              className="ml-auto bg-black text-white px-10 py-4 flex items-center gap-4 hover:scale-105 transition-transform"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isGenerating ? 'Weaving' : step === 1 ? 'Next' : 'Generate'}
              </span>
              {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};