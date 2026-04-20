import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { completeProfileSetup } from '../services/api';
import LoginBackground from '../components/LoginBackground';
import { User } from 'lucide-react';

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    monthly_budget: '',
    preferred_currency: 'INR'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.name && !formData.full_name) {
      setFormData(prev => ({ ...prev, full_name: user.name }));
    }
  }, [user, formData.full_name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!formData.full_name || !formData.phone || !formData.monthly_budget) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }
    
    if (isNaN(Number(formData.monthly_budget))) {
      setError('Monthly budget must be a valid number');
      setLoading(false);
      return;
    }

    try {
      await completeProfileSetup({
        ...formData,
        monthly_budget: Number(formData.monthly_budget)
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete profile setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      <LoginBackground />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20 shadow-glow shadow-orange-500/20">
            <User className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-display-sm text-text-primary text-center">
            Complete your profile
          </h1>
          <p className="text-caption text-text-secondary mt-2 text-center">
            We need a few details before you start tracking subscriptions.
          </p>
        </div>

        <div className="card p-6 md:p-8 relative bg-surface-1/50 backdrop-blur-3xl border-line">
          {error && (
            <div className="mb-6 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-caption text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-caption text-center">
              Profile updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Full Name <span className="text-rose-500">*</span></label>
              <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" placeholder="John Doe" />
            </div>
            
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Phone Number <span className="text-rose-500">*</span></label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" placeholder="+91 9876543210" />
            </div>
            
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Monthly Budget <span className="text-rose-500">*</span></label>
              <input required type="number" step="0.01" min="0" value={formData.monthly_budget} onChange={e => setFormData({...formData, monthly_budget: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" placeholder="5000" />
            </div>
            
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Preferred Currency</label>
              <select value={formData.preferred_currency} onChange={e => setFormData({...formData, preferred_currency: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            
            <div className="pt-4 flex flex-col gap-4">
              <button disabled={loading || success} type="submit" className="btn-primary w-full disabled:opacity-50">
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
