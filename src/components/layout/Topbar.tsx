import React from 'react';
import { Menu, KeyRound, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openConnectModal: () => void;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Studio Dashboard', subtitle: 'Overview of your personal music workspace & Kie.ai link' },
  create: { title: 'Create Music', subtitle: 'Generate songs via Kie.ai Suno V4 with your own API key' },
  library: { title: 'My Music Library', subtitle: 'Tracks generated exclusively for your account' },
  lyrics: { title: 'Lyrics Studio', subtitle: 'Write and structure verse, chorus, and vocal flows' },
  tools: { title: 'Music Tools', subtitle: 'Extend, transform, separate stems, and generate videos' },
  favorites: { title: 'Favorite Tracks', subtitle: 'Your starred music creations' },
  'kie-settings': { title: 'Kie.ai BYOK Settings', subtitle: 'Bring Your Own Kie.ai API Key securely' },
  settings: { title: 'Account Settings', subtitle: 'Manage your profile and studio preferences' },
  admin: { title: 'Admin Studio Control', subtitle: 'System metrics and user management (No user keys exposed)' },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  setCurrentTab,
  openConnectModal,
  setIsMobileMenuOpen,
}) => {
  const { kieConnection } = useAuth();
  const current = TAB_TITLES[currentTab] || { title: 'SUNOMAKER', subtitle: 'Your Music Studio. Your Kie.ai API Key.' };

  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        {setIsMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {current.title}
          </h1>
          <p className="text-xs text-zinc-400 hidden sm:block">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* BYOK Status Pill */}
        <button
          onClick={openConnectModal}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            kieConnection.connected
              ? kieConnection.isMock
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20 animate-pulse'
          }`}
        >
          {kieConnection.connected ? (
            <>
              <CheckCircle2 className={`w-3.5 h-3.5 ${kieConnection.isMock ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className="font-mono text-[11px]">{kieConnection.maskedKey || 'Kie.ai Linked'}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${kieConnection.isMock ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                {kieConnection.isMock ? 'DEMO' : 'LIVE'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Connect Kie.ai API Key</span>
            </>
          )}
        </button>

        {/* Create Music Button */}
        {currentTab !== 'create' && (
          <button
            onClick={() => setCurrentTab('create')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        )}
      </div>
    </header>
  );
};
