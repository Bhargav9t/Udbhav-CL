import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import OpportunityCard from './OpportunityCard';
import { supabase, isSupabaseConfigured } from '../lib/auth';
import { analyzeResumeAndOpportunities } from '../lib/ai';

const SAMPLE_OPPORTUNITIES = [
  {
    id: 'sample-1',
    title: 'HackMIT 2026',
    organization: 'MIT',
    category: 'Hackathon',
    opportunity_link: 'https://hackmit.org',
    deadline: 'Applications close Oct 15',
    summary: 'Join 1,000+ top hackers from across the globe at MIT for a 36-hour weekend of hacking, mentorship, and building world-changing applications.',
    aiMatchReason: '✨ Perfect for strengthening your full-stack development and team collaboration skills!'
  },
  {
    id: 'sample-2',
    title: 'Software Engineering Intern (Summer 2026)',
    organization: 'Google',
    category: 'Internship',
    opportunity_link: 'https://careers.google.com',
    deadline: 'Rolling admissions',
    summary: 'Build scalable distributed systems, work with industry-leading mentors, and solve complex algorithms using Python, Go, and cloud platforms.',
    aiMatchReason: '🎯 Strong match with your backend programming experience and data structure foundation.'
  },
  {
    id: 'sample-3',
    title: 'Generative AI Research Fellow',
    organization: 'NSF REU Site',
    category: 'Research',
    opportunity_link: 'https://nsf.gov',
    deadline: 'Nov 30',
    summary: 'Engage in cutting-edge multimodal deep learning research, contributing to high-impact papers and working alongside leading faculty.',
    aiMatchReason: '🚀 Excellent opportunity to deepen your machine learning background and publication profile.'
  },
  {
    id: 'sample-4',
    title: 'Full Stack AI Engineer',
    organization: 'Frontier AI Labs',
    category: 'Job',
    opportunity_link: 'https://careerladder.dev',
    deadline: 'Immediate',
    summary: 'Design and deploy state-of-the-art LLM-powered interfaces, high-performance APIs, and next-generation developer tooling.',
    aiMatchReason: '🔥 Direct match for your React and AI integration capabilities.'
  }
];

function FilterPill({ label, activeFilter, onSelect }) {
  const isActive = activeFilter === label;
  return (
    <button 
      onClick={() => onSelect(label)}
      className={`px-5 py-2 text-sm whitespace-nowrap transition-all rounded-full ${
        isActive 
          ? 'font-bold text-gray-900 bg-white shadow-sm active:scale-95' 
          : 'font-semibold text-gray-500 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

export default function Dashboard({ resumeText, onAskAI }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Everything');
  const [taskFilter, setTaskFilter] = useState('ALL TASKS');
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let ignore = false;
    const fetchOpportunities = async () => {
      if (!isSupabaseConfigured) {
        let sampleData = SAMPLE_OPPORTUNITIES;
        if (resumeText) {
          sampleData = await analyzeResumeAndOpportunities(resumeText, sampleData);
        }
        if (!ignore) {
          setOpportunities(sampleData);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        let fetchedData = (data && data.length > 0) ? data : SAMPLE_OPPORTUNITIES;
        
        // If we have a resume, analyze the top opportunities
        if (resumeText && fetchedData.length > 0) {
          fetchedData = await analyzeResumeAndOpportunities(resumeText, fetchedData);
        }

        if (!ignore) setOpportunities(fetchedData);
      } catch (err) {
        console.warn('Opportunities fetch fallback:', err.message);
        if (!ignore) setOpportunities(SAMPLE_OPPORTUNITIES);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchOpportunities();
    return () => { ignore = true; };
  }, [resumeText]);

  const handleFilterSelect = (label) => {
    setActiveFilter(label);
    if (label !== 'Everything') {
      setTaskFilter('ALL TASKS');
      setIsTaskDropdownOpen(false);
    }
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // 1. Search Query Filter
      const matchesSearch = 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Category Filter (Task Dropdown) - ONLY apply if in 'Everything' tab
      if (activeFilter === 'Everything' && taskFilter !== 'ALL TASKS') {
        const catMap = {
          'Hackathons': 'Hackathon',
          'Internships': 'Internship',
          'Jobs': 'Job',
          'Research paper proposals': 'Research'
        };
        const targetCategory = catMap[taskFilter] || taskFilter;
        if (opp.category !== targetCategory) return false;
      }

      // 3. Grade Filter Logic (Since we don't have a native DB column, we check keywords in title or default to broad categories)
      const titleLower = opp.title.toLowerCase();
      const summaryLower = opp.summary ? opp.summary.toLowerCase() : '';
      const contentStr = titleLower + " " + summaryLower;

      switch (activeFilter) {
        case 'Everything':
          return true;
        case 'Undergraduate':
          return contentStr.includes('undergrad') || contentStr.includes('bachelor') || contentStr.includes('student') || contentStr.includes('intern');
        case 'Graduate / PhD':
          return contentStr.includes('grad') || contentStr.includes('phd') || contentStr.includes('master') || contentStr.includes('research');
        case 'Professional':
          return contentStr.includes('professional') || contentStr.includes('senior') || contentStr.includes('lead') || opp.category === 'Job';
        default:
          return true;
      }
    });
  }, [opportunities, activeFilter, searchQuery, taskFilter]);

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Top Header Row: Title & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        
        {/* Title Area */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Personalized Feed
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Curated tasks for your career ladder.
          </p>
        </div>

        {/* Pill-shaped Filter Bar */}
        <div className="flex bg-gray-100 p-1.5 rounded-full self-start shadow-inner border border-gray-200/60 overflow-x-auto max-w-full">
          <FilterPill label="Everything" activeFilter={activeFilter} onSelect={handleFilterSelect} />
          <FilterPill label="Undergraduate" activeFilter={activeFilter} onSelect={handleFilterSelect} />
          <FilterPill label="Graduate / PhD" activeFilter={activeFilter} onSelect={handleFilterSelect} />
          <FilterPill label="Professional" activeFilter={activeFilter} onSelect={handleFilterSelect} />
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="relative flex items-center w-full mb-10">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search opportunities, roles, or skills..." 
          className="w-full py-4 pl-12 pr-32 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium placeholder-gray-400 shadow-sm"
        />

        {/* 'ALL TASKS' Filter Button inside the search bar */}
        {activeFilter === 'Everything' && (
          <div className="absolute inset-y-0 right-2 flex items-center relative z-10">
            <button 
              onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase"
            >
              {taskFilter}
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {/* Dropdown Menu */}
            {isTaskDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                {['ALL TASKS', 'Hackathons', 'Internships', 'Jobs', 'Research paper proposals'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setTaskFilter(option);
                      setIsTaskDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                      taskFilter === option ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid rendering the cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-gray-500 animate-pulse font-medium">Loading your opportunities...</div>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No opportunities found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} onAskAI={() => onAskAI(opp)} />
          ))}
        </div>
      )}
    </div>
  );
}
