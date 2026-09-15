import React, { useState } from 'react';
import { 
  Target, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Brain, 
  Users, Briefcase, ChevronRight, RefreshCw, FileText, Zap, ShieldAlert, BookOpen
} from 'lucide-react';
import { evaluateResumeJobMatch } from '../lib/ai';

// Sample presets for quick testing
const SAMPLE_RESUME = `Aadarsh Kumar
Senior Full-Stack & Machine Learning Engineer
Email: aadarsh@example.com | GitHub: github.com/aadarsh

PROFILE
Dynamic Software Engineer with 4+ years of experience crafting high-throughput web applications and AI agents. Specialist in Python, React, PyTorch, Node.js, and PostgreSQL.

TECHNICAL SKILLS
- Programming Languages: Python, JavaScript, TypeScript, SQL, C++
- AI / ML Frameworks: PyTorch, TensorFlow, Hugging Face Transformers, LangChain, Scikit-learn
- Web & Backend: React.js, FastAPI, Node.js, Express, Tailwind CSS, REST & GraphQL APIs
- Databases & Cloud: PostgreSQL, Supabase, Redis, AWS (S3, EC2), Docker, Git

EXPERIENCE
Software Engineer | Tech Corp (2022 - Present)
- Architected REST microservices in Python & FastAPI serving 500k daily requests.
- Trained custom transformer models using PyTorch for automated document categorization.
- Developed real-time collaborative frontend dashboards using React and WebSockets.
`;

const SAMPLE_JOB = `Senior AI Solutions Architect & Backend Engineer
Company: Apex AI Labs
Location: Remote / San Francisco

JOB SUMMARY:
Apex AI Labs is seeking a Senior AI Backend Engineer to architect next-generation agentic workflows and LLM deployment pipelines.

KEY RESPONSIBILITIES:
- Design and deploy scalable cloud microservices for deep learning models.
- Implement robust database pipelines using relational databases and vector search.
- Collaborate with frontend teams to deliver seamless web interfaces.

REQUIREMENTS & SKILLS:
- 3+ years experience building backend microservices (Python/FastAPI or Node.js).
- Strong foundation in Deep Learning Frameworks (PyTorch or JAX).
- Experience with Cloud Infrastructure (AWS or GCP) and Docker containerization.
- Deep expertise in Relational Database design (PostgreSQL/SQL).
- Familiarity with Modern Frontend Web UI (React or Vue.js).

NICE TO HAVE:
- Experience with Vector Databases (Pinecone/Milvus) and Kubernetes orchestrations.
`;

