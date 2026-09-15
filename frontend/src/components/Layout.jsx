import React from 'react';
import { 
  Home, TrendingUp, Bot, Settings, LogOut, Briefcase, Target, 
  Users, Plus, BarChart3, Sparkles, Building2, User 
} from 'lucide-react';
import { signOut } from '../lib/auth';

export default function Layout({ 
  children, 
  session, 
  userRole = 'job_seeker', 
  currentView, 
  onNavigate,
  onSwitchRole 
}) {
  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  const isRecruiter = userRole === 'recruiter';
  const userEmail = session?.user?.email || 'user@careerladder.dev';
  const userName = session?.user?.user_metadata?.full_name || session?.profile?.full_name || userEmail.split('@')[0];

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'OPPORTUNITY FEED';
      case 'jobmatcher': return 'AI JOB MATCHER';
      case 'myladder': return 'MY LADDER (APPLICATIONS)';
      case 'aicoach': return 'AI CAREER COACH';
      case 'careerprogression': return 'CAREER PROGRESSION TASKS';
      case 'recruiter_dashboard': return 'RECRUITER DASHBOARD';
      case 'recruiter_jobs': return 'JOB POSTINGS & REQUISITIONS';
      case 'recruiter_ranker': return 'AI MULTI-CANDIDATE RANKER';
      case 'recruiter_create_job': return 'CREATE JOB POSTING';
      case 'recruiter_analytics': return 'HIRING PIPELINE ANALYTICS';
      default: return 'CAREER LADDER';
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/* Sidebar (Fixed Left) */}
      <aside className="w-64 bg-slate-50 border-r border-gray-200 flex flex-col justify-between shrink-0 h-full">
        <div>
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <Briefcase className="w-6 h-6 text-indigo-600 mr-2" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Career Ladder</span>
            </div>
          </div>

          {/* Role Status Pill */}
          <div className="px-6 pt-4 pb-2">
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              isRecruiter 
                ? 'bg-purple-50/70 border-purple-200 text-purple-900' 
                : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{isRecruiter ? '🏢' : '🎯'}</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block leading-none">Role</span>
                  <span className="text-xs font-bold leading-tight">
                    {isRecruiter ? 'Recruiter' : 'Job Seeker'}
                  </span>
                </div>
              </div>

              {onSwitchRole && (
                <button
                  onClick={onSwitchRole}
                  title="Switch test role"
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  Switch
                </button>
              )}
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-4 py-4">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3 px-2">
              {isRecruiter ? 'Recruiter Portal' : 'Job Seeker'}
            </h3>
            
            <nav className="space-y-1">
              {isRecruiter ? (
                /* Recruiter Navigation */
                <>
                  <button 
                    onClick={() => onNavigate('recruiter_dashboard')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'recruiter_dashboard' 
                        ? 'bg-purple-100 text-purple-900 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Home className={`w-5 h-5 mr-3 ${currentView === 'recruiter_dashboard' ? 'text-purple-600' : 'text-gray-400'}`} />
                    Dashboard
                  </button>

                  <button 
                    onClick={() => onNavigate('recruiter_jobs')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'recruiter_jobs' 
                        ? 'bg-purple-100 text-purple-900 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Briefcase className={`w-5 h-5 mr-3 ${currentView === 'recruiter_jobs' ? 'text-purple-600' : 'text-gray-400'}`} />
                    Jobs
                  </button>

                  <button 
                    onClick={() => onNavigate('recruiter_ranker')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'recruiter_ranker' 
                        ? 'bg-purple-100 text-purple-900 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Users className={`w-5 h-5 mr-3 ${currentView === 'recruiter_ranker' ? 'text-purple-600' : 'text-gray-400'}`} />
                    Candidate Ranker
                  </button>

                  <button 
                    onClick={() => onNavigate('recruiter_create_job')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'recruiter_create_job' 
                        ? 'bg-purple-100 text-purple-900 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Plus className={`w-5 h-5 mr-3 ${currentView === 'recruiter_create_job' ? 'text-purple-600' : 'text-gray-400'}`} />
                    Create Job
                  </button>

                  <button 
                    onClick={() => onNavigate('recruiter_analytics')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'recruiter_analytics' 
                        ? 'bg-purple-100 text-purple-900 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className={`w-5 h-5 mr-3 ${currentView === 'recruiter_analytics' ? 'text-purple-600' : 'text-gray-400'}`} />
                    Analytics
                  </button>
                </>
              ) : (
                /* Job Seeker Navigation (Original Preserved) */
                <>
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'dashboard' 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Home className={`w-5 h-5 mr-3 ${currentView === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    Home (Jobs)
                  </button>

                  <button 
                    onClick={() => onNavigate('jobmatcher')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'jobmatcher' 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Target className={`w-5 h-5 mr-3 ${currentView === 'jobmatcher' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    AI Job Matcher
                  </button>

                  <button 
                    onClick={() => onNavigate('myladder')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'myladder' 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className={`w-5 h-5 mr-3 ${currentView === 'myladder' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    My Ladder
                  </button>

                  <button 
                    onClick={() => onNavigate('aicoach')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'aicoach' 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Bot className={`w-5 h-5 mr-3 ${currentView === 'aicoach' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    AI Coach
                  </button>

                  <button 
                    onClick={() => onNavigate('careerprogression')}
                    className={`flex items-center w-full px-2 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'careerprogression' 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className={`w-5 h-5 mr-3 ${currentView === 'careerprogression' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    Career Tasks
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* User Info & Log Out Button */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="px-2 py-1.5 flex items-center gap-2 text-xs text-gray-600 truncate">
            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate font-medium">{userName}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-2 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2.5 text-red-500" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-base font-bold text-gray-900 tracking-wide uppercase">
            {getViewTitle()}
          </h2>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              isRecruiter
                ? 'bg-purple-100 text-purple-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isRecruiter ? 'Recruiter Mode' : 'Job Seeker Mode'}
            </span>

            <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[200px]">
              {userEmail}
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs ${
              isRecruiter ? 'bg-purple-600' : 'bg-indigo-600'
            }`}>
              {userEmail?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
