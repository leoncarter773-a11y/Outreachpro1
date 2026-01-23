
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Linkedin, 
  Calendar,
  Sparkles,
  Loader2,
  Lock,
  Copy,
  Check,
  Download,
  X,
  User,
  Building2,
  FileText,
  Mic,
  Clock,
  Send,
  Trash2,
  CheckCircle2,
  GripVertical
} from 'lucide-react';
import { gemini } from '../services/geminiService.ts';
import { Profile, Lead, Reminder } from '../types.ts';
import { VoiceDictator } from '../components/VoiceDictator.tsx';

const INITIAL_COLUMNS = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-600', hoverColor: 'bg-blue-50/50' },
  { id: 'contacted', title: 'Contacted', color: 'bg-purple-600', hoverColor: 'bg-purple-50/50' },
  { id: 'meeting', title: 'Meeting Booked', color: 'bg-amber-600', hoverColor: 'bg-amber-50/50' },
  { id: 'closed', title: 'Closed Won', color: 'bg-emerald-600', hoverColor: 'bg-emerald-50/50' },
];

const INITIAL_LEADS: Lead[] = [
  { id: '1', name: 'John Doe', email: 'john@acme.com', company: 'Acme Corp', status: 'new', tags: ['High Priority'], desc: 'Scaling e-commerce brand looking for ops support.', reminders: [] },
  { id: '2', name: 'Sarah Miller', email: 'sarah@startupx.io', company: 'StartupX', status: 'new', tags: ['SaaS'], desc: 'Fintech startup founder needing calendar management.', reminders: [{ id: 'r1', text: 'Follow up on proposal', date: '2025-06-01', completed: false }] },
  { id: '3', name: 'Michael Chen', email: 'm.chen@globaltech.com', company: 'Global Tech', status: 'contacted', tags: ['LinkedIn'], desc: 'Director of HR looking to outsource lead gen.', reminders: [] },
  { id: '4', name: 'Emma Wilson', email: 'emma@brightflow.co', company: 'BrightFlow', status: 'meeting', tags: ['Hot'], desc: 'CEO of a creative agency looking for a long-term EA.', reminders: [] },
  { id: '5', name: 'David Smith', email: 'd.smith@nexus.digital', company: 'Nexus Digital', status: 'closed', tags: ['High Ticket'], desc: 'Real estate mogul looking for property management help.', reminders: [] },
];

