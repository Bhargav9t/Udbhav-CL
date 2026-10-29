import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, ChevronDown, Sparkles, Upload, FileText, 
  CheckCircle2, RefreshCw, X, ArrowUpDown, UserCheck, Code, Target
} from 'lucide-react';
import OpportunityCard from './OpportunityCard';
import { supabase, isSupabaseConfigured } from '../lib/auth';
import { extractResumeProfile, calculateOpportunityMatch } from '../lib/skillExtractor';
import { extractTextFromFile } from '../lib/fileParser';

export const SAMPLE_OPPORTUNITIES = [
  // --- HACKATHONS ---
  {
    id: 'sample-hackmit-2026',
    title: 'HackMIT 2026',
    organization: 'MIT',
    category: 'Hackathon',
    grade_level: 'Undergraduate',
    opportunity_link: 'https://hackmit.org',
    deadline: 'Applications close Oct 15',
    summary: 'Join 1,000+ top undergraduate hackers from across the globe on MIT campus for a 36-hour weekend of hacking, hardware labs, and building world-changing applications.',
    aiMatchReason: 'Perfect for strengthening your full-stack development velocity and collaborative team leadership!'
  },
  {
    id: 'sample-calhacks-12',
    title: 'CalHacks 12.0 World AI Hackathon',
    organization: 'UC Berkeley',
    category: 'Hackathon',
    grade_level: 'Graduate / PhD',
    opportunity_link: 'https://calhacks.io',
    deadline: 'Applications close Nov 2',
    summary: 'The world\'s largest collegiate AI hackathon hosted in San Francisco. Graduate and undergraduate researchers build agentic workflows, multi-modal LLM applications, and decentralized infrastructure.',
    aiMatchReason: 'Ideal arena to showcase your LLM agents and distributed vector database prototypes.'
  },
  {
    id: 'sample-pennapps-xxvi',
    title: 'PennApps XXVI: Next-Gen Systems',
    organization: 'University of Pennsylvania',
    category: 'Hackathon',
    grade_level: 'Undergraduate',
    opportunity_link: 'https://pennapps.com',
    deadline: 'Applications close Sept 20',
    summary: 'The original student hackathon focusing on high-throughput distributed systems, robotics, and biomedical machine learning for undergraduate engineers.',
    aiMatchReason: 'Direct match for your React frontend skills and cloud database deployment capabilities.'
  },
  {
    id: 'sample-ai-frontiers-hack',
    title: 'AI Frontiers Global Enterprise Hackathon',
    organization: 'Frontier AI Foundation',
    category: 'Hackathon',
    grade_level: 'Professional',
    opportunity_link: 'https://careerladder.dev',
    deadline: 'Rolling admissions',
    summary: 'A global competitive hackathon for senior developers and professional engineers building autonomous enterprise agents and high-concurrency inference pipelines.',
    aiMatchReason: 'Matches your experience in scalable backend architecture and production microservices.'
  },

  // --- INTERNSHIPS ---
  {
    id: 'sample-google-intern',
    title: 'Software Engineering Intern (Summer 2026)',
    organization: 'Google',
    category: 'Internship',
    grade_level: 'Undergraduate',
    opportunity_link: 'https://careers.google.com',
    deadline: 'Rolling admissions',
    summary: 'Build scalable distributed systems and solve complex algorithmic problems alongside industry-leading mentors using Python, Go, and Google Cloud Infrastructure. Open to undergraduate and master\'s students.',
    aiMatchReason: 'Strong match with your backend programming experience and data structures foundation.'
  },
  {
    id: 'sample-meta-fair-intern',
    title: 'Machine Learning Research Intern (GenAI)',
    organization: 'Meta FAIR',
    category: 'Internship',
    grade_level: 'Graduate / PhD',
    opportunity_link: 'https://metacareers.com',
    deadline: 'Deadline Dec 1',
    summary: 'Conduct fundamental artificial intelligence research at Fundamental AI Research (FAIR) in Menlo Park. Train massive foundation models and publish first-author papers at NeurIPS/ICLR. Graduate/PhD degree preferred.',
    aiMatchReason: 'High-impact opportunity to translate your PyTorch and transformer expertise into tier-1 research publications.'
  },
  {
    id: 'sample-citadel-quant-intern',
    title: 'Quantitative Developer & Systems Intern',
    organization: 'Citadel Securities',
    category: 'Internship',
    grade_level: 'Undergraduate',
    opportunity_link: 'https://citadelsecurities.com/careers',
    deadline: 'Applications close Nov 15',
    summary: 'Design and optimize ultra-low-latency market connectivity microservices and statistical arbitrage algorithms using C++20 and Python. Open to undergraduate math and CS students.',
    aiMatchReason: 'Exceptional fit for your high-performance algorithmic reasoning and mathematical foundation.'
  },
  {
    id: 'sample-stripe-intern',
    title: 'Full-Stack Product Engineering Intern',
    organization: 'Stripe',
    category: 'Internship',
    grade_level: 'Undergraduate',
    opportunity_link: 'https://stripe.com/jobs',
    deadline: 'Rolling admissions',
    summary: 'Build developer-first payment infrastructure, high-reliability financial APIs, and delightful React UI dashboards used by millions of businesses globally. Designed for undergraduate students.',
    aiMatchReason: 'Perfect alignment with your React, TypeScript, and modern API architecture background.'
  },
  {
    id: 'sample-tesla-robotics-intern',
    title: 'Autonomous Systems & Autopilot Intern',
    organization: 'Tesla',
    category: 'Internship',
    grade_level: 'Graduate / PhD',
    opportunity_link: 'https://tesla.com/careers',
    deadline: 'Rolling admissions',
    summary: 'Develop real-time perception algorithms and neural network inference pipelines on custom hardware for Tesla Full Self-Driving and Optimus robotics.',
    aiMatchReason: 'Direct bridge between your deep learning knowledge and low-latency production execution.'
  },
  {
    id: 'sample-palantir-fdse-intern',
    title: 'Forward Deployed Software Engineer Intern',
    organization: 'Palantir',
    category: 'Internship',
    grade_level: 'Undergraduate',
    opportunity_link: 'https://palantir.com/careers',
    deadline: 'Oct 31',
    summary: 'Deploy mission-critical data operating systems to defense, healthcare, and humanitarian partners globally. Work with distributed databases, TypeScript, and Python.',
    aiMatchReason: 'Exciting match for your distributed data pipeline skills and rapid problem-solving acumen.'
  },

  // --- JOBS ---
  {
    id: 'sample-openai-systems-eng',
    title: 'Senior AI Infrastructure & Systems Engineer',
    organization: 'OpenAI',
    category: 'Job',
    grade_level: 'Professional',
    opportunity_link: 'https://openai.com/careers',
    deadline: 'Rolling admissions',
    summary: 'Architect distributed GPU clusters, high-throughput model inference endpoints, and scalable vector store infrastructure powering next-generation frontier intelligence.',
    aiMatchReason: 'Elite alignment with your FastAPI microservices, pgvector integration, and cloud-native Kubernetes expertise!'
  },
  {
    id: 'sample-anthropic-backend-eng',
    title: 'Distributed Systems & Safety Infrastructure Lead',
    organization: 'Anthropic',
    category: 'Job',
    grade_level: 'Professional',
    opportunity_link: 'https://anthropic.com/careers',
    deadline: 'Rolling admissions',
    summary: 'Scale Claude\'s reliable backend infrastructure, automated evaluation harness, and fault-tolerant multi-region services handling billions of monthly tokens with strict safety constraints.',
    aiMatchReason: 'Direct match for your Python backend scalability, container orchestration, and asynchronous service design.'
  },
  {
    id: 'sample-vercel-frontend-eng',
    title: 'Staff Frontend Infrastructure Engineer',
    organization: 'Vercel',
    category: 'Job',
    grade_level: 'Professional',
    opportunity_link: 'https://vercel.com/careers',
    deadline: 'Rolling admissions',
    summary: 'Shape the future of the web by innovating on Next.js, React Server Components, and edge rendering pipelines used by millions of developers worldwide.',
    aiMatchReason: 'Direct match for your React expertise, modern frontend architecture, and performance optimization background.'
  },
  {
    id: 'sample-databricks-lakehouse',
    title: 'Senior Lakehouse Storage Engine Engineer',
    organization: 'Databricks',
    category: 'Job',
    grade_level: 'Professional',
    opportunity_link: 'https://databricks.com/careers',
    deadline: 'Rolling admissions',
    summary: 'Build high-performance distributed columnar query execution engines, vector index caching, and delta lake storage formats using C++ and Go.',
    aiMatchReason: 'Fits your relational database background and aspirations toward distributed database internals.'
  },
  {
    id: 'sample-snowflake-backend',
    title: 'Core Database Kernel Engineer',
    organization: 'Snowflake',
    category: 'Job',
    grade_level: 'Professional',
    opportunity_link: 'https://snowflake.com/careers',
    deadline: 'Rolling admissions',
    summary: 'Design multi-tenant cloud data warehouse primitives, distributed consensus protocols, and query optimization algorithms handling exabytes of analytical queries.',
    aiMatchReason: 'Powerful pathway to deepen your database indexing, query planning, and cloud storage systems engineering.'
  },

  // --- RESEARCH ---
  {
    id: 'sample-deepmind-resident',
    title: 'AI Resident Researcher (Foundation Models)',
    organization: 'Google DeepMind',
    category: 'Research',
    grade_level: 'Graduate / PhD',
    opportunity_link: 'https://deepmind.google',
    deadline: 'Dec 15',
    summary: 'A 2-year dedicated research residency in London or Mountain View focusing on multimodal reasoning, reinforcement learning from human feedback (RLHF), and agentic coordination.',
    aiMatchReason: 'World-class opportunity to conduct pure foundational AI research with massive compute clusters.'
  },
  {
    id: 'sample-stanford-hai-fellow',
    title: 'Human-Centered AI Postdoctoral Scholar',
    organization: 'Stanford University (HAI)',
    category: 'Research',
    grade_level: 'Graduate / PhD',
    opportunity_link: 'https://hai.stanford.edu',
    deadline: 'Jan 10',
    summary: 'Investigate safety, alignment, and societal impacts of generative AI models. Collaborate across Stanford Computer Science, Law, and Medicine with endowed research grants.',
    aiMatchReason: 'Prestigious fellowship uniting machine learning systems with ethical, scalable real-world application.'
  },
  {
    id: 'sample-mit-climate-fellow',
    title: 'Climate Intelligence & Ocean Modeling Scholar',
    organization: 'MIT & Woods Hole',
    category: 'Research',
    grade_level: 'Graduate / PhD',
    opportunity_link: 'https://mit.edu',
    deadline: 'Jan 15',
    summary: 'Apply physics-informed neural operators and massive planetary climate satellite datasets to forecast extreme global climate disruptions. Graduate and PhD fellows receive full stipend and compute access.',
    aiMatchReason: 'High-impact research applying deep learning models to critical ecological and planetary challenges.'
  },
  {
    id: 'sample-ibm-quantum-scholar',
    title: 'Quantum Algorithms & Qiskit Research Scholar',
    organization: 'IBM Quantum',
    category: 'Research',
    grade_level: 'Graduate / PhD',
    opportunity_link: 'https://ibm.com/quantum',
    deadline: 'Rolling',
    summary: 'Formulate hybrid quantum-classical algorithms, error mitigation protocols, and quantum machine learning circuits using Qiskit on real superconducting quantum hardware.',
    aiMatchReason: 'Groundbreaking exploration into the intersection of quantum information theory and modern computing.'
  }
];

