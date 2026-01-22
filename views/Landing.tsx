
import React, { useState } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight,
  Sparkles,
  Star,
  Plus,
  Minus,
  Quote,
  HelpCircle
} from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-indigo-600 transition-colors"
      >
        <span className="text-lg font-bold text-slate-900">{question}</span>
        {isOpen ? <Minus className="text-indigo-600 shrink-0" size={20} /> : <Plus className="text-slate-400 shrink-0" size={20} />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-slate-500 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const LandingView = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">O</span>
              </div>
              <span className="text-xl font-bold tracking-tighter">Outreach<span className="text-indigo-600">Pro™</span></span>
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 ml-10 leading-none">
              ©™ Carter Bey Global Sync Software
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium text-sm">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </div>
          <button 
            onClick={onStart}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-40 pb-20 px-6 text-center overflow-hidden relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-6 border border-indigo-100 animate-bounce">
            <Sparkles size={14} /> New: Gemini AI Sequences
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight mb-8">
            Stop Chasing Clients.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Start Closing Them.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one outreach and CRM platform built exclusively for virtual assistants and VA agencies to scale client acquisition.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Start Your Free Trial <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition-all">
              Watch Demo
            </button>
          </div>
          
          <div className="mt-20 flex flex-wrap items-center justify-center gap-10 text-slate-400 grayscale opacity-50">
            <span className="font-black tracking-tighter text-2xl italic">UPWORK</span>
            <span className="font-black tracking-tighter text-2xl italic">FIVERR</span>
            <span className="font-black tracking-tighter text-2xl italic">VANETWORK</span>
            <span className="font-black tracking-tighter text-2xl italic">FORBES</span>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] -z-1 opacity-50" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-purple-100 rounded-full blur-[100px] -z-1 opacity-50" />
      </header>

      {/* Social Proof Stats */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-black text-slate-900 mb-1">1,200+</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active VAs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-indigo-600 mb-1">$4.2M</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Closed Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-slate-900 mb-1">85k+</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sent Sequences</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-600 mb-1">4.9/5</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">User Rating</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Everything you need to <span className="text-indigo-400 underline decoration-indigo-400/30">Dominate</span> your niche.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Built by VAs, for VAs. No general-purpose CRM fluff here.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-10 rounded-[32px] border border-slate-700/50 hover:border-indigo-500/50 transition-all group">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="text-indigo-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Outreach Automation</h3>
              <p className="text-slate-400 leading-relaxed text-lg">Set up multi-channel sequences across Email and LinkedIn. Let the AI handle the personalization while you sleep.</p>
            </div>
            <div className="bg-slate-800/50 p-10 rounded-[32px] border border-slate-700/50 hover:border-indigo-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Lead Qualification</h3>
              <p className="text-slate-400 leading-relaxed text-lg">Stop wasting time on "broke" founders. Our AI analyzes leads and assigns a quality score before you even hit send.</p>
            </div>
            <div className="bg-slate-800/50 p-10 rounded-[32px] border border-slate-700/50 hover:border-indigo-500/50 transition-all group">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Globe className="text-blue-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Agency Dashboard</h3>
              <p className="text-slate-400 leading-relaxed text-lg">Managing a team of VAs? Sync lead owners, monitor call bookings, and scale your operations without the mess.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Social Proof) */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase tracking-widest mb-4">
            Success Stories
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-16 tracking-tight">The VA toolkit that actually <span className="text-indigo-600">pays for itself.</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                name: "Sarah Jenkins",
                role: "Executive VA for SaaS",
                quote: "I doubled my monthly retainer in 60 days. The AI sequence builder is literally like having a senior copywriter on my team for $49 a month.",
                avatar: "https://i.pravatar.cc/150?u=sarah"
              },
              {
                name: "Marcus Thorne",
                role: "Founder, Thorne Support Agency",
                quote: "We scaled from 3 to 12 VAs in just 4 months. OutreachPro keeps our pipeline full so my team stays billable 100% of the time.",
                avatar: "https://i.pravatar.cc/150?u=marcus"
              },
              {
                name: "Elena Rodriguez",
                role: "E-comm Operations Expert",
                quote: "The lead analysis tool is a game changer. I used to hop on calls with anyone; now I only talk to high-ticket clients who are ready to sign.",
                avatar: "https://i.pravatar.cc/150?u=elena"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col hover:shadow-xl hover:shadow-indigo-50 transition-all">
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-slate-600 text-lg italic leading-relaxed mb-8 flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <h4 className="font-bold text-slate-900">{t.name}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tighter">Choose Your Velocity</h2>
            <p className="text-slate-500">Simple, transparent pricing. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white p-10 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Starter</span>
              <div className="text-4xl font-black mb-6">$0</div>
              <ul className="space-y-4 mb-10 text-slate-600 text-sm">
                <li>Up to 10 Leads</li>
                <li>Basic Sequence Builder</li>
                <li>Email Outreach Only</li>
              </ul>
              <button onClick={onStart} className="w-full py-3 bg-slate-100 text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-all mt-auto">
                Get Started
              </button>
            </div>
            {/* Pro */}
            <div className="bg-white p-10 rounded-3xl border-2 border-indigo-600 flex flex-col items-center text-center relative shadow-2xl shadow-indigo-100 scale-105">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">Most Popular</div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-4">VA Pro</span>
              <div className="text-4xl font-black mb-6">$49<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-4 mb-10 text-slate-600 text-sm">
                <li>Unlimited Leads</li>
                <li>AI Sequence Generator</li>
                <li>CRM Pipeline Access</li>
                <li>Priority Support</li>
              </ul>
              <button onClick={onStart} className="w-full py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all mt-auto">
                Choose Pro
              </button>
            </div>
            {/* Agency */}
            <div className="bg-white p-10 rounded-3xl border border-slate-200 flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Agency</span>
              <div className="text-4xl font-black mb-6">$199<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-4 mb-10 text-slate-600 text-sm">
                <li>Everything in Pro</li>
                <li>Up to 10 Team Members</li>
                <li>Lead Assignment</li>
                <li>Whitelabel Reporting</li>
              </ul>
              <button onClick={onStart} className="w-full py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-black transition-all mt-auto">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about OutreachPro™</p>
          </div>
          <div className="space-y-2">
            <FAQItem 
              question="How is this different from a standard CRM?" 
              answer="Standard CRMs like Salesforce or HubSpot are built for enterprise sales teams. OutreachPro™ is built specifically for the VA workflow, focusing on client acquisition, sequence generation, and high-frequency outreach that freelancers and boutique agencies actually use."
            />
            <FAQItem 
              question="Does the Gemini AI engine cost extra?" 
              answer="No. The Gemini AI features are fully included in our Pro and Agency plans. We believe AI is a core part of the future VA workflow, so we don't nickel-and-dime you for tokens or per-use fees."
            />
            <FAQItem 
              question="Can I use this for my entire VA agency?" 
              answer="Yes! Our Agency plan is designed specifically for teams. You can add up to 10 team members, assign leads to specific VAs, and see a bird's eye view of the entire agency's performance."
            />
            <FAQItem 
              question="Which platforms can I outreach on?" 
              answer="Currently, OutreachPro™ supports full automation for Email and structured sequence planning for LinkedIn. We are rolling out direct LinkedIn and Twitter/X DM automation in Q3 2026."
            />
            <FAQItem 
              question="Is my data secure?" 
              answer="Absolutely. We use industry-standard encryption and your client data is never shared or used to train public AI models. Your business intelligence stays yours."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Ready to activate your client pipeline?</h2>
          <p className="text-indigo-100 text-xl mb-10">Join 1,200+ VAs scaling their business with OutreachPro™.</p>
          <button 
            onClick={onStart}
            className="px-10 py-5 bg-white text-indigo-600 rounded-full font-black text-xl hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-900/20"
          >
            Start Your 14-Day Free Trial
          </button>
          <p className="mt-6 text-indigo-200 text-sm font-medium">No credit card required • Instant activation</p>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px]" />
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">O</span>
              </div>
              <span className="text-xl font-bold tracking-tighter">Outreach<span className="text-indigo-600">Pro™</span></span>
            </div>
            <p className="text-slate-400 text-sm">Empowering Virtual Assistants worldwide.</p>
          </div>
          <div className="flex gap-10 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
            <a href="#" className="hover:text-indigo-600">Support</a>
            <a href="#" className="hover:text-indigo-600">Privacy</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-10 text-center text-slate-300 text-[10px] font-bold tracking-[0.2em] uppercase">
          © Outreach Marketing & Public Relations LLC. All Rights Reserved; Carter Bey & Company Inc.
        </div>
      </footer>
    </div>
  );
};
