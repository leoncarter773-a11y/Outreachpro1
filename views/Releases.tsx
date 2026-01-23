
import React, { useState } from 'react';
import { 
  Github, 
  Package, 
  Plus, 
  Tag, 
  Calendar, 
  ExternalLink, 
  Loader2, 
  X,
  FileCode,
  Globe,
  ArrowUpRight,
  GitBranch,
  Sparkles
} from 'lucide-react';
import { CampaignRelease } from '../types.ts';
import { gemini } from '../services/geminiService.ts';

const MOCK_RELEASES: CampaignRelease[] = [
  {
    id: '1',
    tag: 'v1.2.0',
    name: 'E-commerce Q2 Expansion',
    notes: '## New Leads Acquired\n- Added 45 high-ticket e-commerce founders.\n## Outreach Strategy Updates\n- Integrated personalized video outreach step.\n## Conversion Milestones\n- Booked 8 calls this week.',
    createdAt: '2025-05-15T10:00:00Z',
    leadCount: 45,
    sequenceCount: 3,
    githubUrl: 'https://github.com/user/outreach-pro/releases/tag/v1.2.0'
  },
  {
    id: '2',
    tag: 'v1.1.0',
    name: 'Initial LinkedIn Pilot',
    notes: 'Initial outreach targeting SaaS founders in the UK market.',
    createdAt: '2025-04-30T14:20:00Z',
    leadCount: 12,
    sequenceCount: 1
  }
];

export const ReleasesView = () => {
  const [releases, setReleases] = useState<CampaignRelease[]>(MOCK_RELEASES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newTag, setNewTag] = useState('v1.3.0');
  const [newName, setNewName] = useState('June Growth Campaign');
  const [newNotes, setNewNotes] = useState('');
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const handleGenerateNotes = async () => {
    setIsGeneratingNotes(true);
    try {
      const notes = await gemini.generateReleaseNotes(newTag, 50, "Focusing on AI startups in San Francisco.");
      setNewNotes(notes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    // Simulate GitHub API call
    setTimeout(() => {
      const release: CampaignRelease = {
        id: Math.random().toString(),
        tag: newTag,
        name: newName,
        notes: newNotes,
        createdAt: new Date().toISOString(),
        leadCount: 52,
        sequenceCount: 4,
        githubUrl: `https://github.com/user/outreach-pro/releases/tag/${newTag}`
      };
      setReleases([release, ...releases]);
      setIsPublishing(false);
      setIsModalOpen(false);
      setNewTag('');
      setNewName('');
      setNewNotes('');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <Github className="text-slate-900" size={32} />
            Campaign Releases
          </h1>
          <p className="text-slate-500 font-medium">Version your outreach strategy and export state to GitHub.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200 text-xs uppercase tracking-widest"
        >
          <Plus size={18} />
          Create New Release
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GitBranch className="text-slate-400" size={20} />
              <div className="flex items-center gap-2">
                 <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Repository:</span>
                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">main</span>
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Release: {releases[0]?.tag}</div>
          </div>

          <div className="divide-y divide-slate-50">
            {releases.map((release) => (
              <div key={release.id} className="p-8 hover:bg-slate-50/50 transition-colors group">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column: Tag & Date */}
                  <div className="lg:w-64 shrink-0 space-y-3">
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Tag size={12} /> {release.tag}
                       </span>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                       <Calendar size={14} />
                       <span className="text-xs font-bold">{new Date(release.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{release.name}</h2>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                            <Package size={14} className="text-slate-400" /> {release.leadCount} Leads
                          </span>
                          <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                            <FileCode size={14} className="text-slate-400" /> {release.sequenceCount} Sequences
                          </span>
                        </div>
                      </div>
                      {release.githubUrl && (
                        <a 
                          href={release.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-2xl transition-all"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>

                    <div className="prose prose-slate prose-sm max-w-none">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-600">
                        {release.notes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: New Release */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Github size={24} className="text-slate-900" />
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">Create GitHub Release</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-white shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={12} /> Version Tag
                  </label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                    placeholder="e.g. v1.3.0"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Package size={12} /> Release Name
                  </label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700"
                    placeholder="e.g. Summer Expansion"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileCode size={12} /> Release Notes (Markdown)
                  </label>
                  <button 
                    onClick={handleGenerateNotes}
                    disabled={isGeneratingNotes}
                    className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline disabled:opacity-50"
                  >
                    {isGeneratingNotes ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Auto-Generate with Gemini
                  </button>
                </div>
                <textarea 
                  rows={8}
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[24px] outline-none font-mono text-xs leading-relaxed text-slate-700 resize-none"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="## Improvements\n- Better lead scraping..."
                />
              </div>

              {/* Fix potential parsing error on line 267 by ensuring clean tags */}
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-indigo-700">
                  <Globe size={24} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">Visibility</p>
                    <p className="text-xs font-bold opacity-60">This release will be public on your repository.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                   Public
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold text-sm">Cancel</button>
              <button 
                onClick={handlePublish}
                disabled={isPublishing || !newTag || !newName}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-2xl disabled:opacity-50"
              >
                {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                {isPublishing ? 'Publishing to GitHub...' : 'Create & Publish Release'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
