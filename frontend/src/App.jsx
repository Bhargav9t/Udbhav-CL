import React, { useState, useEffect } from 'react';
import { supabase, signOut } from './lib/auth';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AICoach from './components/AICoach';
import MyLadder from './components/MyLadder';
import CareerProgressionBoard from './components/CareerProgressionBoard';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Routing and AI Coach state
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'aicoach'
  const [resumeText, setResumeText] = useState(() => localStorage.getItem('career_ladder_resume') || '');
  const [currentJobContext, setCurrentJobContext] = useState(null);

  // Persist resume text
  useEffect(() => {
    localStorage.setItem('career_ladder_resume', resumeText);
  }, [resumeText]);

  // Navigation handlers
  const handleOpenAICoachWithJob = (job) => {
    setCurrentJobContext(job);
    setCurrentView('aicoach');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

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
    const handleAuthSuccess = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    return (
      <div className="min-h-screen bg-gray-900">
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // If a session exists, show the Main Dashboard wrapped in the Layout
  return (
    <Layout session={session} currentView={currentView} onNavigate={handleNavigate}>
      {currentView === 'dashboard' && (
        <Dashboard 
          resumeText={resumeText} 
          onAskAI={handleOpenAICoachWithJob} 
        />
      )}
      {currentView === 'aicoach' && (
        <AICoach 
          resumeText={resumeText} 
          setResumeText={setResumeText} 
          currentJobContext={currentJobContext} 
          clearJobContext={() => setCurrentJobContext(null)} 
        />
      )}
      {currentView === 'myladder' && (
        <MyLadder session={session} />
      )}
      {currentView === 'careerprogression' && (
        <CareerProgressionBoard session={session} />
      )}
    </Layout>
  );
}
