import React, { useState, useRef } from 'react';
import { 
  Target, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Brain, 
  Briefcase, FileText, Zap, ShieldAlert, BookOpen, Clock, Code, Award, 
  Check, Layers, ChevronRight, Upload, Trash2, Eye, Compass, Lightbulb, 
  RefreshCw, CheckCircle, HelpCircle, AlertCircle, Copy
} from 'lucide-react';
import { analyzeSkillGapDetailed } from '../lib/ai';
import { extractTextFromFile, formatFileSize } from '../lib/fileParser';

// Sample presets for quick testing
const SAMPLE_RESUME = `Aadarsh Kumar
Senior Full-Stack & Machine Learning Engineer
Email: aadarsh@example.com | GitHub: github.com/aadarsh | San Francisco, CA

PROFESSIONAL SUMMARY
Dynamic Software Engineer with 4+ years of experience crafting high-throughput web applications and AI agents. Specialist in Python, React, PyTorch, Node.js, and PostgreSQL.

TECHNICAL SKILLS
- Programming Languages: Python, JavaScript, TypeScript, SQL, C++
- AI / ML Frameworks: PyTorch, TensorFlow, Hugging Face Transformers, LangChain, Scikit-learn
- Web & Backend: React.js, FastAPI, Node.js, Express, Tailwind CSS, REST & GraphQL APIs
- Databases & Cloud: PostgreSQL, Supabase, Redis, AWS (S3, EC2 basic deployment), Docker, Git

EXPERIENCE
Software Engineer | Tech Corp (2022 - Present)
- Architected REST microservices in Python & FastAPI serving 500k daily requests.
- Trained custom transformer models using PyTorch for automated document categorization.
- Developed real-time collaborative frontend dashboards using React and WebSockets.
- Managed PostgreSQL database queries and indexing for user activity tracking.

Junior Engineer | DataSprint Labs (2020 - 2022)
- Built internal analytics dashboards with React and Express.
- Containerized development environments using Docker.

EDUCATION
B.S. in Computer Science | UC Irvine (2016 - 2020)`;

const SAMPLE_JOB = `Senior AI Solutions Architect & Backend Engineer
Company: Apex AI Labs
Location: Remote / San Francisco, CA

JOB SUMMARY:
Apex AI Labs is seeking a Senior AI Backend Engineer to architect next-generation agentic workflows and LLM deployment pipelines.

REQUIRED QUALIFICATIONS:
- 4+ years building backend microservices in Python (FastAPI or Django) and Node.js.
- Strong hands-on foundation in Deep Learning Frameworks (PyTorch or TensorFlow).
- Experience with Relational Database design & query optimization (PostgreSQL / SQL).
- Production experience containerizing and orchestrating services with Docker and Kubernetes (K8s).
- Cloud Infrastructure expertise on AWS (ECS, Lambda, S3, CloudWatch).
- Familiarity with Modern Frontend Web UI (React).

PREFERRED / BONUS QUALIFICATIONS:
- Hands-on experience with Vector Databases (Pinecone, Weaviate, or pgvector).
- Experience with Distributed Systems, Redis caching, and Terraform Infrastructure as Code (IaC).
- Prior contributions to open-source LLM or Agent frameworks.`;

