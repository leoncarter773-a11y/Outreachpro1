
import React, { useState } from 'react';
import { Layout } from './components/Layout.tsx';
import { LandingView } from './views/Landing.tsx';
import { OnboardingView } from './views/Onboarding.tsx';
import { DashboardView } from './views/Dashboard.tsx';
import { LeadsView } from './views/Leads.tsx';
import { OutreachView } from './views/Outreach.tsx';
import { Profile } from './types.ts';
import { VoiceDictator } from './components/VoiceDictator.tsx';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';

const App: React.FC = () => {
  const [view, setView] = useState('landing');
  const [profile, setProfile] = useState<Profile | null>(null);

  const handleOnboardingComplete = (data: any) => {
    const newProfile: Profile = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: data.fullName || "Sarah Carter", // Mock default
      role: 'freelancer',
      plan: data.plan || 'starter',
      isVerified: true,
      serviceType: data.service || 'VA Services'
    };
    setProfile(newProfile);
    setView('dashboard');
  };

  // Simple Router
  const renderView = () => {
    if (!profile && view !== 'landing' && view !== 'onboarding') return null;

    switch (view) {
      case 'dashboard':
        return <DashboardView profile={profile!} />;
      case 'leads':
        return <LeadsView profile={profile!} />;
      case 'outreach':
        return <OutreachView profile={profile!} />;
      case 'analytics':
        return (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center p-10">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
              <span className="text-2xl font-bold">A</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Detailed Analytics</h2>
            <p className="text-slate-500 max-w-sm">
              We're crunching the numbers! Your detailed analytics report will be ready shortly.
            </p>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Agency Team</h1>
            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl text-center">
              <h2 className="text-xl font-bold text-indigo-900 mb-2">Grow your team</h2>
              <p className="text-indigo-700 max-w-lg mx-auto mb-6">
                Upgrade to the Agency plan to add members, assign leads, and monitor performance in real-time.
              </p>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Upgrade to Agency
              </button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold border-b border-slate-100 pb-3">Personal Information</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                      <VoiceDictator variant="minimal" onResult={(text) => setProfile(prev => prev ? {...prev, fullName: text} : null)} />
                    </div>
                    <input 
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" 
                      value={profile?.fullName || ""} 
                      onChange={(e) => setProfile(prev => prev ? {...prev, fullName: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                    <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" defaultValue="sarah@agencyva.com" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold border-b border-slate-100 pb-3">Subscription</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase">{profile?.plan} Plan</p>
                    <p className="text-xs text-slate-400">{profile?.plan === 'starter' ? 'Free Forever' : profile?.plan === 'pro' ? '$49 / Month' : '$199 / Month'}</p>
                  </div>
                  <button className="text-indigo-600 text-sm font-bold hover:underline">Manage</button>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-3">Next billing cycle starts April 12, 2026.</p>
                  <button className="w-full py-2 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">Change Payment Method</button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardView profile={profile!} />;
    }
  };

  if (view === 'landing') {
    return <LandingView onStart={() => setView('onboarding')} />;
  }

  if (view === 'onboarding') {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout activeView={view} onNavigate={setView} profile={profile!}>
      {renderView()}
      <VoiceAssistant onNavigate={setView} />
    </Layout>
  );
};

export default App;
