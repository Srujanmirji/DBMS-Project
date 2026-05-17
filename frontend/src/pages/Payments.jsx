import React, { useState, useEffect } from 'react';
import { getPayments, addPayment, deletePayment, getSubscriptions } from '../services/api';
import { 
  Plus, Trash2, X, DollarSign, TrendingUp, Calendar, 
  Receipt, ArrowUpRight, CreditCard, BarChart3, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total_payments: 0, total_spent: 0, avg_payment: 0, largest_payment: 0, last_payment_date: null
  });
  const [activeSubs, setActiveSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subscription_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0]
  });

  const fetchPayments = (background = false) => {
    if (!background) setLoading(true);
    getPayments()
      .then(res => {
        setPayments(res.data.payments || []);
        setStats(res.data.stats || {});
        if (!background) setLoading(false);
      })
      .catch(() => { if (!background) setLoading(false); });
  };

  const fetchSubs = () => {
    getSubscriptions()
      .then(res => setActiveSubs(res.data.filter(s => s.status === 'active')))
      .catch(() => {});
  };

  useEffect(() => {
    fetchPayments();
    fetchSubs();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      subscription_id: activeSubs.length > 0 ? activeSubs[0].id : '',
      amount: activeSubs.length > 0 ? activeSubs[0].recurring_amount : '',
      payment_date: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const handleSubChange = (subId) => {
    const sub = activeSubs.find(s => s.id === parseInt(subId));
    setFormData({
      ...formData,
      subscription_id: subId,
      amount: sub ? sub.recurring_amount : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPayment(formData);
      setModalOpen(false);
      fetchPayments(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Error recording payment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await deletePayment(id);
      fetchPayments(true);
    } catch (err) {
      alert('Failed to delete payment');
    }
  };

  // Group payments by month for timeline view
  const groupedPayments = payments.reduce((groups, payment) => {
    const date = new Date(payment.payment_date);
    const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(payment);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col space-y-8 p-4">
        <div className="flex-1 space-y-6 py-1">
          <div className="h-8 bg-surface-2 rounded-lg w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-2 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-surface-2 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm text-text-primary mb-2">Payments</h1>
            <p className="text-text-secondary">Track and manage your subscription payment history.</p>
          </div>
          <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Spent */}
          <div className="card p-6 flex flex-col gap-4 bg-surface-2/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-caption font-semibold uppercase tracking-wider group-hover:text-accent transition-colors">Total Spent</span>
              <div className="p-2 rounded-lg bg-surface-3 group-hover:bg-accent/10 transition-colors">
                <DollarSign className="w-5 h-5 group-hover:text-accent transition-colors" />
              </div>
            </div>
            <div className="text-3xl text-text-primary font-display tracking-tight">
              {formatCurrency(stats.total_spent, user?.preferred_currency)}
            </div>
            <div className="text-sm text-text-muted mt-auto pt-3 border-t border-line/50">
              Across {stats.total_payments} payment{stats.total_payments !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Average Payment */}
          <div className="card p-6 flex flex-col gap-4 bg-surface-2/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-caption font-semibold uppercase tracking-wider group-hover:text-blue-400 transition-colors">Avg. Payment</span>
              <div className="p-2 rounded-lg bg-surface-3 group-hover:bg-blue-400/10 transition-colors">
                <BarChart3 className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
            <div className="text-3xl text-text-primary font-display tracking-tight">
              {formatCurrency(stats.avg_payment, user?.preferred_currency)}
            </div>
            <div className="text-sm text-text-muted mt-auto pt-3 border-t border-line/50">
              Per transaction
            </div>
          </div>

          {/* Largest Payment */}
          <div className="card p-6 flex flex-col gap-4 bg-surface-2/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 group">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-caption font-semibold uppercase tracking-wider group-hover:text-rose-400 transition-colors">Largest</span>
              <div className="p-2 rounded-lg bg-surface-3 group-hover:bg-rose-400/10 transition-colors">
                <ArrowUpRight className="w-5 h-5 group-hover:text-rose-400 transition-colors" />
              </div>
            </div>
            <div className="text-3xl text-text-primary font-display tracking-tight">
              {formatCurrency(stats.largest_payment, user?.preferred_currency)}
            </div>
            <div className="text-sm text-text-muted mt-auto pt-3 border-t border-line/50">
              Single payment
            </div>
          </div>

          {/* Last Payment */}
          <div className="card p-6 flex flex-col gap-4 bg-surface-2/60 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-caption font-semibold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Last Payment</span>
              <div className="p-2 rounded-lg bg-surface-3 group-hover:bg-emerald-400/10 transition-colors">
                <Clock className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
              </div>
            </div>
            <div className="text-2xl text-text-primary font-display tracking-tight">
              {stats.last_payment_date 
                ? new Date(stats.last_payment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'No payments'
              }
            </div>
            <div className="text-sm text-text-muted mt-auto pt-3 border-t border-line/50">
              Most recent
            </div>
          </div>
        </div>

        {/* Payment History Timeline */}
        <div className="space-y-4">
          <h3 className="section-label">Payment History</h3>
          
          {Object.keys(groupedPayments).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedPayments).map(([month, monthPayments]) => (
                <div key={month}>
                  {/* Month Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                      <span className="text-xs font-bold text-accent uppercase tracking-wider">{month}</span>
                    </div>
                    <div className="h-[1px] bg-line/50 flex-1"></div>
                    <span className="text-xs text-text-muted font-medium">
                      {formatCurrency(monthPayments.reduce((s, p) => s + parseFloat(p.amount), 0), user?.preferred_currency)}
                    </span>
                  </div>

                  {/* Payment Cards */}
                  <div className="card overflow-hidden bg-surface-2/60 backdrop-blur-md">
                    <div className="divide-y divide-line/30">
                      {monthPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-surface-3/30 transition-colors group">
                          <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                              <Receipt className="w-5 h-5" />
                            </div>
                            {/* Info */}
                            <div className="flex flex-col">
                              <span className="text-body font-medium text-text-primary">{payment.service_name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-text-muted">{payment.category || 'Uncategorized'}</span>
                                <span className="text-text-muted">·</span>
                                <span className="text-xs text-text-muted capitalize">{payment.billing_cycle}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {/* Date */}
                            <div className="text-right hidden sm:block">
                              <div className="text-xs text-text-muted">
                                {new Date(payment.payment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            {/* Amount */}
                            <div className="font-semibold text-text-primary min-w-[90px] text-right">
                              {formatCurrency(payment.amount, user?.preferred_currency)}
                            </div>
                            {/* Status Badge */}
                            <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                              {payment.status}
                            </span>
                            {/* Delete */}
                            <button 
                              onClick={() => handleDelete(payment.id)} 
                              className="p-1.5 text-text-muted hover:text-rose-400 transition-colors bg-surface-2 hover:bg-surface-3 rounded-md opacity-0 group-hover:opacity-100"
                              title="Delete payment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-16 flex flex-col items-center justify-center text-center gap-4 bg-surface-2/60 backdrop-blur-md">
              <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-text-muted/50" />
              </div>
              <div>
                <p className="text-text-primary font-medium text-lg">No payments recorded yet</p>
                <p className="text-sm text-text-muted mt-1">Start recording payments to see your spending history and trends.</p>
              </div>
              <button onClick={handleOpenModal} className="btn-primary mt-2 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Record Your First Payment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-md animate-fade-in custom-scrollbar">
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-md bg-surface-1/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/5 animate-fade-in transition-all">
              {/* Soft Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-48 bg-emerald-500/15 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="flex items-center justify-between p-6 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Record Payment</h2>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="p-2 rounded-full text-text-muted hover:bg-white/10 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5 relative z-10">
                {/* Subscription Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Subscription</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.subscription_id}
                      onChange={(e) => handleSubChange(e.target.value)}
                      className="w-full appearance-none bg-black/40 border border-white/5 rounded-xl pr-10 pl-4 py-3.5 text-white outline-none focus:border-emerald-400 transition-colors shadow-inner font-medium"
                    >
                      <option value="" className="bg-surface-1">Select a subscription...</option>
                      {activeSubs.map(sub => (
                        <option key={sub.id} value={sub.id} className="bg-surface-1">
                          {sub.service_name} — {formatCurrency(sub.recurring_amount, user?.preferred_currency)}/{sub.billing_cycle}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="bg-black/20 p-5 rounded-[1.5rem] border border-white/5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">$</span>
                        <input 
                          required 
                          type="number" 
                          step="0.01" 
                          value={formData.amount} 
                          onChange={e => setFormData({...formData, amount: e.target.value})} 
                          className="w-full bg-black/40 border border-white/5 rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:border-emerald-400 transition-colors shadow-inner font-medium" 
                          placeholder="0.00" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Date</label>
                      <input 
                        required 
                        type="date" 
                        value={formData.payment_date} 
                        onChange={e => setFormData({...formData, payment_date: e.target.value})} 
                        className="w-full appearance-none bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400 transition-colors shadow-inner font-medium [color-scheme:dark]" 
                      />
                    </div>
                  </div>
                </div>

                {/* Info hint */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-400/80">Recording a payment will automatically advance the subscription's next due date.</p>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-xl text-sm font-bold text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98]">Record Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
