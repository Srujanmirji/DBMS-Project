import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../services/api';
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, 
  AlertTriangle, Shield, Clock, Sparkles
} from 'lucide-react';

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
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = (bg = false) => {
    if (!bg) setLoading(true);
    getNotifications()
      .then(res => {
        setAlerts(res.data.alerts || []);
        setStats(res.data.stats || { total: 0, unread: 0 });
        if (!bg) setLoading(false);
      })
      .catch(() => { if (!bg) setLoading(false); });
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications(true);
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications(true);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      fetchNotifications(true);
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col space-y-8 p-4">
        <div className="h-8 bg-surface-2 rounded-lg w-1/3"></div>
        <div className="h-20 bg-surface-2 rounded-2xl w-full"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-surface-2 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-text-primary mb-2">Notifications</h1>
          <p className="text-text-secondary">Budget alerts generated automatically by the database.</p>
        </div>
        {stats.unread > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="card p-5 bg-surface-2/60 backdrop-blur-md border-amber-500/10 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-500/10 shrink-0">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Powered by MySQL Event Scheduler</p>
          <p className="text-xs text-text-muted mt-1">
            Budget alerts are generated hourly by a scheduled database event (<code className="text-amber-400/80 bg-amber-500/5 px-1.5 py-0.5 rounded">ev_budget_checker</code>). 
            When your active subscriptions exceed 80% of your monthly budget, an alert is created automatically.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 bg-surface-2/60 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10">
            <Bell className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-display text-text-primary">{stats.unread || 0}</div>
            <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Unread</div>
          </div>
        </div>
        <div className="card p-5 bg-surface-2/60 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-surface-3">
            <BellOff className="w-6 h-6 text-text-muted" />
          </div>
          <div>
            <div className="text-2xl font-display text-text-primary">{stats.total || 0}</div>
            <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">Total</div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <h3 className="section-label">All Alerts</h3>

        {alerts.length > 0 ? (
          <div className="card overflow-hidden bg-surface-2/60 backdrop-blur-md">
            <div className="divide-y divide-line/30">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex items-start gap-4 p-4 transition-colors group ${
                    alert.is_read ? 'opacity-60 hover:opacity-100' : 'hover:bg-surface-3/30'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.is_read ? 'bg-surface-3' : 'bg-amber-500/10 border border-amber-500/20'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${alert.is_read ? 'text-text-muted' : 'text-amber-400'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${alert.is_read ? 'text-text-muted' : 'text-text-primary font-medium'}`}>
                      {alert.alert_message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(alert.created_at)}
                      </span>
                      {!alert.is_read && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!alert.is_read && (
                      <button 
                        onClick={() => handleMarkRead(alert.id)} 
                        className="p-1.5 text-text-muted hover:text-emerald-400 transition-colors bg-surface-2 hover:bg-surface-3 rounded-md"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(alert.id)} 
                      className="p-1.5 text-text-muted hover:text-rose-400 transition-colors bg-surface-2 hover:bg-surface-3 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-16 flex flex-col items-center justify-center text-center gap-4 bg-surface-2/60 backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-text-muted/50" />
            </div>
            <div>
              <p className="text-text-primary font-medium text-lg">All clear!</p>
              <p className="text-sm text-text-muted mt-1">
                No budget alerts. You're within your spending limits.
              </p>
              <p className="text-xs text-text-muted/70 mt-2">
                Alerts are auto-generated when your subscriptions exceed 80% of your budget.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
