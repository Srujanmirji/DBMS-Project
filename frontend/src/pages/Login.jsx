import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { loginUser, registerUser, loginWithGoogle } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoginBackground from '../components/LoginBackground';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const res = await loginUser({ email: formData.email, password: formData.password });
        login(res.data.user, res.data.token);
      } else {
        const res = await registerUser(formData);
        login(res.data.user, res.data.token);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Connection failed. Please try again.';
      setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : String(errMsg));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError(null);
        const res = await loginWithGoogle({ access_token: tokenResponse.access_token });
        login(res.data.user, res.data.token);
      } catch (err) {
        const errMsg = err.response?.data?.error || err.message || 'Google Authentication failed.';
        setError(typeof errMsg === 'object' ? JSON.stringify(errMsg) : String(errMsg));
        setLoading(false);
      }
    },
    onError: () => setError('Google Login Failed')
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      <LoginBackground />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20 shadow-glow shadow-orange-500/20">
            <CreditCard className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-display-sm text-text-primary text-center">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-caption text-text-secondary mt-2">
            {isLogin ? 'Enter your details to access your dashboard.' : 'Start tracking your subscriptions today.'}
          </p>
        </div>

        <div className="card p-6 md:p-8 relative bg-surface-1/50 backdrop-blur-3xl border-line">
          {error && (
            <div className="mb-6 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-caption text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-caption font-medium text-text-secondary mb-1.5">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" placeholder="John Doe" />
              </div>
            )}
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Email address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent transition-colors" placeholder="hello@linear.app" />
            </div>
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input required minLength={6} type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-surface-2 border border-line rounded-lg pl-3 pr-10 py-2 text-text-primary outline-none focus:border-accent transition-colors" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="pt-2 flex flex-col gap-4">
              <button disabled={loading} type="submit" className="btn-primary w-full disabled:opacity-50">
                {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Create account'}
              </button>

              <div className="flex items-center gap-4 my-2">
                <div className="h-[1px] bg-line flex-1"></div>
                <span className="text-sm text-text-muted font-medium">Or continue with</span>
                <div className="h-[1px] bg-line flex-1"></div>
              </div>

              <div className="flex justify-center w-full">
                <button 
                  type="button" 
                  onClick={() => googleLogin()} 
                  className="w-full flex items-center justify-center gap-3 bg-surface-2 hover:bg-surface-3 border border-line hover:border-line-hover text-text-primary px-4 py-2.5 rounded-full font-medium transition-all duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-line text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-caption text-text-secondary hover:text-text-primary transition-colors">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