const RESUME_PRESETS = [
  {
    name: 'Aarav Sharma',
    role: 'Senior Full-Stack & AI Engineer',
    text: `Aarav Sharma
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

EDUCATION
B.S. in Computer Science | University of Washington (2016 - 2020)`
  },
  {
    name: 'Priya Kumar',
    role: 'Senior Backend Engineer',
    text: `Priya Kumar
Seattle, WA | priya.kumar@example.com

SUMMARY
5 years backend engineering expertise specializing in Python, FastAPI, PostgreSQL, Redis, Celery, and Docker microservices.

SKILLS
Python, FastAPI, Docker, PostgreSQL, Redis, Celery, AWS (S3, EC2), Git, CI/CD, REST APIs, Microservices architecture.

EXPERIENCE
Senior Backend Developer | DataFlow Technologies (2021 - Present)
- Architected core payment and ledger backend using FastAPI and PostgreSQL with strict ACID guarantees.
- Containerized development workflows using Docker Compose and deployed to AWS EC2 auto-scaling groups.`
  },
  {
    name: 'Elena Rostova',
    role: 'Machine Learning Systems Architect',
    text: `Elena Rostova
San Jose, CA | elena.rostova@example.com | github.com/erostova

SUMMARY
Machine Learning Systems Engineer with 4.5 years experience scaling GPU clusters, containerized model inference, and distributed training pipelines.

TECHNICAL SKILLS
Python, C++, PyTorch, Ray, CUDA, Triton Inference Server, vLLM, Kubernetes, Docker, PostgreSQL, Redis, GCP.

WORK EXPERIENCE
ML Systems Engineer | HyperScale AI (2021 - Present)
- Deployed high-throughput LLM inference pods on Kubernetes handling 12k concurrent users.
- Automated GPU cluster utilization using Ray and Docker containerization.`
  }
];

