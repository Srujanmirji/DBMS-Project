import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserProfile, getProfileSetup } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getUserProfile();
          setUser(res.data);
          
          // if we are landing on a root or auth page, redirect based on profile completion
          if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
            const profileRes = await getProfileSetup();
            if (profileRes.data.profile_completed) {
              navigate('/app/dashboard');
            } else {
              navigate('/setup-profile');
            }
          }
        } catch (error) {
          console.error('Session expired or invalid', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    
    try {
      const profileRes = await getProfileSetup();
      if (profileRes.data.profile_completed) {
        navigate('/app/dashboard');
      } else {
        navigate('/setup-profile');
      }
    } catch (err) {
      console.error('Failed to get profile setup status', err);
      navigate('/setup-profile');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
