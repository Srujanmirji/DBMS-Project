import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import CTA from './components/CTA';
import Footer from './components/Footer';

import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';

// Public Landing Page
function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/setup-profile" element={<ProfileSetup />} />
          
          {/* Protected Routes */}
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
