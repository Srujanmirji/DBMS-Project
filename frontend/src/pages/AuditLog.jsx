import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/api';
import { 
  Activity, PauseCircle, XCircle, PlayCircle, 
  Clock, Shield, ArrowRight, BarChart3, Zap
} from 'lucide-react';

const ACTION_CONFIG = {
  STATUS_CHANGE: {
    active: { icon: PlayCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Reactivated' },
    paused: { icon: PauseCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Paused' },
    cancelled: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Cancelled' },
  }
};

const getEventConfig = (log) => {
  const statusConfig = ACTION_CONFIG.STATUS_CHANGE[log.new_status];
  if (statusConfig) return statusConfig;
  return { icon: Activity, color: 'text-text-muted', bg: 'bg-surface-3', border: 'border-line', label: log.action };
};

const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total_events: 0, pause_events: 0, cancel_events: 0, reactivation_events: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs()
      .then(res => {
        setLogs(res.data.logs || []);
        setStats(res.data.stats || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col space-y-8 p-4">
        <div className="flex-1 space-y-6 py-1">
          <div className="h-8 bg-surface-2 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-surface-2 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-surface-2 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <h1 className="text-display-sm text-text-primary mb-2">Activity Log</h1>
        <p className="text-text-secondary">All subscription status changes tracked automatically by database triggers.</p>
      </div>

      {/* Info Banner */}
      <div className="card p-5 bg-surface-2/60 backdrop-blur-md border-blue-500/10 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-blue-500/10 shrink-0">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Powered by MySQL Triggers</p>
          <p className="text-xs text-text-muted mt-1">
            Every status change on your subscriptions is automatically captured by a database trigger (<code className="text-blue-400/80 bg-blue-500/5 px-1.5 py-0.5 rounded">trg_audit_subscriptions_update</code>). No manual logging required.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-surface-2/60 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider text-text-muted group-hover:text-violet-400 transition-colors">Total Events</span>
            <div className="p-1.5 rounded-lg bg-surface-3 group-hover:bg-violet-400/10 transition-colors">
              <Zap className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <div className="text-2xl font-display text-text-primary tracking-tight">{stats.total_events || 0}</div>
        </div>

        <div className="card p-5 bg-surface-2/60 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider text-text-muted group-hover:text-amber-400 transition-colors">Pauses</span>
            <div className="p-1.5 rounded-lg bg-surface-3 group-hover:bg-amber-400/10 transition-colors">
              <PauseCircle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-display text-text-primary tracking-tight">{stats.pause_events || 0}</div>
        </div>

        <div className="card p-5 bg-surface-2/60 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider text-text-muted group-hover:text-rose-400 transition-colors">Cancellations</span>
            <div className="p-1.5 rounded-lg bg-surface-3 group-hover:bg-rose-400/10 transition-colors">
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="text-2xl font-display text-text-primary tracking-tight">{stats.cancel_events || 0}</div>
        </div>

        <div className="card p-5 bg-surface-2/60 backdrop-blur-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-caption font-semibold uppercase tracking-wider text-text-muted group-hover:text-emerald-400 transition-colors">Reactivations</span>
            <div className="p-1.5 rounded-lg bg-surface-3 group-hover:bg-emerald-400/10 transition-colors">
              <PlayCircle className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-display text-text-primary tracking-tight">{stats.reactivation_events || 0}</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="section-label">Event Timeline</h3>

        {logs.length > 0 ? (
          <div className="card overflow-hidden bg-surface-2/60 backdrop-blur-md">
            <div className="divide-y divide-line/30">
              {logs.map((log) => {
                const config = getEventConfig(log);
                const Icon = config.icon;
                return (
                  <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-surface-3/30 transition-colors group">
                    {/* Timeline dot */}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-body font-medium text-text-primary">{log.service_name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${config.bg} ${config.color} ${config.border} border`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                        <span className="capitalize">{log.old_status}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className={`capitalize font-medium ${config.color}`}>{log.new_status}</span>
                        {log.category && (
                          <>
                            <span>·</span>
                            <span>{log.category}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(log.log_date)}
                      </span>
                      <span className="text-[10px] text-text-muted/60 mt-0.5">
                        {new Date(log.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card p-16 flex flex-col items-center justify-center text-center gap-4 bg-surface-2/60 backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center">
              <Activity className="w-8 h-8 text-text-muted/50" />
            </div>
            <div>
              <p className="text-text-primary font-medium text-lg">No activity yet</p>
              <p className="text-sm text-text-muted mt-1">
                Status changes on your subscriptions (pause, cancel, reactivate) will appear here automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