export const LeadsView = ({ profile }: { profile: Profile }) => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [isEmailsCopied, setIsEmailsCopied] = useState(false);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [emailingLead, setEmailingLead] = useState<Lead | null>(null);
  const [isSmartAdding, setIsSmartAdding] = useState(false);

  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', desc: '' });

  const allTags = Array.from(new Set(leads.flatMap(l => l.tags)));
  const isLimitReached = profile.plan === 'starter' && leads.length >= 10;

  useEffect(() => {
    const handleCommand = (e: CustomEvent) => {
      const { action, target } = e.detail;
      if (action === 'action' && target === 'add_lead') setIsAddModalOpen(true);
      if (action === 'action' && target === 'export_csv') handleExportCSV();
      if (action === 'action' && target === 'copy_emails') handleCopyAllEmails();
      if (action === 'search') setSearchQuery(target);
    };
    window.addEventListener('voice-command' as any, handleCommand as any);
    return () => window.removeEventListener('voice-command' as any, handleCommand as any);
  }, [leads]);

  // --- Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = (e: React.DragEvent, status: Lead['status']) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData('leadId');
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  // --- Utility Actions ---
  const handleAnalyzeLead = async (lead: Lead) => {
    setAnalyzingId(lead.id);
    try {
      const result = await gemini.analyzeLeadQuality(lead.desc);
      if (result) setAnalysis(prev => ({ ...prev, [lead.id]: result }));
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleCopyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const handleCopyAllEmails = () => {
    const emails = filteredLeads.map(l => l.email).join(', ');
    navigator.clipboard.writeText(emails);
    setIsEmailsCopied(true);
    setTimeout(() => setIsEmailsCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Status', 'Description'];
    const rows = leads.map(l => [`"${l.name}"`, `"${l.email}"`, `"${l.company}"`, `"${l.status}"`, `"${l.desc}"`]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
      console.error(err);
    } finally {
      setIsSmartAdding(false);
    }
  };

  const handleAddLead = () => {
    if (isLimitReached) return;
    const leadToAdd: Lead = {
      ...newLead,
      id: Math.random().toString(36).substr(2, 9),
      status: 'new',
      tags: ['Manual'],
      reminders: []
    };
    setLeads([leadToAdd, ...leads]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', email: '', company: '', desc: '' });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || lead.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      {/* Header Utilities */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leads Pipeline</h1>
          <p className="text-slate-500 font-medium">Manage your deals through stages with ease.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl px-1">
             <button 
              onClick={handleCopyAllEmails}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-widest"
            >
              {isEmailsCopied ? <Check size={14} className="text-emerald-500" /> : <Mail size={14} />}
              {isEmailsCopied ? 'Copied List' : 'Copy All Emails'}
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <Download size={14} />
              Export
            </button>
          </div>
          <div className="flex items-center gap-2">
            <VoiceDictator onResult={handleSmartVoiceAdd}>
              {isSmartAdding ? (
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl animate-pulse">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : (
                <button className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all">
                  <Mic size={16} />
                  <span className="hidden lg:inline">Smart Add</span>
                </button>
              )}
            </VoiceDictator>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              disabled={isLimitReached}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {isLimitReached ? <Lock size={16}/> : <Plus size={20} />}
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button 
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!selectedTag ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${selectedTag === tag ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
        {INITIAL_COLUMNS.map(column => (
          <div 
            key={column.id} 
            className={`min-w-[320px] max-w-[320px] flex flex-col gap-4 p-2 rounded-3xl transition-colors ${dragOverCol === column.id ? column.hoverColor : ''}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id as Lead['status'])}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-black text-slate-700 uppercase tracking-widest text-[10px]">{column.title}</h3>
                <span className="text-[10px] text-slate-400 font-bold">{filteredLeads.filter(l => l.status === column.id).length}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {filteredLeads
                .filter(lead => lead.status === column.id)
                .map(lead => (
                  <div 
                    key={lead.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="text-slate-200 group-hover:text-slate-400" size={16} />
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">{lead.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{lead.company}</p>
                        </div>
                      </div>
                      <button className="text-slate-300 hover:text-slate-500"><MoreVertical size={16} /></button>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 italic leading-relaxed">{lead.desc}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {lead.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {analysis[lead.id] && (
                      <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-indigo-600 uppercase">AI Rating</span>
                          <span className="text-[10px] font-black text-indigo-600">{analysis[lead.id].rating}/10</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium leading-tight">{analysis[lead.id].nextAction}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {lead.reminders && lead.reminders.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock size={10} /> {lead.reminders.filter(r => !r.completed).length}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEmailingLead(lead); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Mail size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopyEmail(lead.id, lead.email); }}
                          className={`p-2 rounded-xl transition-all ${copyingId === lead.id ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        >
                          {copyingId === lead.id ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedLead && (
        <LeadDetailsModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onUpdate={(updated) => setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))}
          onEmail={() => { setEmailingLead(selectedLead); setSelectedLead(null); }}
        />
      )}

      {emailingLead && (
        <EmailComposerModal 
          lead={emailingLead} 
          onClose={() => setEmailingLead(null)} 
        />
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-widest text-indigo-600">Manual Entry</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={newLead.name} onChange={(e) => setNewLead({...newLead, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={newLead.company} onChange={(e) => setNewLead({...newLead, company: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={newLead.email} onChange={(e) => setNewLead({...newLead, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                <textarea rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none" value={newLead.desc} onChange={(e) => setNewLead({...newLead, desc: e.target.value})} />
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold text-sm">Cancel</button>
              <button onClick={handleAddLead} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl">Add to Pipeline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LeadDetailsModal = ({ lead, onClose, onUpdate, onEmail }: any) => {
  const [reminders, setReminders] = useState<Reminder[]>(lead.reminders || []);
  const [newReminder, setNewReminder] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  const addReminder = () => {
    if (!newReminder) return;
    const updated = [...reminders, { id: Math.random().toString(), text: newReminder, date: reminderDate, completed: false }];
    setReminders(updated);
    onUpdate({ ...lead, reminders: updated });
    setNewReminder('');
    setReminderDate('');
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
    setReminders(updated);
    onUpdate({ ...lead, reminders: updated });
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    onUpdate({ ...lead, reminders: updated });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 p-10 overflow-y-auto space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{lead.name}</h2>
                <div className="flex items-center gap-2 text-indigo-600 mt-2 font-bold uppercase tracking-widest text-[10px]">
                  <Building2 size={14} /> {lead.company}
                </div>
              </div>
              <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full"><X size={24} /></button>
            </div>
            <div className="space-y-4">
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2"><FileText size={14} /> Discovery Notes</h3>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-700 italic">{lead.desc}</div>
            </div>
            <div className="flex gap-4">
              <button onClick={onEmail} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl"><Send size={18} /> Send Outreach</button>
              <button className="px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50"><Linkedin size={18} /> Profile</button>
            </div>
          </div>
          <div className="w-full md:w-[320px] bg-slate-50 border-l border-slate-100 p-8 flex flex-col gap-6 overflow-y-auto">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2"><Clock size={14} /> Reminders</h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <input placeholder="Task name..." className="w-full text-sm font-bold outline-none" value={newReminder} onChange={(e) => setNewReminder(e.target.value)} />
                <input type="date" className="w-full text-xs font-bold outline-none text-slate-500" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
                <button onClick={addReminder} className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Add Task</button>
              </div>
              <div className="space-y-2">
                {reminders.map(rem => (
                  <div key={rem.id} className={`p-4 bg-white rounded-2xl border flex items-start gap-3 group transition-all ${rem.completed ? 'opacity-50' : 'hover:border-indigo-200'}`}>
                    <button onClick={() => toggleReminder(rem.id)} className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${rem.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>{rem.completed && <Check size={10} />}</button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-tight ${rem.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{rem.text}</p>
                      {rem.date && <p className="text-[9px] text-slate-400 mt-1 font-bold">{rem.date}</p>}
                    </div>
                    <button onClick={() => deleteReminder(rem.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailComposerModal = ({ lead, onClose }: any) => {
  const [subject, setSubject] = useState(`Intro: Helping ${lead.company} scale`);
  const [body, setBody] = useState(`Hi ${lead.name.split(' ')[0]},\n\nI saw what you're doing at ${lead.company} and wanted to reach out...\n\nBest,\nYour Name`);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => { setIsSending(false); setSent(true); setTimeout(onClose, 2000); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-widest text-indigo-600">Compose Outreach</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        {sent ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100"><Check size={40} /></div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Sent!</h2>
            <p className="text-slate-500 mt-2 font-medium">Outreach to {lead.name} has been processed.</p>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3"><span className="text-[10px] font-black uppercase text-slate-400 min-w-[50px]">To</span><span className="text-sm font-bold text-slate-700">{lead.email}</span></div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3"><span className="text-[10px] font-black uppercase text-slate-400 min-w-[50px]">Sub</span><input className="flex-1 text-sm font-bold bg-transparent outline-none" value={subject} onChange={e => setSubject(e.target.value)} /></div>
              <textarea rows={8} className="w-full p-6 bg-white border border-slate-200 rounded-[24px] outline-none font-medium text-slate-700 leading-relaxed resize-none" value={body} onChange={e => setBody(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-sm">Cancel</button>
              <button onClick={handleSend} disabled={isSending} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl flex items-center gap-2">{isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Send Outreach</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
