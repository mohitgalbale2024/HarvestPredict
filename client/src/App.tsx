import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';

import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import PredictYield from '@/pages/PredictYield';
import PredictionHistory from '@/pages/PredictionHistory';
import Analytics from '@/pages/Analytics';
import HarvestForecast from '@/pages/HarvestForecast';
import InsightsPage from '@/pages/InsightsPage';

import { PublicLayout } from '@/components/Layout';

function RequireAuth({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, isLoading, isGuest } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated && !isGuest) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/predict"
            element={
              <RequireAuth>
                <PredictYield />
              </RequireAuth>
            }
          />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <PredictionHistory />
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <Analytics />
              </RequireAuth>
            }
          />
          <Route
            path="/harvest-forecast"
            element={
              <RequireAuth>
                <HarvestForecast />
              </RequireAuth>
            }
          />
          <Route
            path="/insights"
            element={
              <RequireAuth>
                <InsightsPage />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
