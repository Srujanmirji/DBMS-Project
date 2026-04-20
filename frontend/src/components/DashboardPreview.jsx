import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, WifiOff } from 'lucide-react';
import { getSubscriptions, getDashboard } from '../services/api';

const MOCK = [
  { id: 1, service_name: 'Netflix',  recurring_amount: 499, status: 'active', next_due_date: '2026-04-23' },
  { id: 2, service_name: 'Spotify',  recurring_amount: 129, status: 'active', next_due_date: '2026-05-02' },
  { id: 3, service_name: 'Notion',   recurring_amount: 399, status: 'active', next_due_date: '2026-04-21' },
  { id: 4, service_name: 'YouTube',  recurring_amount: 299, status: 'active', next_due_date: '2026-05-10' },
];

const ICONS  = { Netflix: '🍿', Spotify: '🎧', Notion: '📝', YouTube: '▶️', default: '📦' };
const COLORS = { Netflix: 'bg-red-500/10', Spotify: 'bg-emerald-500/10', Notion: 'bg-slate-400/10', YouTube: 'bg-rose-500/10', default: 'bg-white/5' };

function daysUntil(d) {
  const diff = Math.ceil((new Date(d) - new Date()) / 864e5);
  if (diff <= 0) return 'Due today';
  if (diff === 1) return 'Tomorrow';
  return `${diff}d left`;
}

export default function DashboardPreview() {
  const [subs, setSubs]       = useState([]);
  const [spend, setSpend]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [live, setLive]       = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, d] = await Promise.all([getSubscriptions(), getDashboard()]);
        setSubs(s.data); setSpend(d.data.stats?.estimated_monthly_spend ?? 0); setLive(true);
      } catch {
        setSubs(MOCK); setSpend(MOCK.reduce((a, b) => a + b.recurring_amount, 0));
        setError('Offline – demo data'); setLive(false);
      } finally { setLoading(false); }
    })();
  }, []);

  // Count-up animation
  const spendRef = useRef(null);
  const isInView = useInView(spendRef, { once: true, margin: '-50px' });
  const [displaySpend, setDisplaySpend] = useState(0);

  useEffect(() => {
    if (!isInView || spend === 0) return;
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplaySpend(Math.floor(eased * spend));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, spend]);

  if (loading) return (
    <div className="glass w-full max-w-[380px] h-[420px] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-5 h-5 text-accent animate-spin" />
      <span className="text-micro text-text-muted">Loading…</span>
    </div>
  );

  const bars = [
    { w: '42%', color: 'bg-accent' },
    { w: '28%', color: 'bg-purple-500' },
    { w: '18%', color: 'bg-green-accent' },
  ];

  return (
    <div id="dashboard" className="glass w-full max-w-[380px] p-5 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/[0.06] blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        {error && (
          <div className="flex items-center gap-1.5 mb-4 p-2 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 text-amber-400 text-micro font-medium">
            <WifiOff className="w-3 h-3 flex-shrink-0" />{error}
          </div>
        )}

        <div className="flex items-center justify-between mb-1">
          <span className="text-micro font-medium text-text-muted">Monthly spend</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${live ? 'bg-green-muted text-green-accent' : 'bg-amber-500/10 text-amber-400'}`}>
            {live ? 'Live' : 'Demo'}
          </span>
        </div>

        <div ref={spendRef} className="flex items-baseline gap-1 mb-0.5">
          <span className="text-display-sm font-display font-bold text-text-primary">₹{Number(displaySpend).toLocaleString('en-IN')}</span>
        </div>
        <p className="text-micro text-text-muted mb-5">{subs.length} active subscription{subs.length !== 1 ? 's' : ''}</p>

        {/* Bar */}
        <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-surface-3 mb-6">
          {bars.map((b, i) => (
            <motion.div key={i} initial={{ width: 0 }} animate={{ width: b.w }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`h-full rounded-full ${b.color}`} />
          ))}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-micro font-semibold text-text-primary">Subscriptions</span>
          <span className="text-[10px] text-text-muted font-medium cursor-pointer hover:text-accent transition-colors">View all →</span>
        </div>

        <div className="space-y-1.5">
          {subs.map((s, i) => {
            const due  = s.next_due_date && (daysUntil(s.next_due_date) === 'Due today' || daysUntil(s.next_due_date) === 'Tomorrow');
            const icon = ICONS[s.service_name]  ?? ICONS.default;
            const bg   = COLORS[s.service_name] ?? COLORS.default;
            return (
              <motion.div key={s.id ?? i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-3/50 border border-line hover:border-line-hover transition-colors group cursor-default"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`${bg} w-8 h-8 rounded-lg flex items-center justify-center text-sm group-hover:scale-105 transition-transform duration-150`}>{icon}</div>
                  <div>
                    <div className="text-caption font-medium text-text-primary leading-tight">{s.service_name}</div>
                    <div className={`text-micro ${due ? 'text-rose-400' : 'text-text-muted'}`}>{s.next_due_date ? daysUntil(s.next_due_date) : '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-caption font-semibold text-text-primary">₹{s.recurring_amount}</span>
                  {due ? <AlertCircle className="w-3 h-3 text-rose-400" /> : <CheckCircle2 className="w-3 h-3 text-green-accent/50" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
