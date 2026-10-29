import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getCurrentUser } from './lib/auth';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AICoach from './components/AICoach';
import AIMascotCoach from './components/AIMascotCoach';
import MyLadder from './components/MyLadder';
import JobMatcher from './components/JobMatcher';
import { WaveGridBackground } from './components/ui/wave-grid-background';

// Recruiter Components
import RecruiterDashboard from './components/recruiter/RecruiterDashboard';
import CreateJobForm from './components/recruiter/CreateJobForm';
import RecruiterJobs from './components/recruiter/RecruiterJobs';
import CandidateRanker from './components/recruiter/CandidateRanker';
import RecruiterAnalytics from './components/recruiter/RecruiterAnalytics';

const DEFAULT_CANDIDATE_RESUME = `Aarav Sharma
San Francisco, CA | aarav.sharma@example.com | github.com/aaravsharma

PROFESSIONAL SUMMARY
Senior Full-Stack & Machine Learning Engineer with 5+ years of experience building high-throughput web applications, microservices, and AI agent systems. Specialist in Python, React, FastAPI, PyTorch, and PostgreSQL.

CORE TECHNICAL SKILLS
- Programming Languages: Python, TypeScript, JavaScript, SQL, Go
- Web & APIs: React, Next.js, FastAPI, Node.js, Tailwind CSS, REST, WebSockets
- AI & Machine Learning: PyTorch, LangChain, Hugging Face Transformers, Vector Databases (pgvector, Pinecone)
- Infrastructure & Cloud: AWS (ECS, S3, RDS), Docker, Kubernetes, Git, CI/CD pipelines, PostgreSQL, Redis

WORK EXPERIENCE
Senior Full-Stack AI Engineer | Apex Systems (2022 - Present)
- Architected asynchronous FastAPI microservices serving 450,000+ daily inference requests with sub-60ms latency.
- Built interactive real-time multi-agent dashboards using React, TypeScript, and WebSockets.
- Integrated vector search indexing using pgvector and Pinecone, boosting semantic search accuracy by 38%.

Software Engineer | NextGen Cloud (2020 - 2022)
- Developed full-stack web applications using React, Node.js, and PostgreSQL.
- Containerized development workflows using Docker Compose and established automated GitHub Actions CI/CD pipelines.

EDUCATION
B.S. in Computer Science | University of Washington (2016 - 2020)
`;