export default function JobMatcher({ resumeText: savedResumeText }) {
  // Pairwise State for Job Seeker
  const [resumeText, setResumeText] = useState(savedResumeText || SAMPLE_RESUME);
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB);
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRunPairwiseMatch = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setErrorMessage('Please provide both a resume and a job description.');
      return;
    }

    setErrorMessage('');
    setAnalyzing(true);
    setMatchResult(null);

    try {
      const result = await evaluateResumeJobMatch(resumeText, jobDescription);
      setMatchResult(result);
    } catch (err) {
      console.error("Pairwise match error:", err);
      setErrorMessage("Failed to generate match evaluation. Please check your Groq API key or try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Semantic Skill Intelligence
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Resume-to-Job Matching Agent
            </h1>
            <p className="mt-2 text-indigo-200 max-w-2xl text-sm sm:text-base">
              Beyond simple keyword matching — analyze semantic skill relationships, extract core competencies, score suitability, and explain candidate alignment using Groq AI.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setResumeText(SAMPLE_RESUME);
                setJobDescription(SAMPLE_JOB);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/10 transition flex items-center gap-2 backdrop-blur-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Load Preset Samples
            </button>
          </div>
        </div>
      </div>

      {/* ERROR MSG */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PAIRWISE JOB SEEKER MATCHING */}
      <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidate Resume Input */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Candidate Resume Profile
                </label>
                <span className="text-xs text-gray-500 font-medium">Text / Markdown</span>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste candidate resume text here..."
                rows={12}
                className="w-full p-4 rounded-xl bg-slate-50 border border-gray-200 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-y"
              />
            </div>

            {/* Job Description Input */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Target Job Description
                </label>
                <span className="text-xs text-gray-500 font-medium">Role & Requirements</span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste target job description here..."
                rows={12}
                className="w-full p-4 rounded-xl bg-slate-50 border border-gray-200 font-mono text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-y"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={handleRunPairwiseMatch}
              disabled={analyzing}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition flex items-center gap-3 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing Semantic Relationships & Match...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Evaluate Candidate Suitability & Skill Match
                </>
              )}
            </button>
          </div>

          {/* MATCH RESULTS DASHBOARD */}
          {matchResult && (
            <div className="space-y-8 animate-fadeIn">
              {/* Score Breakdown Bar */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {/* Overall Match */}
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col items-center">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Overall Suitability</span>
                  <div className="text-4xl font-extrabold text-indigo-900">{matchResult.overallMatchScore || 0}%</div>
                  <div className="w-full bg-indigo-200 rounded-full h-2 mt-3 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${matchResult.overallMatchScore || 0}%` }}></div>
                  </div>
                </div>

                {/* Skill Match */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center">
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Skill Match</span>
                  <div className="text-4xl font-extrabold text-emerald-900">{matchResult.skillMatchScore || 0}%</div>
                  <div className="w-full bg-emerald-200 rounded-full h-2 mt-3 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${matchResult.skillMatchScore || 0}%` }}></div>
                  </div>
                </div>

                {/* Experience Match */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col items-center">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Experience Fit</span>
                  <div className="text-4xl font-extrabold text-blue-900">{matchResult.experienceMatchScore || 0}%</div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-3 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${matchResult.experienceMatchScore || 0}%` }}></div>
                  </div>
                </div>

                {/* Domain Alignment */}
                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col items-center">
                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Domain Fit</span>
                  <div className="text-4xl font-extrabold text-purple-900">{matchResult.domainMatchScore || 0}%</div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-3 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${matchResult.domainMatchScore || 0}%` }}></div>
                  </div>
                </div>
              </div>

              {/* RATIONALE EXPLANATION CARD */}
              {matchResult.scoreExplanation && (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-3">
                  <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" />
                    AI Recruiter Compatibility Rationale
                  </h3>
                  <p className="text-slate-200 text-sm leading-relaxed font-sans">
                    {matchResult.scoreExplanation}
                  </p>
                </div>
              )}

              {/* SEMANTIC SKILL MATCHING BREAKDOWN */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Semantic Skill Matching Engine
                  </h3>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    Recognizes non-identical terminology
                  </span>
                </div>

                {/* Semantic Match Cards */}
                {matchResult.semanticSkillMatches && matchResult.semanticSkillMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchResult.semanticSkillMatches.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold">
                            {item.candidateSkill}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-bold">
                            {item.jobSkill}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-100 flex items-center justify-between">
                          <span>{item.relationship}</span>
                          <span className="font-semibold text-emerald-600">{item.confidenceScore}% confidence</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No complex semantic mappings detected; direct matches relied upon.</p>
                )}

                {/* Direct Skill Matches */}
                {matchResult.directSkillMatches && matchResult.directSkillMatches.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Direct Skill Overlaps</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.directSkillMatches.map((skill, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* MISSING SKILL IDENTIFICATION & IMPACT */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  Missing Skill Identification & Impact
                </h3>

                {matchResult.missingRequiredSkills && matchResult.missingRequiredSkills.length > 0 ? (
                  <div className="space-y-3">
                    {matchResult.missingRequiredSkills.map((gap, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-900 text-sm">{gap.skill}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              gap.impactLevel === 'High' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                            }`}>
                              {gap.impactLevel} Impact
                            </span>
                          </div>
                          <p className="text-xs text-rose-700">{gap.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    All required skills are covered!
                  </div>
                )}

                {/* Preferred missing skills */}
                {matchResult.missingPreferredSkills && matchResult.missingPreferredSkills.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Missing Nice-to-Have Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.missingPreferredSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIONABLE ADVICE */}
              {matchResult.actionableAdvice && matchResult.actionableAdvice.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-3">
                  <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Actionable Steps to Reach 100% Suitability
                  </h4>
                  <ul className="space-y-2 text-xs text-indigo-800">
                    {matchResult.actionableAdvice.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-indigo-600">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
