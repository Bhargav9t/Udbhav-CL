import React from 'react';
import { Home, TrendingUp, Bot, Settings, LogOut, Briefcase } from 'lucide-react';
import { signOut } from '../lib/auth';

export default function Layout({ children, session, currentView, onNavigate }) {
  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/* Sidebar (Fixed Left) */}
      <aside className="w-64 bg-slate-50 border-r border-gray-200 flex flex-col justify-between shrink-0 h-full">
        <div>
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Briefcase className="w-6 h-6 text-indigo-600 mr-2" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Career Ladder</span>
          </div>

          {/* Navigation Section */}
          <div className="px-4 py-6">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3 px-2">
              Navigation
            </h3>
            <nav className="space-y-1">
              <button 
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Home className={`w-5 h-5 mr-3 ${currentView === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`} />
                Home
              </button>
              <button 
                onClick={() => onNavigate('myladder')}
                className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'myladder' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <TrendingUp className={`w-5 h-5 mr-3 ${currentView === 'myladder' ? 'text-indigo-600' : 'text-gray-400'}`} />
                My Ladder
              </button>
              <button 
                onClick={() => onNavigate('aicoach')}
                className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'aicoach' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Bot className={`w-5 h-5 mr-3 ${currentView === 'aicoach' ? 'text-indigo-600' : 'text-gray-400'}`} />
                AI Coach
              </button>
              <button 
                onClick={() => onNavigate('careerprogression')}
                className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'careerprogression' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <TrendingUp className={`w-5 h-5 mr-3 ${currentView === 'careerprogression' ? 'text-indigo-600' : 'text-gray-400'}`} />
                Career Tasks
              </button>
            </nav>
          </div>
        </div>

        {/* Log Out Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-500" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 tracking-wide uppercase">
            {currentView === 'aicoach' ? 'AI COACH' : currentView === 'myladder' ? 'MY LADDER' : currentView === 'careerprogression' ? 'CAREER TASKS' : 'DISCOVER'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[200px]">
              {session?.user?.email}
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {session?.user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-white p-8">
          {/* Render child components here */}
          {children}
        </main>

      </div>
    </div>
  );
}
