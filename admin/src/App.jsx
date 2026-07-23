import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabaseClient } from './supabaseClient';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import ProjectsList from './pages/ProjectsList';
import ProjectEdit from './pages/ProjectEdit';
import TeamList from './pages/TeamList';
import TeamEdit from './pages/TeamEdit';
import SiteSettingsPage from './pages/SiteSettingsPage';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-slate-500 font-mono text-sm">
        Authenticating admin session...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute>
              <ProjectEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/edit/:id"
          element={
            <ProtectedRoute>
              <ProjectEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <TeamList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team/new"
          element={
            <ProtectedRoute>
              <TeamEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team/edit/:id"
          element={
            <ProtectedRoute>
              <TeamEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SiteSettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
