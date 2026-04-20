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
import StaticPage from './pages/StaticPage';
import ScrollToHash from './components/ScrollToHash';

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
      <ScrollToHash />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/setup-profile" element={<ProfileSetup />} />
          
          {/* Static Pages */}
          <Route path="/privacy" element={<StaticPage title="Privacy Policy" />} />
          <Route path="/terms" element={<StaticPage title="Terms of Service" />} />
          <Route path="/cookies" element={<StaticPage title="Cookie Policy" />} />
          <Route path="/about" element={<StaticPage title="About Us" />} />
          <Route path="/careers" element={<StaticPage title="Careers" />} />
          <Route path="/blog" element={<StaticPage title="Blog" />} />
          <Route path="/contact" element={<StaticPage title="Contact" />} />
          <Route path="/changelog" element={<StaticPage title="Changelog" />} />
          
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
