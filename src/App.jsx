import React, { useState, useEffect } from 'react';
import { supabase, signOut } from './lib/auth';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes on auth state (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  // If no session exists, show the authentication form in a dark container
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900">
        <AuthForm />
      </div>
    );
  }

  // If a session exists, show the Main Dashboard wrapped in the Layout
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}
