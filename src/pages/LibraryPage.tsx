import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Music,
  Play,
  Pause,
  Download,
  Heart,
  Trash2,
  ExternalLink,
  Loader2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { Track, Generation } from '../types';
import { useAudioPlayer } from '../context/AudioPlayerContext';

interface LibraryPageProps {
  onSelectTrack: (trackId: string) => void;
  setCurrentTab: (tab: string) => void;
  filterFavoriteOnly?: boolean;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onSelectTrack,
  setCurrentTab,
  filterFavoriteOnly = false,
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleFavorite, downloadTrack } = useAudioPlayer();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [pendingGens, setPendingGens] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadLibrary();
  }, [statusFilter, searchTerm, sortBy, filterFavoriteOnly]);

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const res = await api.getLibrary({
        status: statusFilter,
        favorite: filterFavoriteOnly,
        search: searchTerm,
        sort: sortBy,
      });
      setTracks(res.tracks || []);
      setPendingGens(res.pendingGenerations || []);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this track from your studio library?')) return;

    try {
      await api.deleteTrack(trackId);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (err) {
      alert('Failed to delete track');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            {filterFavoriteOnly ? 'Starred Creations' : 'My Studio Library'}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} stored in your personal account
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, style, prompt..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="duration">Longest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Storage & Download Advice banner */}
      <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-2.5 text-xs text-zinc-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong>Storage Tip:</strong> Download tracks you love to your local drive. AI audio streams from provider endpoints may be subject to retention policies over time.
        </span>
      </div>

      {/* Pending Generations Section if any are active */}
      {pendingGens.length > 0 && !filterFavoriteOnly && (
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
          <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Active Generations on Kie.ai ({pendingGens.length})</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pendingGens.map((gen) => (
              <div
                key={gen.id}
                className="p-3 rounded-lg bg-zinc-900/80 border border-indigo-500/20 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-white truncate">{gen.title}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">Task: {gen.taskId}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                  {gen.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracks Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs">Loading tracks...</span>
        </div>
      ) : tracks.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
          <Music className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-300">No tracks found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm
              ? 'Try changing your search terms or filters.'
              : 'You have not generated any tracks yet. Launch the studio to get started!'}
          </p>
          <button
            onClick={() => setCurrentTab('create')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Create Your First Track
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isFav = Boolean(track.isFavorite);

            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`p-4 rounded-xl bg-zinc-900/70 border transition group flex flex-col justify-between cursor-pointer ${
                  isCurrent
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div>
                  {/* Artwork with Play Overlay */}
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-800 mb-3">
                    {track.imageUrl ? (
                      <img
                        src={track.imageUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                        <Music className="w-10 h-10" />
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        isCurrent ? togglePlay() : playTrack(track);
                      }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <div className="w-12 h-12 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        )}
                      </div>
                    </button>

                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-300">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Title & Style */}
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition">
                    {track.title}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {track.style || 'AI Composition'}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span className="text-[11px] font-mono">
                    {track.model || 'suno-v4'}
                  </span>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFavorite(track.id)}
                      className={`p-1.5 rounded-lg transition ${
                        isFav ? 'text-rose-500' : 'text-zinc-500 hover:text-white'
                      }`}
                      title={isFav ? 'Unstar' : 'Star'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => downloadTrack(track)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title="Download MP3"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(track.id, e)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                      title="Delete track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
