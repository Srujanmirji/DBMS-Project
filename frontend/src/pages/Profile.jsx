import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, deleteAccount } from '../services/api';
import { User, Lock, Trash2, Camera, Loader2, CheckCircle2, AlertCircle, Mail, Settings2, IndianRupee } from 'lucide-react';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || user?.name || '',
    phone: user?.phone || '',
    profile_picture: user?.profile_picture || '',
    monthly_budget: user?.monthly_budget || '',
    preferred_currency: user?.preferred_currency || 'INR',
    reminders_enabled: user?.reminders_enabled ?? true
  });
  
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  
  // UI States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Sync state if user context updates late
    if (user) {
      setProfileData({
        full_name: user.full_name || user.name || '',
        phone: user.phone || '',
        profile_picture: user.profile_picture || '',
        monthly_budget: user.monthly_budget || '',
        preferred_currency: user.preferred_currency || 'INR',
        reminders_enabled: user.reminders_enabled ?? true
      });
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setProfileStatus({ type: 'error', message: 'Image size must be less than 5MB' });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData({ ...profileData, profile_picture: reader.result });
      setProfileStatus(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileStatus(null);
    try {
      await updateProfile(profileData);
      setUser({ ...user, ...profileData });
      setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setProfileStatus(null), 3000);
    } catch (err) {
      setProfileStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordStatus(null);
    try {
      await changePassword(passwordData);
      setPasswordData({ currentPassword: '', newPassword: '' });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setTimeout(() => setPasswordStatus(null), 3000);
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.response?.data?.error || 'Failed to update password' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      logout();
    } catch {
      alert('Failed to delete account');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const StatusAlert = ({ status }) => {
    if (!status) return null;
    return (
      <div className={`flex items-center gap-2 p-3 mb-4 rounded-lg text-caption animate-fade-in ${
        status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      }`}>
        {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        {status.message}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl pb-12">
      <div>
        <h1 className="text-display-sm text-text-primary mb-2">Account Settings</h1>
        <p className="text-text-secondary">Manage your profile details and security preferences.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 text-text-primary font-medium text-body pb-4 border-b border-line">
            <User className="w-5 h-5 text-accent" /> Profile Information
          </div>
          
          <StatusAlert status={profileStatus} />

          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <input type="file" accept="image/*" id="avatar-upload" className="hidden" onChange={handleImageUpload} />
              <label htmlFor="avatar-upload" className="block w-20 h-20 rounded-full bg-surface-2 border-2 border-line overflow-hidden flex items-center justify-center cursor-pointer transition-all group-hover:border-accent group-hover:ring-2 ring-accent/20">
                {profileData.profile_picture || user?.avatar_url ? (
                  <img src={profileData.profile_picture || user?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-text-secondary" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </label>
            </div>
            <div className="flex-1 text-sm text-text-secondary">
              <p className="text-text-primary font-medium mb-1">Profile Photo</p>
              Click to upload a new avatar. JPG, GIF, or PNG. Max size 5MB.
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-caption font-medium text-text-secondary mb-1.5"><Mail className="w-3.5 h-3.5"/> Email Address</label>
              <input type="email" value={user?.email || ''} disabled className="w-full bg-surface-2/50 border border-line rounded-lg px-3 py-2 text-text-muted outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Full Name</label>
              <input type="text" required value={profileData.full_name} onChange={e => setProfileData({...profileData, full_name: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Phone Number</label>
              <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-caption font-medium text-text-secondary mb-1.5">Monthly Budget</label>
                <input type="number" step="0.01" min="0" required value={profileData.monthly_budget} onChange={e => setProfileData({...profileData, monthly_budget: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-caption font-medium text-text-secondary mb-1.5">Currency</label>
                <select value={profileData.preferred_currency} onChange={e => setProfileData({...profileData, preferred_currency: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-caption font-medium text-text-secondary mb-1.5"><Settings2 className="w-3.5 h-3.5"/> Preferences</label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-line bg-surface-2 cursor-pointer hover:border-line-hover transition-colors">
                <input type="checkbox" checked={profileData.reminders_enabled} onChange={e => setProfileData({...profileData, reminders_enabled: e.target.checked})} className="accent-accent w-4 h-4" />
                <span className="text-sm text-text-primary">Enable Email Reminders</span>
              </label>
            </div>

            <div className="pt-2">
              <button disabled={isSavingProfile} type="submit" className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          {/* Security Card */}
          <div className="card p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 text-text-primary font-medium text-body pb-4 border-b border-line">
              <Lock className="w-5 h-5 text-accent" /> Security
            </div>

            {user?.provider === 'google' ? (
              <div className="text-sm text-text-secondary">
                Your account is secured via Google Authentication. Password changes are managed externally through Google.
              </div>
            ) : (
              <>
                <StatusAlert status={passwordStatus} />

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-caption font-medium text-text-secondary mb-1.5">Current Password</label>
                    <input required type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-caption font-medium text-text-secondary mb-1.5">New Password</label>
                    <input required type="password" minLength={6} value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" />
                  </div>
                  <div className="pt-2">
                    <button disabled={isSavingPassword} type="submit" className="btn-ghost w-full !text-text-primary hover:!bg-accent/10 border border-line hover:border-accent transition-all flex items-center justify-center gap-2">
                      {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Danger Zone */}
          <div className="card p-6 md:p-8 space-y-6 border-rose-500/20 bg-rose-500/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <div className="flex items-center gap-3 text-rose-400 font-medium text-body pb-4 border-b border-rose-500/20">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </div>
            <p className="text-caption text-text-secondary lg:pr-4">
              Deleting your account is irreversible. All subscription data, history, and preferences will be permanently erased. Please be certain.
            </p>
            <button onClick={() => setShowDeleteModal(true)} className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 animate-fade-in">
          <div className="bg-surface-1 border border-line rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 mx-auto border border-rose-500/20">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-body font-semibold text-text-primary text-center mb-2">Delete your account?</h2>
            <p className="text-caption text-text-secondary text-center mb-6">
              This action cannot be undone. All your subscriptions will be permanently wiped.
            </p>
            <div className="flex space-x-3">
              <button disabled={isDeleting} onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 rounded-lg bg-surface-2 text-text-primary font-medium hover:bg-surface-3 transition-colors border border-line">
                Cancel
              </button>
              <button disabled={isDeleting} onClick={handleDeleteAccount} className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors flex items-center justify-center">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
