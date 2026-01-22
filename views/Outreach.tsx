
import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Send, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Loader2,
  Lock,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { gemini } from '../services/geminiService.ts';
import { Profile } from '../types.ts';
import { VoiceDictator } from '../components/VoiceDictator.tsx';

interface SequenceStep {
  day: number;
  subject: string;
  content: string;
}

export const OutreachView = ({ profile }: { profile: Profile }) => {
  const [service, setService] = useState('Executive Assistant Services');
  const [target, setTarget] = useState('E-commerce Store Owners');
  const [goal, setGoal] = useState('Book a 15-minute discovery call');
  const [steps, setSteps] = useState<SequenceStep[]>([
    { day: 1, subject: 'Question regarding your operations', content: 'Hi {{name}}, noticed you were scaling and thought you might need some help...' }
  ]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copyingIndex, setCopyingIndex] = useState<number | null>(null);

  const isPro = profile.plan !== 'starter';

  const handleGenerateAI = async () => {
    if (!isPro) return;
    setLoading(true);
    try {
      const generatedSteps = await gemini.generateOutreachSequence(service, target, goal);
      if (generatedSteps && generatedSteps.length > 0) {
        setSteps(generatedSteps);
        setExpandedIndex(0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    if (!isPro && steps.length >= 1) return; // Starter limit: 1 sequence/step essentially (demo purposes)
    const nextDay = steps.length > 0 ? steps[steps.length - 1].day + 2 : 1;
    setSteps([...steps, { day: nextDay, subject: '', content: '' }]);
    setExpandedIndex(steps.length);
  };

  const updateStep = (index: number, field: keyof SequenceStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const handleCopy = (index: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopyingIndex(index);
    setTimeout(() => setCopyingIndex(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Outreach Sequences</h1>
          <p className="text-slate-500">Craft perfect sequences using AI to book more calls.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
          <Save size={20} />
          Save Sequence
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
            {!isPro && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Lock size={20} />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">PRO Feature</h4>
                <p className="text-xs text-slate-500 mb-4">Gemini-powered sequence generation is exclusive to Pro users.</p>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all">
                  Upgrade Now
                </button>
              </div>
            )}
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={20} />
              AI Sequence Generator
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Your Offering</label>
                  <VoiceDictator variant="minimal" onResult={(text) => setService(service + ' ' + text)} />
                </div>
                <input 
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div className="relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ideal Client</label>
                  <VoiceDictator variant="minimal" onResult={(text) => setTarget(target + ' ' + text)} />
                </div>
                <input 
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div className="relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Conversion Goal</label>
                  <VoiceDictator variant="minimal" onResult={(text) => setGoal(goal + ' ' + text)} />
                </div>
                <input 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <button 
                onClick={handleGenerateAI}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 mt-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} />}
                Generate with Gemini
              </button>
            </div>
          </div>
        </div>

        {/* Builder Area */}
        <div className="lg:col-span-8 space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
              <div 
                className={`p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${expandedIndex === index ? 'bg-slate-50 border-b border-slate-100' : ''}`}
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Step {index + 1}: {step.subject || '(No Subject)'}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><Clock size={12} /> Day {step.day}</span>
                      <span className="flex items-center gap-1"><Send size={12} /> Email</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCopy(index, step.content); }}
                    className={`p-2 rounded-lg transition-colors ${copyingIndex === index ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                    title="Copy to clipboard"
                  >
                    {copyingIndex === index ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeStep(index); }}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                  {expandedIndex === index ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
              </div>

              {expandedIndex === index && (
                <div className="p-6 space-y-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Delay Day</label>
                      <input 
                        type="number"
                        value={step.day}
                        onChange={(e) => updateStep(index, 'day', parseInt(e.target.value))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Subject Line</label>
                        <VoiceDictator variant="minimal" onResult={(text) => updateStep(index, 'subject', step.subject + ' ' + text)} />
                      </div>
                      <input 
                        value={step.subject}
                        onChange={(e) => updateStep(index, 'subject', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <VoiceDictator onResult={(text) => updateStep(index, 'content', step.content + ' ' + text)} />
                    </div>
                    <textarea 
                      rows={6}
                      value={step.content}
                      onChange={(e) => updateStep(index, 'content', e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none pr-32"
                      placeholder="Compose your outreach message or use speech to text..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {!isPro && steps.length >= 1 ? (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center">
              <Lock className="text-slate-300 mb-3" size={32} />
              <h4 className="font-bold text-slate-900">Step Limit Reached</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1 mb-6">Free accounts are limited to single-step sequences. Upgrade to unlock follow-up logic.</p>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all">
                Unlock Pro Sequences
              </button>
            </div>
          ) : (
            <button 
              onClick={addStep}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-500 font-bold hover:border-indigo-300 hover:text-indigo-600 transition-all group"
            >
              <Plus size={20} className="group-hover:scale-110 transition-transform" />
              Add Outreach Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
