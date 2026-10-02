import React, { useState } from 'react';
import {
  Radio,
  KeyRound,
  Shield,
  Sparkles,
  Music2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Play,
  Layers,
  FileText,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { login, register, switchDemo } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider">SUNOMAKER</span>
              <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">V2 BYOK</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => switchDemo('USER')}
              className="text-xs px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
            >
              Demo Preview (Producer)
            </button>
            <button
              onClick={() => switchDemo('ADMIN')}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 font-semibold transition"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission & BYOK Architecture */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Bring Your Own Kie.ai API Key (BYOK)</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Your Music Studio. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Your Kie.ai API Key.
              </span>
            </h1>

            <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
              Generate full studio tracks, lyrics, covers, and stem separations directly using your personal Kie.ai Suno account. Zero platform markup, zero internal credit limits, and server-side hardware-grade AES-256-GCM encryption.
            </p>

            {/* Core BYOK Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm mb-1">
                  <Shield className="w-4 h-4" />
                  <span>Hardware-Grade AES-256</span>
                </div>
                <p className="text-xs text-zinc-400 leading-normal">
                  Your Kie.ai key is encrypted using AES-256-GCM and never exposed to the frontend or logs after saving.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm mb-1">
                  <Sliders className="w-4 h-4" />
                  <span>Suno V4 & Custom Studio</span>
                </div>
                <p className="text-xs text-zinc-400 leading-normal">
                  Quick Mode, Custom Mode, vocal gender direction, lyrics generation, stem separation, and audio covers.
                </p>
              </div>
            </div>

            {/* Important Rights / Notice */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-start gap-2.5 text-xs text-zinc-400">
              <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                <strong>Ownership & Policy:</strong> SUNOMAKER does not provide Kie.ai credits. Users are responsible for ensuring they have necessary rights for lyrics and audio transformed.
              </span>
            </div>
          </div>

          {/* Right Column: Sign In / Register Card */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isRegisterMode ? 'Create Studio Account' : 'Welcome to SUNOMAKER'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {isRegisterMode ? 'Sign up to connect your Kie.ai key' : 'Enter your credentials to enter the studio'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Producer / Artist Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan Vane"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="producer@sunomaker.studio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {loading ? 'Entering Studio...' : isRegisterMode ? 'Register Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition"
                >
                  {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register here"}
                </button>
              </div>

              {/* Instant Demo Sandbox Access */}
              <div className="mt-6 pt-5 border-t border-zinc-800/80">
                <p className="text-[11px] text-center text-zinc-400 mb-3">Or explore immediately with pre-configured accounts:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => switchDemo('USER')}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition"
                  >
                    <Music2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Alex Producer</span>
                  </button>
                  <button
                    onClick={() => switchDemo('ADMIN')}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Studio Admin</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
