/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Activity,
  Lock,
  FileText,
  Trash2,
  MoreVertical,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Severity = 'low' | 'medium' | 'high' | 'critical';
type Status = 'open' | 'investigating' | 'resolved' | 'archived';

interface Report {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: Status;
  timestamp: number;
  assetId: string;
  reporter: string;
}

// --- Constants ---

const SEVERITY_COLORS: Record<Severity, string> = {
  low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  critical: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_COLORS: Record<Status, string> = {
  open: 'text-emerald-400 bg-emerald-400/10',
  investigating: 'text-purple-400 bg-purple-400/10',
  resolved: 'text-gray-400 bg-gray-400/10',
  archived: 'text-stone-500 bg-stone-500/10',
};

// --- Initial Data ---

const INITIAL_REPORTS: Report[] = [
  {
    id: 'SR-1024',
    title: 'Unauthorized API Access Attempt',
    description: 'Multiple failed authentication attempts detected from IP 192.168.1.105 targeting the /admin/config endpoint.',
    severity: 'high',
    status: 'investigating',
    timestamp: Date.now() - 3600000,
    assetId: 'AUTH-SERVER-01',
    reporter: 'System Watchdog',
  },
  {
    id: 'SR-1025',
    title: 'SQL Injection Vulnerability in Search',
    description: 'Potential SQL injection point identified in the global search parameter. Sanitization layer missing.',
    severity: 'critical',
    status: 'open',
    timestamp: Date.now() - 7200000,
    assetId: 'WEB-FRONTEND-PROD',
    reporter: 'Security Audit Tool',
  },
  {
    id: 'SR-1026',
    title: 'Outdated SSL Certificate',
    description: 'The SSL certificate for dev.sentinel.io is set to expire in 48 hours.',
    severity: 'low',
    status: 'resolved',
    timestamp: Date.now() - 86400000,
    assetId: 'DEV-GATEWAY',
    reporter: 'Cert-Monitor',
  }
];

// --- Components ---

export default function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // New Report Form State
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    severity: 'medium' as Severity,
    assetId: '',
  });

  // --- Persistence ---

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_reports');
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        setReports(INITIAL_REPORTS);
      }
    } else {
      setReports(INITIAL_REPORTS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sentinel_reports', JSON.stringify(reports));
    }
  }, [reports, isLoaded]);

  // --- Logic ---

  const filteredReports = useMemo(() => {
    return reports
      .filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             r.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = filterSeverity === 'all' || r.severity === filterSeverity;
        return matchesSearch && matchesSeverity;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [reports, searchQuery, filterSeverity]);

  const stats = useMemo(() => ({
    total: reports.length,
    critical: reports.filter(r => r.severity === 'critical').length,
    open: reports.filter(r => r.status === 'open').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  }), [reports]);

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    const report: Report = {
      id: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newReport,
      status: 'open',
      timestamp: Date.now(),
      reporter: 'Manual Entry',
    };
    setReports([report, ...reports]);
    setIsFormOpen(false);
    setNewReport({ title: '', description: '', severity: 'medium', assetId: '' });
  };

  const handleDelete = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  const handleStatusChange = (id: string, status: Status) => {
    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] font-sans selection:bg-emerald-500/30">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold tracking-tight text-lg uppercase">Sentinel <span className="text-emerald-500">v3</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-xs font-mono text-stone-500">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span>SYSTEM: OPTIMAL</span>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <Lock className="w-3 h-3 text-blue-500" />
                <span>ENCRYPTION: AES-256</span>
              </div>
            </div>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              NEW REPORT
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'TOTAL REPORTS', value: stats.total, icon: FileText, color: 'text-blue-400' },
            { label: 'CRITICAL THREATS', value: stats.critical, icon: AlertTriangle, color: 'text-red-400' },
            { label: 'OPEN INCIDENTS', value: stats.open, icon: Clock, color: 'text-emerald-400' },
            { label: 'RESOLVED', value: stats.resolved, icon: CheckCircle2, color: 'text-stone-400' },
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-[#121214] border border-white/5 p-6 rounded-xl hover:border-white/10 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div className="text-3xl font-mono font-bold">{stat.value.toString().padStart(2, '0')}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input 
              type="text"
              placeholder="Search by ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121214] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-4 h-4 text-stone-500 mr-2 shrink-0" />
            {['all', 'low', 'medium', 'high', 'critical'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s as any)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                  filterSeverity === s 
                    ? 'bg-white text-black' 
                    : 'bg-[#121214] text-stone-500 hover:text-stone-300 border border-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-[#121214] border border-white/5 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[80px_1.5fr_1fr_1fr_120px_60px] px-6 py-4 border-b border-white/5 text-[10px] font-bold tracking-widest text-stone-500 uppercase bg-white/[0.02]">
            <div>ID</div>
            <div>INCIDENT TITLE</div>
            <div>ASSET</div>
            <div>STATUS</div>
            <div>TIMESTAMP</div>
            <div className="text-right">ACTIONS</div>
          </div>
          
          <div className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={report.id}
                  className="grid grid-cols-[80px_1.5fr_1fr_1fr_120px_60px] px-6 py-5 items-center hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <div className="font-mono text-xs text-stone-500">{report.id}</div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm group-hover:text-emerald-400 transition-colors">{report.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${SEVERITY_COLORS[report.severity]}`}>
                        {report.severity}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1 pr-8">{report.description}</p>
                  </div>
                  <div className="text-xs font-mono text-stone-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                    {report.assetId}
                  </div>
                  <div>
                    <select 
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value as Status)}
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded focus:outline-none cursor-pointer ${STATUS_COLORS[report.status]}`}
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="text-[10px] font-mono text-stone-500">
                    {new Date(report.timestamp).toLocaleDateString()}<br/>
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleDelete(report.id)}
                      className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                      <ChevronRight className="w-4 h-4 text-stone-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredReports.length === 0 && (
              <div className="py-20 text-center text-stone-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-sm">No incidents found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#121214] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">CREATE INCIDENT REPORT</h2>
                <button onClick={() => setIsFormOpen(false)} className="text-stone-500 hover:text-white transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleAddReport} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">Incident Title</label>
                  <input 
                    required
                    value={newReport.title}
                    onChange={e => setNewReport({...newReport, title: e.target.value})}
                    placeholder="e.g. Brute force attack detected"
                    className="w-full bg-black/30 border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">Severity</label>
                    <select 
                      value={newReport.severity}
                      onChange={e => setNewReport({...newReport, severity: e.target.value as Severity})}
                      className="w-full bg-black/30 border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">Asset ID</label>
                    <input 
                      required
                      value={newReport.assetId}
                      onChange={e => setNewReport({...newReport, assetId: e.target.value})}
                      placeholder="e.g. DB-CLUSTER-01"
                      className="w-full bg-black/30 border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">Detailed Description</label>
                  <textarea 
                    required
                    value={newReport.description}
                    onChange={e => setNewReport({...newReport, description: e.target.value})}
                    rows={4}
                    placeholder="Describe the incident, impact, and initial findings..."
                    className="w-full bg-black/30 border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-white/5 hover:bg-white/5 text-sm font-semibold transition-all"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    SUBMIT REPORT
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Footer Info */}
      <footer className="max-w-[1600px] mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-stone-600 text-[10px] font-mono tracking-widest uppercase">
            <span>© 2026 SENTINEL DEFENSE SYSTEMS</span>
            <span className="w-1 h-1 rounded-full bg-stone-800" />
            <span>SECURE TERMINAL ACCESS</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer">
              <span className="text-[10px] font-bold tracking-widest uppercase">Documentation</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer">
              <span className="text-[10px] font-bold tracking-widest uppercase">API Status</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
