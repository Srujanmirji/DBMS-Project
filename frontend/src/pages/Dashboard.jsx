import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { 
  CreditCard, Calendar, Activity, PauseCircle, TrendingDown, 
  Sparkles, ArrowRight, UserCircle, CheckCircle, AlertTriangle, Info, Clock, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const formatValue = (val, isCurrency = false) => {
  if (val === null || val === undefined || isNaN(val)) return isCurrency ? 0 : 0;
  return Number(val);
};

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
    return (
      <div className="animate-pulse flex flex-col space-y-8 p-4">
        <div className="flex-1 space-y-6 py-1">
          <div className="h-8 bg-surface-2 rounded-lg w-1/4"></div>
          <div className="h-32 bg-surface-2 rounded-2xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-surface-2 rounded-2xl"></div>
            <div className="h-40 bg-surface-2 rounded-2xl"></div>
            <div className="h-40 bg-surface-2 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const { stats, categoryBreakdown, upcomingRenewals, dueThisWeek, trendData, whoOwesMe, budgetAlerts } = data;

  const today = new Date();
  const getDaysLeft = (dateString) => {
    if (!dateString) return Infinity;
    const diffTime = new Date(dateString) - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const currentSpend = formatValue(stats?.estimated_monthly_spend, true);
  const activeSubs = formatValue(stats?.active_subs);
  const potentialSavings = activeSubs > 0 ? (currentSpend * 0.1) : 0;

  const topCategory = categoryBreakdown?.length > 0 ? categoryBreakdown[0] : null;

  // Chart configurations
  const chartData = {
    labels: categoryBreakdown?.map(c => c.category) || [],
    datasets: [
      {
        data: categoryBreakdown?.map(c => c.total_spent) || [],
        backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#eab308'],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };

  const lineChartData = {
    labels: trendData?.length > 0 ? trendData.map(t => t.month_label) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Spend',
        data: trendData?.length > 0 ? trendData.map(t => t.total_spent) : [0, 0, 0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      }
    ]
  };

  const emptyChartOptions = {
    maintainAspectRatio: false, 
    plugins: { legend: { display: false }, tooltip: { enabled: false } }, 
    scales: { y: { display: false }, x: { display: false } },
    elements: { line: { borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'transparent' }, point: { radius: 0 } }
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#FAFAFA',
        bodyColor: '#A3A3A3',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#64748B' } },
      x: { grid: { display: false }, border: { display: false }, ticks: { color: '#64748B' } }
    },
    interaction: { intersect: false, mode: 'index' }
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#9ca3af', padding: 20, usePointStyle: true, pointStyle: 'circle' } },
      tooltip: { backgroundColor: '#171717', borderColor: '#334155', borderWidth: 1, padding: 12, cornerRadius: 8 }
    },
    cutout: '75%',
    layout: { padding: 10 }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* Header & Insight Card */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-display-sm text-text-primary mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-text-secondary text-body">Here's your subscription overview for today.</p>
        </div>

        {/* MOST IMPORTANT: Insight Card */}
        <div className="card glass p-8 relative overflow-hidden group shadow-[0_0_40px_rgba(249,115,22,0.1)] border-accent/20 hover:shadow-[0_0_60px_rgba(249,115,22,0.2)] hover:border-accent/40 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-rose-500/5 to-transparent opacity-60 mix-blend-screen pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="text-accent uppercase tracking-[0.2em] text-xs font-bold mb-3 flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="w-4 h-4"/> Insight
              </div>
              <h2 className="text-3xl md:text-4xl text-white font-display mb-2 drop-shadow-sm">
                You are spending <span className="text-accent">{formatCurrency(currentSpend, user?.preferred_currency)}</span><span className="text-xl md:text-2xl text-text-muted font-sans font-normal">/mo</span>
              </h2>
              {activeSubs > 0 ? (
                 <p className="text-text-secondary text-base">
                  Potential savings: <span className="text-emerald-400 font-semibold">{formatCurrency(potentialSavings, user?.preferred_currency)}</span> from unused subscriptions.
                 </p>
              ) : (
                <p className="text-text-secondary text-base">You haven't added any subscriptions yet.</p>
              )}
            </div>
            
            <Link to="/app/subscriptions" className="btn-primary space-x-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-105 transition-transform duration-300">
              <span>{activeSubs > 0 ? 'Optimize Spend' : 'Start Tracking'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Health Insights (Budget Alerts) */}
      {budgetAlerts?.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="section-label mb-2">Health Insights</h3>
          {budgetAlerts.map((msg, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface-2/80 backdrop-blur-sm border border-line hover:border-accent/30 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1 text-sm font-medium text-text-primary">{msg}</div>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Spend */}
        <div className="card p-6 flex flex-col gap-4 bg-surface-2/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-caption font-semibold uppercase tracking-wider group-hover:text-accent transition-colors">Monthly Spend</span>
            <div className="p-2 rounded-lg bg-surface-3 group-hover:bg-accent/10 transition-colors">
               <CreditCard className="w-5 h-5 group-hover:text-accent transition-colors" />
            </div>
          </div>
          <div className="text-4xl text-text-primary font-display tracking-tight">{formatCurrency(currentSpend, user?.preferred_currency)}</div>
          <div className="text-sm text-text-muted mt-auto pt-4 border-t border-line/50 flex justify-between items-center">
            <span>Annual Proj.</span>
            <span className="font-semibold text-text-secondary">{formatCurrency(formatValue(stats?.estimated_annual_spend, true), user?.preferred_currency)}</span>
          </div>
        </div>

        {/* Active Subs */}
        <div className="card p-6 flex flex-col gap-4 bg-surface-2/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-caption font-semibold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Active Subs</span>
            <div className="p-2 rounded-lg bg-surface-3 group-hover:bg-emerald-400/10 transition-colors">
               <Activity className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-4xl text-text-primary font-display tracking-tight">{activeSubs}</div>
          <div className="flex items-center gap-4 text-sm mt-auto pt-4 border-t border-line/50">
            <span className="flex items-center gap-1.5 text-text-muted"><PauseCircle className="w-4 h-4 text-amber-500/70"/> {formatValue(stats?.paused_subs)} paused</span>
            <span className="flex items-center gap-1.5 text-text-muted"><TrendingDown className="w-4 h-4 text-rose-500/70"/> {formatValue(stats?.cancelled_subs)} cancelled</span>
          </div>
        </div>

        {/* Top Category */}
        <div className="card p-6 flex flex-col gap-4 bg-surface-2/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-caption font-semibold uppercase tracking-wider group-hover:text-blue-400 transition-colors">Top Category</span>
            <div className="p-2 rounded-lg bg-surface-3 group-hover:bg-blue-400/10 transition-colors">
               <Tag className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
          <div className="text-3xl text-text-primary font-display truncate tracking-tight">
            {topCategory ? topCategory.category : 'N/A'}
          </div>
          <div className="text-sm text-text-muted mt-auto pt-4 border-t border-line/50 flex justify-between items-center">
            <span>Accounting for</span>
            <span className="text-text-secondary font-semibold">{topCategory ? formatCurrency(formatValue(topCategory.total_spent, true), user?.preferred_currency) : '₹0'} / mo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Analytics */}
        <div className="space-y-4 lg:col-span-2 flex flex-col sm:flex-row gap-6 h-full">
          {/* 6-Month Trend */}
          <div className="card p-6 flex flex-col flex-1 min-h-[340px] bg-surface-2/60 backdrop-blur-md hover:border-line-hover transition-colors">
            <h3 className="section-label">6-Month Trend</h3>
            {trendData && trendData.length > 0 ? (
              <div className="w-full relative flex-1 min-h-[220px] mt-4">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-text-muted my-auto opacity-50">
                <div className="w-full h-32 relative mix-blend-screen opacity-30">
                   <Line data={lineChartData} options={emptyChartOptions} />
                </div>
                <div className="absolute text-sm flex flex-col items-center gap-2">
                  <Info className="w-5 h-5"/>
                  <span>No payment history yet</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Spending by Category */}
          <div className="card p-6 flex flex-col flex-1 min-h-[340px] bg-surface-2/60 backdrop-blur-md hover:border-line-hover transition-colors">
            <h3 className="section-label">Spending by Category</h3>
            {categoryBreakdown?.length > 0 ? (
              <div className="w-full flex-1 relative flex items-center justify-center mt-2">
                <div className="h-[220px] w-full">
                   <Doughnut data={chartData} options={doughnutOptions} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-line/50 flex items-center justify-center">
                  <Tag className="w-8 h-8 opacity-20"/>
                </div>
                <span className="text-sm">No data yet</span>
              </div>
            )}
          </div>
        </div>

         {/* Upcoming Renewals (Integrated Due This Week logic) */}
         <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="section-label !mb-0">Upcoming Renewals</h3>
            <span className="text-xs text-text-muted bg-surface-3 px-2 py-1 rounded-md">Next 30 days</span>
          </div>
          <div className="card flex flex-col overflow-hidden bg-surface-2/60 backdrop-blur-md">
            {upcomingRenewals?.length > 0 ? (
              <div className="divide-y divide-line/50">
                {upcomingRenewals.slice(0, 5).map((sub) => {
                  const daysLeft = getDaysLeft(sub.next_due_date);
                  let statusColor = "text-text-muted";
                  let bgIndicator = "bg-transparent";
                  
                  if (daysLeft <= 0) { statusColor = "text-rose-400"; bgIndicator = "bg-rose-500"; }
                  else if (daysLeft <= 3) { statusColor = "text-rose-400"; bgIndicator = "bg-rose-500"; }
                  else if (daysLeft <= 7) { statusColor = "text-amber-400"; bgIndicator = "bg-amber-400"; }
                  
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-surface-3/50 transition-colors group relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${bgIndicator} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-text-secondary font-display font-medium shadow-inner">
                          {sub.service_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-body font-medium text-text-primary">{sub.service_name}</span>
                          <span className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${statusColor}`}>
                            <Clock className="w-3 h-3"/>
                            {daysLeft === 0 ? 'Today' : daysLeft < 0 ? 'Overdue' : `In ${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <div className="font-semibold text-text-primary">{formatCurrency(sub.recurring_amount, user?.preferred_currency)}</div>
                         <div className="text-[10px] text-text-muted">{new Date(sub.next_due_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500/50" />
                </div>
                <div>
                  <p className="text-text-primary font-medium">Clear schedule!</p>
                  <p className="text-sm text-text-muted mt-1">No upcoming renewals in 30 days.</p>
                </div>
                <Link to="/app/subscriptions" className="btn-ghost py-2 px-4 shadow-sm text-xs mt-2">
                  👉 Track New Subscription
                </Link>
              </div>
            )}
          </div>
        </div>
        
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phase 3: Who Owes Me (Shared Subs) */}
        <div className="space-y-4">
          <h3 className="section-label">Who Owes You (Shared Subs)</h3>
          <div className="card flex flex-col h-full bg-surface-2/60 backdrop-blur-md overflow-hidden">
            {whoOwesMe?.length > 0 ? (
              <div className="divide-y divide-line/50">
                {whoOwesMe.map((debt) => (
                  <div key={debt.share_id} className="flex items-center p-4 hover:bg-emerald-950/20 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mr-4">
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-body font-semibold text-text-primary">{debt.debtor_name || debt.debtor_email}</span>
                      <span className="text-xs text-text-muted mt-0.5">for {debt.service_name} ({debt.split_percentage}%)</span>
                    </div>
                    <div className="font-bold text-emerald-400 text-lg bg-emerald-500/10 px-3 py-1 rounded-lg">
                      +{formatCurrency(debt.amount_owed, user?.preferred_currency)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-3 h-full">
                 <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-text-muted/50" />
                </div>
                <p className="text-sm text-text-muted">Nobody owes you money right now!</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Detail */}
        <div className="space-y-4">
          <h3 className="section-label">Category Breakdown</h3>
          <div className="card p-2 flex flex-col h-full bg-surface-2/60 backdrop-blur-md overflow-hidden">
            {categoryBreakdown?.length > 0 ? (
               <div className="flex flex-col divide-y divide-line/30">
                {categoryBreakdown.map((cat) => {
                  const categoryTotal = categoryBreakdown.reduce((sum, item) => sum + parseFloat(item.total_spent), 0);
                  const percentage = ((cat.total_spent / categoryTotal) * 100).toFixed(0);
                  return (
                    <div key={cat.category} className="flex flex-col p-4 gap-3 hover:bg-surface-3/30 transition-colors rounded-lg group">
                      <div className="flex justify-between items-center text-body font-medium">
                        <span className="text-text-primary flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-accent"></span>
                           {cat.category}
                        </span>
                        <div className="flex items-center gap-3">
                           <span className="text-xs text-text-muted">{percentage}%</span>
                           <span className="text-text-secondary font-semibold">{formatCurrency(cat.total_spent, user?.preferred_currency)}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full bg-accent/80 group-hover:bg-accent rounded-full transition-all duration-500 delay-100" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
               </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-3 h-full">
                <Tag className="w-8 h-8 text-text-muted/50" />
                <p className="text-sm text-text-muted">No category data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
