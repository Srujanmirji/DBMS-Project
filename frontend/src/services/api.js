import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Automatically inject JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser    = (data) => API.post('/auth/login', data);
export const loginWithGoogle = (data) => API.post('/auth/google', data);

// ── OTP ──
export const sendOTP      = (data) => API.post('/otp/send', data);
export const verifyOTP    = (data) => API.post('/otp/verify', data);

// ── User Profile ──
export const getUserProfile = () => API.get('/user/profile');
export const updateProfile  = (data) => API.put('/user/profile', data);
export const changePassword = (data) => API.put('/user/password', data);
export const deleteAccount  = () => API.delete('/user');

// ── Profile Setup Onboarding ──
export const getProfileSetup = () => API.get('/profile');
export const completeProfileSetup = (data) => API.post('/profile', data);

// ── Subscriptions ──
export const getSubscriptions        = () => API.get('/subscriptions');
export const addSubscription         = (data) => API.post('/subscriptions', data);
export const updateSubscription      = (id, data) => API.put(`/subscriptions/${id}`, data);
export const updateSubscriptionStatus= (id, status) => API.patch(`/subscriptions/${id}/status`, { status });
export const deleteSubscription      = (id) => API.delete(`/subscriptions/${id}`);
export const shareSubscription       = (id, data) => API.post(`/subscriptions/${id}/share`, data);
export const settleSharedDebt        = (shareId) => API.post(`/subscriptions/shared/${shareId}/settle`);
export const logSubscriptionUsage    = (id) => API.post(`/subscriptions/${id}/use`);

// ── Payments ──
export const getPayments    = () => API.get('/payments');
export const addPayment     = (data) => API.post('/payments', data);
export const deletePayment  = (id) => API.delete(`/payments/${id}`);

// ── Audit Logs ──
export const getAuditLogs = () => API.get('/audit');

// ── Notifications ──
export const getNotifications       = () => API.get('/notifications');
export const markNotificationRead   = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.patch('/notifications/read-all');
export const deleteNotification     = (id) => API.delete(`/notifications/${id}`);

// ── Export ──
export const exportCSV = () => API.get('/export/csv', { responseType: 'blob' });

// ── Admin ──
export const getAdminStats = () => API.get('/admin/analytics');

// ── Dashboard Analytics ──
export const getDashboard = () => API.get('/dashboard');

export default API;
