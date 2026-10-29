import React, { useState } from 'react';
import { signIn, signUp } from '../lib/auth';
import {
  Briefcase, ArrowRight, ShieldCheck, Sparkles, CheckCircle2,
  Target, Users, TrendingUp, Zap, Lock, BarChart3, AlertCircle
} from 'lucide-react';

export default function AuthForm({ onSuccess, onEnterDemo, isSupabaseConfigured = false }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('job_seeker'); // 'job_seeker' or 'recruiter'

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('job_seeker');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        if (onSuccess) onSuccess();
      } else {
        if (!fullName.trim()) {
          throw new Error("Full Name is required for registration.");
        }
        const { error } = await signUp(email, password, fullName, role);
        if (error) throw error;
        setSuccessMsg("Registration successful! Logging you in...");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row justify-between items-stretch font-serif text-black selection:bg-[#7DD3FC] selection:text-black">

      {/* ================= LEFT HERO COLUMN ================= */}
      <div className="flex-1 p-6 sm:p-10 lg:p-14 flex flex-col justify-between space-y-8 bg-[#F0F9FF]/70 backdrop-blur-[2px]">

        {/* Brand Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_0px_#7DD3FC]">
                <Briefcase className="w-6 h-6 text-[#7DD3FC]" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase block leading-none">
                  Career Ladder
                </span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black/70">
                  AI Talent & Career Infrastructure
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-black text-[#7DD3FC] border-2 border-black text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
                v2.0 Stable
              </span>
              <span className="px-3 py-1 bg-[#BAE6FD] text-black border-2 border-black text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
                Neo-Brutalism
              </span>
            </div>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#BAE6FD] border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            Dual-Sided Intelligent Career Operating System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-[1.08]">
            Level Up Your Career. <br />
            <span className="bg-[#7DD3FC] px-2 py-0.5 border-3 border-black inline-block shadow-[4px_4px_0px_0px_#000] mt-1">
              Automate Technical Hiring.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-black/85 font-bold leading-relaxed max-w-2xl">
            Career Ladder seamlessly bridges ambitious builders with world-class tech companies.
            Experience personalized AI coaching, live multi-tier opportunities, interactive progression checklists,
            and transparent 4-factor candidate ranking.
          </p>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">

            {/* Card 1: Job Seeker */}
            <div className="bg-[#BAE6FD] border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between space-y-4 hover:shadow-[7px_7px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-black text-[#7DD3FC] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <Target className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white border border-black shadow-[1px_1px_0px_0px_#000]">
                    For Engineers
                  </span>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tight text-black">
                  Job Seeker Suite
                </h3>

                <ul className="text-xs font-bold text-black/80 space-y-1.5 leading-relaxed">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-black"></span>
                    18+ Curated Hackathons, Internships & Jobs
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-black"></span>
                    Groq Llama 3 AI Career Coach & Skill Gap Analysis
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-black"></span>
                    Dynamic MyLadder Kanban & XP Milestones
                  </li>
                </ul>
              </div>

              {onEnterDemo && (
                <button
                  type="button"
                  onClick={() => onEnterDemo('job_seeker')}
                  className="w-full py-2.5 px-3 bg-white hover:bg-black hover:text-[#7DD3FC] text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch Seeker Demo</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Card 2: Recruiter */}
            <div className="bg-[#93C5FD] border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between space-y-4 hover:shadow-[7px_7px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-black text-[#93C5FD] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <Users className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white border border-black shadow-[1px_1px_0px_0px_#000]">
                    For Hiring Teams
                  </span>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tight text-black">
                  Recruiter Command
                </h3>

                <ul className="text-xs font-bold text-black/80 space-y-1.5 leading-relaxed">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-black"></span>
                    AI Multi-Candidate Ranker (Batch Resumes)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-black"></span>
                    Transparent 4-Factor Mathematical Fit Scoring
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-black"></span>
                    Requisition Tracking & Hiring Velocity Analytics
                  </li>
                </ul>
              </div>

              {onEnterDemo && (
                <button
                  type="button"
                  onClick={() => onEnterDemo('recruiter')}
                  className="w-full py-2.5 px-3 bg-white hover:bg-black hover:text-[#93C5FD] text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch Recruiter Demo</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-4 text-xs font-black uppercase tracking-wider text-black">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black"></span>
            <span>SYSTEM OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-4 text-black/70">
            <span>• 18 Live Opportunities</span>
            <span>• Groq Llama 3 Connected</span>
            <span>• Resilient Local Sync</span>
          </div>
        </div>

      </div>

      {/* ================= RIGHT CONSOLE COLUMN ================= */}
      <div className="w-full lg:w-[480px] xl:w-[540px] shrink-0 bg-white/95 backdrop-blur-md border-t-4 lg:border-t-0 lg:border-l-4 border-black p-6 sm:p-8 md:p-10 flex flex-col justify-between shadow-[-10px_0px_0px_0px_#000] relative z-20 space-y-6">

        {/* Console Header Bar */}
        <div className="border-b-3 border-black pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-widest text-black">
                Security & Access Console
              </span>
            </div>
            <span className="px-2 py-0.5 bg-[#BAE6FD] text-black border border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
              TLS Encrypted
            </span>
          </div>

          {/* Sign In / Register Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrorMsg(null); }}
              className={`py-3 text-xs font-black uppercase tracking-widest border-2 border-black transition-all cursor-pointer ${isLogin
                  ? 'bg-[#7DD3FC] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#F0F9FF]'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrorMsg(null); }}
              className={`py-3 text-xs font-black uppercase tracking-widest border-2 border-black transition-all cursor-pointer ${!isLogin
                  ? 'bg-[#7DD3FC] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#F0F9FF]'
                }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              {isLogin ? 'Welcome Back' : 'Create New Account'}
            </h2>
            <p className="text-xs font-bold text-black/70 mt-1">
              {isLogin
                ? 'Enter your credentials to access your ladder, coach, and candidate rankings.'
                : 'Select your role and set up your authenticated profile.'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-[#FEE2E2] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black text-xs font-black flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-black" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 bg-[#BAE6FD] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black text-xs font-black flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 stroke-black" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role Selection (Only on Register) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider">
                  Select Primary Portal Mode:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('job_seeker')}
                    className={`p-3 border-2 border-black text-left transition-all cursor-pointer ${role === 'job_seeker'
                        ? 'bg-[#BAE6FD] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5 font-black'
                        : 'bg-white text-black hover:bg-[#F0F9FF]'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Target className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="font-black text-xs uppercase">Job Seeker</span>
                    </div>
                    <p className="text-[10px] text-black/70 font-bold leading-tight">
                      Feed, AI Coach & My Ladder
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`p-3 border-2 border-black text-left transition-all cursor-pointer ${role === 'recruiter'
                        ? 'bg-[#93C5FD] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5 font-black'
                        : 'bg-white text-black hover:bg-[#F0F9FF]'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Briefcase className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="font-black text-xs uppercase">Recruiter</span>
                    </div>
                    <p className="text-[10px] text-black/70 font-bold leading-tight">
                      Post Jobs & Candidate Ranker
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Full Name (Only on Register) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  placeholder={role === 'recruiter' ? "Sarah Jenkins (Apex AI)" : "Aarav Sharma"}
                  className="w-full px-4 py-2.5 bg-[#F0F9FF] border-2 border-black shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none text-xs font-bold placeholder:text-black/40"
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
                className="w-full px-4 py-2.5 bg-[#F0F9FF] border-2 border-black shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none text-xs font-bold placeholder:text-black/40"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#F0F9FF] border-2 border-black shadow-[2px_2px_0px_0px_#000] focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none text-xs font-bold placeholder:text-black/40"
              />
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span className="animate-pulse">AUTHENTICATING...</span>
              ) : isLogin ? (
                <>SIGN IN TO PORTAL <ArrowRight className="w-4 h-4 stroke-[3]" /></>
              ) : (
                <>INITIALIZE ACCOUNT <ArrowRight className="w-4 h-4 stroke-[3]" /></>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2">
            <span className="text-xs font-bold text-black/70">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs font-black uppercase underline hover:text-black/60 cursor-pointer ml-1"
            >
              {isLogin ? 'Register Here' : 'Sign In Here'}
            </button>
          </div>
        </div>

        {/* 1-Click Instant Demo Sandbox (No Login Required) */}
        {onEnterDemo && (
          <div className="pt-4 border-t-2 border-black space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                Instant Demo Access (No Password)
              </span>
              <span className="text-[10px] font-bold text-black/60">One-Click</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onEnterDemo('job_seeker')}
                className="py-2.5 px-3 bg-[#BAE6FD] hover:bg-black hover:text-[#BAE6FD] text-black border-2 border-black text-[11px] font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Seeker Demo</span>
              </button>

              <button
                type="button"
                onClick={() => onEnterDemo('recruiter')}
                className="py-2.5 px-3 bg-[#93C5FD] hover:bg-black hover:text-[#93C5FD] text-black border-2 border-black text-[11px] font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Recruiter Demo</span>
              </button>
            </div>
            <p className="text-[10px] font-bold text-black/60 text-center">
              Preloaded with 18 opportunities, AI chat contexts, and candidate resumes.
            </p>
          </div>
        )}

        {/* Console Bottom Disclaimer */}
        <div className="text-[10px] font-bold text-black/50 text-center uppercase tracking-wider">
          Career Ladder • End-to-End Isolated Session State
        </div>

      </div>

    </div>
  );
}
