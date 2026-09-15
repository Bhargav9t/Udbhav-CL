import React from 'react';
import { 
  Home, 
  TrendingUp, 
  Bot, 
  Settings, 
  LogOut, 
  Briefcase 
} from 'lucide-react';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/* Sidebar (Fixed Left) */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col justify-between shrink-0 h-full">
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
              <a href="#" className="flex items-center px-2 py-2.5 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 group">
                <Home className="w-5 h-5 mr-3 text-indigo-600" />
                Home
              </a>
              <a href="#" className="flex items-center px-2 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 group transition-colors">
                <TrendingUp className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                My Ladder
              </a>
              <a href="#" className="flex items-center px-2 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 group transition-colors">
                <Bot className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                AI Coach
              </a>
            </nav>
          </div>

          {/* Management Section */}
          <div className="px-4">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3 px-2">
              Management
            </h3>
            <nav className="space-y-1">
              <a href="#" className="flex items-center px-2 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 group transition-colors">
                <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
                Admin Panel
              </a>
            </nav>
          </div>
        </div>

        {/* Log Out Button */}
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5 mr-3 text-red-500" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 tracking-wide">
            DISCOVER
          </h2>
          <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2 px-6 rounded-full shadow-sm transition-transform active:scale-95">
            SIGN IN
          </button>
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
