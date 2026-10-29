import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Brain, 
  Briefcase, RefreshCw, FileText, Zap, ShieldAlert, BookOpen,
  Target, Award, Star, Lock, Check, Flame, Heart, Trophy, 
  ChevronRight, Building2, MapPin, DollarSign, Layers
} from 'lucide-react';
import { 
  extractResumeProfile, 
  TARGET_JOB_PRESETS, 
  generateDuolingoRoadmap 
} from '../lib/skillExtractor';

export default function JobMatcher({ resumeText: initialResumeText }) {
  const [resumeText, setResumeText] = useState(initialResumeText || '');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customCompany, setCustomCompany] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customJobDesc, setCustomJobDesc] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // Custom added skill input
  const [extraSkills, setExtraSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Active evaluation & roadmap state
  const [roadmap, setRoadmap] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Duolingo interactive progress state
  const [completedNodes, setCompletedNodes] = useState(['u1-node-1']);
  const [userXp, setUserXp] = useState(380);
  const [activeNodeModal, setActiveNodeModal] = useState(null);
  const [celebrationToast, setCelebrationToast] = useState('');

  // Extract candidate profile from resume
  const profile = useMemo(() => {
    const p = extractResumeProfile(resumeText);
    if (extraSkills.length > 0) {
      return {
        ...p,
        allSkills: [...new Set([...p.allSkills, ...extraSkills])]
      };
    }
    return p;
  }, [resumeText, extraSkills]);

  // Current target job
  const currentTargetJob = useMemo(() => {
    if (isCustomMode) {
      return {
        company: customCompany || 'Dream Company',
        role: customRole || 'Senior Software Engineer',
        location: 'Remote / Hybrid',
        salary: '$180,000 - $260,000',
        description: customJobDesc || 'Custom technical engineering role.',
        requiredSkills: ['Distributed Systems', 'Python', 'Kubernetes', 'Docker', 'PostgreSQL'],
        preferredSkills: ['gRPC', 'Ray', 'OpenTelemetry', 'Kafka'],
        experienceRequired: '4+ years'
      };
    }
    return TARGET_JOB_PRESETS[selectedPresetIndex] || TARGET_JOB_PRESETS[0];
  }, [isCustomMode, selectedPresetIndex, customCompany, customRole, customJobDesc]);

  // Initial evaluation on mount or preset switch
  useEffect(() => {
    if (resumeText) {
      const generated = generateDuolingoRoadmap(resumeText, currentTargetJob);
      setRoadmap(generated);
    }
  }, [resumeText, currentTargetJob]);

  // Trigger evaluation
  const handleRunEvaluation = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const generated = generateDuolingoRoadmap(resumeText, currentTargetJob);
      setRoadmap(generated);
      setAnalyzing(false);
      setCelebrationToast(`Evaluated against ${currentTargetJob.company}! Duolingo roadmap updated.`);
      setTimeout(() => setCelebrationToast(''), 4000);
    }, 400);
  };

  const handleAddExtraSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    setExtraSkills(prev => [...prev, newSkillInput.trim()]);
    setNewSkillInput('');
  };

  const handleToggleNodeCompletion = (node) => {
    const isCompleted = completedNodes.includes(node.id);
    if (isCompleted) {
      setCompletedNodes(prev => prev.filter(id => id !== node.id));
      setUserXp(prev => Math.max(0, prev - node.xp));
    } else {
      setCompletedNodes(prev => [...prev, node.id]);
      setUserXp(prev => prev + node.xp);
      setCelebrationToast(`🎉 Completed "${node.title}"! +${node.xp} XP earned!`);
      setTimeout(() => setCelebrationToast(''), 3500);
    }
    setActiveNodeModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16 font-serif text-black">
      
      {/* ================= HERO HEADER ================= */}
      <div className="bg-[#BAE6FD] border-4 border-black p-8 text-black shadow-[8px_8px_0px_0px_#000]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#7DD3FC] border-2 border-black text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5 text-[#7DD3FC]" />
              AI Job Matcher & Gamified Learning Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black leading-tight">
              Resume-to-Role Matcher & Duolingo Roadmap
            </h1>
            <p className="text-black/80 font-bold max-w-2xl text-xs sm:text-sm leading-relaxed">
              Compare your extracted resume skills against top engineering roles (e.g., Google, OpenAI, Stripe). 
              Receive a comprehensive skill alignment matrix, gap diagnostic, and a gamified Duolingo learning path.
            </p>
          </div>

          {/* Gamification Stats Pill Header */}
          <div className="bg-white border-3 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>4 Day Streak</span>
            </div>
            <div className="h-5 w-0.5 bg-black"></div>
            <div className="flex items-center gap-1.5 font-black text-xs uppercase">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{userXp} XP</span>
            </div>
            <div className="h-5 w-0.5 bg-black"></div>
            <div className="flex items-center gap-1.5 font-black text-xs uppercase">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>5/5</span>
            </div>
          </div>
        </div>
      </div>

      {celebrationToast && (
        <div className="p-4 bg-[#7DD3FC] border-3 border-black shadow-[4px_4px_0px_0px_#000] text-black text-xs font-black uppercase flex items-center gap-2 animate-bounce">
          <Award className="w-5 h-5 stroke-[2.5]" />
          <span>{celebrationToast}</span>
        </div>
      )}

      {/* ================= DUAL COLUMN INPUT SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Extracted Skills from Resume */}
        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between border-b-3 border-black pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-[#7DD3FC] border border-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                  <FileText className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider">
                    Extracted Resume Skills
                  </h2>
                  <span className="text-[10px] font-bold text-black/60 uppercase">
                    Profile: {profile.name} ({profile.yearsOfExperience}+ yrs exp)
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-[#BAE6FD] border border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                {profile.allSkills.length} Detected
              </span>
            </div>

            {/* Categorized Skills Breakdown */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              
              {/* Languages */}
              {profile.categorizedSkills.languages.length > 0 && (
                <div>
                  <span className="text-[11px] font-black uppercase text-black/60 tracking-wider block mb-1.5">
                    Programming Languages
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.categorizedSkills.languages.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#E0F2FE] border border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Frameworks & AI */}
              {profile.categorizedSkills.frameworks.length > 0 && (
                <div>
                  <span className="text-[11px] font-black uppercase text-black/60 tracking-wider block mb-1.5">
                    Frameworks & AI Libraries
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.categorizedSkills.frameworks.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#BAE6FD] border border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cloud & DevOps */}
              {profile.categorizedSkills.cloudDevOps.length > 0 && (
                <div>
                  <span className="text-[11px] font-black uppercase text-black/60 tracking-wider block mb-1.5">
                    Cloud Infrastructure & DevOps
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.categorizedSkills.cloudDevOps.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#93C5FD] border border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Databases */}
              {profile.categorizedSkills.databases.length > 0 && (
                <div>
                  <span className="text-[11px] font-black uppercase text-black/60 tracking-wider block mb-1.5">
                    Databases & Vector Stores
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.categorizedSkills.databases.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-[#E0F2FE] border border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra user-added skills */}
              {extraSkills.length > 0 && (
                <div>
                  <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider block mb-1.5">
                    Manually Added Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {extraSkills.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-emerald-100 border border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Quick add custom skill input */}
            <form onSubmit={handleAddExtraSkill} className="flex gap-2 pt-2 border-t border-black/20">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add another skill (e.g. gRPC, Kafka)..."
                className="flex-1 px-3 py-2 bg-[#F0F9FF] border-2 border-black text-xs font-bold text-black focus:outline-none focus:shadow-[2px_2px_0px_0px_#000]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              >
                + Add
              </button>
            </form>

          </div>

          <div className="text-[11px] font-bold text-black/60 pt-2 border-t-2 border-black">
            💡 Extracted automatically from your active resume. Upload a new resume in the main feed to update this skill list.
          </div>
        </div>

        {/* RIGHT COLUMN: The Job You Wanna Do */}
        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between border-b-3 border-black pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-[#7DD3FC] border border-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                  <Building2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider">
                    Target Role You Want To Do
                  </h2>
                  <span className="text-[10px] font-bold text-black/60 uppercase">
                    Select a tech titan or configure a custom position
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-[#BAE6FD] border border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                {currentTargetJob.company}
              </span>
            </div>

            {/* Company Preset Buttons */}
            <div>
              <span className="text-[11px] font-black uppercase text-black/60 tracking-wider block mb-2">
                Quick Select Company Preset:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TARGET_JOB_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.company}
                    type="button"
                    onClick={() => {
                      setSelectedPresetIndex(idx);
                      setIsCustomMode(false);
                    }}
                    className={`py-2 px-2.5 text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer truncate ${
                      !isCustomMode && selectedPresetIndex === idx
                        ? 'bg-[#7DD3FC] text-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                        : 'bg-white text-black hover:bg-[#F0F9FF] shadow-[1px_1px_0px_0px_#000]'
                    }`}
                  >
                    🏢 {preset.company}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Role Card Details */}
            <div className="p-4 bg-[#F0F9FF] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-black uppercase text-black">
                    {currentTargetJob.role}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-black/80 font-bold mt-0.5">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> {currentTargetJob.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {currentTargetJob.location}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black px-2 py-0.5 bg-[#BAE6FD] border border-black shadow-[1px_1px_0px_0px_#000] shrink-0">
                  {currentTargetJob.salary}
                </span>
              </div>

              <p className="text-xs font-bold text-black/80 line-clamp-3 leading-relaxed">
                {currentTargetJob.description}
              </p>

              <div>
                <span className="text-[10px] font-black uppercase text-black/60 block mb-1">
                  Required Competencies:
                </span>
                <div className="flex flex-wrap gap-1">
                  {(currentTargetJob.requiredSkills || []).map((sk, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white border border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Primary Evaluate & Generate Roadmap CTA */}
          <button
            onClick={handleRunEvaluation}
            disabled={analyzing}
            className="w-full py-3.5 px-4 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <span className="animate-pulse">EVALUATING FIT & COMPILING ROADMAP...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>EVALUATE FIT & GENERATE DUOLINGO ROADMAP</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* ================= EVALUATION RESULTS ================= */}
      {roadmap && (
        <div className="space-y-10 pt-4">
          
          {/* 1. TOP MATCH SCORE & EXECUTIVE SUMMARY */}
          <div className="bg-[#BAE6FD] border-4 border-black p-8 text-black shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-[#7DD3FC] border-2 border-black text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
                <Target className="w-3.5 h-3.5" /> Target Evaluation: {roadmap.targetJob.company}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
                {roadmap.matchScore >= 80 ? '🔥 Highly Competitive Candidate' : '✨ Strong Potential with Clear Gaps'}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/80 max-w-2xl leading-relaxed">
                Matches {roadmap.matchedSkills.length} core competencies for the {roadmap.targetJob.role} role at {roadmap.targetJob.company}. 
                Follow the customized Duolingo roadmap below to bridge {roadmap.missingSkills.length} critical requirement gaps.
              </p>
            </div>

            <div className="bg-white border-3 border-black p-5 shadow-[4px_4px_0px_0px_#000] text-center shrink-0 min-w-[160px]">
              <span className="text-[10px] uppercase font-black tracking-widest text-black/60 block">
                Overall Alignment
              </span>
              <span className="text-5xl font-black text-black leading-none block my-1">
                {roadmap.matchScore}%
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#BAE6FD] border border-black shadow-[1px_1px_0px_0px_#000] inline-block">
                {roadmap.matchScore >= 80 ? 'Interview Ready' : 'Upskilling Needed'}
              </span>
            </div>
          </div>

          {/* 2. SKILL ALIGNMENT MATRIX */}
          <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-3 border-black pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase tracking-wider">
                  Skill Alignment Matrix
                </h3>
              </div>
              <span className="text-xs font-black uppercase text-black/60">
                Target: {roadmap.targetJob.company}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-serif">
                <thead>
                  <tr className="border-b-2 border-black uppercase font-black text-black">
                    <th className="py-2.5">Competency / Skill</th>
                    <th className="py-2.5">Target Expectation</th>
                    <th className="py-2.5">Candidate Evidence</th>
                    <th className="py-2.5 text-right">Alignment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black text-black">
                  {roadmap.alignmentMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F0F9FF] transition-colors">
                      <td className="py-3 font-black uppercase text-xs">{item.skill}</td>
                      <td className="py-3 font-bold text-black/70">{item.targetExpectation}</td>
                      <td className="py-3 font-bold">{item.candidateLevel}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase border-2 border-black shadow-[1px_1px_0px_0px_#000] ${item.badgeColor}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3 & 4. PARTIALLY MATCHED & MISSING REQUIREMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Partially Matched Skills */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2 text-black">
                <AlertTriangle className="w-5 h-5 text-amber-600 stroke-[2.5]" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Partially Matched Skills (Upgrade Needed)
                </h3>
              </div>

              {roadmap.partiallyMatched.length === 0 ? (
                <p className="text-xs font-bold text-black/70">No partial matches — all required foundations are either fully matched or missing.</p>
              ) : (
                <div className="space-y-3">
                  {roadmap.partiallyMatched.map((p, idx) => (
                    <div key={idx} className="p-3.5 bg-[#FEF08A]/40 border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs uppercase">{p.skill}</span>
                        <span className="text-[10px] font-black uppercase bg-[#FEF08A] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                          Partial Fit
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-black/80">{p.currentBasis}</p>
                      <p className="text-xs font-bold text-black leading-relaxed">
                        <strong>Action:</strong> {p.gapNotes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills & Requirements */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2 text-black">
                <ShieldAlert className="w-5 h-5 text-rose-600 stroke-[2.5]" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Missing Skills & Requirements (Gaps)
                </h3>
              </div>

              {roadmap.missingSkills.length === 0 ? (
                <p className="text-xs font-bold text-black/70">No missing skills detected! You meet all mandatory qualifications.</p>
              ) : (
                <div className="space-y-3">
                  {roadmap.missingSkills.slice(0, 4).map((m, idx) => (
                    <div key={idx} className="p-3.5 bg-[#FECDD3]/40 border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs uppercase text-rose-900">{m.skill}</span>
                        <span className="text-[10px] font-black uppercase bg-[#FECDD3] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                          {m.priority}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-black leading-relaxed">
                        {m.impact}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* 5. TOP SKILLS TO FOCUS ON */}
          <div className="bg-[#BAE6FD] border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-5 h-5" /> Top Skills To Focus On
              </h3>
              <span className="text-xs font-black uppercase bg-white border border-black px-2.5 py-0.5 shadow-[1px_1px_0px_0px_#000]">
                Ranked by Hiring Impact
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {roadmap.topFocusSkills.map((focus, idx) => (
                <div key={idx} className="bg-white border-3 border-black p-5 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase px-2 py-0.5 bg-black text-[#7DD3FC] border border-black shadow-[1px_1px_0px_0px_#000]">
                        #{idx + 1} Priority
                      </span>
                      <span className="text-[10px] font-black uppercase text-black/60">
                        {focus.timeEstimate}
                      </span>
                    </div>

                    <h4 className="text-base font-black uppercase text-black">
                      {focus.name}
                    </h4>

                    <p className="text-xs font-bold text-black/80 leading-relaxed">
                      {focus.reason}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-black/20 text-[10px] font-black uppercase text-black flex items-center gap-1">
                    <span>Target: {roadmap.targetJob.company} L5 Readiness</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. GAMIFIED DUOLINGO LEARNING PATH */}
          <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000] space-y-10">
            
            {/* Duolingo Board Header */}
            <div className="text-center space-y-2 border-b-4 border-black pb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#7DD3FC] text-black border-2 border-black text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#000]">
                <Award className="w-4 h-4 stroke-[2.5]" /> Interactive Duolingo Action Roadmap
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
                Path to {roadmap.targetJob.company} {roadmap.targetJob.role.split(' ')[0]}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/70 max-w-xl mx-auto leading-relaxed">
                Click any stepping stone node to inspect lesson milestones, practice concrete action items, 
                and earn XP to advance through units.
              </p>
            </div>

            {/* Units & Winding Path */}
            <div className="space-y-12 max-w-2xl mx-auto">
              {roadmap.units.map((unit) => (
                <div key={unit.unitNumber} className="space-y-6">
                  
                  {/* Unit Banner */}
                  <div 
                    className="p-5 border-4 border-black shadow-[6px_6px_0px_0px_#000] space-y-1 text-black"
                    style={{ backgroundColor: unit.themeColor }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-2.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                        Unit {unit.unitNumber}
                      </span>
                      <span className="text-xs font-black uppercase">
                        {unit.nodes.filter(n => completedNodes.includes(n.id)).length} / {unit.nodes.length} Completed
                      </span>
                    </div>
                    <h3 className="text-xl font-black uppercase text-black">
                      {unit.title}
                    </h3>
                    <p className="text-xs font-bold text-black/80">
                      {unit.description}
                    </p>
                  </div>

                  {/* Winding Stepping Stone Nodes */}
                  <div className="flex flex-col items-center space-y-8 py-4 relative">
                    
                    {/* Connecting dotted centerline */}
                    <div className="absolute top-4 bottom-4 w-1 border-r-2 border-dashed border-black/40 z-0"></div>

                    {unit.nodes.map((node, nodeIdx) => {
                      const isCompleted = completedNodes.includes(node.id);
                      const isCurrent = !isCompleted && (nodeIdx === 0 || completedNodes.includes(unit.nodes[nodeIdx - 1]?.id));

                      // Winding offset pattern: center -> left -> right -> center
                      const offsetClasses = [
                        'self-center',
                        'self-start ml-4 sm:ml-12',
                        'self-end mr-4 sm:mr-12'
                      ][nodeIdx % 3];

                      return (
                        <div key={node.id} className={`flex flex-col items-center z-10 ${offsetClasses}`}>
                          
                          {/* Stepping Stone Node Button */}
                          <button
                            type="button"
                            onClick={() => setActiveNodeModal(node)}
                            className={`w-20 h-20 rounded-full border-4 border-black flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                              isCompleted
                                ? 'bg-[#86EFAC] text-black shadow-[4px_4px_0px_0px_#000] hover:scale-105 active:translate-y-1'
                                : isCurrent
                                ? 'bg-[#7DD3FC] text-black shadow-[6px_6px_0px_0px_#000] scale-110 animate-bounce active:translate-y-1'
                                : 'bg-[#E2E8F0] text-black/40 shadow-[3px_3px_0px_0px_#000] hover:scale-100'
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-8 h-8 stroke-[3.5] text-black" />
                            ) : isCurrent ? (
                              <Star className="w-8 h-8 text-black fill-black" />
                            ) : (
                              <Lock className="w-6 h-6 text-black/40" />
                            )}

                            {/* Node XP indicator pill */}
                            <span className="absolute -bottom-2 px-2 py-0.5 bg-black text-[#7DD3FC] border border-black text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                              +{node.xp} XP
                            </span>
                          </button>

                          {/* Node Title & Subtitle Badge */}
                          <div className="text-center mt-3 max-w-[200px]">
                            <span className="text-xs font-black uppercase text-black block leading-tight">
                              {node.title}
                            </span>
                            <span className="text-[10px] font-bold text-black/60 truncate block mt-0.5">
                              {node.subtitle}
                            </span>
                          </div>

                        </div>
                      );
                    })}

                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ================= ACTIVE NODE DETAIL MODAL ================= */}
      {activeNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000] w-full max-w-lg p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b-3 border-black pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-black" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
                    Duolingo Milestone
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-black">
                    {activeNodeModal.title}
                  </h3>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-[#BAE6FD] border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                +{activeNodeModal.xp} XP
              </span>
            </div>

            <div className="space-y-3 bg-[#F0F9FF] p-4 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
              <span className="text-xs font-black uppercase text-black block tracking-wider">
                Actionable Engineering Task:
              </span>
              <p className="text-xs font-bold text-black leading-relaxed">
                {activeNodeModal.actionItem}
              </p>
            </div>

            <div className="text-xs font-bold text-black/70">
              Complete this hands-on engineering lab or code scenario to unlock the next stepping stone on your roadmap toward {currentTargetJob.company}.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setActiveNodeModal(null)}
                className="px-5 py-2.5 bg-white hover:bg-[#E0F2FE] border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleToggleNodeCompletion(activeNodeModal)}
                className={`px-6 py-2.5 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 ${
                  completedNodes.includes(activeNodeModal.id)
                    ? 'bg-[#FECDD3] text-black hover:bg-rose-300'
                    : 'bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {completedNodes.includes(activeNodeModal.id) ? 'Mark Incomplete' : 'Complete Lesson & Claim XP'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
