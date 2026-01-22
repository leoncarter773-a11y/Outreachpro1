
import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  ChevronRight,
  Zap,
  ArrowRight,
  Copy,
  Check,
  Download,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Profile } from '../types.ts';

const data = [
  { name: 'Mon', leads: 4, bookings: 1 },
  { name: 'Tue', leads: 7, bookings: 2 },
  { name: 'Wed', leads: 5, bookings: 4 },
  { name: 'Thu', leads: 8, bookings: 3 },
  { name: 'Fri', leads: 12, bookings: 6 },
  { name: 'Sat', leads: 3, bookings: 2 },
  { name: 'Sun', leads: 2, bookings: 0 },
];

const StatCard = ({ title, value, change, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
        {change}
        <ArrowUpRight size={14} />
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

export const DashboardView = ({ profile }: { profile: Profile }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleExportCSV = () => {
    setDownloading(true);
    const leads = [
      { name: 'Alex Rivera', company: 'Nexus Digital', status: 'New' },
      { name: 'Sarah Chen', company: 'BrightFlow AI', status: 'Contacted' },
      { name: 'Mark Thompson', company: 'Global Logistics', status: 'New' },
      { name: 'Elena Gilbert', company: 'Startup Studio', status: 'Negotiating' },
      { name: 'Jordan Hayes', company: 'Hayes Creative', status: 'New' },
    ];
    
    const headers = ['Name', 'Company', 'Status'];
    const csvContent = [
      headers.join(','),
      ...leads.map(l => [l.name, l.company, l.status].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'outreach_leads_summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setDownloading(false), 1000);
  };

  const handleCopySummary = () => {
    const text = `Dashboard Lead Summary - ${new Date().toLocaleDateString()}\nTotal Leads: 1,284\nConversion: 3.6%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight tracking-tighter">Good morning, {profile.fullName.split(' ')[0]}</h1>
          <p className="text-slate-500 font-medium">Your client acquisition performance is up <span className="text-emerald-600 font-bold">12%</span> this week.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopySummary}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm"
            title="Copy Summary"
          >
            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest shadow-sm"
          >
            {downloading ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <Download size={16} className="text-slate-400" />}
            {downloading ? 'Processing...' : 'Export CSV'}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-xs uppercase tracking-widest">
            <Plus size={18} />
            New Campaign
          </button>
        </div>
      </div>

      {profile.plan === 'starter' && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-[32px] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-[20px] flex items-center justify-center shrink-0 border border-white/10 group-hover:rotate-12 transition-transform duration-500">
              <Zap className="text-indigo-400 animate-pulse" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-1 tracking-tight">Upgrade to VA Pro™</h2>
              <p className="text-indigo-200/60 text-sm max-w-md font-medium leading-relaxed">Unlock unlimited leads, Gemini-powered sequence automation, and high-frequency campaign tracking.</p>
            </div>
          </div>
          <button className="relative z-10 px-10 py-4 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-xl shrink-0">
            Get Pro Access <ArrowRight size={18} className="inline ml-2" />
          </button>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[120px] group-hover:scale-150 transition-transform duration-1000" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Leads" 
          value="1,284" 
          change="+12.5%" 
          icon={<Users className="text-indigo-600" size={24} />} 
          color="bg-indigo-50"
        />
        <StatCard 
          title="Outreach Sent" 
          value="4,290" 
          change="+24.1%" 
          icon={<MessageSquare className="text-purple-600" size={24} />} 
          color="bg-purple-50"
        />
        <StatCard 
          title="Calls Booked" 
          value="156" 
          change="+18.7%" 
          icon={<Calendar className="text-amber-600" size={24} />} 
          color="bg-amber-50"
        />
        <StatCard 
          title="Conversion Rate" 
          value="3.6%" 
          change="+4.3%" 
          icon={<TrendingUp className="text-emerald-600" size={24} />} 
          color="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tight">Acquisition Velocity</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest outline-none text-slate-600 focus:ring-2 focus:ring-indigo-500/20 transition-all">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', padding: '12px'}}
                  cursor={{stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="leads" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tight">Recent Prospects</h2>
            <button className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">View All Pipeline</button>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { name: 'Alex Rivera', company: 'Nexus Digital', status: 'New', time: '2m ago' },
              { name: 'Sarah Chen', company: 'BrightFlow AI', status: 'Contacted', time: '15m ago' },
              { name: 'Mark Thompson', company: 'Global Logistics', status: 'New', time: '1h ago' },
              { name: 'Elena Gilbert', company: 'Startup Studio', status: 'Negotiating', time: '3h ago' },
              { name: 'Jordan Hayes', company: 'Hayes Creative', status: 'New', time: '5h ago' },
            ].map((lead, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-[14px] flex items-center justify-center font-black text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {lead.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{lead.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{lead.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-[9px] uppercase tracking-[0.1em] font-black px-3 py-1 rounded-full ${
                    lead.status === 'New' ? 'bg-indigo-50 text-indigo-600' : 
                    lead.status === 'Contacted' ? 'bg-purple-50 text-purple-600' : 
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {lead.status}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400 font-bold">{lead.time}</span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