export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('job_seeker'); // 'job_seeker' or 'recruiter'
  const [loading, setLoading] = useState(true);
  
  // Navigation & context state
  const [currentView, setCurrentView] = useState('dashboard');
  const [resumeText, setResumeText] = useState(() => localStorage.getItem('career_ladder_resume') || DEFAULT_CANDIDATE_RESUME);
  const [currentJobContext, setCurrentJobContext] = useState(null);
  const [activeRecruiterJob, setActiveRecruiterJob] = useState(null);
  const [isMascotCoachOpen, setIsMascotCoachOpen] = useState(false);

  // Persist resume text
  useEffect(() => {
    localStorage.setItem('career_ladder_resume', resumeText);
  }, [resumeText]);

  // Sync user role from authentication profile
  const syncRole = async (user) => {
    if (!user) return;
    try {
      const { profile } = await getCurrentUser();
      const detectedRole = profile?.role || user.user_metadata?.role || 'job_seeker';
      setUserRole(detectedRole);

      // Route guard on initial session acquisition
      if (detectedRole === 'recruiter') {
        setCurrentView((prev) => (prev.startsWith('recruiter') ? prev : 'recruiter_dashboard'));
      } else {
        setCurrentView((prev) => (prev.startsWith('recruiter') ? 'dashboard' : prev));
      }
    } catch (e) {
      console.warn('Role sync warning:', e);
    }
  };

  // Check active session & subscribe to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data?.session || null;
      setSession(s);
      if (s?.user) {
        syncRole(s.user);
      } else {
        // Check local storage fallback
        const saved = localStorage.getItem('career_ladder_local_user');
        if (saved) {
          try {
            const u = JSON.parse(saved);
            const r = u.user_metadata?.role || 'job_seeker';
            setSession({ user: u });
            setUserRole(r);
            setCurrentView(r === 'recruiter' ? 'recruiter_dashboard' : 'dashboard');
          } catch (err) {
            console.error(err);
          }
        }
      }
      setLoading(false);
    }).catch((err) => {
      console.warn('Session check fallback:', err);
      setLoading(false);
    });

    const {
      data: { subscription } = {},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        syncRole(session.user);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  // Strict Role-Based View Navigation with Guards
  const handleNavigate = (view) => {
    // If Job Seeker clicks 'aicoach', toggle the Mascot Coach window
    if (view === 'aicoach') {
      setIsMascotCoachOpen(prev => !prev);
      return;
    }

    // If Job Seeker attempts to access Recruiter routes -> redirect to Job Seeker Dashboard
    if (userRole === 'job_seeker' && view.startsWith('recruiter')) {
      console.warn('Access denied: Job Seeker redirected from recruiter route.');
      setCurrentView('dashboard');
      return;
    }

    // If Recruiter attempts to access Job Seeker-only routes -> redirect to Recruiter Dashboard
    if (userRole === 'recruiter' && !view.startsWith('recruiter')) {
      console.warn('Access denied: Recruiter redirected from job seeker route.');
      setCurrentView('recruiter_dashboard');
      return;
    }

    setCurrentView(view);
  };

  // Job Seeker: Open AI Coach with Job context
  const handleOpenAICoachWithJob = (job) => {
    setCurrentJobContext(job);
    setIsMascotCoachOpen(true);
  };

  // Recruiter: Select Job to launch AI Multi-Candidate Ranker
  const handleSelectRecruiterJob = (job) => {
    setActiveRecruiterJob(job);
    setCurrentView('recruiter_ranker');
  };

  // Role Switcher for instant testing / demo toggle
  const handleSwitchRole = () => {
    const nextRole = userRole === 'recruiter' ? 'job_seeker' : 'recruiter';
    setUserRole(nextRole);
    if (session?.user) {
      const updatedUser = {
        ...session.user,
        user_metadata: {
          ...session.user.user_metadata,
          role: nextRole
        }
      };
      setSession({ ...session, user: updatedUser });
      localStorage.setItem('career_ladder_local_user', JSON.stringify(updatedUser));
    }
    setCurrentView(nextRole === 'recruiter' ? 'recruiter_dashboard' : 'dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF] font-serif text-black">
        <div className="p-6 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] text-lg font-black uppercase tracking-wider animate-pulse">
          Loading Career Ladder...
        </div>
      </div>
    );
  }

  // If no session exists, show AuthForm with instant demo entrypoints
  if (!session) {
    const handleAuthSuccess = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data?.session || null);
        if (data?.session?.user) {
          await syncRole(data.session.user);
        } else {
          const saved = localStorage.getItem('career_ladder_local_user');
          if (saved) {
            const u = JSON.parse(saved);
            setSession({ user: u });
            const r = u.user_metadata?.role || 'job_seeker';
            setUserRole(r);
            setCurrentView(r === 'recruiter' ? 'recruiter_dashboard' : 'dashboard');
          }
        }
      } catch (e) {
        console.error('Auth success check failed:', e);
      }
    };

    const handleEnterDemo = (roleChoice = 'job_seeker') => {
      const demoUser = {
        id: roleChoice === 'recruiter' ? 'recruiter-demo-id' : 'demo-user-id',
        email: roleChoice === 'recruiter' ? 'recruiter@apexlabs.ai' : 'candidate@careerladder.dev',
        user_metadata: { 
          full_name: roleChoice === 'recruiter' ? 'Sarah Jenkins (Apex Labs)' : 'Aarav Sharma',
          role: roleChoice
        }
      };
      localStorage.setItem('career_ladder_local_user', JSON.stringify(demoUser));
      setSession({ user: demoUser });
      setUserRole(roleChoice);
      setCurrentView(roleChoice === 'recruiter' ? 'recruiter_dashboard' : 'dashboard');
    };

    return (
      <div className="min-h-screen w-full bg-[#F0F9FF] font-serif text-black relative selection:bg-[#7DD3FC] overflow-x-hidden">
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

        {/* Full-Page Auth Experience */}
        <div className="relative z-10 w-full min-h-screen">
          <AuthForm 
            onSuccess={handleAuthSuccess} 
            onEnterDemo={handleEnterDemo}
            isSupabaseConfigured={isSupabaseConfigured}
          />
        </div>
      </div>
    );
  }

  // Active Session Layout
  return (
    <Layout 
      session={session} 
      userRole={userRole} 
      currentView={currentView} 
      onNavigate={handleNavigate}
      onSwitchRole={handleSwitchRole}
    >
      {/* ================= JOB SEEKER VIEWS ================= */}
      {userRole === 'job_seeker' && (
        <>
          {currentView === 'dashboard' && (
            <Dashboard 
              resumeText={resumeText} 
              setResumeText={setResumeText}
              onAskAI={handleOpenAICoachWithJob} 
              onNavigate={handleNavigate}
            />
          )}
          {currentView === 'jobmatcher' && (
            <JobMatcher resumeText={resumeText} />
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
            <MyLadder session={session} onNavigate={handleNavigate} />
          )}
        </>
      )}

      {/* ================= RECRUITER VIEWS ================= */}
      {userRole === 'recruiter' && (
        <>
          {currentView === 'recruiter_dashboard' && (
            <RecruiterDashboard
              recruiterId={session.user.id}
              recruiterName={session.user.user_metadata?.full_name || 'Recruiter'}
              onCreateJob={() => setCurrentView('recruiter_create_job')}
              onSelectJob={handleSelectRecruiterJob}
              onViewAllJobs={() => setCurrentView('recruiter_jobs')}
              onViewAnalytics={() => setCurrentView('recruiter_analytics')}
            />
          )}

          {currentView === 'recruiter_jobs' && (
            <RecruiterJobs
              recruiterId={session.user.id}
              onSelectJob={handleSelectRecruiterJob}
              onCreateJob={() => setCurrentView('recruiter_create_job')}
            />
          )}

          {currentView === 'recruiter_create_job' && (
            <CreateJobForm
              recruiterId={session.user.id}
              onJobCreated={(job) => {
                setActiveRecruiterJob(job);
                setCurrentView('recruiter_ranker');
              }}
              onCancel={() => setCurrentView('recruiter_dashboard')}
            />
          )}

          {currentView === 'recruiter_ranker' && (
            <CandidateRanker
              job={activeRecruiterJob || {
                id: 'demo-job-ai-backend',
                title: 'Senior AI Backend Engineer',
                company: 'Apex AI Labs',
                required_skills: ['Python', 'FastAPI', 'AWS', 'Docker', 'PostgreSQL', 'Kubernetes'],
                preferred_skills: ['PyTorch', 'Vector Databases', 'LangChain', 'Redis'],
                experience_required: '5+ years',
                education_required: "Master's or Bachelor's in CS",
                description: 'Seeking Senior AI Backend Engineer to build high-throughput ML pipelines and vector search.'
              }}
              recruiterId={session.user.id}
              onBack={() => setCurrentView('recruiter_jobs')}
            />
          )}

          {currentView === 'recruiter_analytics' && (
            <RecruiterAnalytics
              recruiterId={session.user.id}
              onSelectJob={handleSelectRecruiterJob}
            />
          )}
        </>
      )}

      {/* Floating Interactive AI Mascot Coach */}
      {userRole === 'job_seeker' && (
        <AIMascotCoach
          resumeText={resumeText}
          setResumeText={setResumeText}
          currentJobContext={currentJobContext}
          clearJobContext={() => setCurrentJobContext(null)}
          isOpen={isMascotCoachOpen}
          setIsOpen={setIsMascotCoachOpen}
        />
      )}
    </Layout>
  );
}
