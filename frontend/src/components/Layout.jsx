import React from 'react';
import { 
  Home, TrendingUp, Bot, LogOut, Briefcase, Target, 
  Users, Plus, BarChart3, User, CheckSquare 
} from 'lucide-react';
import { signOut } from '../lib/auth';
import { WaveGridBackground } from './ui/wave-grid-background';

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
      case 'myladder': return 'MY LADDER (KANBAN)';
      case 'aicoach': return 'AI CAREER COACH';
      case 'recruiter_dashboard': return 'RECRUITER DASHBOARD';
      case 'recruiter_jobs': return 'JOB POSTINGS & REQUISITIONS';
      case 'recruiter_ranker': return 'AI MULTI-CANDIDATE RANKER';
      case 'recruiter_create_job': return 'CREATE JOB POSTING';
      case 'recruiter_analytics': return 'HIRING PIPELINE ANALYTICS';
      default: return 'CAREER LADDER';
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F9FF] text-black overflow-hidden font-serif selection:bg-[#7DD3FC] selection:text-black relative">
      
      {/* 3D Wave Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-85">
        <WaveGridBackground 
          colorBase="#E0F2FE"
          colorHigh="#38BDF8"
          gridSize={40}
          waveAmplitude={0.4}
          waveSpeed={5.5}
        />
      </div>

      {/* Sidebar (Fixed Left) */}
      <aside className="w-68 bg-[#F0F9FF]/95 backdrop-blur-md border-r-4 border-black flex flex-col justify-between shrink-0 h-full shadow-[4px_0px_0px_0px_#000] z-20">
        <div>
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-between px-6 border-b-4 border-black bg-[#BAE6FD]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#7DD3FC]">
                <Briefcase className="w-5 h-5 text-[#7DD3FC]" />
              </div>
              <span className="text-xl font-black text-black tracking-tight uppercase">Career Ladder</span>
            </div>
          </div>

          {/* Role Status Pill */}
          <div className="px-5 pt-4 pb-2">
            <div className={`p-3 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-between ${
              isRecruiter 
                ? 'bg-[#C7D2FE] text-black' 
                : 'bg-[#BAE6FD] text-black'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-black flex items-center justify-center border border-black shadow-[1px_1px_0px_0px_#000]">
                  {isRecruiter ? (
                    <Briefcase className="w-4 h-4 text-[#C7D2FE] stroke-[2.5]" />
                  ) : (
                    <Target className="w-4 h-4 text-[#7DD3FC] stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-black/70 block leading-none">Role</span>
                  <span className="text-xs font-black uppercase tracking-wide leading-tight">
                    {isRecruiter ? 'Recruiter' : 'Job Seeker'}
                  </span>
                </div>
              </div>

              {onSwitchRole && (
                <button
                  onClick={onSwitchRole}
                  title="Switch test role"
                  className="text-xs font-black uppercase px-2.5 py-0.5 bg-black text-[#7DD3FC] border-2 border-black hover:bg-[#7DD3FC] hover:text-black transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                >
                  Switch
                </button>
              )}
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-4 py-4">
            <h3 className="text-xs font-black text-black/60 tracking-widest uppercase mb-3 px-2">
              {isRecruiter ? 'Recruiter Portal' : 'Job Seeker Menu'}
            </h3>
            
            <nav className="space-y-2">
              {isRecruiter ? (
                /* Recruiter Navigation */
                <>
                  <button 
                    onClick={() => onNavigate('recruiter_dashboard')}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-bold border-2 transition-all cursor-pointer ${
                      currentView === 'recruiter_dashboard' 
                        ? 'bg-[#93C5FD] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-1 font-black' 
                        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <Home className="w-5 h-5 mr-3 shrink-0" />
                    Dashboard
                  </button>

                  <button 
                    onClick={() => onNavigate('recruiter_jobs')}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-bold border-2 transition-all cursor-pointer ${
                      currentView === 'recruiter_jobs' 
                        ? 'bg-[#93C5FD] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-1 font-black' 
                        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mr-3 shrink-0" />
                    Jobs
                  </button>

                  <button 
                    onClick={() => onNavigate('recruiter_ranker')}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-bold border-2 transition-all cursor-pointer ${
                      currentView === 'recruiter_ranker' 
                        ? 'bg-[#93C5FD] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-1 font-black' 
                        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <Users className="w-5 h-5 mr-3 shrink-0" />
                    Candidate Ranker
                  </button>

                  <button 
                    onClick={() => onNavigate('recruiter_create_job')}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-bold border-2 transition-all cursor-pointer ${
                      currentView === 'recruiter_create_job' 
                        ? 'bg-[#93C5FD] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-1 font-black' 
                        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <Plus className="w-5 h-5 mr-3 shrink-0" />
                    Create Job
                  </button>

                  <button 
                    onClick={() => onNavigate('recruiter_analytics')}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-bold border-2 transition-all cursor-pointer ${
                      currentView === 'recruiter_analytics' 
                        ? 'bg-[#93C5FD] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-1 font-black' 
                        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5 mr-3 shrink-0" />
                    Analytics
                  </button>
                </>
              ) : (
                /* Job Seeker Navigation */
                <>
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-bold border-2 transition-all cursor-pointer ${
                      currentView === 'dashboard' 
                        ? 'bg-[#7DD3FC] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-1 font-black' 
                        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <Home className="w-5 h-5 mr-3 shrink-0" />
                    Home (Feed)
                  </button>

                  <button 
                    onClick={() => onNavigate('jobmatcher')}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-bold border-2 transition-all cursor-pointer ${
                      currentView === 'jobmatcher' 
                        ? 'bg-[#7DD3FC] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-1 font-black' 
                        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <Target className="w-5 h-5 mr-3 shrink-0" />
                    AI Job Matcher
                  </button>

                  <button 
                    onClick={() => onNavigate('myladder')}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-bold border-2 transition-all cursor-pointer ${
                      currentView === 'myladder' 
                        ? 'bg-[#7DD3FC] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-1 font-black' 
                        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5 mr-3 shrink-0" />
                    My Ladder
                  </button>

                  <button 
                    onClick={() => onNavigate('aicoach')}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-bold border-2 transition-all cursor-pointer ${
                      currentView === 'aicoach' 
                        ? 'bg-[#7DD3FC] text-black border-black shadow-[3px_3px_0px_0px_#000] translate-x-1 font-black' 
                        : 'border-transparent text-black hover:border-black hover:bg-white hover:shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <Bot className="w-5 h-5 mr-3 shrink-0" />
                    AI Coach
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* User Info & Log Out Button */}
        <div className="p-4 border-t-4 border-black bg-white/95 space-y-2">
          <div className="px-2 py-1.5 flex items-center gap-2 text-xs text-black font-bold truncate border-2 border-black bg-[#F0F9FF] shadow-[2px_2px_0px_0px_#000]">
            <User className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="truncate font-black">{userName}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-full px-3 py-2 text-xs font-black uppercase tracking-wider rounded-none bg-[#BAE6FD] hover:bg-[#38BDF8] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-16 bg-[#F0F9FF]/95 backdrop-blur-md border-b-4 border-black flex items-center justify-between px-8 shrink-0 z-10 shadow-[0_4px_0px_0px_#000]">
          <h2 className="text-xl font-black text-black tracking-wider uppercase">
            {getViewTitle()}
          </h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
              isRecruiter
                ? 'bg-[#C7D2FE] text-black'
                : 'bg-[#7DD3FC] text-black'
            }`}>
              {isRecruiter ? 'Recruiter Mode' : 'Job Seeker Mode'}
            </span>

            <span className="text-xs text-black font-bold hidden sm:block truncate max-w-[200px] px-2 py-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {userEmail}
            </span>
            <div className="w-9 h-9 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center bg-black text-[#7DD3FC] text-sm font-black uppercase">
              {userEmail?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>

      </div>
    </div>
  );
}
