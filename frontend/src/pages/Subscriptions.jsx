import React, { useState, useEffect } from 'react';
import { getSubscriptions, addSubscription, updateSubscription, updateSubscriptionStatus, deleteSubscription, shareSubscription, logSubscriptionUsage } from '../services/api';
import { Plus, Edit2, Play, Pause, Trash2, X, Share2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

export default function Subscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharingSubId, setSharingSubId] = useState(null);
  const [shareData, setShareData] = useState({ shared_with_email: '', split_percentage: 50 });

  const [formData, setFormData] = useState({
    service_name: '', category: 'Entertainment', recurring_amount: '',
    billing_cycle: 'monthly', start_date: new Date().toISOString().split('T')[0],
    next_due_date: new Date().toISOString().split('T')[0],
    is_trial: false, trial_end_date: ''
  });

  const fetchSubs = () => {
    setLoading(true);
    getSubscriptions().then(res => {
      // Sort natively by highest recurring_amount per intermediate requirements
      const sortedSubs = res.data.sort((a, b) => parseFloat(b.recurring_amount) - parseFloat(a.recurring_amount));
      setSubs(sortedSubs);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleOpenModal = (sub = null) => {
    if (sub) {
      setEditingSub(sub);
      setFormData({
        service_name: sub.service_name,
        category: sub.category || 'Entertainment',
        recurring_amount: sub.recurring_amount,
        billing_cycle: sub.billing_cycle,
        start_date: sub.start_date ? sub.start_date.split('T')[0] : '',
        next_due_date: sub.next_due_date ? sub.next_due_date.split('T')[0] : '',
        is_trial: sub.is_trial ? true : false,
        trial_end_date: sub.trial_end_date ? sub.trial_end_date.split('T')[0] : ''
      });
    } else {
      setEditingSub(null);
      setFormData({
        service_name: '', category: 'Entertainment', recurring_amount: '',
        billing_cycle: 'monthly', start_date: new Date().toISOString().split('T')[0],
        next_due_date: new Date().toISOString().split('T')[0],
        is_trial: false, trial_end_date: ''
      });
    }
    setModalOpen(true);
  };

  const handleOpenShare = (subId) => {
    setSharingSubId(subId);
    setShareData({ shared_with_email: '', split_percentage: 50 });
    setShareModalOpen(true);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    try {
      await shareSubscription(sharingSubId, shareData);
      alert('Linked to Shared User successfully!');
      setShareModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Error sharing subscription');
    }
  };

  const handleLogUsage = async (id) => {
    try {
      await logSubscriptionUsage(id);
      fetchSubs(); // Refresh true cost
    } catch (err) {
      alert('Error tracking usage');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSub) {
        await updateSubscription(editingSub.id, formData);
      } else {
        await addSubscription(formData);
      }
      setModalOpen(false);
      fetchSubs();
    } catch (err) {
      alert('Error saving subscription');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateSubscriptionStatus(id, newStatus);
      fetchSubs();
    } catch (err) { alert('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscription?')) return;
    try {
      await deleteSubscription(id);
      fetchSubs();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="space-y-6 animate-fade-in relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm text-text-primary mb-2">Subscriptions</h1>
          <p className="text-text-secondary">Manage and track your active, paused, and cancelled plans.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {loading ? (
        <div className="w-full h-32 bg-surface-2 rounded-xl animate-pulse" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2/50 text-text-muted font-medium border-b border-line">
              <tr>
                <th className="p-4">Platform</th>
                <th className="p-4">Category</th>
                <th className="p-4 flex flex-col">
                  <span>Cost</span>
                  <span className="text-[10px] text-accent uppercase tracking-wider">True Value</span>
                </th>
                <th className="p-4">Billing</th>
                <th className="p-4">Next Due</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-text-primary">
              {subs.length > 0 ? subs.map(sub => (
                <tr key={sub.id} className="hover:bg-surface-2/20 transition-colors">
                  <td className="p-4 font-medium">{sub.service_name}</td>
                  <td className="p-4 text-text-secondary">{sub.category || '-'}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">{formatCurrency(sub.recurring_amount, user?.preferred_currency)}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-micro text-accent font-medium">{formatCurrency(sub.true_value, user?.preferred_currency)}</span>
                        <button onClick={() => handleLogUsage(sub.id)} className="bg-accent/10 hover:bg-accent/20 text-accent transition-colors px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold" title="Log usage instance">Log Use</button>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{sub.billing_cycle}</td>
                  <td className="p-4 text-text-secondary">{sub.next_due_date ? new Date(sub.next_due_date).toLocaleDateString() : '-'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      sub.status === 'active' ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 
                      sub.status === 'paused' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                      'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenShare(sub.id)} className="p-1.5 text-text-muted hover:text-emerald-400 transition-colors bg-surface-2 hover:bg-surface-3 rounded-md" title="Share & Split Cost">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggleStatus(sub.id, sub.status)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors bg-surface-2 hover:bg-surface-3 rounded-md" title={sub.status === 'active' ? 'Pause' : 'Resume'}>
                      {sub.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleOpenModal(sub)} className="p-1.5 text-text-muted hover:text-accent transition-colors bg-surface-2 hover:bg-surface-3 rounded-md">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-text-muted hover:text-rose-400 transition-colors bg-surface-2 hover:bg-surface-3 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-text-muted">No subscriptions found. Click "Add New" to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-1 border border-line rounded-2xl w-full max-w-md shadow-card-hover overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h2 className="text-body-lg font-semibold text-text-primary">{editingSub ? 'Edit Subscription' : 'Add Subscription'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-caption text-text-secondary mb-1">Platform Name</label>
                <input required type="text" value={formData.service_name} onChange={e => setFormData({...formData, service_name: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent" placeholder="e.g. Netflix" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption text-text-secondary mb-1">Cost</label>
                  <input required type="number" step="0.01" value={formData.recurring_amount} onChange={e => setFormData({...formData, recurring_amount: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent" placeholder="15.99" />
                </div>
                <div>
                  <label className="block text-caption text-text-secondary mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent">
                    <option>Entertainment</option>
                    <option>Productivity</option>
                    <option>Fitness</option>
                    <option>Utility</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption text-text-secondary mb-1">Billing Cycle</label>
                  <select value={formData.billing_cycle} onChange={e => setFormData({...formData, billing_cycle: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-caption text-text-secondary mb-1">Next Due Date</label>
                  <input required type="date" value={formData.next_due_date} onChange={e => setFormData({...formData, next_due_date: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent" />
                </div>
              </div>

              <div className="pt-2 border-t border-line">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-line bg-surface-2 cursor-pointer hover:border-line-hover transition-colors mb-4">
                  <input type="checkbox" checked={formData.is_trial} onChange={e => setFormData({...formData, is_trial: e.target.checked})} className="accent-accent w-4 h-4" />
                  <span className="text-sm text-text-primary">Enable Free Trial Tracking</span>
                </label>
                
                {formData.is_trial && (
                  <div className="mb-4 animate-fade-in">
                    <label className="block text-caption text-text-secondary mb-1">Trial Expiry Date</label>
                    <input type="date" required={formData.is_trial} value={formData.trial_end_date} onChange={e => setFormData({...formData, trial_end_date: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent" />
                  </div>
                )}
              </div>

              <div className="pt-4 mt-2 border-t border-line flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost !text-text-primary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share / Split Subscription Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-1 rounded-2xl w-full max-w-md border border-line shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-display-xs text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Split Cost
              </h2>
              <button onClick={() => setShareModalOpen(false)} className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-surface-2 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="block text-caption text-text-secondary mb-1">Friend's Email address</label>
                <input required type="email" placeholder="friend@example.com" value={shareData.shared_with_email} onChange={e => setShareData({...shareData, shared_with_email: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-caption text-text-secondary mb-1">Split Percentage (%)</label>
                <input required type="number" min="1" max="100" value={shareData.split_percentage} onChange={e => setShareData({...shareData, split_percentage: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-emerald-400" />
                <p className="text-micro text-emerald-400/80 mt-1">They will pay {shareData.split_percentage}% of the recurring amount via MySQL mappings.</p>
              </div>

              <div className="pt-4 mt-2 border-t border-line flex justify-end gap-3">
                <button type="button" onClick={() => setShareModalOpen(false)} className="btn-ghost !text-text-primary">Cancel</button>
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all text-sm">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
