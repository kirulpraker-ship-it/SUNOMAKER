import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Music,
  CheckCircle2,
  XCircle,
  KeyRound,
  Lock,
  Activity,
  UserX,
  UserCheck,
  Loader2,
  FileText,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { AdminStats, AdminUser, Generation, AuditLogItem } from '../types';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'generations' | 'logs'>('users');
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, gensData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminGenerations(),
        api.getAdminAuditLogs(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setGenerations(gensData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to ${nextStatus.toLowerCase()} user ${user.name}?`)) return;

    try {
      await api.updateAdminUser(user.id, { status: nextStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    } catch {
      alert('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* Admin Header with Privacy Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white">Admin Studio Control</h2>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
              System Admin
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            System overview and user management. Protected under zero-key exposure policy.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center space-x-2 text-xs text-zinc-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict BYOK Privacy: No user API keys or secrets exposed</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium">Total Users</span>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium">Connected BYOK</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.connectedKieUsers}</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium">Disconnected</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{stats.disconnectedUsers}</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium">Total Generations</span>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalGenerations}</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium">Successful</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{stats.successfulGenerations}</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-medium">Failed</span>
            <div className="text-2xl font-bold text-rose-400 mt-1">{stats.failedGenerations}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 ${
            activeTab === 'users'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Studio Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('generations')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 ${
            activeTab === 'generations'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Recent Generations ({generations.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* USERS TABLE */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-72">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5">Kie.ai BYOK</th>
                      <th className="p-3.5">Masked Key</th>
                      <th className="p-3.5">Generations</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-900/80 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-zinc-500">{u.email}</p>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {u.kieConnection.connected ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> Connected
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[11px]">Not Connected</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-zinc-400">
                          {u.kieConnection.maskedKey || '—'}
                        </td>
                        <td className="p-3.5 font-bold text-white">{u.generationCount}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              u.status === 'ACTIVE'
                                ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60'
                                : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GENERATIONS TABLE */}
          {activeTab === 'generations' && (
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5">Title</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Task ID</th>
                    <th className="p-3.5">Model</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {generations.map((g) => (
                    <tr key={g.id} className="hover:bg-zinc-900/80">
                      <td className="p-3.5 font-semibold text-white">{g.title}</td>
                      <td className="p-3.5 text-zinc-400">{(g as any).userName || g.userId}</td>
                      <td className="p-3.5 font-mono text-[11px] text-zinc-500">{g.taskId}</td>
                      <td className="p-3.5 font-mono text-[11px] text-indigo-400">{g.model}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            g.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : g.status === 'FAILED'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-indigo-500/10 text-indigo-400'
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-500">{new Date(g.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AUDIT LOGS TABLE */}
          {activeTab === 'logs' && (
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Action Event</th>
                    <th className="p-3.5">Details (No Keys)</th>
                    <th className="p-3.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/80">
                      <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-medium text-white">{log.userName || log.userId || 'System'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-zinc-400 max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                      <td className="p-3.5 text-zinc-500 font-mono text-[11px]">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
