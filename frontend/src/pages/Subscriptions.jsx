import React, { useState, useEffect } from 'react';
import { getSubscriptions, addSubscription, updateSubscription, updateSubscriptionStatus, deleteSubscription, shareSubscription, logSubscriptionUsage } from '../services/api';
import { Plus, Edit2, Play, Pause, Trash2, X, Share2, Users, Film, Music, Youtube, Package, BookOpen, MessageSquare, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

const PLATFORMS = [
  { id: 'Netflix', name: 'Netflix', icon: Film, color: 'group-hover:text-red-500', active: 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
  { id: 'Spotify', name: 'Spotify', icon: Music, color: 'group-hover:text-green-500', active: 'border-green-500 bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' },
  { id: 'YouTube', name: 'YouTube', icon: Youtube, color: 'group-hover:text-red-500', active: 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
  { id: 'Amazon Prime', name: 'Prime', icon: Package, color: 'group-hover:text-blue-500', active: 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
  { id: 'Notion', name: 'Notion', icon: BookOpen, color: 'group-hover:text-gray-300', active: 'border-gray-300 bg-gray-300/10 text-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.2)]' },
  { id: 'ChatGPT', name: 'ChatGPT', icon: MessageSquare, color: 'group-hover:text-emerald-500', active: 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' }
];

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
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

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
      
      const isKnown = PLATFORMS.some(p => p.id === sub.service_name);
      if (isKnown) {
        setSelectedPlatform(sub.service_name);
        setShowManualInput(false);
      } else {
        setSelectedPlatform('Other');
        setShowManualInput(true);
      }

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
      setSelectedPlatform('');
      setShowManualInput(false);
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
    <>
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
                  <td colSpan="7" className="p-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-text-muted"><Plus className="w-5 h-5" /></div>
                      <p className="text-text-muted">No subscriptions tracked yet.</p>
                      <button onClick={() => handleOpenModal()} className="mt-2 text-accent hover:text-accent-hover text-sm font-semibold tracking-wide uppercase transition-colors">Start Tracking</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Subscription Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-md animate-fade-in custom-scrollbar">
          <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-lg bg-surface-1/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/5 animate-fade-in transition-all">
            {/* Soft Glow Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-48 bg-accent/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center justify-between p-6 pb-4 relative z-10">
              <h2 className="text-2xl font-bold tracking-tight text-white">{editingSub ? 'Edit Subscription' : 'New Subscription'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-2 rounded-full text-text-muted hover:bg-white/10 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6 relative z-10">
              {/* Visual Platform Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Platform</label>
                <div className="grid grid-cols-4 gap-3">
                  {PLATFORMS.map((p) => {
                    const isSelected = selectedPlatform === p.id;
                    return (
                      <button 
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlatform(p.id);
                          setShowManualInput(false);
                          setFormData({...formData, service_name: p.id});
                        }}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 overflow-hidden ${isSelected ? p.active : 'border-white/5 bg-black/40 text-text-muted hover:text-white hover:bg-white/5 hover:border-white/10 hover:-translate-y-0.5'}`}
                      >
                        <p.icon className={`w-6 h-6 mb-2 transition-colors duration-300 ${isSelected ? '' : p.color}`} />
                        <span className="text-[10px] font-semibold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{p.name}</span>
                      </button>
                    )
                  })}
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedPlatform('Other');
                      setShowManualInput(true);
                      if (!PLATFORMS.some(p => p.id === formData.service_name)) {
                        // Keep current if it's already a custom name. Otherwise empty.
                      } else {
                        setFormData({...formData, service_name: ''});
                      }
                    }}
                    className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 ${selectedPlatform === 'Other' ? 'border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'border-white/5 bg-black/40 text-text-muted hover:text-white hover:bg-white/5 hover:border-white/10 hover:-translate-y-0.5'}`}
                  >
                    <MoreHorizontal className={`w-6 h-6 mb-2 transition-colors duration-300 ${selectedPlatform === 'Other' ? '' : 'group-hover:text-accent'}`} />
                    <span className="text-[10px] font-semibold tracking-wide">Other</span>
                  </button>
                </div>
              </div>

              {/* Manual Input (only if Other) */}
              <div className={`transition-all duration-300 ${showManualInput ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden m-0 p-0'}`}>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Custom Platform Name</label>
                <input required={showManualInput} type="text" value={formData.service_name} onChange={e => setFormData({...formData, service_name: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-accent transition-colors shadow-inner" placeholder="e.g. My Gym, Webflow" />
              </div>

              {/* Detailed Inputs */}
              <div className="bg-black/20 p-5 rounded-[1.5rem] border border-white/5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Cost */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Cost</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">$</span>
                      <input required type="number" step="0.01" value={formData.recurring_amount} onChange={e => setFormData({...formData, recurring_amount: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:border-accent transition-colors shadow-inner font-medium" placeholder="0.00" />
                    </div>
                  </div>
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Category</label>
                    <div className="relative">
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full appearance-none bg-black/40 border border-white/5 rounded-xl pr-10 pl-4 py-3 text-white outline-none focus:border-accent transition-colors shadow-inner font-medium">
                        <option className="bg-surface-1">Entertainment</option>
                        <option className="bg-surface-1">Productivity</option>
                        <option className="bg-surface-1">Fitness</option>
                        <option className="bg-surface-1">Utility</option>
                        <option className="bg-surface-1">Cloud Services</option>
                        <option className="bg-surface-1">Health</option>
                        <option className="bg-surface-1">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Cycle */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Cycle</label>
                    <div className="relative">
                      <select value={formData.billing_cycle} onChange={e => setFormData({...formData, billing_cycle: e.target.value})} className="w-full appearance-none bg-black/40 border border-white/5 rounded-xl pr-10 pl-4 py-3 text-white outline-none focus:border-accent transition-colors shadow-inner font-medium">
                        <option value="monthly" className="bg-surface-1">Monthly</option>
                        <option value="yearly" className="bg-surface-1">Yearly</option>
                        <option value="weekly" className="bg-surface-1">Weekly</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                      </div>
                    </div>
                  </div>
                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Next Due Date</label>
                    <input required type="date" value={formData.next_due_date} onChange={e => setFormData({...formData, next_due_date: e.target.value})} className="w-full appearance-none bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors shadow-inner font-medium [color-scheme:dark]" />
                  </div>
                </div>
              </div>

              {/* Free Trial Toggle */}
              <div className="pt-2">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/20 cursor-pointer hover:bg-black/30 transition-colors group">
                  <span className="text-sm font-medium text-white group-hover:text-amber-100 transition-colors">Track Free Trial Expiry</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.is_trial} onChange={e => setFormData({...formData, is_trial: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"></div>
                  </div>
                </label>
                
                <div className={`transition-all duration-300 ${formData.is_trial ? 'opacity-100 max-h-24 mt-3' : 'opacity-0 max-h-0 overflow-hidden m-0'}`}>
                  <input type="date" required={formData.is_trial} value={formData.trial_end_date} onChange={e => setFormData({...formData, trial_end_date: e.target.value})} className="w-full appearance-none bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-2xl px-4 py-3.5 outline-none focus:border-amber-400 transition-colors font-medium [color-scheme:dark]" />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-xl text-sm font-bold text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors">Discard</button>
                <button type="submit" className="flex-[2] py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent to-orange-400 hover:from-accent-hover hover:to-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all active:scale-[0.98]">{editingSub ? 'Update Tracker' : 'Track Subscription'}</button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* Share / Split Subscription Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-1/90 backdrop-blur-xl border border-white/5 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="flex items-start justify-between p-6 pb-2">
              <div className="flex flex-col">
                <div className="p-3 bg-emerald-500/10 w-fit rounded-xl mb-3"><Users className="w-6 h-6 text-emerald-400" /></div>
                <h2 className="text-body-lg font-bold tracking-tight text-white">Split the Bill</h2>
                <p className="text-sm text-text-muted mt-1">Bind this subscription locally to another user account.</p>
              </div>
              <button type="button" onClick={() => setShareModalOpen(false)} className="p-2 rounded-full text-text-muted hover:bg-white/10 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleShareSubmit} className="p-6 pt-2 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Target Email</label>
                <input required type="email" placeholder="friend@example.com" value={shareData.shared_with_email} onChange={e => setShareData({...shareData, shared_with_email: e.target.value})} className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3.5 text-white outline-none focus:border-emerald-400 transition-colors shadow-inner placeholder:text-text-muted/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Their Share (%)</label>
                <div className="relative">
                  <input required type="number" min="1" max="100" value={shareData.split_percentage} onChange={e => setShareData({...shareData, split_percentage: e.target.value})} className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3.5 text-white outline-none focus:border-emerald-400 transition-colors shadow-inner" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">%</span>
                </div>
                <p className="text-xs font-medium text-emerald-400/80 mt-2 bg-emerald-500/5 py-2 px-3 rounded-lg">They will assume {shareData.split_percentage}% of the recurring cost natively.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShareModalOpen(false)} className="px-6 py-3 rounded-full text-sm font-semibold text-text-secondary hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 rounded-full text-sm font-semibold text-emerald-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]">Link Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
