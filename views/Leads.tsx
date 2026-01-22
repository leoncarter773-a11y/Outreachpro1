
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Linkedin, 
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Download,
  X,
  User,
  Building2,
  FileText,
  Mic
} from 'lucide-react';
import { gemini } from '../services/geminiService.ts';
import { Profile } from '../types.ts';
import { VoiceDictator } from '../components/VoiceDictator.tsx';

const INITIAL_COLUMNS = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-600' },
  { id: 'contacted', title: 'Contacted', color: 'bg-purple-600' },
  { id: 'meeting', title: 'Meeting Booked', color: 'bg-amber-600' },
  { id: 'closed', title: 'Closed Won', color: 'bg-emerald-600' },
];

const INITIAL_LEADS = [
  { id: '1', name: 'John Doe', email: 'john@acme.com', company: 'Acme Corp', status: 'new', tags: ['High Priority'], desc: 'Scaling e-commerce brand looking for ops support.' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@startupx.io', company: 'StartupX', status: 'new', tags: ['SaaS'], desc: 'Fintech startup founder needing calendar management.' },
  { id: '3', name: 'Michael Chen', email: 'm.chen@globaltech.com', company: 'Global Tech', status: 'contacted', tags: ['LinkedIn'], desc: 'Director of HR looking to outsource lead gen.' },
  { id: '4', name: 'Emma Wilson', email: 'emma@brightflow.co', company: 'BrightFlow', status: 'meeting', tags: ['Hot'], desc: 'CEO of a creative agency looking for a long-term EA.' },
  { id: '5', name: 'David Smith', email: 'd.smith@nexus.digital', company: 'Nexus Digital', status: 'closed', tags: ['High Ticket'], desc: 'Real estate mogul looking for property management help.' },
];

export const LeadsView = ({ profile }: { profile: Profile }) => {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', desc: '' });
  const [isSmartAdding, setIsSmartAdding] = useState(false);

  const isLimitReached = profile.plan === 'starter' && leads.length >= 5;

  const handleAnalyzeLead = async (lead: typeof INITIAL_LEADS[0]) => {
    setAnalyzingId(lead.id);
    try {
      const leadInfo = `${lead.name} at ${lead.company}. Context: ${lead.desc}. Tags: ${lead.tags.join(', ')}`;
      const result = await gemini.analyzeLeadQuality(leadInfo);
      if (result) {
        setAnalysis(prev => ({ ...prev, [lead.id]: result }));
      }
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleCopyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const handleCopyLeadsToClipboard = () => {
    const text = leads.map(l => `${l.name} | ${l.company} | ${l.email} | Status: ${l.status}`).join('\n');
    navigator.clipboard.writeText(text);
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Status', 'Description'];
    const rows = leads.map(l => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.company}"`,
      `"${l.status}"`,
      `"${l.desc.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `outreachpro_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSmartVoiceAdd = async (transcript: string) => {
    setIsSmartAdding(true);
    try {
      const parsedLead = await gemini.parseLeadFromVoice(transcript);
      if (parsedLead.name) {
        setNewLead(parsedLead);
        setIsAddModalOpen(true);
      }
    } catch (err) {
      console.error("Smart Add failed", err);
    } finally {
      setIsSmartAdding(false);
    }
  };

  const handleAddLead = () => {
    if (isLimitReached) return;
    const leadToAdd = {
      ...newLead,
      id: Math.random().toString(36).substr(2, 9),
      status: 'new' as const,
      tags: ['Manual Entry']
    };
    setLeads([leadToAdd, ...leads]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', email: '', company: '', desc: '' });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leads Pipeline</h1>
          <p className="text-slate-500 font-medium">Manage and convert your high-ticket prospect pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl px-1">
             <button 
              onClick={handleCopyLeadsToClipboard}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-wider"
              title="Copy all leads"
            >
              {isCopiedAll ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              Copy
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-wider"
              title="Export as CSV"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
          <div className="flex items-center gap-2">
            <VoiceDictator 
              onResult={handleSmartVoiceAdd}
              className="group"
            >
              {isSmartAdding ? (
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl animate-pulse">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : (
                <button 
                  className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-[0.1em] hover:bg-indigo-100 transition-all"
                  title="Smart Voice Add"
                >
                  <Mic size={16} />
                  <span className="hidden lg:inline">Smart Add</span>
                </button>
              )}
            </VoiceDictator>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              disabled={isLimitReached}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:grayscale"
            >
              {isLimitReached ? <Lock size={16}/> : <Plus size={20} />}
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            placeholder="Search by name, company, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <VoiceDictator variant="minimal" onResult={(text) => setSearchQuery(searchQuery + text)} />
          </div>
        </div>
        <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:bg-slate-50 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
        {INITIAL_COLUMNS.map(column => (
          <div key={column.id} className="min-w-[340px] max-w-[340px] flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color} shadow-sm`} />
                <h3 className="font-black text-slate-700 uppercase tracking-[0.15em] text-[10px]">{column.title}</h3>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {leads.filter(l => l.status === column.id).length}
                </span>
              </div>
              <button onClick={() => setIsAddModalOpen(true)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Plus size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {leads
                .filter(lead => lead.status === column.id && (lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.company.toLowerCase().includes(searchQuery.toLowerCase())))
                .map(lead => (
                  <div key={lead.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-base">{lead.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                          <span>{lead.company}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCopyEmail(lead.id, lead.email); }}
                            className={`p-1 rounded hover:bg-slate-100 transition-colors ${copyingId === lead.id ? 'text-emerald-500' : 'text-slate-300'}`}
                            title="Copy email"
                          >
                            {copyingId === lead.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                      <button className="text-slate-300 hover:text-slate-500 transition-colors"><MoreVertical size={18} /></button>
                    </div>
                    
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 italic">
                      {lead.desc}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {lead.tags?.map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {analysis[lead.id] ? (
                      <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                            <Sparkles size={14} /> Gemini Insight
                          </span>
                          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm">
                            <span className="text-xs font-black text-indigo-600">
                              {analysis[lead.id].rating}
                            </span>
                            <span className="text-[8px] text-slate-400">/10</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          {analysis[lead.id].nextAction}
                        </p>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAnalyzeLead(lead); }}
                        disabled={analyzingId === lead.id}
                        className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600/5 hover:bg-indigo-600/10 border border-indigo-600/10 rounded-xl text-xs font-black text-indigo-600 tracking-wider uppercase transition-all disabled:opacity-50 group/ai"
                      >
                        {analyzingId === lead.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} className="group-hover/ai:animate-pulse" />
                        )}
                        {analyzingId === lead.id ? 'Analyzing...' : 'Analyze with AI'}
                      </button>
                    )}

                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white flex items-center justify-center text-[11px] font-black text-white shadow-sm">
                          {lead.name[0]}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Mail size={16} /></button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Linkedin size={16} /></button>
                        <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><Calendar size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}

              {isLimitReached && column.id === 'new' && (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <Lock className="mb-6 text-indigo-400 group-hover:scale-110 transition-transform" size={28} />
                  <h4 className="font-black text-xl leading-tight mb-3 tracking-tight">Lead capacity reached</h4>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">Free accounts are capped at 5 leads. Upgrade to VA Pro for unlimited CRM capacity.</p>
                  <button className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/20">
                    Upgrade to Pro <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-600">Lead Confirmation</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Contact Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Robert California"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={12} /> Company Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Dunder Mifflin"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  value={newLead.company}
                  onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <input 
                  type="email"
                  placeholder="name@company.com"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                />
              </div>

              <div className="space-y-1 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={12} /> Context / Notes
                  </label>
                  <VoiceDictator variant="minimal" onResult={(text) => setNewLead({...newLead, desc: newLead.desc + ' ' + text})} />
                </div>
                <textarea 
                  rows={4}
                  placeholder="Voice dictate notes or type manually..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium resize-none"
                  value={newLead.desc}
                  onChange={(e) => setNewLead({...newLead, desc: e.target.value})}
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddLead}
                disabled={!newLead.name || !newLead.company}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                <Check size={18} /> Add to Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
