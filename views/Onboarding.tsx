
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Rocket, 
  Target, 
  ShieldCheck, 
  Loader2, 
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  Zap,
  UserCheck
} from 'lucide-react';
import { gemini } from '../services/geminiService.ts';
import { VoiceDictator } from '../components/VoiceDictator.tsx';

interface OnboardingProps {
  onComplete: (data: any) => void;
}

export const OnboardingView: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    service: '',
    target: '',
    plan: 'pro'
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activationResult, setActivationResult] = useState<any>(null);

  const handleVerify = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      const result = await gemini.generateBrandVoice(formData.service, formData.target);
      setActivationResult(result);
      setStep(4);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Define Your Niche</h2>
              <p className="text-slate-500 mt-2">Let's tell the AI what you excel at.</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Service</label>
                  <VoiceDictator variant="minimal" onResult={(text) => setFormData({...formData, service: formData.service + ' ' + text})} />
                </div>
                <input 
                  type="text"
                  placeholder="e.g. Executive Support for Tech Founders"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                />
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Client</label>
                  <VoiceDictator variant="minimal" onResult={(text) => setFormData({...formData, target: formData.target + ' ' + text})} />
                </div>
                <input 
                  type="text"
                  placeholder="e.g. SaaS CEOs, E-commerce Owners"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                />
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.service || !formData.target}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next Step <ArrowRight size={20} />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verify Identity</h2>
              <p className="text-slate-500 mt-2">Enter your professional email to sync.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Email</label>
                <input 
                  type="email"
                  placeholder="name@agency.com"
                  className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              {formData.email.includes('@') && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Code (Simulated)</label>
                  <input 
                    type="text"
                    maxLength={4}
                    placeholder="0000"
                    className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 tracking-[1em] text-center font-black"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
              )}
              <button 
                onClick={handleVerify}
                disabled={!formData.email || verificationCode.length < 4 || loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={20} />}
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Activate AI Strategy</h2>
              <p className="text-slate-500 mt-2">Gemini is preparing your strategic outreach identity.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Verification Check:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="text-emerald-500" size={18} /> Email: {formData.email}
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="text-emerald-500" size={18} /> Niche: {formData.target}
                </li>
              </ul>
            </div>

            <button 
              onClick={handleActivate}
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Rocket size={24} />}
              {loading ? 'CALCULATING STRATEGY...' : 'ACTIVATE OUTREACHPRO™'}
            </button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Choose Your Plan</h2>
              <p className="text-slate-500 mt-2">Feature gating applies based on your selection.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'starter', name: 'Starter', price: '$0', features: ['5 Leads/mo', '1 Sequence', 'Basic AI'], icon: <Target size={18}/> },
                { id: 'pro', name: 'VA Pro', price: '$49', features: ['Unlimited Leads', 'AI Automation', 'CRM Pipeline'], icon: <Zap size={18}/> },
                { id: 'agency', name: 'Agency', price: '$199', features: ['Team Access', 'Lead Assignment', 'Analytics'], icon: <ShieldCheck size={18}/> }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFormData({...formData, plan: p.id})}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.plan === p.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`${formData.plan === p.id ? 'text-indigo-600' : 'text-slate-400'}`}>{p.icon}</div>
                      <span className="font-bold text-slate-900">{p.name}</span>
                    </div>
                    <span className="text-lg font-black">{p.price}</span>
                  </div>
                  <div className="flex gap-2">
                    {p.features.map(f => <span key={f} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{f}</span>)}
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => onComplete({...activationResult, ...formData})}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
            >
              Complete Setup <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
      
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200 p-10 relative z-10 border border-slate-100">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-20">
            <div className="w-4 h-4 bg-indigo-600 rounded-sm" />
            <span className="text-xs font-black tracking-tighter">OutreachPro™</span>
        </div>
        
        {renderStep()}

        <div className="mt-10 flex justify-center gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
