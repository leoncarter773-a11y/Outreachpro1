
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Target,
  ShieldCheck,
  CheckCircle,
  Github
} from 'lucide-react';
import { Profile } from '../types.ts';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    } ${collapsed ? 'justify-center' : 'gap-3'}`}
  >
    {icon}
    {!collapsed && <span className="font-medium">{label}</span>}
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  profile: Profile;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, profile }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'leads', icon: <Target size={20} />, label: 'Leads' },
    { id: 'outreach', icon: <MessageSquare size={20} />, label: 'Outreach' },
    { id: 'releases', icon: <Github size={20} />, label: 'Releases' },
    { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { id: 'team', icon: <Users size={20} />, label: 'Team' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-2xl"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:relative z-40 h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className={`flex items-start mb-6 ${collapsed ? 'justify-center' : 'justify-between px-2'}`}>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-black">O</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">Outreach<span className="text-indigo-600">Pro™</span></span>
                </div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-10 leading-none">
                  ©™ Carter Bey Global Sync Software
                </div>
              </div>
            )}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50"
            >
              <ChevronRight className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} size={18} />
            </button>
          </div>

          {!collapsed && (
            <div className="mb-6 px-2 space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full w-fit">
                <ShieldCheck size={12} className="text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{profile.plan} Plan</span>
              </div>
              {profile.isVerified && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full w-fit">
                  <CheckCircle size={10} className="text-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Verified Identity</span>
                </div>
              )}
            </div>
          )}

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeView === item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                collapsed={collapsed}
              />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <SidebarItem
              icon={<LogOut size={20} />}
              label="Log Out"
              onClick={() => onNavigate('landing')}
              collapsed={collapsed}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
