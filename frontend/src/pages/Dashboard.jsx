import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { CreditCard, Calendar, Activity, PauseCircle, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: { active_subs: 0, paused_subs: 0, cancelled_subs: 0, estimated_monthly_spend: 0, estimated_annual_spend: 0 },
    categoryBreakdown: [],
    upcomingRenewals: [],
    dueThisWeek: [],
    trendData: [],
    whoOwesMe: [],
    budgetAlerts: []
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

  const { stats, categoryBreakdown, upcomingRenewals, dueThisWeek, trendData, whoOwesMe, budgetAlerts } = data;

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

  const lineChartData = {
    labels: trendData?.length > 0 ? trendData.map(t => t.month_label) : ['No Data'],
    datasets: [
      {
        label: 'Monthly Paid',
        data: trendData?.length > 0 ? trendData.map(t => t.total_spent) : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
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

      {/* MySQL Budget Alerts */}
      {budgetAlerts?.length > 0 && (
        <div className="flex flex-col gap-3">
          {budgetAlerts.map((msg, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Activity className="w-5 h-5 shrink-0" />
              <div className="flex-1 text-sm font-medium">{msg}</div>
            </div>
          ))}
        </div>
      )}

      {/* Expiry Alerts */}
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
        <div className="space-y-4 lg:col-span-2 flex flex-col sm:flex-row gap-4 h-full">
          <div className="card p-6 flex flex-col items-center justify-center flex-1 min-h-[300px]">
            <h3 className="section-label w-full text-center mb-4">6-Month Trend</h3>
            {trendData && trendData.length > 0 ? (
              <div className="w-full relative min-h-[220px]">
                <Line data={lineChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#334155' } }, x: { grid: { display: false } } } }} />
              </div>
            ) : (
              <div className="text-text-muted text-sm my-auto">No payment history yet.</div>
            )}
          </div>
          <div className="card p-6 flex flex-col items-center justify-center flex-1 min-h-[300px]">
            <h3 className="section-label w-full text-center mb-4">Spending by Category</h3>
            {categoryBreakdown.length > 0 ? (
              <div className="w-full max-w-[200px] mx-auto">
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

        {/* Phase 3: Who Owes Me (Native SQL Join) */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="section-label text-emerald-400">Who Owes You (Shared Subs)</h3>
          <div className="card p-2 flex flex-col h-full bg-emerald-950/10 border-emerald-500/20">
            {whoOwesMe?.length > 0 ? whoOwesMe.map((debt, i) => (
              <div key={debt.share_id} className={`flex items-center justify-between p-4 ${i !== whoOwesMe.length - 1 ? 'border-b border-line' : ''}`}>
                <div className="flex flex-col">
                  <span className="text-body font-medium text-emerald-300">{debt.debtor_name || debt.debtor_email}</span>
                  <span className="text-micro text-text-muted mt-0.5">for {debt.service_name} ({debt.split_percentage}%)</span>
                </div>
                <div className="font-semibold text-emerald-400">+{formatCurrency(debt.amount_owed, user?.preferred_currency)}</div>
              </div>
            )) : (
              <div className="p-8 text-center text-text-muted text-sm">Nobody owes you money!</div>
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
