import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// --- IMPORT PAGES ---
import Auth from './Auth';
import Dashboard from './Dashboard';
import PersonalDashboard from './PersonalDashboard';
import Settings from './Settings';

// Import New Password Pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  const location = useLocation();

  // DEBUGGER: Prints current path and user status to Console
  useEffect(() => {
    const user = localStorage.getItem('user');
    console.log(`🔎 Navigating to: ${location.pathname}`);
    console.log(`👤 Current User in Storage:`, user ? "Found" : "Missing/Logged Out");
  }, [location]);

  return (
    <Routes>
      {/* 1. Authentication Routes */}
      <Route path="/" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* 2. Protected Routes (Dashboard) */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/personal" element={<PersonalDashboard />} />
      <Route path="/settings" element={<Settings />} />

      {/* 3. Fallback: Redirect unknown URLs to Dashboard (or Login) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;