export default function JobMatcher({ resumeText: savedResumeText }) {
  // Input states
  const [resumeText, setResumeText] = useState(savedResumeText || SAMPLE_RESUME);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB);
  
  // File upload states
  const [resumeFileName, setResumeFileName] = useState('');
  const [jobFileName, setJobFileName] = useState('');
  const [isProcessingResumeFile, setIsProcessingResumeFile] = useState(false);
  const [isProcessingJobFile, setIsProcessingJobFile] = useState(false);

  // Analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSkillTab, setActiveSkillTab] = useState('all'); // 'all' | 'matched' | 'partial' | 'missing'
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);

  const resumeInputRef = useRef(null);
  const jobInputRef = useRef(null);

  // Resume File Upload
  const handleResumeFileUpload = async (file) => {
    if (!file) return;
    setIsProcessingResumeFile(true);
    try {
      const parsed = await extractTextFromFile(file);
      if (parsed.text && parsed.text.trim()) {
        setResumeText(parsed.text.trim());
        setResumeFileName(file.name);
      } else {
        setErrorMessage(`Could not extract readable text from ${file.name}.`);
      }
    } catch (err) {
      setErrorMessage(`Error parsing resume file: ${err.message}`);
    } finally {
      setIsProcessingResumeFile(false);
    }
  };

  // Job Description File Upload
  const handleJobFileUpload = async (file) => {
    if (!file) return;
    setIsProcessingJobFile(true);
    try {
      const parsed = await extractTextFromFile(file);
      if (parsed.text && parsed.text.trim()) {
        setJobDescription(parsed.text.trim());
        setJobFileName(file.name);
      } else {
        setErrorMessage(`Could not extract readable text from ${file.name}.`);
      }
    } catch (err) {
      setErrorMessage(`Error parsing job description file: ${err.message}`);
    } finally {
      setIsProcessingJobFile(false);
    }
  };

  // Load Saved Resume from Global Profile
  const handleUseSavedResume = () => {
    const saved = localStorage.getItem('career_ladder_resume');
    if (saved && saved.trim()) {
      setResumeText(saved.trim());
      setResumeFileName('Synced from Your Profile');
    } else {
      setErrorMessage('No saved profile resume found. Please paste your resume or upload a file.');
    }
  };

  // Run Skill Gap Analysis
  const handleRunSkillGapAnalysis = async () => {
    if (!resumeText.trim()) {
      setErrorMessage('Please provide a candidate resume (paste text or upload file).');
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMessage('Please provide a target job description (paste text or upload file).');
      return;
    }

    setErrorMessage('');
    setAnalyzing(true);
    setMatchResult(null);

    try {
      const result = await analyzeSkillGapDetailed(resumeText, jobDescription);
      setMatchResult(result);
    } catch (err) {
      console.error("AI Skill Gap Analysis error:", err);
      setErrorMessage(err.message || "Failed to generate AI analysis. Please check your Groq API key or try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Copy sample bullet point helper
  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  // Priority color styling helper
  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'critical') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (p === 'high') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (p === 'medium') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* ========================================================================= */}
      {/* Header Banner                                                             */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Skill Gap Analysis Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Targeted Resume vs. Job Description Intelligence
            </h1>
            <p className="mt-2 text-indigo-200/90 text-xs sm:text-sm leading-relaxed">
              Upload your resume and the target role requirements. Our AI compares every requirement against your actual experience, identifying matched skills, partially matched competencies, critical gaps, and an exact step-by-step roadmap to qualify.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => {
                setResumeText(SAMPLE_RESUME);
                setJobDescription(SAMPLE_JOB);
                setResumeFileName('Sample Resume');
                setJobFileName('Sample Job Description');
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Load Sample Pair
            </button>
            <button
              onClick={handleUseSavedResume}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-xs border border-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              Use Profile Resume
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Upload & Input Section: Resume + Job Description                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Resume Input */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Candidate Resume
              {resumeFileName && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold truncate max-w-[160px]">
                  {resumeFileName}
                </span>
              )}
            </label>

            <div className="flex items-center gap-2">
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => handleResumeFileUpload(e.target.files?.[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={isProcessingResumeFile}
                className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                {isProcessingResumeFile ? 'Parsing...' : 'Upload File'}
              </button>
            </div>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste candidate resume text or click Upload File (PDF, DOCX, TXT)..."
            rows={10}
            className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 border border-gray-200 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all resize-y leading-relaxed"
          />

          <div className="flex justify-between items-center text-[11px] text-gray-400 px-1">
            <span>{resumeText.trim() ? `${resumeText.trim().split(/\s+/).length} words` : 'Empty'}</span>
            <span className="text-gray-400">PDF, DOCX, TXT supported</span>
          </div>
        </div>

        {/* Right: Job Description Input */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Target Job Description
              {jobFileName && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold truncate max-w-[160px]">
                  {jobFileName}
                </span>
              )}
            </label>

            <div className="flex items-center gap-2">
              <input
                ref={jobInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => handleJobFileUpload(e.target.files?.[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => jobInputRef.current?.click()}
                disabled={isProcessingJobFile}
                className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-purple-50 hover:text-purple-600 text-gray-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3 h-3" />
                {isProcessingJobFile ? 'Parsing...' : 'Upload File'}
              </button>
            </div>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job description and requirements here, or upload JD document..."
            rows={10}
            className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 border border-gray-200 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all resize-y leading-relaxed"
          />

          <div className="flex justify-between items-center text-[11px] text-gray-400 px-1">
            <span>{jobDescription.trim() ? `${jobDescription.trim().split(/\s+/).length} words` : 'Empty'}</span>
            <span className="text-gray-400">Include Required & Preferred skills</span>
          </div>
        </div>

      </div>

      {/* Action CTA Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRunSkillGapAnalysis}
          disabled={analyzing}
          className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-3 disabled:opacity-50 cursor-pointer"
        >
          {analyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Analyzing Requirements & Skill Gaps with Groq AI...</span>
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              <span>Run AI Skill Gap Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* STRUCTURED RESULTS DISPLAY (Rendered into Cards — Never Raw JSON)          */}
      {/* ========================================================================= */}
      {matchResult && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* ===================================================================== */}
          {/* Card 1: Overall Match & Executive Summary                             */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-5">
                {/* Match Score Circular Gauge */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-slate-100 border border-indigo-100 shadow-inner">
                  <div className="text-center">
                    <span className="text-3xl font-black text-indigo-900 tracking-tight">
                      {matchResult.match_score}%
                    </span>
                    <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      Match Score
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Overall Assessment
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      matchResult.match_score >= 80 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : matchResult.match_score >= 60 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-rose-100 text-rose-800'
                    }`}>
                      {matchResult.career_verdict?.readiness || 'Evaluated'}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Candidate Compatibility Profile
                  </h2>
                </div>
              </div>

              {/* Quick Stat Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <span className="block text-base font-bold text-emerald-700">
                    {matchResult.matched_skills?.length || 0}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-800">Matched Skills</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-100 text-center">
                  <span className="block text-base font-bold text-amber-700">
                    {matchResult.partially_matched_skills?.length || 0}
                  </span>
                  <span className="text-[11px] font-medium text-amber-800">Partial Skills</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-100 text-center">
                  <span className="block text-base font-bold text-rose-700">
                    {matchResult.missing_skills?.length || 0}
                  </span>
                  <span className="text-[11px] font-medium text-rose-800">Missing Gaps</span>
                </div>
              </div>
            </div>

            {/* Match Summary Prose */}
            <div className="mt-6 bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Match Analysis Summary
              </h4>
              <p className="text-sm text-gray-800 leading-relaxed font-sans">
                {matchResult.match_summary}
              </p>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* Card 2: Career Verdict & Immediate Next Step Banner                   */}
          {/* ===================================================================== */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 space-y-6">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-indigo-400" />
              Strategic Career Verdict
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Key Candidate Strengths
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {matchResult.career_verdict?.strengths?.map((str, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Biggest Gaps */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" /> Primary Skill Gaps to Address
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {matchResult.career_verdict?.biggest_gaps?.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold shrink-0">✕</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Most Important Next Step Highlight */}
            {matchResult.career_verdict?.next_step && (
              <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-start gap-3">
                <Compass className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Most Important Next Step
                  </h5>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {matchResult.career_verdict.next_step}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* Card 3: Skills Alignment Matrix (Matched / Partial / Missing)          */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Skills Alignment Matrix
                </h3>
                <p className="text-xs text-gray-500">
                  Detailed verification comparing requirements against actual resume evidence.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setActiveSkillTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeSkillTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveSkillTab('matched')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeSkillTab === 'matched' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Matched ({matchResult.matched_skills?.length || 0})
                </button>
                <button
                  onClick={() => setActiveSkillTab('partial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeSkillTab === 'partial' ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Partial ({matchResult.partially_matched_skills?.length || 0})
                </button>
                <button
                  onClick={() => setActiveSkillTab('missing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeSkillTab === 'missing' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Missing ({matchResult.missing_skills?.length || 0})
                </button>
              </div>
            </div>

            {/* Matched Skills Grid */}
            {(activeSkillTab === 'all' || activeSkillTab === 'matched') && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified Matched Skills ({matchResult.matched_skills?.length || 0})
                </h4>
                {matchResult.matched_skills && matchResult.matched_skills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchResult.matched_skills.map((item, idx) => {
                      const skillName = typeof item === 'string' ? item : item.skill;
                      const type = item.type || 'Required';
                      const evidence = item.evidence || 'Demonstrated in resume experience.';
                      const relevance = item.relevance || 'Direct match for role requirement.';

                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-sm">{skillName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              type === 'Required' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {type}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                            <span className="text-gray-500 font-normal">Evidence: </span>{evidence}
                          </p>
                          {relevance && (
                            <p className="text-[11px] text-gray-600 italic">
                              {relevance}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No fully matched skills identified.</p>
                )}
              </div>
            )}

            {/* Partially Matched Skills Grid */}
            {(activeSkillTab === 'all' || activeSkillTab === 'partial') && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Partially Matched Skills ({matchResult.partially_matched_skills?.length || 0})
                </h4>
                {matchResult.partially_matched_skills && matchResult.partially_matched_skills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchResult.partially_matched_skills.map((item, idx) => {
                      const skillName = typeof item === 'string' ? item : item.skill;
                      const candidateHas = item.candidate_has || 'Basic foundational exposure';
                      const jobRequires = item.job_requires || 'Production-level depth';
                      const gap = item.gap_explanation || 'Lacks advanced production depth.';

                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-sm">{skillName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                              Partial
                            </span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <p className="text-gray-700">
                              <span className="font-semibold text-gray-900">You have:</span> {candidateHas}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold text-gray-900">Job requires:</span> {jobRequires}
                            </p>
                            <p className="text-amber-800 font-medium pt-1 border-t border-amber-100/60">
                              <span className="font-semibold">Gap:</span> {gap}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No partial skill matches.</p>
                )}
              </div>
            )}

            {/* Missing Skills Grid with Priority */}
            {(activeSkillTab === 'all' || activeSkillTab === 'missing') && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Missing Skills & Requirements ({matchResult.missing_skills?.length || 0})
                </h4>
                {matchResult.missing_skills && matchResult.missing_skills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchResult.missing_skills.map((item, idx) => {
                      const skillName = typeof item === 'string' ? item : item.skill;
                      const priority = item.priority || 'High';
                      const type = item.type || 'Required';
                      const reason = item.reason || 'Not found in resume.';
                      const impact = item.impact || 'Limits candidate competitiveness.';

                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-sm">{skillName}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(priority)}`}>
                                {priority}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                                {type}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-rose-900 leading-relaxed">
                            <span className="font-semibold text-rose-950">Status: </span>
                            {reason}
                          </p>
                          {impact && (
                            <p className="text-[11px] text-gray-600">
                              <span className="font-semibold text-gray-700">Impact: </span>
                              {impact}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    All target skills and requirements are covered!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* Card 4: Top Focus Priorities                                         */}
          {/* ===================================================================== */}
          {matchResult.top_priorities && matchResult.top_priorities.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Top Skills to Focus on First
                  </h3>
                  <p className="text-xs text-gray-500">
                    Highest-leverage areas that will yield the biggest boost in role alignment.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {matchResult.top_priorities.map((item, idx) => {
                  const skill = typeof item === 'string' ? item : item.skill;
                  const priority = item.priority || 'Critical';
                  const whyFirst = item.why_first || 'Primary blocker for candidate screening.';
                  const time = item.estimated_time || '1-2 weeks';

                  return (
                    <div key={idx} className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between space-y-3 relative overflow-hidden">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(priority)}`}>
                            {priority}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-indigo-950">{skill}</h4>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">{whyFirst}</p>
                      </div>

                      <div className="pt-2 border-t border-indigo-100 flex items-center justify-between text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 text-indigo-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" /> {time}
                        </span>
                        <span>Phase 1 Focus</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* Card 5: Step-by-Step Action Plan                                     */}
          {/* ===================================================================== */}
          {matchResult.action_plan && matchResult.action_plan.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Specific Learning & Action Plan
                </h3>
                <p className="text-xs text-gray-500">
                  Targeted, sequential roadmap designed to eliminate identified skill gaps.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {matchResult.action_plan.map((step, idx) => {
                  const stepNum = step.step || idx + 1;
                  const title = step.title || `Action Step ${stepNum}`;
                  const timeline = step.timeline || `Week ${idx + 1}`;
                  const desc = step.description || (typeof step === 'string' ? step : '');
                  const resources = step.resources || '';

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {stepNum}
                        </div>
                        <div className="sm:hidden">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                            {timeline}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-gray-900 text-sm">{title}</h5>
                          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                            {timeline}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">{desc}</p>
                        {resources && (
                          <p className="text-[11px] text-indigo-700 pt-1 font-medium flex items-center gap-1">
                            <span className="text-gray-400 font-normal">Resources:</span> {resources}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* Card 6: Recommended Projects to Close Gaps                           */}
          {/* ===================================================================== */}
          {matchResult.recommended_projects && matchResult.recommended_projects.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-600" />
                  Recommended Projects to Prove Competency
                </h3>
                <p className="text-xs text-gray-500">
                  Practical projects designed to showcase the missing skills directly on your resume.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {matchResult.recommended_projects.map((proj, idx) => {
                  const title = proj.title || (typeof proj === 'string' ? proj : 'Practical Portfolio Project');
                  const desc = proj.description || '';
                  const skills = Array.isArray(proj.skills_demonstrated) ? proj.skills_demonstrated : [];
                  const why = proj.why_it_helps || '';

                  return (
                    <div key={idx} className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                            <Code className="w-4 h-4" />
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">{desc}</p>

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {skills.map((s, si) => (
                              <span key={si} className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-700 text-[10px] font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {why && (
                        <div className="pt-2 border-t border-purple-100 text-[11px] text-purple-900 font-medium">
                          <span className="text-gray-500 font-normal">Why recruiters value this: </span>{why}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* Card 7: Resume Improvement Suggestions                               */}
          {/* ===================================================================== */}
          {matchResult.resume_improvements && matchResult.resume_improvements.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Resume Improvement Suggestions
                </h3>
                <p className="text-xs text-gray-500">
                  Targeted rewrites to highlight relevance and bypass applicant tracking systems (ATS).
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {matchResult.resume_improvements.map((item, idx) => {
                  const section = item.section || 'Experience';
                  const issue = item.issue || (typeof item === 'string' ? item : '');
                  const rec = item.recommendation || '';
                  const exampleBullet = item.example_bullet || '';

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold">
                          {section} Section
                        </span>
                        {exampleBullet && (
                          <button
                            onClick={() => handleCopyBullet(exampleBullet, idx)}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedBulletIdx === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Example Bullet
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {issue && (
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">Identified Issue:</span> {issue}
                        </p>
                      )}

                      {rec && (
                        <p className="text-xs text-indigo-950 font-medium">
                          <span className="font-semibold text-indigo-900">Recommendation:</span> {rec}
                        </p>
                      )}

                      {exampleBullet && (
                        <div className="p-3 rounded-xl bg-white border border-gray-200 font-mono text-xs text-gray-800 leading-relaxed shadow-2xs">
                          <span className="text-indigo-600 font-bold mr-1.5">•</span>
                          {exampleBullet}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* Card 8: Interview Preparation Topics & Questions                     */}
          {/* ===================================================================== */}
          {matchResult.interview_preparation && matchResult.interview_preparation.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  Interview Topics & Questions to Prepare
                </h3>
                <p className="text-xs text-gray-500">
                  Anticipated technical and architectural questions specific to this role and your profile.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {matchResult.interview_preparation.map((prep, idx) => {
                  const topic = prep.topic || (typeof prep === 'string' ? prep : 'Technical Round');
                  const question = prep.sample_question || '';
                  const talkingPoints = prep.talking_points || '';

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase">
                        {topic}
                      </span>
                      {question && (
                        <p className="text-xs font-bold text-gray-900 leading-snug">
                          "{question}"
                        </p>
                      )}
                      {talkingPoints && (
                        <p className="text-xs text-indigo-900 font-medium pt-1 border-t border-indigo-100 font-sans">
                          <span className="text-gray-500 font-normal">Key Talking Points: </span>
                          {talkingPoints}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
