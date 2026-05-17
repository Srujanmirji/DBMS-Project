import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../services/api';
import { 
  Users, DollarSign, Activity, PieChart, 
  TrendingUp, TrendingDown, Shield, BarChart3, Database
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminStats()
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load admin stats');
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Shield className="w-16 h-16 text-rose-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Access Denied</h2>
        <p className="text-text-muted">{error}</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="animate-pulse flex flex-col space-y-8 p-4">
        <div className="h-10 bg-surface-2 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-surface-2 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-surface-2 rounded-2xl"></div>
          <div className="h-80 bg-surface-2 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { kpis, popularServices, categoryDistribution, recentActivity, churnMetrics } = data;

  // Chart Data
  const categoryChartData = {
    labels: categoryDistribution.map(c => c.category || 'Uncategorized'),
    datasets: [{
      data: categoryDistribution.map(c => parseFloat(c.total_value)),
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#64748b'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const servicesChartData = {
    labels: popularServices.map(s => s.service_name),
    datasets: [{
      label: 'Active Subscriptions',
      data: popularServices.map(s => s.count),
      backgroundColor: '#3b82f6',
      borderRadius: 4,
    }]
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-display-sm text-text-primary">Admin Analytics</h1>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg uppercase tracking-wider">Secured</span>
          </div>
          <p className="text-text-secondary">Platform-wide statistics and aggregates across all users.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-2/60 backdrop-blur-md rounded-xl border border-line">
          <Database className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-text-primary">Global View</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-surface-2/60 backdrop-blur-md border-t-2 border-t-blue-500 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-text-muted">Total Users</span>
            <div className="p-2 rounded-lg bg-blue-500/10 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-4xl font-display text-text-primary">{kpis.total_users || 0}</div>
        </div>

        <div className="card p-6 bg-surface-2/60 backdrop-blur-md border-t-2 border-t-emerald-500 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-text-muted">Platform MRR</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-4xl font-display text-text-primary">{formatCurrency(kpis.total_mrr, 'USD')}</div>
          <div className="text-xs text-text-muted mt-2">Monthly Recurring Revenue globally</div>
        </div>

        <div className="card p-6 bg-surface-2/60 backdrop-blur-md border-t-2 border-t-violet-500 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-text-muted">Active Subs</span>
            <div className="p-2 rounded-lg bg-violet-500/10 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div className="text-4xl font-display text-text-primary">{kpis.total_active_subs || 0}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Value Distribution */}
        <div className="card p-6 bg-surface-2/60 backdrop-blur-md flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-text-primary tracking-tight">Revenue by Category</h3>
          </div>
          <div className="flex-1 min-h-[250px] relative flex justify-center">
            {categoryDistribution.length > 0 ? (
              <Doughnut 
                data={categoryChartData} 
                options={{
                  cutout: '75%',
                  plugins: {
                    legend: { position: 'right', labels: { color: '#9ca3af', usePointStyle: true, padding: 20 } },
                    tooltip: { backgroundColor: '#1e1e1e', titleColor: '#fff', bodyColor: '#ccc', borderColor: '#333', borderWidth: 1 }
                  }
                }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">No category data</div>
            )}
          </div>
        </div>

        {/* Popular Services */}
        <div className="card p-6 bg-surface-2/60 backdrop-blur-md flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-text-primary tracking-tight">Top Services (Global)</h3>
          </div>
          <div className="flex-1 min-h-[250px] relative">
             <Bar 
                data={servicesChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                    x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                  }
                }} 
              />
          </div>
        </div>
      </div>

      {/* Bottom Row: Churn & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Churn Metrics */}
        <div className="card p-6 bg-surface-2/60 backdrop-blur-md">
           <h3 className="text-lg font-bold text-text-primary tracking-tight mb-6">Platform Churn</h3>
           <div className="space-y-4">
              <div className="p-4 bg-surface-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                  <div>
                    <div className="text-sm text-text-muted">Active</div>
                    <div className="text-xl font-bold text-text-primary">{churnMetrics.active_count}</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-surface-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-rose-500 rounded-full"></div>
                  <div>
                    <div className="text-sm text-text-muted">Cancelled</div>
                    <div className="text-xl font-bold text-text-primary">{churnMetrics.cancelled_count}</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-surface-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                  <div>
                    <div className="text-sm text-text-muted">Paused</div>
                    <div className="text-xl font-bold text-text-primary">{churnMetrics.paused_count}</div>
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Global Recent Activity */}
        <div className="lg:col-span-2 card overflow-hidden bg-surface-2/60 backdrop-blur-md flex flex-col">
          <div className="p-6 border-b border-line/50">
            <h3 className="text-lg font-bold text-text-primary tracking-tight">Global Audit Log</h3>
            <p className="text-sm text-text-muted mt-1">Live status changes across the entire platform.</p>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            {recentActivity.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-3/30 text-text-muted font-medium">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Action</th>
                    <th className="p-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/30">
                  {recentActivity.map((log, idx) => (
                    <tr key={idx} className="hover:bg-surface-3/20 transition-colors">
                      <td className="p-4 text-text-primary font-medium">{log.user_name}</td>
                      <td className="p-4 text-text-primary">{log.service_name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-muted capitalize">{log.old_status}</span>
                          <span className="text-text-muted">→</span>
                          <span className={`text-xs font-bold capitalize ${log.new_status === 'active' ? 'text-emerald-400' : log.new_status === 'cancelled' ? 'text-rose-400' : 'text-amber-400'}`}>
                            {log.new_status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right text-text-muted text-xs">
                        {new Date(log.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-text-muted">No recent activity across the platform.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
