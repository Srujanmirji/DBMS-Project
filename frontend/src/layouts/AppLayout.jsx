import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();

  // Protect route
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-surface-0">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen relative">
        <div className="max-w-[1200px] mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
