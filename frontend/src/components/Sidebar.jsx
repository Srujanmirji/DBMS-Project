import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, Activity, Bell, Shield, User, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
    { label: 'Subscriptions', icon: Receipt, path: '/app/subscriptions' },
    { label: 'Payments', icon: Wallet, path: '/app/payments' },
    { label: 'Activity', icon: Activity, path: '/app/activity' },
    { label: 'Alerts', icon: Bell, path: '/app/notifications' },
    { label: 'Profile', icon: User, path: '/app/profile' },
  ];

  const adminEmails = ['srujanmirji10@gmail.com', 'srujanmirji20@gmail.com'];
  if (user?.email && adminEmails.includes(user.email.toLowerCase())) {
    navItems.splice(navItems.length - 1, 0, { label: 'Admin', icon: Shield, path: '/app/admin' });
  }

  return (
    <aside className="w-64 h-screen bg-surface-1 border-r border-line flex flex-col fixed left-0 top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-line mb-6">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="SubTracker Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-display font-bold text-text-primary tracking-tight">SubTracker</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-caption font-medium transition-colors ${
                isActive 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer (User + Logout) */}
      <div className="p-4 border-t border-line">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-text-primary font-semibold text-micro shrink-0 overflow-hidden">
            {user?.profile_picture || user?.avatar_url ? (
              <img src={user.profile_picture || user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-caption font-medium text-text-primary truncate">{user?.name || user?.full_name || 'User'}</div>
            <div className="text-micro text-text-muted truncate">{user?.email}</div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-caption font-medium text-rose-400 hover:bg-rose-400/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
