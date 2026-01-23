
import React, { useState, useEffect } from 'react';
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
  Lock,
  ArrowRight,
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
  GripVertical,
  ChevronRight
} from 'lucide-react';
import { gemini } from '../services/geminiService.ts';
import { Profile, Lead, Reminder } from '../types.ts';
import { VoiceDictator } from '../components/VoiceDictator.tsx';

const INITIAL_COLUMNS = [
  { id: 'new', title: 'New Leads', color: 'bg-blue-600', hoverColor: 'bg-blue-50' },
  { id: 'contacted', title: 'Contacted', color: 'bg-purple-600', hoverColor: 'bg-purple-50' },
  { id: 'meeting', title: 'Meeting Booked', color: 'bg-amber-600', hoverColor: 'bg-amber-50' },
  { id: 'closed', title: 'Closed Won', color: 'bg-emerald-600', hoverColor: 'bg-emerald-50' },
];

const INITIAL_LEADS: Lead[] = [
  { id: '1', name: 'John Doe', email: 'john@acme.com', company: 'Acme Corp', status: 'new', tags: ['High Priority', 'SaaS'], desc: 'Scaling e-commerce brand looking for ops support.', reminders: [] },
  { id: '2', name: 'Sarah Miller', email: 'sarah@startupx.io', company: 'StartupX', status: 'new', tags: ['Fintech'], desc: 'Fintech startup founder needing calendar management.', reminders: [{ id: 'rem-1', text: 'Send proposal', date: '2025-05-20', completed: false }] },
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
  const [draggingOverCol, setDraggingOverCol] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [emailingLead, setEmailingLead] = useState<Lead | null>(null);
  const [isSmartAdding, setIsSmartAdding] = useState(false);

  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', desc: '' });

  const allTags = Array.from(new Set(leads.flatMap(l => l.tags)));
  const isLimitReached = profile.plan === 'starter' && leads.length >= 5;

  // Listen for global voice commands
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

  // --- Drag and Drop Logic ---
  const onDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (draggingOverCol !== colId) setDraggingOverCol(colId);
  };

  const onDragLeave = () => {
    setDraggingOverCol(null);
  };

  const onDrop = (e: React.DragEvent, status: Lead['status']) => {
    e.preventDefault();
    setDraggingOverCol(null);
    const leadId = e.dataTransfer.getData('leadId');
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  // --- Actions ---
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
    const rows = leads.map(l => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.company}"`,
      `"${l.status}"`,
      `"${l.desc.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
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
      tags: ['Manual Entry'],
      reminders: []
    };
    setLeads([leadToAdd, ...leads]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', email: '', company: '', desc: '' });
  };

  const handleUpdateLeadReminders = (leadId: string, reminders: Reminder[]) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, reminders } : l));
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, reminders } : null);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || lead.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Leads Pipeline</h1>
          <p className="text-slate-500 font-medium">Drag-and-drop leads to manage status. Use Voice AI for rapid entry.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl px-1">
             <button 
              onClick={handleCopyAllEmails}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-widest"
              title="Copy all visible emails to clipboard"
            >
              {isEmailsCopied ? <Check size={14} className="text-emerald-500" /> : <Mail size={14} />}
              {isEmailsCopied ? 'Copied' : 'Copy All Emails'}
            </button>
            <div className="w-[1px] h-4 bg-slate-200" />
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <Download size={14} />
              Export CSV
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
              <span className="hidden sm:inline">New Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            placeholder="Search leads by name or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <VoiceDictator variant="minimal" onResult={(text) => setSearchQuery(text)} />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 scrollbar-hide">
          <button 
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${!selectedTag ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedTag === tag ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
        {INITIAL_COLUMNS.map(column => (
          <div 
            key={column.id} 
            className={`min-w-[340px] max-w-[340px] flex flex-col gap-4 rounded-[32px] p-2 transition-colors duration-200 ${draggingOverCol === column.id ? column.hoverColor : 'bg-transparent'}`}
            onDragOver={(e) => onDragOver(e, column.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, column.id as Lead['status'])}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color} shadow-sm`} />
                <h3 className="font-black text-slate-700 uppercase tracking-widest text-[10px]">{column.title}</h3>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {filteredLeads.filter(l => l.status === column.id).length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {filteredLeads
                .filter(lead => lead.status === column.id)
                .map(lead => (
                  <div 
                    key={lead.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, lead.id)}
                    className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1 cursor-grab active:cursor-grabbing">
                           <GripVertical className="text-slate-200 group-hover:text-slate-400 transition-colors" size={16} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-base">{lead.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                            <span>{lead.company}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-slate-300 hover:text-slate-500 transition-colors"><MoreVertical size={18} /></button>
                    </div>
                    
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 italic">
                      {lead.desc}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {lead.tags?.map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* AI Preview Section */}
                    {analysis[lead.id] ? (
                      <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                            <Sparkles size={14} /> AI Analysis
                          </span>
                          <span className="text-xs font-black text-indigo-600 bg-white px-2 py-0.5 rounded-full shadow-sm">
                            {analysis[lead.id].rating}/10
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-2">
                          {analysis[lead.id].nextAction}
                        </p>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAnalyzeLead(lead); }}
                        disabled={analyzingId === lead.id}
                        className="mb-4 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600/5 hover:bg-indigo-600/10 border border-indigo-600/10 rounded-xl text-xs font-black text-indigo-600 tracking-widest uppercase transition-all"
                      >
                        {analyzingId === lead.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Analyze with AI
                      </button>
                    )}

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         {lead.reminders && lead.reminders.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Clock size={10} /> {lead.reminders.filter(r => !r.completed).length} Reminders
                            </div>
                         )}
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEmailingLead(lead); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Compose Email"
                        >
                          <Mail size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopyEmail(lead.id, lead.email); }}
                          className={`p-2 rounded-xl transition-all ${copyingId === lead.id ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                          title="Copy Email Address"
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

      {/* Lead Details Modal */}
      {selectedLead && (
        <LeadDetailsModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onUpdateReminders={(reminders) => handleUpdateLeadReminders(selectedLead.id, reminders)}
          onEmail={() => setEmailingLead(selectedLead)}
        />
      )}

      {/* Email Composer Modal */}
      {emailingLead && (
        <EmailComposerModal 
          lead={emailingLead}
          onClose={() => setEmailingLead(null)}
        />
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-widest text-indigo-600">Manual Lead Entry</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><User size={12} /> Contact Name</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  placeholder="e.g. Alex Carter"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Building2 size={12} /> Company</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                  value={newLead.company}
                  onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                  placeholder="e.g. Nexus Digital"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Mail size={12} /> Email Address</label>
                <input 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-1 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><FileText size={12} /> Notes</label>
                  <VoiceDictator variant="minimal" onResult={(text) => setNewLead({...newLead, desc: newLead.desc + ' ' + text})} />
                </div>
                <textarea 
                  rows={4}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none"
                  value={newLead.desc}
                  onChange={(e) => setNewLead({...newLead, desc: e.target.value})}
                  placeholder="Voice dictate or type notes here..."
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold text-sm">Cancel</button>
              <button 
                onClick={handleAddLead}
                disabled={!newLead.name || !newLead.company}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
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

// --- Modal Components ---

const LeadDetailsModal = ({ lead, onClose, onUpdateReminders, onEmail }: { lead: Lead, onClose: () => void, onUpdateReminders: (reminders: Reminder[]) => void, onEmail: () => void }) => {
  const [reminders, setReminders] = useState<Reminder[]>(lead.reminders || []);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');

  const addReminder = () => {
    if (!newReminderText) return;
    const updated = [...reminders, { id: Math.random().toString(), text: newReminderText, date: newReminderDate, completed: false }];
    setReminders(updated);
    onUpdateReminders(updated);
    setNewReminderText('');
    setNewReminderDate('');
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r);
    setReminders(updated);
    onUpdateReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    onUpdateReminders(updated);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Info */}
          <div className="flex-1 p-10 overflow-y-auto space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Building2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{lead.company}</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">{lead.name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                   <a href={`mailto:${lead.email}`} className="text-slate-500 font-medium hover:text-indigo-600 transition-colors flex items-center gap-1">
                      <Mail size={14} /> {lead.email}
                   </a>
                   <div className="w-1 h-1 bg-slate-300 rounded-full" />
                   <span className="text-slate-500 font-medium flex items-center gap-1 uppercase text-[10px] tracking-widest">
                      Status: {lead.status}
                   </span>
                </div>
              </div>
              <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
               <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <FileText size={14} /> Discovery Notes
               </h3>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-700 leading-relaxed italic">
                  {lead.desc}
               </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {lead.tags.map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={onEmail}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
              >
                <Send size={18} /> Send Outreach Email
              </button>
              <button className="px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <Linkedin size={18} /> View Profile
              </button>
            </div>
          </div>

          {/* Reminders Sidebar */}
          <div className="w-full md:w-[340px] bg-slate-50 border-l border-slate-100 p-8 flex flex-col gap-6 overflow-y-auto">
            <div className="space-y-1">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Clock size={14} /> Lead Tasks & Reminders
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Never miss a follow-up with {lead.name.split(' ')[0]}.</p>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <input 
                  placeholder="What needs to happen?"
                  className="w-full text-sm font-bold outline-none"
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                />
                <div className="flex items-center gap-2">
                   <Calendar size={14} className="text-slate-400" />
                   <input 
                    type="date"
                    className="flex-1 text-[10px] font-bold outline-none text-slate-500"
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                   />
                </div>
                <button 
                  onClick={addReminder}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                  Schedule Reminder
                </button>
              </div>

              <div className="space-y-2">
                {reminders.length === 0 && (
                  <div className="py-10 text-center opacity-30">
                    <CheckCircle2 className="mx-auto mb-2" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">No pending tasks</p>
                  </div>
                )}
                {reminders.map(rem => (
                  <div key={rem.id} className={`p-4 bg-white rounded-2xl border transition-all flex items-start gap-3 group ${rem.completed ? 'opacity-50 border-slate-100' : 'border-slate-200 hover:border-indigo-200 shadow-sm'}`}>
                    <button 
                      onClick={() => toggleReminder(rem.id)}
                      className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${rem.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}
                    >
                      {rem.completed && <Check size={10} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-tight ${rem.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{rem.text}</p>
                      {rem.date && <p className="text-[9px] text-slate-400 mt-1 font-bold">{new Date(rem.date).toLocaleDateString()}</p>}
                    </div>
                    <button 
                      onClick={() => deleteReminder(rem.id)}
                      className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
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

const EmailComposerModal = ({ lead, onClose }: { lead: Lead, onClose: () => void }) => {
  const [subject, setSubject] = useState(`Intro: Helping ${lead.company} scale operations`);
  const [body, setBody] = useState(`Hi ${lead.name.split(' ')[0]},\n\nI've been following your work at ${lead.company} and noticed some areas where a high-level VA could really impact your bottom line.\n\nSpecifically, I've noticed: ${lead.desc.slice(0, 50)}...\n\nWould you be open to a 10-minute chat next week?\n\nBest,\n[Your Name]`);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    // Simulate email sending
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      setTimeout(onClose, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-widest text-indigo-600">Lead Outreach</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {sent ? (
          <div className="p-20 text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100">
              <Check size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Outreach Delivered!</h2>
            <p className="text-slate-500 mt-2 font-medium">Your initial outreach to {lead.name} has been processed.</p>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[50px]">To</span>
                <span className="text-sm font-bold text-slate-700">{lead.email}</span>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[50px]">Subject</span>
                <input 
                  className="flex-1 text-sm font-bold text-slate-900 bg-transparent outline-none"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="relative">
                 <textarea 
                  rows={10}
                  className="w-full p-6 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 leading-relaxed resize-none"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Compose your personalized message..."
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <VoiceDictator variant="minimal" onResult={(text) => setBody(body + ' ' + text)} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-sm">Cancel</button>
              <button 
                onClick={handleSend}
                disabled={isSending}
                className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {isSending ? 'Sending Outreach...' : 'Send Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
