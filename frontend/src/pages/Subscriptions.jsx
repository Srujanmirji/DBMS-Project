import React, { useState, useEffect } from 'react';
import { getSubscriptions, addSubscription, updateSubscription, updateSubscriptionStatus, deleteSubscription } from '../services/api';
import { Plus, Edit2, Play, Pause, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

export default function Subscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const [formData, setFormData] = useState({
    service_name: '', category: 'Entertainment', recurring_amount: '',
    billing_cycle: 'monthly', start_date: new Date().toISOString().split('T')[0],
    next_due_date: new Date().toISOString().split('T')[0]
  });

  const fetchSubs = () => {
    setLoading(true);
    getSubscriptions().then(res => {
      setSubs(res.data);
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
        next_due_date: sub.next_due_date ? sub.next_due_date.split('T')[0] : ''
      });
    } else {
      setEditingSub(null);
      setFormData({
        service_name: '', category: 'Entertainment', recurring_amount: '',
        billing_cycle: 'monthly', start_date: new Date().toISOString().split('T')[0],
        next_due_date: new Date().toISOString().split('T')[0]
      });
    }
    setModalOpen(true);
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
                <th className="p-4">Cost</th>
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
                  <td className="p-4 font-semibold">{formatCurrency(sub.recurring_amount, user?.preferred_currency)}</td>
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

              <div className="pt-4 mt-2 border-t border-line flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost !text-text-primary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
