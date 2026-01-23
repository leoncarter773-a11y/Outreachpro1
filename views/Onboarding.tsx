
import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (data: { fullName: string; service: string; plan: string }) => void;
}

// OnboardingView: Handles the initial setup for new users
export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    service: 'Executive Assistant',
    plan: 'starter'
  });

  const nextStep = () => setStep(s => s + 1);

  const plans = [
    { id: 'starter', name: 'Starter', price: '$0', icon: <ShieldCheck size={20} />, features: ['10 Leads', 'Basic Sequences'] },
    { id: 'pro', name: 'VA Pro', price: '$49', icon: <Zap size={20} />, features: ['Unlimited Leads', 'AI Generation', 'CRM Pipeline'] },
    { id: 'agency', name: 'Agency', price: '$199', icon: <Globe size={20} />, features: ['10 Team Members', 'Lead Assignment', 'Whitelabel'] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Header Progress */}
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black tracking-tight">Setup your Workspace</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Step {step} of 3</p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-8 h-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-indigo-500' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">What's your name?</h3>
                <p className="text-slate-500 font-medium">We'll use this to personalize your dashboard.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  autoFocus
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && formData.fullName && nextStep()}
                />
              </div>
              <button 
                onClick={nextStep}
                disabled={!formData.fullName}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">What service do you provide?</h3>
                <p className="text-slate-500 font-medium">This helps Gemini AI craft relevant outreach sequences.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Executive Assistant',
                  'Social Media Management',
                  'Lead Generation',
                  'Customer Support',
                  'E-commerce Operations'
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFormData({...formData, service: s}); nextStep(); }}
                    className={`p-4 rounded-2xl border text-left font-bold transition-all ${
                      formData.service === s 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Choose your plan</h3>
                <p className="text-slate-500 font-medium">Start free or unlock advanced AI tools.</p>
              </div>
              <div className="space-y-3">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setFormData({...formData, plan: p.id})}
                    className={`p-5 rounded-[24px] border-2 cursor-pointer transition-all flex items-center justify-between ${
                      formData.plan === p.id 
                        ? 'bg-indigo-50 border-indigo-600 ring-4 ring-indigo-500/5' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.plan === p.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {p.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{p.name}</h4>
                        <div className="flex gap-2 mt-1">
                          {p.features.map(f => (
                            <span key={f} className="text-[9px] font-black uppercase tracking-wider text-slate-400">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900">{p.price}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/month</div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => onComplete(formData)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl mt-4 flex items-center justify-center gap-2"
              >
                Launch Workspace <CheckCircle2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
