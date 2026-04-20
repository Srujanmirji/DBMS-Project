import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { CreditCard, Calendar, Activity, PauseCircle, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: { active_subs: 0, paused_subs: 0, cancelled_subs: 0, estimated_monthly_spend: 0, estimated_annual_spend: 0 },
    categoryBreakdown: [],
    upcomingRenewals: [],
    dueThisWeek: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false)); // fallback gracefully
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-6 bg-surface-2 rounded w-1/4"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-32 bg-surface-2 rounded col-span-1"></div><div className="h-32 bg-surface-2 rounded col-span-1"></div><div className="h-32 bg-surface-2 rounded col-span-1"></div></div></div></div></div>;
  }

  const { stats, categoryBreakdown, upcomingRenewals, dueThisWeek } = data;

  // Alerts logic: identify renewals due in <= 3 days heavily emphasizing 1 day
  const today = new Date();
  const alerts = upcomingRenewals.filter(sub => {
    if (!sub.next_due_date) return false;
    const diffTime = new Date(sub.next_due_date) - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  const chartData = {
    labels: categoryBreakdown.map(c => c.category),
    datasets: [
      {
        data: categoryBreakdown.map(c => c.total_spent),
        backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#eab308'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-display-sm text-text-primary mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-text-secondary">Here's your subscription overview for today.</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          {alerts.map(a => {
            const daysLeft = Math.ceil((new Date(a.next_due_date) - today) / (1000 * 60 * 60 * 24));
            const isUrgent = daysLeft <= 1;
            return (
              <div key={a.id} className={`flex items-center gap-4 p-4 rounded-xl border ${isUrgent ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                <Calendar className="w-5 h-5 shrink-0" />
                <div className="flex-1 text-sm">
                  <span className={`font-semibold ${isUrgent ? 'text-rose-200' : 'text-amber-300'}`}>{a.service_name}</span> is renewing in {daysLeft === 0 ? 'today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''}`}.
                </div>
                <div className="font-semibold">{formatCurrency(a.recurring_amount, user?.preferred_currency)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-caption font-medium uppercase tracking-wider">Monthly Spend</span>
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="text-display-md text-text-primary font-display">{formatCurrency(stats.estimated_monthly_spend, user?.preferred_currency)}</div>
          <div className="text-micro text-text-muted mt-auto pt-2 border-t border-line">
            Annual Projection: <span className="font-semibold text-text-secondary">{formatCurrency(stats.estimated_annual_spend, user?.preferred_currency)}</span>
          </div>
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-caption font-medium uppercase tracking-wider">Active Subs</span>
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-display-md text-text-primary font-display">{stats.active_subs || 0}</div>
          <div className="flex items-center gap-4 text-micro mt-auto pt-2 border-t border-line">
            <span className="flex items-center gap-1.5 text-text-muted"><PauseCircle className="w-3.5 h-3.5"/> {stats.paused_subs || 0} paused</span>
            <span className="flex items-center gap-1.5 text-text-muted"><TrendingDown className="w-3.5 h-3.5"/> {stats.cancelled_subs || 0} cancelled</span>
          </div>
        </div>

        <div className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-caption font-medium uppercase tracking-wider">Top Category</span>
            <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/30" />
          </div>
          <div className="text-display-sm text-text-primary font-display truncate">
            {categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'N/A'}
          </div>
          <div className="text-micro text-text-muted mt-auto pt-2 border-t border-line">
            Accounting for <span className="text-text-secondary font-medium">{formatCurrency(categoryBreakdown[0]?.total_spent, user?.preferred_currency)}</span> / mo
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Analytics */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="section-label">Spending by Category</h3>
          <div className="card p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
            {categoryBreakdown.length > 0 ? (
              <div className="w-full max-w-[200px]">
                <Doughnut data={chartData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } }, cutout: '75%' }} />
              </div>
            ) : (
              <div className="text-text-muted text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Due This Week (MySQL View) */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="section-label">Due This Week (MySQL View)</h3>
          <div className="card p-2 flex flex-col h-full">
            {dueThisWeek?.length > 0 ? dueThisWeek.map((sub, i) => (
              <div key={sub.id} className={`flex items-center justify-between p-4 ${i !== dueThisWeek.length - 1 ? 'border-b border-line' : ''}`}>
                <div className="flex flex-col">
                  <span className="text-body font-medium text-text-primary">{sub.service_name}</span>
                  <span className="text-micro font-medium text-amber-400 mt-0.5">Due: {new Date(sub.next_due_date).toLocaleDateString()}</span>
                </div>
                <div className="font-semibold text-text-primary">{formatCurrency(sub.recurring_amount, user?.preferred_currency)}</div>
              </div>
            )) : (
              <div className="p-8 text-center text-text-muted text-sm">Clear schedule! No renewals this week.</div>
            )}
          </div>
        </div>
        {/* Upcoming Renewals */}
        <div className="space-y-4">
          <h3 className="section-label">Upcoming Renewals (30 Days)</h3>
          <div className="card p-2 flex flex-col">
            {upcomingRenewals.length > 0 ? upcomingRenewals.map((sub, i) => (
              <div key={sub.id} className={`flex items-center justify-between p-4 ${i !== upcomingRenewals.length - 1 ? 'border-b border-line' : ''}`}>
                <div className="flex flex-col">
                  <span className="text-body font-medium text-text-primary">{sub.service_name}</span>
                  <span className="text-micro text-text-muted mt-0.5">{sub.category} • {new Date(sub.next_due_date).toLocaleDateString()}</span>
                </div>
                <div className="font-semibold text-text-primary">{formatCurrency(sub.recurring_amount, user?.preferred_currency)}</div>
              </div>
            )) : (
              <div className="p-8 text-center text-text-muted text-sm">No upcoming renewals in 30 days.</div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="section-label">Category Breakdown (Stored Procedure)</h3>
          <div className="card p-2 flex flex-col h-full">
            {categoryBreakdown.length > 0 ? categoryBreakdown.map((cat, i) => {
              const categoryTotal = categoryBreakdown.reduce((sum, item) => sum + parseFloat(item.total_spent), 0);
              const percentage = ((cat.total_spent / categoryTotal) * 100).toFixed(0);
              return (
                <div key={cat.category} className={`flex flex-col p-4 gap-3 ${i !== categoryBreakdown.length - 1 ? 'border-b border-line' : ''}`}>
                  <div className="flex justify-between text-body font-medium">
                    <span className="text-text-primary">{cat.category}</span>
                    <span className="text-text-secondary">{formatCurrency(cat.total_spent, user?.preferred_currency)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-text-muted text-sm">No category data.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