function FilterPill({ label, activeFilter, onSelect }) {
  const isActive = activeFilter === label;
  return (
    <button 
      onClick={() => onSelect(label)}
      className={`px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
        isActive 
          ? 'bg-[#7DD3FC] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5' 
          : 'bg-white/90 text-black hover:bg-[#E0F2FE] shadow-[2px_2px_0px_0px_#000]'
      }`}
    >
      {label}
    </button>
  );
}

export default function Dashboard({ resumeText, setResumeText, onAskAI, onNavigate }) {
  const [opportunities, setOpportunities] = useState(SAMPLE_OPPORTUNITIES);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Everything');
  const [taskFilter, setTaskFilter] = useState('ALL TASKS');
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByMatch, setSortByMatch] = useState(true);
  
  // Resume Edit / Upload Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingText, setEditingText] = useState(resumeText || '');
  const [uploadSuccessToast, setUploadSuccessToast] = useState('');
  const fileInputRef = useRef(null);

  // Extract candidate profile from resumeText
  const profile = useMemo(() => {
    return extractResumeProfile(resumeText);
  }, [resumeText]);

  // Synchronize initial sample opportunities with dynamic resume scoring
  useEffect(() => {
    const scored = SAMPLE_OPPORTUNITIES.map(opp => {
      const match = calculateOpportunityMatch(resumeText, opp);
      return {
        ...opp,
        matchScore: match.matchScore,
        matchingSkills: match.matchingSkills,
        aiMatchReason: match.matchReason
      };
    });
    setOpportunities(scored);
  }, [resumeText]);

  // Handle file upload (.txt, .md, .pdf, .docx, etc.)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { text, wordCount, error } = await extractTextFromFile(file);
      if (text && text.trim()) {
        if (setResumeText) setResumeText(text);
        setEditingText(text);
        setUploadSuccessToast(`Uploaded ${file.name} (${wordCount} words)! Feed re-ranked.`);
        setTimeout(() => setUploadSuccessToast(''), 3000);
      } else if (error) {
        setUploadSuccessToast(`Warning: ${error}`);
        setTimeout(() => setUploadSuccessToast(''), 4000);
      }
    } catch (err) {
      console.error('File parsing error:', err);
    }
  };

  const handleApplyPreset = (preset) => {
    if (setResumeText) setResumeText(preset.text);
    setEditingText(preset.text);
    setUploadSuccessToast(`Loaded preset for ${preset.name}!`);
    setTimeout(() => setUploadSuccessToast(''), 3000);
  };

  const handleSaveEditedResume = (e) => {
    e.preventDefault();
    if (setResumeText) setResumeText(editingText);
    setShowEditModal(false);
    setUploadSuccessToast('Resume updated! Relevant opportunities refreshed.');
    setTimeout(() => setUploadSuccessToast(''), 3000);
  };

  const handleFilterSelect = (label) => {
    setActiveFilter(label);
    if (label !== 'Everything') {
      setTaskFilter('ALL TASKS');
      setIsTaskDropdownOpen(false);
    }
  };

  // Filter & Sort opportunities
  const filteredOpportunities = useMemo(() => {
    let result = opportunities.filter(opp => {
      // 1. Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesTitle = opp.title?.toLowerCase().includes(q);
        const matchesOrg = opp.organization?.toLowerCase().includes(q);
        const matchesSummary = opp.summary?.toLowerCase().includes(q);
        const matchesCategory = opp.category?.toLowerCase().includes(q);
        const matchesSkills = (opp.matchingSkills || []).some(sk => sk.toLowerCase().includes(q));
        if (!matchesTitle && !matchesOrg && !matchesSummary && !matchesCategory && !matchesSkills) return false;
      }

      // 2. Category Filter (Task Dropdown)
      if (taskFilter !== 'ALL TASKS') {
        const catMap = {
          'Hackathons': 'Hackathon',
          'Internships': 'Internship',
          'Jobs': 'Job',
          'Research paper proposals': 'Research'
        };
        const targetCategory = catMap[taskFilter] || taskFilter;
        if (opp.category !== targetCategory) return false;
      }

      // 3. Grade / Tier Filter Logic
      const grade = opp.grade_level || '';
      const text = `${opp.title} ${opp.summary}`.toLowerCase();

      switch (activeFilter) {
        case 'Everything':
          return true;
        case 'Undergraduate':
          return (
            grade === 'Undergraduate' ||
            text.includes('undergrad') ||
            text.includes('bachelor') ||
            text.includes('student') ||
            text.includes('intern') ||
            text.includes('collegiate') ||
            opp.title.includes('New Grad')
          );
        case 'Graduate / PhD':
          return (
            grade === 'Graduate / PhD' ||
            text.includes('grad') ||
            text.includes('phd') ||
            text.includes('master') ||
            text.includes('research') ||
            text.includes('fellow') ||
            text.includes('postdoc') ||
            opp.category === 'Research'
          );
        case 'Professional':
          return (
            grade === 'Professional' ||
            text.includes('professional') ||
            text.includes('senior') ||
            text.includes('lead') ||
            text.includes('staff') ||
            text.includes('enterprise') ||
            text.includes('solutions architect') ||
            opp.category === 'Job'
          );
        default:
          return true;
      }
    });

    if (sortByMatch) {
      result = [...result].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return result;
  }, [opportunities, activeFilter, searchQuery, taskFilter, sortByMatch]);

  return (
    <div className="max-w-6xl mx-auto w-full font-serif text-black space-y-8">
      
      {/* ================= RESUME UPLOAD & PROFILE CONTROL CENTER ================= */}
      <div className="bg-[#BAE6FD] border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-black text-[#7DD3FC] border-2 border-black text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7DD3FC]" /> Active Resume Profile
              </span>
              <span className="px-2.5 py-1 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                {profile.allSkills.length} Detected Skills
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-black leading-tight">
                {profile.name} — <span className="text-black/80">{profile.title}</span>
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/70 mt-1 max-w-2xl leading-relaxed">
                Your personalized feed is dynamically ranked based on your extracted resume skills. 
                Upload or edit your resume below to adjust match rankings in real-time.
              </p>
            </div>

            {/* Extracted Skills Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.allSkills.slice(0, 10).map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]"
                >
                  {sk}
                </span>
              ))}
              {profile.allSkills.length > 10 && (
                <span className="text-xs font-black uppercase text-black/70 self-center px-1">
                  +{profile.allSkills.length - 10} more
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons for Resume */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".txt,.md,.pdf,.docx,.doc" 
              className="hidden" 
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black font-black uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[3]" />
              Upload Resume
            </button>

            <button
              onClick={() => {
                setEditingText(resumeText || '');
                setShowEditModal(true);
              }}
              className="px-4 py-2.5 bg-white hover:bg-[#F0F9FF] text-black border-2 border-black font-black uppercase tracking-wider text-xs shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Edit / Paste Resume
            </button>

            {/* Quick Switch Preset Dropdown */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-black uppercase text-black/70">Presets:</span>
              {RESUME_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  title={`Switch to ${p.name}`}
                  className="px-2 py-0.5 bg-[#E0F2FE] hover:bg-black hover:text-[#7DD3FC] text-black border border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000] cursor-pointer transition-colors"
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

        </div>

        {uploadSuccessToast && (
          <div className="mt-4 p-3 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-xs font-black uppercase flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" />
            {uploadSuccessToast}
          </div>
        )}
      </div>

      {/* ================= FEED HEADER & FILTER BAR ================= */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b-4 border-black pb-6">
        <div>
          <div className="inline-block bg-[#BAE6FD] border-2 border-black px-3 py-0.5 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000] mb-2">
            Curated Stream ({filteredOpportunities.length} Available)
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase leading-none">
            Personalized Feed
          </h1>
          <p className="text-black/70 text-xs sm:text-sm font-bold mt-1">
            Handpicked opportunities matched to your unique profile skills.
          </p>
        </div>

        {/* Brutalist Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 self-start">
          <FilterPill label="Everything" activeFilter={activeFilter} onSelect={handleFilterSelect} />
          <FilterPill label="Undergraduate" activeFilter={activeFilter} onSelect={handleFilterSelect} />
          <FilterPill label="Graduate / PhD" activeFilter={activeFilter} onSelect={handleFilterSelect} />
          <FilterPill label="Professional" activeFilter={activeFilter} onSelect={handleFilterSelect} />
          
          {/* Best Match First Toggle */}
          <button
            onClick={() => setSortByMatch(!sortByMatch)}
            className={`px-3 py-2 text-xs font-black uppercase tracking-wider border-2 border-black cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] transition-all ${
              sortByMatch 
                ? 'bg-[#93C5FD] text-black -translate-y-0.5' 
                : 'bg-white text-black hover:bg-[#F0F9FF]'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5]" />
            {sortByMatch ? 'Best Matches First' : 'Default Order'}
          </button>
        </div>
      </div>

      {/* ================= SEARCH & CATEGORY ROW ================= */}
      <div className="relative flex items-center w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-black" />
        </div>
        
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH BY ROLE, TECH SKILLS, SPONSOR, OR TOPIC..." 
          className="w-full py-4 pl-12 pr-48 text-black bg-white/95 border-3 border-black shadow-[5px_5px_0px_0px_#000] focus:shadow-[7px_7px_0px_0px_#000] focus:outline-none transition-all font-bold placeholder:text-black/40 text-xs sm:text-sm uppercase"
        />

        {/* Category Dropdown inside search bar */}
        <div className="absolute inset-y-0 right-3 flex items-center z-10">
          <button 
            onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#BAE6FD] hover:bg-[#7DD3FC] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-black text-black transition-colors uppercase cursor-pointer"
          >
            {taskFilter}
            <ChevronDown className="w-4 h-4 text-black" />
          </button>
          
          {/* Dropdown Menu */}
          {isTaskDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] py-2 z-50">
              {['ALL TASKS', 'Hackathons', 'Internships', 'Jobs', 'Research paper proposals'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setTaskFilter(option);
                    setIsTaskDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    taskFilter === option 
                      ? 'bg-[#BAE6FD] text-black border-y-2 border-black' 
                      : 'text-black hover:bg-[#F0F9FF]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= OPPORTUNITIES GRID ================= */}
      {filteredOpportunities.length === 0 ? (
        <div className="text-center py-20 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] p-8 space-y-3">
          <h3 className="text-2xl font-black uppercase text-black">No Opportunities Found</h3>
          <p className="text-black/70 font-bold text-xs sm:text-sm">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard 
              key={opp.id} 
              opportunity={opp} 
              onAskAI={() => onAskAI(opp)} 
            />
          ))}
        </div>
      )}

      {/* ================= EDIT / PASTE RESUME MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000] w-full max-w-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-3 border-black pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-black" />
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Update Candidate Resume Text
                </h3>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 bg-white hover:bg-[#BAE6FD] border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <p className="text-xs font-bold text-black/70 leading-relaxed">
              Paste your raw resume, work experiences, and skill sets. Career Ladder will immediately re-extract your technical skills and recalibrate opportunity relevance scores.
            </p>

            <form onSubmit={handleSaveEditedResume} className="space-y-4">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                rows={12}
                placeholder="Paste resume text here..."
                className="w-full p-4 bg-[#F0F9FF] border-2 border-black text-xs font-bold text-black focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition leading-relaxed"
                required
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 bg-white hover:bg-[#E0F2FE] border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  Save & Recalibrate Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
